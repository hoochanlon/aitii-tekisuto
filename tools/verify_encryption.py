"""
验证工具 - 用于验证页面上的加密数据是否能正确解密
"""
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.decrypt import decrypt

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python verify_encryption.py <encrypted_base64> <key>", file=sys.stderr)
        sys.exit(1)
    
    encrypted_data = sys.argv[1].strip()
    key = sys.argv[2].strip()
    
    print(f"[VERIFY] Encrypted data length: {len(encrypted_data)}", file=sys.stderr)
    print(f"[VERIFY] Key: '{key}' (length: {len(key)})", file=sys.stderr)
    
    try:
        decrypted = decrypt(encrypted_data, key)
        print(f"[VERIFY] ✓ Decryption successful!", file=sys.stderr)
        print(f"[VERIFY] Decrypted content length: {len(decrypted)}", file=sys.stderr)
        print(f"[VERIFY] Content preview: {decrypted[:100]}...", file=sys.stderr)
        print("SUCCESS")
    except Exception as e:
        print(f"[VERIFY] ✗ Decryption failed: {e}", file=sys.stderr)
        print("FAILED")
        sys.exit(1)
