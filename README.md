# csv2json

Convert CSV to JSON right in your terminal. Zero dependencies.

You've got a CSV file. You need JSON. That's it. No Excel, no Python, no online converter that's secretly harvesting your data.

## Install

```bash
npm install -g csv2json-cli
```

## Usage

```bash
# Basic — outputs JSON array
csv2json users.csv

# Pretty printed
csv2json users.csv --pretty

# Read from stdin
cat data.csv | csv2json -

# Output as JSON Lines (one object per line)
csv2json users.csv -o jsonl

# Table format (quick preview)
csv2json users.csv -o pretty
```

## Filtering & Selecting

```bash
# Pick specific columns
csv2json users.csv -s name,email

# Filter rows
csv2json users.csv -w "age>25"
csv2json users.csv -w "status=active"
csv2json users.csv -w "name~alice"    # contains (case-insensitive)

# Combine them
csv2json users.csv -s name,age -w "age>30"
```

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--delimiter <char>` | `-d` | CSV delimiter (auto-detected by default) |
| `--output <format>` | `-o` | Output format: `json` (default), `jsonl`, `pretty` |
| `--pretty` | `-p` | Pretty-print JSON output |
| `--select <fields>` | `-s` | Select specific columns (comma-separated) |
| `--where <expr>` | `-w` | Filter: `field=value`, `field>5`, `field~text` |
| `--no-header` | | First row is data, not headers |
| `--help` | `-h` | Show help |

### Where operators

| Op | Meaning |
|----|---------|
| `=` | Equals |
| `!=` | Not equals |
| `>` | Greater than |
| `<` | Less than |
| `~` | Contains (case-insensitive) |

## Auto-Detection

Detects delimiter automatically — comma, tab, semicolon, pipe. Works with:
- Standard CSV
- TSV (tab-separated)
- Semicolon-separated (common in European locales)
- Pipe-delimited

## Type Coercion

Values are automatically converted:
- Numbers → `42`, `3.14`
- Booleans → `true`, `false`
- Null → `null`
- Everything else stays a string

## Why

Because every other CSV-to-JSON tool either needs Python, opens a browser, or has 47 dependencies. This one does one thing and does it with zero deps.

## License

MIT
