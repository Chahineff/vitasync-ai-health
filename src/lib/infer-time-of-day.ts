/**
 * Infer the best time of day for a supplement based on its title and description.
 */
export function inferTimeOfDay(title: string, description?: string): string {
  const text = `${title} ${description || ''}`.toLowerCase();

  // Evening keywords
  const eveningKeywords = ['sleep', 'sommeil', 'melatonin', 'mélatonine', 'relaxation', 'night', 'nuit', '5-htp', 'gaba', 'valerian', 'valériane', 'camomille', 'chamomile', 'magnesium glycinate'];
  if (eveningKeywords.some(k => text.includes(k))) return 'evening';

  // Noon keywords
  const noonKeywords = ['lunch', 'midi', 'digestion', 'digestif', 'probiotique', 'probiotic', 'enzyme'];
  if (noonKeywords.some(k => text.includes(k))) return 'noon';

  // Morning keywords (explicit)
  const morningKeywords = ['pre-workout', 'pre workout', 'energy', 'énergie', 'caffeine', 'caféine', 'matin', 'morning', 'boost', 'focus', 'nootropic'];
  if (morningKeywords.some(k => text.includes(k))) return 'morning';

  // Default
  return 'morning';
}
