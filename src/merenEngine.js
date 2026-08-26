const crypto = require('crypto');

// Özel Hrav Dosya İmzası ve Sabitleri
const MAGIC_BYTES = Buffer.from('HRAV_V1\0', 'utf-8'); // 8 bayt
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const HEADER_LENGTH = MAGIC_BYTES.length + SALT_LENGTH + IV_LENGTH + TAG_LENGTH; // 52 bayt

// Dahili Uygulama Anahtarı (Master Secret)
const APP_SECRET = 'MerenStudio#SecureEncryptedFormat@2026!7x9K$qL';

/**
 * Tuz (Salt) ve Uygulama Anahtarından AES-256 anahtarı türetir (PBKDF2)
 */
function deriveKey(salt) {
  return crypto.pbkdf2Sync(APP_SECRET, salt, 100000, 32, 'sha256');
}

/**
 * Verilen Hrav doküman verisini şifreleyip .hrav ikili (binary) Buffer'ı oluşturur.
 * @param {Object} documentData - { title, html, css, js, metadata }
 * @returns {Buffer} Şifrelenmiş .hrav dosya içeriği
 */
function packAndEncryptHrav(documentData) {
  const payload = {
    version: '1.0',
    title: documentData.title || 'Yeni Hrav Dokümanı',
    createdAt: documentData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    html: documentData.html || '',
    css: documentData.css || '',
    js: documentData.js || '',
    metadata: documentData.metadata || {}
  };

  const jsonString = JSON.stringify(payload);
  const plaintextBuffer = Buffer.from(jsonString, 'utf-8');

  // Kriptografik rastgele tuz ve IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Dosya Başlığı: MAGIC (8) + SALT (16) + IV (12) + TAG (16) + CIPHERTEXT
  return Buffer.concat([
    MAGIC_BYTES,
    salt,
    iv,
    authTag,
    ciphertext
  ]);
}

/**
 * Şifreli .hrav dosyasını okur, bütünlüğünü doğrular ve JSON dokümanını çözer.
 * @param {Buffer} fileBuffer - .hrav dosyasının ham ikili verisi
 * @returns {Object} Çözülmüş doküman verisi { version, title, createdAt, updatedAt, html, css, js, metadata }
 */
function decryptAndUnpackHrav(fileBuffer) {
  if (!Buffer.isBuffer(fileBuffer)) {
    fileBuffer = Buffer.from(fileBuffer);
  }

  if (fileBuffer.length < HEADER_LENGTH) {
    throw new Error('Dosya boyutu geçersiz veya çok küçük!');
  }

  // 1. Magic Bytes kontrolü
  const magic = fileBuffer.subarray(0, MAGIC_BYTES.length);
  if (!magic.equals(MAGIC_BYTES)) {
    throw new Error('Geçersiz dosya formatı! Bu dosya bir .hrav dosyası değil.');
  }

  // 2. Başlık bileşenlerini ayrıştır
  let offset = MAGIC_BYTES.length;
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
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Dosya şifresi çözülemedi! Dosya bozulmuş veya yetkisiz olarak değiştirilmiş olabilir.');
  }
}

/**
 * Hrav dokümanını tek parça standart HTML çıktısına dönüştürür (Export için).
 */
function exportToStandardHtml(documentData) {
  const title = documentData.title || 'Hrav Dokümanı';
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
      padding: 24px;
      color: #24292f;
      background-color: #ffffff;
      line-height: 1.6;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
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
  packAndEncryptHrav,
  decryptAndUnpackHrav,
  exportToStandardHtml,
  MAGIC_BYTES
};
