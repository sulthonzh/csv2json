"use strict";

function detectDelimiter(csv) {
  const firstLine = csv.split("\n")[0] || "";
  const counts = { ",": 0, "\t": 0, ";": 0, "|": 0 };
  for (const ch of firstLine) {
    if (ch in counts) counts[ch]++;
  }
  let best = ",", max = 0;
  for (const [d, c] of Object.entries(counts)) {
    if (c > max) { max = c; best = d; }
  }
  return best;
}

function parseCSV(csv, opts = {}) {
  const delimiter = opts.delimiter || ",";
  const hasHeader = opts.hasHeader !== false;
  const lines = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);

  if (nonEmpty.length === 0) return [];

  const rows = nonEmpty.map((line) => parseLine(line, delimiter));

  if (!hasHeader) {
    return rows.map((cells) => {
      const obj = {};
      cells.forEach((c, i) => { obj[`col${i}`] = tryParse(c); });
      return obj;
    });
  }

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = tryParse(cells[i] !== undefined ? cells[i] : "");
    });
    return obj;
  });
}

function parseLine(line, delimiter) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  cells.push(current);
  return cells;
}

function tryParse(val) {
  if (val === "") return "";
  if (val === "true" || val === "TRUE") return true;
  if (val === "false" || val === "FALSE") return false;
  if (val === "null") return null;
  const num = Number(val);
  if (!isNaN(num) && val.trim() !== "") return num;
  return val;
}

module.exports = { parseCSV, detectDelimiter, parseLine, tryParse };
