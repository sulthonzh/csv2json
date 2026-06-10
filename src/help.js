"use strict";
const HELP = `
csv2json — Convert CSV to JSON in the terminal

Usage:
  csv2json <file>              Convert CSV file to JSON
  csv2json <file> --pretty     Pretty-printed JSON
  csv2json <file> -o jsonl     Output as JSON Lines
  csv2json <file> -o pretty    Table format
  cat data.csv | csv2json -    Read from stdin

Options:
  -d, --delimiter <char>   CSV delimiter (auto-detected)
  -o, --output <format>    Output: json (default), jsonl, pretty
  -p, --pretty             Pretty-print JSON
  -s, --select <fields>    Select specific columns (comma-separated)
  -w, --where <filter>     Filter rows: field=value, field>5, field~text
      --no-header          Treat first row as data (no headers)
  -h, --help               Show this help

Where operators:
  =   equals
  !=  not equals
  >   greater than
  <   less than
  ~   contains (case-insensitive)

Examples:
  csv2json users.csv
  csv2json data.csv -d ";" -o pretty
  csv2json data.csv -s name,email -w "age>25"
  csv2json data.csv --no-header
  csv2json < data.csv -o jsonl
`.trim();

module.exports = { HELP };
