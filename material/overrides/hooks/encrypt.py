"""
MkDocs Hook - 处理文章内容加密
在 HTML 渲染后加密内容并替换为密码输入框
"""
import hashlib
import subprocess
import sys
from pathlib import Path
import re as regex_module
import html as html_module

from mkdocs.config.defaults import MkDocsConfig
from mkdocs.structure.pages import Page
from mkdocs.structure.files import Files


def on_page_markdown(
    markdown: str, *, page: Page, config: MkDocsConfig, files: Files
) -> str:
    # 直接返回原始 Markdown，加密在 on_page_content 中处理
    return markdown


def on_page_content(
    html: str, *, page: Page, config: MkDocsConfig, files: Files
) -> str:
    """
    处理已渲染的 HTML，加密内容并替换为密码输入框
    
    支持的语法：
    ---
    password: your-password
    ---
    
    整个页面内容会自动加密，无需额外的加密标记。
    """
    
    # 获取 front-matter 中的密码
    front_matter_password = page.meta.get("password") if page.meta else None
    print(f"[ENCRYPT] Processing page: {page.file.src_uri}, password: {front_matter_password}", file=sys.stderr)
    
    if not front_matter_password:
        return html
    
    # 规范密码：去除 BOM、\r\n\t、首尾空白，与前端和 encrypt 子进程完全一致
    password = str(front_matter_password).strip().strip("\ufeff\r\n\t")
    password = password.replace("\r", "").replace("\n", "").replace("\t", "")
    
    # 生成唯一 ID（基于页面路径）
    page_hash = hashlib.md5(page.file.src_uri.encode()).hexdigest()[:8]
    unique_id = f"{page_hash}"
    
    container_id = f"encryption-container-{unique_id}"
    input_id = f"password-input-{unique_id}"
    btn_id = f"password-btn-{unique_id}"
    error_id = f"error-message-{unique_id}"
    content_id = f"encryption-{unique_id}"
    
    encrypt_script = Path(__file__).parent.parent.parent.parent / "tools" / "encrypt.py"
    
    try:
        # on_page_content hook 接收的 HTML 是页面的主要内容部分（通常是 <article> 内的内容）
        # 直接使用接收到的 HTML 作为要加密的内容
        original_content_to_encrypt = html
        
        if not original_content_to_encrypt.strip():
            print(f"[ENCRYPT] Warning: Content to encrypt is empty for {page.file.src_uri}", file=sys.stderr)
            return html
        
        print(f"[ENCRYPT] Content to encrypt length: {len(original_content_to_encrypt)}", file=sys.stderr)
        print(f"[ENCRYPT] Using password for encryption: '{password}' (type: {type(password).__name__}, length: {len(password)})", file=sys.stderr)
        
        # 加密内容：通过 stdin 传入 HTML，密码与上面规范后的 password 一致
        result = subprocess.run(
            [sys.executable, str(encrypt_script), password],
            input=original_content_to_encrypt,
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8',
            errors='replace',
            shell=False
        )
        encrypted_data = result.stdout.strip()
        print(f"[ENCRYPT] Encrypted data length: {len(encrypted_data)}", file=sys.stderr)
        
        if not encrypted_data:
            print(f"[ENCRYPT] Warning: Encryption returned empty data for {page.file.src_uri}", file=sys.stderr)
            print(f"[ENCRYPT] stderr: {result.stderr}", file=sys.stderr)
            return html
        
        # 构建时往返校验（仅打日志，不阻断）：用同一密码解密，确认与原文一致
        tools_root = Path(__file__).resolve().parent.parent.parent.parent
        if str(tools_root) not in sys.path:
            sys.path.insert(0, str(tools_root))
        try:
            from tools.decrypt import decrypt as py_decrypt
            decrypted = py_decrypt(encrypted_data, password)
            expected = original_content_to_encrypt.encode("utf-8", errors="replace").decode("utf-8")
            if decrypted != expected:
                print(f"[ENCRYPT] Round-trip WARNING for {page.file.src_uri}: 解密结果与原文不一致（仍会输出加密页）", file=sys.stderr)
            else:
                print(f"[ENCRYPT] Round-trip OK for {page.file.src_uri}", file=sys.stderr)
        except Exception as e:
            print(f"[ENCRYPT] Round-trip WARNING for {page.file.src_uri}: {e}（仍会输出加密页）", file=sys.stderr)
        
        print(f"[ENCRYPT] Encryption successful for page: {page.file.src_uri}", file=sys.stderr)
        
        # 将加密数据写入独立 JSON 文件；写入密钥指纹 keyHex 供前端比对（前 8 字节 hex）
        import json
        _key = password.ljust(16, "0")
        if len(_key) < 32:
            _key = _key.ljust(32, "0")
        _key_bytes = _key.encode("utf-8")[:32]
        key_hex = _key_bytes[:8].hex()
        payload_json = json.dumps({"data": encrypted_data, "keyHex": key_hex}, ensure_ascii=False)
        site_dir = Path(config["site_dir"]).resolve()
        payload_dir = site_dir / "assets" / "encrypted"
        payload_dir.mkdir(parents=True, exist_ok=True)
        (payload_dir / f"{unique_id}.json").write_text(payload_json, encoding="utf-8")
        # 相对路径 + 基于密文内容的 ?v= 避免浏览器缓存旧 JSON（每次构建 IV 不同，密文不同）
        path_depth = len(page.url.rstrip("/").replace(".html", "").split("/"))
        base_rel = "../" * path_depth if path_depth else "./"
        payload_hash = hashlib.sha256(encrypted_data.encode()).hexdigest()[:12]
        payload_url = f"{base_rel}assets/encrypted/{unique_id}.json?v={payload_hash}"
        
        escaped_password = html_module.escape(password, quote=True)
        password_hint = (page.meta.get("password-hint") if page.meta else None) or "请输入密码以查看内容"
        escaped_hint = html_module.escape(str(password_hint).strip(), quote=True)
        encrypt_html_structure = f'''<div class="encryption-container" id="{container_id}" data-payload-url="{payload_url}" data-password="{escaped_password}">
  <div class="encrypt-prompt">
    <div class="encrypt-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h2 class="encrypt-title">该文章已加密</h2>
    <p class="encrypt-hint">{escaped_hint}</p>
    <div class="encrypt-form">
      <div class="encrypt-input-wrapper">
        <input
          id="{input_id}"
          class="encrypt-input"
          type="password"
          placeholder="请输入密码"
          autocomplete="off"
        />
        <button type="button" class="encrypt-toggle-password" aria-label="显示/隐藏密码">
          <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      <button id="{btn_id}" class="encrypt-button" type="button">解锁文章</button>
      <div id="{error_id}" class="encrypt-error hidden">密码错误，请重新输入。</div>
    </div>
  </div>
  <div id="{content_id}" class="encrypt-content hidden"></div>
</div>'''
        
        # on_page_content hook 接收的 HTML 就是主要内容，直接替换整个内容
        print(f"[ENCRYPT] Replacing entire HTML content with encryption prompt", file=sys.stderr)
        return encrypt_html_structure
    
    except subprocess.CalledProcessError as e:
        print(f"[ENCRYPT] Encryption subprocess error for {page.file.src_uri}: {e.stderr}", file=sys.stderr)
        return html
    except Exception as e:
        print(f"[ENCRYPT] Encryption processing error for {page.file.src_uri}: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return html
