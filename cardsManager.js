// cardsManager.js - Cards adaptadas para Tramos de Vías
class CardsManager {
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.filteredData = [...data];
        
        this.options = {
            theme: 'default',
            animationType: 'fadeInUp',
            updateInterval: 100,
            currency: 'COP',
            locale: 'es-CO',
            showIcons: true,
            showAnimations: true,
            ...options
        };

        this.cardsConfig = [
            {
                id: 'totalTramos',
                title: 'Total Tramos',
                icon: 'road',
                value: this.calculateTotalTramos(),
                suffix: '',
                color: '#018d38',
                gradient: 'linear-gradient(135deg, #0b5640 0%, #018d38 100%)',
                category: 'count'
            },
            {
                id: 'longitudTotal',
                title: 'Longitud Total',
                icon: 'ruler',
                value: this.calculateLongitudTotal(),
                suffix: 'km',
                color: '#018d38',
                gradient: 'linear-gradient(135deg, #0b5640 0%, #018d38 100%)',
                category: 'distance'
            },
            {
                id: 'totalMunicipios',
                title: 'Municipios',
                icon: 'map-pin',
                value: this.calculateTotalMunicipios(),
                suffix: '',
                color: '#018d38',
                gradient: 'linear-gradient(135deg, #0b5640 0%, #018d38 100%)',
                category: 'count'
            },
            {
                id: 'viasIntervenidas',
                title: 'Vías Intervenidas',
                icon: 'git-branch',
                value: this.calculateViasIntervenidas(),
                suffix: '',
                color: '#018d38',
                gradient: 'linear-gradient(135deg, #0b5640 0%, #018d38 100%)',
                category: 'count'
            }
        ];

        this.animationQueue = [];
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.createCardStyles();
        this.render();
        this.attachEventListeners();
        
        if (this.options.showAnimations) {
            this.startAnimations();
        }
    }

    // Métodos de cálculo adaptados a nuevos campos
    calculateTotalTramos() {
        return this.filteredData.length;
    }

    calculateLongitudTotal() {
        // Campo "Longitud(m)" contiene valores en km pese al nombre
        const total = this.filteredData.reduce((sum, item) => sum + (parseFloat(item['Longitud(m)']) || 0), 0);
        return Math.round(total * 100) / 100;
    }

    calculateValorTotal() {
        // Sumar valores únicos por contrato
        const contratosUnicos = {};
        this.filteredData.forEach(item => {
            if (!contratosUnicos[item.NO_CONTRATO]) {
                contratosUnicos[item.NO_CONTRATO] = item.VALOR_CTO || 0;
            }
        });
        return Object.values(contratosUnicos).reduce((sum, v) => sum + v, 0);
    }

    calculateTotalMunicipios() {
        return new Set(this.filteredData.map(item => item.MPIO_NOMBRE).filter(Boolean)).size;
    }

    calculateViasIntervenidas() {
        // Circuitos únicos (campo CIRCUITO o similar)
        const campo = this.filteredData.length > 0
            ? (Object.keys(this.filteredData[0]).find(k => /circuito/i.test(k)) || 'CIRCUITO')
            : 'CIRCUITO';
        return new Set(this.filteredData.map(item => item[campo]).filter(Boolean)).size;
    }

    calculateAvancePromedio() {
        if (!this.filteredData.length) return 0;
        const sum = this.filteredData.reduce((s, item) => s + ((item.Avance || 0) * 100), 0);
        return Math.round((sum / this.filteredData.length) * 10) / 10;
    }

    // Crear estilos dinámicos (igual al original)
    createCardStyles() {
        const styleId = 'cards-manager-styles';
        if (document.getElementById(styleId)) return;

        if (!document.querySelector('script[src*="feather"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/feather-icons';
            script.onload = () => { if (window.feather) window.feather.replace(); };
            document.head.appendChild(script);
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .cards-manager { display: contents; }

            .stat-card {
                background: rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 16px;
                padding: clamp(8px, 1.5vw, 18px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #0b5640;
                height: 100%;
                width: 100%;
                min-width: 0;
                overflow: hidden;
                box-shadow:
                    0 4px 16px rgba(1, 141, 56, 0.1),
                    0 1px 4px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6);
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                font-weight: 600;
                position: relative;
                text-align: center;
                cursor: pointer;
                box-sizing: border-box;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(1,141,56,0.05) 100%);
                border-radius: 16px;
                z-index: -1;
            }

            .stat-card:hover {
                transform: translateY(-4px) scale(1.02);
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-color: rgba(1, 141, 56, 0.4);
                box-shadow:
                    0 12px 32px rgba(1, 141, 56, 0.2),
                    0 4px 16px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8);
            }

            .stat-card:active { transform: translateY(-2px) scale(1.01); }

            /* Icono */
            .card-icon {
                width: clamp(24px, 3vw, 36px);
                height: clamp(24px, 3vw, 36px);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                background: linear-gradient(135deg, rgba(1,141,56,0.15) 0%, rgba(11,86,64,0.1) 100%);
                border: 1px solid rgba(1, 141, 56, 0.2);
                color: var(--card-color, #0b5640);
                margin-bottom: clamp(3px, 0.5vw, 8px);
                flex-shrink: 0;
                transition: all 0.3s ease;
            }

            .card-icon i {
                font-size: clamp(11px, 1.2vw, 16px) !important;
            }

            .stat-card:hover .card-icon {
                transform: scale(1.15) rotate(5deg);
                background: linear-gradient(135deg, rgba(1,141,56,0.25) 0%, rgba(11,86,64,0.2) 100%);
                border-color: rgba(1, 141, 56, 0.4);
                box-shadow: 0 4px 14px rgba(1, 141, 56, 0.3);
            }

            /* Valor numérico */
            .card-value {
                font-size: clamp(13px, 1.8vw, 26px);
                font-weight: 800;
                color: var(--card-color, #0b5640);
                margin: 2px 0;
                line-height: 1.1;
                display: flex;
                align-items: baseline;
                gap: 3px;
                justify-content: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                transition: all 0.3s ease;
                text-shadow: 0 2px 4px rgba(255,255,255,0.8);
            }

            .stat-card:hover .card-value {
                color: #018d38;
                text-shadow: 0 2px 8px rgba(1,141,56,0.3);
            }

            .card-suffix {
                font-size: clamp(9px, 1vw, 14px);
                font-weight: 600;
                opacity: 0.85;
                flex-shrink: 0;
            }

            /* Título */
            .card-title {
                font-size: clamp(7px, 0.75vw, 10px);
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: clamp(0.3px, 0.1vw, 1px);
                color: rgba(11, 86, 64, 0.8);
                margin: 0;
                line-height: 1.2;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                transition: all 0.3s ease;
            }

            .stat-card:hover .card-title { color: #018d38; }

            /* Animaciones */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
            .animate-fadeInUp { animation: fadeInUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

            @keyframes pulse {
                0%   { transform: scale(1);    }
                50%  { transform: scale(1.04); }
                100% { transform: scale(1);    }
            }
            .value-updating { animation: pulse 0.5s ease-in-out; }
        `;
        document.head.appendChild(style);
    }

    getIcon(iconName) {
        const icons = {
            road:     `<i class="fas fa-road"></i>`,
            ruler:    `<i class="fas fa-ruler"></i>`,
            money:    `<i class="fas fa-dollar-sign"></i>`,
            progress: `<i class="fas fa-tasks"></i>`
        };
        return icons[iconName] || icons.road;
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="cards-manager">
                ${this.cardsConfig.map((card, index) => this.renderCard(card, index)).join('')}
            </div>
        `;
        
        setTimeout(() => { if (window.feather) window.feather.replace(); }, 100);
    }

    renderCard(card, index) {
        return `
            <div class="stat-card theme-${this.options.theme}" 
                 id="card-${card.id}"
                 style="--card-color: ${card.color}; animation-delay: ${index * 0.1}s;">
                ${this.options.showIcons ? `
                    <div class="card-header">
                        <div class="card-icon">${this.getIcon(card.icon)}</div>
                    </div>` : ''}
                <div class="card-content">
                    <div class="card-value" data-target="${card.value}" data-category="${card.category}">
                        <span class="value-display">0</span>
                        ${card.suffix ? `<span class="card-suffix">${card.suffix}</span>` : ''}
                    </div>
                    <h3 class="card-title">${card.title}</h3>
                </div>
            </div>
        `;
    }

    formatValue(value, category) {
        switch (category) {
            case 'currency':
                return new Intl.NumberFormat(this.options.locale, {
                    style: 'currency', currency: this.options.currency,
                    minimumFractionDigits: 0, maximumFractionDigits: 0
                }).format(value);

            case 'currency_smart':
                return this.formatCurrencySmart(value);

            case 'percent':
                return value.toFixed(1);
            case 'distance':
                return new Intl.NumberFormat(this.options.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
            default:
                return new Intl.NumberFormat(this.options.locale).format(value);
        }
    }

    // Formato inteligente: 
    //   < 100M  → muestra valor completo en COP  (ej: $99.000.000)
    //   ≥ 100M  → "100M"  (millones, 2 decimales si no es entero)
    //   ≥ 1000M → "1.56MM" (miles de millones / millardos)
    //   ≥ 1B    → "1.56 B"  (billones: 1.000.000.000.000)
    formatCurrencySmart(value) {
        const B  = 1_000_000_000_000; // billón COP = 10^12
        const MM = 1_000_000_000;     // mil millones (millardo) = 10^9
        const M  = 1_000_000;         // millón = 10^6

        const fmt = (n, suffix) => {
            const rounded = Math.round(n * 100) / 100;
            const display = Number.isInteger(rounded) ? rounded : rounded.toFixed(2);
            return `$${display} ${suffix}`;
        };

        if (value >= B)        return fmt(value / B,  'B');
        if (value >= MM)       return fmt(value / MM, 'MM');
        if (value >= 100 * M)  return fmt(value / M,  'M');

        // Menos de 100 millones → valor completo formateado en COP sin símbolo largo
        return new Intl.NumberFormat(this.options.locale, {
            style: 'currency', currency: this.options.currency,
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(value);
    }

    animateNumber(element, targetValue, category) {
        const duration = 1000;
        const increment = targetValue / (duration / this.options.updateInterval);
        let currentValue = 0;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            if (category === 'currency') {
                element.textContent = this.formatValue(Math.floor(currentValue), category);
            } else if (category === 'currency_smart') {
                element.textContent = this.formatCurrencySmart(Math.floor(currentValue));
            } else if (category === 'percent' || category === 'distance') {
                element.textContent = this.formatValue(currentValue, category);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }
        }, this.options.updateInterval);
    }

    startAnimations() {
        const cards = this.container.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            setTimeout(() => { card.classList.add(`animate-${this.options.animationType}`); }, index * 150);
            setTimeout(() => {
                const valueDisplay = card.querySelector('.value-display');
                const targetValue = parseFloat(valueDisplay.closest('.card-value').dataset.target);
                const category = valueDisplay.closest('.card-value').dataset.category;
                this.animateNumber(valueDisplay, targetValue, category);
            }, (index * 150) + 500);
        });
    }

    updateData(newData) {
        this.data = newData;
        this.filteredData = [...newData];
        this.updateValues();
    }

    applyFilters(filteredData) {
        this.filteredData = filteredData;
        this.updateValues();
    }

    updateValues() {
        this.cardsConfig.forEach(card => {
            switch (card.id) {
                case 'totalTramos':      card.value = this.calculateTotalTramos(); break;
                case 'longitudTotal':    card.value = this.calculateLongitudTotal(); break;
                case 'totalMunicipios':  card.value = this.calculateTotalMunicipios(); break;
                case 'viasIntervenidas': card.value = this.calculateViasIntervenidas(); break;
            }
        });

        this.cardsConfig.forEach(card => {
            const cardElement = document.getElementById(`card-${card.id}`);
            if (!cardElement) return;
            const valueDisplay = cardElement.querySelector('.value-display');
            valueDisplay.classList.add('value-updating');
            cardElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                cardElement.style.transform = '';
                valueDisplay.classList.remove('value-updating');
                this.animateNumber(valueDisplay, card.value, card.category);
            }, 200);
        });

        setTimeout(() => { if (window.feather) window.feather.replace(); }, 100);
    }

    attachEventListeners() {
        if (!this.container) return;
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.stat-card');
            if (card) this.onCardClick(card.id.replace('card-', ''));
        });
        this.container.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.stat-card');
            if (card) card.style.transform = 'translateY(-8px) scale(1.02)';
        }, true);
        this.container.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.stat-card');
            if (card) card.style.transform = '';
        }, true);
    }

    onCardClick(cardId) {
        // Disparar evento externo (compatibilidad)
        const event = new CustomEvent('cardClick', {
            detail: { cardId, value: this.cardsConfig.find(c => c.id === cardId)?.value }
        });
        this.container.dispatchEvent(event);

        // Abrir modal de detalle
        this.openDetailModal(cardId);
    }

    /* ═══════════════════════════════════════════════════════════════
       SISTEMA DE MODALES INSTITUCIONALES — Gobernación de Antioquia
    ═══════════════════════════════════════════════════════════════ */

    openDetailModal(cardId) {
        const config = this._getModalConfig(cardId);
        if (!config) return;
        this._renderModal(config);
    }

    _getModalConfig(cardId) {
        const data = this.filteredData;
        switch (cardId) {
            case 'totalTramos':      return this._buildTramosModal(data);
            case 'longitudTotal':    return this._buildLongitudModal(data);
            case 'totalMunicipios':  return this._buildMunicipiosModal(data);
            case 'viasIntervenidas': return this._buildViasModal(data);
            default: return null;
        }
    }

    /* ── Helpers de datos ── */
    _fmtKm(val) {
        return (Math.round((parseFloat(val) || 0) * 100) / 100).toLocaleString('es-CO', {minimumFractionDigits:1, maximumFractionDigits:1});
    }

    /* ── Tramos: Municipio + Vía ── */
    _buildTramosModal(data) {
        const rows = data.map((d, i) => `
            <tr class="cdm-row" style="animation-delay:${Math.min(i * 18, 400)}ms">
                <td class="cdm-td cdm-td-mpio">
                    <span class="cdm-mpio-badge">${(d.MPIO_NOMBRE || '—').charAt(0)}</span>
                    ${d.MPIO_NOMBRE || '—'}
                </td>
                <td class="cdm-td">${d.NOMBRE_VIA || d.CIRCUITO || '—'}</td>
            </tr>`).join('');

        return {
            icon: 'road',
            label: 'TRAMOS',
            title: 'Detalle de Tramos',
            meta: `${data.length} tramo${data.length !== 1 ? 's' : ''}`,
            accentColor: '#018d38',
            colHeaders: ['Municipio', 'Vía / Circuito'],
            bodyHTML: rows,
            emptyMsg: 'No hay tramos en la selección actual.'
        };
    }

    /* ── Longitud: Municipio + km, ordenado desc con barra ── */
    _buildLongitudModal(data) {
        const totals = {};
        data.forEach(d => {
            const m = d.MPIO_NOMBRE || 'Sin municipio';
            totals[m] = (totals[m] || 0) + (parseFloat(d['Longitud(m)']) || 0);
        });
        const sorted = Object.entries(totals)
            .map(([mpio, km]) => ({ mpio, km: Math.round(km * 100) / 100 }))
            .sort((a, b) => b.km - a.km);

        const max   = sorted[0]?.km || 1;
        const total = sorted.reduce((s, r) => s + r.km, 0);

        const rows = sorted.map((r, i) => {
            const pct = ((r.km / max) * 100).toFixed(1);
            return `
            <tr class="cdm-row" style="animation-delay:${Math.min(i * 22, 500)}ms">
                <td class="cdm-td cdm-td-mpio">
                    <span class="cdm-rank">${i + 1}</span>
                    ${r.mpio}
                </td>
                <td class="cdm-td cdm-td-bar">
                    <div class="cdm-bar-wrap">
                        <div class="cdm-bar-track">
                            <div class="cdm-bar-fill" style="--pct:${pct}%"></div>
                        </div>
                        <span class="cdm-km-val">${this._fmtKm(r.km)} km</span>
                    </div>
                </td>
            </tr>`;
        }).join('');

        return {
            icon: 'ruler',
            label: 'LONGITUD',
            title: 'Longitud por Municipio',
            meta: `${this._fmtKm(total)} km en total · ${sorted.length} municipios`,
            accentColor: '#018d38',
            colHeaders: ['Municipio', 'Longitud'],
            bodyHTML: rows,
            emptyMsg: 'No hay datos de longitud.'
        };
    }

    /* ── Municipios: agrupados por subregión ── */
    _buildMunicipiosModal(data) {
        const groups = {};
        data.forEach(d => {
            const sub  = d.SUBREGION || 'Sin subregión';
            const mpio = d.MPIO_NOMBRE || 'Sin municipio';
            if (!groups[sub]) groups[sub] = {};
            groups[sub][mpio] = (groups[sub][mpio] || 0) + 1;
        });

        const subregiones = Object.keys(groups).sort();
        const totalMpios  = new Set(data.map(d => d.MPIO_NOMBRE)).size;
        let rowIndex = 0;

        const rows = subregiones.map(sub => {
            const mpios = Object.entries(groups[sub]).sort((a, b) => b[1] - a[1]);
            const groupRows = mpios.map(([mpio, count]) => {
                rowIndex++;
                return `
                <tr class="cdm-row" style="animation-delay:${Math.min(rowIndex * 18, 600)}ms">
                    <td class="cdm-td cdm-td-mpio">
                        <span class="cdm-mpio-badge">${mpio.charAt(0)}</span>
                        ${mpio}
                    </td>
                    <td class="cdm-td" style="text-align:center;">
                        <span class="cdm-count-pill">${count}</span>
                    </td>
                </tr>`;
            }).join('');

            return `
                <tr class="cdm-group-row">
                    <td colspan="2" class="cdm-group-cell">
                        <div class="cdm-group-inner">
                            <span class="cdm-group-name">${sub}</span>
                            <span class="cdm-group-count">${mpios.length} municipio${mpios.length !== 1 ? 's' : ''}</span>
                        </div>
                    </td>
                </tr>
                ${groupRows}`;
        }).join('');

        return {
            icon: 'map-pin',
            label: 'MUNICIPIOS',
            title: 'Municipios con Tramos',
            meta: `${totalMpios} municipio${totalMpios !== 1 ? 's' : ''} · ${subregiones.length} subregion${subregiones.length !== 1 ? 'es' : ''}`,
            accentColor: '#018d38',
            colHeaders: ['Municipio', 'Tramos'],
            bodyHTML: rows,
            emptyMsg: 'No hay municipios en la selección actual.'
        };
    }

    /* ── Vías intervenidas ── */
    _buildViasModal(data) {
        const vias = {};
        data.forEach(d => {
            const key = d.CIRCUITO || d.NOMBRE_VIA || '—';
            if (!vias[key]) vias[key] = { mpio: d.MPIO_NOMBRE || '—', km: 0 };
            vias[key].km += parseFloat(d['Longitud(m)']) || 0;
        });

        const sorted = Object.entries(vias)
            .map(([via, v]) => ({ via, mpio: v.mpio, km: Math.round(v.km * 100) / 100 }))
            .sort((a, b) => a.via.localeCompare(b.via));

        const rows = sorted.map((r, i) => `
            <tr class="cdm-row" style="animation-delay:${Math.min(i * 20, 500)}ms">
                <td class="cdm-td">
                    <span class="cdm-via-dot"></span>
                    <span style="font-weight:500;">${r.via}</span>
                </td>
                <td class="cdm-td cdm-td-mpio">
                    <span class="cdm-mpio-badge">${r.mpio.charAt(0)}</span>
                    ${r.mpio}
                </td>
                <td class="cdm-td" style="text-align:right;">
                    <span class="cdm-km-chip">${this._fmtKm(r.km)} km</span>
                </td>
            </tr>`).join('');

        return {
            icon: 'git-branch',
            label: 'VÍAS',
            title: 'Vías Intervenidas',
            meta: `${sorted.length} vía${sorted.length !== 1 ? 's' : ''} únicas`,
            accentColor: '#018d38',
            colHeaders: ['Circuito / Vía', 'Municipio', 'Longitud'],
            bodyHTML: rows,
            emptyMsg: 'No hay vías en la selección actual.'
        };
    }

    /* ── Motor de render del modal ── */
    _renderModal(cfg) {
        this._ensureModalDOM();

        const overlay = document.getElementById('cdm-overlay');
        const iconEl  = overlay.querySelector('#cdm-header-icon');
        const labelEl = overlay.querySelector('#cdm-header-label');
        const titleEl = overlay.querySelector('#cdm-header-title');
        const metaEl  = overlay.querySelector('#cdm-header-meta');
        const theadEl = overlay.querySelector('#cdm-thead-row');
        const tbodyEl = overlay.querySelector('#cdm-tbody');
        const emptyEl = overlay.querySelector('#cdm-empty');

        // Icono SVG según tipo
        iconEl.innerHTML  = this._getIconSVG(cfg.icon);
        labelEl.textContent = cfg.label;
        titleEl.textContent = cfg.title;
        metaEl.textContent  = cfg.meta;

        theadEl.innerHTML = cfg.colHeaders.map(h => `<th class="cdm-th">${h}</th>`).join('');
        tbodyEl.innerHTML = cfg.bodyHTML;

        emptyEl.style.display = cfg.bodyHTML.trim() ? 'none' : 'flex';

        // Mostrar
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('cdm-open');
        });

        // Animar barras de longitud tras render
        requestAnimationFrame(() => {
            overlay.querySelectorAll('.cdm-bar-fill').forEach(el => {
                el.style.width = el.style.getPropertyValue('--pct') || el.style['--pct'] ||
                    getComputedStyle(el).getPropertyValue('--pct');
                el.classList.add('cdm-bar-animate');
            });
        });
    }

    _ensureModalDOM() {
        if (document.getElementById('cdm-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'cdm-overlay';
        overlay.innerHTML = `
            <div id="cdm-box" role="dialog" aria-modal="true">

                <!-- HEADER -->
                <header id="cdm-header">
                    <div id="cdm-header-left">
                        <div id="cdm-header-icon-wrap">
                            <span id="cdm-header-icon"></span>
                        </div>
                        <div id="cdm-header-text">
                            <span id="cdm-header-label"></span>
                            <h2 id="cdm-header-title"></h2>
                            <p id="cdm-header-meta"></p>
                        </div>
                    </div>
                    <button id="cdm-close" aria-label="Cerrar">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </header>

                <!-- TABLA -->
                <div id="cdm-table-wrap">
                    <table id="cdm-table">
                        <thead><tr id="cdm-thead-row"></tr></thead>
                        <tbody id="cdm-tbody"></tbody>
                    </table>
                    <div id="cdm-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b3d9c4" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                        <span>Sin datos para mostrar</span>
                    </div>
                </div>

                <!-- FOOTER -->
                <footer id="cdm-footer">
                    <div id="cdm-footer-brand">
                        <span id="cdm-footer-escudo">🏛️</span>
                        <span>Gobernación de Antioquia</span>
                    </div>
                    <button id="cdm-footer-close">Cerrar</button>
                </footer>
            </div>`;

        document.body.appendChild(overlay);
        this._injectModalStyles();

        // Listeners de cierre
        overlay.addEventListener('click', e => { if (e.target === overlay) this._closeModal(); });
        overlay.querySelector('#cdm-close').addEventListener('click', () => this._closeModal());
        overlay.querySelector('#cdm-footer-close').addEventListener('click', () => this._closeModal());
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this._closeModal(); });
    }

    _closeModal() {
        const overlay = document.getElementById('cdm-overlay');
        if (!overlay) return;
        overlay.classList.remove('cdm-open');
        setTimeout(() => { overlay.style.display = 'none'; }, 320);
    }

    _getIconSVG(name) {
        const icons = {
            road:       `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l3-10 6 2 6-2 3 10"/><path d="M9 9l-1.5 8M15 9l1.5 8"/></svg>`,
            ruler:      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7L8.7 21.3a2.4 2.4 0 01-3.4 0l-2.6-2.6a2.4 2.4 0 010-3.4L15.3 2.7a2.4 2.4 0 013.4 0l2.6 2.6a2.4 2.4 0 010 3.4z"/><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 13.5l2 2M16.5 10.5l2 2"/></svg>`,
            'map-pin':  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
            'git-branch':`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>`
        };
        return icons[name] || icons.road;
    }

    _injectModalStyles() {
        if (document.getElementById('cdm-styles')) return;
        const s = document.createElement('style');
        s.id = 'cdm-styles';
        s.textContent = `
            /* ── Overlay ── */
            #cdm-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(5, 40, 28, 0.55);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 9999;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                transition: opacity 0.32s ease;
            }
            #cdm-overlay.cdm-open { opacity: 1; }

            /* ── Caja principal ── */
            #cdm-box {
                background: #ffffff;
                border-radius: 20px;
                width: 100%;
                max-width: 700px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow:
                    0 0 0 1px rgba(1,141,56,0.12),
                    0 32px 80px rgba(11,86,64,0.28),
                    0 8px 24px rgba(0,0,0,0.12);
                transform: translateY(24px) scale(0.97);
                transition: transform 0.32s cubic-bezier(0.22,1,0.36,1);
                font-family: 'Prompt', Arial, sans-serif;
            }
            #cdm-overlay.cdm-open #cdm-box {
                transform: translateY(0) scale(1);
            }

            /* ── Header ── */
            #cdm-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px 18px;
                background: linear-gradient(135deg, #0b5640 0%, #018d38 60%, #05a845 100%);
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            }
            #cdm-header::before {
                content: '';
                position: absolute;
                top: -40px; right: -40px;
                width: 160px; height: 160px;
                background: rgba(255,255,255,0.05);
                border-radius: 50%;
            }
            #cdm-header::after {
                content: '';
                position: absolute;
                bottom: -20px; left: 30%;
                width: 200px; height: 80px;
                background: rgba(58,249,162,0.08);
                border-radius: 50%;
            }
            #cdm-header-left {
                display: flex;
                align-items: center;
                gap: 14px;
                position: relative;
                z-index: 1;
            }
            #cdm-header-icon-wrap {
                width: 48px; height: 48px;
                background: rgba(255,255,255,0.15);
                border: 1.5px solid rgba(255,255,255,0.25);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
                backdrop-filter: blur(4px);
            }
            #cdm-header-text { display: flex; flex-direction: column; gap: 1px; }
            #cdm-header-label {
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1.8px;
                color: rgba(58,249,162,0.9);
                text-transform: uppercase;
            }
            #cdm-header-title {
                font-size: 17px;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                line-height: 1.2;
            }
            #cdm-header-meta {
                font-size: 12px;
                color: rgba(255,255,255,0.7);
                margin: 0;
                font-weight: 400;
            }
            #cdm-close {
                position: relative;
                z-index: 1;
                width: 34px; height: 34px;
                background: rgba(255,255,255,0.12);
                border: 1.5px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                color: rgba(255,255,255,0.85);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.18s ease;
                flex-shrink: 0;
            }
            #cdm-close:hover {
                background: rgba(255,255,255,0.24);
                color: white;
                transform: scale(1.08);
            }

            /* ── Tabla ── */
            #cdm-table-wrap {
                flex: 1;
                overflow-y: auto;
                overflow-x: auto;
            }
            #cdm-table-wrap::-webkit-scrollbar { width: 5px; height: 5px; }
            #cdm-table-wrap::-webkit-scrollbar-track { background: transparent; }
            #cdm-table-wrap::-webkit-scrollbar-thumb { background: #b3d9c4; border-radius: 10px; }
            #cdm-table-wrap::-webkit-scrollbar-thumb:hover { background: #018d38; }

            #cdm-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            #cdm-thead-row {
                position: sticky;
                top: 0;
                z-index: 2;
            }
            .cdm-th {
                padding: 11px 18px;
                text-align: left;
                font-size: 10.5px;
                font-weight: 700;
                letter-spacing: 0.8px;
                text-transform: uppercase;
                color: #0b5640;
                background: #f0faf5;
                border-bottom: 2px solid #d8ede3;
                white-space: nowrap;
            }
            .cdm-td {
                padding: 10px 18px;
                color: #1D1D1B;
                border-bottom: 1px solid #f2f8f5;
                vertical-align: middle;
                font-size: 13px;
            }
            .cdm-td-mpio {
                display: flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
            }
            .cdm-row {
                opacity: 0;
                transform: translateY(6px);
                animation: cdmRowIn 0.3s ease forwards;
            }
            @keyframes cdmRowIn {
                to { opacity: 1; transform: translateY(0); }
            }
            #cdm-tbody tr:hover td { background: #f7fdf9; }
            #cdm-tbody tr:last-child td { border-bottom: none; }

            /* Badges y chips */
            .cdm-mpio-badge {
                width: 26px; height: 26px;
                background: linear-gradient(135deg, #018d38, #0b5640);
                color: white;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                text-transform: uppercase;
            }
            .cdm-rank {
                width: 22px; height: 22px;
                background: #f0faf5;
                border: 1.5px solid #d8ede3;
                color: #0b5640;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .cdm-count-pill {
                background: linear-gradient(135deg, #018d38, #0b5640);
                color: white;
                padding: 3px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                display: inline-block;
            }
            .cdm-km-val {
                font-size: 12px;
                font-weight: 700;
                color: #018d38;
                white-space: nowrap;
                min-width: 70px;
                text-align: right;
                display: inline-block;
            }
            .cdm-km-chip {
                background: #f0faf5;
                border: 1.5px solid #d8ede3;
                color: #018d38;
                padding: 3px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 700;
                white-space: nowrap;
                display: inline-block;
            }
            .cdm-via-dot {
                display: inline-block;
                width: 8px; height: 8px;
                background: linear-gradient(135deg, #018d38, #3AF9A2);
                border-radius: 50%;
                margin-right: 6px;
                flex-shrink: 0;
            }

            /* Barra de longitud */
            .cdm-td-bar { min-width: 200px; }
            .cdm-bar-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .cdm-bar-track {
                flex: 1;
                height: 7px;
                background: #e8f5ee;
                border-radius: 10px;
                overflow: hidden;
            }
            .cdm-bar-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #018d38 0%, #3AF9A2 100%);
                border-radius: 10px;
                transition: width 0.8s cubic-bezier(0.22,1,0.36,1);
            }
            .cdm-bar-animate { width: var(--pct) !important; }

            /* Filas de grupo (subregiones) */
            .cdm-group-row td { padding: 0 !important; border-bottom: none !important; }
            .cdm-group-cell {
                padding: 0 !important;
            }
            .cdm-group-inner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 18px 6px;
                background: linear-gradient(90deg, #0b5640 0%, #018d38 100%);
                margin-top: 4px;
            }
            .cdm-group-name {
                font-size: 10.5px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                color: #3AF9A2;
            }
            .cdm-group-count {
                font-size: 11px;
                font-weight: 500;
                color: rgba(255,255,255,0.65);
            }

            /* Empty state */
            #cdm-empty {
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 48px 24px;
                color: #b3d9c4;
                font-size: 13px;
            }

            /* ── Footer ── */
            #cdm-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 24px;
                background: #f7fdf9;
                border-top: 1px solid #e8f5ee;
                flex-shrink: 0;
            }
            #cdm-footer-brand {
                display: flex;
                align-items: center;
                gap: 7px;
                font-size: 11px;
                font-weight: 600;
                color: #0b5640;
                opacity: 0.7;
                letter-spacing: 0.3px;
            }
            #cdm-footer-escudo { font-size: 15px; }
            #cdm-footer-close {
                background: linear-gradient(135deg, #0b5640, #018d38);
                color: white;
                border: none;
                padding: 7px 22px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                font-family: 'Prompt', Arial, sans-serif;
                letter-spacing: 0.3px;
                transition: all 0.18s ease;
                box-shadow: 0 2px 8px rgba(1,141,56,0.25);
            }
            #cdm-footer-close:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 14px rgba(1,141,56,0.35);
            }

            @media (max-width: 600px) {
                #cdm-box { max-height: 92vh; border-radius: 16px; }
                #cdm-header { padding: 16px 18px 14px; }
                #cdm-header-title { font-size: 15px; }
                .cdm-td { padding: 9px 12px; font-size: 12px; }
                .cdm-th { padding: 9px 12px; }
                .cdm-td-bar { min-width: 130px; }
            }
        `;
        document.head.appendChild(s);
    }


    getStats() {
        return this.cardsConfig.reduce((stats, card) => {
            stats[card.id] = card.value;
            return stats;
        }, {});
    }

    destroy() {
        const style = document.getElementById('cards-manager-styles');
        if (style) style.remove();
        if (this.container) this.container.innerHTML = '';
    }
}

window.CardsManager = CardsManager;