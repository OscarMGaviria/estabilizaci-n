/* =========================================================
   ExpandIconsManager
   Manejo robusto de ampliación de mapas y gráficas
   ========================================================= */

class ExpandIconsManager {

    constructor() {
        this.initialized = false;
        this.mapState = null;
        this.chartState = null;

        this.init();
    }

    /* -----------------------------------------------------
       Inicialización segura
       ----------------------------------------------------- */
    init() {
        // Esperar a que el DOM tenga contenido real
        this.waitForTargets();
        this.observeDomChanges();
    }

    /* -----------------------------------------------------
       Espera activa hasta que existan gráficos y mapa
       ----------------------------------------------------- */
    waitForTargets(retries = 0) {
        const graphics = document.querySelectorAll('.graphic');
        const map = document.getElementById('mapContainer');

        if (graphics.length || map) {
            this.addExpandButtons();
            this.initialized = true;
            if (window.feather) feather.replace();
            return;
        }

        if (retries < 20) {
            setTimeout(() => this.waitForTargets(retries + 1), 300);
        }
    }

    /* -----------------------------------------------------
       Observa cambios en el DOM (re-render dinámico)
       ----------------------------------------------------- */
    observeDomChanges() {
        const observer = new MutationObserver(() => {
            this.addExpandButtons();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /* -----------------------------------------------------
       Agregar botones de expandir
       ----------------------------------------------------- */
    addExpandButtons() {
        // Gráficas
        document.querySelectorAll('.graphic').forEach((container, index) => {
            this.attachButton(container, 'chart', index);
        });

        // Mapa
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            this.attachButton(mapContainer, 'map');
        }

        if (window.feather) feather.replace();
    }

    attachButton(container, type, index = null) {
        if (!container || container.querySelector('.expand-btn')) return;

        container.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'expand-btn';
        btn.innerHTML = `<i data-feather="maximize-2"></i>`;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (type === 'map') this.openMapModal();
            if (type === 'chart') this.openChartModal(index);
        });

        container.appendChild(btn);
    }

    /* -----------------------------------------------------
       Modal base reutilizable
       ----------------------------------------------------- */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'expand-modal';

        modal.innerHTML = `
            <div class="expand-modal-content">
                <button class="expand-close">
                    <i class="fas fa-times"></i>
                    <span class="desktop-only">Cerrar</span>
                </button>
                <div class="expand-body" style="width:100%;height:100%"></div>
            </div>
        `;

        modal.querySelector('.expand-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.body.appendChild(modal);

        return modal.querySelector('.expand-body');
    }

    /* -----------------------------------------------------
       MAPA – recreación manteniendo estado
       ----------------------------------------------------- */
    openMapModal() {
        if (!window.mapManager || !mapManager.map) return;

        // Guardar estado
        this.mapState = {
            center: mapManager.map.getCenter(),
            zoom: mapManager.map.getZoom()
        };

        const body = this.createModal();
        const mapId = `modal-map-${Date.now()}`;

        body.innerHTML = `<div id="${mapId}" style="width:100%;height:100%"></div>`;

        // Crear nuevo mapa independiente
        const modalMapManager = new MapManager(mapId, mapManager.geojsonPath);

        setTimeout(() => {
            modalMapManager.map.setView(
                this.mapState.center,
                this.mapState.zoom
            );
            modalMapManager.map.invalidateSize();
        }, 500);
    }

    /* -----------------------------------------------------
       GRÁFICAS – recreación con mismo estilo
       ----------------------------------------------------- */
    openChartModal(chartIndex) {
        if (!window.chartsManager) return;

        this.chartState = {
            data: chartsManager.data
        };

        const body = this.createModal();
        const chartId = `modal-chart-${Date.now()}`;

        body.innerHTML = `
            <div id="${chartId}" class="graphic"
                 style="width:100%;height:100%"></div>
        `;

        const modalCharts = new ChartsManager(this.chartState.data);

        setTimeout(() => {
            if (chartIndex === 0) {
                modalCharts.renderSubregionChart(`#${chartId}`);
            } else if (chartIndex === 1) {
                modalCharts.renderMunicipalityChart(`#${chartId}`);
            }
        }, 100);
    }
}