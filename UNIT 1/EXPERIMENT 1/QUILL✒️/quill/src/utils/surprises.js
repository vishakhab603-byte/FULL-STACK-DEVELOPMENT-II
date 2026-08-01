// Intentionally undocumented outside this file. Something occasionally
// happens when you publish. That's all this comment is going to say about it.

const FLAVOR = [
  "🌟 Something's different about this one.",
  "🪶 The quill catches the light just right.",
  "✨ Rare. Savor it.",
  "🎆 The Muse doesn't do this often.",
];

export function rollForSomethingRare() {
  return Math.random() < 1 / 37 ? FLAVOR[Math.floor(Math.random() * FLAVOR.length)] : null;
}
