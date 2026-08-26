# 💎 Meren Studio (`.meren` Format)

Meren Studio, tamamen özel **`.meren`** dosya uzantısını oluşturan, otomatik olarak `AES-256-GCM` ile şifreleyen ve içerisinde tam HTML5/CSS3/JavaScript motoru çalıştıran modern bir masaüstü geliştirme ve görüntüleme ortamıdır.

---

## 🌟 Temel Özellikler

- **🔒 Otomatik AES-256-GCM Şifreleme:** Dosyalar kaydedilirken arka planda otomatik şifrelenir. Dışarıdan Not Defteri ile açıldığında içerik görünmez.
- **🛡️ Kriptografik Bütünlük (Auth Tag):** Dosya yetkisiz olarak değiştirilirse veya bozulursa uygulama tarafından algılanır.
- **🌐 Tam Web Teknolojisi Desteği:** HTML5, modern CSS3 animasyonları ve JavaScript scriptleri sorunsuz çalışır.
- **⚡ Çoklu Görünüm Modları:**
  - **Bölünmüş Görünüm (Split View):** Kod editörü ve canlı önizleme yan yana.
  - **Görsel Editör (WYSIWYG):** Zengin metin düzenleme modu.
  - **Canlı Önizleme:** Tam ekran interaktif mod.
- **📦 Taşınabilirlik (Portable):** Herhangi bir Windows bilgisayarda kurulum gerektirmeden çalışır.
- **📤 HTML Export:** `.meren` dosyalarını dilediğiniz an standart `.html` olarak dışa aktarabilirsiniz.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js (v18+)

### Kurulum
```bash
npm install
```

### Uygulamayı Başlatma
```bash
npm start
```
veya doğrudan `baslat.bat` dosyasına çift tıklayabilirsiniz.

### Bağımsız Portable EXE Üretme
```bash
npm run pack
# veya tek dosya portable paket:
npm run dist
```

---

## 📁 Proje Yapısı

```
meren-studio/
├── src/
│   ├── main.js             # Electron ana süreç yönetimi & IPC
│   ├── preload.js          # Güvenli contextBridge köprüsü
│   ├── merenEngine.js      # AES-256-GCM şifreleme/çözme motoru
│   └── renderer/
│       ├── index.html      # Ana arayüz
│       ├── styles.css      # Modern dark tema ve stiller
│       └── app.js          # Arayüz ve etkileşim mantığı
├── scripts/
│   └── createSampleDoc.js  # Örnek .meren dosyası üretici
├── test/
│   └── testEngine.js       # Şifreleme ve bütünlük testleri
├── baslat.bat              # Tek tıkla başlatıcı
├── meren_kayit.bat         # Windows dosya ilişkilendirme
├── ornek_belge.meren       # Örnek şifreli Meren dokümanı
└── package.json
```

---

## 📄 Lisans
Bu proje özel kullanım için geliştirilmiştir.
