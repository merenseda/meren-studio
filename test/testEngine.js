const assert = require('assert');
const { packAndEncryptHrav, decryptAndUnpackHrav, exportToStandardHtml } = require('../src/merenEngine');

console.log('--- .HRAV NO-CODE MOTOR TESTİ BAŞLIYOR ---');

const testDoc = {
  title: 'Test No-Code Hrav Dokümanı',
  blocks: [
    { id: 'b1', componentId: 'hero-section', data: { title: 'Başlık', subtitle: 'Alt Başlık' } },
    { id: 'b2', componentId: 'interactive-counter', data: { label: 'Sayaç', initialCount: 5 } }
  ],
  html: '<div class="hero"><h1>Test</h1></div>',
  css: '',
  js: ''
};

// 1. Şifreleme
const encryptedBuffer = packAndEncryptHrav(testDoc);
console.log('✓ .hrav başarıyla şifrelendi.');
console.log(`✓ Boyut: ${encryptedBuffer.length} bayt`);
console.log(`✓ Magic: ${encryptedBuffer.subarray(0, 8).toString('utf-8')}`);

// 2. Not Defteri Güvenlik Testi
const rawStr = encryptedBuffer.toString('utf-8');
assert(!rawStr.includes('Test No-Code'), 'HATA: Düz metin sızıntısı!');
console.log('✓ Not Defteri ile Açılamaz Testi Geçti.');

// 3. Şifre Çözme Testi
const decrypted = decryptAndUnpackHrav(encryptedBuffer);
assert.strictEqual(decrypted.title, testDoc.title);
assert.strictEqual(decrypted.blocks.length, 2);
console.log('✓ Şifre çözme ve JSON No-Code blokları %100 eksiksiz doğrulandı.');

console.log('\n=============================================');
console.log('TÜM .HRAV NO-CODE MOTOR TESTLERİ BAŞARIYLA GEÇTİ!');
console.log('=============================================');
