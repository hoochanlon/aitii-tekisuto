"""
调试解密工具 - 用于详细分析解密过程
"""
import sys
import base64
from pathlib import Path

# 添加 tools 目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from decrypt import decrypt

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python debug_decrypt.py <encrypted_base64> <key>", file=sys.stderr)
        sys.exit(1)
    
    encrypted_data = sys.argv[1].strip()
    key = sys.argv[2].strip()
    
    print(f"[DEBUG] Encrypted Base64 length: {len(encrypted_data)}", file=sys.stderr)
    print(f"[DEBUG] Key: '{key}' (length: {len(key)})", file=sys.stderr)
    
    # 清理 Base64 字符串
    cleaned = encrypted_data.replace(' ', '').replace('\n', '').replace('\r', '')
    print(f"[DEBUG] Cleaned Base64 length: {len(cleaned)}", file=sys.stderr)
    
    # Base64 解码
    try:
        decoded = base64.b64decode(cleaned)
        print(f"[DEBUG] Decoded binary length: {len(decoded)}", file=sys.stderr)
        print(f"[DEBUG] Expected length (from Base64): {len(cleaned) * 3 // 4}", file=sys.stderr)
    except Exception as e:
        print(f"[DEBUG] Base64 decode error: {e}", file=sys.stderr)
        sys.exit(1)
    
    # 检查长度
    if len(decoded) < 16:
        print(f"[DEBUG] Error: Data too short (need at least 16 bytes for IV)", file=sys.stderr)
        sys.exit(1)
    
    iv = decoded[:16]
    encrypted = decoded[16:]
    
    print(f"[DEBUG] IV length: {len(iv)}", file=sys.stderr)
    print(f"[DEBUG] Encrypted data length: {len(encrypted)}", file=sys.stderr)
    print(f"[DEBUG] Encrypted data length % 16: {len(encrypted) % 16}", file=sys.stderr)
    
    if len(encrypted) % 16 != 0:
        print(f"[DEBUG] Error: Encrypted data length ({len(encrypted)}) is not multiple of 16", file=sys.stderr)
        sys.exit(1)
    
    # 尝试解密
    try:
        decrypted = decrypt(encrypted_data, key)
        print(f"[DEBUG] ✓ Decryption successful!", file=sys.stderr)
        print(f"[DEBUG] Decrypted content length: {len(decrypted)}", file=sys.stderr)
        print(f"[DEBUG] Content preview: {decrypted[:100]}...", file=sys.stderr)
        print("SUCCESS")
    except Exception as e:
        print(f"[DEBUG] ✗ Decryption failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        print("FAILED")
        sys.exit(1)
