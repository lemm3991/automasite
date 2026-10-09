"""Compatibility CLI/API; retrieval is shared with search.cjs (Node.js required)."""
import json
import os
from pathlib import Path
import subprocess
import sys

BASE_DIR = Path(__file__).resolve().parent

def search_templates(query="", tema=None, nicho=None, estilo=None, top=3, min_score=12):
    args = [os.environ.get("NODE_BINARY", "node"), str(BASE_DIR / "search.cjs"), "--json", "--top", str(top), "--min-score", str(min_score)]
    for flag, value in [("--query", query), ("--tema", tema), ("--nicho", nicho), ("--estilo", estilo)]:
        if value:
            args.extend([flag, str(value)])
    result = subprocess.run(args, capture_output=True, encoding="utf-8", check=True)
    return json.loads(result.stdout)

def main():
    result = subprocess.run([os.environ.get("NODE_BINARY", "node"), str(BASE_DIR / "search.cjs"), *sys.argv[1:]])
    return result.returncode

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, subprocess.SubprocessError) as exc:
        print(f"Busca indisponível: {exc}. Use Node.js e corrija a causa; não há fallback genérico.", file=sys.stderr)
        raise SystemExit(1)
