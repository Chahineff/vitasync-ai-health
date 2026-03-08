

# Fix: "Erreur réseau: Failed to fetch"

## Root Cause

The edge function boots successfully but **times out during the AI gateway call**. The logs confirm this: only "booted" appears, no request-level logs (like "Authenticated user:" or "System prompt length:"). This means the function crashes or times out before completing.

The system prompt is still ~30-50K characters. Combined with `max_tokens: 20000`, the AI gateway either:
- Times out trying to process such a large context
- Exceeds the model's context window
- Gets killed by Deno's wall-time limit (150s for edge functions)

## Fixes (2 files)

### 1. `supabase/functions/ai-coach/index.ts`

**A. Reduce max_tokens to 8192** — 20K is excessive. Responses rarely exceed 2K tokens. 8192 gives plenty of room without overwhelming the gateway.

**B. Trim the base system prompt aggressively** (~60% reduction):
- Remove the redundant example blocks (CORRECT/INCORRECT examples, ASCII boxes)
- Condense the 6 playbooks into a compact bullet list (keep the rules, remove verbose explanations)
- Remove the subscription playbook's verbose format examples (keep just the format template)
- Remove the duplicate formatting instructions (they say the same thing 3 times)

**C. Truncate conversation history to last 20 messages** — Long conversations bloat the payload. Trim older messages before sending to the gateway.

**D. Add a fetch timeout (60 seconds)** using `AbortController` on the gateway call so the edge function returns a proper error instead of hanging until Deno kills it.

**E. Add early logging** — Move `console.log("Request received")` to right after auth, before any async work, to confirm requests are reaching the function.

### 2. `src/components/dashboard/ChatInterface.tsx`

**A. Trim messages sent to backend** — Only send the last 20 messages in the `body.messages` array instead of the full conversation history.

**B. Improve error message for network failures** — Show "Le coach est temporairement indisponible. Réessaie dans 30 secondes." instead of the raw "Failed to fetch" error.

## Key constraint respected
All products remain available — the catalog format stays compact pipe-separated. The enriched product data stays. Only the instructional text (playbooks, examples, formatting rules) gets compressed.

