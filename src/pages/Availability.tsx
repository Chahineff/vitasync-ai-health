import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email")
  .max(255);

export default function Availability() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setSubmitting(true);
    try {
      const region =
        (typeof Intl !== "undefined" &&
          Intl.DateTimeFormat().resolvedOptions().timeZone) ||
        null;

      const { error } = await supabase
        .from("waitlist")
        .insert({ email: parsed.data, region });

      if (error && !/duplicate|unique/i.test(error.message)) {
        throw error;
      }
      setDone(true);
      toast.success("You're on the list. We'll reach out when we ship to your region.");
    } catch (err) {
      console.error("[waitlist] insert failed", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="max-w-lg w-full rounded-3xl border border-border bg-card p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-semibold text-foreground mb-3 tracking-tight">
          VitaSync availability
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          VitaSync currently ships supplements to the United States only (48
          contiguous states, via our fulfillment partner). We're working on
          expanding internationally — join the waitlist and we'll email you
          as soon as VitaSync is available in your region.
        </p>

        {done ? (
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-foreground">
            Thanks — you're on the waitlist. We'll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={255}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting ? "Joining…" : "Join the waitlist"}
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/" className="underline hover:text-foreground transition">
            Back to home
          </Link>
          <a
            href="mailto:contact@vitasync.ai"
            className="underline hover:text-foreground transition"
          >
            Contact us
          </a>
        </div>
      </div>
    </main>
  );
}