"""
解密工具 - 用于验证加密是否正确
基于 AES-CBC 256 位解密，与 encrypt.py 逻辑一致
"""
import base64
import sys
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


def decrypt(data: str, key: str) -> str:
    """
    解密函数
    
    Args:
        data: Base64 加密字符串
        key: 密码
        
    Returns:
        解密后的明文字符串
    """
    # 与 encrypt.py 保持完全一致的密钥处理
    key = key.ljust(16, "0")
    if len(key) < 32:
        key = key.ljust(32, "0")
    
    # 将字符串编码为字节
    key_bytes = key.encode('utf-8')[:32]  # 取前 32 字节（256 位）
    
    # Base64 解码
    combined_data = base64.b64decode(data)
    
    if len(combined_data) < 16:
        raise ValueError("数据太短（缺少 IV）")
    
    # 提取 IV 和密文
    iv = combined_data[:16]
    encrypted_data = combined_data[16:]
    
    # 验证加密数据长度必须是 16 的倍数
    if len(encrypted_data) % 16 != 0:
        raise ValueError(f"加密数据长度 ({len(encrypted_data)}) 不是 16 的倍数")
    
    # 创建解密器
    cipher = Cipher(
        algorithms.AES(key_bytes),
        modes.CBC(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    
    # 解密
    decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()
    
    # 验证解密后的数据长度必须是 16 的倍数
    if len(decrypted_data) % 16 != 0:
        raise ValueError(f"解密后的数据长度 ({len(decrypted_data)}) 不是 16 的倍数，可能是密码错误")
    
    # 移除 PKCS7 填充
    pad_length = decrypted_data[-1]
    if pad_length < 1 or pad_length > 16 or pad_length > len(decrypted_data):
        raise ValueError(f"无效的填充长度 ({pad_length})，可能是密码错误")
    
    # 验证填充字节是否一致
    for i in range(len(decrypted_data) - pad_length, len(decrypted_data)):
        if decrypted_data[i] != pad_length:
            raise ValueError(f"填充验证失败，可能是密码错误")
    
    # 移除填充
    unpadded_data = decrypted_data[:-pad_length]
    
    # 解码为字符串
    return unpadded_data.decode('utf-8')


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python decrypt.py <encrypted_base64> <key>", file=sys.stderr)
        sys.exit(1)
    
    encrypted_data = sys.argv[1]
    key = sys.argv[2]
    
    try:
        decrypted = decrypt(encrypted_data, key)
        print(f"[DECRYPT-SCRIPT] Decryption successful!")
        print(f"[DECRYPT-SCRIPT] Decrypted content length: {len(decrypted)}")
        print(decrypted)
    except Exception as e:
        print(f"[DECRYPT-SCRIPT] Decryption failed: {e}", file=sys.stderr)
        sys.exit(1)
