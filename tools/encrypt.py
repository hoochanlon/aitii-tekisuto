"""
加密工具 - 用于在构建时加密内容
基于 AES-CBC 256 位加密，与 encrypt.ts 逻辑一致
"""
import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


def encrypt(data: str, key: str) -> str:
    """
    加密函数
    
    Args:
        data: 要加密的字符串
        key: 密码
        
    Returns:
        加密后的 Base64 字符串
    """
    # 规范化密钥：去除 BOM、首尾空白、以及 \r \n \t，与 JavaScript decrypt() 保持一致
    key = str(key).strip().strip("\ufeff\r\n\t")
    key = key.replace("\r", "").replace("\n", "").replace("\t", "")
    
    # AES-CBC 要求 key 长度至少 16 字节，不够用 '0' 补齐
    # 与 TypeScript 版本保持一致：先补齐到 16，然后扩展到 32（256 位）
    key = key.ljust(16, "0")
    if len(key) < 32:
        key = key.ljust(32, "0")
    
    # 将字符串编码为字节（遇非法/代理字符时替换，避免 MkDocs 输出中的 surrogate 导致崩溃）
    data_bytes = data.encode('utf-8', errors='replace')
    key_bytes = key.encode('utf-8')[:32]  # 取前 32 字节（256 位）
    
    # 生成随机 16 字节 IV
    iv = os.urandom(16)
    
    # 创建加密器
    cipher = Cipher(
        algorithms.AES(key_bytes),
        modes.CBC(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    # 填充数据到 16 字节的倍数（PKCS7 填充）
    pad_length = 16 - (len(data_bytes) % 16)
    padded_data = data_bytes + bytes([pad_length] * pad_length)
    
    # 加密
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    
    # 将 IV 和密文组合，前 16 字节为 IV
    combined_data = iv + encrypted_data
    
    # 转成 Base64 字符串返回
    return base64.b64encode(combined_data).decode('utf-8')


if __name__ == "__main__":
    import sys
    # 支持两种调用方式，避免 Windows 命令行长度限制（约 8191 字符）：
    # 1) python encrypt.py <key>  从 stdin 读取待加密内容
    # 2) python encrypt.py <data> <key>  短内容时可直接传参
    if len(sys.argv) == 2:
        key = sys.argv[1]
        # 从 stdin 读原始字节再按 UTF-8 解码，避免 Windows 下子进程 stdin 使用系统默认编码导致乱码
        data = sys.stdin.buffer.read().decode("utf-8", errors="replace")
    elif len(sys.argv) == 3:
        data = sys.argv[1]
        key = sys.argv[2]
    else:
        print("Usage: python encrypt.py <key>  (read data from stdin)", file=sys.stderr)
        print("   or: python encrypt.py <data> <key>", file=sys.stderr)
        sys.exit(1)
    
    key = str(key).strip()
    # 调试信息（输出到 stderr，不影响 stdout 的加密数据）
    print(f"[ENCRYPT-SCRIPT] Key length: {len(key)}", file=sys.stderr)
    print(f"[ENCRYPT-SCRIPT] Data length: {len(data)}", file=sys.stderr)
    
    encrypted = encrypt(data, key)
    print(f"[ENCRYPT-SCRIPT] Encrypted length: {len(encrypted)}", file=sys.stderr)
    print(encrypted)  # 输出到 stdout
