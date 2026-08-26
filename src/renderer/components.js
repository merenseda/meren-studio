// Meren Studio - Acil Durum Kasası & Şifreli Günlük Bileşen Kütüphanesi

const COMPONENT_CATEGORIES = {
  vault: { name: 'Acil Durum & Kasa', icon: '🛡️' },
  journal: { name: 'Günlük & Kişisel Not', icon: '📖' },
  layout: { name: 'Düzen & Kartlar', icon: '🎴' },
  tools: { name: 'Güvenli Araçlar', icon: '⚡' }
};

const COMPONENT_REGISTRY = [
  // --- 1. ACİL DURUM VE KASA BİLEŞENLERİ ---
  {
    id: 'vault-password-card',
    name: 'Şifre & Hesap Kasası',
    category: 'vault',
    icon: '🔐',
    description: 'Kopyalanabilir, maskeli şifre ve rastgele şifre üreticili kasa kartı',
    defaultData: {
      accountName: 'Ana E-posta / Banka Hesabı',
      username: 'kullanici@ornek.com',
      password: 'CokGucluSifre2026!*',
      notes: '2FA kurtarma kodları evdeki kasadadır.',
      bgColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
    }
  },
  {
    id: 'vault-emergency-instructions',
    name: 'Acil Durum Talimatları',
    category: 'vault',
    icon: '📜',
    description: 'Dinamik adımlı "Bana bir şey olursa..." rehber ve yönergesi',
    defaultData: {
      title: '⚠️ Acil Durum ve Aile Bilgilendirme Notu',
      urgency: 'Yüksek Öncelik',
      steps: [
        '1. Bu dosyada yer alan finansal bilgileri aile avukatı ile paylaşın.',
        '2. Evdeki fiziksel evrak kutusunun anahtarı çalışma masasının üst çekmecesindedir.',
        '3. Banka ve sigorta işlemlerini aşağıdaki irtibat numaralarından başlatın.'
      ],
      bgColor: '#fffbeb',
      borderColor: '#f59e0b',
      textColor: '#92400e',
      padding: '24px',
      borderRadius: '12px'
    }
  },
  {
    id: 'vault-financial-card',
    name: 'Finans & Varlık Kaydı',
    category: 'vault',
    icon: '💳',
    description: 'Banka, IBAN kopyalama, para birimi ve varlık özetleri',
    defaultData: {
      bankName: 'Ana Banka Hesabı & Varlıklar',
      accountNumber: 'TR12 0006 1000 0000 1234 5678 90',
      currency: 'TL (₺)',
      branchOrType: 'Maaş / Yatırım Hesabı',
      additionalAssets: 'Hayat sigortası poliçe no: 987654321',
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px'
    }
  },
  {
    id: 'vault-health-card',
    name: 'Sağlık & Acil İrtibat Kartı',
    category: 'vault',
    icon: '🏥',
    description: 'Kan grubu seçicisi, kronik bilgiler ve acil arama/kopyalama',
    defaultData: {
      fullName: 'Meren',
      bloodType: 'A Rh (+)',
      allergies: 'Bilinen alerji yok',
      chronicConditions: 'Düzenli tansiyon ilacı (sabahları 1 doz)',
      emergencyContact: '0555 123 45 67 (Birinci Derece Yakın)',
      hospital: 'En Yakın Şehir Hastanesi',
      bgColor: '#fef2f2',
      borderColor: '#ef4444',
      textColor: '#991b1b',
      padding: '20px',
      borderRadius: '12px'
    }
  },

  // --- 2. GÜNLÜK VE KİŞİSEL NOTLAR ---
  {
    id: 'journal-entry-card',
    name: 'Tarihli Günlük Girdisi',
    category: 'journal',
    icon: '📖',
    description: 'Canlı tarih güncelleyici, ruh hali çipleri ve kelime sayacı',
    defaultData: {
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }),
      mood: '⛅ Düşünceli',
      title: 'Günün Notları & Düşünceler',
      body: 'Bugün tüm kritik bilgilerimi ve hedeflerimi bu güvenli kasada güncelledim. AES-256 şifrelemesi sayesinde her şey güvende.',
      bgColor: '#ffffff',
      textColor: '#1e293b',
      padding: '28px',
      borderRadius: '14px',
      shadow: '0 8px 20px -4px rgba(0,0,0,0.06)'
    }
  },
  {
    id: 'secret-note-card',
    name: 'Gizli Kişisel Not & Düşünce',
    category: 'journal',
    icon: '💭',
    description: 'Buzlu perde (Blur) korumalı, tıklandığında açılan gizli not',
    defaultData: {
      tag: '🔒 Çok Gizli',
      note: 'Gelecekte hatırlamak istediğim kişisel manifesto ve kararlarım buraya not edilmiştir.',
      isBlurred: true,
      bgColor: '#f8fafc',
      textColor: '#334155',
      padding: '22px',
      borderRadius: '12px'
    }
  },
  {
    id: 'quick-idea-card',
    name: 'Hızlı Fikir Kapsülü',
    category: 'journal',
    icon: '💡',
    description: 'Öncelik etiketli ve tamamlandı işaretli hızlı fikir kartı',
    defaultData: {
      title: '💡 Harika Bir Proje Fikri',
      description: 'Zaman kaybetmeden uygulamak istediğim yeni konsept ve detaylar.',
      priority: '⭐ Önemli',
      isCompleted: false,
      bgColor: '#ede9fe',
      textColor: '#5b21b6',
      padding: '20px',
      borderRadius: '12px'
    }
  },

  // --- 3. DÜZEN VE KARTLAR ---
  {
    id: 'hero-vault-header',
    name: 'Kasa / Günlük Ana Başlığı',
    category: 'layout',
    icon: '🌟',
    description: 'Dokümanın şık karşılama başlığı',
    defaultData: {
      title: '💎 Kişisel Kasa & Günlük',
      subtitle: 'Bu dokümandaki tüm bilgiler AES-256-GCM ile güvenle şifrelenmiştir.',
      bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      textColor: '#ffffff',
      padding: '36px',
      borderRadius: '16px',
      shadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
    }
  },
  {
    id: 'glass-vault-card',
    name: 'Buzlu Cam Kart',
    category: 'layout',
    icon: '🧊',
    description: 'Saydam ve estetik not kutusu',
    defaultData: {
      title: 'Önemli Hatırlatma',
      text: 'Kritik evrakların fiziksel kopyaları çalışma odasındaki kilitli dolaptadır.',
      bgColor: 'rgba(255, 255, 255, 0.85)',
      textColor: '#0f172a',
      padding: '24px',
      borderRadius: '14px',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)'
    }
  },
  {
    id: 'vault-divider',
    name: 'Ayırıcı Çizgi',
    category: 'layout',
    icon: '➖',
    description: 'Bölümleri estetik şekilde ayırır',
    defaultData: {
      lineColor: '#e2e8f0',
      margin: '20px'
    }
  },

  // --- 4. GÜVENLİ ARAÇLAR ---
  {
    id: 'vault-todo-list',
    name: 'Acil Durum & Hedef Kontrol Listesi',
    category: 'tools',
    icon: '✅',
    description: 'Dinamik madde ekleme/silme, kalıcı kayıt ve canlı ilerleme çubuğu',
    defaultData: {
      title: 'Yapılacaklar & Kontrol Listesi',
      items: [
        { text: 'Yıllık banka şifrelerini ve kurtarma kodlarını güncelle', checked: true },
        { text: 'Fiziksel evrakların yedeklerini kontrol et', checked: false },
        { text: 'Güvenli dijital kasayı .hrav olarak kaydet', checked: false }
      ],
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px'
    }
  },
  {
    id: 'vault-info-table',
    name: 'Kritik Bilgi Tablosu',
    category: 'tools',
    icon: '📊',
    description: 'Canlı filtreleme, satır ekleme/silme özellikli dinamik veri tablosu',
    defaultData: {
      title: 'Kurum ve Hesap Bilgileri',
      headers: ['Kurum / Hizmet', 'Kullanıcı / No', 'Detay'],
      rows: [
        ['E-Devlet', 'TC Kimlik No', '2FA SMS ile bağlı'],
        ['Kripto Donanım Cüzdanı', 'Ledger Nano', 'Kurtarma kelimeleri kasada'],
        ['Bireysel Emeklilik (BES)', 'Poliçe No: 441029', 'Vefat tazminatı mevcut']
      ],
      bgColor: '#ffffff',
      padding: '16px',
      borderRadius: '10px'
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPONENT_CATEGORIES, COMPONENT_REGISTRY };
}
