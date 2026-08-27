const crypto = require('crypto');

// Özel Dosya İmzaları (.hrav ve .meren)
const MAGIC_HRAV = Buffer.from('HRAV_V1\0', 'utf-8'); // 8 bayt
const MAGIC_MEREN_V1 = Buffer.from('MEREN_V1', 'utf-8'); // 8 bayt
const MAGIC_MEREN_V2 = Buffer.from('MEREN_V2', 'utf-8'); // 8 bayt

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const HEADER_LENGTH = 8 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH; // 52 bayt

// Dahili Uygulama Anahtarı (Master Secret)
const APP_SECRET = 'MerenStudio#SecureEncryptedFormat@2026!7x9K$qL';

function deriveKey(salt) {
  return crypto.pbkdf2Sync(APP_SECRET, salt, 100000, 32, 'sha256');
}

/**
 * Şifreli .hrav veya .meren dosyasını okur, bütünlüğünü doğrular ve dokümanı çözer.
 * @param {Buffer} fileBuffer - Dosyanın ham ikili verisi
 * @returns {Object} Çözülmüş doküman verisi { version, title, blocks, createdAt, updatedAt, html, css, js, metadata, formatType }
 */
function decryptAndUnpackHrav(fileBuffer) {
  if (!Buffer.isBuffer(fileBuffer)) {
    fileBuffer = Buffer.from(fileBuffer);
  }

  if (fileBuffer.length < HEADER_LENGTH) {
    throw new Error('Dosya boyutu geçersiz veya çok küçük!');
  }

  // 1. Magic Bytes kontrolü (.hrav, .meren v1 ve .meren v2 desteklenir)
  const magic = fileBuffer.subarray(0, 8);
  let formatType = 'hrav';

  if (magic.equals(MAGIC_HRAV)) {
    formatType = 'hrav';
  } else if (magic.equals(MAGIC_MEREN_V1) || magic.equals(MAGIC_MEREN_V2)) {
    formatType = 'meren';
  } else {
    throw new Error('Geçersiz dosya formatı! Bu dosya geçerli bir .hrav veya .meren şifreli dosyası değil.');
  }

  // 2. Başlık bileşenlerini ayrıştır
  let offset = 8;
  const salt = fileBuffer.subarray(offset, offset + SALT_LENGTH);
  offset += SALT_LENGTH;

  const iv = fileBuffer.subarray(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const authTag = fileBuffer.subarray(offset, offset + TAG_LENGTH);
  offset += TAG_LENGTH;

  const ciphertext = fileBuffer.subarray(offset);

  // 3. Anahtar türetme ve AES-256-GCM çözme
  const key = deriveKey(salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const jsonString = decryptedBuffer.toString('utf-8');
    const docData = JSON.parse(jsonString);
    docData.formatType = formatType;
    return docData;
  } catch (err) {
    throw new Error('Dosya şifresi çözülemedi! Dosya bozulmuş veya anahtarı uyuşmuyor.');
  }
}

/**
 * Standart HTML olarak dışa aktarma (Export)
 */
function exportToStandardHtml(documentData) {
  const title = documentData.title || 'Doküman';
  const html = documentData.html || '';
  const css = documentData.css || '';
  const js = documentData.js || '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px 20px;
      color: #1e293b;
      background-color: #f8fafc;
      line-height: 1.6;
    }
    .meren-page-container {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    ${css}
  </style>
</head>
<body>
  <div class="meren-page-container">
    ${html}
  </div>
  <script>
    ${js}
  </script>
</body>
</html>`;
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;')
                     .replace(/"/g, '&quot;');
}

module.exports = {
  decryptAndUnpackHrav,
  exportToStandardHtml,
  MAGIC_HRAV,
  MAGIC_MEREN_V1,
  MAGIC_MEREN_V2
};
