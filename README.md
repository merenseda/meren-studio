# 💎 Meren Suite - Studio & Viewer

Meren Suite, kişisel verilerinizi, şifrelerinizi, acil durum talimatlarınızı ve günlük notlarınızı **`AES-256-GCM`** algoritmasıyla şifreleyen ve 2 ayrı bağımsız programdan oluşan bir ekosistemdir.

---

## 📦 İki Ana Program (Dallar)

```
                       ┌────────────────────────────────────────┐
                       │           MEREN SUITE (.hrav & .meren) │
                       └───────────────────┬────────────────────┘
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
 ┌───────────────────────────────────┐               ┌───────────────────────────────────┐
 │ 💎 MEREN STUDIO                   │               │ 👁️ MEREN VIEWER                   │
 │ (No-Code Görsel Düzenleyici)      │               │ (Salt Okunur Görüntüleyici)       │
 ├───────────────────────────────────┤               ├───────────────────────────────────┤
 │ • Şifreli Kasa & Günlük Tasarımı  │               │ • Sıfır Düzenleme / Değişiklik    │
 │ • Zengin Bileşen Kütüphanesi      │               │ • %100 Güvenli Salt Okunur Mod    │
 │ • Görsel Stil ve Renk Denetçisi   │               │ • .hrav ve .meren Şifre Çözme     │
 │ • Korumalı Görünüm Şeridi         │               │ • Dokümanda Arama & Yakınlaştırma │
 │ • Rastgele 16 Haneli Şifre Üretici│               │ • Maskeli Şifre / IBAN Kopyalama  │
 │ • .hrav ve .meren Kaydetme/Düzenle│               │ • Yazdır / PDF Export Desteği     │
 └───────────────────────────────────┘               └───────────────────────────────────┘
```

---

## 🚀 Hızlı Başlatma (Geliştirme & Test)

1. **Meren Studio (Editör):**
   * Klasördeki **`baslat.bat`** dosyasına çift tıklayın veya `npm start` çalıştırın.

2. **Meren Viewer (Görüntüleyici):**
   * Klasördeki **`baslat_viewer.bat`** dosyasına çift tıklayın veya `npm run start:viewer` çalıştırın.
   * Görüntülemek istediğiniz `.hrav` veya `.meren` dosyasını pencerenin içine sürükleyip bırakabilir veya `[Dosya Aç]` butonuna basabilirsiniz.

---

## 📦 Kurulum Paketleri (`Setup.exe`)

* **Meren Studio Setup:**
  ```bash
  npm run dist:studio
  ```
  Çıktı: `dist/MerenStudio-Setup-2.0.0.exe`

* **Meren Viewer Setup:**
  ```bash
  npm run dist:viewer
  ```
  Çıktı: `viewer/dist/MerenViewer-Setup-1.0.0.exe`

---

## 📁 Proje Dosya Ağacı

```
meren-studio/
├── src/                         # Meren Studio (Editör) Kaynak Kodları
│   ├── main.js
│   ├── preload.js
│   ├── merenEngine.js           # .hrav ve .meren çift format kripto motoru
│   └── renderer/                # No-Code editör ve stil denetçisi
├── viewer/                      # Meren Viewer (Salt Okunur Görüntüleyici)
│   ├── src/
│   │   ├── main.js
│   │   ├── preload.js
│   │   ├── merenEngine.js
│   │   └── renderer/            # Salt okunur okuyucu arayüzü
│   └── package.json
├── baslat.bat                   # Meren Studio Başlatıcı
├── baslat_viewer.bat            # Meren Viewer Başlatıcı
├── git_push.bat                 # GitHub Senkronizasyonu
├── ornek_belge.hrav             # Örnek .hrav şifreli kasa
├── ornek_belge.meren            # Örnek .meren şifreli kasa
└── package.json                 # Ortak yapılandırma
```
