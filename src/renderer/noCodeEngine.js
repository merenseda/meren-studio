// Meren Studio - No-Code Görsel Tuval Motoru

class NoCodeEngine {
  constructor() {
    this.blocks = [];
    this.selectedBlockId = null;
    this.listeners = {
      change: [],
      select: []
    };
  }

  // Olay Dinleyicileri
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // Yeni Bileşen Ekle
  addComponent(componentId, atIndex = null) {
    const compDef = COMPONENT_REGISTRY.find(c => c.id === componentId);
    if (!compDef) return null;

    const blockId = 'block_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newBlock = {
      id: blockId,
      componentId: componentId,
      data: JSON.parse(JSON.stringify(compDef.defaultData)),
      customStyles: {}
    };

    if (atIndex !== null && atIndex >= 0 && atIndex <= this.blocks.length) {
      this.blocks.splice(atIndex, 0, newBlock);
    } else {
      this.blocks.push(newBlock);
    }

    this.selectBlock(blockId);
    this.emit('change', this.blocks);
    return newBlock;
  }

  // Bileşen Sil
  removeBlock(blockId) {
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx !== -1) {
      this.blocks.splice(idx, 1);
      if (this.selectedBlockId === blockId) {
        this.selectedBlockId = this.blocks.length > 0 ? this.blocks[Math.max(0, idx - 1)].id : null;
        this.emit('select', this.getSelectedBlock());
      }
      this.emit('change', this.blocks);
    }
  }

  // Bileşeni Taşı (direction: -1 yukarı, 1 aşağı)
  moveBlock(blockId, direction) {
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= this.blocks.length) return;

    const [item] = this.blocks.splice(idx, 1);
    this.blocks.splice(targetIdx, 0, item);
    this.emit('change', this.blocks);
  }

  // Bileşeni Çoğalt (Duplicate)
  duplicateBlock(blockId) {
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;

    const source = this.blocks[idx];
    const newBlockId = 'block_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const cloned = {
      id: newBlockId,
      componentId: source.componentId,
      data: JSON.parse(JSON.stringify(source.data)),
      customStyles: JSON.parse(JSON.stringify(source.customStyles || {}))
    };

    this.blocks.splice(idx + 1, 0, cloned);
    this.selectBlock(newBlockId);
    this.emit('change', this.blocks);
  }

  // Bileşen Seçimi
  selectBlock(blockId) {
    this.selectedBlockId = blockId;
    this.emit('select', this.getSelectedBlock());
  }

  getSelectedBlock() {
    return this.blocks.find(b => b.id === this.selectedBlockId) || null;
  }

  // Veri / Stil Güncelle
  updateBlockData(blockId, field, value) {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      block.data[field] = value;
      this.emit('change', this.blocks);
    }
  }

  updateBlockStyle(blockId, styleProp, value) {
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      if (!block.customStyles) block.customStyles = {};
      block.customStyles[styleProp] = value;
      this.emit('change', this.blocks);
    }
  }

  // Tuval HTML'ini Oluştur
  renderCanvas(containerEl, isPreviewMode = false) {
    containerEl.innerHTML = '';

    if (this.blocks.length === 0) {
      containerEl.innerHTML = `
        <div class="empty-canvas-state">
          <div class="empty-icon">🎨</div>
          <h3>Çalışma Tuvaliniz Boş</h3>
          <p>Sol paneldeki zengin bileşenlere tıklayarak sayfanızı hemen tasarlamaya başlayın.</p>
        </div>
      `;
      return;
    }

    this.blocks.forEach((block, index) => {
      const blockWrap = document.createElement('div');
      blockWrap.className = 'canvas-block' + (block.id === this.selectedBlockId && !isPreviewMode ? ' selected' : '');
      blockWrap.dataset.blockId = block.id;

      // Hızlı Kontrol Çubuğu (Yalnızca Düzenleme Modunda)
      if (!isPreviewMode) {
        const toolbar = document.createElement('div');
        toolbar.className = 'block-floating-toolbar';
        toolbar.innerHTML = `
          <button class="action-mini-btn btn-up" title="Yukarı Taşı" ${index === 0 ? 'disabled' : ''}>⬆️</button>
          <button class="action-mini-btn btn-down" title="Aşağı Taşı" ${index === this.blocks.length - 1 ? 'disabled' : ''}>⬇️</button>
          <button class="action-mini-btn btn-duplicate" title="Çoğalt">📋</button>
          <button class="action-mini-btn btn-delete danger" title="Sil">🗑️</button>
        `;

        toolbar.querySelector('.btn-up').onclick = (e) => { e.stopPropagation(); this.moveBlock(block.id, -1); };
        toolbar.querySelector('.btn-down').onclick = (e) => { e.stopPropagation(); this.moveBlock(block.id, 1); };
        toolbar.querySelector('.btn-duplicate').onclick = (e) => { e.stopPropagation(); this.duplicateBlock(block.id); };
        toolbar.querySelector('.btn-delete').onclick = (e) => { e.stopPropagation(); this.removeBlock(block.id); };

        blockWrap.appendChild(toolbar);
      }

      // İçerik Render
      const contentEl = document.createElement('div');
      contentEl.className = 'block-content-area';
      contentEl.innerHTML = this.generateBlockHtml(block);

      // Inline Metin Düzenleme Olayları
      if (!isPreviewMode) {
        contentEl.querySelectorAll('[data-bind]').forEach(editable => {
          editable.contentEditable = 'true';
          editable.spellcheck = false;
          editable.addEventListener('input', (e) => {
            const field = editable.dataset.bind;
            block.data[field] = editable.innerText;
            this.emit('select', block); // Inspector'ı güncelle
          });
        });
      }

      blockWrap.appendChild(contentEl);

      // Tıklama ile Seçim
      if (!isPreviewMode) {
        blockWrap.onclick = (e) => {
          e.stopPropagation();
          this.selectBlock(block.id);
        };
      }

      containerEl.appendChild(blockWrap);
    });

    // İnteraktif scriptleri başlat
    this.attachInteractiveBehaviors(containerEl);
  }

  // Tekil Bileşen HTML Üretimi
  generateBlockHtml(block) {
    const d = block.data;
    const s = block.customStyles || {};
    const inlineStyle = `
      ${s.bgColor ? `background: ${s.bgColor};` : (d.bgGradient ? `background: ${d.bgGradient};` : (d.bgColor ? `background: ${d.bgColor};` : ''))}
      ${s.textColor ? `color: ${s.textColor};` : (d.textColor ? `color: ${d.textColor};` : '')}
      ${s.padding ? `padding: ${s.padding};` : (d.padding ? `padding: ${d.padding};` : '')}
      ${s.margin ? `margin: ${s.margin};` : (d.margin ? `margin: ${d.margin};` : '')}
      ${s.borderRadius ? `border-radius: ${s.borderRadius};` : (d.borderRadius ? `border-radius: ${d.borderRadius};` : '')}
      ${s.shadow ? `box-shadow: ${s.shadow};` : (d.shadow ? `box-shadow: ${d.shadow};` : '')}
      ${d.backdropBlur ? `backdrop-filter: blur(${d.backdropBlur}); -webkit-backdrop-filter: blur(${d.backdropBlur});` : ''}
      ${d.borderWidth ? `border: ${d.borderWidth} solid ${d.borderColor || '#e2e8f0'};` : ''}
    `;

    switch (block.componentId) {
      case 'hero-section':
        return `
          <div class="nc-hero-card" style="${inlineStyle}">
            <div class="nc-badge">🔒 .hrav Güvenli No-Code</div>
            <h1 class="nc-hero-title" data-bind="title">${d.title}</h1>
            <p class="nc-hero-sub" data-bind="subtitle">${d.subtitle}</p>
            <button class="nc-hero-btn">${d.buttonText}</button>
          </div>
        `;

      case 'card-box':
      case 'glass-card':
        return `
          <div class="nc-card-box" style="${inlineStyle}">
            <h3 class="nc-card-title" data-bind="title">${d.title}</h3>
            <p class="nc-card-text" data-bind="text">${d.text}</p>
          </div>
        `;

      case 'grid-2-col':
        return `
          <div class="nc-grid-2" style="${inlineStyle}">
            <div class="nc-grid-col">
              <h4 data-bind="leftTitle">${d.leftTitle}</h4>
              <p data-bind="leftText">${d.leftText}</p>
            </div>
            <div class="nc-grid-col">
              <h4 data-bind="rightTitle">${d.rightTitle}</h4>
              <p data-bind="rightText">${d.rightText}</p>
            </div>
          </div>
        `;

      case 'grid-3-col':
        return `
          <div class="nc-grid-3" style="${inlineStyle}">
            <div class="nc-grid-col"><h4 data-bind="col1Title">${d.col1Title}</h4><p data-bind="col1Text">${d.col1Text}</p></div>
            <div class="nc-grid-col"><h4 data-bind="col2Title">${d.col2Title}</h4><p data-bind="col2Text">${d.col2Text}</p></div>
            <div class="nc-grid-col"><h4 data-bind="col3Title">${d.col3Title}</h4><p data-bind="col3Text">${d.col3Text}</p></div>
          </div>
        `;

      case 'divider-line':
        return `<hr style="border: none; border-top: ${d.lineWidth || '1px'} solid ${d.lineColor || '#cbd5e1'}; margin: ${d.margin || '24px'} 0;">`;

      case 'heading-main':
        return `<h1 style="${inlineStyle}; font-size: ${d.fontSize}; font-weight: ${d.fontWeight}; text-align: ${d.textAlign};" data-bind="text">${d.text}</h1>`;

      case 'heading-sub':
        return `<h2 style="${inlineStyle}; font-size: ${d.fontSize}; font-weight: ${d.fontWeight}; text-align: ${d.textAlign};" data-bind="text">${d.text}</h2>`;

      case 'paragraph-text':
        return `<p style="${inlineStyle}; font-size: ${d.fontSize}; line-height: ${d.lineHeight}; text-align: ${d.textAlign};" data-bind="text">${d.text}</p>`;

      case 'callout-alert':
        return `
          <div class="nc-callout" style="${inlineStyle}; border-left: 4px solid ${d.borderColor};">
            <strong data-bind="title">${d.title}</strong>
            <p data-bind="text" style="margin-top: 4px;">${d.text}</p>
          </div>
        `;

      case 'badge-tag':
        return `<span class="nc-badge-chip" style="${inlineStyle}; display: inline-block;" data-bind="text">${d.text}</span>`;

      case 'interactive-counter':
        return `
          <div class="nc-counter-widget" style="${inlineStyle}">
            <span class="nc-counter-label" data-bind="label">${d.label}</span>
            <div class="nc-counter-row">
              <button class="nc-btn-count" style="background: ${d.btnColor}; color: white;" data-counter-btn>${d.btnText}</button>
              <span class="nc-counter-value" data-counter-val>${d.initialCount || 0}</span>
            </div>
          </div>
        `;

      case 'accordion-faq':
        return `
          <div class="nc-accordion" style="${inlineStyle}">
            <div class="nc-acc-header" data-acc-toggle>
              <span data-bind="question">${d.question}</span>
              <span class="nc-acc-arrow">▼</span>
            </div>
            <div class="nc-acc-body" data-bind="answer">${d.answer}</div>
          </div>
        `;

      case 'progress-bar':
        return `
          <div class="nc-progress-widget" style="${inlineStyle}">
            <div class="nc-progress-label-row">
              <span data-bind="label">${d.label}</span>
              <span><strong>${d.percent}%</strong></span>
            </div>
            <div class="nc-progress-track" style="background: ${d.trackColor}; height: ${d.height}; border-radius: ${d.borderRadius};">
              <div class="nc-progress-fill" style="width: ${d.percent}%; background: ${d.barColor}; height: 100%; border-radius: ${d.borderRadius};"></div>
            </div>
          </div>
        `;

      case 'todo-checklist':
        const itemsHtml = (d.items || []).map((it, idx) => `
          <label class="nc-todo-item ${it.checked ? 'completed' : ''}">
            <input type="checkbox" ${it.checked ? 'checked' : ''} data-todo-idx="${idx}">
            <span>${it.text}</span>
          </label>
        `).join('');
        return `
          <div class="nc-todo-widget" style="${inlineStyle}">
            <h4 data-bind="title" style="margin-bottom: 12px;">${d.title}</h4>
            <div class="nc-todo-list">${itemsHtml}</div>
          </div>
        `;

      case 'searchable-table':
        const ths = (d.headers || []).map(h => `<th>${h}</th>`).join('');
        const trs = (d.rows || []).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
        return `
          <div class="nc-table-widget" style="${inlineStyle}">
            <div class="nc-table-header">
              <h4 data-bind="title">${d.title}</h4>
              <input type="text" class="nc-table-search" placeholder="Tabloda ara..." data-table-search>
            </div>
            <table class="nc-styled-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs}</tbody>
            </table>
          </div>
        `;

      case 'drawing-canvas':
        return `
          <div class="nc-canvas-widget" style="${inlineStyle}">
            <div class="nc-canvas-top">
              <h4 data-bind="title">${d.title}</h4>
              <button class="nc-mini-btn" data-clear-canvas>Temizle</button>
            </div>
            <canvas class="nc-drawing-canvas" height="${d.canvasHeight || 180}" style="width: 100%; border: 2px dashed #cbd5e1; border-radius: 8px; background: #ffffff; cursor: crosshair;"></canvas>
          </div>
        `;

      case 'countdown-timer':
        return `
          <div class="nc-countdown-widget" style="${inlineStyle}">
            <h4 data-bind="title">${d.title}</h4>
            <div class="nc-countdown-digits">
              <span class="digit-box" data-timer-min>${String(d.minutes || 15).padStart(2, '0')}</span>
              <span class="digit-colon">:</span>
              <span class="digit-box" data-timer-sec>${String(d.seconds || 0).padStart(2, '0')}</span>
            </div>
          </div>
        `;

      case 'image-card':
        return `
          <div class="nc-image-widget" style="${inlineStyle}">
            <img src="${d.imageUrl}" alt="${d.caption || ''}" style="width: 100%; height: auto; border-radius: ${d.borderRadius || '8px'}; display: block;">
            ${d.caption ? `<p class="nc-image-caption" data-bind="caption" style="margin-top: 8px; font-size: 0.85rem; color: #64748b; text-align: center;">${d.caption}</p>` : ''}
          </div>
        `;

      case 'kpi-stat-card':
        return `
          <div class="nc-kpi-card" style="${inlineStyle}">
            <div class="nc-kpi-metric" data-bind="metric">${d.metric}</div>
            <div class="nc-kpi-label" data-bind="label">${d.label}</div>
            <div class="nc-kpi-change ${d.isPositive ? 'positive' : 'negative'}" data-bind="change">${d.change}</div>
          </div>
        `;

      case 'contact-form-widget':
        return `
          <div class="nc-form-widget" style="${inlineStyle}">
            <h3 data-bind="title" style="margin-bottom: 16px;">${d.title}</h3>
            <div class="nc-form-group"><input type="text" placeholder="Adınız Soyadınız" class="nc-form-input"></div>
            <div class="nc-form-group"><input type="email" placeholder="E-posta Adresiniz" class="nc-form-input"></div>
            <div class="nc-form-group"><textarea placeholder="Mesajınız..." class="nc-form-textarea" rows="3"></textarea></div>
            <button class="nc-form-submit-btn">${d.buttonText}</button>
          </div>
        `;

      default:
        return `<div style="${inlineStyle}">Bileşen: ${block.componentId}</div>`;
    }
  }

  // Tuval İçi Canlı İnteraktif Davranışları Bağla
  attachInteractiveBehaviors(containerEl) {
    // 1. Sayaç
    containerEl.querySelectorAll('[data-counter-btn]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const valEl = btn.parentElement.querySelector('[data-counter-val]');
        if (valEl) {
          let count = parseInt(valEl.textContent, 10) || 0;
          valEl.textContent = count + 1;
        }
      };
    });

    // 2. Akordiyon
    containerEl.querySelectorAll('[data-acc-toggle]').forEach(hdr => {
      hdr.onclick = (e) => {
        e.stopPropagation();
        const body = hdr.nextElementSibling;
        if (body) {
          const isVisible = body.style.display === 'block';
          body.style.display = isVisible ? 'none' : 'block';
          const arrow = hdr.querySelector('.nc-acc-arrow');
          if (arrow) arrow.textContent = isVisible ? '▼' : '▲';
        }
      };
    });

    // 3. Tablo Arama
    containerEl.querySelectorAll('[data-table-search]').forEach(input => {
      input.oninput = () => {
        const query = input.value.toLowerCase();
        const table = input.closest('.nc-table-widget').querySelector('table');
        if (table) {
          table.querySelectorAll('tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
          });
        }
      };
    });

    // 4. Çizim Tuvali
    containerEl.querySelectorAll('.nc-drawing-canvas').forEach(canvas => {
      const ctx = canvas.getContext('2d');
      let isDrawing = false;

      canvas.onmousedown = (e) => {
        isDrawing = true;
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      };

      window.addEventListener('mouseup', () => { isDrawing = false; });

      canvas.onmousemove = (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#6366f1';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      };

      const clearBtn = canvas.parentElement.querySelector('[data-clear-canvas]');
      if (clearBtn) {
        clearBtn.onclick = (e) => {
          e.stopPropagation();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
      }
    });
  }

  // Standart Dokümana Paketle (.hrav Olarak Kaydetmek İçin)
  exportToDocument(title = 'Meren No-Code Dokümanı') {
    let combinedHtml = '';
    this.blocks.forEach(b => {
      combinedHtml += `<div class="meren-rendered-block" id="${b.id}">\n${this.generateBlockHtml(b)}\n</div>\n`;
    });

    return {
      version: '2.0',
      title: title,
      blocks: this.blocks, // JSON No-Code Ağacı
      html: combinedHtml,
      css: '',
      js: '',
      metadata: { builder: 'MerenStudio-NoCode', timestamp: new Date().toISOString() }
    };
  }

  // Dokümandan Yükle
  loadFromDocument(doc) {
    if (doc.blocks && Array.isArray(doc.blocks) && doc.blocks.length > 0) {
      this.blocks = doc.blocks;
    } else {
      // Varsayılan Başlangıç Şablonu
      this.blocks = [];
      this.addComponent('hero-section');
      this.addComponent('grid-2-col');
      this.addComponent('interactive-counter');
      this.addComponent('todo-checklist');
    }
    this.selectedBlockId = this.blocks.length > 0 ? this.blocks[0].id : null;
    this.emit('change', this.blocks);
    this.emit('select', this.getSelectedBlock());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NoCodeEngine };
}
