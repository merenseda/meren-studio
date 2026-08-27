// Meren Studio Controller

(function () {
  let engine = null;
  let inspector = null;
  let currentFilePath = null;
  let isDirty = false;
  let isProtectedView = false;

  // DOM Elemanları
  const docTitleInput = document.getElementById('docTitleInput');
  const docFormatSelect = document.getElementById('docFormatSelect');
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

    // SAĞ PANEL BAŞLANGIÇTA İÇERİDE / KAPALI OLACAK
    sidebarInspector.classList.add('collapsed');
    btnToggleRightSidebar.classList.add('panel-closed');
    btnToggleRightSidebar.querySelector('.toggle-icon').textContent = '◀';

    // PROGRAM İLK AÇILDIĞINDA GELEN SAYFA BOŞ OLACAK
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
    blockCountStatus.textContent = `${blocks.length} Bileşen`;
  }

  function setDirty(dirty) {
    isDirty = dirty;
    saveStatusDot.className = isDirty ? 'status-dot unsaved' : 'status-dot saved';
    saveStatusDot.title = isDirty ? 'Değişiklikler kaydedilmedi' : 'Kaydedildi';
  }

  // Panellerin Boyutlandırılması ve Daraltılması
  function setupResizablePanels() {
    let isResizingLeft = false;
    let isResizingRight = false;

    resizerLeft.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizingLeft = true;
      resizerLeft.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
    });

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
        btnToggleRightSidebar.querySelector('.toggle-icon').textContent = '▶';
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

    function toggleLeftSidebar() {
      const isCollapsed = sidebarPalette.classList.toggle('collapsed');
      btnToggleLeftSidebar.classList.toggle('panel-closed', isCollapsed);
      btnToggleLeftSidebar.querySelector('.toggle-icon').textContent = isCollapsed ? '▶' : '◀';
    }

    btnToggleLeftSidebar.addEventListener('click', toggleLeftSidebar);
    if (btnCollapseLeft) btnCollapseLeft.addEventListener('click', toggleLeftSidebar);

    function toggleRightSidebar() {
      const isCollapsed = sidebarInspector.classList.toggle('collapsed');
      btnToggleRightSidebar.classList.toggle('panel-closed', isCollapsed);
      btnToggleRightSidebar.querySelector('.toggle-icon').textContent = isCollapsed ? '◀' : '▶';
    }

    btnToggleRightSidebar.addEventListener('click', toggleRightSidebar);

    resizerLeft.addEventListener('dblclick', toggleLeftSidebar);
    resizerRight.addEventListener('dblclick', toggleRightSidebar);
  }

  function setupEventListeners() {
    setupSearchInPage();

    componentSearch.addEventListener('input', (e) => {
      renderComponentPalette(e.target.value);
    });

    docTitleInput.addEventListener('input', () => {
      setDirty(true);
    });

    docFormatSelect.addEventListener('change', () => {
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
    if (isDirty && !confirm('Kaydedilmemiş değişiklikler var. Yeni boş bir doküman açmak istiyor musunuz?')) {
      return;
    }
    currentFilePath = null;
    docTitleInput.value = 'yeni meren dosyası';
    filePathStatus.textContent = 'Yeni Belge (Henüz Kaydedilmedi)';
    setProtectedViewMode(false);
    engine.loadFromDocument({}); // TAMAMEN BOŞ BAŞLAR
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
    docTitleInput.value = res.data.title || res.fileName.replace(/\.(meren|hrav)$/i, '') || 'yeni meren dosyası';
    
    // Uzantı kontrolü
    if (res.filePath.toLowerCase().endsWith('.hrav')) {
      docFormatSelect.value = 'hrav';
    } else {
      docFormatSelect.value = 'meren';
    }

    setProtectedViewMode(true);
    engine.loadFromDocument(res.data);
    setDirty(false);
  }

  async function handleSaveFile() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'yeni meren dosyası');
    const formatExt = docFormatSelect.value || 'meren';

    const res = await window.merenAPI.saveFile({
      filePath: currentFilePath,
      documentData: docData,
      formatExt: formatExt
    });

    if (res && res.success) {
      currentFilePath = res.filePath;
      filePathStatus.textContent = res.filePath;
      setDirty(false);
      engine.showToast('💾 Dosya Başarıyla Kaydedildi!');
    } else if (res && res.error) {
      alert('Kaydetme hatası: ' + res.error);
    }
  }

  async function handleSaveAsFile() {
    if (!window.merenAPI) return;

    const docData = engine.exportToDocument(docTitleInput.value.trim() || 'yeni meren dosyası');
    const formatExt = docFormatSelect.value || 'meren';

    const res = await window.merenAPI.saveFile({
      filePath: null,
      documentData: docData,
      formatExt: formatExt
    });

    if (res && res.success) {
      currentFilePath = res.filePath;
      filePathStatus.textContent = res.filePath;
      setDirty(false);
      engine.showToast('💾 Dosya Başarıyla Kaydedildi!');
    } else if (res && res.error) {
      alert('Kaydetme hatası: ' + res.error);
    }
  }

  function handlePrintPdf() {
    window.print();
  }

  // === SAYFA İÇİ ARAMA (CTRL+F) ===
  let currentSearchMatches = [];
  let currentMatchIdx = -1;

  function setupSearchInPage() {
    const btnToggleSearch = document.getElementById('btnToggleSearch');
    const searchFloatingBar = document.getElementById('searchFloatingBar');
    const canvasSearchInput = document.getElementById('canvasSearchInput');
    const searchResultCount = document.getElementById('searchResultCount');
    const btnSearchPrev = document.getElementById('btnSearchPrev');
    const btnSearchNext = document.getElementById('btnSearchNext');
    const btnSearchClose = document.getElementById('btnSearchClose');

    if (!searchFloatingBar) return;

    function toggleSearch(show) {
      const isVisible = show !== undefined ? show : searchFloatingBar.style.display === 'none';
      searchFloatingBar.style.display = isVisible ? 'flex' : 'none';
      if (isVisible) {
        canvasSearchInput.focus();
        canvasSearchInput.select();
        if (canvasSearchInput.value.trim()) {
          doSearch(canvasSearchInput.value.trim());
        }
      } else {
        clearSearchHighlights();
        searchResultCount.textContent = '0/0';
      }
    }

    if (btnToggleSearch) btnToggleSearch.onclick = () => toggleSearch();
    if (btnSearchClose) btnSearchClose.onclick = () => toggleSearch(false);

    canvasSearchInput.addEventListener('input', (e) => {
      doSearch(e.target.value.trim());
    });

    canvasSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) navigateMatch(-1);
        else navigateMatch(1);
      } else if (e.key === 'Escape') {
        toggleSearch(false);
      }
    });

    if (btnSearchNext) btnSearchNext.onclick = () => navigateMatch(1);
    if (btnSearchPrev) btnSearchPrev.onclick = () => navigateMatch(-1);

    function doSearch(query) {
      clearSearchHighlights();
      currentSearchMatches = [];
      currentMatchIdx = -1;

      if (!query) {
        searchResultCount.textContent = '0/0';
        return;
      }

      const walker = document.createTreeWalker(visualCanvas, NodeFilter.SHOW_TEXT, null, false);
      const nodesToReplace = [];

      let node;
      while ((node = walker.nextNode())) {
        if (node.parentElement && ['SCRIPT', 'STYLE', 'BUTTON'].includes(node.parentElement.tagName)) continue;
        const text = node.nodeValue;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx !== -1) {
          nodesToReplace.push({ node, text, query });
        }
      }

      nodesToReplace.forEach(item => {
        const { node, text, query } = item;
        const parent = node.parentNode;
        if (!parent) return;

        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        const frag = document.createDocumentFragment();
        let lastIdx = 0;

        text.replace(regex, (match, p1, offset) => {
          if (offset > lastIdx) {
            frag.appendChild(document.createTextNode(text.substring(lastIdx, offset)));
          }
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.textContent = match;
          frag.appendChild(mark);
          currentSearchMatches.push(mark);
          lastIdx = offset + match.length;
        });

        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.substring(lastIdx)));
        }

        parent.replaceChild(frag, node);
      });

      if (currentSearchMatches.length > 0) {
        currentMatchIdx = 0;
        updateActiveMatch();
      } else {
        searchResultCount.textContent = '0/0';
      }
    }

    function navigateMatch(dir) {
      if (currentSearchMatches.length === 0) return;
      currentMatchIdx = (currentMatchIdx + dir + currentSearchMatches.length) % currentSearchMatches.length;
      updateActiveMatch();
    }

    function updateActiveMatch() {
      currentSearchMatches.forEach((m, i) => {
        if (i === currentMatchIdx) {
          m.classList.add('active-highlight');
          m.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          m.classList.remove('active-highlight');
        }
      });
      searchResultCount.textContent = `${currentMatchIdx + 1}/${currentSearchMatches.length}`;
    }

    function clearSearchHighlights() {
      const highlights = visualCanvas.querySelectorAll('.search-highlight');
      highlights.forEach(h => {
        const parent = h.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(h.textContent), h);
          parent.normalize();
        }
      });
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }

  function setupShortcutKeys() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const searchFloatingBar = document.getElementById('searchFloatingBar');
        const canvasSearchInput = document.getElementById('canvasSearchInput');
        if (searchFloatingBar) {
          searchFloatingBar.style.display = 'flex';
          canvasSearchInput.focus();
          canvasSearchInput.select();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
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
      } else if (e.key === 'Escape') {
        const searchFloatingBar = document.getElementById('searchFloatingBar');
        if (searchFloatingBar && searchFloatingBar.style.display !== 'none') {
          searchFloatingBar.style.display = 'none';
        }
      } else if (e.key === 'Delete' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
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
