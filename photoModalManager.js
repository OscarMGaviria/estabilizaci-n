/* =========================================================
   PhotoModalManager
   Gestor de modal para visualizar fotos de convenios
   ========================================================= */

class PhotoModalManager {
    constructor() {
        this.currentModal = null;
        this.currentFullscreen = null;
        this.init();
    }

    init() {
        console.log('📷 PhotoModalManager inicializado');
    }

    /* -----------------------------------------------------
       Abrir modal principal con fotos
       ----------------------------------------------------- */
    openModal(convenioCode, title = 'Fotos del Convenio') {
        // Limpiar el código de convenio
        const cleanCode = this.cleanConvenioCode(convenioCode);
        
        console.log(`📱 Abriendo modal para: ${cleanCode}`);
        
        // Cerrar modal existente si hay uno
        if (this.currentModal) {
            this.closeModal();
        }

        // Crear modal
        this.createModal(cleanCode, `${title} - ${cleanCode}`);
        
        // Mostrar modal
        setTimeout(() => {
            if (this.currentModal) {
                this.currentModal.classList.add('show');
            }
        }, 100);

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    /* -----------------------------------------------------
       Crear estructura del modal
       ----------------------------------------------------- */
    createModal(convenioCode, title) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="photo-modal-content">
                <div class="photo-modal-header">
                    <h2>📸 ${title}</h2>
                    <button class="close-btn" onclick="window.photoModalManager.closeModal()">
                        ✕
                    </button>
                </div>
                <div class="photo-modal-body">
                    <div class="photo-tabs">
                        <button class="photo-tab active" data-phase="antes">
                            📋 Antes
                        </button>
                        <button class="photo-tab" data-phase="durante">
                            🚧 Durante
                        </button>
                        <button class="photo-tab" data-phase="despues">
                            ✅ Después
                        </button>
                    </div>
                    <div class="photo-content">
                        <div class="loading">
                            Cargando fotos... 
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Setup tab functionality
        this.setupTabs(convenioCode);
        
        // Setup close events
        this.setupCloseEvents();
        
        // Load initial photos (antes)
        this.loadPhotos(convenioCode, 'antes');
    }

    /* -----------------------------------------------------
       Configurar tabs
       ----------------------------------------------------- */
    setupTabs(convenioCode) {
        const tabs = this.currentModal.querySelectorAll('.photo-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Load photos for selected phase
                const phase = tab.dataset.phase;
                this.loadPhotos(convenioCode, phase);
            });
        });
    }

    /* -----------------------------------------------------
       Configurar eventos de cierre
       ----------------------------------------------------- */
    setupCloseEvents() {
        // Close on background click
        this.currentModal.addEventListener('click', (e) => {
            if (e.target === this.currentModal) {
                this.closeModal();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /* -----------------------------------------------------
       Cargar fotos por fase
       ----------------------------------------------------- */
    loadPhotos(convenioCode, phase) {
        const content = this.currentModal.querySelector('.photo-content');
        content.innerHTML = '<div class="loading">Cargando fotos...</div>';

        // Simular carga de fotos
        setTimeout(() => {
            const photos = this.generatePhotoStructure(convenioCode, phase);
            this.renderPhotos(photos, phase);
        }, 500);
    }

    /* -----------------------------------------------------
       Generar estructura de fotos
       ----------------------------------------------------- */
    generatePhotoStructure(convenioCode, phase) {
        // Limpiar el código de convenio si viene con texto extra
        const cleanCode = this.cleanConvenioCode(convenioCode);
        
        console.log(`📸 Generando fotos para: ${cleanCode}, fase: ${phase}`);
        
        // En un ambiente real, esto haría una petición a la API
        // Por ahora simulamos la estructura de fotos
        
        const photoTypes = {
            'antes': [
                { name: 'Estado inicial 1', file: `${cleanCode}_antes_1.jpg`, desc: 'Vista general del terreno' },
                { name: 'Estado inicial 2', file: `${cleanCode}_antes_2.jpg`, desc: 'Detalle de la superficie' },
                { name: 'Mediciones', file: `${cleanCode}_antes_3.jpg`, desc: 'Levantamiento topográfico' }
            ],
            'durante': [
                { name: 'Inicio de obra', file: `${cleanCode}_durante_1.jpg`, desc: 'Preparación del terreno' },
                { name: 'Proceso constructivo', file: `${cleanCode}_durante_2.jpg`, desc: 'Colocación de material' },
                { name: 'Supervisión', file: `${cleanCode}_durante_3.jpg`, desc: 'Control de calidad' },
                { name: 'Avance 50%', file: `${cleanCode}_durante_4.jpg`, desc: 'Avance medio de obra' }
            ],
            'despues': [
                { name: 'Obra finalizada 1', file: `${cleanCode}_despues_1.jpg`, desc: 'Vista completa terminada' },
                { name: 'Obra finalizada 2', file: `${cleanCode}_despues_2.jpg`, desc: 'Detalle de acabados' },
                { name: 'Entrega', file: `${cleanCode}_despues_3.jpg`, desc: 'Acta de entrega' }
            ]
        };

        return photoTypes[phase] || [];
    }

    /* -----------------------------------------------------
       Limpiar código de convenio
       ----------------------------------------------------- */
    cleanConvenioCode(input) {
        if (!input) return 'UNKNOWN';
        
        // Si ya es un código limpio, devolverlo tal como está
        if (/^25AS\w*B\d+$/.test(input)) {
            return input;
        }
        
        // Extraer código de convenio del texto completo
        const match = input.match(/25AS\w*B\d+/);
        if (match) {
            console.log(`✅ Código extraído: ${match[0]} de "${input}"`);
            return match[0];
        }
        
        // Si no se encuentra patrón, usar el input tal como está
        console.warn(`⚠️ No se pudo extraer código de convenio de: "${input}"`);
        return input.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    }

    /* -----------------------------------------------------
       Renderizar fotos
       ----------------------------------------------------- */
    renderPhotos(photos, phase) {
        const content = this.currentModal.querySelector('.photo-content');
        
        if (photos.length === 0) {
            content.innerHTML = `
                <div class="no-photos">
                    <i class="fas fa-camera-retro"></i>
                    <h3>No hay fotos disponibles</h3>
                    <p>No se encontraron fotos para la fase "${phase}"</p>
                    <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; font-size: 14px; color: #1a7a5e;">
                        <strong>📁 Estructura esperada:</strong><br>
                        fotos/[CodigoConvenio]/${phase}/[CodigoConvenio]_${phase}_1.jpg
                    </div>
                </div>
            `;
            return;
        }

        const photosHTML = photos.map((photo, index) => {
            // Construir la ruta de la foto usando la nueva estructura
            const convenioCode = photo.file.split('_')[0];
            const photoPath = `fotos/${convenioCode}/${phase}/${photo.file}`;
            
            return `
                <div class="photo-item">
                    <img 
                        src="${photoPath}" 
                        alt="${photo.name}"
                        onerror="this.parentElement.innerHTML='<div style=\\'padding:40px;text-align:center;color:#7fa898;border: 2px dashed #b8d4c8;border-radius:8px;\\'>📷<br><strong>Imagen no encontrada</strong><br><small style=\\'color:#999;\\'>Archivo esperado:<br>${photo.file}</small><br><small style=\\'color:#2fa87a;margin-top:10px;display:block;\\'>Coloque la imagen en:<br>fotos/${convenioCode}/${phase}/</small><br><button onclick=\\'window.open(\"fotos/${convenioCode}/${phase}/\", \"_blank\")\\'  style=\\'background:#2fa87a;color:white;border:none;padding:5px 10px;border-radius:4px;margin-top:8px;cursor:pointer;\\'>📁 Abrir Carpeta</button></div>'"
                        onclick="window.photoModalManager.openFullscreen('${photoPath}', '${photo.name}')"
                        loading="lazy"
                    />
                    <div class="photo-item-info">
                        <h4>${photo.name}</h4>
                        <p>${photo.desc}</p>
                        <small style="color: #999; font-size: 12px;">📁 ${photo.file}</small>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <div class="photo-grid">
                ${photosHTML}
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8fcfa; border-radius: 8px; border: 1px solid #b8d4c8;">
                <small style="color: #1a7a5e;">
                    <strong>💡 Instrucciones:</strong> Las fotos deben estar en la carpeta 
                    <code>fotos/[CodigoConvenio]/${phase}/</code> con nombres como 
                    <code>[CodigoConvenio]_${phase}_1.jpg</code>
                </small>
            </div>
        `;
    }

    /* -----------------------------------------------------
       Abrir imagen en pantalla completa
       ----------------------------------------------------- */
    openFullscreen(imageSrc, title) {
        // Cerrar fullscreen existente
        if (this.currentFullscreen) {
            this.closeFullscreen();
        }

        const fullscreen = document.createElement('div');
        fullscreen.className = 'photo-fullscreen';
        fullscreen.innerHTML = `
            <button class="photo-fullscreen-close" onclick="window.photoModalManager.closeFullscreen()">
                ✕
            </button>
            <img src="${imageSrc}" alt="${title}" />
        `;

        document.body.appendChild(fullscreen);
        this.currentFullscreen = fullscreen;

        // Show with animation
        setTimeout(() => {
            fullscreen.classList.add('show');
        }, 100);

        // Close on background click
        fullscreen.addEventListener('click', (e) => {
            if (e.target === fullscreen) {
                this.closeFullscreen();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeFullscreen();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /* -----------------------------------------------------
       Cerrar imagen en pantalla completa
       ----------------------------------------------------- */
    closeFullscreen() {
        if (this.currentFullscreen) {
            this.currentFullscreen.classList.remove('show');
            setTimeout(() => {
                if (this.currentFullscreen && this.currentFullscreen.parentNode) {
                    this.currentFullscreen.parentNode.removeChild(this.currentFullscreen);
                }
                this.currentFullscreen = null;
            }, 300);
        }
    }

    /* -----------------------------------------------------
       Cerrar modal principal
       ----------------------------------------------------- */
    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('show');
            
            setTimeout(() => {
                if (this.currentModal && this.currentModal.parentNode) {
                    this.currentModal.parentNode.removeChild(this.currentModal);
                }
                this.currentModal = null;
                
                // Restaurar scroll del body
                document.body.style.overflow = '';
            }, 300);
        }

        // Also close any open fullscreen
        this.closeFullscreen();
    }

    /* -----------------------------------------------------
       Método para probar el modal
       ----------------------------------------------------- */
    test(convenioCode = '25AS111B2781') {
        this.openModal(convenioCode, 'Fotos de Prueba');
    }
}

// Hacer disponible globalmente
window.photoModalManager = new PhotoModalManager();