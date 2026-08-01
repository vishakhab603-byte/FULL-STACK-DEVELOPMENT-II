import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMedia, removeMedia, setMediaAlt } from "../../store/slices/composerSlice";
import { nanoid } from "@reduxjs/toolkit";

export default function MediaUploader() {
  const dispatch = useDispatch();
  const media = useSelector((s) => s.composer.media);
  const inputRef = useRef(null);

  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      dispatch(
        addMedia({
          id: nanoid(),
          name: file.name,
          alt: "",
          previewUrl: URL.createObjectURL(file),
        })
      );
    });
  }

  return (
    <div>
      <div className="flex items-center gap-8">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
          🖼️ Attach media
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {media.length > 0 && (
          <span className="text-faint mono" style={{ fontSize: 12 }}>
            {media.length} attached
          </span>
        )}
      </div>

      {media.length > 0 && (
        <div className="flex-col gap-8" style={{ marginTop: 10 }}>
          {media.map((m) => (
            <div key={m.id} className="card flex items-center gap-12" style={{ padding: 10 }}>
              <img
                src={m.previewUrl}
                alt=""
                style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, background: "var(--paper-dim)" }}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{m.name}</p>
                <input
                  className="field-input"
                  placeholder="Describe this image for screen readers (alt text)"
                  value={m.alt}
                  onChange={(e) => dispatch(setMediaAlt({ id: m.id, alt: e.target.value }))}
                  style={{ fontSize: 12.5, padding: "6px 10px" }}
                />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => dispatch(removeMedia(m.id))}
                aria-label={`Remove ${m.name}`}
              >
                ✕
              </button>
            </div>
          ))}
          {media.some((m) => !m.alt.trim()) && (
            <p className="text-faint" style={{ fontSize: 12 }}>
              💡 Alt text helps screen-reader users and several platforms reward it in reach.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
