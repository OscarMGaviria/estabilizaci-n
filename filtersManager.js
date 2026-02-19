// filtersManager.js - Filtros adaptados para Tramos de Vías
class FiltersManager {
    constructor(data, options = {}) {
        this.data = data;
        this.filteredData = [...data];
        
        this.mapManager = null;
        this.tableManager = null;
        this.chartsManager = null;
        this.cardsManager = null;
        
        this.options = {
            containerId: 'filters-container',
            showClearButton: true,
            showExportButton: true,
            animationDuration: 300,
            autoUpdate: true,
            ...options
        };
        
        // Campos de filtro adaptados a nuevos datos
        this.filters = {
            subregion: '',
            municipio: '',
            contratista: '',
            search: '',
            minAvance: null,
            maxAvance: null
        };
        
        this.filterOptions = {
            subregiones: [],
            municipios: [],
            contratistas: [],
            municipiosBySubregion: {}
        };
        
        this.init();
    }
    
    init() {
        this.extractFilterOptions();
        this.createFiltersContainer();
        this.bindEvents();
        this.createFilterStyles();
    }
    
    extractFilterOptions() {
        // Usar campo SUBREGION como fuente principal
        const subregiones = [...new Set(this.data.map(item => item.SUBREGION || item.SUBREGION_1))].filter(Boolean).sort();
        const municipios  = [...new Set(this.data.map(item => item.MPIO_NOMBRE))].filter(Boolean).sort();
        const contratistas = [...new Set(this.data.map(item => item.CONTRATISTA))].filter(Boolean).sort();
        
        const municipiosBySubregion = {};
        subregiones.forEach(subregion => {
            municipiosBySubregion[subregion] = this.data
                .filter(item => (item.SUBREGION || item.SUBREGION_1) === subregion)
                .map(item => item.MPIO_NOMBRE)
                .filter((v, i, s) => s.indexOf(v) === i)
                .sort();
        });
        
        this.filterOptions = { subregiones, municipios, contratistas, municipiosBySubregion };
    }
    
    createFiltersContainer() {
        const header = document.querySelector('.header');
        header.innerHTML = `
            <div class="header-content">
                <h1>Secretaría de Infraestructura Física</h1>
                <div class="filters-container" id="filters-container">
                    <div class="filters-row">

                        <!-- Búsqueda -->
                        <div class="filter-group">
                            <input type="text" id="search-filter"
                                placeholder="Buscar circuito, vía, contratista..."
                                class="filter-input search-input">
                            <div class="filter-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                            </div>
                        </div>

                        <!-- Subregión -->
                        <div class="filter-group">
                            <select id="subregion-filter" class="filter-select">
                                <option value="">Todas las subregiones</option>
                                ${this.filterOptions.subregiones.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Municipio -->
                        <div class="filter-group">
                            <select id="municipio-filter" class="filter-select">
                                <option value="">Todos los municipios</option>
                                ${this.filterOptions.municipios.map(m => `<option value="${m}">${m}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Contratista -->
                        <div class="filter-group">
                            <select id="contratista-filter" class="filter-select">
                                <option value="">Todos los contratistas</option>
                                ${this.filterOptions.contratistas.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Rango de avance -->
                        <div class="filter-group range-group">
                            <input type="number" id="min-avance-filter" placeholder="Av. mín %" class="filter-input range-input" min="0" max="100">
                            <span class="range-separator">-</span>
                            <input type="number" id="max-avance-filter" placeholder="Av. máx %" class="filter-input range-input" min="0" max="100">
                        </div>

                        <!-- Botones de acción -->
                        <div class="filter-actions">
                            <button id="clear-filters-btn" class="filter-btn clear-btn" title="Limpiar filtros">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                            </button>
                            <button id="export-btn" class="filter-btn export-btn" title="Exportar datos">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7,10 12,15 17,10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                            <div class="result-count" id="result-count">${this.data.length} tramos</div>
                        </div>
                    </div>

                    <!-- Filtros activos -->
                    <div class="active-filters" id="active-filters" style="display:none;">
                        <div class="filter-tags" id="filter-tags"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createFilterStyles() {
        const styleId = 'filters-manager-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .header { padding:12px 20px !important; height:60px !important; min-height:60px; }
            .header-content { display:flex; align-items:center; justify-content:space-between; height:100%; gap:20px; }
            .header h1 { margin:0; font-size:20px; font-weight:600; white-space:nowrap; flex-shrink:0; }
            .filters-container { display:flex; flex-direction:column; gap:6px; flex:1; }
            .filters-row { display:flex; gap:10px; align-items:center; justify-content:flex-end; flex-wrap:wrap; }
            .filter-group { position:relative; min-width:130px; flex-shrink:0; }
            .filter-group.range-group { display:flex; align-items:center; gap:6px; min-width:190px; }
            .filter-input, .filter-select { width:100%; padding:6px 10px; border:1px solid rgba(255,255,255,0.3); border-radius:6px; background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); color:white; font-size:12px; transition:all 0.3s ease; height:32px; box-sizing:border-box; }
            .filter-input::placeholder { color:rgba(255,255,255,0.7); }
            .filter-input:focus, .filter-select:focus { outline:none; background:rgba(255,255,255,0.25); border-color:rgba(255,255,255,0.6); box-shadow:0 0 0 2px rgba(255,255,255,0.2); }
            .search-input { padding-right:30px; }
            .filter-icon { position:absolute; right:8px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.7); pointer-events:none; }
            .range-input { min-width:75px; flex:1; }
            .range-separator { color:rgba(255,255,255,0.8); font-weight:600; padding:0 3px; font-size:12px; }
            .filter-select option { color:#333; background:white; }
            .filter-actions { display:flex; gap:8px; align-items:center; flex-shrink:0; }
            .filter-btn { padding:6px 8px; border:1px solid rgba(255,255,255,0.3); border-radius:6px; background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); color:white; cursor:pointer; transition:all 0.3s ease; display:flex; align-items:center; justify-content:center; height:32px; min-width:32px; }
            .filter-btn:hover { background:rgba(255,255,255,0.25); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.15); }
            .result-count { color:rgba(255,255,255,0.9); font-size:11px; padding:6px 10px; background:rgba(255,255,255,0.1); border-radius:12px; backdrop-filter:blur(8px); white-space:nowrap; font-weight:600; border:1px solid rgba(255,255,255,0.2); }
            .clear-btn:hover { background:rgba(231,76,60,0.2); border-color:rgba(231,76,60,0.4); }
            .export-btn:hover { background:rgba(52,152,219,0.2); border-color:rgba(52,152,219,0.4); }
            .active-filters { display:flex; align-items:center; gap:8px; justify-content:flex-end; animation:slideDown 0.3s ease; }
            .filter-tags { display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end; }
            .filter-tag { background:rgba(255,255,255,0.2); color:white; padding:2px 6px 2px 8px; border-radius:12px; font-size:10px; display:flex; align-items:center; gap:4px; backdrop-filter:blur(8px); animation:fadeIn 0.3s ease; }
            .filter-tag .remove-tag { background:rgba(255,255,255,0.3); border:none; color:white; border-radius:50%; width:14px; height:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:9px; transition:background-color 0.2s; }
            .filter-tag .remove-tag:hover { background:rgba(231,76,60,0.6); }
            @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
            @keyframes fadeIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
            @media (max-width:1400px) { .filter-group { min-width:110px; } .filter-group.range-group { min-width:170px; } }
            @media (max-width:1200px) { .header-content { flex-direction:column; align-items:flex-start; gap:10px; } .header { height:auto !important; padding:15px 20px !important; } .filters-row { justify-content:flex-start; width:100%; } }
            @media (max-width:768px) { .header h1 { font-size:16px; } .filters-row { gap:6px; flex-wrap:wrap; } .filter-group { min-width:100px; flex:1; } .filter-input, .filter-select { font-size:11px; height:28px; } .filter-btn { height:28px; min-width:28px; } }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        // Búsqueda
        document.getElementById('search-filter')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.debounceUpdate();
        });
        
        // Subregión → actualiza municipios
        document.getElementById('subregion-filter')?.addEventListener('change', (e) => {
            this.filters.subregion = e.target.value;
            this.updateMunicipioOptions(e.target.value);
            this.applyFilters();
        });
        
        // Municipio
        document.getElementById('municipio-filter')?.addEventListener('change', (e) => {
            this.filters.municipio = e.target.value;
            this.applyFilters();
        });

        // Contratista
        document.getElementById('contratista-filter')?.addEventListener('change', (e) => {
            this.filters.contratista = e.target.value;
            this.applyFilters();
        });
        
        // Rango de avance
        document.getElementById('min-avance-filter')?.addEventListener('change', (e) => {
            this.filters.minAvance = e.target.value !== '' ? parseFloat(e.target.value) : null;
            this.debounceUpdate();
        });
        document.getElementById('max-avance-filter')?.addEventListener('change', (e) => {
            this.filters.maxAvance = e.target.value !== '' ? parseFloat(e.target.value) : null;
            this.debounceUpdate();
        });
        
        // Limpiar y exportar
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => this.clearFilters());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportFilteredData());
    }
    
    updateMunicipioOptions(subregion) {
        const municipioSelect = document.getElementById('municipio-filter');
        const list = !subregion
            ? this.filterOptions.municipios
            : (this.filterOptions.municipiosBySubregion[subregion] || []);
        municipioSelect.innerHTML = `<option value="">Todos los municipios</option>` +
            list.map(m => `<option value="${m}">${m}</option>`).join('');
        this.filters.municipio = '';
    }
    
    applyFilters() {
        this.filteredData = this.data.filter(item => {
            // Búsqueda general
            if (this.filters.search) {
                const searchable = [
                    item.CIRCUITO, item.MPIO_NOMBRE, item.SUBREGION,
                    item.CONTRATISTA, item.NOMBRE_VIA, item.CODIGO_VIA
                ].join(' ').toLowerCase();
                if (!searchable.includes(this.filters.search)) return false;
            }
            // Subregión — usar SUBREGION (capitalización normal, ej: "Oriente")
            if (this.filters.subregion && item.SUBREGION !== this.filters.subregion) return false;
            // Municipio
            if (this.filters.municipio && item.MPIO_NOMBRE !== this.filters.municipio) return false;
            // Contratista
            if (this.filters.contratista && item.CONTRATISTA !== this.filters.contratista) return false;
            // Avance mínimo
            if (this.filters.minAvance !== null) {
                if ((item.Avance || 0) * 100 < this.filters.minAvance) return false;
            }
            // Avance máximo
            if (this.filters.maxAvance !== null) {
                if ((item.Avance || 0) * 100 > this.filters.maxAvance) return false;
            }
            return true;
        });
        
        this.updateComponents();
        this.updateActiveFilters();
        console.log(`🔍 Filtros aplicados: ${this.filteredData.length} de ${this.data.length} tramos`);
    }
    
    updateComponents() {
        try {
            if (this.tableManager?.applyFilters)   this.tableManager.applyFilters(this.filteredData);
            if (this.cardsManager?.applyFilters)    this.cardsManager.applyFilters(this.filteredData);
            if (this.chartsManager?.updateCharts)   this.chartsManager.updateCharts(this.filteredData);
            if (this.mapManager)                    this.updateMapHighlights();
        } catch (error) {
            console.error('Error actualizando componentes:', error);
        }
    }
    
    updateMapHighlights() {
        if (!this.mapManager) return;
        try {
            if (this.mapManager.resetMunicipiosStyle) this.mapManager.resetMunicipiosStyle();
            const municipiosFiltrados = [...new Set(this.filteredData.map(item => item.MPIO_NOMBRE))];
            if (this.filters.municipio && municipiosFiltrados.length === 1) {
                if (this.mapManager.highlightMunicipio) this.mapManager.highlightMunicipio(this.filters.municipio, true);
            } else if (municipiosFiltrados.length > 0) {
                municipiosFiltrados.forEach(m => {
                    if (this.mapManager.highlightMunicipio) this.mapManager.highlightMunicipio(m, false);
                });
                if (municipiosFiltrados.length <= 5 && municipiosFiltrados.length > 1) {
                    this.zoomToFilteredMunicipalities(municipiosFiltrados);
                }
            }
        } catch (error) {
            console.error('Error actualizando mapa:', error);
        }
    }
    
    zoomToFilteredMunicipalities(municipios) {
        if (!this.mapManager?.map) return;
        try {
            const bounds = new L.LatLngBounds();
            let found = false;
            if (this.mapManager.polygonLayer) {
                this.mapManager.polygonLayer.eachLayer(layer => {
                    const name = layer.feature?.properties?.MPIO_NOMBRE;
                    if (name && municipios.includes(name)) { bounds.extend(layer.getBounds()); found = true; }
                });
            }
            if (found && bounds.isValid()) {
                setTimeout(() => {
                    this.mapManager.map.fitBounds(bounds, { padding: [20,20], maxZoom: 10 });
                }, 200);
            }
        } catch (error) {
            console.error('Error haciendo zoom:', error);
        }
    }
    
    updateActiveFilters() {
        const container = document.getElementById('active-filters');
        const tagsContainer = document.getElementById('filter-tags');
        const resultCount = document.getElementById('result-count');
        
        const tags = [];
        if (this.filters.search)      tags.push({ label: `"${this.filters.search}"`, type: 'search' });
        if (this.filters.subregion)   tags.push({ label: this.filters.subregion, type: 'subregion' });
        if (this.filters.municipio)   tags.push({ label: this.filters.municipio, type: 'municipio' });
        if (this.filters.contratista) tags.push({ label: this.filters.contratista, type: 'contratista' });
        if (this.filters.minAvance !== null || this.filters.maxAvance !== null) {
            let label = '';
            if (this.filters.minAvance !== null && this.filters.maxAvance !== null) label = `${this.filters.minAvance}%-${this.filters.maxAvance}%`;
            else if (this.filters.minAvance !== null) label = `≥${this.filters.minAvance}%`;
            else label = `≤${this.filters.maxAvance}%`;
            tags.push({ label, type: 'avance' });
        }

        if (tags.length > 0) {
            container.style.display = 'flex';
            tagsContainer.innerHTML = tags.map(t => `
                <div class="filter-tag">
                    <span>${t.label}</span>
                    <button class="remove-tag" onclick="filtersManager.removeFilter('${t.type}')">×</button>
                </div>`).join('');
        } else {
            container.style.display = 'none';
        }

        if (resultCount) resultCount.textContent = `${this.filteredData.length} de ${this.data.length}`;
    }
    
    removeFilter(type) {
        switch (type) {
            case 'search':      this.filters.search = '';      document.getElementById('search-filter').value = ''; break;
            case 'subregion':   this.filters.subregion = '';   document.getElementById('subregion-filter').value = ''; this.updateMunicipioOptions(''); break;
            case 'municipio':   this.filters.municipio = '';   document.getElementById('municipio-filter').value = ''; break;
            case 'contratista': this.filters.contratista = ''; document.getElementById('contratista-filter').value = ''; break;
            case 'avance':
                this.filters.minAvance = null; this.filters.maxAvance = null;
                document.getElementById('min-avance-filter').value = '';
                document.getElementById('max-avance-filter').value = '';
                break;
        }
        this.applyFilters();
    }
    
    clearFilters() {
        this.filters = { subregion:'', municipio:'', contratista:'', search:'', minAvance:null, maxAvance:null };
        ['search-filter','subregion-filter','municipio-filter','contratista-filter','min-avance-filter','max-avance-filter']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        this.updateMunicipioOptions('');
        this.applyFilters();
        console.log('🧹 Filtros limpiados');
    }
    
    exportFilteredData() {
        const csv = this.convertToCSV(this.filteredData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `tramos_vias_${new Date().toISOString().slice(0,10)}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('📤 Exportados:', this.filteredData.length, 'tramos');
    }
    
    convertToCSV(data) {
        if (!data.length) return '';
        const headers = Object.keys(data[0]);
        return '\ufeff' + [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const v = row[h];
                return typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v;
            }).join(','))
        ].join('\n');
    }
    
    debounceUpdate() {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.applyFilters(), 300);
    }
    
    connectManagers(managers) {
        this.mapManager     = managers.mapManager     || null;
        this.tableManager   = managers.tableManager   || null;
        this.chartsManager  = managers.chartsManager  || null;
        this.cardsManager   = managers.cardsManager   || null;
        console.log('🔗 FiltersManager conectado');
    }
    
    calculateStats(data) {
        return {
            totalTramos: data.length,
            subregiones: new Set(data.map(i => i.SUBREGION)).size,
            municipios:  new Set(data.map(i => i.MPIO_NOMBRE)).size,
            avancePromedio: data.length
                ? (data.reduce((s, i) => s + ((i.Avance || 0) * 100), 0) / data.length).toFixed(1)
                : 0
        };
    }
}

window.FiltersManager = FiltersManager;