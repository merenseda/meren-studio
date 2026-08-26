const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { packAndEncryptMeren, decryptAndUnpackMeren, exportToStandardHtml } = require('../src/merenEngine');

console.log('--- MEREN MOTORU TESTİ BAŞLIYOR ---');

const testDoc = {
  title: 'Benim İlk .meren Dosyam',
  html: '<div class="card"><h1>Merhaba Dünya!</h1><button id="btn">Tıkla</button><p id="out"></p></div>',
  css: '.card { padding: 20px; background: #f0f4f8; border-radius: 12px; } button { background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }',
  js: 'document.getElementById("btn").addEventListener("click", () => { document.getElementById("out").innerText = "Meren ile interaktif HTML çalışıyor!"; });',
  metadata: { author: 'Meren', tags: ['özel', 'şifreli', 'html'] }
};

// 1. Şifreleme Testi
const encryptedBuffer = packAndEncryptMeren(testDoc);
console.log('✓ Dosya başarıyla şifrelendi.');
console.log(`✓ Şifreli dosya boyutu: ${encryptedBuffer.length} bayt`);
console.log(`✓ Sihirli Başlık (Magic): ${encryptedBuffer.subarray(0, 9).toString('utf-8')}`);

// 2. Not Defteri Simülasyonu (İçinde düz metin var mı?)
const rawString = encryptedBuffer.toString('utf-8');
assert(!rawString.includes('Merhaba Dünya'), 'HATA: Şifrelenmiş dosyada düz metin sızıntısı var!');
assert(!rawString.includes('addEventListener'), 'HATA: JavaScript kodu açıkta!');
console.log('✓ Not Defteri Güvenlik Testi Geçti: Dosya tamamen anlamsız şifreli baytlar içeriyor.');

// 3. Şifre Çözme Testi
const decrypted = decryptAndUnpackMeren(encryptedBuffer);
assert.strictEqual(decrypted.title, testDoc.title);
assert.strictEqual(decrypted.html, testDoc.html);
assert.strictEqual(decrypted.css, testDoc.css);
assert.strictEqual(decrypted.js, testDoc.js);
console.log('✓ Şifre çözme başarılı! Veriler %100 eksiksiz geri yüklendi.');

// 4. Tahrifat & Bozulma Testi (Tamper / Integrity Check)
const tamperedBuffer = Buffer.from(encryptedBuffer);
tamperedBuffer[tamperedBuffer.length - 5] ^= 0xFF; // 1 baytı boz

let caughtTamper = false;
try {
  decryptAndUnpackMeren(tamperedBuffer);
} catch (e) {
  caughtTamper = true;
  console.log(`✓ Tahrifat / Bütünlük koruma testi geçti: "${e.message}"`);
}
assert(caughtTamper, 'HATA: Bozulmuş dosya algılanamadı!');

// 5. HTML Export Testi
const htmlExport = exportToStandardHtml(decrypted);
assert(htmlExport.includes('<!DOCTYPE html>'));
assert(htmlExport.includes('Merhaba Dünya!'));
console.log('✓ Standart HTML Export testi başarılı.');

console.log('\n=====================================');
console.log('TÜM .MEREN MOTOR TESTLERİ BAŞARIYLA GEÇTİ!');
console.log('=====================================');
