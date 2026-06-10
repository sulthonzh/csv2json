import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCSV, detectDelimiter, parseLine, tryParse } from "../src/parse.js";
import { formatJSON, formatJSONL, formatPretty } from "../src/format.js";
import { HELP } from "../src/help.js";

// --- parseLine ---
describe("parseLine", () => {
  it("parses simple comma-separated", () => {
    assert.deepEqual(parseLine("a,b,c", ","), ["a", "b", "c"]);
  });
  it("handles quoted fields with delimiter inside", () => {
    assert.deepEqual(parseLine('"hello, world",b', ","), ["hello, world", "b"]);
  });
  it("handles escaped double quotes", () => {
    assert.deepEqual(parseLine('"say ""hi""",b', ","), ['say "hi"', "b"]);
  });
  it("handles tab delimiter", () => {
    assert.deepEqual(parseLine("a\tb\tc", "\t"), ["a", "b", "c"]);
  });
  it("handles empty fields", () => {
    assert.deepEqual(parseLine("a,,c", ","), ["a", "", "c"]);
  });
});

// --- detectDelimiter ---
describe("detectDelimiter", () => {
  it("detects comma", () => {
    assert.equal(detectDelimiter("a,b,c\n1,2,3"), ",");
  });
  it("detects tab", () => {
    assert.equal(detectDelimiter("a\tb\tc\n1\t2\t3"), "\t");
  });
  it("detects semicolon", () => {
    assert.equal(detectDelimiter("a;b;c\n1;2;3"), ";");
  });
  it("defaults to comma for no delimiters", () => {
    assert.equal(detectDelimiter("hello world"), ",");
  });
  it("detects pipe", () => {
    assert.equal(detectDelimiter("a|b|c"), "|");
  });
});

// --- tryParse ---
describe("tryParse", () => {
  it("parses integers", () => { assert.equal(tryParse("42"), 42); });
  it("parses floats", () => { assert.equal(tryParse("3.14"), 3.14); });
  it("parses true", () => { assert.equal(tryParse("true"), true); });
  it("parses false", () => { assert.equal(tryParse("FALSE"), false); });
  it("parses null", () => { assert.equal(tryParse("null"), null); });
  it("returns string otherwise", () => { assert.equal(tryParse("hello"), "hello"); });
  it("returns empty string for empty", () => { assert.equal(tryParse(""), ""); });
  it("does not parse whitespace as number", () => {
    assert.equal(tryParse("  "), "  ");
  });
});

// --- parseCSV ---
describe("parseCSV", () => {
  it("parses basic CSV with headers", () => {
    const result = parseCSV("name,age\nAlice,30\nBob,25");
    assert.deepEqual(result, [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
  });
  it("handles no-header mode", () => {
    const result = parseCSV("Alice,30\nBob,25", { hasHeader: false });
    assert.deepEqual(result, [
      { col0: "Alice", col1: 30 },
      { col0: "Bob", col1: 25 },
    ]);
  });
  it("handles custom delimiter", () => {
    const result = parseCSV("name;age\nAlice;30", { delimiter: ";" });
    assert.deepEqual(result, [{ name: "Alice", age: 30 }]);
  });
  it("returns empty for empty input", () => {
    assert.deepEqual(parseCSV(""), []);
  });
  it("strips CRLF line endings", () => {
    const result = parseCSV("name,age\r\nAlice,30\r\n");
    assert.deepEqual(result, [{ name: "Alice", age: 30 }]);
  });
  it("handles quoted fields", () => {
    const result = parseCSV('name,desc\nAlice,"hello world"');
    assert.deepEqual(result, [{ name: "Alice", desc: "hello world" }]);
  });
  it("trims header whitespace", () => {
    const result = parseCSV(" name , age \nAlice,30");
    assert.ok(result[0].hasOwnProperty("name"));
    assert.ok(result[0].hasOwnProperty("age"));
  });
  it("handles single column CSV", () => {
    const result = parseCSV("name\nAlice\nBob");
    assert.deepEqual(result, [{ name: "Alice" }, { name: "Bob" }]);
  });
});

// --- formatJSON ---
describe("formatJSON", () => {
  it("formats compact JSON", () => {
    const out = formatJSON([{ a: 1 }], false);
    assert.equal(out, '[{"a":1}]');
  });
  it("formats pretty JSON", () => {
    const out = formatJSON([{ a: 1 }], true);
    assert.ok(out.includes("\n"));
    assert.ok(out.includes("  "));
  });
  it("handles empty array", () => {
    assert.equal(formatJSON([], false), "[]");
  });
});

// --- formatJSONL ---
describe("formatJSONL", () => {
  it("formats as JSON lines", () => {
    const out = formatJSONL([{ a: 1 }, { b: 2 }]);
    const lines = out.split("\n");
    assert.equal(lines.length, 2);
    assert.equal(JSON.parse(lines[0]).a, 1);
    assert.equal(JSON.parse(lines[1]).b, 2);
  });
  it("handles empty", () => {
    assert.equal(formatJSONL([]), "");
  });
});

// --- formatPretty ---
describe("formatPretty", () => {
  it("shows No data for empty", () => {
    assert.equal(formatPretty([]), "No data");
  });
  it("formats table with headers and separator", () => {
    const out = formatPretty([{ name: "Alice", age: 30 }]);
    const lines = out.split("\n");
    assert.equal(lines.length, 3);
    assert.ok(lines[0].includes("name"));
    assert.ok(lines[1].includes("-"));
    assert.ok(lines[2].includes("Alice"));
  });
  it("aligns columns by longest value", () => {
    const out = formatPretty([{ a: "hi", b: "world" }]);
    const lines = out.split("\n");
    // "world" (5) is longest, so "b" column header is padded to 5
    assert.ok(lines[0].includes("b    "));
    assert.ok(lines[2].includes("world"));
  });
});

// --- HELP ---
describe("HELP", () => {
  it("includes usage info", () => {
    assert.ok(HELP.includes("csv2json"));
    assert.ok(HELP.includes("--help"));
    assert.ok(HELP.includes("--output"));
  });
});
