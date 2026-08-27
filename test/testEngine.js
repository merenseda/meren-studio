const assert = require('assert');
const { packAndEncryptHrav, decryptAndUnpackHrav, MAGIC_HRAV, MAGIC_MEREN_V1 } = require('../src/merenEngine');

console.log('--- MEREN & HRAV ÇİFT FORMAT TESTİ BAŞLIYOR ---');

const testDoc = {
  title: 'Test Güvenli Doküman',
  blocks: [
    { id: 'b1', componentId: 'vault-password-card', data: { accountName: 'Banka', username: 'meren', password: 'Secret123!' } },
    { id: 'b2', componentId: 'journal-entry-card', data: { title: 'Günlük', body: 'Gizli notlar...' } }
  ]
};

// 1. .HRAV Testi
const hravBuffer = packAndEncryptHrav(testDoc, MAGIC_HRAV);
const hravDecrypted = decryptAndUnpackHrav(hravBuffer);
assert.strictEqual(hravDecrypted.title, testDoc.title);
assert.strictEqual(hravDecrypted.formatType, 'hrav');
console.log('✓ .hrav şifreleme ve çözme testi BAŞARILI.');

// 2. .MEREN Testi
const merenBuffer = packAndEncryptHrav(testDoc, MAGIC_MEREN_V1);
const merenDecrypted = decryptAndUnpackHrav(merenBuffer);
assert.strictEqual(merenDecrypted.title, testDoc.title);
assert.strictEqual(merenDecrypted.formatType, 'meren');
console.log('✓ .meren (v1/v2) şifreleme ve çözme testi BAŞARILI.');

// 3. Not Defteri ile Açılamazlık Testi
const rawStr = hravBuffer.toString('utf-8');
assert(!rawStr.includes('Secret123!'), 'HATA: Düz metin sızıntısı var!');
console.log('✓ Not Defteri Güvenlik (Şifrelenmişlik) Testi BAŞARILI.');

console.log('\n======================================================');
console.log('TÜM .HRAV VE .MEREN FORMAT TESTLERİ EKSİKSİZ GEÇTİ!');
console.log('======================================================');
