/* ==========================================================================
   ACHIEVEMENT DEFINITIONS — pure data. Unlock conditions are checked by
   the listener middleware; this file just describes what the badges are.
   `secret: true` achievements show as "???" in the drawer until unlocked.
   ========================================================================== */

export const ACHIEVEMENTS = [
  {
    id: 'first-synapse',
    title: 'First Synapse',
    description: 'Create your very first post.',
    icon: '🧠'
  },
  {
    id: 'prolific-mind',
    title: 'Prolific Mind',
    description: 'Create 5 posts in a single session.',
    icon: '✍️'
  },
  {
    id: 'going-live',
    title: 'Going Live',
    description: 'Publish your first post.',
    icon: '🚀'
  },
  {
    id: 'star-collector',
    title: 'Star Collector',
    description: 'Favorite 5 different posts.',
    icon: '⭐'
  },
  {
    id: 'pin-perfect',
    title: 'Pin Perfect',
    description: 'Pin a post to the top.',
    icon: '📌'
  },
  {
    id: 'copy-cat',
    title: 'Copy Cat',
    description: 'Duplicate a post.',
    icon: '🧬'
  },
  {
    id: 'shape-shifter',
    title: 'Shape Shifter',
    description: 'Try every visible theme at least once.',
    icon: '🎨'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Use SYNAPSE X after midnight, local time.',
    icon: '🦉'
  },
  {
    id: 'speed-typer',
    title: 'Speed Typer',
    description: 'Open the command palette with Ctrl/Cmd+K.',
    icon: '⌨️'
  },
  {
    id: 'archivist',
    title: 'The Archivist',
    description: 'Archive a post.',
    icon: '🗄️'
  },
  {
    id: 'draft-hoarder',
    title: 'Draft Hoarder',
    description: 'Let the autosave save 10 draft versions.',
    icon: '📚'
  },
  {
    id: 'brain-surgeon',
    title: 'Brain Surgeon',
    description: 'Click the SYNAPSE X logo 7 times in a row.',
    icon: '🔬',
    secret: true
  },
  {
    id: 'red-pill',
    title: 'Follow the White Rabbit',
    description: 'Enter the Konami code.',
    icon: '💊',
    secret: true
  },
  {
    id: 'party-animal',
    title: 'Party Animal',
    description: 'Find party mode in the command palette.',
    icon: '🎉',
    secret: true
  },
  {
    id: 'coffee-break',
    title: 'Coffee Break',
    description: 'Ask the command palette for coffee.',
    icon: '☕',
    secret: true
  },
  {
    id: 'deep-thoughts',
    title: 'Deep Thoughts',
    description: 'Ask the command palette the meaning of life.',
    icon: '🌌',
    secret: true
  }
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
