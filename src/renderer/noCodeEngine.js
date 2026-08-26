// Meren Studio - No-Code Kasa ve Günlük Tuval Motoru

class NoCodeEngine {
  constructor() {
    this.blocks = [];
    this.selectedBlockId = null;
    this.isReadOnly = false;
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

  // Bileşeni Taşı
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

  // Bileşeni Çoğalt
  duplicateBlock(blockId) {
    if (this.isReadOnly) return;
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
    if (this.isReadOnly) {
      this.selectedBlockId = null;
      this.emit('select', null);
      return;
    }
    this.selectedBlockId = blockId;
    this.emit('select', this.getSelectedBlock());
  }

  getSelectedBlock() {
    return this.blocks.find(b => b.id === this.selectedBlockId) || null;
  }

  // Veri / Stil Güncelle
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

  // Tuval Render
  renderCanvas(containerEl, isPreviewMode = false) {
    containerEl.innerHTML = '';

    if (this.blocks.length === 0) {
      containerEl.innerHTML = `
        <div class="empty-canvas-state">
          <div class="empty-icon">🛡️</div>
          <h3>Kişisel Kasanız ve Günlüğünüz Boş</h3>
          <p>Sol paneldeki Kasa veya Günlük bileşenlerine tıklayarak bilgilerinizi güvenle eklemeye başlayın.</p>
        </div>
      `;
      return;
    }

    const allowEditing = !isPreviewMode && !this.isReadOnly;

    this.blocks.forEach((block, index) => {
      const blockWrap = document.createElement('div');
      blockWrap.className = 'canvas-block' + (block.id === this.selectedBlockId && allowEditing ? ' selected' : '') + (this.isReadOnly ? ' read-only-mode' : '');
      blockWrap.dataset.blockId = block.id;

      // Hızlı Kontrol Çubuğu
      if (allowEditing) {
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

      // İçerik Alanı
      const contentEl = document.createElement('div');
      contentEl.className = 'block-content-area';
      contentEl.innerHTML = this.generateBlockHtml(block);

      // Inline Metin Düzenleme Olayları
      if (allowEditing) {
        contentEl.querySelectorAll('[data-bind]').forEach(editable => {
          editable.contentEditable = 'true';
          editable.spellcheck = false;
          editable.addEventListener('input', () => {
            const field = editable.dataset.bind;
            block.data[field] = editable.innerText;
            this.emit('select', block);
          });
        });
      }

      blockWrap.appendChild(contentEl);

      // Seçim
      if (allowEditing) {
        blockWrap.onclick = (e) => {
          e.stopPropagation();
          this.selectBlock(block.id);
        };
      }

      containerEl.appendChild(blockWrap);
    });

    this.attachInteractiveBehaviors(containerEl);
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
              <span class="nc-vault-icon">🔐</span>
              <h3 class="nc-vault-title" data-bind="accountName">${d.accountName}</h3>
            </div>
            <div class="nc-vault-grid">
              <div class="nc-field-group">
                <span class="nc-field-label">Kullanıcı Adı / E-posta:</span>
                <strong class="nc-field-value" data-bind="username">${d.username}</strong>
              </div>
              <div class="nc-field-group">
                <span class="nc-field-label">Şifre:</span>
                <div class="nc-password-mask-row">
                  <span class="nc-masked-text" data-actual-pass="${escapeHtml(d.password)}">••••••••••••</span>
                  <button class="nc-mask-toggle-btn" data-toggle-mask title="Şifreyi Göster/Gizle">👁️ Göster</button>
                </div>
              </div>
            </div>
            ${d.notes ? `<div class="nc-vault-notes"><small>📌 Not:</small> <span data-bind="notes">${d.notes}</span></div>` : ''}
          </div>
        `;

      // 2. ACİL DURUM TALİMATLARI
      case 'vault-emergency-instructions':
        return `
          <div class="nc-emergency-box" style="${inlineStyle}">
            <h3 class="nc-emergency-title" data-bind="title">${d.title}</h3>
            <div class="nc-steps-list">
              <p class="nc-step-item" data-bind="step1">${d.step1}</p>
              <p class="nc-step-item" data-bind="step2">${d.step2}</p>
              <p class="nc-step-item" data-bind="step3">${d.step3}</p>
            </div>
          </div>
        `;

      // 3. FİNANS VE VARLIK KAYDI
      case 'vault-financial-card':
        return `
          <div class="nc-financial-card" style="${inlineStyle}">
            <div class="nc-financial-top">
              <span class="nc-fin-icon">💳</span>
              <h3 data-bind="bankName">${d.bankName}</h3>
            </div>
            <div class="nc-iban-box">
              <span class="nc-iban-label">IBAN / Hesap No:</span>
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
        return `
          <div class="nc-health-card" style="${inlineStyle}">
            <div class="nc-health-top">
              <span class="nc-health-icon">🏥</span>
              <div>
                <h3 data-bind="fullName">${d.fullName}</h3>
                <span class="nc-blood-badge">Kan Grubu: <strong data-bind="bloodType">${d.bloodType}</strong></span>
              </div>
            </div>
            <div class="nc-health-grid">
              <div><small>Alerjiler:</small> <p data-bind="allergies">${d.allergies}</p></div>
              <div><small>Kronik / İlaç:</small> <p data-bind="chronicConditions">${d.chronicConditions}</p></div>
            </div>
            <div class="nc-emergency-contact-box">
              🚨 <strong>Acil İrtibat:</strong> <span data-bind="emergencyContact">${d.emergencyContact}</span>
            </div>
          </div>
        `;

      // 5. TARİHLİ GÜNLÜK GİRDİSİ
      case 'journal-entry-card':
        return `
          <div class="nc-journal-card" style="${inlineStyle}">
            <div class="nc-journal-meta">
              <span class="nc-journal-date">📅 <span data-bind="date">${d.date}</span></span>
              <span class="nc-journal-mood" data-bind="mood">${d.mood}</span>
            </div>
            <h2 class="nc-journal-title" data-bind="title">${d.title}</h2>
            <div class="nc-journal-body" data-bind="body">${d.body}</div>
          </div>
        `;

      // 6. GİZLİ KİŞİSEL NOT
      case 'secret-note-card':
        return `
          <div class="nc-secret-card" style="${inlineStyle}">
            <div class="nc-secret-badge" data-bind="tag">${d.tag}</div>
            <p class="nc-secret-note" data-bind="note">${d.note}</p>
          </div>
        `;

      // 7. HIZLI FİKİR KAPSÜLÜ
      case 'quick-idea-card':
        return `
          <div class="nc-idea-card" style="${inlineStyle}">
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

      // 12. KRİTİK BİLGİ TABLOSU
      case 'vault-info-table':
        const ths = (d.headers || []).map(h => `<th>${h}</th>`).join('');
        const trs = (d.rows || []).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
        return `
          <div class="nc-table-widget" style="${inlineStyle}">
            <h4 data-bind="title" style="margin-bottom: 10px;">${d.title}</h4>
            <table class="nc-styled-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs}</tbody>
            </table>
          </div>
        `;

      default:
        return `<div style="${inlineStyle}">Bileşen: ${block.componentId}</div>`;
    }
  }

  // İnteraktif Maskeleme ve Davranışlar
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

    // 2. Checklist İşaretleme
    containerEl.querySelectorAll('.nc-todo-item input[type="checkbox"]').forEach(chk => {
      chk.onchange = (e) => {
        const itemWrap = chk.closest('.nc-todo-item');
        if (itemWrap) {
          itemWrap.classList.toggle('completed', chk.checked);
        }
      };
    });
  }

  exportToDocument(title = 'Meren Kişisel Kasa & Günlük') {
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
      metadata: { builder: 'MerenStudio-Vault', timestamp: new Date().toISOString() }
    };
  }

  loadFromDocument(doc) {
    if (doc.blocks && Array.isArray(doc.blocks) && doc.blocks.length > 0) {
      this.blocks = doc.blocks;
    } else {
      // Varsayılan Başlangıç Kasa Şablonu
      this.blocks = [];
      this.addComponent('hero-vault-header');
      this.addComponent('vault-emergency-instructions');
      this.addComponent('vault-password-card');
      this.addComponent('journal-entry-card');
      this.addComponent('vault-health-card');
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
