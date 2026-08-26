const fs = require('fs');
const path = require('path');
const { packAndEncryptHrav } = require('../src/merenEngine');

const sampleDoc = {
  version: '2.0',
  title: 'Kişisel Veri Kasası & Günlük',
  blocks: [
    {
      id: 'block_hero',
      componentId: 'hero-vault-header',
      data: {
        title: '💎 Kişisel Kasa & Acil Durum Rehberi',
        subtitle: 'Bu dokümandaki tüm veriler AES-256-GCM ile şifrelenmiştir ve yalnızca Meren Studio ile açılabilir.',
        bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        textColor: '#ffffff',
        padding: '36px',
        borderRadius: '16px',
        shadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
      }
    },
    {
      id: 'block_emergency',
      componentId: 'vault-emergency-instructions',
      data: {
        title: '⚠️ Acil Durum ve Aile Bilgilendirme Notu',
        step1: '1. Bu dosyada yer alan finansal bilgileri aile avukatı ile paylaşın.',
        step2: '2. Evdeki fiziksel evrak kutusunun anahtarı çalışma masasının üst çekmecesindedir.',
        step3: '3. Banka ve sigorta işlemlerini aşağıdaki irtibat numaralarından başlatın.',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        textColor: '#92400e',
        padding: '24px',
        borderRadius: '12px'
      }
    },
    {
      id: 'block_passwords',
      componentId: 'vault-password-card',
      data: {
        accountName: 'Ana E-posta & Bulut Hesabı',
        username: 'meren@guvenlimail.com',
        password: 'KasaGizliSifre2026!#',
        notes: '2FA kurtarma kodları evdeki fiziksel kasadadır.',
        bgColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        shadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
      }
    },
    {
      id: 'block_journal',
      componentId: 'journal-entry-card',
      data: {
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }),
        mood: '⛅ Düşünceli / Odaklanmış',
        title: 'Kişisel Günlük & Gelecek Planları',
        body: 'Bugün tüm kritik verilerimi, hesaplarımı ve acil durum talimatlarımı bu güvenli kasaya aktardım. İleride hatırlamak istediğim kişisel hedeflerim ve notlarım da burada güvende.',
        bgColor: '#ffffff',
        textColor: '#1e293b',
        padding: '28px',
        borderRadius: '14px',
        shadow: '0 8px 20px -4px rgba(0,0,0,0.06)'
      }
    },
    {
      id: 'block_financial',
      componentId: 'vault-financial-card',
      data: {
        bankName: 'Ana Banka Hesabı & Varlıklar',
        accountNumber: 'TR12 0006 1000 0000 1234 5678 90',
        branchOrType: 'Maaş / Yatırım Hesabı',
        additionalAssets: 'Hayat sigortası poliçe no: 987654321',
        bgColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px'
      }
    },
    {
      id: 'block_health',
      componentId: 'vault-health-card',
      data: {
        fullName: 'Meren',
        bloodType: 'A Rh (+)',
        allergies: 'Bilinen alerji yok',
        chronicConditions: 'Düzenli tansiyon ilacı (sabahları 1 doz)',
        emergencyContact: 'Birinci Derece Yakın: 0555 123 45 67',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
        textColor: '#991b1b',
        padding: '20px',
        borderRadius: '12px'
      }
    }
  ],
  html: '',
  css: '',
  js: '',
  metadata: { builder: 'MerenStudio-Vault' }
};

const encrypted = packAndEncryptHrav(sampleDoc);
const targetPath = path.join(__dirname, '..', 'ornek_belge.hrav');
fs.writeFileSync(targetPath, encrypted);

console.log('✓ "ornek_belge.hrav" Kişisel Kasa & Günlük formatında oluşturuldu: ' + targetPath);
console.log('✓ Boyut: ' + encrypted.length + ' bayt');
