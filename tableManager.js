// tableManager.js - Tabla para Tramos de Vías con modal de columnas
class TableManager {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.filteredData = [...data];

        // Definición de todas las columnas con las claves exactas del JSON
        this.allColumns = [
            { key: 'ID',             label: 'ID',                   active: true,  type: 'number' },
            { key: 'CIRCUITO',       label: 'CIRCUITO',             active: true,  type: 'text'   },
            { key: 'SUBREGION',      label: 'SUBREGIÓN',            active: true,  type: 'text'   },
            { key: 'MPIO_NOMBRE',    label: 'MUNICIPIO',            active: true,  type: 'text'   },
            { key: 'CONTRATISTA',    label: 'CONTRATISTA',          active: true,  type: 'text'   },
            { key: 'NOMBRE_VIA',     label: 'VÍA',                  active: true,  type: 'text'   },
            { key: 'CODIGO_VIA',     label: 'CÓDIGO VÍA',           active: true,  type: 'text'   },
            { key: 'VALOR_CTO',      label: 'VALOR CONTRATO',       active: true,  type: 'currency'},
            { key: 'Longitud (km)',  label: 'LONG. CIRCUITO (km)',  active: true,  type: 'decimal' },
            { key: 'Longitud(m)',    label: 'LONG. TRAMO (km)',     active: true,  type: 'decimal' },
            { key: 'Long_m',         label: 'LONG. TRAMO (m)',      active: false, type: 'decimal' },
            { key: 'PLAZO (MESES)',  label: 'PLAZO (meses)',        active: false, type: 'number'  },
            { key: 'ACTA_INICIO',    label: 'ACTA INICIO',          active: false, type: 'text'   },
            { key: 'ACTA_FIN',       label: 'ACTA FIN',             active: false, type: 'text'   },
            { key: 'Dias',           label: 'DÍAS TRANSCURRIDOS',   active: false, type: 'number'  },
            { key: 'Avance',         label: 'AVANCE (%)',           active: true,  type: 'percent' },
            { key: 'NO_CONTRATO',    label: 'No. CONTRATO',         active: false, type: 'text'   },
            { key: 'LOTE',           label: 'LOTE',                 active: false, type: 'number'  },
            { key: 'TIPO_VIA',       label: 'TIPO VÍA',             active: false, type: 'number'  },
            { key: 'ORDEN',          label: 'ORDEN',                active: false, type: 'number'  },
            { key: 'SUBREGION_1',    label: 'SUBREGIÓN 2',          active: false, type: 'text'   },
        ];

        this.init();
        this.createTableStyles();
    }

    init() {
        this.render();
        this.injectColumnModalStyles();
    }

    getActiveColumns() {
        return this.allColumns.filter(c => c.active);
    }

    // ────────────────────────────────────────────
    // ESTILOS DE LA TABLA (igual al original)
    // ────────────────────────────────────────────
    createTableStyles() {
        const styleId = 'table-manager-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .table-wrapper {
                flex: 1; overflow: hidden;
                background: rgba(255,255,255,0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 16px;
                box-shadow: 0 4px 16px rgba(26,122,94,0.1), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6);
                position: relative;
            }
            .table-wrapper::before {
                content:''; position:absolute; top:0; left:0; right:0; bottom:0;
                background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(26,122,94,0.05) 100%);
                border-radius:16px; z-index:-1;
            }
            .table-header-bar {
                display: flex; align-items: center; justify-content: space-between;
                padding: 8px 14px;
                background: linear-gradient(135deg, rgba(26,122,94,0.95) 0%, rgba(47,168,122,0.90) 100%);
                border-radius: 16px 16px 0 0;
            }
            .table-header-bar span {
                color: white; font-size: 11px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .columns-toggle-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 6px;
                color: white; font-size: 11px; font-weight: 600;
                padding: 4px 10px; cursor: pointer;
                transition: all 0.2s ease;
                display: flex; align-items: center; gap: 5px;
            }
            .columns-toggle-btn:hover {
                background: rgba(255,255,255,0.35);
            }
            .table-scroll-container {
                overflow: auto; height: calc(100% - 38px); border-radius: 0 0 16px 16px;
                scrollbar-width: thin; scrollbar-color: rgba(47,168,122,0.3) transparent;
            }
            .table-scroll-container::-webkit-scrollbar { width:8px; height:8px; }
            .table-scroll-container::-webkit-scrollbar-track { background:rgba(255,255,255,0.1); border-radius:4px; }
            .table-scroll-container::-webkit-scrollbar-thumb { background:rgba(47,168,122,0.3); border-radius:4px; }
            .table-scroll-container::-webkit-scrollbar-thumb:hover { background:rgba(47,168,122,0.5); }
            .data-table { width:100%; border-collapse:collapse; font-size:12px; background:transparent; }
            .data-table thead { position:sticky; top:0; z-index:10; background:linear-gradient(135deg,rgba(26,122,94,0.95) 0%,rgba(47,168,122,0.90) 100%); backdrop-filter:blur(15px); }
            .data-table th { padding:14px 12px; text-align:left; font-weight:700; white-space:nowrap; color:white; text-transform:uppercase; font-size:10px; letter-spacing:0.8px; border-right:1px solid rgba(255,255,255,0.2); text-shadow:0 1px 2px rgba(0,0,0,0.2); position:relative; }
            .data-table th:last-child { border-right:none; }
            .data-table tbody tr { border-bottom:1px solid rgba(26,122,94,0.1); transition:all 0.3s cubic-bezier(0.4,0,0.2,1); background:rgba(255,255,255,0.3); }
            .data-table tbody tr:nth-child(even) { background:rgba(248,252,250,0.4); }
            .data-table tbody tr:hover { background:rgba(47,168,122,0.1); backdrop-filter:blur(8px); transform:translateX(4px); box-shadow:0 2px 8px rgba(47,168,122,0.15); }
            .data-table td { padding:12px; border-right:1px solid rgba(26,122,94,0.08); color:#1a7a5e; font-weight:500; position:relative; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; }
            .data-table td:last-child { border-right:none; }
            .text-cell { max-width:250px; font-size:11px; }
            .number-cell { text-align:right; font-weight:600; font-family:'Monaco','Menlo',monospace; color:#2fa87a; }
            .currency-cell { text-align:right; font-weight:700; font-family:'Monaco','Menlo',monospace; color:#1a7a5e; text-shadow:0 1px 2px rgba(255,255,255,0.8); }
            .percent-cell { text-align:center; font-weight:700; }
            .no-data { text-align:center; padding:40px !important; color:rgba(26,122,94,0.6); font-style:italic; font-size:14px; }
            .data-table td[title] { cursor:help; }
            .data-table tbody tr { opacity:0; animation:fadeInUp 0.4s ease-out forwards; }
            .data-table tbody tr:nth-child(1) { animation-delay:0.05s; }
            .data-table tbody tr:nth-child(2) { animation-delay:0.1s; }
            .data-table tbody tr:nth-child(3) { animation-delay:0.15s; }
            .data-table tbody tr:nth-child(4) { animation-delay:0.2s; }
            .data-table tbody tr:nth-child(5) { animation-delay:0.25s; }
            @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
            @media (max-width:768px) { .data-table { font-size:10px; } .data-table th { padding:10px 8px; font-size:9px; } .data-table td { padding:8px; max-width:120px; } }
        `;
        document.head.appendChild(style);
    }

    // ────────────────────────────────────────────
    // ESTILOS DEL MODAL DE COLUMNAS
    // ────────────────────────────────────────────
    injectColumnModalStyles() {
        if (document.getElementById('column-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'column-modal-styles';
        style.textContent = `
            .col-modal-overlay {
                position: fixed; top:0; left:0; width:100%; height:100%;
                background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
                z-index: 9999; display:flex; align-items:center; justify-content:center;
                opacity:0; visibility:hidden; transition: all 0.3s ease;
            }
            .col-modal-overlay.show { opacity:1; visibility:visible; }
            .col-modal {
                background: rgba(255,255,255,0.95);
                border-radius: 16px;
                padding: 24px;
                min-width: 340px; max-width: 480px; width: 90%;
                box-shadow: 0 20px 60px rgba(26,122,94,0.25);
                transform: translateY(20px) scale(0.97);
                transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
            }
            .col-modal-overlay.show .col-modal { transform: translateY(0) scale(1); }
            .col-modal-header {
                display:flex; align-items:center; justify-content:space-between;
                margin-bottom: 16px;
                border-bottom: 2px solid rgba(47,168,122,0.2); padding-bottom: 12px;
            }
            .col-modal-header h3 { margin:0; color:#1a7a5e; font-size:15px; font-weight:700; }
            .col-modal-close {
                background:none; border:none; font-size:22px; cursor:pointer;
                color: rgba(26,122,94,0.7); transition: color 0.2s;
            }
            .col-modal-close:hover { color:#1a7a5e; }
            .col-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 8px; max-height: 360px; overflow-y:auto;
                padding-right: 4px;
                scrollbar-width: thin; scrollbar-color: rgba(47,168,122,0.3) transparent;
            }
            .col-grid::-webkit-scrollbar { width:5px; }
            .col-grid::-webkit-scrollbar-thumb { background:rgba(47,168,122,0.3); border-radius:3px; }
            .col-item {
                display:flex; align-items:center; gap:8px;
                background: rgba(248,252,250,0.8); border:1px solid rgba(47,168,122,0.15);
                border-radius:8px; padding:8px 10px; cursor:pointer;
                transition: all 0.2s ease; user-select:none;
            }
            .col-item:hover { background:rgba(47,168,122,0.1); border-color:rgba(47,168,122,0.3); }
            .col-item.active { background:rgba(47,168,122,0.12); border-color:rgba(47,168,122,0.5); }
            .col-checkbox {
                width:16px; height:16px; border-radius:4px;
                border:2px solid rgba(47,168,122,0.4);
                display:flex; align-items:center; justify-content:center;
                flex-shrink:0; transition: all 0.2s;
            }
            .col-item.active .col-checkbox {
                background:#2fa87a; border-color:#2fa87a;
            }
            .col-item.active .col-checkbox::after {
                content:'✓'; color:white; font-size:10px; font-weight:700;
            }
            .col-label { font-size:11px; font-weight:600; color:#1a7a5e; }
            .col-modal-footer {
                display:flex; justify-content:flex-end; gap:10px;
                margin-top:16px; padding-top:12px;
                border-top:1px solid rgba(47,168,122,0.15);
            }
            .col-btn {
                padding:8px 18px; border-radius:8px; font-size:12px; font-weight:600;
                border:none; cursor:pointer; transition:all 0.2s ease;
            }
            .col-btn-cancel {
                background:rgba(248,252,250,0.9); color:#1a7a5e;
                border:1px solid rgba(47,168,122,0.3);
            }
            .col-btn-cancel:hover { background:rgba(47,168,122,0.1); }
            .col-btn-apply {
                background:linear-gradient(135deg,#1a7a5e 0%,#2fa87a 100%);
                color:white;
                box-shadow:0 4px 12px rgba(47,168,122,0.3);
            }
            .col-btn-apply:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(47,168,122,0.4); }
        `;
        document.head.appendChild(style);
    }

    // ────────────────────────────────────────────
    // RENDER PRINCIPAL
    // ────────────────────────────────────────────
    render() {
        this.container.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header-bar">
                    <span>Tramos de Vías</span>
                    <button class="columns-toggle-btn" id="toggle-columns-btn">
                        <i class="fas fa-columns"></i> Columnas
                    </button>
                </div>
                <div class="table-scroll-container">
                    <table class="data-table">
                        <thead><tr>${this.renderTableHeaders()}</tr></thead>
                        <tbody>${this.renderTableRows()}</tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('toggle-columns-btn').addEventListener('click', () => this.openColumnModal());
    }

    renderTableHeaders() {
        return this.getActiveColumns().map(col => `<th data-column="${col.key}">${col.label}</th>`).join('');
    }

    renderTableRows() {
        if (!this.filteredData.length) {
            return `<tr><td colspan="${this.getActiveColumns().length}" class="no-data">No se encontraron registros</td></tr>`;
        }
        return this.filteredData.map((row, index) => {
            const cells = this.getActiveColumns().map(col => {
                const value = row[col.key];
                switch (col.type) {
                    case 'currency':
                        return `<td class="currency-cell">${this.formatCurrency(value)}</td>`;
                    case 'percent':
                        const pct = ((value || 0) * 100).toFixed(1);
                        const color = pct >= 50 ? '#16a085' : pct >= 20 ? '#f39c12' : '#e74c3c';
                        return `<td class="percent-cell" style="color:${color}">${pct}%</td>`;
                    case 'decimal': {
                        const num = parseFloat(value);
                        const display = isNaN(num) ? '-' : num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        return `<td class="number-cell">${display}</td>`;
                    }
                    case 'number': {
                        let numDisplay;
                        if (value === null || value === undefined || value === '') {
                            numDisplay = '-';
                        } else {
                            const num = parseFloat(value);
                            // Si tiene decimales relevantes, mostrarlos (máx 2)
                            numDisplay = Number.isInteger(num)
                                ? num.toLocaleString('es-CO')
                                : num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                        return `<td class="number-cell">${numDisplay}</td>`;
                    }
                    default:
                        const txt = value ? value.toString() : '';
                        const truncated = this.truncateText(txt, 30);
                        const needsTitle = txt.length > 30;
                        return `<td class="text-cell"${needsTitle ? ` title="${txt}"` : ''}>${truncated}</td>`;
                }
            }).join('');
            return `<tr style="animation-delay:${Math.min(index * 0.05, 1)}s;">${cells}</tr>`;
        }).join('');
    }

    // ────────────────────────────────────────────
    // MODAL DE COLUMNAS
    // ────────────────────────────────────────────
    openColumnModal() {
        // Evitar duplicados
        let overlay = document.getElementById('col-modal-overlay');
        if (overlay) { overlay.classList.add('show'); return; }

        overlay = document.createElement('div');
        overlay.className = 'col-modal-overlay';
        overlay.id = 'col-modal-overlay';

        // Estado temporal (copia del estado actual)
        let tempState = this.allColumns.map(c => ({ ...c }));

        const buildModalContent = () => {
            overlay.innerHTML = `
                <div class="col-modal">
                    <div class="col-modal-header">
                        <h3><i class="fas fa-columns" style="margin-right:8px;color:#2fa87a;"></i>Gestionar Columnas</h3>
                        <button class="col-modal-close" id="col-close-btn">×</button>
                    </div>
                    <div class="col-grid" id="col-grid">
                        ${tempState.map((col, i) => `
                            <div class="col-item${col.active ? ' active' : ''}" data-index="${i}">
                                <div class="col-checkbox"></div>
                                <span class="col-label">${col.label}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="col-modal-footer">
                        <button class="col-btn col-btn-cancel" id="col-cancel-btn">Cancelar</button>
                        <button class="col-btn col-btn-apply" id="col-apply-btn">Aplicar</button>
                    </div>
                </div>
            `;
        };

        buildModalContent();
        document.body.appendChild(overlay);

        // Toggle columnas individuales
        overlay.addEventListener('click', (e) => {
            const item = e.target.closest('.col-item');
            if (item) {
                const idx = parseInt(item.dataset.index);
                tempState[idx].active = !tempState[idx].active;
                item.classList.toggle('active', tempState[idx].active);
            }
        });

        // Cerrar
        const close = () => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 300); };
        overlay.querySelector('#col-close-btn').addEventListener('click', close);
        overlay.querySelector('#col-cancel-btn').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        // Aplicar
        overlay.querySelector('#col-apply-btn').addEventListener('click', () => {
            // Asegurar al menos 1 columna activa
            const anyActive = tempState.some(c => c.active);
            if (!anyActive) { alert('Selecciona al menos una columna.'); return; }
            this.allColumns = tempState;
            this.updateTable();
            // También actualizar el header
            const thead = this.container.querySelector('thead tr');
            if (thead) thead.innerHTML = this.renderTableHeaders();
            close();
        });

        requestAnimationFrame(() => overlay.classList.add('show'));
    }

    // ────────────────────────────────────────────
    // UTILIDADES
    // ────────────────────────────────────────────
    truncateText(text, maxLength) {
        if (!text || text.toString().length <= maxLength) return text || '';
        return text.toString().substring(0, maxLength) + '...';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP',
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(value);
    }

    applyFilters(filteredData) {
        this.filteredData = filteredData || this.data;
        this.updateTable();
    }

    updateTable() {
        const tbody = this.container.querySelector('tbody');
        if (tbody) tbody.innerHTML = this.renderTableRows();
        // Actualizar header también si las columnas cambiaron
        const thead = this.container.querySelector('thead tr');
        if (thead) thead.innerHTML = this.renderTableHeaders();
    }

    updateData(newData) {
        this.data = newData;
        this.filteredData = [...newData];
        this.render();
    }

    get filteredData() { return this._filteredData; }
    set filteredData(data) { this._filteredData = data; }
}

window.TableManager = TableManager;