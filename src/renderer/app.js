// Meren Studio - Kasa & Günlük Controller

(function () {
  let engine = null;
  let inspector = null;
  let currentFilePath = null;
  let isDirty = false;
  let isProtectedView = false;

  // DOM Elemanları
  const docTitleInput = document.getElementById('docTitleInput');
  const saveStatusDot = document.getElementById('saveStatusDot');
  const protectedViewBanner = document.getElementById('protectedViewBanner');
  const btnEnableEditing = document.getElementById('btnEnableEditing');
  const paletteCategories = document.getElementById('paletteCategories');
  const visualCanvas = document.getElementById('visualCanvas');
  const sidebarInspector = document.getElementById('sidebarInspector');
  const sidebarPalette = document.getElementById('sidebarPalette');
  const componentSearch = document.getElementById('componentSearch');

  const btnToggleLeftSidebar = document.getElementById('btnToggleLeftSidebar');
  const btnCollapseLeft = document.getElementById('btnCollapseLeft');
  const btnToggleRightSidebar = document.getElementById('btnToggleRightSidebar');
  const resizerLeft = document.getElementById('resizerLeft');
  const resizerRight = document.getElementById('resizerRight');

  const filePathStatus = document.getElementById('filePathStatus');
  const blockCountStatus = document.getElementById('blockCountStatus');
  const modeStatusBadge = document.getElementById('modeStatusBadge');

  function init() {
    engine = new NoCodeEngine();
    inspector = new BlockInspector(sidebarInspector, engine);

    renderComponentPalette();
    setupEventListeners();
    setupResizablePanels();
    setupShortcutKeys();

    engine.on('change', (blocks) => {
      engine.renderCanvas(visualCanvas, false);
      updateStats(blocks);
      setDirty(true);
    });

    setProtectedViewMode(false);
    engine.loadFromDocument({});
    setDirty(false);

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
          if (isProtectedView) {
            alert('⚠️ Dosya şu anda Korumalı Görünümde. Yeni bileşen eklemek için lütfen önce üstteki "Düzenlemeyi Etkinleştir" butonuna basın.');
            return;
          }
          engine.addComponent(comp.id);
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

  function setProtectedViewMode(protectedMode) {
    isProtectedView = protectedMode;
    engine.setReadOnly(isProtectedView);

    if (isProtectedView) {
      protectedViewBanner.style.display = 'flex';
      modeStatusBadge.textContent = '🛡️ Korumalı Mod (Salt Okunur)';
      modeStatusBadge.style.color = '#f59e0b';
    } else {
      protectedViewBanner.style.display = 'none';
      modeStatusBadge.textContent = '✏️ Düzenleme Modu';
      modeStatusBadge.style.color = '#10b981';
    }
    engine.renderCanvas(visualCanvas, false);
  }

  function updateStats(blocks) {
    blockCountStatus.textContent = `${blocks.length} Kayıt`;
  }

  function setDirty(dirty) {
    isDirty = dirty;
    saveStatusDot.className = isDirty ? 'status-dot unsaved' : 'status-dot saved';
    saveStatusDot.title = isDirty ? 'Değişiklikler kaydedilmedi' : 'Kaydedildi';
  }

  // Boyutlandırılabilir ve Daraltılabilir Paneller
  function setupResizablePanels() {
    let isResizingLeft = false;
    let isResizingRight = false;

    // 1. Sol Panel Sürükleme
    resizerLeft.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizingLeft = true;
      resizerLeft.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
    });

    // 2. Sağ Panel Sürükleme
    resizerRight.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizingRight = true;
      resizerRight.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
    });

    window.addEventListener('mousemove', (e) => {
      if (isResizingLeft) {
        let newWidth = e.clientX;
        if (newWidth < 160) newWidth = 160;
        if (newWidth > 550) newWidth = 550;
        sidebarPalette.style.width = newWidth + 'px';
        sidebarPalette.classList.remove('collapsed');
        btnToggleLeftSidebar.classList.remove('panel-closed');
      } else if (isResizingRight) {
        let newWidth = window.innerWidth - e.clientX;
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 600) newWidth = 600;
        sidebarInspector.style.width = newWidth + 'px';
        sidebarInspector.classList.remove('collapsed');
        btnToggleRightSidebar.classList.remove('panel-closed');
      }
    });

    window.addEventListener('mouseup', () => {
      if (isResizingLeft) {
        isResizingLeft = false;
        resizerLeft.classList.remove('dragging');
        document.body.style.cursor = '';
      }
      if (isResizingRight) {
        isResizingRight = false;
        resizerRight.classList.remove('dragging');
        document.body.style.cursor = '';
      }
    });

    // 3. Sol Paneli Gizle / Göster Butonları
    function toggleLeftSidebar() {
      const isCollapsed = sidebarPalette.classList.toggle('collapsed');
      btnToggleLeftSidebar.classList.toggle('panel-closed', isCollapsed);
      btnToggleLeftSidebar.querySelector('.toggle-icon').textContent = isCollapsed ? '▶' : '◀';
    }

    btnToggleLeftSidebar.addEventListener('click', toggleLeftSidebar);
    if (btnCollapseLeft) btnCollapseLeft.addEventListener('click', toggleLeftSidebar);

    // 4. Sağ Paneli Gizle / Göster Butonu
    function toggleRightSidebar() {
      const isCollapsed = sidebarInspector.classList.toggle('collapsed');
      btnToggleRightSidebar.classList.toggle('panel-closed', isCollapsed);
      btnToggleRightSidebar.querySelector('.toggle-icon').textContent = isCollapsed ? '◀' : '▶';
    }

    btnToggleRightSidebar.addEventListener('click', toggleRightSidebar);

    // Çift tıklama ile panelleri varsayılana sıfırlama veya daraltma
    resizerLeft.addEventListener('dblclick', toggleLeftSidebar);
    resizerRight.addEventListener('dblclick', toggleRightSidebar);
  }

  function setupEventListeners() {
    componentSearch.addEventListener('input', (e) => {
      renderComponentPalette(e.target.value);
    });

    docTitleInput.addEventListener('input', () => {
      setDirty(true);
    });

    btnEnableEditing.addEventListener('click', () => {
      setProtectedViewMode(false);
    });

    document.getElementById('btnNew').addEventListener('click', handleNewFile);
    document.getElementById('btnOpen').addEventListener('click', handleOpenFile);
    document.getElementById('btnSave').addEventListener('click', handleSaveFile);
    document.getElementById('btnSaveAs').addEventListener('click', handleSaveAsFile);
    document.getElementById('btnPrintPdf').addEventListener('click', handlePrintPdf);
  }

  function handleNewFile() {
    if (isDirty && !confirm('Kaydedilmemiş değişiklikler var. Yeni bir kasa/günlük açmak istiyor musunuz?')) {
      return;
    }
    currentFilePath = null;
    docTitleInput.value = 'Kişisel Veri Kasası & Günlük';
    filePathStatus.textContent = 'Yeni Belge (Henüz Kaydedilmedi)';
    setProtectedViewMode(false);
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
    docTitleInput.value = res.data.title || 'Başlıksız Kasa';
    
    setProtectedViewMode(true);
    engine.loadFromDocument(res.data);
    setDirty(false);
  }

  async function handleSaveFile() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'Kişisel Veri Kasası');

    const res = await window.merenAPI.saveFile({
      filePath: currentFilePath,
      documentData: docData
    });

    if (res && res.success) {
      currentFilePath = res.filePath;
      filePathStatus.textContent = res.filePath;
      setDirty(false);
    } else if (res && res.error) {
      alert('Kaydetme hatası: ' + res.error);
    }
  }

  async function handleSaveAsFile() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'Kişisel Veri Kasası');

    const res = await window.merenAPI.saveFile({
      filePath: null,
      documentData: docData
    });

    if (res && res.success) {
      currentFilePath = res.filePath;
      filePathStatus.textContent = res.filePath;
      setDirty(false);
    } else if (res && res.error) {
      alert('Kaydetme hatası: ' + res.error);
    }
  }

  function handlePrintPdf() {
    window.print();
  }

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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrintPdf();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        const isCollapsed = sidebarPalette.classList.toggle('collapsed');
        btnToggleLeftSidebar.classList.toggle('panel-closed', isCollapsed);
        btnToggleLeftSidebar.querySelector('.toggle-icon').textContent = isCollapsed ? '▶' : '◀';
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (isProtectedView) return;
        const sel = engine.getSelectedBlock();
        if (sel) {
          e.preventDefault();
          engine.duplicateBlock(sel.id);
        }
      } else if (e.key === 'Delete' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        if (isProtectedView) return;
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
