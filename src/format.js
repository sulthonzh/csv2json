"use strict";

function formatJSON(rows, pretty) {
  return JSON.stringify(rows, null, pretty ? 2 : 0);
}

function formatJSONL(rows) {
  return rows.map((r) => JSON.stringify(r)).join("\n");
}

function formatPretty(rows) {
  if (rows.length === 0) return "No data";
  const headers = Object.keys(rows[0]);
  const widths = {};
  headers.forEach((h) => {
    widths[h] = Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? "").length)
    );
  });

  const pad = (s, w) => String(s).padEnd(w);
  const sep = headers.map((h) => "-".repeat(widths[h])).join(" | ");
  const hdr = headers.map((h) => pad(h, widths[h])).join(" | ");

  const body = rows.map((r) =>
    headers.map((h) => pad(r[h] ?? "", widths[h])).join(" | ")
  );

  return [hdr, sep, ...body].join("\n");
}

module.exports = { formatJSON, formatJSONL, formatPretty };
