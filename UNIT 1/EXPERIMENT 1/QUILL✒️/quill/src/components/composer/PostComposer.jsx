import React, { useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setText,
  setTitle,
  resetComposer,
} from "../../store/slices/composerSlice";
import { saveDraft, updateDraft } from "../../store/slices/draftsSlice";
import { publishNow, schedulePost } from "../../store/slices/scheduleSlice";
import { logActivity } from "../../store/slices/analyticsSlice";
import { pushToast, unlockMagicWord } from "../../store/slices/uiSlice";
import { getPlatform } from "../../utils/platformRules";
import { validateAll, isPublishable, effectiveLength } from "../../utils/validators";
import { needsThread } from "../../utils/threadSplitter";
import { fireConfetti, fireLegendaryConfetti } from "../../utils/confetti";
import { playPublishChime } from "../../utils/sound";
import { getMilestoneMessage } from "../../utils/achievements";
import { rollForSomethingRare } from "../../utils/surprises";
import { unlockLegendary } from "../../store/slices/uiSlice";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { roast } from "../../utils/toneRewriter";

import PlatformSelector from "./PlatformSelector";
import CharacterCounter from "./CharacterCounter";
import EmojiPicker from "./EmojiPicker";
import MediaUploader from "./MediaUploader";
import ThreadPreview from "./ThreadPreview";
import SchedulePicker from "./SchedulePicker";
import MuseSuggestions from "./MuseSuggestions";
import DaySpark from "./DaySpark";

export default function PostComposer() {
  const dispatch = useDispatch();
  const { text, title, platformIds, media, scheduledFor, editingDraftId } = useSelector((s) => s.composer);
  const soundEnabled = useSelector((s) => s.ui.soundEnabled);
  const celebrateEnabled = useSelector((s) => s.ui.celebrateEnabled);
  const publishedCount = useSelector((s) => s.schedule.queue.filter((p) => p.status === "published").length);

  const needsTitle = platformIds.some((id) => getPlatform(id)?.requiresTitle);

  const validationMap = useMemo(
    () => validateAll(text, media.length, platformIds, title),
    [text, media, platformIds, title]
  );
  const publishable = isPublishable(validationMap) && platformIds.length > 0;

  const roastPhraseFired = useRef(false);
  useEffect(() => {
    const trimmed = text.trim().toLowerCase();
    if (trimmed === "roast me" && !roastPhraseFired.current) {
      roastPhraseFired.current = true;
      dispatch(pushToast(`🔥 ${roast("a post that just says 'roast me'", platformIds[0])}`, "default"));
    } else if (trimmed !== "roast me") {
      roastPhraseFired.current = false;
    }
  }, [text, dispatch, platformIds]);

  function handleSaveDraft() {
    if (!text.trim() && media.length === 0) {
      dispatch(pushToast("Nothing to save yet.", "error"));
      return;
    }
    if (editingDraftId) {
      dispatch(updateDraft({ id: editingDraftId, text, title, platformIds, media }));
      dispatch(pushToast("Draft updated.", "success"));
    } else {
      dispatch(saveDraft({ text, title, platformIds, media }));
      dispatch(pushToast("Saved as draft.", "success"));
    }
    dispatch(logActivity());
  }

  async function handlePublish() {
    if (!publishable) {
      dispatch(pushToast("Fix the errors before publishing.", "error"));
      return;
    }
    if (scheduledFor) {
      dispatch(schedulePost({ text, title, platformIds, scheduledFor, media }));
      dispatch(pushToast(`Scheduled for ${new Date(scheduledFor).toLocaleString()}.`, "success"));
    } else {
      dispatch(publishNow({ text, title, platformIds, media }));
      dispatch(pushToast("Published! 🎉", "success"));
      if (celebrateEnabled) fireConfetti();
      playPublishChime(soundEnabled);
      const milestone = getMilestoneMessage(publishedCount + 1);
      if (milestone) {
        dispatch(pushToast(milestone, "success"));
        if (celebrateEnabled) fireConfetti(160);
      }
      const rare = rollForSomethingRare();
      if (rare) {
        dispatch(unlockLegendary());
        dispatch(pushToast(rare, "success"));
        if (celebrateEnabled) fireLegendaryConfetti();
      }
      if (/abracadabra/i.test(text)) {
        dispatch(unlockMagicWord());
        dispatch(pushToast("🪄 The magic word works. Every time.", "success"));
        if (celebrateEnabled) fireConfetti(120);
      }
    }
    dispatch(logActivity());
    dispatch(resetComposer());
  }

  useKeyboardShortcuts({ onPublish: handlePublish, onSaveDraft: handleSaveDraft });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
      <div className="flex-col gap-16">
        {editingDraftId && (
          <div className="chip" style={{ alignSelf: "flex-start", background: "var(--sky-soft)", borderColor: "transparent", color: "#1b4c8c" }}>
            ✎ Editing a saved draft
          </div>
        )}

        <PlatformSelector />

        <div className="card composer-card" style={{ padding: 16, position: "relative" }}>
          {needsTitle && (
            <>
              <input
                className="field-input"
                style={{ border: "none", fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 600, padding: "2px 0", marginBottom: 10 }}
                placeholder="Title (Medium / Substack need one)"
                value={title}
                onChange={(e) => dispatch(setTitle(e.target.value))}
              />
              <hr className="divider" style={{ marginBottom: 12 }} />
            </>
          )}
          <textarea
            className="field-textarea"
            style={{ border: "none", minHeight: 160, fontSize: 16, padding: 0, resize: "vertical" }}
            placeholder="Write once — the Muse adapts it per platform..."
            value={text}
            onChange={(e) => dispatch(setText(e.target.value))}
            autoFocus
          />
          <hr className="divider" style={{ margin: "12px 0" }} />
          <div className="flex items-center justify-between">
            <EmojiPicker onSelect={(emoji) => dispatch(setText(text + emoji))} />
            <span className="text-faint mono" style={{ fontSize: 11.5 }}>
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        {platformIds.length > 0 && (
          <div className="card flex-col gap-10" style={{ padding: 16 }}>
            <p className="eyebrow">Fit per platform</p>
            {platformIds.map((id) => (
              <CharacterCounter
                key={id}
                platformId={id}
                length={effectiveLength(text, id)}
                limit={getPlatform(id).charLimit}
                hasError={validationMap[id]?.errors.length > 0}
              />
            ))}
          </div>
        )}

        <MediaUploader />

        {platformIds
          .filter((id) => needsThread(text, id))
          .map((id) => (
            <ThreadPreview key={id} text={text} platformId={id} />
          ))}

        <SchedulePicker />

        <div className="flex items-center gap-12" style={{ marginTop: 4 }}>
          <button
            className="btn btn-primary"
            disabled={!publishable}
            onClick={handlePublish}
            title="⌘/Ctrl + Enter"
          >
            {scheduledFor ? "🗓️ Schedule post" : "🚀 Publish now"}
          </button>
          <button className="btn" onClick={handleSaveDraft} title="⌘/Ctrl + S">
            💾 Save draft
          </button>
          {(text || media.length > 0) && (
            <button className="btn btn-ghost" onClick={() => dispatch(resetComposer())}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-col gap-16">
        <DaySpark />
        {platformIds.length === 0 && (
          <div className="card text-faint" style={{ padding: 16, fontSize: 13 }}>
            Pick a platform above to get the Muse's per-platform notes.
          </div>
        )}
        {platformIds.map((id) => (
          <MuseSuggestions key={id} platformId={id} text={text} mediaCount={media.length} title={title} />
        ))}
      </div>
    </div>
  );
}
