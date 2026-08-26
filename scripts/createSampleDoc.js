const fs = require('fs');
const path = require('path');
const { packAndEncryptHrav } = require('../src/merenEngine');

const sampleDoc = {
  version: '2.0',
  title: 'Meren Studio No-Code Tanıtımı',
  blocks: [
    {
      id: 'block_hero_1',
      componentId: 'hero-section',
      data: {
        title: 'Meren Studio No-Code Görsel Stüdyo',
        subtitle: 'Sıfır kod yazarak harika sayfalar oluşturun, .hrav formatında otomatik AES-256 ile şifreleyin.',
        buttonText: 'Hemen Başla',
        bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        textColor: '#ffffff',
        padding: '36px',
        borderRadius: '16px',
        shadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
      }
    },
    {
      id: 'block_grid_1',
      componentId: 'grid-2-col',
      data: {
        leftTitle: '⚡ No-Code Görsel Deneyim',
        leftText: 'Sol panelden bileşen seçin, tuvalde canlı düzenleyin ve sağ panelden renk ve boşlukları ayarlayın.',
        rightTitle: '🔒 Otomatik .hrav Şifreleme',
        rightText: 'Tüm tasarımlar arka planda donanımsal AES-256-GCM ile güvenle şifrelenir.',
        bgColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        gap: '16px'
      }
    },
    {
      id: 'block_counter_1',
      componentId: 'interactive-counter',
      data: {
        label: 'İnteraktif Buton Sayacı:',
        initialCount: 0,
        btnText: '+ Tıkla & Say',
        btnColor: '#6366f1',
        bgColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px'
      }
    },
    {
      id: 'block_todo_1',
      componentId: 'todo-checklist',
      data: {
        title: 'Yapılacaklar & Özellikler',
        items: [
          { text: 'No-Code bileşenleri tuval üzerinde deneyin', checked: true },
          { text: 'Sağ panelden renkleri ve gölgeleri değiştirin', checked: false },
          { text: 'Setup.exe ile tek tıkla kurulum yapın', checked: false }
        ],
        bgColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px'
      }
    }
  ],
  html: '',
  css: '',
  js: '',
  metadata: { builder: 'MerenStudio-NoCode' }
};

const encrypted = packAndEncryptHrav(sampleDoc);
const targetPath = path.join(__dirname, '..', 'ornek_belge.hrav');
fs.writeFileSync(targetPath, encrypted);

console.log('✓ "ornek_belge.hrav" No-Code formatında başarıyla oluşturuldu: ' + targetPath);
console.log('✓ Boyut: ' + encrypted.length + ' bayt');
