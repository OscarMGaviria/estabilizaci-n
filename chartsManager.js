// chartsManager.js - Gráficas adaptadas para Tramos de Vías
class ChartsManager {
    constructor(data) {
        this.data = data;
        this.charts = {};
        this.colors = {
            primary: '#2fa87a',
            secondary: '#1a7a5e',
            accent: '#b8d4c8',
            light: '#f8fcfa',
            gradient1: '#2fa87a',
            gradient2: '#1a7a5e'
        };
    }

    initializeCharts() {
        this.renderSubregionChart();
        this.renderMunicipalityChart();
        console.log('✅ Gráficas de tramos inicializadas');
    }

    // Longitud total por subregión — campo "Longitud(m)" contiene valores en km
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

    // Longitud total por municipio — campo "Longitud(m)" contiene valores en km
    getMunicipalityData() {
        const totals = {};
        this.data.forEach(item => {
            const key = item.MPIO_NOMBRE || 'Sin municipio';
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
            labels.push(`
                <div style="font-size:11px;color:#1a7a5e;line-height:1;padding:2px 0;">
                    ${label}
                </div>
            `);
        }
        return labels.join('');
    }

    animateBars(duration = 1000) {
        const startTime = performance.now();
        const verticalBars = document.querySelectorAll('.bar[data-target-height]');
        const horizontalBars = document.querySelectorAll('.bar-fill[data-target-width]');

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            verticalBars.forEach(bar => {
                bar.style.height = `${parseFloat(bar.dataset.targetHeight) * ease}%`;
            });
            horizontalBars.forEach(bar => {
                bar.style.width = `${parseFloat(bar.dataset.targetWidth) * ease}%`;
            });

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    renderSubregionChart() {
        const container = document.querySelector('.graphics-row .graphic:first-child');
        if (!container) return;

        const data = this.getSubregionData();
        if (!data.length) return;

        const maxValue = Math.max(...data.map(d => d.total));

        container.innerHTML = `
            <div class="chart-container" style="position:relative;width:100%;height:100%;box-sizing:border-box;">
                <div style="position:absolute;top:0;left:0;right:0;height:28px;padding:4px 10px;font-size:13px;font-weight:600;color:#1a7a5e;border-bottom:1px solid #e0f0e8;box-sizing:border-box;z-index:5;">
                Longitud por subregión (km)
                </div>
                <div style="position:absolute;top:28px;left:0;right:0;bottom:0;display:flex;box-sizing:border-box;">
                    <div class="y-axis" style="width:40px;display:flex;flex-direction:column;justify-content:space-between;padding:10px 6px;font-size:11px;color:#1a7a5e;text-align:right;border-right:1px solid #e0f0e8;box-sizing:border-box;">
                        ${this.renderYAxis(maxValue)}
                    </div>
                    <div class="chart-content" style="flex:1;display:flex;align-items:flex-end;justify-content:space-around;padding:10px;gap:8px;overflow:visible;box-sizing:border-box;">
                        ${data.map(item => {
                            const height = (item.total / maxValue) * 100;
                            return `
                                <div class="bar-container" style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;min-width:0;position:relative;">
                                    <div class="chart-tooltip" style="position:absolute;bottom:calc(${height}% + 8px);background:rgba(26,122,94,0.95);color:white;padding:6px 8px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(5px);transition:all 0.2s ease;z-index:20;box-shadow:0 4px 10px rgba(0,0,0,0.25);text-align:center;">
                                        ${item.name}<br>${item.total.toFixed(2)} km
                                    </div>
                                    <div class="bar" data-target-height="${height}"
                                        style="width:100%;height:0%;background:linear-gradient(180deg,${this.colors.primary} 0%,${this.colors.secondary} 100%);border-radius:6px 6px 0 0;margin-top:auto;transition:all 0.25s ease;cursor:pointer;box-shadow:0 2px 4px rgba(47,168,122,0.2);"
                                        onmouseover="this.style.transform='scaleY(1.05)';this.previousElementSibling.style.opacity='1';this.previousElementSibling.style.transform='translateY(0)';"
                                        onmouseout="this.style.transform='scaleY(1)';this.previousElementSibling.style.opacity='0';this.previousElementSibling.style.transform='translateY(5px)';">
                                    </div>
                                    <div class="bar-label" style="margin-top:6px;font-size:10px;font-weight:500;color:#1a7a5e;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px;">
                                        ${item.name}
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>`;
        this.animateBars(1000);
    }

    renderMunicipalityChart() {
        const container = document.querySelector('.graphics-row .graphic:last-child');
        if (!container) return;

        const data = this.getMunicipalityData();
        if (!data.length) return;

        const maxValue = Math.max(...data.map(d => d.total));

        container.innerHTML = `
            <div class="chart-container" style="position:relative;width:100%;height:100%;box-sizing:border-box;overflow:hidden;">
                <div style="height:28px;padding:4px 10px;font-size:13px;font-weight:600;color:#1a7a5e;border-bottom:1px solid #e0f0e8;box-sizing:border-box;">
                Longitud por municipio (km)
                </div>
                <div class="chart-scroll-container" style="position:absolute;top:28px;left:0;right:0;bottom:22px;overflow-y:auto;overflow-x:hidden;padding:10px;box-sizing:border-box;">
                    <div class="horizontal-bars" style="display:flex;flex-direction:column;gap:10px;">
                        ${data.map(item => {
                            const width = (item.total / maxValue) * 100;
                            return `
                                <div class="horizontal-bar-container" style="display:flex;align-items:center;height:38px;padding:0 8px;border-radius:2px;border:1px solid #e0f0e8;background:transparent;position:relative;box-sizing:border-box;cursor:pointer;"
                                    onmouseover="this.style.borderColor='#2fa87a';const tt=this.querySelector('.chart-tooltip');tt.style.opacity='1';tt.style.transform='translateY(0)';"
                                    onmouseout="this.style.borderColor='#e0f0e8';const tt=this.querySelector('.chart-tooltip');tt.style.opacity='0';tt.style.transform='translateY(6px)';">
                                    <div class="chart-tooltip" style="position:absolute;top:-6px;left:150px;background:rgba(26,122,94,0.95);color:white;padding:6px 8px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(6px);transition:all 0.2s ease;z-index:20;box-shadow:0 4px 10px rgba(0,0,0,0.25);">
                                        ${item.name}<br>${item.total.toFixed(2)} km
                                    </div>
                                    <div style="width:130px;font-size:11px;font-weight:500;color:#1a7a5e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;">
                                        ${item.name}
                                    </div>
                                    <div style="width:100%;height:20px;margin-left:10px;position:relative;overflow:hidden;">
                                        <div class="bar-fill" data-target-width="${width}"
                                            style="height:100%;width:0%;max-width:100%;background:linear-gradient(90deg,${this.colors.primary} 0%,${this.colors.secondary} 100%);border-radius:2px;box-shadow:0 2px 4px rgba(47,168,122,0.35);">
                                        </div>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>
                <div style="position:absolute;left:160px;right:10px;bottom:0;height:22px;display:flex;justify-content:space-between;font-size:10px;color:#1a7a5e;padding:0 4px;box-sizing:border-box;">
                    <span>0</span>
                    <span>${(maxValue / 2).toFixed(1)} km</span>
                    <span>${maxValue.toFixed(1)} km</span>
                </div>
            </div>`;

        this.animateBars(4000);
        this.addScrollStyles();
    }

    addScrollStyles() {
        if (document.getElementById('charts-scroll-styles')) return;
        const style = document.createElement('style');
        style.id = 'charts-scroll-styles';
        style.textContent = `
            .chart-scroll-container::-webkit-scrollbar { width: 6px; }
            .chart-scroll-container::-webkit-scrollbar-track { background: #e0f0e8; border-radius: 3px; }
            .chart-scroll-container::-webkit-scrollbar-thumb { background: #2fa87a; border-radius: 3px; }
            .chart-scroll-container::-webkit-scrollbar-thumb:hover { background: #1a7a5e; }
        `;
        document.head.appendChild(style);
    }

    updateCharts(newData) {
        this.data = newData;
        this.renderSubregionChart();
        this.renderMunicipalityChart();
    }

    getStats() {
        const totalLongitud = this.data.reduce((s, item) => s + (parseFloat(item['Longitud(m)']) || 0), 0);
        return {
            totalTramos: this.data.length,
            totalLongitud: Math.round(totalLongitud * 10) / 10,
            subregiones: new Set(this.data.map(item => item.SUBREGION)).size,
            municipios: new Set(this.data.map(item => item.MPIO_NOMBRE)).size
        };
    }

    filterData(filters = {}) {
        let filtered = [...this.data];
        if (filters.subregion) filtered = filtered.filter(i => i.SUBREGION === filters.subregion);
        if (filters.municipio) filtered = filtered.filter(i => i.MPIO_NOMBRE === filters.municipio);
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(i => Object.values(i).some(v => String(v).toLowerCase().includes(term)));
        }
        const tempManager = new ChartsManager(filtered);
        tempManager.colors = this.colors;
        tempManager.renderSubregionChart();
        tempManager.renderMunicipalityChart();
        return filtered;
    }

    integrateWithMap(mapManager) {
        setTimeout(() => {
            const bars = document.querySelectorAll('.graphics-row .graphic:first-child .bar');
            bars.forEach((bar, index) => {
                const subregionData = this.getSubregionData();
                if (subregionData[index]) {
                    bar.addEventListener('click', () => {
                        if (mapManager && mapManager.filterMunicipiosBySubregion) {
                            mapManager.filterMunicipiosBySubregion(subregionData[index].name.toUpperCase());
                        }
                    });
                }
            });
            const municipalityBars = document.querySelectorAll('.horizontal-bar-container');
            municipalityBars.forEach((bar, index) => {
                const municipalityData = this.getMunicipalityData();
                if (municipalityData[index]) {
                    bar.addEventListener('click', () => {
                        if (mapManager && mapManager.highlightMunicipio) {
                            mapManager.highlightMunicipio(municipalityData[index].name);
                        }
                    });
                }
            });
        }, 1000);
    }
}

window.ChartsUtils = {
    syncWithTableFilters: function(tableManager, chartsManager) {
        if (!tableManager || !chartsManager) return;
        chartsManager.updateCharts(tableManager.filteredData || tableManager.data);
    },
    showStats: function(chartsManager) {
        if (!chartsManager) return;
        const stats = chartsManager.getStats();
        console.table(stats);
        return stats;
    },
    highlightData: function(chartsManager, municipio) {
        console.log(`🎯 Resaltar en gráficas: ${municipio}`);
    }
};