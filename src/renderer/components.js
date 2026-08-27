// Meren Studio - Sadeleştirilmiş Bileşen Kütüphanesi

const COMPONENT_CATEGORIES = {
  main: { name: 'Temel Bileşenler', icon: '💎' },
  vault: { name: 'Kasa & Bilgiler', icon: '🔐' },
  layout: { name: 'Düzen & Çizgiler', icon: '🎴' }
};

const COMPONENT_REGISTRY = [
  // 1. BAŞLIK
  {
    id: 'hero-vault-header',
    name: 'Başlık',
    category: 'main',
    icon: '🌟',
    description: 'Dokümanın şık ana başlığı ve alt başlığı',
    defaultData: {
      title: 'Doküman Başlığı',
      subtitle: 'Alt açıklama metni buraya yazılabilir...',
      bgGradient: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      textColor: '#ffffff',
      padding: '32px',
      borderRadius: '14px',
      shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
    }
  },

  // 2. GÜNLÜK
  {
    id: 'journal-entry-card',
    name: 'Günlük',
    category: 'main',
    icon: '📖',
    description: 'Şimdiki zaman tarihli kişisel not ve zengin metinli günlük kartı',
    defaultData: {
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' }),
      title: 'Günlük Başlığı',
      body: 'Günün notlarını ve düşüncelerinizi buraya yazabilirsiniz...',
      bgColor: '#ffffff',
      textColor: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
    }
  },

  // 3. ŞİFRE
  {
    id: 'vault-password-card',
    name: 'Şifre',
    category: 'vault',
    icon: '🔐',
    description: 'Hesap adı, kullanıcı adı, maskeli şifre ve kopyalama kartı',
    defaultData: {
      accountName: 'Hesap / Hizmet Adı',
      username: 'kullanici@ornek.com',
      password: 'GizliSifre123!',
      notes: '',
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
    }
  },

  // 4. BANKA BİLGİLERİ
  {
    id: 'vault-financial-card',
    name: 'Banka Bilgileri',
    category: 'vault',
    icon: '💳',
    description: 'Banka adı, boş IBAN, hesap türü ve not alanı',
    defaultData: {
      bankName: 'Banka Adı',
      accountNumber: '',
      currency: 'TL (₺)',
      branchOrType: '',
      additionalAssets: '',
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px'
    }
  },

  // 5. ŞİFRELİ GÖRSEL / BELGE
  {
    id: 'vault-image-card',
    name: 'Görsel / Belge',
    category: 'vault',
    icon: '🖼️',
    description: 'AES-256 şifreli resim, fatura, poliçe veya taranmış evrak kartı',
    defaultData: {
      caption: 'Belge / Evrak Fotoğrafı',
      imageData: '',
      fit: 'contain',
      maxHeight: 380,
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px'
    }
  },

  // 6. TABLO
  {
    id: 'vault-info-table',
    name: 'Tablo',
    category: 'vault',
    icon: '📊',
    description: 'Varsayılan tek satırlı ve boş dinamik veri tablosu',
    defaultData: {
      title: 'Bilgi Tablosu',
      headers: ['Sütun 1', 'Sütun 2', 'Sütun 3'],
      rows: [
        ['', '', '']
      ],
      bgColor: '#ffffff',
      padding: '16px',
      borderRadius: '10px'
    }
  },

  // 7. AYIRICI ÇİZGİ
  {
    id: 'vault-divider',
    name: 'Ayırıcı Çizgi',
    category: 'layout',
    icon: '➖',
    description: 'Bölümler arasına estetik ayırıcı çizgi ekler',
    defaultData: {
      lineColor: '#e2e8f0',
      margin: '20px'
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPONENT_CATEGORIES, COMPONENT_REGISTRY };
}
