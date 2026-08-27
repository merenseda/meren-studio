// Meren Studio - No-Code Görsel Stil ve Özellik Denetçisi (Inspector - Tam Dinamik)

class BlockInspector {
  constructor(containerEl, engine) {
    this.container = containerEl;
    this.engine = engine;

    this.engine.on('select', (selectedBlock) => {
      this.render(selectedBlock);
    });

    this.engine.on('change', () => {
      const current = this.engine.getSelectedBlock();
      if (current) this.render(current);
    });
  }

  render(block) {
    if (!block) {
      this.container.innerHTML = `
        <div class="inspector-empty-state">
          <div class="inspector-icon">🎯</div>
          <h4>Bileşen Seçilmedi</h4>
          <p>Düzenlemek ve stil vermek için tuvaldeki bir bileşene tıklayın.</p>
        </div>
      `;
      return;
    }

    const compDef = COMPONENT_REGISTRY.find(c => c.id === block.componentId) || { name: 'Özel Bileşen', icon: '🧩' };
    const d = block.data || {};
    const s = block.customStyles || {};

    let html = `
      <div class="inspector-header">
        <div class="inspector-title-row">
          <span class="inspector-comp-icon">${compDef.icon}</span>
          <div>
            <h4 class="inspector-comp-name">${compDef.name}</h4>
            <span class="inspector-comp-id">#${block.id.split('_')[1]}</span>
          </div>
        </div>
        <div class="inspector-quick-actions">
          <button class="insp-btn" id="inspDupBtn" title="Çoğalt">📋</button>
          <button class="insp-btn danger" id="inspDelBtn" title="Sil">🗑️</button>
        </div>
      </div>

      <div class="inspector-body">
        <!-- 1. İÇERİK VE METİN AYARLARI -->
        <div class="inspector-section">
          <div class="section-title">📝 İçerik & Veri Alanları</div>
          ${this.renderDataInputs(block)}
        </div>

        <!-- 2. RENKLER VE ARKA PLAN -->
        <div class="inspector-section">
          <div class="section-title">🎨 Renkler & Arka Plan</div>
          
          <div class="control-row">
            <label>Metin Rengi</label>
            <div class="color-picker-wrap">
              <input type="color" id="inspTextColor" value="${this.rgbToHex(s.textColor || d.textColor || '#1e293b')}">
              <span class="color-hex">${s.textColor || d.textColor || 'Varsayılan'}</span>
            </div>
          </div>

          <div class="control-row">
            <label>Arka Plan Rengi</label>
            <div class="color-picker-wrap">
              <input type="color" id="inspBgColor" value="${this.rgbToHex(s.bgColor || d.bgColor || '#ffffff')}">
              <span class="color-hex">${s.bgColor || d.bgColor || 'Varsayılan'}</span>
            </div>
          </div>

          <div class="presets-row">
            <span class="preset-chip" data-gradient="linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)" title="Koyu Grafit"></span>
            <span class="preset-chip" data-gradient="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" title="Çelik Mavi"></span>
            <span class="preset-chip" data-gradient="linear-gradient(135deg, #18181b 0%, #27272a 100%)" title="Obsidian Koyu"></span>
            <span class="preset-chip" data-color="#ffffff" title="Beyaz"></span>
            <span class="preset-chip" data-color="#f8fafc" title="Hafif Gri"></span>
            <span class="preset-chip" data-color="rgba(255,255,255,0.85)" title="Buzlu Cam"></span>
          </div>
        </div>

        <!-- 3. BOYUTLAR VE YERLEŞİM -->
        <div class="inspector-section">
          <div class="section-title">📐 Boyut & Yan Yana Yerleşim</div>

          <div class="control-row">
            <label>Sayfa Genişliği / Yerleşim</label>
            <div class="shadow-buttons">
              <button class="shadow-opt ${!s.width || s.width === '100%' ? 'active' : ''}" data-set-width="100%">100% Tam</button>
              <button class="shadow-opt ${s.width && s.width.includes('50%') ? 'active' : ''}" data-set-width="calc(50% - 8px)">50% (2'li)</button>
              <button class="shadow-opt ${s.width && s.width.includes('33') ? 'active' : ''}" data-set-width="calc(33.333% - 11px)">33% (3'lü)</button>
              <button class="shadow-opt ${s.width && s.width.includes('25') ? 'active' : ''}" data-set-width="calc(25% - 12px)">25% (4'lü)</button>
            </div>
            <button class="insp-add-sub-btn" id="inspSeparateRowBtn" style="margin-top: 8px;">↩️ Bağımsız Ayrı Satıra Al</button>
          </div>

          <div class="control-row" style="margin-top: 10px;">
            <label>İç Boşluk (Padding): <span id="paddingVal">${parseInt(s.padding || d.padding || 20)}px</span></label>
            <input type="range" class="slider" id="inspPadding" min="0" max="60" value="${parseInt(s.padding || d.padding || 20)}">
          </div>

          <div class="control-row">
            <label>Köşe Yuvarlaklığı: <span id="radiusVal">${parseInt(s.borderRadius || d.borderRadius || 12)}px</span></label>
            <input type="range" class="slider" id="inspRadius" min="0" max="32" value="${parseInt(s.borderRadius || d.borderRadius || 12)}">
          </div>
        </div>

        <!-- 4. GÖLGE VE EFEKTLER -->
        <div class="inspector-section">
          <div class="section-title">✨ Gölge & Derinlik</div>
          <div class="shadow-buttons">
            <button class="shadow-opt ${!s.shadow && !d.shadow ? 'active' : ''}" data-shadow="none">Düz</button>
            <button class="shadow-opt" data-shadow="0 4px 6px -1px rgba(0,0,0,0.06)">Hafif</button>
            <button class="shadow-opt" data-shadow="0 10px 25px -5px rgba(0,0,0,0.1)">Orta</button>
            <button class="shadow-opt" data-shadow="0 20px 35px -10px rgba(56,189,248,0.25)">Parlama</button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents(block);
  }

  // Dinamik Veri Alanları (Sadeleştirilmiş)
  renderDataInputs(block) {
    const d = block.data || {};
    let inputsHtml = '';

    if (block.componentId === 'vault-image-card') {
      inputsHtml += `
        <div class="control-group">
          <label>Resim Yerleşimi</label>
          <select class="insp-input" data-data-key="fit">
            <option value="contain" ${d.fit === 'contain' ? 'selected' : ''}>Tam Sığdır (Contain)</option>
            <option value="cover" ${d.fit === 'cover' ? 'selected' : ''}>Alanı Doldur (Cover)</option>
          </select>
        </div>
        <div class="control-group">
          <label>Maksimum Yükseklik: <span>${d.maxHeight || 380}px</span></label>
          <input type="range" class="slider" data-data-key="maxHeight" min="150" max="750" value="${d.maxHeight || 380}">
        </div>
      `;
    }

    // Standart String & Number Alanları
    for (const key in d) {
      if (['bgColor', 'bgGradient', 'textColor', 'padding', 'margin', 'borderRadius', 'shadow', 'backdropBlur', 'borderWidth', 'borderColor', 'items', 'steps', 'rows', 'headers', 'imageData', 'fit', 'maxHeight'].includes(key)) {
        continue;
      }

      if (typeof d[key] === 'string') {
        const label = this.formatFieldLabel(key);
        if (d[key].length > 40 || key === 'body' || key === 'notes') {
          inputsHtml += `
            <div class="control-group">
              <label>${label}</label>
              <textarea class="insp-input" data-data-key="${key}" rows="3">${d[key] || ''}</textarea>
            </div>
          `;
        } else {
          inputsHtml += `
            <div class="control-group">
              <label>${label}</label>
              <input type="text" class="insp-input" data-data-key="${key}" value="${escapeHtml(d[key] || '')}">
            </div>
          `;
        }
      } else if (typeof d[key] === 'number') {
        inputsHtml += `
          <div class="control-group">
            <label>${this.formatFieldLabel(key)}</label>
            <input type="number" class="insp-input" data-data-key="${key}" value="${d[key]}">
          </div>
        `;
      }
    }

    return inputsHtml || '<p style="color: #64748b; font-size: 0.8rem;">Doğrudan tuval üzerinden düzenlenebilir.</p>';
  }

  formatFieldLabel(key) {
    const map = {
      title: 'Başlık',
      subtitle: 'Alt Başlık',
      accountName: 'Hesap / Hizmet Adı',
      username: 'Kullanıcı Adı / E-posta',
      password: 'Şifre',
      notes: 'Notlar',
      bankName: 'Banka Adı',
      accountNumber: 'IBAN / Hesap No',
      currency: 'Para Birimi',
      branchOrType: 'Hesap Türü',
      additionalAssets: 'Not',
      caption: 'Görsel Başlığı',
      date: 'Tarih',
      body: 'Günlük Metni'
    };
    return map[key] || key;
  }

  // Olayları Bağla
  bindEvents(block) {
    const dupBtn = this.container.querySelector('#inspDupBtn');
    if (dupBtn) dupBtn.onclick = () => this.engine.duplicateBlock(block.id);

    const delBtn = this.container.querySelector('#inspDelBtn');
    if (delBtn) delBtn.onclick = () => this.engine.removeBlock(block.id);

    // Dinamik Data Girişleri
    this.container.querySelectorAll('[data-data-key]').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.dataKey;
        const val = input.type === 'number' ? parseFloat(input.value) : input.value;
        this.engine.updateBlockData(block.id, key, val);
      });
    });

    this.container.querySelectorAll('[data-insp-todo-text]').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.inspTodoText);
        if (block.data.items && block.data.items[idx]) {
          block.data.items[idx].text = input.value;
          this.engine.emit('change', this.engine.blocks);
        }
      });
    });

    this.container.querySelectorAll('[data-insp-del-todo]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.inspDelTodo);
        if (block.data.items) {
          block.data.items.splice(idx, 1);
          this.engine.emit('change', this.engine.blocks);
        }
      };
    });

    const addTodoBtn = this.container.querySelector('#inspAddTodoItem');
    if (addTodoBtn) {
      addTodoBtn.onclick = () => {
        if (!block.data.items) block.data.items = [];
        block.data.items.push({ text: 'Yeni görev maddesi...', checked: false });
        this.engine.emit('change', this.engine.blocks);
      };
    }

    // Step Yönetimi
    this.container.querySelectorAll('[data-insp-step-text]').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.inspStepText);
        if (block.data.steps && block.data.steps[idx] !== undefined) {
          block.data.steps[idx] = `${idx + 1}. ${input.value}`;
          this.engine.emit('change', this.engine.blocks);
        }
      });
    });

    this.container.querySelectorAll('[data-insp-del-step]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.inspDelStep);
        if (block.data.steps) {
          block.data.steps.splice(idx, 1);
          this.engine.emit('change', this.engine.blocks);
        }
      };
    });

    const addStepBtn = this.container.querySelector('#inspAddStepItem');
    if (addStepBtn) {
      addStepBtn.onclick = () => {
        if (!block.data.steps) block.data.steps = [];
        block.data.steps.push(`${block.data.steps.length + 1}. Yeni talimat maddesi...`);
        this.engine.emit('change', this.engine.blocks);
      };
    }

    // Renkler
    const textColorInput = this.container.querySelector('#inspTextColor');
    if (textColorInput) {
      textColorInput.addEventListener('input', (e) => {
        this.engine.updateBlockStyle(block.id, 'textColor', e.target.value);
      });
    }

    const bgColorInput = this.container.querySelector('#inspBgColor');
    if (bgColorInput) {
      bgColorInput.addEventListener('input', (e) => {
        this.engine.updateBlockStyle(block.id, 'bgColor', e.target.value);
      });
    }

    // Hazır Renk Presetleri
    this.container.querySelectorAll('.preset-chip').forEach(chip => {
      chip.onclick = () => {
        if (chip.dataset.gradient) {
          this.engine.updateBlockStyle(block.id, 'bgColor', chip.dataset.gradient);
        } else if (chip.dataset.color) {
          this.engine.updateBlockStyle(block.id, 'bgColor', chip.dataset.color);
        }
      };
    });

    // Sliders
    const paddingSlider = this.container.querySelector('#inspPadding');
    if (paddingSlider) {
      paddingSlider.addEventListener('input', (e) => {
        this.container.querySelector('#paddingVal').textContent = e.target.value + 'px';
        this.engine.updateBlockStyle(block.id, 'padding', e.target.value + 'px');
      });
    }

    const marginSlider = this.container.querySelector('#inspMargin');
    if (marginSlider) {
      marginSlider.addEventListener('input', (e) => {
        this.container.querySelector('#marginVal').textContent = e.target.value + 'px';
        this.engine.updateBlockStyle(block.id, 'margin', e.target.value + 'px');
      });
    }

    const radiusSlider = this.container.querySelector('#inspRadius');
    if (radiusSlider) {
      radiusSlider.addEventListener('input', (e) => {
        this.container.querySelector('#radiusVal').textContent = e.target.value + 'px';
        this.engine.updateBlockStyle(block.id, 'borderRadius', e.target.value + 'px');
      });
    }

    // Genişlik & Yerleşim Butonları
    this.container.querySelectorAll('[data-set-width]').forEach(btn => {
      btn.onclick = () => {
        this.container.querySelectorAll('[data-set-width]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.engine.updateBlockStyle(block.id, 'width', btn.dataset.setWidth);
      };
    });

    const sepRowBtn = this.container.querySelector('#inspSeparateRowBtn');
    if (sepRowBtn) {
      sepRowBtn.onclick = () => {
        this.engine.separateBlockToNewRow(block.id);
      };
    }

    // Shadow Buttons
    this.container.querySelectorAll('.shadow-opt[data-shadow]').forEach(btn => {
      btn.onclick = () => {
        this.container.querySelectorAll('.shadow-opt[data-shadow]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.engine.updateBlockStyle(block.id, 'shadow', btn.dataset.shadow);
      };
    });
  }

  rgbToHex(color) {
    if (!color || color.startsWith('linear-gradient') || color.startsWith('rgba')) return '#ffffff';
    if (color.startsWith('#')) return color;
    return '#6366f1';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlockInspector };
}
