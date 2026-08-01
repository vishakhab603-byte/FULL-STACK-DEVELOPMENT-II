function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAsJSON(data, filename = "quill-export.json") {
  download(filename, JSON.stringify(data, null, 2), "application/json");
}

export function exportAsCSV(rows, filename = "quill-export.csv") {
  if (!rows.length) {
    download(filename, "", "text/csv");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  download(filename, lines.join("\n"), "text/csv");
}
