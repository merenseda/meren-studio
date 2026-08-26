// Meren Studio - Zengin No-Code Bileşen Kütüphanesi

const COMPONENT_CATEGORIES = {
  layout: { name: 'Düzen & Konteyner', icon: '📂' },
  typography: { name: 'Tipografi & Metin', icon: '📝' },
  interactive: { name: 'İnteraktif Araçlar', icon: '⚡' },
  media: { name: 'Medya & Form', icon: '🖼️' }
};

const COMPONENT_REGISTRY = [
  // --- 1. DÜZEN VE KONTEYNERLAR ---
  {
    id: 'hero-section',
    name: 'Hero Başlık Alanı',
    category: 'layout',
    icon: '🌟',
    description: 'Etkileyici karşılama ve vurgu alanı',
    defaultData: {
      title: 'Harika Bir Fikirle Başlayın',
      subtitle: 'Bu sayfa Meren Studio No-Code görsel stüdyosu ile tasarlandı ve .hrav formatında şifrelendi.',
      buttonText: 'Hemen Keşfet',
      bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      textColor: '#ffffff',
      padding: '40px',
      borderRadius: '16px',
      shadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
    }
  },
  {
    id: 'card-box',
    name: 'Modern Kart Kutusu',
    category: 'layout',
    icon: '🎴',
    description: 'İçeriklerinizi toplayan şık kart',
    defaultData: {
      title: 'Özellik Başlığı',
      text: 'Bileşeninizi görsel stil panelinden dilediğiniz gibi özelleştirebilirsiniz.',
      bgColor: '#ffffff',
      textColor: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      borderWidth: '1px',
      borderColor: '#e2e8f0'
    }
  },
  {
    id: 'glass-card',
    name: 'Buzlu Cam (Glass) Kart',
    category: 'layout',
    icon: '🧊',
    description: 'Şeffaf parıltılı modern cam efekti',
    defaultData: {
      title: 'Buzlu Cam Efekti',
      text: 'Modern arayüzler için ultra şık saydam arka planlı kart.',
      bgColor: 'rgba(255, 255, 255, 0.75)',
      textColor: '#0f172a',
      padding: '28px',
      borderRadius: '16px',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      borderWidth: '1px',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      backdropBlur: '12px'
    }
  },
  {
    id: 'grid-2-col',
    name: '2 Sütunlu Yan Yana Düzen',
    category: 'layout',
    icon: '▥',
    description: 'İki içeriği eşit sütunlara böler',
    defaultData: {
      leftTitle: 'Sol Sütun Başlığı',
      leftText: 'Sol sütun içeriğini buraya yazabilirsiniz.',
      rightTitle: 'Sağ Sütun Başlığı',
      rightText: 'Sağ sütun içeriğini buraya yazabilirsiniz.',
      bgColor: '#f8fafc',
      padding: '20px',
      borderRadius: '12px',
      gap: '16px'
    }
  },
  {
    id: 'grid-3-col',
    name: '3 Sütunlu Kart Dizilimi',
    category: 'layout',
    icon: '▤',
    description: 'Üçlü özellik veya istatistik dizilimi',
    defaultData: {
      col1Title: 'Özellik 1',
      col1Text: 'Hızlı ve kolay no-code düzenleme.',
      col2Title: 'Özellik 2',
      col2Text: 'Otomatik AES-256 şifreleme.',
      col3Title: 'Özellik 3',
      col3Text: 'Tek tıkla bağımsız dağıtım.',
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      gap: '14px'
    }
  },
  {
    id: 'divider-line',
    name: 'Şık Bölücü Çizgi',
    category: 'layout',
    icon: '➖',
    description: 'Bölümler arasına estetik çizgi ekler',
    defaultData: {
      lineColor: '#cbd5e1',
      lineWidth: '1px',
      margin: '24px'
    }
  },

  // --- 2. TİPOGRAFİ VE METİN ---
  {
    id: 'heading-main',
    name: 'Büyük Başlık (H1)',
    category: 'typography',
    icon: '🏷️',
    description: 'Ana sayfa ve bölüm başlığı',
    defaultData: {
      text: 'Meren Studio ile Tasarlandı',
      fontSize: '32px',
      fontWeight: '700',
      textColor: '#0f172a',
      textAlign: 'left',
      margin: '12px'
    }
  },
  {
    id: 'heading-sub',
    name: 'Orta Başlık (H2 / H3)',
    category: 'typography',
    icon: '🔖',
    description: 'Alt başlıklar ve grup isimleri',
    defaultData: {
      text: 'Görsel Tasarım & Güvenlik',
      fontSize: '22px',
      fontWeight: '600',
      textColor: '#334155',
      textAlign: 'left',
      margin: '10px'
    }
  },
  {
    id: 'paragraph-text',
    name: 'Zengin Paragraf Metni',
    category: 'typography',
    icon: '📄',
    description: 'Açıklama ve gövde metinleri',
    defaultData: {
      text: 'Bu paragraf metnini doğrudan tıklayarak düzenleyebilir, sağ panelden yazı boyutunu, rengini ve aralıklarını kolayca değiştirebilirsiniz.',
      fontSize: '16px',
      textColor: '#475569',
      lineHeight: '1.7',
      textAlign: 'left',
      margin: '8px'
    }
  },
  {
    id: 'callout-alert',
    name: 'Vurgulu Bilgi Kutusu',
    category: 'typography',
    icon: '💡',
    description: 'Önemli duyuru veya ipucu kutusu',
    defaultData: {
      type: 'info', // info, success, warning, danger
      title: 'Önemli İpucu',
      text: 'Bu doküman .hrav formatı ile donanımsal AES-256 ile korunmaktadır.',
      bgColor: '#eff6ff',
      borderColor: '#3b82f6',
      textColor: '#1e40af',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'badge-tag',
    name: 'Durum Etiketi (Badge)',
    category: 'typography',
    icon: '🏷️',
    description: 'Küçük vurgulayıcı hap etiket',
    defaultData: {
      text: '✨ Yeni Özellik',
      bgColor: '#ede9fe',
      textColor: '#6d28d9',
      fontSize: '13px',
      padding: '4px 12px',
      borderRadius: '20px'
    }
  },

  // --- 3. İNTERAKTİF ARAÇLAR ---
  {
    id: 'interactive-counter',
    name: 'Canlı Sayaç Butonu',
    category: 'interactive',
    icon: '⚡',
    description: 'Tıklandıkça artan dinamik sayaç',
    defaultData: {
      label: 'Tıkla ve Say:',
      initialCount: 0,
      btnText: '+ Artır',
      btnColor: '#6366f1',
      bgColor: '#f8fafc',
      padding: '20px',
      borderRadius: '12px'
    }
  },
  {
    id: 'accordion-faq',
    name: 'Açılır SSS Akordiyonu',
    category: 'interactive',
    icon: '📂',
    description: 'Tıklanınca genişleyen soru-cevap kutusu',
    defaultData: {
      question: '.hrav dosya formatı nedir?',
      answer: '.hrav, Meren Studio tarafından oluşturulan ve AES-256-GCM ile otomatik şifrelenen özel güvenli doküman uzantısıdır.',
      bgColor: '#ffffff',
      headerBg: '#f1f5f9',
      textColor: '#1e293b',
      borderRadius: '8px'
    }
  },
  {
    id: 'progress-bar',
    name: 'İlerleme Çubuğu',
    category: 'interactive',
    icon: '📈',
    description: 'Yüzde oranını gösteren animasyonlu bar',
    defaultData: {
      label: 'Proje Tamamlanma Oranı',
      percent: 75,
      barColor: 'linear-gradient(90deg, #6366f1, #10b981)',
      trackColor: '#e2e8f0',
      textColor: '#334155',
      height: '14px',
      borderRadius: '8px'
    }
  },
  {
    id: 'todo-checklist',
    name: 'İnteraktif Görev Listesi',
    category: 'interactive',
    icon: '✅',
    description: 'İşaretlenebilir canlı yapılacaklar listesi',
    defaultData: {
      title: 'Bugünün Görevleri',
      items: [
        { text: 'Görsel tasarımı tamamla', checked: true },
        { text: 'İnteraktif bileşenleri test et', checked: false },
        { text: '.hrav olarak şifreli kaydet', checked: false }
      ],
      bgColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px'
    }
  },
  {
    id: 'searchable-table',
    name: 'Dinamik Veri Tablosu',
    category: 'interactive',
    icon: '📊',
    description: 'İçinde anlık arama yapılabilen tablo',
    defaultData: {
      title: 'Kullanıcı & Veri Tablosu',
      headers: ['Ad / Başlık', 'Kategori', 'Durum'],
      rows: [
        ['Meren Studio', 'Uygulama', 'Aktif'],
        ['Hrav Formatı', 'Şifreleme', 'Güvenli'],
        ['No-Code Engine', 'Tasarım', 'Hazır']
      ],
      bgColor: '#ffffff',
      headerBg: '#f8fafc',
      padding: '16px',
      borderRadius: '10px'
    }
  },
  {
    id: 'drawing-canvas',
    name: 'HTML5 Çizim Tuvali',
    category: 'interactive',
    icon: '🎨',
    description: 'Kullanıcının fareyle çizim yapabileceği alan',
    defaultData: {
      title: 'İmza & Çizim Alanı',
      strokeColor: '#6366f1',
      bgColor: '#ffffff',
      canvasHeight: 180,
      borderRadius: '8px'
    }
  },
  {
    id: 'countdown-timer',
    name: 'Geri Sayım Sayacı',
    category: 'interactive',
    icon: '⏱️',
    description: 'Belirlenen süreye canlı geri sayım',
    defaultData: {
      title: 'Lansmana Kalan Süre',
      minutes: 15,
      seconds: 0,
      bgColor: '#1e1b4b',
      textColor: '#ffffff',
      padding: '20px',
      borderRadius: '12px'
    }
  },

  // --- 4. MEDYA VE FORM ---
  {
    id: 'image-card',
    name: 'Görsel Kartı',
    category: 'media',
    icon: '🖼️',
    description: 'Bağlantı veya yerel görsel kutusu',
    defaultData: {
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      caption: 'Soyut Sanat & Modern Tasarım',
      borderRadius: '12px',
      shadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
  },
  {
    id: 'kpi-stat-card',
    name: 'İstatistik & Metrik Kartı',
    category: 'media',
    icon: '📊',
    description: 'Büyük rakamlı gösterge kartı',
    defaultData: {
      metric: '%99.9',
      label: 'Güvenlik & Uptime Oranı',
      change: '+14% bu ay',
      isPositive: true,
      bgColor: '#ffffff',
      textColor: '#0f172a',
      padding: '24px',
      borderRadius: '12px'
    }
  },
  {
    id: 'contact-form-widget',
    name: 'Hızlı İletişim Formu',
    category: 'media',
    icon: '✉️',
    description: 'Etkileşimli geri bildirim ve mesaj formu',
    defaultData: {
      title: 'Bize Ulaşın',
      buttonText: 'Mesaj Gönder',
      bgColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px'
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPONENT_CATEGORIES, COMPONENT_REGISTRY };
}
