import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Pill, Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { TrackingProposalItem } from '@/lib/parse-stack-commands';

type Status = 'idle' | 'writing' | 'confirmed' | 'cancelled' | 'failed';

/**
 * Renders the coach's "Do you want me to add these to your tracking?"
 * proposal. The DB write only happens on user confirmation, and we
 * re-fetch every inserted row to verify persistence. On any failure
 * we roll back inserted rows so the UI never claims a write that
 * didn't survive the round-trip.
 */
export function TrackingProposalCard({ items }: { items: TrackingProposalItem[] }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user) {
      setError('You must be signed in.');
      setStatus('failed');
      toast.error('You must be signed in to add supplements to tracking.');
      return;
    }
    setStatus('writing');
    setError(null);

    const insertedIds: string[] = [];
    try {
      for (const item of items) {
        const { data, error: insertErr } = await supabase
          .from('supplement_tracking')
          .insert({
            user_id: user.id,
            product_name: item.name,
            dosage: item.dosage ?? null,
            time_of_day: item.time_of_day ?? 'morning',
            shopify_product_id: item.shopify_product_id ?? null,
            recommended_by_ai: true,
            active: true,
          })
          .select('id')
          .single();

        if (insertErr || !data?.id) {
          throw insertErr ?? new Error('Insert returned no row');
        }
        insertedIds.push(data.id);

        // Verified read-back: confirm the row is actually persisted.
        const { data: verify, error: verifyErr } = await supabase
          .from('supplement_tracking')
          .select('id')
          .eq('id', data.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (verifyErr || !verify) {
          throw verifyErr ?? new Error('Row not found after insert');
        }
      }

      setStatus('confirmed');
      toast.success(`Added ${items.length} supplement${items.length > 1 ? 's' : ''} to your tracking.`);
      // Let other tabs (Supplement Tracker) re-read.
      window.dispatchEvent(new CustomEvent('supplement-tracking-changed'));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error('TrackingProposalCard: write failed, rolling back', e);
      // Roll back any rows we did insert so the UI matches the DB.
      if (insertedIds.length > 0) {
        await supabase
          .from('supplement_tracking')
          .delete()
          .in('id', insertedIds)
          .eq('user_id', user.id);
      }
      setError(message);
      setStatus('failed');
      toast.error("Couldn't add to tracking. Nothing was saved.");
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-4 my-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <Pill weight="fill" className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">
          {status === 'confirmed'
            ? 'Added to your tracking'
            : status === 'cancelled'
              ? 'Cancelled — nothing was added'
              : status === 'failed'
                ? "Couldn't add to tracking"
                : 'Add these to your tracking?'}
        </p>
      </div>

      <ul className="space-y-1.5 mb-3">
        {items.map((it, i) => (
          <li key={i} className="text-xs text-foreground/80 flex items-baseline gap-2">
            <span className="text-primary">•</span>
            <span className="font-medium">{it.name}</span>
            {it.dosage && <span className="text-foreground/60">— {it.dosage}</span>}
            {it.time_of_day && <span className="text-foreground/40">({it.time_of_day})</span>}
          </li>
        ))}
      </ul>

      {status === 'idle' && (
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <CheckCircle weight="fill" className="w-3.5 h-3.5" />
            Yes, add to my tracking
          </button>
          <button
            onClick={handleCancel}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted/40 text-foreground/70 text-xs font-medium hover:bg-muted/60 transition-colors"
          >
            <XCircle weight="regular" className="w-3.5 h-3.5" />
            Not now
          </button>
        </div>
      )}

      {status === 'writing' && (
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <Spinner className="w-3.5 h-3.5 animate-spin" />
          Saving and verifying…
        </div>
      )}

      {status === 'confirmed' && (
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <CheckCircle weight="fill" className="w-3.5 h-3.5" />
          Saved and verified in your tracking.
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-2">
          <p className="text-xs text-destructive">
            {error ?? 'The save did not persist.'} Nothing was added.
          </p>
          <button
            onClick={handleConfirm}
            className="text-xs px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    </motion.div>
  );
}