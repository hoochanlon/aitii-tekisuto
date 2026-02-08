"""
验证加密 JSON 能否用给定密码解密（用于排查「密码错误」）
用法: python tools/verify_payload.py site/assets/encrypted/0a32c8e7.json demo123
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from decrypt import decrypt


def main():
    if len(sys.argv) != 3:
        print("Usage: python verify_payload.py <path-to-json> <password>", file=sys.stderr)
        print("Example: python tools/verify_payload.py site/assets/encrypted/0a32c8e7.json demo123", file=sys.stderr)
        sys.exit(1)
    json_path = Path(sys.argv[1])
    password = sys.argv[2].strip().replace("\r", "").replace("\n", "").replace("\t", "")
    if not json_path.exists():
        print(f"[VERIFY] File not found: {json_path}", file=sys.stderr)
        sys.exit(1)
    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
        b64 = (data or {}).get("data")
        if not b64:
            print("[VERIFY] JSON has no 'data' field", file=sys.stderr)
            sys.exit(1)
        out = decrypt(b64, password)
        print(f"[VERIFY] OK: decrypted length = {len(out)}")
        if out.strip().startswith("<"):
            print("[VERIFY] Content looks like HTML.")
        else:
            print("[VERIFY] First 80 chars:", repr(out[:80]))
    except Exception as e:
        print(f"[VERIFY] FAIL: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
