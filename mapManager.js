// mapManager.js - Módulo para gestionar el mapa con GeoJSON y puntos de inicio automáticos
class MapManager {
    constructor(containerId, geojsonPath) {
        this.containerId = containerId;
        this.geojsonPath = geojsonPath;
        this.map = null;
        this.geojsonLayer = null;
        this.startPointsLayer = null; // Nueva capa para puntos de inicio
        this.polygonLayer = null;
        this.additionalLayers = {};
        this.markers = [];
        this.useFitBounds = false;
        this.init();
    }

    async init() {
        this.createMapContainer();
        await this.initializeMap();
        await this.loadGeoJSON();
    }

    createMapContainer() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = `
            <div id="map" style="width: 100%; height: 100%; border-radius: 8px;"></div>
        `;
    }

    async initializeMap() {
        // Inicializar el mapa centrado en Antioquia, Colombia
        // Coordenadas del centro geográfico de Antioquia ajustadas
        this.map = L.map('map', {
            center: [7.140596, -75.450447], // Centro personalizado
            zoom: 7.75, // Zoom personalizado
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: true,
            wheelPxPerZoomLevel: 180,
            zoomSnap: 0.25,         
            zoomDelta: 0.25,
            maxZoom: 18,
            minZoom: 6
        });

        // === PANES PARA CONTROLAR ORDEN DE CAPAS ===
        this.map.createPane('polygonsPane');
        this.map.createPane('linesPane');
        this.map.createPane('pointsPane');
        this.map.createPane('startPointsPane'); // Nuevo pane para puntos de inicio

        // Orden visual (z-index)
        this.map.getPane('polygonsPane').style.zIndex = 400;
        this.map.getPane('linesPane').style.zIndex = 500;
        this.map.getPane('pointsPane').style.zIndex = 600;
        this.map.getPane('startPointsPane').style.zIndex = 650; // Más alto que puntos normales

        // Agregar capa base de CartoDB Light
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 6
        }).addTo(this.map);

        // Agregar control de escala
        L.control.scale({
            imperial: false,
            metric: true,
            position: 'bottomleft'
        }).addTo(this.map);

        // Event listeners para debugging - imprimir coordenadas y zoom en consola
        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            console.log(`🗺️ Centro: [${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}], Zoom: ${zoom}`);
        });

        this.map.on('zoomend', () => {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            console.log(`🔍 Zoom: ${zoom}, Centro: [${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}]`);
        });

        // También imprimir al hacer click
        this.map.on('click', (e) => {
            const zoom = this.map.getZoom();
            console.log(`📍 Click en: [${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}], Zoom actual: ${zoom}`);
        });
    }

    // Método para remover todas las capas base (fondo transparente)
    removeBaseLayers() {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });
        
        const container = document.querySelector('.leaflet-container');
        if (container) {
            container.style.backgroundColor = 'transparent';
        }
    }

    async loadGeoJSON() {
        try {
            const response = await fetch(this.geojsonPath);
            const geojsonData = await response.json();

            // Crear capa GeoJSON con estilos personalizados
            this.geojsonLayer = L.geoJSON(geojsonData, {
                pane: 'linesPane',
                style: (feature) => this.getFeatureStyle(feature),
                pointToLayer: (feature, latlng) => this.createMarker(feature, latlng),
                onEachFeature: (feature, layer) => this.bindPopup(feature, layer)
            }).addTo(this.map);

            // Crear puntos de inicio automáticamente
            this.createStartPoints(geojsonData);

            // Mantener siempre la vista configurada inicialmente
            // No usar fitBounds para respetar el zoom y centro personalizados
            
        } catch (error) {
            console.error('Error cargando GeoJSON:', error);
            // En caso de error, usar vista por defecto
            document.getElementById('map').innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #1a7a5e;">
                    <p>Error cargando el mapa. Verifica que el archivo GeoJSON esté disponible.</p>
                </div>
            `;
        }
    }

    /* =====================================================
       NUEVA FUNCIONALIDAD: PUNTOS DE INICIO AUTOMÁTICOS
       ===================================================== */

    createStartPoints(geojsonData) {
        console.log('🎯 Creando puntos de inicio para cada tramo...');
        
        const startPoints = [];
        
        geojsonData.features.forEach((feature) => {
            if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                const startPoint = this.extractStartPoint(feature);
                if (startPoint) {
                    startPoints.push(startPoint);
                }
            }
        });

        // Crear capa de puntos de inicio
        this.startPointsLayer = L.layerGroup().addTo(this.map);
        
        startPoints.forEach((pointFeature) => {
            const marker = this.createStartPointMarker(pointFeature);
            this.startPointsLayer.addLayer(marker);
        });

        console.log(`✅ Creados ${startPoints.length} puntos de inicio`);
    }

    extractStartPoint(lineFeature) {
        try {
            const geometry = lineFeature.geometry;
            let startCoords;

            if (geometry.type === 'LineString') {
                startCoords = geometry.coordinates[0];
            } else if (geometry.type === 'MultiLineString') {
                // Tomar el primer punto de la primera línea
                startCoords = geometry.coordinates[0][0];
            }

            if (startCoords && startCoords.length >= 2) {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: startCoords
                    },
                    properties: {
                        ...lineFeature.properties,
                        isStartPoint: true,
                        originalFeatureType: geometry.type
                    }
                };
            }
        } catch (error) {
            console.warn('Error extrayendo punto de inicio:', error);
        }
        return null;
    }

    createStartPointMarker(pointFeature) {
        const coords = pointFeature.geometry.coordinates;
        const latlng = [coords[1], coords[0]];
        const props = pointFeature.properties;

        // Extraer código de convenio para determinar color
        const convenioCode = this.extractConvenioCode(props.source);
        
        // Marcador personalizado más visible
        const markerIcon = L.divIcon({
            className: 'start-point-marker',
            html: `
                <div style="
                    background: linear-gradient(135deg, #2fa87a 0%, #1a7a5e 100%);
                    border: 3px solid white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    <div style="
                        width: 8px;
                        height: 8px;
                        background: white;
                        border-radius: 50%;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    "></div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker(latlng, {
            icon: markerIcon,
            pane: 'startPointsPane'
        });

        // Bind popup con información completa + galería de fotos
        this.bindStartPointPopup(pointFeature, marker);

        return marker;
    }

    bindStartPointPopup(feature, marker) {
        const props = feature.properties;
        const convenioCode = this.extractConvenioCode(props.source);
        
        let popupContent = '<div style="font-family: Arial; max-width: 400px;">';
        
        // Título principal
        popupContent += `<div style="
            background: linear-gradient(135deg, #1a7a5e 0%, #2fa87a 100%);
            color: white;
            padding: 12px 15px;
            margin: -9px -13px 15px -13px;
            border-radius: 8px 8px 0 0;
            font-weight: bold;
            font-size: 16px;
        ">`;
        popupContent += `🎯 INICIO DEL TRAMO</div>`;
        
        // Información principal
        if (props.source) {
            popupContent += `<div style="margin-bottom: 10px;">
                <strong style="color: #1a7a5e;">Proyecto:</strong><br>
                <span style="font-size: 13px;">${props.source}</span>
            </div>`;
        }
        
        if (props.name) {
            popupContent += `<div style="margin-bottom: 10px;">
                <strong style="color: #1a7a5e;">Código:</strong> 
                <span style="background: #e6f4ed; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
                    ${props.name}
                </span>
            </div>`;
        }

        // Coordenadas del punto de inicio
        const coords = feature.geometry.coordinates;
        popupContent += `<div style="margin-bottom: 15px; padding: 8px; background: #f8fcfa; border-radius: 6px; border-left: 4px solid #2fa87a;">
            <strong style="color: #1a7a5e;">📍 Coordenadas de Inicio:</strong><br>
            <small>Lat: ${coords[1].toFixed(6)}</small><br>
            <small>Lon: ${coords[0].toFixed(6)}</small>
        </div>`;

        // Galería de fotos en miniatura
        if (convenioCode) {
            popupContent += this.createPhotoGalleryPreview(convenioCode);
        }

        // Botones de acción
        popupContent += `<div style="text-align: center; margin-top: 15px;">`;
        
        // Botón Ver Fotos
        if (convenioCode) {
            popupContent += `
                <button 
                    onclick="
                        console.log('🔍 Abriendo modal para:', '${convenioCode}');
                        if (window.photoModalManager) {
                            window.photoModalManager.openModal('${convenioCode}', '${props.name || 'Tramo'}');
                        } else {
                            alert('Error: Modal de fotos no disponible');
                        }
                    " 
                    style="
                        background: #2fa87a;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 4px rgba(47, 168, 122, 0.3);
                        margin-right: 8px;
                    "
                    onmouseover="this.style.background='#1a7a5e'"
                    onmouseout="this.style.background='#2fa87a'"
                >
                    <i class="fas fa-camera" style="margin-right: 5px;"></i>
                    Ver Todas las Fotos
                </button>
            `;
        }

        // Botón Ubicar Tramo
        popupContent += `
            <button 
                onclick="window.mapManager.locateLineString('${props.id || props.name}')"
                style="
                    background: #4a90e2;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
                "
                onmouseover="this.style.background='#357abd'"
                onmouseout="this.style.background='#4a90e2'"
            >
                <i class="fas fa-route" style="margin-right: 5px;"></i>
                Ver Tramo Completo
            </button>
        `;

        popupContent += '</div>';
        popupContent += '</div>';

        marker.bindPopup(popupContent, {
            maxWidth: 420,
            className: 'start-point-popup'
        });

        // Tooltip para identificación rápida
        if (props.name) {
            marker.bindTooltip(`🎯 ${props.name}`, {
                permanent: false,
                direction: 'top',
                offset: [0, -12],
                className: 'start-point-tooltip'
            });
        }
    }

    createPhotoGalleryPreview(convenioCode) {
        const phases = ['antes', 'durante', 'despues'];
        const phaseLabels = { antes: 'Antes', durante: 'Durante', despues: 'Después' };
        const phaseColors = { antes: '#e74c3c', durante: '#f39c12', despues: '#27ae60' };
        
        let galleryHtml = `
            <div style="margin: 15px 0;">
                <strong style="color: #1a7a5e; margin-bottom: 8px; display: block;">📸 Galería de Fotos:</strong>
                <div style="display: flex; gap: 8px; justify-content: space-between;">
        `;

        phases.forEach(phase => {
            const photoPath = `fotos/${convenioCode}/${phase}/${convenioCode}_${phase}_1.jpg`;
            galleryHtml += `
                <div style="flex: 1; text-align: center;">
                    <div style="
                        width: 80px;
                        height: 60px;
                        border: 2px solid ${phaseColors[phase]};
                        border-radius: 6px;
                        overflow: hidden;
                        margin: 0 auto 4px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onclick="
                        if (window.photoModalManager) {
                            window.photoModalManager.openModal('${convenioCode}', '${phaseLabels[phase]}');
                            setTimeout(() => {
                                const tabs = document.querySelectorAll('.photo-tab');
                                tabs.forEach(tab => {
                                    if (tab.dataset.phase === '${phase}') {
                                        tab.click();
                                    }
                                });
                            }, 500);
                        }
                    ">
                        <img src="${photoPath}" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                             onload="this.nextElementSibling.style.display='none';">
                        <div style="
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(45deg, ${phaseColors[phase]}22 25%, transparent 25%), 
                                        linear-gradient(-45deg, ${phaseColors[phase]}22 25%, transparent 25%), 
                                        linear-gradient(45deg, transparent 75%, ${phaseColors[phase]}22 75%), 
                                        linear-gradient(-45deg, transparent 75%, ${phaseColors[phase]}22 75%);
                            background-size: 10px 10px;
                            background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: ${phaseColors[phase]};
                            font-size: 24px;
                        ">📷</div>
                    </div>
                    <small style="color: ${phaseColors[phase]}; font-weight: bold; font-size: 11px;">
                        ${phaseLabels[phase]}
                    </small>
                </div>
            `;
        });

        galleryHtml += '</div></div>';
        return galleryHtml;
    }

    // Función para ubicar y resaltar un tramo específico
    locateLineString(featureId) {
        if (!this.geojsonLayer) return;

        this.geojsonLayer.eachLayer((layer) => {
            const props = layer.feature.properties;
            if (props.id === featureId || props.name === featureId) {
                // Resaltar el tramo
                if (layer.setStyle) {
                    layer.setStyle({
                        color: '#dc143c',
                        weight: 8,
                        opacity: 1
                    });

                    // Hacer zoom al tramo
                    if (layer.getBounds) {
                        this.map.fitBounds(layer.getBounds(), { 
                            padding: [50, 50],
                            maxZoom: 15
                        });
                    }

                    // Restaurar estilo después de 3 segundos
                    setTimeout(() => {
                        layer.setStyle({
                            color: '#2fa87a',
                            weight: 4,
                            opacity: 0.8
                        });
                    }, 3000);
                }
            }
        });
    }

    extractConvenioCode(source) {
        if (!source) return null;
        const match = source.match(/25AS\w*B\d+/);
        return match ? match[0] : null;
    }

    getFeatureStyle(feature) {
        // Estilos para LineStrings (rutas)
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            return {
                color: '#2fa87a',
                weight: 4,
                opacity: 0.8,
                dashArray: '5, 5'
            };
        }
        return {};
    }

    createMarker(feature, latlng) {
        // Crear marcadores personalizados para puntos (no puntos de inicio automáticos)
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background-color: #2fa87a;
                    border: 3px solid white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        return L.marker(latlng, {
            icon: markerIcon,
            pane: 'pointsPane'
        });
    }

    bindPopup(feature, layer) {
        if (feature.properties) {
            const props = feature.properties;
            let popupContent = '<div style="font-family: Arial; max-width: 300px;">';
            
            if (props.source) {
                popupContent += `<strong style="color: #1a7a5e; font-size: 14px;">${props.source}</strong><br>`;
            }
            
            if (props.name) {
                popupContent += `<strong>Tramo:</strong> ${props.name}<br>`;
            }

            // Agregar coordenadas
            if (feature.geometry.type === 'Point') {
                const coords = feature.geometry.coordinates;
                popupContent += `<strong>Coordenadas:</strong><br>`;
                popupContent += `Lat: ${coords[1].toFixed(6)}<br>`;
                popupContent += `Lon: ${coords[0].toFixed(6)}<br>`;
            } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                const coords = feature.geometry.coordinates;
                let firstCoords;
                if (feature.geometry.type === 'LineString') {
                    firstCoords = coords;
                } else {
                    firstCoords = coords[0];
                }
                const length = this.calculateLineLength(firstCoords);
                popupContent += `<strong>Longitud aprox:</strong> ${length.toFixed(2)} m<br>`;
                
                // Botón para ver fotos si es una línea (placa huella)
                if (props.source) {
                    // Extraer solo el código de convenio del source
                    const convenioCode = props.source.match(/25AS\w*B\d+/);
                    const finalCode = convenioCode ? convenioCode[0] : props.id || props.name;
                    
                    popupContent += `
                        <div style="margin-top: 15px; text-align: center;">
                            <button 
                                onclick="
                                    console.log('🔍 Abriendo modal para:', '${finalCode}');
                                    if (window.photoModalManager) {
                                        window.photoModalManager.openModal('${finalCode}', '${props.name || 'Tramo'}');
                                    } else {
                                        alert('Error: Modal de fotos no disponible');
                                    }
                                " 
                                style="
                                    background: #2fa87a;
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                    transition: all 0.3s ease;
                                    box-shadow: 0 2px 4px rgba(47, 168, 122, 0.3);
                                "
                                onmouseover="this.style.background='#1a7a5e'"
                                onmouseout="this.style.background='#2fa87a'"
                            >
                                <i class="fas fa-camera" style="margin-right: 5px;"></i>
                                Ver Fotos
                            </button>
                        </div>
                    `;
                }
            }

            popupContent += '</div>';
            
            layer.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            // Agregar efecto hover
            layer.on('mouseover', function(e) {
                if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                    this.setStyle({
                        color: '#1a7a5e',
                        weight: 6
                    });
                }
            });

            layer.on('mouseout', function(e) {
                if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                    this.setStyle({
                        color: '#2fa87a',
                        weight: 4
                    });
                }
            });
        }
    }

    calculateLineLength(coordinates) {
        // Calcular longitud aproximada de una línea en metros
        let length = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            const p1 = L.latLng(coordinates[i][1], coordinates[i][0]);
            const p2 = L.latLng(coordinates[i + 1][1], coordinates[i + 1][0]);
            length += p1.distanceTo(p2);
        }
        return length;
    }

    // Método para mostrar/ocultar puntos de inicio
    toggleStartPoints(show = true) {
        if (this.startPointsLayer) {
            if (show) {
                this.map.addLayer(this.startPointsLayer);
            } else {
                this.map.removeLayer(this.startPointsLayer);
            }
        }
    }

    // Resto de métodos existentes...
    addLegend() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div style="
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    border: 2px solid #2fa87a;
                ">
                    <h4 style="margin: 0 0 10px 0; color: #1a7a5e; font-size: 14px;">Leyenda</h4>
                    <div style="margin-bottom: 8px;">
                        <div style="display: inline-block; width: 20px; height: 4px; background: #2fa87a; margin-right: 8px; vertical-align: middle;"></div>
                        <span style="font-size: 12px;">Tramos viales</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <div style="display: inline-block; width: 12px; height: 12px; background: #2fa87a; border: 2px solid white; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></div>
                        <span style="font-size: 12px;">Puntos de referencia</span>
                    </div>
                    <div>
                        <div style="display: inline-block; width: 14px; height: 14px; background: linear-gradient(135deg, #2fa87a 0%, #1a7a5e 100%); border: 2px solid white; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></div>
                        <span style="font-size: 12px;">Inicio de tramos</span>
                    </div>
                </div>
            `;
            return div;
        };

        legend.addTo(this.map);
    }

    // Ajustar la vista a los límites de Antioquia
    setAntioquiaView() {
        const antioquiaBounds = [
            [4.8, -77.2],
            [8.8, -73.8]
        ];

        this.map.flyToBounds(antioquiaBounds, {
            padding: [20, 20],
            duration: 1.2,
            easeLinearity: 0.25
        });
    }

    // Métodos para polylines (mantener compatibilidad)
    addPolyline(latlngs, options = {}) {
        const defaultOptions = {
            color: '#2fa87a',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1.0
        };

        const mergedOptions = { ...defaultOptions, ...options };
        const polyline = L.polyline(latlngs, mergedOptions).addTo(this.map);

        if (options.fitBounds !== false) {
            this.map.fitBounds(polyline.getBounds());
        }

        return polyline;
    }

    addPolylineWithPopup(latlngs, popupContent, options = {}) {
        const polyline = this.addPolyline(latlngs, options);
        
        if (popupContent) {
            polyline.bindPopup(popupContent);
        }

        if (options.tooltip) {
            polyline.bindTooltip(options.tooltip, {
                permanent: false,
                direction: 'center'
            });
        }

        polyline.on('mouseover', function(e) {
            this.setStyle({
                weight: options.hoverWeight || (options.weight || 4) + 2,
                opacity: 1
            });
        });

        polyline.on('mouseout', function(e) {
            this.setStyle({
                weight: options.weight || 4,
                opacity: options.opacity || 0.8
            });
        });

        return polyline;
    }

    clearPolylines() {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                this.map.removeLayer(layer);
            }
        });
    }

    getPolylineCenter(latlngs) {
        const polyline = L.polyline(latlngs);
        return polyline.getCenter();
    }

    getPolylineLength(latlngs) {
        let totalLength = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
            const p1 = L.latLng(latlngs[i]);
            const p2 = L.latLng(latlngs[i + 1]);
            totalLength += p1.distanceTo(p2);
        }
        return totalLength;
    }

    // Método para filtrar por fuente (source)
    filterBySource(sourceName) {
        if (this.geojsonLayer) {
            this.map.removeLayer(this.geojsonLayer);
        }

        if (!sourceName || sourceName === '') {
            this.loadGeoJSON();
        } else {
            fetch(this.geojsonPath)
                .then(response => response.json())
                .then(data => {
                    const filtered = {
                        type: 'FeatureCollection',
                        features: data.features.filter(f => 
                            f.properties.source && f.properties.source.includes(sourceName)
                        )
                    };

                    this.geojsonLayer = L.geoJSON(filtered, {
                        style: (feature) => this.getFeatureStyle(feature),
                        pointToLayer: (feature, latlng) => this.createMarker(feature, latlng),
                        onEachFeature: (feature, layer) => this.bindPopup(feature, layer)
                    }).addTo(this.map);

                    // Recrear puntos de inicio filtrados
                    if (this.startPointsLayer) {
                        this.map.removeLayer(this.startPointsLayer);
                    }
                    this.createStartPoints(filtered);

                    if (this.geojsonLayer.getBounds().isValid()) {
                        this.map.fitBounds(this.geojsonLayer.getBounds(), {
                            padding: [50, 50]
                        });
                    }
                });
        }
    }

    // Resto de métodos para polígonos (municipios) - mantener código existente
    async loadPolygonGeoJSON(geojsonPath, layerName = 'municipios', options = {}) {
        try {
            const response = await fetch(geojsonPath);
            const geojsonData = await response.json();

            const defaultOptions = {
                pane: 'polygonsPane',
                style: (feature) => this.getPolygonStyle(feature, options),
                onEachFeature: (feature, layer) => this.bindPolygonPopup(feature, layer, options)
            };

            const polygonLayer = L.geoJSON(geojsonData, defaultOptions).addTo(this.map);

            this.additionalLayers[layerName] = polygonLayer;

            if (options.fitBounds === true && polygonLayer.getBounds().isValid()) {
                this.map.fitBounds(polygonLayer.getBounds(), { padding: [20, 20] });
            }

            console.log(`Capa de polígonos '${layerName}' cargada exitosamente`);
            return polygonLayer;

        } catch (error) {
            console.error(`Error cargando polígonos de ${geojsonPath}:`, error);
            return null;
        }
    }

    getPolygonStyle(feature, customOptions = {}) {
        const defaultStyle = {
            fillColor: '#2fa87a',
            fillOpacity: 0.15,
            color: '#1a7a5e',
            weight: 2,
            opacity: 0.6
        };

        if (customOptions.styleBySubregion && feature.properties.SUBREGION) {
            const subregionColors = {
                'ORIENTE': '#2fa87a',
                'OCCIDENTE': '#4a90e2',
                'NORTE': '#f39c12',
                'SUROESTE': '#e74c3c',
                'NORDESTE': '#9b59b6',
                'URABA': '#e67e22',
                'BAJO CAUCA': '#1abc9c',
                'MAGDALENA MEDIO': '#34495e',
                'VALLE DE ABURRA': '#27ae60'
            };
            
            const color = subregionColors[feature.properties.SUBREGION] || '#2fa87a';
            return {
                ...defaultStyle,
                fillColor: color,
                color: color,
                ...customOptions.style
            };
        }

        return { ...defaultStyle, ...customOptions.style };
    }

    bindPolygonPopup(feature, layer, options = {}) {
        if (feature.properties) {
            const props = feature.properties;
            let popupContent = '<div style="font-family: Arial; max-width: 300px;">';
            
            Object.keys(props).forEach(key => {
                if (props[key] !== null && props[key] !== undefined && props[key] !== '') {
                    const label = key.replace(/_/g, ' ').toUpperCase();
                    const value = props[key];
                    
                    if (key === 'mpio_nombr' || key === 'MPIO_NOMBRE' || key === 'MUNICIPIO' || key === 'nombre') {
                        popupContent += `<strong style="color: #1a7a5e; font-size: 16px;">${value}</strong><br>`;
                    } else {
                        popupContent += `<strong>${label}:</strong> ${value}<br>`;
                    }
                }
            });

            popupContent += '</div>';
            
            layer.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            const municipioNombre =
                props.mpio_nombr ||
                props.MPIO_NOMBR ||
                props.MPIO_NOMBRE ||
                props.municipio ||
                props.nombre ||
                'Sin nombre';

            layer.bindTooltip(municipioNombre, {
                permanent: false,
                direction: 'center',
                className: 'municipio-tooltip',
                opacity: 0.9
            });

            layer.on('mouseover', function(e) {
                this.setStyle({
                    fillOpacity: 0.4,
                    weight: 3
                });
            });

            layer.on('mouseout', function(e) {
                const originalStyle = options.style || {};
                this.setStyle({
                    fillOpacity: originalStyle.fillOpacity || 0.15,
                    weight: originalStyle.weight || 2
                });
            });

            if (options.onClick) {
                layer.on('click', (e) => options.onClick(feature, layer, e));
            }
        }
    }

    togglePolygonLayer(layerName = 'municipios', show = true) {
        const layer = this.additionalLayers[layerName];
        if (layer) {
            if (show) {
                this.map.addLayer(layer);
            } else {
                this.map.removeLayer(layer);
            }
        }
    }

    filterMunicipiosBySubregion(subregion) {
        const layer = this.additionalLayers['municipios'];
        if (!layer) return;

        layer.eachLayer((municipioLayer) => {
            const props = municipioLayer.feature.properties;
            if (subregion === '' || props.SUBREGION === subregion) {
                municipioLayer.setStyle({ opacity: 0.6, fillOpacity: 0.15 });
            } else {
                municipioLayer.setStyle({ opacity: 0.1, fillOpacity: 0.05 });
            }
        });
    }

    highlightMunicipio(municipioNombre) {
        const layer = this.additionalLayers['municipios'];
        if (!layer) return;

        layer.eachLayer((municipioLayer) => {
            const props = municipioLayer.feature.properties;
            const nombre = props.mpio_nombr || props.MPIO_NOMBRE || props.MUNICIPIO || props.nombre;
            
            if (nombre && nombre.toUpperCase() === municipioNombre.toUpperCase()) {
                municipioLayer.setStyle({
                    fillColor: '#dc143c',
                    fillOpacity: 0.5,
                    weight: 4,
                    color: '#dc143c'
                });
                
                // El zoom lo maneja zoomToMunicipios — no hacer fitBounds aquí
            } else {
                municipioLayer.setStyle({
                    fillOpacity: 0.1,
                    opacity: 0.3
                });
            }
        });
    }

    // Normaliza texto: mayúsculas sin tildes para comparar con el GeoJSON
    _normalizeText(str) {
        return (str || '').toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    // Zoom al bounds de las subregiones filtradas buscando directamente
    // en la capa GeoJSON por la propiedad SUBREGION (más confiable que MPIO_NOMBRE)
    zoomToMunicipios(municipiosNombres, subregionesNombres) {
        const layer = this.additionalLayers['municipios'];
        if (!layer) return;

        const sinFiltro = (!subregionesNombres || subregionesNombres.length === 0) &&
                          (!municipiosNombres   || municipiosNombres.length === 0);

        if (sinFiltro) {
            this.setAntioquiaView();
            return;
        }

        // Normalizar los nombres para comparación robusta
        const subregSet = new Set(
            (subregionesNombres || []).map(s => this._normalizeText(s))
        );
        const mpioSet = new Set(
            (municipiosNombres || []).map(m => this._normalizeText(m))
        );

        let combinedBounds = null;

        layer.eachLayer((municipioLayer) => {
            const props    = municipioLayer.feature.properties;
            const subreg   = this._normalizeText(props.subregion || props.SUBREGION);
            const mpio     = this._normalizeText(props.mpio_nombr || props.MPIO_NOMBRE || props.MUNICIPIO || props.nombre);

            const match = (subregSet.size > 0 && subregSet.has(subreg)) ||
                          (mpioSet.size > 0   && mpioSet.has(mpio));

            if (match) {
                const bounds = municipioLayer.getBounds();
                if (bounds.isValid()) {
                    combinedBounds = combinedBounds
                        ? combinedBounds.extend(bounds)
                        : L.latLngBounds(bounds);
                }
            }
        });

        if (combinedBounds && combinedBounds.isValid()) {
            this.map.flyToBounds(combinedBounds, {
                padding: [40, 40],
                maxZoom: 11,
                duration: 1.2,
                easeLinearity: 0.25
            });
        } else {
            this.setAntioquiaView();
        }
    }

    resetMunicipiosStyle() {
        const layer = this.additionalLayers['municipios'];
        if (!layer) return;

        layer.eachLayer((municipioLayer) => {
            municipioLayer.setStyle({
                fillColor: '#2fa87a',
                fillOpacity: 0.15,
                color: '#1a7a5e',
                weight: 2,
                opacity: 0.6
            });
        });
    }

    getMunicipiosList() {
        const layer = this.additionalLayers['municipios'];
        if (!layer) return [];

        const municipios = [];
        layer.eachLayer((municipioLayer) => {
            const props = municipioLayer.feature.properties;
            municipios.push({
                nombre: props.mpio_nombr || props.MPIO_NOMBRE || props.MUNICIPIO || props.nombre,
                subregion: props.SUBREGION,
                codigo: props.COD_MPIO
            });
        });

        return municipios.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
}

// Estilos CSS adicionales para los nuevos elementos
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 8px;
        border: 2px solid #2fa87a;
    }
    
    .custom-popup .leaflet-popup-tip {
        background-color: white;
    }
    
    .start-point-popup .leaflet-popup-content-wrapper {
        border-radius: 12px;
        border: 3px solid #2fa87a;
        background: white;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    .start-point-popup .leaflet-popup-tip {
        background-color: white;
        border: 1px solid #2fa87a;
    }
    
    .leaflet-container {
        font-family: Arial, sans-serif;
    }

    .municipio-tooltip {
        background-color: #1a7a5e !important;
        border: 2px solid white !important;
        border-radius: 6px !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 14px !important;
        padding: 8px 12px !important;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3) !important;
    }

    .municipio-tooltip::before {
        border-top-color: #1a7a5e !important;
    }
    
    .start-point-tooltip {
        background-color: #2fa87a !important;
        border: 2px solid white !important;
        border-radius: 8px !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 12px !important;
        padding: 6px 10px !important;
        box-shadow: 0 3px 8px rgba(47,168,122,0.4) !important;
    }

    .start-point-tooltip::before {
        border-top-color: #2fa87a !important;
    }
    
    .start-point-marker {
        transition: all 0.3s ease;
    }
    
    .start-point-marker:hover {
        transform: scale(1.2);
        z-index: 1000;
    }
`;
document.head.appendChild(additionalStyles);