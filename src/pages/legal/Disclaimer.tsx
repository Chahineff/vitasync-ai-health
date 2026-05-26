import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Health & AI Disclaimer"
      subtitle="Important notices about VitaSync, its AI features, and dietary supplements — United States"
      date="June 1, 2026"
    >
      <h2>1. Not a Medical Service</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground font-medium">
          VitaSync is a wellness and lifestyle information platform. The information and recommendations it provides are NOT medical advice, diagnosis, or treatment, and VitaSync is NOT a medical device under the U.S. Federal Food, Drug, and Cosmetic Act. Always consult a qualified healthcare professional before making any decision about your health or diet.
        </p>
      </div>

      <h2>2. AI Transparency</h2>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          You are interacting with an artificial-intelligence system (powered by Google Gemini), not a human healthcare professional. All responses are AI-generated and are general wellness information, not prescriptions.
        </p>
      </div>

      <h2>3. Blood-Test Information</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          Any AI commentary on blood-test values you enter is for educational purposes only. It is NOT a clinical interpretation, diagnosis, or medical evaluation. Only a licensed healthcare professional can correctly interpret your results in the context of your full medical history. If any value appears abnormal, consult your doctor promptly. Never delay seeking medical care based on information provided by VitaSync.
        </p>
      </div>

      <h2>4. Supplement Interactions</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          Supplements can interact with prescription and over-the-counter medications and may not be appropriate for everyone. VitaSync's AI coach does not evaluate drug-supplement interactions. If you take any medication, you must consult a qualified pharmacist or physician before starting any supplement regimen recommended by VitaSync.
        </p>
      </div>

      <h2>5. Age Restriction</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          VitaSync is intended for users aged 18 and older. The information and recommendations provided by VitaSync are not appropriate for minors. If you are under 18, please consult a healthcare professional before using any supplement.
        </p>
      </div>

      <h2>6. FDA / DSHEA Notice (21 CFR 101.93)</h2>
      <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4">
        <p className="text-foreground font-medium">
          These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>

      <h2>7. Results May Vary</h2>
      <p>Dietary supplements do not replace a balanced diet and a healthy lifestyle. Individual results may vary. Do not exceed the recommended daily dose. Keep out of reach of children.</p>
    </LegalPageLayout>
  );
}
