// detailModal.js - Modal ultra-moderno con gráficos y visualizaciones
class DetailModal {
    constructor() {
        this.currentData = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.loadFontAwesome();
        this.createStyles();
        this.setupEvents();
        console.log('DetailModal Ultra-Moderno inicializado ✅');
    }

    loadFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    createStyles() {
        if (document.getElementById('jac-modal-ultra-styles')) return;

        const style = document.createElement('style');
        style.id = 'jac-modal-ultra-styles';
        style.textContent = `
            .jac-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(20px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .jac-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .jac-modal {
                background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 32px;
                width: 95%;
                max-width: 1400px;
                max-height: 95vh;
                overflow: hidden;
                box-shadow: 
                    0 50px 100px rgba(15, 23, 42, 0.3),
                    0 20px 40px rgba(15, 23, 42, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9);
                transform: scale(0.8) translateY(60px) rotateX(10deg);
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                display: flex;
                flex-direction: column;
            }

            .jac-overlay.show .jac-modal {
                transform: scale(1) translateY(0) rotateX(0deg);
            }

            /* HEADER HERO SECTION */
            .jac-hero {
                background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
                color: white;
                padding: 40px 50px;
                position: relative;
                overflow: hidden;
                min-height: 180px;
                display: flex;
                align-items: center;
            }

            .jac-hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                    linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
            }

            .jac-hero-content {
                position: relative;
                z-index: 2;
                flex: 1;
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 40px;
                align-items: center;
            }

            .jac-hero-info {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .jac-title {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                line-height: 1.2;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .jac-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-top: 5px;
            }

            .jac-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50px;
                backdrop-filter: blur(10px);
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .jac-badge:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }

            .jac-badge i {
                opacity: 0.8;
                font-size: 16px;
            }

            .jac-stats-mini {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }

            .jac-stat-mini {
                text-align: center;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
            }

            .jac-stat-mini:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-5px);
            }

            .jac-stat-value {
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 5px;
                background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .jac-stat-label {
                font-size: 12px;
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }

            .jac-close {
                position: absolute;
                top: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                color: white;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3;
            }

            .jac-close:hover {
                background: rgba(239, 68, 68, 0.8);
                transform: scale(1.1) rotate(90deg);
                box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
            }

            /* MAIN CONTENT AREA */
            .jac-content {
                flex: 1;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #94a3b8 transparent;
            }

            .jac-content::-webkit-scrollbar {
                width: 6px;
            }

            .jac-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .jac-content::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #3b82f6, #1e293b);
                border-radius: 3px;
            }

            .jac-dashboard {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 30px;
                padding: 40px 50px;
                min-height: 600px;
            }

            .jac-main-panel {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }

            .jac-side-panel {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            /* CHART SECTION */
            .jac-chart-section {
                background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%);
                border-radius: 24px;
                padding: 30px;
                box-shadow: 
                    0 20px 40px rgba(15, 23, 42, 0.08),
                    0 10px 20px rgba(15, 23, 42, 0.04),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(226, 232, 240, 0.8);
                position: relative;
                overflow: hidden;
            }

            .jac-chart-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
                border-radius: 24px 24px 0 0;
            }

            .jac-chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }

            .jac-chart-title {
                font-size: 20px;
                font-weight: 700;
                color: #1e293b;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .jac-chart-title i {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
            }

            .jac-chart-container {
                height: 300px;
                position: relative;
                background: white;
                border-radius: 16px;
                padding: 20px;
                box-shadow: inset 0 2px 10px rgba(15, 23, 42, 0.05);
            }

            /* CARDS GRID */
            .jac-cards-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }

            .jac-info-card {
                background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 20px;
                padding: 25px;
                border: 1px solid #e2e8f0;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }

            .jac-info-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--card-accent, linear-gradient(90deg, #3b82f6, #10b981));
                border-radius: 20px 20px 0 0;
            }

            .jac-info-card:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 
                    0 25px 50px rgba(15, 23, 42, 0.15),
                    0 10px 20px rgba(15, 23, 42, 0.1);
                border-color: rgba(59, 130, 246, 0.3);
            }

            .jac-card-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .jac-card-icon {
                width: 50px;
                height: 50px;
                background: var(--icon-bg, linear-gradient(135deg, #3b82f6 0%, #1e40af 100%));
                color: white;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: var(--icon-shadow, 0 8px 16px rgba(59, 130, 246, 0.3));
                transition: all 0.3s ease;
            }

            .jac-info-card:hover .jac-card-icon {
                transform: scale(1.1) rotate(5deg);
                box-shadow: var(--icon-shadow-hover, 0 12px 24px rgba(59, 130, 246, 0.4));
            }

            .jac-card-title {
                font-size: 16px;
                font-weight: 700;
                color: #1e293b;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .jac-card-content {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .jac-field {
                display: flex;
                flex-direction: column;
                gap: 5px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(226, 232, 240, 0.5);
                transition: all 0.2s ease;
            }

            .jac-field:last-child {
                border-bottom: none;
            }

            .jac-field:hover {
                background: rgba(59, 130, 246, 0.02);
                border-radius: 8px;
                padding: 12px 15px;
                margin: 0 -15px;
            }

            .jac-label {
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .jac-value {
                font-size: 15px;
                color: #1e293b;
                font-weight: 600;
                line-height: 1.4;
            }

            .jac-value.money {
                font-size: 18px;
                font-weight: 800;
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            }

            .jac-value.highlight {
                font-size: 20px;
                font-weight: 800;
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            /* DESCRIPTION CARD */
            .jac-description-card {
                grid-column: 1 / -1;
                background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
                border-radius: 20px;
                padding: 30px;
                border: 1px solid #e2e8f0;
                position: relative;
                margin-top: 10px;
            }

            .jac-description-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #f59e0b, #ea580c);
                border-radius: 20px 20px 0 0;
            }

            .jac-desc-content {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 20px;
                align-items: start;
            }

            .jac-desc-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                color: white;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
                flex-shrink: 0;
            }

            .jac-desc-text {
                font-size: 16px;
                line-height: 1.7;
                color: #374151;
                background: white;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #f59e0b;
                box-shadow: inset 0 2px 10px rgba(245, 158, 11, 0.05);
            }

            /* CONTACT SECTION */
            .jac-contact-card {
                background: linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%);
            }

            .jac-contact-item {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
                padding: 15px 20px;
                border-radius: 12px;
                margin-bottom: 12px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                border: 1px solid rgba(59, 130, 246, 0.1);
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .jac-contact-item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                background: linear-gradient(to bottom, #3b82f6, #10b981);
                border-radius: 12px 0 0 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .jac-contact-item:hover {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
                transform: translateX(8px) scale(1.02);
                box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
                border-color: rgba(59, 130, 246, 0.3);
            }

            .jac-contact-item:hover::before {
                opacity: 1;
            }

            .jac-contact-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
                flex-shrink: 0;
            }

            .jac-contact-info {
                flex: 1;
            }

            .jac-contact-label {
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 700;
                margin-bottom: 2px;
            }

            .jac-contact-value {
                font-size: 14px;
                color: #1e293b;
                font-weight: 600;
            }

            .jac-copy-icon {
                background: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
                width: 35px;
                height: 35px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .jac-copy-icon:hover {
                background: #3b82f6;
                color: white;
                transform: scale(1.1);
            }

            .jac-feedback {
                position: absolute;
                right: -10px;
                top: 50%;
                transform: translateY(-50%) scale(0);
                background: #10b981;
                color: white;
                padding: 8px 15px;
                border-radius: 25px;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
                z-index: 10;
            }

            .jac-feedback::before {
                content: '';
                position: absolute;
                left: -6px;
                top: 50%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
                border-right: 6px solid #10b981;
            }

            .jac-feedback.show {
                transform: translateY(-50%) scale(1) translateX(-10px);
            }

            /* PROGRESS BARS */
            .jac-progress-section {
                margin-top: 20px;
            }

            .jac-progress-item {
                margin-bottom: 20px;
            }

            .jac-progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .jac-progress-label {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .jac-progress-value {
                font-size: 14px;
                font-weight: 700;
                color: #059669;
            }

            .jac-progress-bar {
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }

            .jac-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #3b82f6);
                border-radius: 4px;
                transition: width 1s ease-in-out;
                position: relative;
            }

            .jac-progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            /* RESPONSIVE DESIGN */
            @media (max-width: 1200px) {
                .jac-dashboard {
                    grid-template-columns: 1fr;
                    gap: 25px;
                }
                
                .jac-hero-content {
                    grid-template-columns: 1fr;
                    gap: 25px;
                    text-align: center;
                }
                
                .jac-cards-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .jac-modal {
                    width: 98%;
                    margin: 10px;
                    border-radius: 20px;
                }
                
                .jac-hero {
                    padding: 25px 30px;
                    min-height: 140px;
                }
                
                .jac-title {
                    font-size: 22px;
                }
                
                .jac-dashboard {
                    padding: 25px 30px;
                }
                
                .jac-stats-mini {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .jac-close {
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                }
            }

            /* LOADING ANIMATIONS */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .jac-info-card {
                animation: fadeInUp 0.6s ease-out forwards;
                opacity: 0;
            }

            .jac-info-card:nth-child(1) { animation-delay: 0.1s; }
            .jac-info-card:nth-child(2) { animation-delay: 0.2s; }
            .jac-info-card:nth-child(3) { animation-delay: 0.3s; }
            .jac-info-card:nth-child(4) { animation-delay: 0.4s; }
            .jac-info-card:nth-child(5) { animation-delay: 0.5s; }

            /* CARD ACCENT COLORS */
            .jac-info-card.financial {
                --card-accent: linear-gradient(90deg, #10b981, #059669);
                --icon-bg: linear-gradient(135deg, #10b981 0%, #059669 100%);
                --icon-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
                --icon-shadow-hover: 0 12px 24px rgba(16, 185, 129, 0.4);
            }

            .jac-info-card.technical {
                --card-accent: linear-gradient(90deg, #3b82f6, #1e40af);
                --icon-bg: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                --icon-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
                --icon-shadow-hover: 0 12px 24px rgba(59, 130, 246, 0.4);
            }

            .jac-info-card.team {
                --card-accent: linear-gradient(90deg, #8b5cf6, #7c3aed);
                --icon-bg: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                --icon-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
                --icon-shadow-hover: 0 12px 24px rgba(139, 92, 246, 0.4);
            }

            .jac-info-card.contact {
                --card-accent: linear-gradient(90deg, #06b6d4, #0891b2);
                --icon-bg: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                --icon-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
                --icon-shadow-hover: 0 12px 24px rgba(6, 182, 212, 0.4);
            }
        `;
        document.head.appendChild(style);
    }

    setupEvents() {
        document.addEventListener('dblclick', (e) => {
            const row = e.target.closest('.data-table tbody tr');
            if (!row || row.querySelector('.no-data')) return;

            const index = Array.from(row.parentElement.children).indexOf(row);
            this.showModal(index);
        });
    }

    showModal(rowIndex) {
        const data = this.getData(rowIndex);
        if (!data) {
            console.warn('No hay datos para la fila:', rowIndex);
            return;
        }

        this.currentData = data;
        this.createModal(data);
        console.log('Modal Ultra-Moderno abierto para:', data.NOMBRE_VIA || data.CIRCUITO);
    }

    getData(index) {
        console.log('🔍 Buscando datos para índice:', index);
        
        let source = null;

        // Intentar diferentes fuentes
        if (window.tableManager) {
            if (window.tableManager.filteredData && Array.isArray(window.tableManager.filteredData)) {
                source = window.tableManager.filteredData;
                console.log('✅ Usando tableManager.filteredData:', source.length, 'registros');
            } else if (window.tableManager._filteredData && Array.isArray(window.tableManager._filteredData)) {
                source = window.tableManager._filteredData;
                console.log('✅ Usando tableManager._filteredData:', source.length, 'registros');
            } else if (window.tableManager.data && Array.isArray(window.tableManager.data)) {
                source = window.tableManager.data;
                console.log('✅ Usando tableManager.data:', source.length, 'registros');
            }
        }

        if (!source && window.filtersManager) {
            if (window.filtersManager.filteredData && Array.isArray(window.filtersManager.filteredData)) {
                source = window.filtersManager.filteredData;
                console.log('✅ Usando filtersManager.filteredData:', source.length, 'registros');
            }
        }

        // Buscar variables globales
        if (!source) {
            const possibleSources = ['jacData', 'data', 'tableData', 'dashboardData'];
            for (const sourceName of possibleSources) {
                if (window[sourceName] && Array.isArray(window[sourceName])) {
                    source = window[sourceName];
                    console.log(`✅ Usando ${sourceName}:`, source.length, 'registros');
                    break;
                }
            }
        }

        // Último recurso: extraer del DOM
        if (!source) {
            console.log('🔄 Intentando extraer datos del DOM...');
            source = this.extractDataFromTable();
            if (source) {
                console.log('✅ Datos extraídos del DOM:', source.length, 'registros');
            }
        }

        if (!source || index >= source.length) {
            console.error('❌ No se encontraron datos válidos');
            return null;
        }

        return source[index];
    }

    extractDataFromTable() {
        // Para la nueva fuente de datos, usar directamente jacData o tableManager
        if (window.jacData && Array.isArray(window.jacData)) return window.jacData;
        if (window.tableManager?.data) return window.tableManager.data;
        return null;
    }

    parseCurrency(text) {
        if (!text) return 0;
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
    }

    createModal(data) {
        this.closeModal();

        const overlay = document.createElement('div');
        overlay.className = 'jac-overlay';
        overlay.innerHTML = this.generateModalHTML(data);

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Events
        overlay.querySelector('.jac-close').onclick = () => this.closeModal();
        overlay.onclick = (e) => e.target === overlay && this.closeModal();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Show modal with delay for smooth animation
        requestAnimationFrame(() => overlay.classList.add('show'));

        // Initialize charts after modal is shown
        setTimeout(() => {
            this.createFinancialChart(data);
            this.animateProgressBars(data);
        }, 600);
    }

    generateModalHTML(data) {
        const avancePct = ((data.Avance || 0) * 100).toFixed(1);
        return `
            <div class="jac-modal">
                ${this.generateHeroSection(data)}
                ${this.generateContentSection(data)}
            </div>
        `;
    }

    generateHeroSection(data) {
        const avancePct = ((data.Avance || 0) * 100).toFixed(0);
        return `
            <div class="jac-hero">
                <button class="jac-close"><i class="fas fa-times"></i></button>
                <div class="jac-hero-content">
                    <div class="jac-hero-info">
                        <h1 class="jac-title">${data.NOMBRE_VIA || data.CIRCUITO}</h1>
                        <div class="jac-meta">
                            <div class="jac-badge">
                                <i class="fas fa-map-marker-alt"></i>
                                ${data.MPIO_NOMBRE}, ${data.SUBREGION || data.SUBREGION_1}
                            </div>
                            <div class="jac-badge">
                                <i class="fas fa-road"></i>
                                ${data.CODIGO_VIA}
                            </div>
                            <div class="jac-badge">
                                <i class="fas fa-ruler-horizontal"></i>
                                ${((data['Longitud(m)']) || 0).toFixed(2)} km
                            </div>
                        </div>
                    </div>
                    <div class="jac-stats-mini">
                        <div class="jac-stat-mini">
                            <div class="jac-stat-value">${this.formatCurrencyShort(data.VALOR_CTO)}</div>
                            <div class="jac-stat-label">Valor Contrato</div>
                        </div>
                        <div class="jac-stat-mini">
                            <div class="jac-stat-value">${avancePct}%</div>
                            <div class="jac-stat-label">Avance</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateContentSection(data) {
        return `
            <div class="jac-content">
                <div class="jac-dashboard">
                    <div class="jac-main-panel">
                        ${this.generateChartSection(data)}
                        ${this.generateCardsGrid(data)}
                        ${this.generateDescriptionCard(data)}
                    </div>
                    <div class="jac-side-panel">
                        ${this.generateContactCard(data)}
                        ${this.generateProgressSection(data)}
                    </div>
                </div>
            </div>
        `;
    }

    generateChartSection(data) {
        return `
            <div class="jac-chart-section">
                <div class="jac-chart-header">
                    <h3 class="jac-chart-title">
                        <i class="fas fa-chart-pie"></i>
                        Distribución de Inversión
                    </h3>
                </div>
                <div class="jac-chart-container">
                    <canvas id="financial-donut-chart"></canvas>
                </div>
            </div>
        `;
    }

    generateCardsGrid(data) {
        return `
            <div class="jac-cards-grid">
                ${this.generateFinancialCard(data)}
                ${this.generateTechnicalCard(data)}
                ${this.generateTeamCard(data)}
            </div>
        `;
    }

    generateFinancialCard(data) {
        return `
            <div class="jac-info-card financial">
                <div class="jac-card-header">
                    <div class="jac-card-icon"><i class="fas fa-money-bill-wave"></i></div>
                    <h4 class="jac-card-title">Información Financiera</h4>
                </div>
                <div class="jac-card-content">
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-dollar-sign"></i> Valor Contrato</div>
                        <div class="jac-value money">${this.formatMoney(data.VALOR_CTO)}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-file-contract"></i> No. Contrato</div>
                        <div class="jac-value">${data.NO_CONTRATO}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-layer-group"></i> Lote</div>
                        <div class="jac-value">${data.LOTE}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-hard-hat"></i> Contratista</div>
                        <div class="jac-value">${data.CONTRATISTA}</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTechnicalCard(data) {
        return `
            <div class="jac-info-card technical">
                <div class="jac-card-header">
                    <div class="jac-card-icon"><i class="fas fa-cogs"></i></div>
                    <h4 class="jac-card-title">Información Técnica</h4>
                </div>
                <div class="jac-card-content">
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-ruler-horizontal"></i> Longitud Tramo</div>
                        <div class="jac-value highlight">${((data['Longitud(m)']) || 0).toFixed(2)} km</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-road"></i> Longitud Circuito</div>
                        <div class="jac-value">${(data['Longitud (km)'] || 0)} km</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-hashtag"></i> Código Vía</div>
                        <div class="jac-value">${data.CODIGO_VIA}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-layer-group"></i> Tipo Vía / Orden</div>
                        <div class="jac-value">${data.TIPO_VIA} / ${data.ORDEN}</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTeamCard(data) {
        const avancePct = ((data.Avance || 0) * 100).toFixed(1);
        const diasTranscurridos = data.Dias || 0;
        return `
            <div class="jac-info-card team">
                <div class="jac-card-header">
                    <div class="jac-card-icon"><i class="fas fa-calendar-alt"></i></div>
                    <h4 class="jac-card-title">Ejecución del Contrato</h4>
                </div>
                <div class="jac-card-content">
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-calendar-check"></i> Acta de Inicio</div>
                        <div class="jac-value">${data.ACTA_INICIO || 'N/A'}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-flag-checkered"></i> Acta de Fin</div>
                        <div class="jac-value">${data.ACTA_FIN || 'N/A'}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-hourglass-half"></i> Plazo (meses)</div>
                        <div class="jac-value">${data['PLAZO (MESES)'] || 'N/A'}</div>
                    </div>
                    <div class="jac-field">
                        <div class="jac-label"><i class="fas fa-clock"></i> Días transcurridos</div>
                        <div class="jac-value highlight">${diasTranscurridos} días</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateContactCard(data) {
        return `
            <div class="jac-info-card contact">
                <div class="jac-card-header">
                    <div class="jac-card-icon">
                        <i class="fas fa-address-book"></i>
                    </div>
                    <h4 class="jac-card-title">Información de Contacto</h4>
                </div>
                <div class="jac-card-content">
                    ${this.generateContactItems(data)}
                </div>
            </div>
        `;
    }

    generateContactItems(data) {
        let html = '';
        html += `
            <div class="jac-contact-item" onclick="detailModal.copy('${data.CONTRATISTA || ''}', this)">
                <div class="jac-contact-icon"><i class="fas fa-hard-hat"></i></div>
                <div class="jac-contact-info">
                    <div class="jac-contact-label">Contratista</div>
                    <div class="jac-contact-value">${data.CONTRATISTA || 'N/A'}</div>
                </div>
                <div class="jac-copy-icon"><i class="fas fa-copy"></i></div>
                <div class="jac-feedback">¡Copiado!</div>
            </div>
            <div class="jac-contact-item" onclick="detailModal.copy('${data.CIRCUITO || ''}', this)">
                <div class="jac-contact-icon"><i class="fas fa-route"></i></div>
                <div class="jac-contact-info">
                    <div class="jac-contact-label">Circuito</div>
                    <div class="jac-contact-value">${data.CIRCUITO || 'N/A'}</div>
                </div>
                <div class="jac-copy-icon"><i class="fas fa-copy"></i></div>
                <div class="jac-feedback">¡Copiado!</div>
            </div>
            <div class="jac-contact-item" onclick="detailModal.copy('${data.MPIO_NOMBRE || ''}', this)">
                <div class="jac-contact-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div class="jac-contact-info">
                    <div class="jac-contact-label">Municipio</div>
                    <div class="jac-contact-value">${data.MPIO_NOMBRE || 'N/A'} — ${data.SUBREGION || data.SUBREGION_1 || ''}</div>
                </div>
                <div class="jac-copy-icon"><i class="fas fa-copy"></i></div>
                <div class="jac-feedback">¡Copiado!</div>
            </div>
        `;
        return html;
    }

    generateProgressSection(data) {
        const avancePct = (data.Avance || 0) * 100;
        const plazoPct = data['PLAZO (MESES)'] ? Math.min((data.Dias || 0) / (data['PLAZO (MESES)'] * 30) * 100, 100) : 0;

        return `
            <div class="jac-progress-section">
                <h4 class="jac-card-title" style="margin-bottom:20px;display:flex;align-items:center;gap:10px;">
                    <i class="fas fa-chart-bar" style="color:#3b82f6;"></i>
                    Estado de Avance
                </h4>
                <div class="jac-progress-item">
                    <div class="jac-progress-header">
                        <span class="jac-progress-label">Avance físico</span>
                        <span class="jac-progress-value">${avancePct.toFixed(1)}%</span>
                    </div>
                    <div class="jac-progress-bar">
                        <div class="jac-progress-fill" data-width="${avancePct}"></div>
                    </div>
                </div>
                <div class="jac-progress-item">
                    <div class="jac-progress-header">
                        <span class="jac-progress-label">Tiempo transcurrido</span>
                        <span class="jac-progress-value">${plazoPct.toFixed(1)}%</span>
                    </div>
                    <div class="jac-progress-bar">
                        <div class="jac-progress-fill" data-width="${plazoPct}" style="background:linear-gradient(90deg,#f59e0b,#d97706);"></div>
                    </div>
                </div>
            </div>
        `;
    }

    generateDescriptionCard(data) {
        return `
            <div class="jac-description-card">
                <div class="jac-desc-content">
                    <div class="jac-desc-icon"><i class="fas fa-route"></i></div>
                    <div>
                        <h4 class="jac-card-title" style="margin-bottom:15px;">Circuito Vial</h4>
                        <div class="jac-desc-text">${data.CIRCUITO || 'No disponible'}</div>
                        <div style="margin-top:10px;font-size:12px;color:#64748b;">
                            <strong>Subregión:</strong> ${data.SUBREGION || data.SUBREGION_1 || 'N/A'} &nbsp;|&nbsp;
                            <strong>Municipio:</strong> ${data.MPIO_NOMBRE || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createFinancialChart(data) {
        const canvas = document.getElementById('financial-donut-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 300;
        canvas.height = 250;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 10;
        const radius = 80;
        const innerRadius = 45;

        const avancePct = (data.Avance || 0) * 100;
        const restante = 100 - avancePct;

        const angleAvance  = (avancePct  / 100) * 2 * Math.PI;
        const angleRest    = (restante / 100) * 2 * Math.PI;

        const colorAvance  = '#2fa87a';
        const colorRest    = '#e2e8f0';

        let currentAngle = -Math.PI / 2;

        this.drawDonutSegment(ctx, centerX, centerY, innerRadius, radius, currentAngle, currentAngle + angleAvance, colorAvance);
        currentAngle += angleAvance;
        this.drawDonutSegment(ctx, centerX, centerY, innerRadius, radius, currentAngle, currentAngle + angleRest, colorRest);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(avancePct.toFixed(1) + '%', centerX, centerY - 5);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Avance', centerX, centerY + 12);

        this.drawChartLegend(ctx, [
            { color: colorAvance, label: 'Ejecutado', value: avancePct.toFixed(1) + '%' },
            { color: colorRest,   label: 'Pendiente', value: restante.toFixed(1) + '%' }
        ], centerY + radius + 30);
    }

    drawDonutSegment(ctx, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, color) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Add shadow/border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawChartLegend(ctx, items, y) {
        const startX = 60;
        let currentX = startX;
        
        items.forEach((item, index) => {
            // Color circle
            ctx.beginPath();
            ctx.arc(currentX, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, currentX + 20, y + 4);
            
            // Value
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Arial';
            ctx.fillText(item.value, currentX + 20, y + 18);
            
            currentX += 120;
        });
    }

    animateProgressBars(data) {
        const progressBars = document.querySelectorAll('.jac-progress-fill');
        
        progressBars.forEach((bar, index) => {
            const targetWidth = parseFloat(bar.getAttribute('data-width'));
            
            setTimeout(() => {
                bar.style.width = targetWidth + '%';
            }, 800 + (index * 200));
        });
    }

    async copy(text, element) {
        try {
            await navigator.clipboard.writeText(text);
            
            const feedback = element.querySelector('.jac-feedback');
            if (feedback) {
                feedback.classList.add('show');
                setTimeout(() => feedback.classList.remove('show'), 2000);
            }
            
            console.log('📋 Copiado:', text);
        } catch (err) {
            console.error('Error copiando:', err);
        }
    }

    closeModal() {
        const overlay = document.querySelector('.jac-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                overlay.remove();
                this.charts = {};
                this.currentData = null;
            }, 500);
        }
    }

    // Utilidades
    formatMoney(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    formatCurrencyShort(value) {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(1)}B`;
        } else if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(0)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        } else {
            return `$${value.toLocaleString()}`;
        }
    }

    getCAEName(responsable) {
        if (!responsable) return 'No disponible';
        return responsable.split('\n')[0];
    }

    extractEmail(text) {
        if (!text) return null;
        const match = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        return match ? match[1] : null;
    }
}

// Inicializar automáticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.detailModal = new DetailModal();
    });
} else {
    window.detailModal = new DetailModal();
}