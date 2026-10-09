"""Compatibility entry point; Node owns selection and validation."""
import os
from pathlib import Path
import subprocess
import sys

def main():
    script = Path(__file__).resolve().with_suffix(".cjs")
    return subprocess.run([os.environ.get("NODE_BINARY", "node"), str(script), *sys.argv[1:]]).returncode

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except OSError as exc:
        print(f"Seleção indisponível: {exc}. Nenhuma referência genérica foi gravada.", file=sys.stderr)
        raise SystemExit(1)
