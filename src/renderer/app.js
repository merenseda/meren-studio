// Meren Studio - Renderer Controller

(function () {
  // Varsayılan Başlangıç Şablonu
  const DEFAULT_DOCUMENT = {
    title: 'Yeni Meren Dokümanı',
    html: `<div class="meren-container">
  <div class="hero-card">
    <div class="badge">🔒 Güvenli .meren Formatı</div>
    <h1>Meren Studio'ya Hoş Geldiniz!</h1>
    <p>Bu dosya <strong>AES-256-GCM</strong> ile otomatik şifrelenir. İçerisinde HTML5, CSS3 ve JavaScript ile dilediğiniz her şeyi özgürce oluşturabilirsiniz.</p>
    
    <div class="interactive-demo">
      <button id="counterBtn" class="primary-btn">Tıkla: <span id="countVal">0</span></button>
      <button id="alertBtn" class="outline-btn">Etkileşim Testi</button>
    </div>
    
    <div id="demoOutput" class="output-box">Butonlara basarak dinamik JavaScript etkileşimini deneyin.</div>
  </div>
</div>`,
    css: `/* Meren Özel Görsel Stilleri */
.meren-container {
  max-width: 720px;
  margin: 40px auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

.hero-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
}

.badge {
  display: inline-block;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
}

h1 {
  font-size: 1.8rem;
  color: #0f172a;
  margin-bottom: 12px;
}

p {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
}

.interactive-demo {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

button {
  cursor: pointer;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: transform 0.1s, box-shadow 0.2s;
}

button:active {
  transform: scale(0.98);
}

.primary-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.outline-btn {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.output-box {
  padding: 14px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #334155;
  border-left: 4px solid #6366f1;
}`,
    js: `// Meren İnteraktif JavaScript Kodu
let count = 0;
const counterBtn = document.getElementById('counterBtn');
const alertBtn = document.getElementById('alertBtn');
const countVal = document.getElementById('countVal');
const output = document.getElementById('demoOutput');

if (counterBtn) {
  counterBtn.addEventListener('click', () => {
    count++;
    countVal.textContent = count;
    output.innerHTML = '⚡ Sayaca tıklandı! Güncel değer: <strong>' + count + '</strong>';
  });
}

if (alertBtn) {
  alertBtn.addEventListener('click', () => {
    output.innerHTML = '🎉 Tebrikler! .meren dosyanızda JavaScript motoru tam performans çalışıyor.';
  });
}`
  };

  // Uygulama Durumu (State)
  let currentFilePath = null;
  let isDirty = false;
  let currentDoc = JSON.parse(JSON.stringify(DEFAULT_DOCUMENT));
  let renderTimeout = null;

  // DOM Elemanları
  const docTitleInput = document.getElementById('docTitleInput');
  const saveStatusDot = document.getElementById('saveStatusDot');
  const mainWorkspace = document.getElementById('mainWorkspace');
  
  const htmlEditor = document.getElementById('htmlEditor');
  const cssEditor = document.getElementById('cssEditor');
  const jsEditor = document.getElementById('jsEditor');
  const wysiwygEditor = document.getElementById('wysiwygEditor');
  const previewFrame = document.getElementById('previewFrame');

  const filePathStatus = document.getElementById('filePathStatus');
  const fileSizeStatus = document.getElementById('fileSizeStatus');
  const docStatsStatus = document.getElementById('docStatsStatus');

  // Başlatma
  function init() {
    loadDocumentIntoUI(currentDoc);
    setupEventListeners();
    setupShortcutKeys();
    setupComponentInserters();

    // Dışarıdan veya çift tıklama ile gelen dosyaları dinle
    if (window.merenAPI && window.merenAPI.onLoadFileFromPath) {
      window.merenAPI.onLoadFileFromPath(async (filePath) => {
        const res = await window.merenAPI.readFileByPath(filePath);
        if (res && res.success) {
          handleFileLoaded(res);
        } else if (res && res.error) {
          alert('Dosya açılamadı: ' + res.error);
        }
      });
    }
  }

  // Arayüze Doküman Yükleme
  function loadDocumentIntoUI(doc) {
    currentDoc = doc;
    docTitleInput.value = doc.title || 'Başlıksız';
    htmlEditor.value = doc.html || '';
    cssEditor.value = doc.css || '';
    jsEditor.value = doc.js || '';
    wysiwygEditor.innerHTML = doc.html || '';
    
    updateStats();
    triggerLiveRender();
    setDirty(false);
  }

  // Değişiklik Durumu (Dirty Flag)
  function setDirty(dirty) {
    isDirty = dirty;
    if (isDirty) {
      saveStatusDot.className = 'status-dot unsaved';
      saveStatusDot.title = 'Değişiklikler kaydedilmedi';
    } else {
      saveStatusDot.className = 'status-dot saved';
      saveStatusDot.title = 'Kaydedildi';
    }
  }

  // İstatistikleri Güncelle
  function updateStats() {
    const totalChars = (htmlEditor.value.length + cssEditor.value.length + jsEditor.value.length);
    docStatsStatus.textContent = `${totalChars.toLocaleString()} karakter`;
  }

  // Canlı Önizlemeyi Render Et
  function triggerLiveRender() {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      const fullHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    ${cssEditor.value}
  </style>
</head>
<body>
  ${htmlEditor.value}
  <script>
    try {
      ${jsEditor.value}
    } catch(err) {
      console.error("Meren JS Çalışma Hatası:", err);
    }
  <\/script>
</body>
</html>`;
      
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      previewFrame.src = URL.createObjectURL(blob);
    }, 150);
  }

  // Olay Dinleyicileri
  function setupEventListeners() {
    // Başlık değişimi
    docTitleInput.addEventListener('input', () => {
      currentDoc.title = docTitleInput.value.trim();
      setDirty(true);
    });

    // Kod editörleri yazım olayları
    [htmlEditor, cssEditor, jsEditor].forEach(editor => {
      editor.addEventListener('input', () => {
        setDirty(true);
        updateStats();
        triggerLiveRender();
        if (editor === htmlEditor) {
          wysiwygEditor.innerHTML = htmlEditor.value;
        }
      });

      // Tab tuşu desteği
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
          editor.selectionStart = editor.selectionEnd = start + 2;
          editor.dispatchEvent(new Event('input'));
        }
      });
    });

    // Görsel WYSIWYG editörü yazım olayı
    wysiwygEditor.addEventListener('input', () => {
      htmlEditor.value = wysiwygEditor.innerHTML;
      setDirty(true);
      updateStats();
      triggerLiveRender();
    });

    // Görünüm Modu Butonları (Tabs)
    document.querySelectorAll('.mode-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        mainWorkspace.dataset.view = mode;

        if (mode === 'visual') {
          wysiwygEditor.innerHTML = htmlEditor.value;
        } else if (mode === 'split' || mode === 'code') {
          triggerLiveRender();
        }
      });
    });

    // Kod Sekmeleri (HTML, CSS, JS)
    document.querySelectorAll('.code-tab-bar .code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.code-tab-bar .code-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.code-editors-container .code-editor-wrap').forEach(w => w.classList.remove('active'));
        
        tab.classList.add('active');
        const targetId = tab.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add('active');
      });
    });

    // Araç Çubuğu Format Butonları (Kalın, İtalik vb.)
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.command;
        const format = btn.dataset.format;
        if (cmd) {
          document.execCommand(cmd, false, null);
        } else if (format) {
          document.execCommand('formatBlock', false, format);
        }
        wysiwygEditor.focus();
        htmlEditor.value = wysiwygEditor.innerHTML;
        triggerLiveRender();
        setDirty(true);
      });
    });

    // Buton Eylemleri
    document.getElementById('btnNew').addEventListener('click', handleNewFile);
    document.getElementById('btnOpen').addEventListener('click', handleOpenFile);
    document.getElementById('btnSave').addEventListener('click', handleSaveFile);
    document.getElementById('btnSaveAs').addEventListener('click', handleSaveAsFile);
    document.getElementById('btnExportHtml').addEventListener('click', handleExportHtml);
    document.getElementById('btnRefreshPreview').addEventListener('click', triggerLiveRender);
  }

  // Kısayol Tuşları (Ctrl+S, Ctrl+O, Ctrl+N vb.)
  function setupShortcutKeys() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAsFile();
        } else {
          handleSaveFile();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile();
      }
    });
  }

  // Yeni Dosya
  function handleNewFile() {
    if (isDirty && !confirm('Kaydedilmemiş değişiklikler var. Yeni bir dosya açmak istiyor musunuz?')) {
      return;
    }
    currentFilePath = null;
    currentDoc = JSON.parse(JSON.stringify(DEFAULT_DOCUMENT));
    filePathStatus.textContent = 'Henüz Kaydedilmedi (Yeni Belge)';
    fileSizeStatus.textContent = 'Boyut: ~0 B';
    loadDocumentIntoUI(currentDoc);
  }

  // Dosya Aç
  async function handleOpenFile() {
    if (isDirty && !confirm('Kaydedilmemiş değişiklikler var. Dosya açmaya devam edilsin mi?')) {
      return;
    }
    if (!window.merenAPI) return;
    const res = await window.merenAPI.openDialog();
    if (res && res.success) {
      handleFileLoaded(res);
    } else if (res && res.error) {
      alert('Hata: ' + res.error);
    }
  }

  function handleFileLoaded(res) {
    currentFilePath = res.filePath;
    currentDoc = res.data;
    filePathStatus.textContent = res.filePath;
    fileSizeStatus.textContent = `Boyut: ${(res.fileSize / 1024).toFixed(2)} KB`;
    loadDocumentIntoUI(currentDoc);
  }

  // Dosya Kaydet
  async function handleSaveFile() {
    if (!window.merenAPI) return;
    
    currentDoc.title = docTitleInput.value.trim() || 'Başlıksız';
    currentDoc.html = htmlEditor.value;
    currentDoc.css = cssEditor.value;
    currentDoc.js = jsEditor.value;

    const res = await window.merenAPI.saveFile({
      filePath: currentFilePath,
      documentData: currentDoc
    });

    if (res && res.success) {
      currentFilePath = res.filePath;
      filePathStatus.textContent = res.filePath;
      fileSizeStatus.textContent = `Şifreli Boyut: ${(res.fileSize / 1024).toFixed(2)} KB`;
      setDirty(false);
    } else if (res && res.error) {
      alert('Kaydetme hatası: ' + res.error);
    }
  }

  // Farklı Kaydet
  async function handleSaveAsFile() {
    if (!window.merenAPI) return;

    currentDoc.title = docTitleInput.value.trim() || 'Başlıksız';
    currentDoc.html = htmlEditor.value;
    currentDoc.css = cssEditor.value;
    currentDoc.js = jsEditor.value;

    const res = await window.merenAPI.saveFile({
      filePath: null, // null vererek kaydetme diyaloğunu tetikler
      documentData: currentDoc
    });

    if (res && res.success) {
      currentFilePath = res.filePath;
      filePathStatus.textContent = res.filePath;
      fileSizeStatus.textContent = `Şifreli Boyut: ${(res.fileSize / 1024).toFixed(2)} KB`;
      setDirty(false);
    } else if (res && res.error) {
      alert('Kaydetme hatası: ' + res.error);
    }
  }

  // HTML Export
  async function handleExportHtml() {
    if (!window.merenAPI) return;

    currentDoc.title = docTitleInput.value.trim() || 'Başlıksız';
    currentDoc.html = htmlEditor.value;
    currentDoc.css = cssEditor.value;
    currentDoc.js = jsEditor.value;

    const res = await window.merenAPI.exportHtml(currentDoc);
    if (res && res.success) {
      alert('HTML başarıyla dışa aktarıldı: ' + res.filePath);
    }
  }

  // Hızlı İnteraktif Bileşenler Ekleme
  function setupComponentInserters() {
    function insertSnippet(htmlSnippet, cssSnippet, jsSnippet) {
      htmlEditor.value += '\n\n' + htmlSnippet;
      if (cssSnippet) cssEditor.value += '\n\n' + cssSnippet;
      if (jsSnippet) jsEditor.value += '\n\n' + jsSnippet;
      wysiwygEditor.innerHTML = htmlEditor.value;
      setDirty(true);
      updateStats();
      triggerLiveRender();
    }

    document.getElementById('btnAddButtonWidget').addEventListener('click', () => {
      const id = 'btn_' + Math.floor(Math.random() * 1000);
      insertSnippet(
        `<div class="card">\n  <h3>Dinamik Buton</h3>\n  <button id="${id}" class="custom-btn">Tıkla Beni!</button>\n  <span id="${id}_text"></span>\n</div>`,
        `.custom-btn { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }`,
        `document.getElementById('${id}').addEventListener('click', () => {\n  document.getElementById('${id}_text').textContent = ' Harika, tıklandı!';\n});`
      );
    });

    document.getElementById('btnAddCardWidget').addEventListener('click', () => {
      insertSnippet(
        `<div class="feature-card">\n  <div class="icon">🚀</div>\n  <h3>Modern Kart</h3>\n  <p>Bu kart CSS ile stillendirilmiştir ve .meren dosyasında saklanır.</p>\n</div>`,
        `.feature-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin: 10px 0; }\n.feature-card .icon { font-size: 2rem; margin-bottom: 8px; }`,
        ''
      );
    });

    document.getElementById('btnAddAlertWidget').addEventListener('click', () => {
      insertSnippet(
        `<div class="alert-box info">\n  <strong>💡 Bilgi:</strong> Bu içerik sadece Meren Studio ile açılabilir!\n</div>`,
        `.alert-box { padding: 12px 16px; border-radius: 8px; margin: 12px 0; font-size: 0.95rem; }\n.alert-box.info { background: #eff6ff; color: #1e40af; border-left: 4px solid #3b82f6; }`,
        ''
      );
    });

    document.getElementById('btnAddTableWidget').addEventListener('click', () => {
      insertSnippet(
        `<table class="styled-table">\n  <thead>\n    <tr><th>ID</th><th>Başlık</th><th>Durum</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>1</td><td>Örnek Veri A</td><td>Tamamlandı</td></tr>\n    <tr><td>2</td><td>Örnek Veri B</td><td>Devam Ediyor</td></tr>\n  </tbody>\n</table>`,
        `.styled-table { width: 100%; border-collapse: collapse; margin: 16px 0; }\n.styled-table th, .styled-table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }\n.styled-table th { background: #f8fafc; color: #334155; }`,
        ''
      );
    });

    document.getElementById('btnAddCanvasWidget').addEventListener('click', () => {
      const cId = 'canvas_' + Math.floor(Math.random() * 1000);
      insertSnippet(
        `<div class="canvas-wrap">\n  <h3>İnteraktif Çizim Tuvali</h3>\n  <canvas id="${cId}" width="400" height="200"></canvas>\n</div>`,
        `.canvas-wrap canvas { border: 2px dashed #94a3b8; background: #ffffff; border-radius: 8px; cursor: crosshair; }`,
        `const canvas = document.getElementById('${cId}');\nif(canvas) {\n  const ctx = canvas.getContext('2d');\n  let painting = false;\n  canvas.onmousedown = () => painting = true;\n  window.onmouseup = () => painting = false;\n  canvas.onmousemove = (e) => {\n    if(!painting) return;\n    const rect = canvas.getBoundingClientRect();\n    ctx.lineWidth = 3;\n    ctx.lineCap = 'round';\n    ctx.strokeStyle = '#6366f1';\n    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);\n  };\n}`
      );
    });

    document.getElementById('btnAddTodoWidget').addEventListener('click', () => {
      insertSnippet(
        `<div class="todo-widget">\n  <h3>Görev Listesi</h3>\n  <label><input type="checkbox"> HTML Tasarımını Tamamla</label><br>\n  <label><input type="checkbox"> CSS Animasyonlarını Ekle</label><br>\n  <label><input type="checkbox"> .meren Olarak Şifreli Kaydet</label>\n</div>`,
        `.todo-widget { background: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; }\n.todo-widget label { display: block; margin: 8px 0; cursor: pointer; }`,
        ''
      );
    });
  }

  // DOM Yüklendiğinde Başlat
  document.addEventListener('DOMContentLoaded', init);
})();
