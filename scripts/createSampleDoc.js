const fs = require('fs');
const path = require('path');
const { packAndEncryptMeren } = require('../src/merenEngine');

const sampleDoc = {
  title: 'Örnek Meren Tasarımı ve İnteraktif Uygulama',
  html: `<div class="meren-container">
  <div class="header-card">
    <div class="tag">🔒 AES-256 Şifreli .meren Formatı</div>
    <h1>Özel .meren Dosya Formatı</h1>
    <p class="subtitle">Bu belge Not Defteri ile açılamaz, yalnızca Meren Studio ile okunur ve düzenlenir.</p>
  </div>

  <div class="grid-2">
    <div class="widget-card">
      <h3>⚡ JavaScript İnteraktif Sayacı</h3>
      <p>Aşağıdaki butona basarak canlı script motorunu test edin:</p>
      <div class="counter-box">
        <button id="demoPlusBtn" class="btn btn-primary">+ Artır</button>
        <button id="demoResetBtn" class="btn btn-outline">Sıfırla</button>
        <span class="badge-count" id="demoCounterVal">0</span>
      </div>
      <div id="counterMsg" class="msg-box">Sayaç henüz çalıştırılmadı.</div>
    </div>

    <div class="widget-card">
      <h3>🎨 Canlı Renk Seçici & Kutu</h3>
      <p>Kutunun rengini dinamik olarak değiştirin:</p>
      <div class="color-picker-row">
        <input type="color" id="boxColorPicker" value="#6366f1">
        <span>Renk Değiştir</span>
      </div>
      <div id="dynamicBox" class="color-box">Bu kutu JavaScript ile anında renk değiştirir.</div>
    </div>
  </div>

  <div class="widget-card" style="margin-top: 20px;">
    <h3>📊 Dinamik Veri Tablosu</h3>
    <table class="meren-table">
      <thead>
        <tr>
          <th>Özellik</th>
          <th>Standart .html</th>
          <th>Özel .meren Formatı</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Güvenlik & Şifreleme</strong></td>
          <td>❌ Düz Metin (Herkes Açabilir)</td>
          <td>✅ <strong>AES-256-GCM Otomatik Şifreli</strong></td>
        </tr>
        <tr>
          <td><strong>Yetkisiz Değişiklik Korunması</strong></td>
          <td>❌ Yok</td>
          <td>✅ <strong>Kriptografik Bütünlük Doğrulaması</strong></td>
        </tr>
        <tr>
          <td><strong>HTML/CSS/JS Desteği</strong></td>
          <td>✅ Var</td>
          <td>✅ <strong>Tam Destek (Animasyon, Script, Medya)</strong></td>
        </tr>
        <tr>
          <td><strong>Taşınabilirlik</strong></td>
          <td>✅ Var</td>
          <td>✅ <strong>Her Bilgisayarda Çalışır (Portable)</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`,
  css: `.meren-container {
  max-width: 860px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #1e293b;
  padding: 10px;
}

.header-card {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  color: #ffffff;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.3);
}

.header-card .tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  color: #c7d2fe;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
  backdrop-filter: blur(4px);
}

.header-card h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #ffffff;
}

.header-card .subtitle {
  color: #cbd5e1;
  font-size: 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.widget-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.widget-card h3 {
  font-size: 1.15rem;
  color: #0f172a;
  margin-bottom: 8px;
}

.widget-card p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.counter-box, .color-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}
.btn-primary:hover { background: #4338ca; }

.btn-outline {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}
.btn-outline:hover { background: #e2e8f0; }

.badge-count {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4f46e5;
  background: #eef2ff;
  padding: 4px 14px;
  border-radius: 8px;
}

.msg-box {
  background: #f8fafc;
  border-left: 3px solid #4f46e5;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #475569;
  border-radius: 4px;
}

.color-box {
  margin-top: 10px;
  padding: 16px;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  transition: background 0.3s;
}

.meren-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.meren-table th, .meren-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.meren-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

.meren-table tr:hover td {
  background: #f8fafc;
}`,
  js: `let count = 0;
const plusBtn = document.getElementById('demoPlusBtn');
const resetBtn = document.getElementById('demoResetBtn');
const counterVal = document.getElementById('demoCounterVal');
const counterMsg = document.getElementById('counterMsg');
const colorPicker = document.getElementById('boxColorPicker');
const dynamicBox = document.getElementById('dynamicBox');

if (plusBtn) {
  plusBtn.addEventListener('click', () => {
    count++;
    counterVal.textContent = count;
    counterMsg.textContent = 'Sayaç güncellendi: ' + count;
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    count = 0;
    counterVal.textContent = count;
    counterMsg.textContent = 'Sayaç sıfırlandı.';
  });
}

if (colorPicker && dynamicBox) {
  colorPicker.addEventListener('input', (e) => {
    dynamicBox.style.backgroundColor = e.target.value;
  });
}`
};

const encrypted = packAndEncryptMeren(sampleDoc);
const targetPath = path.join(__dirname, '..', 'ornek_belge.meren');
fs.writeFileSync(targetPath, encrypted);

console.log('✓ "ornek_belge.meren" başarıyla oluşturuldu: ' + targetPath);
console.log('✓ Boyut: ' + encrypted.length + ' bayt');
