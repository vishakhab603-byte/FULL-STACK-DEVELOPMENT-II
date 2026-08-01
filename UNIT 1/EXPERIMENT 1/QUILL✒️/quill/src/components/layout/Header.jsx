import React from "react";
import { useSelector } from "react-redux";

const COPY = {
  compose: {
    title: "What's on your mind?",
    sub: "Write once, the Muse will help it land right everywhere you post it.",
  },
  drafts: {
    title: "Your drafts",
    sub: "Unfinished thoughts, safely kept. Nothing here is judging you for the em dashes.",
  },
  schedule: {
    title: "The queue",
    sub: "Everything waiting for its moment, in order of when it happens.",
  },
  published: {
    title: "Published",
    sub: "Everything that's gone out, with a scoreboard and a few badges to show for it.",
  },
  analytics: {
    title: "How it's landing",
    sub: "A rolling two-week look at engagement, plus your drafting streak.",
  },
  settings: {
    title: "Settings",
    sub: "Sound, celebration, and a way to start over completely.",
  },
};

export default function Header() {
  const view = useSelector((s) => s.ui.view);
  const copy = COPY[view] ?? COPY.compose;

  return (
    <header style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 30, fontWeight: 600 }}>{copy.title}</h2>
      <p className="text-soft" style={{ marginTop: 6, fontSize: 15 }}>
        {copy.sub}
      </p>
    </header>
  );
}
