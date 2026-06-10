#!/usr/bin/env node
"use strict";
const { parseArgs: parseCliArgs } = require("node:util");
const fs = require("node:fs");
const { parseCSV, detectDelimiter } = require("./src/parse");
const { formatJSON, formatJSONL, formatPretty } = require("./src/format");
const { HELP } = require("./src/help");

function parseArgs(argv) {
  const { values, positionals } = parseCliArgs({
    args: argv,
    options: {
      delimiter: { type: "string", short: "d" },
      output: { type: "string", short: "o" },
      pretty: { type: "boolean", short: "p" },
      "no-header": { type: "boolean" },
      "select": { type: "string", short: "s" },
      "where": { type: "string", short: "w" },
      help: { type: "boolean", short: "h" },
    },
    strict: false,
  });

  if (values.help) {
    console.log(HELP);
    process.exit(0);
  }

  const file = positionals[0];
  let input;
  if (file && file !== "-") {
    input = fs.readFileSync(file, "utf-8");
  } else {
    input = fs.readFileSync(0, "utf-8");
  }

  const delimiter = values.delimiter || detectDelimiter(input);
  const hasHeader = !values["no-header"];
  const rows = parseCSV(input, { delimiter, hasHeader });

  let filtered = rows;
  if (values.where) {
    const [field, op, val] = parseWhere(values.where);
    filtered = rows.filter((row) => {
      const v = row[field];
      if (v === undefined) return false;
      switch (op) {
        case "=":  return String(v) === val;
        case "!=": return String(v) !== val;
        case ">":  return Number(v) > Number(val);
        case "<":  return Number(v) < Number(val);
        case "~":  return String(v).toLowerCase().includes(val.toLowerCase());
        default:   return true;
      }
    });
  }

  if (values.select) {
    const fields = values.select.split(",").map((f) => f.trim());
    filtered = filtered.map((row) => {
      const out = {};
      fields.forEach((f) => { if (f in row) out[f] = row[f]; });
      return out;
    });
  }

  const output = values.output || "json";
  switch (output) {
    case "jsonl":
      console.log(formatJSONL(filtered));
      break;
    case "pretty":
      console.log(formatPretty(filtered));
      break;
    default:
      console.log(formatJSON(filtered, values.pretty));
  }
}

function parseWhere(str) {
  const ops = ["!=", ">=", "<=", "~", "=", ">", "<"];
  for (const op of ops) {
    const i = str.indexOf(op);
    if (i > 0) return [str.slice(0, i).trim(), op, str.slice(i + op.length).trim()];
  }
  return [str.trim(), "=", ""];
}

parseArgs(process.argv.slice(2));
