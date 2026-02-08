"""
测试加密/解密是否正常工作
"""
import sys
from pathlib import Path

# 添加 tools 目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from encrypt import encrypt
from decrypt import decrypt

def test_encrypt_decrypt():
    """测试加密/解密"""
    test_data = "测试内容：这是一个测试"
    test_key = "demo123"
    
    print(f"[TEST] 原始数据: {test_data}")
    print(f"[TEST] 密码: {test_key}")
    print()
    
    # 加密
    encrypted = encrypt(test_data, test_key)
    print(f"[TEST] 加密后的 Base64 长度: {len(encrypted)}")
    print(f"[TEST] 加密后的 Base64 (前50字符): {encrypted[:50]}...")
    print()
    
    # 解密
    try:
        decrypted = decrypt(encrypted, test_key)
        print(f"[TEST] 解密成功！")
        print(f"[TEST] 解密后的数据: {decrypted}")
        print()
        
        if decrypted == test_data:
            print("[TEST] ✅ 测试通过：加密/解密数据完全匹配！")
            return True
        else:
            print("[TEST] ❌ 测试失败：解密后的数据不匹配")
            print(f"[TEST]   原始: {repr(test_data)}")
            print(f"[TEST]   解密: {repr(decrypted)}")
            return False
    except Exception as e:
        print(f"[TEST] ❌ 解密失败: {e}")
        return False

if __name__ == "__main__":
    success = test_encrypt_decrypt()
    sys.exit(0 if success else 1)
