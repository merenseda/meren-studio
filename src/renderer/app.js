// Meren Studio - No-Code Studio Controller

(function () {
  let engine = null;
  let inspector = null;
  let currentFilePath = null;
  let isDirty = false;
  let isPreviewMode = false;

  // DOM Elemanları
  const docTitleInput = document.getElementById('docTitleInput');
  const saveStatusDot = document.getElementById('saveStatusDot');
  const studioWorkspace = document.getElementById('studioWorkspace');
  const paletteCategories = document.getElementById('paletteCategories');
  const visualCanvas = document.getElementById('visualCanvas');
  const sidebarInspector = document.getElementById('sidebarInspector');
  const componentSearch = document.getElementById('componentSearch');
  const btnTogglePreview = document.getElementById('btnTogglePreview');
  const previewBtnText = document.getElementById('previewBtnText');

  const filePathStatus = document.getElementById('filePathStatus');
  const blockCountStatus = document.getElementById('blockCountStatus');
  const fileSizeStatus = document.getElementById('fileSizeStatus');

  function init() {
    // 1. Motor ve Denetçiyi Başlat
    engine = new NoCodeEngine();
    inspector = new BlockInspector(sidebarInspector, engine);

    // 2. Sol Bileşen Galerisini Doldur
    renderComponentPalette();

    // 3. Olayları Bağla
    setupEventListeners();
    setupShortcutKeys();

    // 4. Tuval Değişikliklerini Dinle
    engine.on('change', (blocks) => {
      engine.renderCanvas(visualCanvas, isPreviewMode);
      updateStats(blocks);
      setDirty(true);
    });

    // 5. Varsayılan Başlangıç Dokümanını Yükle
    engine.loadFromDocument({});
    setDirty(false);

    // 6. Dışarıdan veya Çift Tıklama ile Gelen .hrav Dosyaları
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

  // Sol Bileşen Paletini Render Et
  function renderComponentPalette(filterQuery = '') {
    paletteCategories.innerHTML = '';
    const query = filterQuery.toLowerCase().trim();

    for (const catKey in COMPONENT_CATEGORIES) {
      const cat = COMPONENT_CATEGORIES[catKey];
      const comps = COMPONENT_REGISTRY.filter(c => {
        const matchCat = c.category === catKey;
        const matchQuery = !query || c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query);
        return matchCat && matchQuery;
      });

      if (comps.length === 0) continue;

      const groupEl = document.createElement('div');
      groupEl.className = 'category-group';
      groupEl.innerHTML = `<div class="category-title">${cat.icon} ${cat.name}</div>`;

      comps.forEach(comp => {
        const itemEl = document.createElement('div');
        itemEl.className = 'component-card-item';
        itemEl.title = 'Eklemek için tıklayın: ' + comp.description;
        itemEl.innerHTML = `
          <span class="comp-icon">${comp.icon}</span>
          <div class="comp-info">
            <span class="comp-name">${comp.name}</span>
            <span class="comp-desc">${comp.description}</span>
          </div>
        `;

        itemEl.onclick = () => {
          engine.addComponent(comp.id);
          // Eklenen bileşene yumuşak kaydır
          setTimeout(() => {
            const selected = visualCanvas.querySelector('.canvas-block.selected');
            if (selected) selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 50);
        };

        groupEl.appendChild(itemEl);
      });

      paletteCategories.appendChild(groupEl);
    }
  }

  // İstatistik & Durum Güncelle
  function updateStats(blocks) {
    blockCountStatus.textContent = `${blocks.length} Bileşen`;
  }

  function setDirty(dirty) {
    isDirty = dirty;
    saveStatusDot.className = isDirty ? 'status-dot unsaved' : 'status-dot saved';
    saveStatusDot.title = isDirty ? 'Değişiklikler kaydedilmedi' : 'Kaydedildi';
  }

  // Olay Dinleyicileri
  function setupEventListeners() {
    // Arama
    componentSearch.addEventListener('input', (e) => {
      renderComponentPalette(e.target.value);
    });

    // Başlık
    docTitleInput.addEventListener('input', () => {
      setDirty(true);
    });

    // Önizleme Toggle
    btnTogglePreview.addEventListener('click', togglePreviewMode);

    // Buton Eylemleri
    document.getElementById('btnNew').addEventListener('click', handleNewFile);
    document.getElementById('btnOpen').addEventListener('click', handleOpenFile);
    document.getElementById('btnSave').addEventListener('click', handleSaveFile);
    document.getElementById('btnSaveAs').addEventListener('click', handleSaveAsFile);
    document.getElementById('btnExportHtml').addEventListener('click', handleExportHtml);
  }

  function togglePreviewMode() {
    isPreviewMode = !isPreviewMode;
    if (isPreviewMode) {
      studioWorkspace.classList.add('preview-mode');
      btnTogglePreview.classList.add('preview-active');
      previewBtnText.textContent = 'Düzenlemeye Dön';
    } else {
      studioWorkspace.classList.remove('preview-mode');
      btnTogglePreview.classList.remove('preview-active');
      previewBtnText.textContent = 'Önizleme Modu';
    }
    engine.renderCanvas(visualCanvas, isPreviewMode);
  }

  // Dosya Eylemleri
  function handleNewFile() {
    if (isDirty && !confirm('Kaydedilmemiş değişiklikler var. Yeni bir doküman açmak istiyor musunuz?')) {
      return;
    }
    currentFilePath = null;
    docTitleInput.value = 'Yeni No-Code Dokümanı';
    filePathStatus.textContent = 'Yeni Belge (Henüz Kaydedilmedi)';
    fileSizeStatus.textContent = 'Boyut: ~0 B';
    engine.loadFromDocument({});
    setDirty(false);
  }

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
    filePathStatus.textContent = res.filePath;
    fileSizeStatus.textContent = `Şifreli Boyut: ${(res.fileSize / 1024).toFixed(2)} KB`;
    docTitleInput.value = res.data.title || 'Başlıksız';
    engine.loadFromDocument(res.data);
    setDirty(false);
  }

  async function handleSaveFile() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'Başlıksız Doküman');

    const res = await window.merenAPI.saveFile({
      filePath: currentFilePath,
      documentData: docData
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

  async function handleSaveAsFile() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'Başlıksız Doküman');

    const res = await window.merenAPI.saveFile({
      filePath: null, // Diyalog açar
      documentData: docData
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

  async function handleExportHtml() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'Başlıksız Doküman');

    const res = await window.merenAPI.exportHtml(docData);
    if (res && res.success) {
      alert('Standart HTML başarıyla dışa aktarıldı: ' + res.filePath);
    }
  }

  // Kısayollar
  function setupShortcutKeys() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) handleSaveAsFile();
        else handleSaveFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        const sel = engine.getSelectedBlock();
        if (sel) {
          e.preventDefault();
          engine.duplicateBlock(sel.id);
        }
      } else if (e.key === 'Delete' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        const sel = engine.getSelectedBlock();
        if (sel) {
          e.preventDefault();
          engine.removeBlock(sel.id);
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
