# 💎 Meren Suite - Studio & Viewer

**Meren Suite**, kişisel verilerinizi, şifrelerinizi, banka bilgilerinizi, taranmış resmi evraklarınızı ve günlük notlarınızı askeri düzeyde **`AES-256-GCM`** algoritmasıyla şifreleyen; **Meren Studio** (No-Code Düzenleyici) ve **Meren Viewer** (Salt Okunur Görüntüleyici) olmak üzere iki bağımsız programdan oluşan modern bir dijital kasa ekosistemidir.

---

## 🏛️ Mimari ve Program Dalları

```
                       ┌────────────────────────────────────────┐
                       │      MEREN SUITE (.meren & .hrav)      │
                       └───────────────────┬────────────────────┘
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
 ┌───────────────────────────────────┐               ┌───────────────────────────────────┐
 │ 💎 MEREN STUDIO                   │               │ 👁️ MEREN VIEWER                   │
 │ (No-Code Görsel Düzenleyici)      │               │ (Salt Okunur Görüntüleyici)       │
 ├───────────────────────────────────┤               ├───────────────────────────────────┤
 │ • Şifreli Kasa & Günlük Tasarımı  │               │ • Sıfır Düzenleme / Değişiklik    │
 │ • Bağımsız Satır & Yan Yana Dizilim│               │ • %100 Güvenli Salt Okunur Mod    │
 │ • Zengin Metin Biçimlendirme (RTF)│               │ • Tek Tıkla Maskeli Şifre/IBAN    │
 │ • Şifreli Görsel & Belge Kasası   │               │ • Şifreli Görsel/Evrak İnceleme   │
 │ • Sayfa İçi Canlı Arama (Ctrl+F)  │               │ • Sayfa İçi Canlı Arama (Ctrl+F)  │
 │ • Otomatik Kaydetme (Auto-Save)   │               │ • Çift Tıklamayla Açma Desteği    │
 │ • Geri Al / Yinele (Ctrl+Z/Ctrl+Y)│               │ • Tam Ekran ve Yazdır/PDF Export  │
 │ • .meren ve .hrav Çift Format     │               │ • .meren ve .hrav Şifre Çözme     │
 └───────────────────────────────────┘               └───────────────────────────────────┘
```

---

## ✨ Öne Çıkan Özellikler

### 1. 🛡️ Güçlü Güvenlik & Kriptografi
* **AES-256-GCM & PBKDF2:** Tüm veriler, metinler ve yüklenen fotoğraflar doğrudan dosya seviyesinde şifrelenir. Bilgisayarınızda açık/geçici resim veya metin dosyası bırakılmaz.
* **Çift Format Desteği:** Hem modern `.meren` hem de `.hrav` uzantılı dosyalar tam uyumlulukla açılır ve kaydedilir.
* **Korumalı Mod:** Açılan dosyalar ilk anda kazara veri kaybını önlemek için *Korumalı Görünüm (Salt Okunur)* modunda açılır.

### 2. 🎨 Meren Studio (Gelişmiş No-Code Editör)
* **Sade ve Odaklanmış Bileşen Seti:**
  * **🌟 Başlık:** Sade doküman başlığı ve açıklaması.
  * **📖 Günlük:** Otomatik şimdiki zaman tarihli, kelime sayaçlı zengin günlük kartı.
  * **🔐 Şifre:** Hesap adı, kullanıcı adı, tek tıkla kopyalama ve maskeli şifre alanı.
  * **💳 Banka Bilgileri:** Banka adı, IBAN kopyalama butonu, hesap türü ve notlar.
  * **🖼️ Görsel / Belge:** Taranmış evrak, fatura, kimlik veya fotoğrafları doğrudan sürükle-bırak ile şifreleyen kart.
  * **📊 Tablo:** Dinamik satır ekleme/silme ve tablo içi canlı filtreleme.
  * **➖ Ayırıcı Çizgi:** Bölümleri ayıran estetik yatay çizgi.
* **Akıllı Boyutlandırma ve Yan Yana Dizilim:** Bileşenler sayfadan taşmaz, boyutlandırılırken altındaki blokları yukarı çekmez. Sürükleyip bırakılarak kolayca yan yana yerleştirilebilir (`[↩️ Ayır]` ile tekrar ayrılabilir).
* **⚡ Otomatik Kaydetme (Auto-Save):** Üst menüdeki anahtar açıldığında, dosya kayıtlıysa her değişiklik 1.8 sn sonra otomatik olarak arka planda şifrelenir.
* **↩️ Geri Al / Yinele (Undo / Redo):** Yanlışlıkla yapılan işlemler `Ctrl+Z` ve `Ctrl+Y` ile geri alınabilir.
* **✍️ Zengin Metin Araç Çubuğu:** Seçilen metin üzerinde beliren kayan araç çubuğu ile kalın (**B**), italik (*I*), altı çizili (<u>U</u>), üstü çizili ve madde işaretli listeler oluşturulabilir.
* **🔍 Sayfa İçi Arama (`Ctrl+F`):** Canlı eşleşme vurgulama, sayaç ve `Enter` / `Shift+Enter` ile eşleşmeler arası yumuşak gezinme.

### 3. 👁️ Meren Viewer (Güvenli Okuyucu)
* Düzenleme butonları ve karmaşık paneller olmadan yalnızca içeriği güvenle incelemeye odaklıdır.
* Şifreleri ve IBAN'ları tek tıkla panoya kopyalar.
* Sayfa içi `Ctrl+F` araması ve yazdırma/PDF çıktısı desteği sunar.

---

## ⌨️ Klavye Kısayolları

| Kısayol | Fonksiyon |
| :--- | :--- |
| **`Ctrl + F`** | Sayfa İçi Arama Çubuğunu Aç/Odakla |
| **`Ctrl + S`** | Dokümanı Kaydet (Meren Studio) |
| **`Ctrl + Shift + S`** | Farklı Kaydet |
| **`Ctrl + O`** | Şifreli Dosya Aç (`.meren` / `.hrav`) |
| **`Ctrl + N`** | Yeni Boş Doküman Aç |
| **`Ctrl + Z`** | Geri Al (Undo) |
| **`Ctrl + Y`** veya **`Ctrl + Shift + Z`** | Yinele (Redo) |
| **`Ctrl + B`** | Sol Bileşen Panelini Göster / Gizle |
| **`Ctrl + D`** | Seçili Bileşeni Çoğalt (Duplicate) |
| **`Delete`** | Seçili Bileşeni Sil |
| **`Ctrl + P`** | Yazdır veya PDF Olarak Dışa Aktar |
| **`Esc`** | Arama Çubuğunu Kapat / Vurguları Temizle |

---

## 🚀 Hızlı Başlatma (Geliştirme & Test)

1. **Meren Studio (Editör):**
   * Klasördeki **`baslat.bat`** dosyasına çift tıklayın veya:
   ```bash
   npm start
   ```

2. **Meren Viewer (Görüntüleyici):**
   * Klasördeki **`baslat_viewer.bat`** dosyasına çift tıklayın veya:
   ```bash
   npm run start:viewer
   ```

3. **Windows Dosya İlişkilendirmesi:**
   * `.meren` ve `.hrav` uzantılı dosyalara çift tıklandığında otomatik açılması için **`dosya_iliskilendir.bat`** dosyasını bir kez çalıştırmanız yeterlidir.

4. **GitHub Senkronizasyonu:**
   * Değişiklikleri uzak sunucuya göndermek için **`git_push.bat`** dosyasını çalıştırabilirsiniz.

---

## 📦 Kurulum Paketleri Oluşturma (`Setup.exe`)

* **Meren Studio Setup & Portable:**
  ```bash
  npm run dist:studio
  ```
  *Çıktı konumu:* `dist/MerenStudio-Setup-2.0.0.exe`

* **Meren Viewer Setup & Portable:**
  ```bash
  npm run dist:viewer
  ```
  *Çıktı konumu:* `viewer/dist/MerenViewer-Setup-1.0.0.exe`

* **Tüm Paketleri Tek Seferde Derle:**
  ```bash
  npm run dist:all
  ```

---

## 📁 Proje Dosya Yapısı

```
meren-studio/
├── src/                         # Meren Studio Kaynak Kodları
│   ├── main.js                  # Electron ana süreç & dosya argüman yönetimi
│   ├── preload.js               # Güvenli IPC köprüsü
│   ├── merenEngine.js           # AES-256-GCM kripto motoru (.meren & .hrav)
│   └── renderer/                # Studio arayüzü
│       ├── index.html           # Ana düzenleyici arayüzü
│       ├── styles.css           # Koyu tema & responsive stiller
│       ├── components.js        # Sadeleştirilmiş bileşen tanımları
│       ├── noCodeEngine.js      # Tuval motoru, sürükle-bırak, undo/redo
│       ├── inspector.js         # Sağ denetçi (özellik & veri düzenleyici)
│       └── app.js               # Studio kontrolörü, arama & kısayollar
├── viewer/                      # Meren Viewer Kaynak Kodları
│   ├── src/
│   │   ├── main.js              # Viewer ana süreç & dosya ilişkilendirme
│   │   ├── preload.js
│   │   ├── merenEngine.js
│   │   └── renderer/            # Viewer arayüzü (Salt Okunur)
│   └── package.json             # Viewer bağımsız paket yapılandırması
├── test/
│   └── testEngine.js            # Otomatik kripto & format doğrulama testleri
├── baslat.bat                   # Meren Studio Başlatıcı
├── baslat_viewer.bat            # Meren Viewer Başlatıcı
├── dosya_iliskilendir.bat       # Windows .meren & .hrav uzantı bağlayıcı
├── git_push.bat                 # Git senkronizasyon aracı
├── package.json                 # Suite yapılandırması ve derleme komutları
└── README.md                    # Dokümantasyon
```

---

## 🔒 Lisans
MIT License - Kişisel veri güvenliği ve günlük tutma amacıyla özgürce kullanılabilir.
