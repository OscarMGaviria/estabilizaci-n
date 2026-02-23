// chartsManager.js - Gráficas adaptadas para Tramos de Vías
class ChartsManager {
    constructor(data) {
        this.data              = data;
        this.baseData          = data;  // dataset completo: nunca se filtra
        this.charts            = {};
        this.selectedSubregion = null;
        this._pushing          = false; // flag anti-bucle
        this.colors = {
            primary:   '#018d38',
            secondary: '#0b5640',
            accent:    '#b3d9c4',
            light:     '#f4fbf7'
        };
    }

    initializeCharts() {
        this.renderSubregionChart();
        this.renderMunicipalityChart();
        console.log('Gráficas de tramos inicializadas');
    }

    getSubregionData() {
        const totals = {};
        this.data.forEach(item => {
            const key = item.SUBREGION || item.SUBREGION_1 || 'Sin subregión';
            totals[key] = (totals[key] || 0) + (parseFloat(item['Longitud(m)']) || 0);
        });
        return Object.entries(totals)
            .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
            .sort((a, b) => b.total - a.total);
    }

    _getAllSubregionData() {
        const source = this.baseData || window.jacData || this.data;
        const totals = {};
        source.forEach(item => {
            const key = item.SUBREGION || item.SUBREGION_1 || 'Sin subregión';
            totals[key] = (totals[key] || 0) + (parseFloat(item['Longitud(m)']) || 0);
        });
        return Object.entries(totals)
            .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
            .sort((a, b) => b.total - a.total);
    }

    renderYAxis(maxValue, steps = 5) {
        const labels = [];
        for (let i = steps; i >= 0; i--) {
            const value = (maxValue / steps) * i;
            const label = value >= 100 ? Math.round(value) : value.toFixed(1);
            labels.push('<div style="font-size:11px;color:#0b5640;line-height:1;padding:2px 0;">' + label + ' km</div>');
        }
        return labels.join('');
    }

    animateBars(duration) {
        duration = duration || 800;
        const startTime      = performance.now();
        const verticalBars   = document.querySelectorAll('.bar[data-target-height]');
        const horizontalBars = document.querySelectorAll('.bar-fill[data-target-width]');
        const animate = function(now) {
            const ease = 1 - Math.pow(1 - Math.min((now - startTime) / duration, 1), 3);
            verticalBars.forEach(function(b)   { b.style.height = (parseFloat(b.dataset.targetHeight) * ease) + '%'; });
            horizontalBars.forEach(function(b) { b.style.width  = (parseFloat(b.dataset.targetWidth)  * ease) + '%'; });
            if (ease < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    renderSubregionChart() {
        const container = document.querySelector('.graphics-row .graphic:first-child');
        if (!container) return;

        const allData = this._getAllSubregionData();
        if (!allData.length) return;

        const maxValue = Math.max.apply(null, allData.map(function(d) { return d.total; }));
        const selected = this.selectedSubregion;

        let barsHTML = '';
        allData.forEach(function(item) {
            const height      = (item.total / maxValue) * 100;
            const isSelected  = selected === item.name;
            const isOther     = selected !== null && !isSelected;
            const opacity     = isOther ? '0.22' : '1';
            const barBg       = isSelected
                ? 'linear-gradient(180deg,#3AF9A2 0%,#018d38 100%)'
                : 'linear-gradient(180deg,#018d38 0%,#0b5640 100%)';
            const labelWeight = isSelected ? '700' : '500';
            const labelColor  = isOther ? '#aac8b4' : '#0b5640';
            const ringStyle   = isSelected
                ? 'box-shadow:0 0 0 2.5px #018d38,0 2px 8px rgba(1,141,56,0.35);'
                : 'box-shadow:0 2px 4px rgba(1,141,56,0.2);';

            barsHTML += '<div class="bar-container" data-subregion="' + item.name + '" title="' + item.name + ': ' + item.total.toFixed(2) + ' km" style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;min-width:0;position:relative;opacity:' + opacity + ';transition:opacity 0.35s ease;cursor:pointer;">'
                + '<div class="chart-tooltip" style="position:absolute;bottom:calc(' + height + '% + 10px);background:rgba(11,86,64,0.96);color:white;padding:6px 10px;border-radius:7px;font-size:11px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(5px);transition:all 0.2s ease;z-index:20;box-shadow:0 4px 12px rgba(0,0,0,0.25);text-align:center;font-family:\'Prompt\',Arial,sans-serif;">'
                + item.name + '<br>' + item.total.toFixed(2) + ' km</div>'
                + '<div class="bar" data-target-height="' + height + '" style="width:75%;height:0%;background:' + barBg + ';border-radius:5px 5px 0 0;margin-top:auto;transition:background 0.3s ease,transform 0.22s ease;' + ringStyle + '"></div>'
                + '<div class="bar-label" style="margin-top:5px;font-size:10px;font-weight:' + labelWeight + ';color:' + labelColor + ';text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;font-family:\'Prompt\',Arial,sans-serif;transition:color 0.3s ease;">'
                + item.name + '</div></div>';
        });

        const clearPillHTML = selected
            ? '<span id="chart-clear-btn" style="font-size:11px;font-weight:500;color:#018d38;cursor:pointer;padding:2px 10px;border:1.5px solid #018d38;border-radius:12px;background:rgba(1,141,56,0.06);transition:all 0.2s;">&#10005;&nbsp;' + selected + '</span>'
            : '';

        container.innerHTML = '<div class="chart-container" style="position:relative;width:100%;height:100%;box-sizing:border-box;">'
            + '<div style="position:absolute;top:0;left:0;right:0;height:32px;padding:4px 10px;font-size:13px;font-weight:600;color:#0b5640;border-bottom:1px solid #d8ede3;box-sizing:border-box;z-index:5;font-family:\'Prompt\',Arial,sans-serif;display:flex;align-items:center;justify-content:space-between;">'
            + '<span>Longitud por subregión (km)</span>' + clearPillHTML + '</div>'
            + '<div style="position:absolute;top:32px;left:0;right:0;bottom:0;display:flex;box-sizing:border-box;">'
            + '<div class="y-axis" style="width:58px;display:flex;flex-direction:column;justify-content:space-between;padding:10px 6px;font-size:11px;color:#0b5640;text-align:right;border-right:1px solid #d8ede3;box-sizing:border-box;">'
            + this.renderYAxis(maxValue) + '</div>'
            + '<div class="chart-content" style="flex:1;display:flex;align-items:flex-end;justify-content:space-around;padding:10px 10px 4px 10px;gap:6px;overflow:visible;box-sizing:border-box;">'
            + barsHTML + '</div></div></div>';

        this._attachChartListeners(container);
        this.animateBars(800);
    }

    _attachChartListeners(container) {
        const self = this;

        const clearBtn = container.querySelector('#chart-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() { self.clearSubregionFilter(); });
            clearBtn.addEventListener('mouseover', function() { clearBtn.style.background = '#018d38'; clearBtn.style.color = 'white'; });
            clearBtn.addEventListener('mouseout',  function() { clearBtn.style.background = 'rgba(1,141,56,0.06)'; clearBtn.style.color = '#018d38'; });
        }

        container.querySelectorAll('.bar-container').forEach(function(bc) {
            const subregion = bc.dataset.subregion;
            const bar     = bc.querySelector('.bar');
            const tooltip = bc.querySelector('.chart-tooltip');

            bc.addEventListener('click', function() { self.handleBarClick(subregion); });

            bc.addEventListener('mouseover', function() {
                if (bar)     bar.style.transform     = 'scaleY(1.05) scaleX(1.04)';
                if (tooltip) { tooltip.style.opacity = '1'; tooltip.style.transform = 'translateY(0)'; }
            });
            bc.addEventListener('mouseout', function() {
                if (bar)     bar.style.transform     = '';
                if (tooltip) { tooltip.style.opacity = '0'; tooltip.style.transform = 'translateY(5px)'; }
            });
        });
    }

    handleBarClick(subregionName) {
        if (this.selectedSubregion === subregionName) {
            this.clearSubregionFilter();
        } else {
            this.selectedSubregion = subregionName;
            this.renderSubregionChart();
            this._pushFilterToManagers(subregionName);
        }
    }

    clearSubregionFilter() {
        this.selectedSubregion = null;
        this.renderSubregionChart();
        this._pushFilterToManagers('');
    }

    // Inyectar referencia al filtersManager (llamado desde connectManagers o index.html)
    setFiltersManager(fm) {
        this._filtersManager = fm;
    }

    // Propaga a filtersManager; el flag evita que updateCharts() reactive este método
    _pushFilterToManagers(value) {
        const fm = this._filtersManager || window.filtersManager;
        if (this._pushing || !fm) return;
        this._pushing = true;
        try {
            const select = document.getElementById('subregion-filter');
            if (select) select.value = value;
            fm.filters.subregion = value;
            fm.applyFilters();
        } finally {
            this._pushing = false;
        }
    }

    // Sincronización inversa: dropdown → gráfica (sin disparar applyFilters de nuevo)
    setSelectedSubregion(subregionName) {
        this.selectedSubregion = subregionName || null;
        this.renderSubregionChart();
    }

    // Llamado por filtersManager.updateComponents()
    // newData son los datos ya filtrados — los guardamos para stats/cards
    // pero la gráfica SIEMPRE dibuja todas las subregiones desde window.jacData
    updateCharts(newData) {
        // Si el propio clic en barra disparó este ciclo, ignorarlo —
        // la gráfica ya se re-renderizó en handleBarClick
        if (this._pushing) return;
        this.data = newData;
        // Siempre re-renderizar para que los listeners queden frescos
        this.renderSubregionChart();
        this.renderMunicipalityChart();
    }

    addScrollStyles() {
        if (document.getElementById('charts-scroll-styles')) return;
        const style = document.createElement('style');
        style.id = 'charts-scroll-styles';
        style.textContent = '.chart-scroll-container::-webkit-scrollbar{width:6px}.chart-scroll-container::-webkit-scrollbar-track{background:#d8ede3;border-radius:3px}.chart-scroll-container::-webkit-scrollbar-thumb{background:#018d38;border-radius:3px}.chart-scroll-container::-webkit-scrollbar-thumb:hover{background:#0b5640}';
        document.head.appendChild(style);
    }

    getStats() {
        const totalLongitud = this.data.reduce(function(s, item) { return s + (parseFloat(item['Longitud(m)']) || 0); }, 0);
        return {
            totalTramos:   this.data.length,
            totalLongitud: Math.round(totalLongitud * 10) / 10,
            subregiones:   new Set(this.data.map(function(i) { return i.SUBREGION; })).size,
            municipios:    new Set(this.data.map(function(i) { return i.MPIO_NOMBRE; })).size
        };
    }

    filterData(filters) {
        filters = filters || {};
        let filtered = this.data.slice();
        if (filters.subregion)  filtered = filtered.filter(function(i) { return i.SUBREGION === filters.subregion; });
        if (filters.municipio)  filtered = filtered.filter(function(i) { return i.MPIO_NOMBRE === filters.municipio; });
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(function(i) { return Object.values(i).some(function(v) { return String(v).toLowerCase().includes(term); }); });
        }
        const tmp = new ChartsManager(filtered);
        tmp.colors = this.colors;
        tmp.renderSubregionChart();
        tmp.renderMunicipalityChart();
        return filtered;
    }

    integrateWithMap(mapManager) {
        const self = this;
        setTimeout(function() {
            document.querySelectorAll('.horizontal-bar-container').forEach(function(bar, i) {
                const municipalityData = self.getMunicipalityData ? self.getMunicipalityData() : [];
                if (municipalityData[i]) {
                    bar.addEventListener('click', function() {
                        if (mapManager && mapManager.highlightMunicipio) mapManager.highlightMunicipio(municipalityData[i].name);
                    });
                }
            });
        }, 1000);
    }

    renderMunicipalityChart() { /* placeholder */ }
}

window.ChartsUtils = {
    syncWithTableFilters: function(tableManager, chartsManager) {
        if (tableManager && chartsManager) chartsManager.updateCharts(tableManager.filteredData || tableManager.data);
    },
    showStats: function(chartsManager) {
        if (!chartsManager) return;
        const stats = chartsManager.getStats();
        console.table(stats);
        return stats;
    },
    highlightData: function(chartsManager, municipio) {
        console.log('Resaltar en gráficas: ' + municipio);
    }
};