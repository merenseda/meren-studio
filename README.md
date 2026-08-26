# 💎 Meren Studio 2.0 - No-Code Görsel Web Tasarımcısı (`.hrav`)

Meren Studio, sıfır kod yazarak (No-Code) modern, interaktif ve görsel web sayfaları / dokümanları oluşturmanızı sağlayan ve bu dokümanları **`AES-256-GCM`** algoritmasıyla otomatik şifreleyen **`.hrav`** dosya formatı stüdyosudur.

---

## 🌟 Yeni No-Code Özellikleri (v2.0)

- **🎨 Sıfır Kod Zorunluluğu:** Ana ekranda HTML, CSS veya JS yazma ihtiyacı yoktur. Her şey görsel araçlarla düzenlenir.
- **🧩 25+ Zengin Bileşen:**
  - **Düzen:** Hero Alanı, 2/3 Sütunlu Grid, Buzlu Cam (Glassmorphism) Kart, Ayırıcı Çizgi.
  - **Tipografi:** Başlıklar (H1, H2, H3), Paragraflar, Vurgulu Bilgi Kutuları, Etiketler.
  - **İnteraktif Araçlar:** Canlı Sayaç Butonu, Açılır SSS Akordiyonu, İlerleme Çubuğu, Görev Listesi (Todo), Dinamik Veri Tablosu, Çizim Tuvali, Geri Sayım Sayacı.
  - **Medya & Form:** Görseller, KPI İstatistik Kartları, İletişim Formları.
- **✨ Görsel Stil & Özellik Denetçisi (Inspector):** Sağ panelden renkler, gradyanlar, iç/dış boşluklar (padding/margin slider), köşe yuvarlaklığı ve gölgeler fareyle ayarlanır.
- **🔒 Donanımsal AES-256 Şifreleme:** `.hrav` dosyaları kaydedildiğinde otomatik şifrelenir ve harici editörlerle açılamaz.
- **📦 Kurulumcu (Setup.exe) ve Taşınabilir (Portable) Desteği:** Tek tıkla kurulum sihirbazı veya kurulumsuz taşınabilir paket üretilebilir.

---

## 🚀 Geliştirme ve Çalıştırma

### 1. Geliştirme Modunda Başlatma
```bash
npm start
```
veya klasördeki `baslat.bat` dosyasına çift tıklayabilirsiniz.

### 2. Kurulum Paketi (`Setup.exe`) Üretme
```bash
npm run dist:setup
```
Bu komut `dist/` klasörü altına Windows için çift tıklanıp kurulan **`MerenStudio-Setup-2.0.0.exe`** dosyasını üretir. Bu kurulum:
- Uygulamayı bilgisayara kurar.
- Masaüstü ve Başlat Menüsü kısayolları oluşturur.
- `.hrav` dosya uzantısını Windows'a otomatik tanıtır.

### 3. Taşınabilir (Portable) EXE Üretme
```bash
npm run dist:portable
```

---

## 📁 Proje Yapısı

```
meren-studio/
├── src/
│   ├── main.js                  # Electron ana süreç yönetimi
│   ├── preload.js               # Güvenli köprü
│   ├── merenEngine.js           # AES-256-GCM .hrav şifreleme motoru
│   └── renderer/
│       ├── index.html           # 3 panelli stüdyo arayüzü
│       ├── styles.css           # Modern dark glassmorphic stiller
│       ├── components.js        # Zengin bileşen kütüphanesi
│       ├── noCodeEngine.js      # Görsel tuval ve blok yöneticisi
│       ├── inspector.js         # Sağ stil & özellik denetçisi
│       └── app.js               # Ana uygulama kontrolcüsü
├── scripts/
│   └── createSampleDoc.js       # Örnek No-Code .hrav üretici
├── baslat.bat                   # Hızlı başlatıcı
├── git_push.bat                 # GitHub senkronizasyonu
├── ornek_belge.hrav             # Örnek No-Code şifreli doküman
└── package.json                 # Bağımlılıklar ve Setup.exe ayarları
```
