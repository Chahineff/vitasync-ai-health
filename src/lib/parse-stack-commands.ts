import { AIStackItem } from '@/stores/aiStackStore';

/**
 * Parse [[STACK_ADD:productId:variantId:name:price:qty]] commands from AI responses
 * and [[STACK_REMOVE:productId]] and [[STACK_CLEAR]]
 */

export interface StackCommand {
  type: 'add' | 'remove' | 'clear' | 'update';
  item?: Omit<AIStackItem, 'imageUrl'>;
  productId?: string;
  quantity?: number;
}

export function parseStackCommands(content: string): { cleanContent: string; commands: StackCommand[] } {
  const commands: StackCommand[] = [];
  
  let cleanContent = content;
  
  // Parse [[STACK_ADD:productId:variantId:name:price:qty]]
  const addRegex = /\[\[STACK_ADD:([^:]+):([^:]+):([^:]+):([^:]+):(\d+)\]\]/g;
  let match;
  while ((match = addRegex.exec(content)) !== null) {
    commands.push({
      type: 'add',
      item: {
        productId: match[1],
        variantId: match[2],
        name: match[3],
        price: match[4],
        quantity: parseInt(match[5], 10),
      },
    });
  }
  cleanContent = cleanContent.replace(addRegex, '');

  // Parse [[STACK_REMOVE:productId]]
  const removeRegex = /\[\[STACK_REMOVE:([^\]]+)\]\]/g;
  while ((match = removeRegex.exec(content)) !== null) {
    commands.push({ type: 'remove', productId: match[1] });
  }
  cleanContent = cleanContent.replace(removeRegex, '');

  // Parse [[STACK_UPDATE:productId:qty]]
  const updateRegex = /\[\[STACK_UPDATE:([^:]+):(\d+)\]\]/g;
  while ((match = updateRegex.exec(content)) !== null) {
    commands.push({ type: 'update', productId: match[1], quantity: parseInt(match[2], 10) });
  }
  cleanContent = cleanContent.replace(updateRegex, '');

  // Parse [[STACK_CLEAR]]
  if (content.includes('[[STACK_CLEAR]]')) {
    commands.push({ type: 'clear' });
  }
  cleanContent = cleanContent.replace(/\[\[STACK_CLEAR\]\]/g, '');

  return { cleanContent: cleanContent.trim(), commands };
}

/**
 * Parse [[TRACKING_ADD:name|dosage|time_of_day|shopify_product_id?]] proposals.
 * Multiple consecutive TRACKING_ADD tokens are grouped into a single proposal
 * rendered by <TrackingProposalCard/>. The coach MUST NOT claim a row was
 * persisted — only the card's verified write may do that.
 */
export interface TrackingProposalItem {
  name: string;
  dosage?: string;
  time_of_day?: string;
  shopify_product_id?: string;
}

export function parseTrackingProposals(content: string): {
  cleanContent: string;
  proposals: TrackingProposalItem[];
} {
  const proposals: TrackingProposalItem[] = [];
  const re = /\[\[TRACKING_ADD:([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const parts = match[1].split('|').map((s) => s.trim());
    const [name, dosage, time_of_day, shopify_product_id] = parts;
    if (!name) continue;
    proposals.push({
      name,
      dosage: dosage || undefined,
      time_of_day: time_of_day || 'morning',
      shopify_product_id: shopify_product_id || undefined,
    });
  }
  const cleanContent = content.replace(re, '').trim();
  return { cleanContent, proposals };
}
