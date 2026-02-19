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
                color: '#16a085',
                gradient: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                category: 'count'
            },
            {
                id: 'longitudTotal',
                title: 'Longitud Total',
                icon: 'ruler',
                value: this.calculateLongitudTotal(),
                suffix: 'km',
                color: '#16a085',
                gradient: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                category: 'distance'
            },
            {
                id: 'valorTotal',
                title: 'Valor Total Contratos',
                icon: 'money',
                value: this.calculateValorTotal(),
                suffix: '',
                color: '#16a085',
                gradient: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                category: 'currency_smart'
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
                color: #1a7a5e;
                height: 100%;
                width: 100%;
                min-width: 0;          /* permite encogerse sin desbordarse */
                overflow: hidden;
                box-shadow:
                    0 4px 16px rgba(26, 122, 94, 0.1),
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
                background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(26,122,94,0.05) 100%);
                border-radius: 16px;
                z-index: -1;
            }

            .stat-card:hover {
                transform: translateY(-4px) scale(1.02);
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-color: rgba(47, 168, 122, 0.4);
                box-shadow:
                    0 12px 32px rgba(47, 168, 122, 0.2),
                    0 4px 16px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8);
            }

            .stat-card:active { transform: translateY(-2px) scale(1.01); }

            /* Icono — escala con container queries simulados via clamp */
            .card-icon {
                width: clamp(24px, 3vw, 36px);
                height: clamp(24px, 3vw, 36px);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                background: linear-gradient(135deg, rgba(26,122,94,0.15) 0%, rgba(47,168,122,0.1) 100%);
                border: 1px solid rgba(47, 168, 122, 0.2);
                color: var(--card-color, #1a7a5e);
                margin-bottom: clamp(3px, 0.5vw, 8px);
                flex-shrink: 0;
                transition: all 0.3s ease;
            }

            .card-icon i {
                font-size: clamp(11px, 1.2vw, 16px) !important;
            }

            .stat-card:hover .card-icon {
                transform: scale(1.15) rotate(5deg);
                background: linear-gradient(135deg, rgba(47,168,122,0.25) 0%, rgba(26,122,94,0.2) 100%);
                border-color: rgba(47, 168, 122, 0.4);
                box-shadow: 0 4px 14px rgba(47, 168, 122, 0.3);
            }

            /* Valor numérico — se encoge si el contenedor es angosto */
            .card-value {
                font-size: clamp(13px, 1.8vw, 26px);
                font-weight: 800;
                color: var(--card-color, #1a7a5e);
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
                color: #2fa87a;
                text-shadow: 0 2px 8px rgba(47,168,122,0.3);
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
                color: rgba(26, 122, 94, 0.8);
                margin: 0;
                line-height: 1.2;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                transition: all 0.3s ease;
            }

            .stat-card:hover .card-title { color: #2fa87a; }

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
                case 'valorTotal':       card.value = this.calculateValorTotal(); break;
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
        const event = new CustomEvent('cardClick', {
            detail: { cardId, value: this.cardsConfig.find(c => c.id === cardId)?.value }
        });
        this.container.dispatchEvent(event);
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