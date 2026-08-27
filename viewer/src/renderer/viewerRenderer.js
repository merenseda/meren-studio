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

    // 1. Eğer No-Code blokları varsa blokları render et
    if (docData.blocks && Array.isArray(docData.blocks) && docData.blocks.length > 0) {
      docData.blocks.forEach((block) => {
        const blockWrap = document.createElement('div');
        blockWrap.className = 'viewer-block';
        blockWrap.dataset.blockId = block.id;
        if (block.customStyles && block.customStyles.width) {
          blockWrap.style.width = block.customStyles.width;
        }
        blockWrap.innerHTML = this.generateBlockHtml(block);
        containerEl.appendChild(blockWrap);
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
      // 1. ŞİFRE VE HESAP KASASI
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

      // 2. ACİL DURUM TALİMATLARI
      case 'vault-emergency-instructions':
        const steps = Array.isArray(d.steps) ? d.steps : [d.step1 || '1. Talimat', d.step2 || '2. Talimat'];
        const stepsHtml = steps.map((step, sIdx) => `
          <div class="nc-step-row">
            <span class="nc-step-num">${sIdx + 1}.</span>
            <div class="nc-step-text">${escapeHtml(step.replace(/^\d+\.\s*/, ''))}</div>
          </div>
        `).join('');

        return `
          <div class="nc-emergency-box" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 class="nc-emergency-title">${escapeHtml(d.title)}</h3>
              <span class="nc-urgency-pill">${escapeHtml(d.urgency || 'Yüksek Öncelik')}</span>
            </div>
            <div class="nc-steps-container">${stepsHtml}</div>
          </div>
        `;

      // 3. FİNANS VE VARLIK KAYDI
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
                <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.accountNumber)}" title="IBAN Kopyala">📋 IBAN Kopyala</button>
              </div>
              <code class="nc-iban-code">${escapeHtml(d.accountNumber)}</code>
            </div>
            <div class="nc-fin-details">
              <div><small>Hesap Türü:</small> <span>${escapeHtml(d.branchOrType)}</span></div>
              ${d.additionalAssets ? `<div style="margin-top: 4px;"><small>Ek Not / Poliçe:</small> <span>${escapeHtml(d.additionalAssets)}</span></div>` : ''}
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
                <h3>${escapeHtml(d.fullName)}</h3>
                <span class="blood-chip active" style="margin-top: 4px; display:inline-block;">Kan Grubu: ${escapeHtml(d.bloodType)}</span>
              </div>
            </div>
            <div class="nc-health-grid">
              <div><small>Alerjiler:</small> <p>${escapeHtml(d.allergies)}</p></div>
              <div><small>Kronik / İlaç:</small> <p>${escapeHtml(d.chronicConditions)}</p></div>
            </div>
            <div class="nc-emergency-contact-box">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>🚨 <strong>Acil İrtibat:</strong> <span>${escapeHtml(d.emergencyContact)}</span></div>
                <button class="nc-mini-copy-btn" data-copy-text="${escapeHtml(d.emergencyContact)}" title="Numarayı Kopyala">📞 Kopyala</button>
              </div>
            </div>
          </div>
        `;

      // 5. TARİHLİ GÜNLÜK GİRDİSİ
      case 'journal-entry-card':
        const words = (d.body || '').trim() ? (d.body || '').trim().split(/\s+/).length : 0;
        return `
          <div class="nc-journal-card" style="${inlineStyle}">
            <div class="nc-journal-meta">
              <span class="nc-journal-date">📅 ${escapeHtml(d.date)}</span>
              <span class="mood-chip active">${escapeHtml(d.mood || 'Günlük')}</span>
            </div>
            <h2 class="nc-journal-title">${escapeHtml(d.title)}</h2>
            <div class="nc-journal-body">${escapeHtml(d.body)}</div>
            <div class="nc-journal-footer">
              <span class="nc-journal-counter">💬 ${words} Kelime • ${(d.body || '').length} Karakter</span>
            </div>
          </div>
        `;

      // 6. GİZLİ KİŞİSEL NOT (BLUR PERDESİ)
      case 'secret-note-card':
        return `
          <div class="nc-secret-card" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="nc-secret-badge">${escapeHtml(d.tag)}</div>
              <button class="nc-blur-toggle-btn" data-action="toggle-blur" title="Gizlilik Perdesini Aç/Kapat">
                ${d.isBlurred ? '👁️ Perdeyi Aç' : '🙈 Gizle'}
              </button>
            </div>
            <p class="nc-secret-note ${d.isBlurred ? 'blurred' : ''}">${escapeHtml(d.note)}</p>
          </div>
        `;

      // 7. HIZLI FİKİR KAPSÜLÜ
      case 'quick-idea-card':
        return `
          <div class="nc-idea-card ${d.isCompleted ? 'completed-card' : ''}" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="prio-chip active">${escapeHtml(d.priority || 'Fikir')}</span>
              ${d.isCompleted ? '<span style="font-size:0.75rem; font-weight:bold;">✅ Tamamlandı</span>' : ''}
            </div>
            <h4 style="margin-bottom: 6px;">${escapeHtml(d.title)}</h4>
            <p style="line-height: 1.5; font-size: 0.95rem;">${escapeHtml(d.description)}</p>
          </div>
        `;

      // 8. KASA / GÜNLÜK ANA BAŞLIĞI
      case 'hero-vault-header':
        return `
          <div class="nc-vault-hero" style="${inlineStyle}">
            <div class="nc-shield-badge">🔒 AES-256 Şifreli Dijital Doküman</div>
            <h1 class="nc-hero-title">${escapeHtml(d.title)}</h1>
            <p class="nc-hero-sub">${escapeHtml(d.subtitle)}</p>
          </div>
        `;

      // 9. BUZLU CAM KART
      case 'glass-vault-card':
        return `
          <div class="nc-glass-card" style="${inlineStyle}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4);">
            <h3 style="margin-bottom: 8px;">${escapeHtml(d.title)}</h3>
            <p style="line-height: 1.6;">${escapeHtml(d.text)}</p>
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

        const itemsHtml = items.map((it) => `
          <div class="nc-todo-row ${it.checked ? 'completed' : ''}">
            <input type="checkbox" ${it.checked ? 'checked' : ''} disabled style="cursor:default;">
            <span class="nc-todo-text">${escapeHtml(it.text)}</span>
          </div>
        `).join('');

        return `
          <div class="nc-todo-widget" style="${inlineStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4>${escapeHtml(d.title)}</h4>
              <span class="nc-todo-stats">${completedCount}/${totalCount} Tamamlandı (%${percent})</span>
            </div>
            <div class="nc-progress-bar-track">
              <div class="nc-progress-bar-fill" style="width: ${percent}%"></div>
            </div>
            <div class="nc-todo-list">${itemsHtml}</div>
          </div>
        `;

      // 12. KRİTİK BİLGİ TABLOSU
      case 'vault-info-table':
        const headers = d.headers || ['Kurum / Hizmet', 'Kullanıcı / No', 'Detay'];
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
