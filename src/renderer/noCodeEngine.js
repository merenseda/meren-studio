// Meren Studio - No-Code Kasa ve Günlük Tuval Motoru (Sürükleme & Boyutlandırma Destekli)

class NoCodeEngine {
  constructor() {
    this.blocks = [];
    this.selectedBlockId = null;
    this.isReadOnly = false;
    this.tableFilters = {};
    this.draggedBlockId = null;
    this.listeners = {
      change: [],
      select: []
    };
  }

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

  setReadOnly(readOnly) {
    this.isReadOnly = readOnly;
    if (this.isReadOnly) {
      this.selectedBlockId = null;
      this.emit('select', null);
    }
  }

  // Yeni Bileşen Ekle
  addComponent(componentId, atIndex = null) {
    if (this.isReadOnly) return null;

    const compDef = COMPONENT_REGISTRY.find(c => c.id === componentId);
    if (!compDef) return null;

    const blockId = 'block_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newBlock = {
      id: blockId,
      componentId: componentId,
      rowId: 'row_' + blockId, // Her bileşen varsayılan olarak kendi bağımsız satırında başlar
      data: JSON.parse(JSON.stringify(compDef.defaultData)),
      customStyles: { width: '100%' }
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

  removeBlock(blockId) {
    if (this.isReadOnly) return;
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

  moveBlock(blockId, direction) {
    if (this.isReadOnly) return;
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= this.blocks.length) return;

    const [item] = this.blocks.splice(idx, 1);
    this.blocks.splice(targetIdx, 0, item);
    this.emit('change', this.blocks);
  }

  // Bileşeni Ayrı Bağımsız Satıra Al
  separateBlockToNewRow(blockId) {
    if (this.isReadOnly) return;
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      block.rowId = 'row_' + block.id + '_' + Date.now();
      if (!block.customStyles) block.customStyles = {};
      block.customStyles.width = '100%';
      this.emit('change', this.blocks);
      this.showToast('↩️ Bileşen bağımsız satıra alındı.');
    }
  }

  // Sürükle ve Bırak ile Yeniden Sıralama & Yan Yana Yerleştirme
  reorderBlock(sourceId, targetId, position = 'bottom') {
    if (this.isReadOnly || sourceId === targetId) return;
    const srcIdx = this.blocks.findIndex(b => b.id === sourceId);
    const targetIdx = this.blocks.findIndex(b => b.id === targetId);
    if (srcIdx === -1 || targetIdx === -1) return;

    const source = this.blocks[srcIdx];
    const target = this.blocks[targetIdx];

    this.blocks.splice(srcIdx, 1);
    let newTargetIdx = this.blocks.findIndex(b => b.id === targetId);

    // Yan Yana Yerleştirme (Sağa veya Sola Bırakıldığında)
    if (position === 'left' || position === 'right') {
      source.rowId = target.rowId || ('row_' + target.id);
      target.rowId = source.rowId;

      if (!source.customStyles) source.customStyles = {};
      if (!target.customStyles) target.customStyles = {};

      source.customStyles.width = 'calc(50% - 8px)';
      target.customStyles.width = 'calc(50% - 8px)';

      if (position === 'left') {
        this.blocks.splice(newTargetIdx, 0, source);
      } else {
        this.blocks.splice(newTargetIdx + 1, 0, source);
      }
      this.showToast('🔗 Bileşenler yan yana yerleştirildi!');
    } 
    // Alt Alta Sıralama (Üste veya Alta Bırakıldığında - Bağımsız Satır Kalır)
    else {
      source.rowId = 'row_' + source.id + '_' + Date.now();
      if (position === 'top' || position === true) {
        this.blocks.splice(newTargetIdx, 0, source);
      } else {
        this.blocks.splice(newTargetIdx + 1, 0, source);
      }
    }

    this.selectBlock(sourceId);
    this.emit('change', this.blocks);
  }

  duplicateBlock(blockId) {
    if (this.isReadOnly) return;
    const idx = this.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;

    const source = this.blocks[idx];
    const newBlockId = 'block_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const cloned = {
      id: newBlockId,
      componentId: source.componentId,
      rowId: 'row_' + newBlockId,
      data: JSON.parse(JSON.stringify(source.data)),
      customStyles: JSON.parse(JSON.stringify(source.customStyles || {}))
    };

    this.blocks.splice(idx + 1, 0, cloned);
    this.selectBlock(newBlockId);
    this.emit('change', this.blocks);
  }

  selectBlock(blockId) {
    if (this.isReadOnly) {
      this.selectedBlockId = null;
      this.emit('select', null);
      return;
    }
    this.selectedBlockId = blockId;

    // DOM üzerindeki .selected sınıflarını anında güncelle
    const canvas = document.getElementById('visualCanvas');
    if (canvas) {
      canvas.querySelectorAll('.canvas-block').forEach(b => {
        if (b.dataset.blockId === blockId) {
          b.classList.add('selected');
        } else {
          b.classList.remove('selected');
        }
      });
    }

    this.emit('select', this.getSelectedBlock());
  }

  getSelectedBlock() {
    return this.blocks.find(b => b.id === this.selectedBlockId) || null;
  }

  updateBlockData(blockId, field, value) {
    if (this.isReadOnly) return;
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      block.data[field] = value;
      this.emit('change', this.blocks);
    }
  }

  updateBlockStyle(blockId, styleProp, value) {
    if (this.isReadOnly) return;
    const block = this.blocks.find(b => b.id === blockId);
    if (block) {
      if (!block.customStyles) block.customStyles = {};
      block.customStyles[styleProp] = value;
      this.emit('change', this.blocks);
    }
  }

  generateStrongPassword(length = 16) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|';
    let pass = '';
    const randomVals = new Uint32Array(length);
    window.crypto.getRandomValues(randomVals);
    for (let i = 0; i < length; i++) {
      pass += chars[randomVals[i] % chars.length];
    }
    return pass;
  }

  // Tuval Render (Satır Tabanlı Bağımsız Yerleşim)
  renderCanvas(containerEl, isPreviewMode = false) {
    containerEl.innerHTML = '';

    if (this.blocks.length === 0) {
      containerEl.innerHTML = `
        <div class="empty-canvas-state">
          <div class="empty-icon" style="font-size: 3rem; margin-bottom: 12px; opacity: 0.7;">✨</div>
          <h3 style="color: #1e293b; font-size: 1.25rem; margin-bottom: 6px;">Boş Çalışma Alanı</h3>
          <p style="color: #64748b; font-size: 0.9rem;">Sol menüden istediğiniz bileşene tıklayarak sayfanızı oluşturmaya başlayın.</p>
        </div>
      `;
      return;
    }

    const allowEditing = !isPreviewMode && !this.isReadOnly;

    // Blokları ardışık rowId'lerine göre satırlar halinde grupla
    const rows = [];
    let currentRow = null;
    this.blocks.forEach(block => {
      const rId = block.rowId || ('row_' + block.id);
      block.rowId = rId;
      if (!currentRow || currentRow.id !== rId) {
        currentRow = { id: rId, blocks: [block] };
        rows.push(currentRow);
      } else {
        currentRow.blocks.push(block);
      }
    });

    let globalBlockIndex = 0;

    rows.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'canvas-row';
      rowEl.dataset.rowId = row.id;

      row.blocks.forEach(block => {
        const index = globalBlockIndex++;
        const blockWrap = document.createElement('div');
        blockWrap.className = 'canvas-block' + (block.id === this.selectedBlockId && allowEditing ? ' selected' : '') + (this.isReadOnly ? ' read-only-mode' : '');
        blockWrap.dataset.blockId = block.id;

        // Genişlik: Eğer kullanıcı özel boyut verdiyse onu uygula, yoksa satırdaki blok sayısına göre dağıt
        if (block.customStyles && block.customStyles.width) {
          blockWrap.style.width = block.customStyles.width;
        } else if (row.blocks.length > 1) {
          blockWrap.style.width = `calc(${Math.floor(100 / row.blocks.length)}% - 8px)`;
        } else {
          blockWrap.style.width = '100%';
        }

        // Hızlı Kontrol Çubuğu & Taşıma Tutamacı
        if (allowEditing) {
          const toolbar = document.createElement('div');
          toolbar.className = 'block-floating-toolbar';
          
          let separateBtnHtml = '';
          if (row.blocks.length > 1) {
            separateBtnHtml = `<button class="action-mini-btn btn-separate" title="Ayrı Bağımsız Satıra Al">↩️ Ayır</button>`;
          }

          toolbar.innerHTML = `
            <button class="action-mini-btn drag-handle" title="Taşımak için Sürükleyin (Sağ/Sol: Yan Yana, Üst/Alt: Ayrı Satır)" draggable="true">⋮⋮</button>
            ${separateBtnHtml}
            <button class="action-mini-btn btn-up" title="Yukarı Taşı" ${index === 0 ? 'disabled' : ''}>⬆️</button>
            <button class="action-mini-btn btn-down" title="Aşağı Taşı" ${index === this.blocks.length - 1 ? 'disabled' : ''}>⬇️</button>
            <button class="action-mini-btn btn-duplicate" title="Çoğalt">📋</button>
            <button class="action-mini-btn btn-delete danger" title="Sil">🗑️</button>
          `;

          toolbar.querySelector('.btn-up').onclick = (e) => { e.stopPropagation(); this.moveBlock(block.id, -1); };
          toolbar.querySelector('.btn-down').onclick = (e) => { e.stopPropagation(); this.moveBlock(block.id, 1); };
          toolbar.querySelector('.btn-duplicate').onclick = (e) => { e.stopPropagation(); this.duplicateBlock(block.id); };
          toolbar.querySelector('.btn-delete').onclick = (e) => { e.stopPropagation(); this.removeBlock(block.id); };

          const sepBtn = toolbar.querySelector('.btn-separate');
          if (sepBtn) {
            sepBtn.onclick = (e) => { e.stopPropagation(); this.separateBlockToNewRow(block.id); };
          }

          blockWrap.appendChild(toolbar);

          // Kenar Boyutlandırma Tutamaçları
          const resizeHandleRight = document.createElement('div');
          resizeHandleRight.className = 'block-resize-handle block-resize-handle-right';
          resizeHandleRight.title = 'Genişliği Ayarla (Sürükleyin)';
          blockWrap.appendChild(resizeHandleRight);

          const resizeHandleBottom = document.createElement('div');
          resizeHandleBottom.className = 'block-resize-handle block-resize-handle-bottom';
          resizeHandleBottom.title = 'İç Boşluğu Ayarla (Sürükleyin)';
          blockWrap.appendChild(resizeHandleBottom);
        }

        // İçerik Alanı
        const contentEl = document.createElement('div');
        contentEl.className = 'block-content-area';
        contentEl.innerHTML = this.generateBlockHtml(block);

        // Inline Metin Düzenleme
        if (allowEditing) {
          contentEl.querySelectorAll('[data-bind]').forEach(editable => {
            editable.contentEditable = 'true';
            editable.spellcheck = false;
            editable.addEventListener('input', () => {
              const field = editable.dataset.bind;
              block.data[field] = editable.innerText;
              
              if (block.componentId === 'journal-entry-card') {
                const counter = blockWrap.querySelector('.nc-journal-counter');
                if (counter) {
                  const words = editable.innerText.trim() ? editable.innerText.trim().split(/\s+/).length : 0;
                  counter.textContent = `💬 ${words} Kelime • ${editable.innerText.length} Karakter`;
                }
              }
              this.emit('select', block);
            });
          });
        }

        blockWrap.appendChild(contentEl);

        // Seçim
        if (allowEditing) {
          blockWrap.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.action-mini-btn') && !e.target.closest('.block-resize-handle')) {
              this.selectBlock(block.id);
            }
          });
        }

        rowEl.appendChild(blockWrap);
      });

      containerEl.appendChild(rowEl);
    });

    // Boş alana tıklanınca seçimi kaldır
    if (allowEditing && !this._emptyAreaListenerAdded) {
      this._emptyAreaListenerAdded = true;
      const viewport = document.getElementById('canvasViewport');
      if (viewport) {
        viewport.addEventListener('mousedown', (e) => {
          if (!e.target.closest('.canvas-block') && !e.target.closest('.sidebar-inspector') && !e.target.closest('.sidebar-palette') && !e.target.closest('.app-header')) {
            this.selectBlock(null);
          }
        });
      }
    }

    this.attachInteractiveBehaviors(containerEl);
    if (allowEditing) {
      this.attachDragAndResizeListeners(containerEl);
    }
  }

  // Sürükle-Bırak 4 Yönlü Sıralama ve Kenardan Boyutlandırma Olayları
  attachDragAndResizeListeners(containerEl) {
    const blocks = containerEl.querySelectorAll('.canvas-block');

    blocks.forEach(blockEl => {
      const dragHandle = blockEl.querySelector('.drag-handle');
      if (dragHandle) {
        dragHandle.addEventListener('dragstart', (e) => {
          this.draggedBlockId = blockEl.dataset.blockId;
          blockEl.classList.add('is-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', this.draggedBlockId);
        });

        dragHandle.addEventListener('dragend', () => {
          blockEl.classList.remove('is-dragging');
          blocks.forEach(b => b.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right'));
          this.draggedBlockId = null;
        });
      }

      blockEl.addEventListener('dragover', (e) => {
        if (!this.draggedBlockId || this.draggedBlockId === blockEl.dataset.blockId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = blockEl.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;

        blockEl.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right');

        // Sol kenara yakınsa yan yana sol
        if (relX < 0.25) {
          blockEl.classList.add('drag-over-left');
          this._dropPosition = 'left';
        } 
        // Sağ kenara yakınsa yan yana sağ
        else if (relX > 0.75) {
          blockEl.classList.add('drag-over-right');
          this._dropPosition = 'right';
        } 
        // Üst yarıysa bağımsız üst satır
        else if (relY < 0.5) {
          blockEl.classList.add('drag-over-top');
          this._dropPosition = 'top';
        } 
        // Alt yarıysa bağımsız alt satır
        else {
          blockEl.classList.add('drag-over-bottom');
          this._dropPosition = 'bottom';
        }
      });

      blockEl.addEventListener('dragleave', () => {
        blockEl.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right');
      });

      blockEl.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!this.draggedBlockId || this.draggedBlockId === blockEl.dataset.blockId) return;

        const pos = this._dropPosition || 'bottom';
        blockEl.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right');
        this.reorderBlock(this.draggedBlockId, blockEl.dataset.blockId, pos);
      });
    });

    // 2. Kenardan Boyutlandırma (Resize handles dragging - Taşmayı Kesinlikle Engeller)
    containerEl.querySelectorAll('.block-resize-handle-right').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const blockEl = handle.closest('.canvas-block');
        const blockId = blockEl.dataset.blockId;
        const initialWidth = blockEl.offsetWidth;
        const startX = e.clientX;

        const onMouseMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          let newWidth = initialWidth + deltaX;

          // Sayfadan taşmayı kesin olarak engelle: container iç genişliğini baz al
          const computedStyle = window.getComputedStyle(containerEl);
          const paddingLeft = parseFloat(computedStyle.paddingLeft) || 32;
          const paddingRight = parseFloat(computedStyle.paddingRight) || 32;
          const maxAvailableWidth = containerEl.clientWidth - paddingLeft - paddingRight;

          // Minimum 180px, maksimum sayfa genişliği (sayfadan çıkamaz)
          newWidth = Math.max(180, Math.min(newWidth, maxAvailableWidth));

          // Kolay yan yana yerleşim için akıllı yakalama (Snap)
          const halfWidth = Math.floor((maxAvailableWidth - 16) / 2);
          const thirdWidth = Math.floor((maxAvailableWidth - 32) / 3);
          const quarterWidth = Math.floor((maxAvailableWidth - 48) / 4);

          if (Math.abs(newWidth - halfWidth) < 18) {
            newWidth = halfWidth;
          } else if (Math.abs(newWidth - thirdWidth) < 18) {
            newWidth = thirdWidth;
          } else if (Math.abs(newWidth - quarterWidth) < 18) {
            newWidth = quarterWidth;
          } else if (Math.abs(newWidth - maxAvailableWidth) < 22) {
            newWidth = maxAvailableWidth;
          }

          blockEl.style.width = newWidth + 'px';
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);

          const computedStyle = window.getComputedStyle(containerEl);
          const paddingLeft = parseFloat(computedStyle.paddingLeft) || 32;
          const paddingRight = parseFloat(computedStyle.paddingRight) || 32;
          const maxAvailableWidth = containerEl.clientWidth - paddingLeft - paddingRight;
          const curPx = blockEl.offsetWidth;

          let finalWidth = curPx + 'px';
          if (curPx >= maxAvailableWidth - 15) {
            finalWidth = '100%';
          } else if (Math.abs(curPx - (maxAvailableWidth - 16) / 2) < 20) {
            finalWidth = 'calc(50% - 8px)';
          } else if (Math.abs(curPx - (maxAvailableWidth - 32) / 3) < 20) {
            finalWidth = 'calc(33.333% - 11px)';
          } else if (Math.abs(curPx - (maxAvailableWidth - 48) / 4) < 20) {
            finalWidth = 'calc(25% - 12px)';
          }

          this.updateBlockStyle(blockId, 'width', finalWidth);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });

    containerEl.querySelectorAll('.block-resize-handle-bottom').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const blockEl = handle.closest('.canvas-block');
        const blockId = blockEl.dataset.blockId;
        const startY = e.clientY;
        const block = this.blocks.find(b => b.id === blockId);
        const initialPadding = parseInt((block.customStyles && block.customStyles.padding) || (block.data && block.data.padding) || 20);

        const onMouseMove = (moveEvent) => {
          const deltaY = moveEvent.clientY - startY;
          let newPad = initialPadding + Math.round(deltaY / 2);
          if (newPad < 6) newPad = 6;
          if (newPad > 80) newPad = 80;
          const contentArea = blockEl.querySelector('.nc-vault-card, .nc-emergency-box, .nc-financial-card, .nc-health-card, .nc-journal-card, .nc-secret-card, .nc-idea-card, .nc-vault-hero, .nc-glass-card, .nc-todo-widget, .nc-table-widget');
          if (contentArea) contentArea.style.padding = newPad + 'px';
        };

        const onMouseUp = (upEvent) => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          const deltaY = upEvent.clientY - startY;
          let finalPad = initialPadding + Math.round(deltaY / 2);
          if (finalPad < 6) finalPad = 6;
          if (finalPad > 80) finalPad = 80;
          this.updateBlockStyle(blockId, 'padding', finalPad + 'px');
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  // Bileşen HTML Üretimi
  generateBlockHtml(block) {
    const d = block.data || {};
    const s = block.customStyles || {};
    const inlineStyle = `
      ${s.bgColor ? `background: ${s.bgColor};` : (d.bgGradient ? `background: ${d.bgGradient};` : (d.bgColor ? `background: ${d.bgColor};` : ''))}
      ${s.textColor ? `color: ${s.textColor};` : (d.textColor ? `color: ${d.textColor};` : '')}
      ${s.padding ? `padding: ${s.padding};` : (d.padding ? `padding: ${d.padding};` : '')}
      ${s.margin ? `margin: ${s.margin};` : (d.margin ? `margin: ${d.margin};` : '')}
      ${s.borderRadius ? `border-radius: ${s.borderRadius};` : (d.borderRadius ? `border-radius: ${d.borderRadius};` : '')}
      ${s.shadow ? `box-shadow: ${s.shadow};` : (d.shadow ? `box-shadow: ${d.shadow};` : '')}
      ${d.borderColor ? `border-left: 4px solid ${d.borderColor};` : ''}
    `;

    switch (block.componentId) {
      // 1. ŞİFRE VE HESAP KASASI
      case 'vault-password-card':
        return `
          <div class="nc-vault-card" style="${inlineStyle}">
            <div class="nc-vault-header-row">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="nc-vault-icon">🔐</span>
                <h3 class="nc-vault-title" data-bind="accountName">${d.accountName}</h3>
              </div>
              <button class="nc-tool-btn generate-pass-btn" data-action="generate-password" title="16 Haneli Güçlü Şifre Üret">
                🎲 Şifre Üret
              </button>
            </div>
            
            <div class="nc-vault-grid">
              <div class="nc-field-group">
                <span class="nc-field-label">Kullanıcı Adı / E-posta:</span>
                <div class="nc-inline-copy-row">
                  <strong class="nc-field-value" data-bind="username">${d.username}</strong>
                  <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.username)}" title="Kullanıcı Adını Kopyala">📋</button>
                </div>
              </div>
              
              <div class="nc-field-group">
                <span class="nc-field-label">Şifre:</span>
                <div class="nc-password-mask-row">
                  <span class="nc-masked-text" data-actual-pass="${escapeHtml(d.password)}">••••••••••••</span>
                  <button class="nc-mask-toggle-btn" data-toggle-mask title="Şifreyi Göster/Gizle">👁️ Göster</button>
                  <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.password)}" title="Şifreyi Kopyala">📋 Kopyala</button>
                </div>
              </div>
            </div>

            ${d.notes ? `<div class="nc-vault-notes"><small>📌 Not:</small> <span data-bind="notes">${d.notes}</span></div>` : ''}
          </div>
        `;

      // 2. ACİL DURUM TALİMATLARI
      case 'vault-emergency-instructions':
        const steps = Array.isArray(d.steps) ? d.steps : [d.step1 || '1. Talimat', d.step2 || '2. Talimat'];
        const stepsHtml = steps.map((step, sIdx) => `
          <div class="nc-step-row">
            <span class="nc-step-num">${sIdx + 1}.</span>
            <div class="nc-step-text" contenteditable="true" data-step-idx="${sIdx}">${step.replace(/^\d+\.\s*/, '')}</div>
            <button class="nc-item-del-btn" data-del-step="${sIdx}" title="Bu adımı sil">×</button>
          </div>
        `).join('');

        return `
          <div class="nc-emergency-box" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 class="nc-emergency-title" data-bind="title">${d.title}</h3>
              <span class="nc-urgency-pill">${d.urgency || 'Yüksek Öncelik'}</span>
            </div>
            <div class="nc-steps-container">${stepsHtml}</div>
            <button class="nc-add-action-btn" data-action="add-step">➕ Yeni Adım Ekle</button>
          </div>
        `;

      // 3. FİNANS VE VARLIK KAYDI
      case 'vault-financial-card':
        return `
          <div class="nc-financial-card" style="${inlineStyle}">
            <div class="nc-financial-top">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="nc-fin-icon">💳</span>
                <h3 data-bind="bankName">${d.bankName}</h3>
              </div>
              <span class="nc-currency-badge">${d.currency || 'TL (₺)'}</span>
            </div>
            <div class="nc-iban-box">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="nc-iban-label">IBAN / Hesap No:</span>
                <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.accountNumber)}" title="IBAN Kopyala">📋 IBAN Kopyala</button>
              </div>
              <code class="nc-iban-code" data-bind="accountNumber">${d.accountNumber}</code>
            </div>
            <div class="nc-fin-details">
              <div><small>Hesap Türü:</small> <span data-bind="branchOrType">${d.branchOrType}</span></div>
              ${d.additionalAssets ? `<div style="margin-top: 4px;"><small>Ek Not / Poliçe:</small> <span data-bind="additionalAssets">${d.additionalAssets}</span></div>` : ''}
            </div>
          </div>
        `;

      // 4. SAĞLIK VE ACİL İRTİBAT
      case 'vault-health-card':
        const bloodTypes = ['A Rh (+)', '0 Rh (+)', 'B Rh (+)', 'AB Rh (+)', 'A Rh (-)', '0 Rh (-)', 'B Rh (-)'];
        const bloodChips = bloodTypes.map(bt => `
          <button class="blood-chip ${d.bloodType === bt ? 'active' : ''}" data-set-blood="${bt}">${bt}</button>
        `).join('');

        return `
          <div class="nc-health-card" style="${inlineStyle}">
            <div class="nc-health-top">
              <span class="nc-health-icon">🏥</span>
              <div>
                <h3 data-bind="fullName">${d.fullName}</h3>
                <div class="blood-chips-row">${bloodChips}</div>
              </div>
            </div>
            <div class="nc-health-grid">
              <div><small>Alerjiler:</small> <p data-bind="allergies">${d.allergies}</p></div>
              <div><small>Kronik / İlaç:</small> <p data-bind="chronicConditions">${d.chronicConditions}</p></div>
            </div>
            <div class="nc-emergency-contact-box">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>🚨 <strong>Acil İrtibat:</strong> <span data-bind="emergencyContact">${d.emergencyContact}</span></div>
                <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.emergencyContact)}" title="Numarayı Kopyala">📞 Kopyala</button>
              </div>
            </div>
          </div>
        `;

      // 5. TARİHLİ GÜNLÜK GİRDİSİ
      case 'journal-entry-card':
        const moods = ['⛅ Düşünceli', '😊 Mutlu', '🔥 Enerjik', '🎯 Odaklanmış', '🌧️ Yorgun'];
        const moodChips = moods.map(m => `
          <button class="mood-chip ${d.mood === m ? 'active' : ''}" data-set-mood="${m}">${m}</button>
        `).join('');

        const words = (d.body || '').trim() ? (d.body || '').trim().split(/\s+/).length : 0;

        return `
          <div class="nc-journal-card" style="${inlineStyle}">
            <div class="nc-journal-meta">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="nc-journal-date">📅 <span data-bind="date">${d.date}</span></span>
                <button class="nc-mini-tag-btn" data-action="set-today-date" title="Şu Anki Tarih ve Saati Ayarla">⏰ Şimdi</button>
              </div>
              <div class="mood-chips-group">${moodChips}</div>
            </div>
            <h2 class="nc-journal-title" data-bind="title">${d.title}</h2>
            <div class="nc-journal-body" data-bind="body">${d.body}</div>
            <div class="nc-journal-footer">
              <span class="nc-journal-counter">💬 ${words} Kelime • ${(d.body || '').length} Karakter</span>
            </div>
          </div>
        `;

      // 6. GİZLİ KİŞİSEL NOT
      case 'secret-note-card':
        return `
          <div class="nc-secret-card" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="nc-secret-badge" data-bind="tag">${d.tag}</div>
              <button class="nc-blur-toggle-btn" data-action="toggle-blur" title="Gizlilik Perdesini Aç/Kapat">
                ${d.isBlurred ? '👁️ Perdeyi Aç' : '🙈 Gizle'}
              </button>
            </div>
            <p class="nc-secret-note ${d.isBlurred ? 'blurred' : ''}" data-bind="note">${d.note}</p>
          </div>
        `;

      // 7. HIZLI FİKİR KAPSÜLÜ
      case 'quick-idea-card':
        const priorities = ['⭐ Önemli', '🔥 Acil', '💡 Fikir'];
        const prioChips = priorities.map(p => `
          <button class="prio-chip ${d.priority === p ? 'active' : ''}" data-set-prio="${p}">${p}</button>
        `).join('');

        return `
          <div class="nc-idea-card ${d.isCompleted ? 'completed-card' : ''}" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="prio-chips-group">${prioChips}</div>
              <label class="nc-idea-chk-label">
                <input type="checkbox" ${d.isCompleted ? 'checked' : ''} data-action="toggle-idea-done">
                <span>Tamamlandı</span>
              </label>
            </div>
            <h4 data-bind="title" style="margin-bottom: 6px;">${d.title}</h4>
            <p data-bind="description" style="line-height: 1.5; font-size: 0.95rem;">${d.description}</p>
          </div>
        `;

      // 8. KASA / GÜNLÜK ANA BAŞLIĞI
      case 'hero-vault-header':
        return `
          <div class="nc-vault-hero" style="${inlineStyle}">
            <div class="nc-shield-badge">🔒 AES-256 Şifreli Dijital Kasa</div>
            <h1 class="nc-hero-title" data-bind="title">${d.title}</h1>
            <p class="nc-hero-sub" data-bind="subtitle">${d.subtitle}</p>
          </div>
        `;

      // 9. BUZLU CAM KART
      case 'glass-vault-card':
        return `
          <div class="nc-glass-card" style="${inlineStyle}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4);">
            <h3 data-bind="title" style="margin-bottom: 8px;">${d.title}</h3>
            <p data-bind="text" style="line-height: 1.6;">${d.text}</p>
          </div>
        `;

      // 10. AYIRICI ÇİZGİ
      case 'vault-divider':
        return `<hr style="border: none; border-top: 1px solid ${d.lineColor || '#e2e8f0'}; margin: ${d.margin || '20px'} 0;">`;

      // 11. GÖREV / HEDEF LİSTESİ
      case 'vault-todo-list':
        const items = d.items || [];
        const completedCount = items.filter(it => it.checked).length;
        const totalCount = items.length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const itemsHtml = items.map((it, idx) => `
          <div class="nc-todo-row ${it.checked ? 'completed' : ''}">
            <input type="checkbox" ${it.checked ? 'checked' : ''} data-todo-idx="${idx}">
            <span class="nc-todo-text" contenteditable="true" data-todo-text-idx="${idx}">${it.text}</span>
            <button class="nc-item-del-btn" data-del-todo="${idx}" title="Görevi Sil">×</button>
          </div>
        `).join('');

        return `
          <div class="nc-todo-widget" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 data-bind="title">${d.title}</h4>
              <span class="nc-todo-stats">${completedCount}/${totalCount} Tamamlandı (%${percent})</span>
            </div>
            
            <div class="nc-progress-bar-track">
              <div class="nc-progress-bar-fill" style="width: ${percent}%"></div>
            </div>

            <div class="nc-todo-list">${itemsHtml}</div>

            <div class="nc-add-item-row">
              <input type="text" class="nc-new-item-input" placeholder="Yeni görev veya madde yazın..." data-todo-input>
              <button class="nc-add-action-btn" data-action="add-todo">➕ Ekle</button>
            </div>
          </div>
        `;

      // 12. KRİTİK BİLGİ TABLOSU
      case 'vault-info-table':
        const headers = d.headers || ['Kurum / Hizmet', 'Kullanıcı / No', 'Detay'];
        const rows = d.rows || [];
        const filterQuery = (this.tableFilters[block.id] || '').toLowerCase().trim();

        const filteredRows = rows.map((r, originalIdx) => ({ row: r, idx: originalIdx }))
          .filter(item => {
            if (!filterQuery) return true;
            return item.row.some(cell => String(cell).toLowerCase().includes(filterQuery));
          });

        const ths = headers.map(h => `<th>${h}</th>`).join('') + '<th style="width: 40px;"></th>';
        const trs = filteredRows.map(item => `
          <tr>
            ${item.row.map((cell, colIdx) => `
              <td contenteditable="true" data-table-row="${item.idx}" data-table-col="${colIdx}">${cell}</td>
            `).join('')}
            <td style="text-align: center;">
              <button class="nc-item-del-btn" data-del-table-row="${item.idx}" title="Satırı Sil">×</button>
            </td>
          </tr>
        `).join('');

        return `
          <div class="nc-table-widget" style="${inlineStyle}">
            <div class="nc-table-header-bar">
              <h4 data-bind="title">${d.title}</h4>
              <input type="text" class="nc-table-filter-input" placeholder="Tabloda ara..." value="${escapeHtml(filterQuery)}" data-table-filter>
            </div>
            <table class="nc-styled-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs.length > 0 ? trs : '<tr><td colspan="' + (headers.length + 1) + '" style="text-align:center; color:#94a3b8;">Kayıt bulunamadı.</td></tr>'}</tbody>
            </table>
            <button class="nc-add-action-btn" data-action="add-table-row" style="margin-top: 10px;">➕ Yeni Satır Ekle</button>
          </div>
        `;

      default:
        return `<div style="${inlineStyle}">Bileşen: ${block.componentId}</div>`;
    }
  }

  attachInteractiveBehaviors(containerEl) {
    // 1. Şifre Maskeleme / Göster - Gizle
    containerEl.querySelectorAll('[data-toggle-mask]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const maskRow = btn.closest('.nc-password-mask-row');
        const textEl = maskRow ? maskRow.querySelector('.nc-masked-text') : null;
        if (textEl) {
          const isRevealed = textEl.dataset.revealed === 'true';
          if (isRevealed) {
            textEl.textContent = '••••••••••••';
            textEl.dataset.revealed = 'false';
            btn.textContent = '👁️ Göster';
          } else {
            textEl.textContent = textEl.dataset.actualPass;
            textEl.dataset.revealed = 'true';
            btn.textContent = '🙈 Gizle';
          }
        }
      };
    });

    // 2. Panoya Kopyalama
    containerEl.querySelectorAll('[data-copy-text]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const text = btn.dataset.copyText;
        if (text) {
          navigator.clipboard.writeText(text);
          this.showToast('📋 Kopyalandı: ' + text);
        }
      };
    });

    // 3. Rastgele Şifre Üret
    containerEl.querySelectorAll('[data-action="generate-password"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          const newPass = this.generateStrongPassword(16);
          block.data.password = newPass;
          this.emit('change', this.blocks);
          this.showToast('🎲 16 Haneli Güçlü Şifre Üretildi!');
        }
      };
    });

    // 4. Todo Checklist İşaretleme
    containerEl.querySelectorAll('.nc-todo-row input[type="checkbox"]').forEach(chk => {
      chk.onchange = (e) => {
        e.stopPropagation();
        const blockWrap = chk.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const idx = parseInt(chk.dataset.todoIdx);
        if (block && block.data.items && block.data.items[idx] !== undefined) {
          block.data.items[idx].checked = chk.checked;
          this.emit('change', this.blocks);
        }
      };
    });

    // 5. Todo Madde Metin Düzenleme & Silme
    containerEl.querySelectorAll('[data-todo-text-idx]').forEach(el => {
      el.addEventListener('input', () => {
        const blockWrap = el.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const idx = parseInt(el.dataset.todoTextIdx);
        if (block && block.data.items && block.data.items[idx]) {
          block.data.items[idx].text = el.innerText;
        }
      });
    });

    containerEl.querySelectorAll('[data-del-todo]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const idx = parseInt(btn.dataset.delTodo);
        if (block && block.data.items) {
          block.data.items.splice(idx, 1);
          this.emit('change', this.blocks);
        }
      };
    });

    // 6. Todo Yeni Madde Ekle
    containerEl.querySelectorAll('[data-action="add-todo"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const input = blockWrap.querySelector('[data-todo-input]');
        if (block && input && input.value.trim()) {
          if (!block.data.items) block.data.items = [];
          block.data.items.push({ text: input.value.trim(), checked: false });
          this.emit('change', this.blocks);
        }
      };
    });

    // 7. Acil Durum Adım Ekle / Sil / Düzenle
    containerEl.querySelectorAll('[data-step-idx]').forEach(el => {
      el.addEventListener('input', () => {
        const blockWrap = el.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const idx = parseInt(el.dataset.stepIdx);
        if (block && block.data.steps && block.data.steps[idx] !== undefined) {
          block.data.steps[idx] = `${idx + 1}. ${el.innerText}`;
        }
      });
    });

    containerEl.querySelectorAll('[data-del-step]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const idx = parseInt(btn.dataset.delStep);
        if (block && block.data.steps) {
          block.data.steps.splice(idx, 1);
          this.emit('change', this.blocks);
        }
      };
    });

    containerEl.querySelectorAll('[data-action="add-step"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          if (!block.data.steps) block.data.steps = [];
          block.data.steps.push(`${block.data.steps.length + 1}. Yeni acil durum talimatı yazın...`);
          this.emit('change', this.blocks);
        }
      };
    });

    // 8. Sağlık Kan Grubu Çipleri
    containerEl.querySelectorAll('[data-set-blood]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          block.data.bloodType = btn.dataset.setBlood;
          this.emit('change', this.blocks);
        }
      };
    });

    // 9. Günlük Tarihini "Şimdi" Yap
    containerEl.querySelectorAll('[data-action="set-today-date"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          const nowStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' });
          block.data.date = nowStr;
          this.emit('change', this.blocks);
          this.showToast('📅 Günlük tarihi şu ana güncellendi!');
        }
      };
    });

    // 10. Günlük Ruh Hali Çipleri
    containerEl.querySelectorAll('[data-set-mood]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          block.data.mood = btn.dataset.setMood;
          this.emit('change', this.blocks);
        }
      };
    });

    // 11. Gizli Not Blur Perde Aç / Kapat
    containerEl.querySelectorAll('[data-action="toggle-blur"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          block.data.isBlurred = !block.data.isBlurred;
          this.emit('change', this.blocks);
        }
      };
    });

    // 12. Fikir Öncelik Çipleri & Tamamlandı
    containerEl.querySelectorAll('[data-set-prio]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          block.data.priority = btn.dataset.setPrio;
          this.emit('change', this.blocks);
        }
      };
    });

    containerEl.querySelectorAll('[data-action="toggle-idea-done"]').forEach(chk => {
      chk.onchange = (e) => {
        e.stopPropagation();
        const blockWrap = chk.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          block.data.isCompleted = chk.checked;
          this.emit('change', this.blocks);
        }
      };
    });

    // 13. Tablo Arama, Hücre Düzenleme, Satır Ekle/Sil
    containerEl.querySelectorAll('[data-table-filter]').forEach(input => {
      input.addEventListener('input', (e) => {
        const blockWrap = input.closest('.canvas-block');
        this.tableFilters[blockWrap.dataset.blockId] = e.target.value;
        this.renderCanvas(containerEl, false);
      });
    });

    containerEl.querySelectorAll('[data-table-row][data-table-col]').forEach(td => {
      td.addEventListener('input', () => {
        const blockWrap = td.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const rIdx = parseInt(td.dataset.tableRow);
        const cIdx = parseInt(td.dataset.tableCol);
        if (block && block.data.rows && block.data.rows[rIdx]) {
          block.data.rows[rIdx][cIdx] = td.innerText;
        }
      });
    });

    containerEl.querySelectorAll('[data-del-table-row]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        const rIdx = parseInt(btn.dataset.delTableRow);
        if (block && block.data.rows) {
          block.data.rows.splice(rIdx, 1);
          this.emit('change', this.blocks);
        }
      };
    });

    containerEl.querySelectorAll('[data-action="add-table-row"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const blockWrap = btn.closest('.canvas-block');
        const block = this.blocks.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          if (!block.data.rows) block.data.rows = [];
          const colCount = (block.data.headers || ['1', '2', '3']).length;
          const newRow = new Array(colCount).fill('Yeni Veri');
          block.data.rows.push(newRow);
          this.emit('change', this.blocks);
        }
      };
    });
  }

  showToast(message) {
    let toast = document.getElementById('merenAppToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'merenAppToast';
      toast.className = 'meren-app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  exportToDocument(title = 'yeni meren dosyası') {
    let combinedHtml = '';
    this.blocks.forEach(b => {
      combinedHtml += `<div class="meren-rendered-block" id="${b.id}">\n${this.generateBlockHtml(b)}\n</div>\n`;
    });

    return {
      version: '2.0',
      title: title,
      blocks: this.blocks,
      html: combinedHtml,
      css: '',
      js: '',
      metadata: { builder: 'MerenStudio', timestamp: new Date().toISOString() }
    };
  }

  loadFromDocument(doc) {
    if (doc.blocks && Array.isArray(doc.blocks)) {
      this.blocks = doc.blocks;
    } else {
      // Program ilk açıldığında veya yeni dosya istendiğinde sayfa TAMAMEN BOŞ başlar!
      this.blocks = [];
    }
    this.selectedBlockId = this.blocks.length > 0 ? this.blocks[0].id : null;
    this.emit('change', this.blocks);
    this.emit('select', this.getSelectedBlock());
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NoCodeEngine };
}
