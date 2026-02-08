/**
 * 文章内容解密脚本
 * 基于 AES-CBC 256 位解密，与 encrypt.ts 逻辑一致
 */

/**
 * 简单的 Markdown 到 HTML 转换函数
 * 处理常见的 Markdown 语法
 */
function markdownToHtml(markdown) {
  let html = markdown;
  
  // 处理代码块（先处理，避免内部内容被转换）
  const codeBlocks = [];
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(match);
    return placeholder;
  });
  
  // 处理行内代码
  const inlineCodes = [];
  html = html.replace(/`[^`]+`/g, (match) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(match);
    return placeholder;
  });
  
  // 处理图片（先处理，避免链接语法冲突）
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  
  // 处理链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 处理粗体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // 处理斜体
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // 处理标题
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 处理列表（有序和无序）
  const lines = html.split('\n');
  let inList = false;
  let listType = '';
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ulMatch = line.match(/^[\-\+\*]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(`</${listType}>`);
        processedLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      processedLines.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(`</${listType}>`);
        processedLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      processedLines.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      if (line.trim()) {
        processedLines.push(line);
      }
    }
  }
  if (inList) {
    processedLines.push(`</${listType}>`);
  }
  
  html = processedLines.join('\n');
  
  // 恢复代码块
  codeBlocks.forEach((code, index) => {
    const langMatch = code.match(/```(\w+)?\n([\s\S]*?)```/);
    if (langMatch) {
      const lang = langMatch[1] || '';
      const codeContent = langMatch[2];
      html = html.replace(`__CODE_BLOCK_${index}__`, `<pre><code class="language-${lang}">${codeContent}</code></pre>`);
    }
  });
  
  // 恢复行内代码
  inlineCodes.forEach((code, index) => {
    const codeContent = code.replace(/`/g, '');
    html = html.replace(`__INLINE_CODE_${index}__`, `<code>${codeContent}</code>`);
  });
  
  // 处理段落（空行分隔的文本块）
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    // 如果已经是 HTML 标签，不包装
    if (block.match(/^<[h|u|o|p|d|]/)) {
      return block;
    }
    // 否则包装为段落
    return '<p>' + block + '</p>';
  }).filter(b => b).join('\n\n');
  
  return html;
}

/**
 * 与 Python 完全一致的密钥推导，返回前 8 字节 hex（用于与构建时 keyHex 比对）
 */
function getKeyHex(key) {
  key = String(key).replace(/^\uFEFF/, "").trim();
  let keyStr = key;
  if (keyStr.length < 16) keyStr = keyStr + "0".repeat(16 - keyStr.length);
  if (keyStr.length < 32) keyStr = keyStr + "0".repeat(32 - keyStr.length);
  const keyEnc = new TextEncoder().encode(keyStr);
  const buf = new Uint8Array(32);
  for (let i = 0; i < 32 && i < keyEnc.length; i++) buf[i] = keyEnc[i];
  return Array.from(buf.subarray(0, 8)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

/**
 * 异步解密函数，与 Python tools/encrypt.py 完全兼容（AES-CBC 256，PKCS7）
 *
 * @param {string} data Base64 加密字符串（IV + 密文）
 * @param {string} key 密码
 * @param {string} [buildKeyHex] 构建时 keyHex，若提供且与当前 key 推导不一致则抛错
 * @returns {Promise<string>} 解密后的明文字符串
 */
async function decrypt(data, key, buildKeyHex) {
  try {
    // 与 Python hook 一致：去除 BOM、首尾空白、以及 \r \n \t
    key = String(key).replace(/^\uFEFF/, "").trim().replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "");
    let keyStr = key;
    if (keyStr.length < 16) keyStr = keyStr + "0".repeat(16 - keyStr.length);
    if (keyStr.length < 32) keyStr = keyStr + "0".repeat(32 - keyStr.length);
    const keyEnc = new TextEncoder().encode(keyStr);
    const keyBuffer = new Uint8Array(32);
    for (let i = 0; i < 32 && i < keyEnc.length; i++) keyBuffer[i] = keyEnc[i];
    // 如果提供了 buildKeyHex，必须强制校验，不匹配立即失败
    if (buildKeyHex) {
      const ourHex = Array.from(keyBuffer.subarray(0, 8)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      if (ourHex.toLowerCase() !== buildKeyHex.toLowerCase()) {
        console.error("[ENCRYPT] 密钥与构建时不一致。构建(前8字节):", buildKeyHex, "当前(前8字节):", ourHex);
        throw new Error("解密失败：密钥与构建时不一致，请确认密码与构建时完全一致（无多余空格/换行）");
      }
      console.log("[ENCRYPT] 密钥校验通过 (keyHex 与构建一致)");
    } else {
      // 如果没有提供 buildKeyHex，记录警告（但继续尝试解密）
      console.warn("[ENCRYPT] 警告：未提供 buildKeyHex，无法进行密钥校验");
    }

    // 2. Base64 解码为二进制字符串
    const cleanedData = String(data).replace(/\s/g, "");
    let binStr;
    try {
      binStr = atob(cleanedData);
    } catch (e) {
      throw new Error("解密失败：Base64 解码错误");
    }
    const rawLen = binStr.length;
    if (rawLen < 16) throw new Error("解密失败：数据太短（缺少 IV）");

    // 3. IV：从二进制串前 16 字节拷贝到独立 buffer
    const iv = new Uint8Array(16);
    for (let i = 0; i < 16; i++) iv[i] = binStr.charCodeAt(i);

    // 4. 密文：从二进制串 16..rawLen 逐字节拷贝到独立 Uint8Array（避免共享 buffer）
    const cipherLen = rawLen - 16;
    if (cipherLen % 16 !== 0) throw new Error("解密失败：密文长度不是 16 的倍数");
    const cipher = new Uint8Array(cipherLen);
    for (let i = 0; i < cipherLen; i++) cipher[i] = binStr.charCodeAt(16 + i);

    // 5. 导入密钥并解密
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-CBC", length: 256 },
      false,
      ["decrypt"]
    );
    let decrypted;
    try {
      decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv },
        cryptoKey,
        cipher
      );
    } catch (e) {
      const msg = (e && e.message) ? e.message : String(e);
      if (msg.indexOf("解密失败") === 0) throw new Error(msg);
      console.error("[ENCRYPT] Web Crypto API 解密异常:", msg);
      throw new Error("解密失败：" + msg);
    }

    // 6. 按实际返回长度处理
    // 部分浏览器 decrypt() 会自动去掉 PKCS7 padding，返回长度 = cipherLen - paddingLen（如 5568-9=5559）
    const dec = new Uint8Array(decrypted);
    if (dec.length === 0) throw new Error("解密失败：数据为空");
    
    // 调试信息：输出解密后的前几个字节
    const firstBytes = Array.from(dec.subarray(0, Math.min(32, dec.length))).map(b => b.toString(16).padStart(2, "0")).join(" ");
    console.log("[ENCRYPT] 解密后数据长度:", dec.length, "前32字节(hex):", firstBytes);

    function decodeUtf8(byteArray) {
      var s = new TextDecoder("utf-8", { fatal: false }).decode(byteArray);
      if (s.length && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
      return s;
    }
    function looksLikeHtml(s) {
      var t = (s && s.trim()) || "";
      // 降低长度要求：至少 3 个字符（如 <p></p> 的最小情况）
      if (t.length < 3 || t.charAt(0) !== "<") return false;
      // 必须包含闭合标签
      if (!/<\//.test(s)) return false;
      // 必须包含 HTML 标签（字母开头的标签）
      if (!/<[a-zA-Z]/.test(s)) return false;
      // 加强验证：确保是有效的 HTML 结构，不能只是乱码
      // 检查是否有成对的标签（如 <p>...</p>），或者至少有一个完整的标签对
      // 简单的检查：确保有开始标签和对应的结束标签
      var tagMatch = s.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g);
      if (!tagMatch || tagMatch.length === 0) return false;
      // 检查是否有对应的结束标签
      var hasClosingTag = false;
      for (var i = 0; i < tagMatch.length; i++) {
        var tagName = tagMatch[i].match(/<([a-zA-Z][a-zA-Z0-9]*)/);
        if (tagName && tagName[1]) {
          var closingTag = "</" + tagName[1] + ">";
          if (s.indexOf(closingTag) !== -1) {
            hasClosingTag = true;
            break;
          }
        }
      }
      return hasClosingTag;
    }

    const padStripped = cipherLen - dec.length;
    if (padStripped >= 1 && padStripped <= 16 && dec.length === cipherLen - padStripped) {
      var raw = decodeUtf8(dec);
      // 允许前导空白字符（空格、换行、制表符等）
      var trimmedRaw = raw.trimStart();
      if (trimmedRaw.length > 0 && trimmedRaw.charAt(0) !== "<") {
        console.error("[ENCRYPT] 解密后内容不以 '<' 开头。前32字符:", raw.substring(0, 32).replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
        throw new Error("解密失败：密码错误");
      }
      if (!looksLikeHtml(raw)) {
        console.error("[ENCRYPT] 解密后内容不满足 HTML 格式检查。长度:", raw.length, "前100字符:", raw.substring(0, 100).replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
        throw new Error("解密失败：密码错误");
      }
      return raw;
    }

    let useLen = dec.length;
    const lastByte = dec[dec.length - 1];
    const last4Hex = Array.from(dec.subarray(dec.length - 4)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join(" ");
    if (useLen % 16 !== 0) {
      const plen = lastByte;
      if (plen >= 1 && plen <= 16 && dec.length >= plen) {
        let ok = true;
        for (let j = dec.length - plen; j < dec.length; j++) {
          if (dec[j] !== plen) { ok = false; break; }
        }
        if (ok) useLen = dec.length - plen;
      }
      if (useLen === dec.length) {
        console.warn("[ENCRYPT] 解密后长度非16倍数，padding 校验失败。rawLen=" + rawLen + " cipherLen=" + cipherLen + " decLen=" + dec.length + " last4=" + last4Hex);
        throw new Error("解密失败：密码错误");
      }
    } else {
      const plen = lastByte;
      if (plen < 1 || plen > 16 || plen > dec.length) {
        console.warn("[ENCRYPT] padding 长度异常。decLen=" + dec.length + " plen=" + plen + " last4=" + last4Hex);
        throw new Error("解密失败：密码错误");
      }
      for (let j = dec.length - plen; j < dec.length; j++) {
        if (dec[j] !== plen) {
          console.warn("[ENCRYPT] padding 字节不一致。decLen=" + dec.length + " plen=" + plen + " last4=" + last4Hex);
          throw new Error("解密失败：密码错误");
        }
      }
      useLen = dec.length - plen;
    }

    var result = decodeUtf8(dec.subarray(0, useLen));
    // 允许前导空白字符（空格、换行、制表符等）
    var trimmedResult = result.trimStart();
    if (useLen > 0 && trimmedResult.length > 0 && trimmedResult.charAt(0) !== "<") {
      console.error("[ENCRYPT] 解密后内容不以 '<' 开头。前32字符:", result.substring(0, 32).replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
      throw new Error("解密失败：密码错误");
    }
    if (!looksLikeHtml(result)) {
      console.error("[ENCRYPT] 解密后内容不满足 HTML 格式检查。长度:", result.length, "前100字符:", result.substring(0, 100).replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
      throw new Error("解密失败：密码错误");
    }
    return result;
  } catch (error) {
    if (error.message && error.message.indexOf("解密失败") === 0) throw error;
    throw new Error("解密失败：" + (error.message || "未知错误"));
  }
}

/**
 * 设置带过期时间的 localStorage
 */
function setItemWithExpire(key, value, ttl) {
  const item = { value: value, expire: new Date().getTime() + ttl * 1000 };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * 获取带过期时间的 localStorage
 */
function getItemWithExpire(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    if (new Date().getTime() > item.expire) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (_) {
    return null;
  }
}

/**
 * 检查页面是否有密码保护（通过检查 meta 标签或 data 属性）
 */
function checkPagePassword() {
  // 检查是否有加密容器
  const containers = document.querySelectorAll(".encryption-container");
  if (containers.length > 0) {
    return true;
  }
  
  // 检查页面 meta 标签
  const passwordMeta = document.querySelector('meta[name="page-password"]');
  if (passwordMeta) {
    return true;
  }
  
  return false;
}

/**
 * 初始化页面解密逻辑
 */
function initEncryption() {
  // 尝试多种选择器，兼容压缩后的 HTML
  let containers = document.querySelectorAll(".encryption-container");
  if (containers.length === 0) {
    // 尝试属性选择器
    containers = document.querySelectorAll('[class*="encryption-container"]');
  }
  if (containers.length === 0) {
    // 尝试 ID 选择器
    containers = document.querySelectorAll('[id^="encryption-container-"]');
  }
  
  if (containers.length === 0) return;
  
  containers.forEach((container) => {
    // 优先从独立 JSON 文件加载（data-payload-url），避免 HTML 内嵌被截断
    const payloadUrl = container.getAttribute("data-payload-url");
    let encrypted = null;
    if (!payloadUrl) {
      const script = container.querySelector('script[type="application/json"]');
      if (script && script.textContent) {
        try {
          const payload = JSON.parse(script.textContent);
          if (payload && typeof payload.data === "string") encrypted = payload.data;
        } catch (_) {}
      }
      if (!encrypted) encrypted = container.getAttribute("data-encrypted");
      if (!encrypted && container.dataset.encrypted) encrypted = container.dataset.encrypted;
      if (!encrypted) {
        const match = container.outerHTML.match(/data-encrypted="([^"]+)"/);
        if (match) encrypted = match[1];
      }
    }
    if (!encrypted && !payloadUrl) return;
    
    const expectedPassword = container.getAttribute("data-password");
    const input = container.querySelector(".encrypt-input");
    const btn = container.querySelector(".encrypt-button");
    const article = container.querySelector(".encrypt-content");
    const errorMessage = container.querySelector(".encrypt-error");
    const prompt = container.querySelector(".encrypt-prompt");
    const togglePassword = container.querySelector(".encrypt-toggle-password");
    
    // 密码显示/隐藏切换
    if (togglePassword && input) {
      togglePassword.addEventListener("click", () => {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
      });
    }
    
    // 仅用 localStorage 预填，避免 data-password 暴露在输入框（无痕/删存储后不再自动填密码）
    const buildPasswordNorm = expectedPassword ? String(expectedPassword).replace(/^\uFEFF/, "").trim().replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "") : "";
    const storageKey = "encrypt:" + window.location.pathname;
    const savedPassword = getItemWithExpire(storageKey);
    if (input && savedPassword) input.value = savedPassword;
    
    // 按钮点击事件
    btn?.addEventListener("click", attemptDecrypt);
    
    // 回车键事件
    input?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        attemptDecrypt();
      }
    });
    
    async function attemptDecrypt() {
      const password = (input && input.value) ? input.value.replace(/^\uFEFF/, "").trim().replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "") : "";
      if (!password && !buildPasswordNorm) {
        if (errorMessage) {
          errorMessage.classList.remove("hidden");
          errorMessage.textContent = "请输入密码";
        }
        return;
      }
      
      let dataToDecrypt = encrypted;
      let payloadKeyHex = null;
      if (payloadUrl) {
        try {
          const urlToFetch = payloadUrl.startsWith("http") ? payloadUrl : new URL(payloadUrl, window.location.href).href;
          const res = await fetch(urlToFetch);
          if (!res.ok) throw new Error("无法加载加密数据");
          const ab = await res.arrayBuffer();
          const text = new TextDecoder("utf-8").decode(ab);
          const obj = JSON.parse(text);
          dataToDecrypt = (obj && obj.data) ? String(obj.data).trim() : null;
          payloadKeyHex = (obj && obj.keyHex) ? String(obj.keyHex) : null;
          // 如果从 JSON 文件加载，必须包含 keyHex，否则拒绝解密
          if (!payloadKeyHex) {
            console.error("[ENCRYPT] 错误：加密数据文件中缺少 keyHex，无法进行密钥校验");
            if (errorMessage) {
              errorMessage.classList.remove("hidden");
              errorMessage.textContent = "加密数据格式错误，请重新构建站点。";
            }
            return;
          }
        } catch (e) {
          if (errorMessage) {
            errorMessage.classList.remove("hidden");
            errorMessage.textContent = "加载加密数据失败，请刷新重试。";
          }
          return;
        }
      }
      if (!dataToDecrypt) {
        if (errorMessage) {
          errorMessage.classList.remove("hidden");
          errorMessage.textContent = "未找到加密数据，请重新构建站点。";
        }
        return;
      }
      // 如果没有 payloadKeyHex（使用内嵌加密数据的情况），记录警告但继续
      // 这种情况下应该使用 data-password 进行验证
      if (!payloadKeyHex && !buildPasswordNorm) {
        console.warn("[ENCRYPT] 警告：未提供 keyHex 且无构建时密码，无法进行密钥校验");
      }
      
      async function tryDecrypt(pwd, buildKeyHex) {
        // 如果提供了 buildKeyHex，必须进行密钥校验
        if (buildKeyHex && !pwd) {
          throw new Error("解密失败：需要密码进行密钥校验");
        }
        const html = await decrypt(dataToDecrypt, pwd, buildKeyHex || null);
        if (!html || html.trim().length === 0) throw new Error("解密失败：内容为空");
        return html;
      }
      
      // 如果用户输入了密码，必须使用用户输入的密码进行解密和校验
      // 只有在用户没有输入密码时，才使用构建时密码自动解密
      const buildPassword = buildPasswordNorm;
      try {
        let decryptedHtml;
        // 如果用户输入了密码，必须验证用户输入的密码（通过 keyHex 校验）
        if (password) {
          // 用户输入了密码，必须使用用户输入的密码，并进行 keyHex 校验
          if (payloadKeyHex) {
            // 有 keyHex，必须进行校验
            decryptedHtml = await tryDecrypt(password, payloadKeyHex);
          } else {
            // 没有 keyHex，无法校验，拒绝解密
            throw new Error("解密失败：无法进行密钥校验，请重新构建站点");
          }
        } else if (buildPassword) {
          // 用户没有输入密码，但有构建时密码，使用构建时密码自动解密
          decryptedHtml = await tryDecrypt(buildPassword, payloadKeyHex);
        } else {
          // 既没有用户输入，也没有构建时密码
          throw new Error("解密失败：需要密码");
        }
        // 不把构建时密码写回输入框，避免暴露
        // 去掉解密内容中开头的第一个 h1，避免与主题已显示的页面标题重复
        var wrap = document.createElement("div");
        wrap.innerHTML = decryptedHtml;
        var first = wrap.firstElementChild;
        if (first && first.tagName === "H1") first.remove();
        decryptedHtml = wrap.innerHTML;
        article.innerHTML = decryptedHtml;
        article.classList.remove("hidden");
        if (prompt) prompt.classList.add("hidden");
        if (errorMessage) errorMessage.classList.add("hidden");
        document.body.classList.add("encrypted-page-unlocked");
        setItemWithExpire(storageKey, buildPassword || password, 86400);
      } catch (error) {
        console.error("[ENCRYPT] 解密失败:", error.message || error);
        document.documentElement.classList.remove("encrypt-auto-unlock");
        if (errorMessage) {
          errorMessage.classList.remove("hidden");
          errorMessage.textContent = "密码错误，请重新输入";
        }
        if (article) article.classList.add("hidden");
        if (prompt) prompt.classList.remove("hidden");
      }
    }
    // 仅在有 localStorage 已存密码时自动解密；有 data-password 时不自动解锁、不预填，避免重跑/删存储后仍直接显示文章或填密码
    if (input && savedPassword) {
      if (prompt) prompt.classList.add("hidden");
      attemptDecrypt();
    }
  });
}

// 隐藏加密页面的 View source 和 Edit 按钮
function hideEditButtons() {
  const containers = document.querySelectorAll(".encryption-container");
  if (containers.length > 0) {
    // 查找并隐藏编辑按钮（包括 md-content__button md-icon）
    const editButtons = document.querySelectorAll(
      '.md-content__button, ' +
      '.md-content__button.md-icon, ' +
      '.md-content__button[title*="Edit"], ' +
      '.md-content__button[title*="编辑"], ' +
      '.md-content__button[title*="View source"], ' +
      '.md-content__button[title*="查看源代码"], ' +
      '.md-content__edit, ' +
      '[title="Edit this page"], ' +
      '[title="View source of this page"]'
    );
    editButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  }
}

// 初始化函数
function initializeEncryption() {
  initEncryption();
  hideEditButtons();
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeEncryption);
} else {
  // DOM 已经加载完成，立即执行
  initializeEncryption();
}

// 支持 MkDocs Material 的即时导航
if (typeof app !== "undefined" && app.document$) {
  app.document$.subscribe(() => {
    // 使用更长的延迟，确保 DOM 完全更新
    setTimeout(() => {
      initializeEncryption();
    }, 200);
  });
}
