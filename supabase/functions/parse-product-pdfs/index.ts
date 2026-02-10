import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "vitasyncdata";
const FOLDER = "VitaSync_Product_Data";

const EXTRACTION_PROMPT = `You are a product data extraction specialist. Analyze this PDF document about a health/supplement product and extract ALL information into the following JSON structure.

IMPORTANT: 
- Extract REAL data from the PDF. Do not invent information.
- For shopify_product_title, extract the main product name as it would appear in a store (e.g. "Ashwagandha", "Omega-3 Fish Oil", "Vitamin D3"). Remove any file naming artifacts.
- For sources, include real study references found in the PDF with actual URLs when available.
- All text should be in English.

Return ONLY valid JSON with this exact structure:
{
  "shopify_product_title": "string - the product name for matching with Shopify catalog",
  "summary": "string - 2-3 sentence summary of what this product is and its primary purpose",
  "key_benefits": [
    { "title": "string", "description": "string - 1-2 sentences", "icon_hint": "string - one of: heart, brain, shield, lightning, moon, leaf, flame, drop, bone, eye, muscle, gut" }
  ],
  "ingredients_detailed": [
    { "name": "string", "dosage": "string e.g. '500mg'", "role": "string - what it does", "source": "string - where it's derived from, if mentioned" }
  ],
  "suggested_use": {
    "dosage": "string e.g. '1 capsule daily'",
    "timing": "string e.g. 'morning' or 'with breakfast'",
    "with_food": true,
    "notes": "string - any additional usage notes"
  },
  "science_data": {
    "tldr": "string - one paragraph summary of the science",
    "study_bullets": ["string - key finding from a study"],
    "sources": [{ "title": "string - study/article title", "url": "string - URL if available, empty string if not", "year": "string" }]
  },
  "safety_warnings": {
    "contraindications": ["string"],
    "interactions": ["string - drug/supplement interactions"],
    "pregnancy_safe": false,
    "allergens": ["string"]
  },
  "best_for_tags": ["string - e.g. 'Athletes', 'Stress Relief', 'Sleep Support'"],
  "quality_info": {
    "certifications": ["string - e.g. 'GMP Certified', 'Third-Party Tested'"],
    "manufacturing": "string - manufacturing details if mentioned",
    "testing": "string - testing protocols if mentioned"
  },
  "faq": [
    { "question": "string", "answer": "string" }
  ],
  "coach_tip": "string - a personalized wellness tip about this supplement, written as if from an AI health coach"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Accept batch_size param (default 8 to stay within timeout)
    let batchSize = 8;
    try {
      const body = await req.json();
      if (body.batch_size) batchSize = Math.min(body.batch_size, 15);
    } catch { /* no body is fine */ }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get already-processed filenames
    const { data: existing } = await supabase
      .from("product_enriched_data")
      .select("pdf_filename");
    const processedFiles = new Set((existing || []).map(e => e.pdf_filename));

    // List all PDFs in the folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(FOLDER, { limit: 200 });

    if (listError) throw new Error(`Failed to list files: ${listError.message}`);

    const allPdfFiles = (files || []).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );

    // Filter out already-processed
    const pdfFiles = allPdfFiles.filter(f => !processedFiles.has(f.name));

    console.log(`Found ${allPdfFiles.length} total PDFs, ${pdfFiles.length} remaining, processing batch of ${batchSize}`);

    const batch = pdfFiles.slice(0, batchSize);
    const results: Array<{ file: string; status: string; title?: string; error?: string }> = [];

    for (const file of batch) {
      const filePath = `${FOLDER}/${file.name}`;
      console.log(`Processing: ${filePath}`);

      try {
        // Download the PDF
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(BUCKET)
          .download(filePath);

        if (downloadError || !fileData) {
          results.push({ file: file.name, status: "error", error: `Download failed: ${downloadError?.message}` });
          continue;
        }

        // Convert to base64
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        // Send to Gemini for extraction
        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: EXTRACTION_PROMPT },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:application/pdf;base64,${base64}`,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for ${file.name}: ${aiResponse.status} ${errText}`);
          
          if (aiResponse.status === 429) {
            // Rate limited - wait and retry once
            console.log("Rate limited, waiting 30s...");
            await new Promise((r) => setTimeout(r, 30000));
            results.push({ file: file.name, status: "skipped", error: "Rate limited, retry later" });
            continue;
          }
          
          results.push({ file: file.name, status: "error", error: `AI error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (!content) {
          results.push({ file: file.name, status: "error", error: "No AI response content" });
          continue;
        }

        // Parse JSON from AI response (may be wrapped in ```json blocks)
        let extracted;
        try {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                           content.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : content;
          extracted = JSON.parse(jsonStr.trim());
        } catch (parseErr) {
          console.error(`JSON parse error for ${file.name}:`, parseErr);
          results.push({ file: file.name, status: "error", error: "Failed to parse AI JSON response" });
          continue;
        }

        // Upsert into database
        const { error: upsertError } = await supabase
          .from("product_enriched_data")
          .upsert(
            {
              shopify_product_title: extracted.shopify_product_title,
              pdf_filename: file.name,
              summary: extracted.summary,
              key_benefits: extracted.key_benefits,
              ingredients_detailed: extracted.ingredients_detailed,
              suggested_use: extracted.suggested_use,
              science_data: extracted.science_data,
              safety_warnings: extracted.safety_warnings,
              best_for_tags: extracted.best_for_tags,
              quality_info: extracted.quality_info,
              faq: extracted.faq,
              coach_tip: extracted.coach_tip,
            },
            { onConflict: "shopify_product_title" }
          );

        if (upsertError) {
          results.push({ file: file.name, status: "error", error: `DB upsert failed: ${upsertError.message}` });
        } else {
          results.push({ file: file.name, status: "success", title: extracted.shopify_product_title });
          console.log(`✅ Processed: ${extracted.shopify_product_title}`);
        }

        // Small delay between requests to avoid rate limiting
        await new Promise((r) => setTimeout(r, 2000));
      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError);
        results.push({ file: file.name, status: "error", error: String(fileError) });
      }
    }

    const remaining = pdfFiles.length - batch.length;
    return new Response(
      JSON.stringify({ processed: results.length, remaining, total: allPdfFiles.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-product-pdfs error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
