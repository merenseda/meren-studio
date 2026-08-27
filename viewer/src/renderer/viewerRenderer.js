// Meren Viewer - %100 Salt Okunur (Read-Only) Görsel Doküman Motoru

class ViewerRenderer {
  constructor() {
    this.tableFilters = {};
  }

  renderDocument(docData, containerEl) {
    containerEl.innerHTML = '';

    if (!docData) {
      containerEl.innerHTML = `
        <div class="empty-viewer-state">
          <div class="empty-icon">📂</div>
          <h2>Görüntülenecek Doküman Yok</h2>
          <p>Lütfen yukarıdaki <strong>"Dosya Aç"</strong> butonuna tıklayın veya bir <code>.hrav</code> / <code>.meren</code> dosyasını buraya sürükleyip bırakın.</p>
        </div>
      `;
      return;
    }

    // 1. Eğer No-Code blokları varsa blokları satırlar halinde render et
    if (docData.blocks && Array.isArray(docData.blocks) && docData.blocks.length > 0) {
      const rows = [];
      let currentRow = null;
      docData.blocks.forEach(block => {
        const rId = block.rowId || ('row_' + block.id);
        if (!currentRow || currentRow.id !== rId) {
          currentRow = { id: rId, blocks: [block] };
          rows.push(currentRow);
        } else {
          currentRow.blocks.push(block);
        }
      });

      rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'viewer-row';
        rowEl.dataset.rowId = row.id;

        row.blocks.forEach(block => {
          const blockWrap = document.createElement('div');
          blockWrap.className = 'viewer-block';
          blockWrap.dataset.blockId = block.id;

          if (block.customStyles && block.customStyles.width) {
            blockWrap.style.width = block.customStyles.width;
          } else if (row.blocks.length > 1) {
            blockWrap.style.width = `calc(${Math.floor(100 / row.blocks.length)}% - 8px)`;
          } else {
            blockWrap.style.width = '100%';
          }

          blockWrap.innerHTML = this.generateBlockHtml(block);
          rowEl.appendChild(blockWrap);
        });

        containerEl.appendChild(rowEl);
      });
    } 
    // 2. Eski formatta düz HTML varsa HTML'i güvenle render et
    else if (docData.html) {
      const htmlWrap = document.createElement('div');
      htmlWrap.className = 'viewer-legacy-html';
      htmlWrap.innerHTML = docData.html;
      containerEl.appendChild(htmlWrap);
    } 
    else {
      containerEl.innerHTML = `
        <div class="empty-viewer-state">
          <div class="empty-icon">📄</div>
          <h2>Boş Doküman</h2>
          <p>Bu şifreli dosya içerisinde görüntülenecek herhangi bir içerik bulunmuyor.</p>
        </div>
      `;
      return;
    }

    this.attachInteractiveBehaviors(containerEl);
  }

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
      // 1. BAŞLIK
      case 'hero-vault-header':
        return `
          <div class="nc-vault-hero" style="${inlineStyle}">
            <h1 class="nc-hero-title">${escapeHtml(d.title)}</h1>
            <p class="nc-hero-sub">${escapeHtml(d.subtitle)}</p>
          </div>
        `;

      // 2. GÜNLÜK
      case 'journal-entry-card':
        const words = (d.body || '').trim() ? (d.body || '').trim().split(/\s+/).length : 0;
        return `
          <div class="nc-journal-card" style="${inlineStyle}">
            <div class="nc-journal-meta">
              <span class="nc-journal-date">📅 ${escapeHtml(d.date)}</span>
            </div>
            <h2 class="nc-journal-title">${escapeHtml(d.title)}</h2>
            <div class="nc-journal-body">${escapeHtml(d.body)}</div>
            <div class="nc-journal-footer">
              <span class="nc-journal-counter">💬 ${words} Kelime • ${(d.body || '').length} Karakter</span>
            </div>
          </div>
        `;

      // 3. ŞİFRE
      case 'vault-password-card':
        return `
          <div class="nc-vault-card" style="${inlineStyle}">
            <div class="nc-vault-header-row">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="nc-vault-icon">🔐</span>
                <h3 class="nc-vault-title">${escapeHtml(d.accountName)}</h3>
              </div>
              <span class="nc-viewer-badge">Salt Okunur</span>
            </div>
            
            <div class="nc-vault-grid">
              <div class="nc-field-group">
                <span class="nc-field-label">Kullanıcı Adı / E-posta:</span>
                <div class="nc-inline-copy-row">
                  <strong class="nc-field-value">${escapeHtml(d.username)}</strong>
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

            ${d.notes ? `<div class="nc-vault-notes"><small>📌 Not:</small> <span>${escapeHtml(d.notes)}</span></div>` : ''}
          </div>
        `;

      // 4. BANKA BİLGİLERİ
      case 'vault-financial-card':
        return `
          <div class="nc-financial-card" style="${inlineStyle}">
            <div class="nc-financial-top">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="nc-fin-icon">💳</span>
                <h3>${escapeHtml(d.bankName)}</h3>
              </div>
              <span class="nc-currency-badge">${escapeHtml(d.currency || 'TL (₺)')}</span>
            </div>
            <div class="nc-iban-box">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="nc-iban-label">IBAN / Hesap No:</span>
                <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.accountNumber || '')}" title="IBAN Kopyala">📋 IBAN Kopyala</button>
              </div>
              <code class="nc-iban-code">${escapeHtml(d.accountNumber || '')}</code>
            </div>
            <div class="nc-fin-details">
              <div><small>Hesap Türü:</small> <span>${escapeHtml(d.branchOrType || '')}</span></div>
              <div style="margin-top: 4px;"><small>Not:</small> <span>${escapeHtml(d.additionalAssets || '')}</span></div>
            </div>
          </div>
        `;

      // 5. ŞİFRELİ GÖRSEL / BELGE
      case 'vault-image-card':
        const hasImg = !!d.imageData;
        return `
          <div class="nc-image-card" style="${inlineStyle}">
            <div class="nc-image-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.2rem;">🖼️</span>
                <h4 style="margin:0; font-size:1.05rem; color:#0f172a;">${escapeHtml(d.caption || 'Belge / Evrak')}</h4>
              </div>
              <span class="nc-viewer-badge">Görsel Belge</span>
            </div>

            <div class="nc-image-viewer-box">
              ${hasImg ? `
                <img src="${d.imageData}" alt="${escapeHtml(d.caption || '')}" style="max-height: ${d.maxHeight || 380}px; object-fit: ${d.fit || 'contain'}; width: 100%; border-radius: 8px; display: block; cursor: pointer;" class="nc-vault-img-preview" data-action="zoom-image">
              ` : `
                <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
                  <span>Görsel veya evrak eklenmemiş.</span>
                </div>
              `}
            </div>
          </div>
        `;

      // 6. TABLO
      case 'vault-info-table':
        const headers = d.headers || ['Sütun 1', 'Sütun 2', 'Sütun 3'];
        const rows = d.rows || [];
        const filterQuery = (this.tableFilters[block.id] || '').toLowerCase().trim();

        const filteredRows = rows.filter(r => {
          if (!filterQuery) return true;
          return r.some(cell => String(cell).toLowerCase().includes(filterQuery));
        });

        const ths = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
        const trs = filteredRows.map(r => `
          <tr>
            ${r.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}
          </tr>
        `).join('');

        return `
          <div class="nc-table-widget" style="${inlineStyle}">
            <div class="nc-table-header-bar">
              <h4>${escapeHtml(d.title)}</h4>
              <input type="text" class="nc-table-filter-input" placeholder="Tabloda ara..." value="${escapeHtml(filterQuery)}" data-table-filter>
            </div>
            <table class="nc-styled-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs.length > 0 ? trs : '<tr><td colspan="' + headers.length + '" style="text-align:center; color:#94a3b8;">Kayıt bulunamadı.</td></tr>'}</tbody>
            </table>
          </div>
        `;

      // 7. AYIRICI ÇİZGİ
      case 'vault-divider':
        return `<hr style="border: none; border-top: 1px solid ${d.lineColor || '#e2e8f0'}; margin: ${d.margin || '20px'} 0;">`;

      default:
        return `<div style="${inlineStyle}">${escapeHtml(d.text || d.title || block.componentId)}</div>`;
    }
  }

  attachInteractiveBehaviors(containerEl) {
    // 1. Şifre Maskeleme Toggle
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

    // 2. Kopyalama Butonu
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

    // 3. Gizli Not Blur Toggle
    containerEl.querySelectorAll('[data-action="toggle-blur"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const card = btn.closest('.nc-secret-card');
        const noteEl = card ? card.querySelector('.nc-secret-note') : null;
        if (noteEl) {
          const isBlurred = noteEl.classList.toggle('blurred');
          btn.textContent = isBlurred ? '👁️ Perdeyi Aç' : '🙈 Gizle';
        }
      };
    });

    // 4. Tablo İçi Filtreleme
    containerEl.querySelectorAll('[data-table-filter]').forEach(input => {
      input.addEventListener('input', (e) => {
        const blockWrap = input.closest('.viewer-block');
        this.tableFilters[blockWrap.dataset.blockId] = e.target.value;
        const block = this.currentDoc?.blocks?.find(b => b.id === blockWrap.dataset.blockId);
        if (block) {
          blockWrap.innerHTML = this.generateBlockHtml(block);
          this.attachInteractiveBehaviors(containerEl);
        }
      });
    });
  }

  showToast(message) {
    let toast = document.getElementById('viewerToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'viewerToast';
      toast.className = 'viewer-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
