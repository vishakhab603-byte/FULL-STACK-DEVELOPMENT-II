import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearch, setFilterPlatform, setFilterTag, selectAll, clearSelection } from "../../store/slices/draftsSlice";
import { PLATFORM_LIST } from "../../utils/platformRules";
import DraftCard from "./DraftCard";
import BulkActionsBar from "./BulkActionsBar";

export default function DraftList() {
  const dispatch = useDispatch();
  const { items, search, filterPlatform, filterTag, selectedIds } = useSelector((s) => s.drafts);

  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach((d) => d.tags.forEach((t) => set.add(t)));
    return [...set];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((d) => {
      if (search && !d.text.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPlatform !== "all" && !d.platformIds.includes(filterPlatform)) return false;
      if (filterTag !== "all" && !d.tags.includes(filterTag)) return false;
      return true;
    });
  }, [items, search, filterPlatform, filterTag]);

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🗂️</p>
        <h3 style={{ fontSize: 18, marginBottom: 6 }}>No drafts yet</h3>
        <p className="text-faint" style={{ fontSize: 14 }}>
          Anything you save from the composer — or auto-saved with ⌘/Ctrl+S — shows up here.
        </p>
      </div>
    );
  }

  const allSelected = filtered.length > 0 && filtered.every((d) => selectedIds.includes(d.id));

  return (
    <div className="flex-col gap-16">
      <div className="flex items-center gap-12" style={{ flexWrap: "wrap" }}>
        <input
          className="field-input"
          placeholder="Search drafts…"
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
          style={{ maxWidth: 240 }}
        />
        <select
          className="field-input"
          style={{ width: "auto" }}
          value={filterPlatform}
          onChange={(e) => dispatch(setFilterPlatform(e.target.value))}
        >
          <option value="all">All platforms</option>
          {PLATFORM_LIST.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {allTags.length > 0 && (
          <select
            className="field-input"
            style={{ width: "auto" }}
            value={filterTag}
            onChange={(e) => dispatch(setFilterTag(e.target.value))}
          >
            <option value="all">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-8" style={{ marginLeft: "auto", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => dispatch(allSelected ? clearSelection() : selectAll(filtered.map((d) => d.id)))}
          />
          Select all ({filtered.length})
        </label>
      </div>

      <BulkActionsBar selectedIds={selectedIds} />

      {filtered.length === 0 ? (
        <p className="text-faint" style={{ fontSize: 14 }}>No drafts match those filters.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((d) => (
            <DraftCard key={d.id} draft={d} selected={selectedIds.includes(d.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
