// Meren Viewer Controller

(function () {
  let renderer = null;
  let currentDoc = null;
  let currentFilePath = null;
  let zoomScale = 1.0;

  // DOM Elemanları
  const docTitleText = document.getElementById('docTitleText');
  const formatBadge = document.getElementById('formatBadge');
  const viewerCanvas = document.getElementById('viewerCanvas');
  const viewerCanvasWrapper = document.getElementById('viewerCanvasWrapper');
  const viewerDropZone = document.getElementById('viewerDropZone');

  const filePathStatus = document.getElementById('filePathStatus');
  const fileFormatStatus = document.getElementById('fileFormatStatus');
  const fileSizeStatus = document.getElementById('fileSizeStatus');

  const searchFloatingBar = document.getElementById('searchFloatingBar');
  const docSearchInput = document.getElementById('docSearchInput');
  const searchResultsCount = document.getElementById('searchResultsCount');
  const btnToggleSearch = document.getElementById('btnToggleSearch');
  const btnCloseSearch = document.getElementById('btnCloseSearch');

  const zoomLevelText = document.getElementById('zoomLevelText');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomReset = document.getElementById('btnZoomReset');

  function init() {
    renderer = new ViewerRenderer();

    setupEventListeners();
    setupZoomControls();
    setupSearchInPage();
    setupDragAndDrop();
    setupKeyboardShortcuts();

    // Başlangıçta boş durum
    renderer.renderDocument(null, viewerCanvas);

    // Çift tıklama ile veya dışarıdan dosya yolu gelirse
    if (window.merenViewerAPI && window.merenViewerAPI.onLoadFileFromPath) {
      window.merenViewerAPI.onLoadFileFromPath(async (filePath) => {
        loadFileByPath(filePath);
      });
    }
  }

  function setupEventListeners() {
    document.getElementById('btnOpen').addEventListener('click', handleOpenFile);
    document.getElementById('btnPrint').addEventListener('click', () => window.print());
    document.getElementById('btnExportHtml').addEventListener('click', handleExportHtml);
  }

  async function handleOpenFile() {
    if (!window.merenViewerAPI) return;
    const res = await window.merenViewerAPI.openDialog();
    if (res && res.success) {
      handleFileLoaded(res);
    } else if (res && res.error) {
      alert('Dosya açılamadı: ' + res.error);
    }
  }

  async function loadFileByPath(filePath) {
    if (!window.merenViewerAPI) return;
    const res = await window.merenViewerAPI.readFileByPath(filePath);
    if (res && res.success) {
      handleFileLoaded(res);
    } else if (res && res.error) {
      alert('Dosya açılamadı: ' + res.error);
    }
  }

  function handleFileLoaded(res) {
    currentDoc = res.data;
    currentFilePath = res.filePath;
    renderer.currentDoc = currentDoc;

    docTitleText.textContent = res.data.title || 'Başlıksız Doküman';
    filePathStatus.textContent = res.filePath;
    fileSizeStatus.textContent = `Şifreli Boyut: ${(res.fileSize / 1024).toFixed(2)} KB`;
    
    const ext = res.filePath.toLowerCase().endsWith('.meren') ? '.meren' : '.hrav';
    formatBadge.textContent = ext;
    fileFormatStatus.textContent = `Format: ${ext}`;

    renderer.renderDocument(currentDoc, viewerCanvas);
  }

  async function handleExportHtml() {
    if (!currentDoc) {
      alert('Dışa aktarılacak bir doküman açık değil.');
      return;
    }
    if (!window.merenViewerAPI) return;

    const res = await window.merenViewerAPI.exportHtml(currentDoc);
    if (res && res.success) {
      alert('Standart HTML başarıyla dışa aktarıldı: ' + res.filePath);
    }
  }

  // Zoom (Yakınlaştırma / Uzaklaştırma)
  function setupZoomControls() {
    function updateZoom(newScale) {
      zoomScale = Math.min(Math.max(newScale, 0.5), 2.0);
      viewerCanvasWrapper.style.transform = `scale(${zoomScale})`;
      zoomLevelText.textContent = `${Math.round(zoomScale * 100)}%`;
    }

    btnZoomIn.addEventListener('click', () => updateZoom(zoomScale + 0.1));
    btnZoomOut.addEventListener('click', () => updateZoom(zoomScale - 0.1));
    btnZoomReset.addEventListener('click', () => updateZoom(1.0));
  }

  // Sayfa İçi Arama (Search in Page)
  function setupSearchInPage() {
    function toggleSearch(show) {
      const isVisible = show !== undefined ? show : searchFloatingBar.style.display === 'none';
      searchFloatingBar.style.display = isVisible ? 'flex' : 'none';
      if (isVisible) {
        docSearchInput.focus();
        docSearchInput.select();
      } else {
        clearSearchHighlights();
      }
    }

    btnToggleSearch.addEventListener('click', () => toggleSearch());
    btnCloseSearch.addEventListener('click', () => toggleSearch(false));

    docSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        clearSearchHighlights();
        searchResultsCount.textContent = '';
        return;
      }
      highlightSearchResults(query);
    });
  }

  function clearSearchHighlights() {
    const highlights = viewerCanvas.querySelectorAll('.search-highlight');
    highlights.forEach(h => {
      const parent = h.parentNode;
      parent.replaceChild(document.createTextNode(h.textContent), h);
      parent.normalize();
    });
  }

  function highlightSearchResults(query) {
    clearSearchHighlights();
    if (!query) return;

    let matchCount = 0;
    const walker = document.createTreeWalker(viewerCanvas, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];

    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) continue;
      const text = node.nodeValue;
      const idx = text.toLowerCase().indexOf(query);
      if (idx !== -1) {
        nodesToReplace.push({ node, text, idx, query });
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
        const mark = document.createElement('span');
        mark.className = 'search-highlight';
        mark.textContent = match;
        frag.appendChild(mark);
        matchCount++;
        lastIdx = offset + match.length;
      });

      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.substring(lastIdx)));
      }

      parent.replaceChild(frag, node);
    });

    searchResultsCount.textContent = matchCount > 0 ? `${matchCount} eşleşme` : 'Bulunamadı';
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Sürükle Bırak (Drag & Drop)
  function setupDragAndDrop() {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.path) {
          loadFileByPath(file.path);
        }
      }
    });
  }

  // Klavye Kısayolları
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchFloatingBar.style.display = 'flex';
        docSearchInput.focus();
        docSearchInput.select();
      } else if (e.key === 'Escape') {
        searchFloatingBar.style.display = 'none';
        clearSearchHighlights();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        btnZoomIn.click();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        btnZoomOut.click();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        btnZoomReset.click();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
