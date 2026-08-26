// Meren Studio - No-Code Görsel Stil ve Özellik Denetçisi (Inspector)

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
          <div class="section-title">📝 İçerik & Metinler</div>
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
            <span class="preset-chip" data-gradient="linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" title="Koyu Lacivert"></span>
            <span class="preset-chip" data-gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" title="Mor Gradyan"></span>
            <span class="preset-chip" data-gradient="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" title="Koyu Gece"></span>
            <span class="preset-chip" data-color="#ffffff" title="Beyaz"></span>
            <span class="preset-chip" data-color="#f8fafc" title="Hafif Gri"></span>
            <span class="preset-chip" data-color="rgba(255,255,255,0.75)" title="Buzlu Cam"></span>
          </div>
        </div>

        <!-- 3. BOYUTLAR VE BOŞLUKLAR (SPACING) -->
        <div class="inspector-section">
          <div class="section-title">📐 Boşluklar & Boyutlar</div>

          <div class="control-row">
            <label>İç Boşluk (Padding): <span id="paddingVal">${parseInt(s.padding || d.padding || 20)}px</span></label>
            <input type="range" class="slider" id="inspPadding" min="0" max="60" value="${parseInt(s.padding || d.padding || 20)}">
          </div>

          <div class="control-row">
            <label>Dış Boşluk (Margin): <span id="marginVal">${parseInt(s.margin || d.margin || 10)}px</span></label>
            <input type="range" class="slider" id="inspMargin" min="0" max="50" value="${parseInt(s.margin || d.margin || 10)}">
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
            <button class="shadow-opt" data-shadow="0 20px 35px -10px rgba(99,102,241,0.3)">Parlama</button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents(block);
  }

  // Dinamik Veri Alanları
  renderDataInputs(block) {
    const d = block.data || {};
    let inputsHtml = '';

    for (const key in d) {
      if (['bgColor', 'bgGradient', 'textColor', 'padding', 'margin', 'borderRadius', 'shadow', 'backdropBlur', 'borderWidth', 'borderColor'].includes(key)) {
        continue;
      }

      if (typeof d[key] === 'string') {
        const label = this.formatFieldLabel(key);
        if (d[key].length > 40) {
          inputsHtml += `
            <div class="control-group">
              <label>${label}</label>
              <textarea class="insp-input" data-data-key="${key}" rows="2">${d[key]}</textarea>
            </div>
          `;
        } else {
          inputsHtml += `
            <div class="control-group">
              <label>${label}</label>
              <input type="text" class="insp-input" data-data-key="${key}" value="${d[key]}">
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
      text: 'Açıklama Metni',
      buttonText: 'Buton Yazısı',
      label: 'Etiket',
      question: 'Soru',
      answer: 'Cevap',
      metric: 'Büyük Değer / Metrik',
      change: 'Değişim Oranı',
      leftTitle: 'Sol Başlık',
      leftText: 'Sol Metin',
      rightTitle: 'Sağ Başlık',
      rightText: 'Sağ Metin',
      imageUrl: 'Görsel URL',
      caption: 'Görsel Başlığı'
    };
    return map[key] || key;
  }

  // Olayları Bağla
  bindEvents(block) {
    // Quick Actions
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

    // Shadow Buttons
    this.container.querySelectorAll('.shadow-opt').forEach(btn => {
      btn.onclick = () => {
        this.container.querySelectorAll('.shadow-opt').forEach(b => b.classList.remove('active'));
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlockInspector };
}
