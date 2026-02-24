/**
 * tramoModal.js
 * Modal de detalle de tramo vial — Secretaría de Infraestructura Física
 * Estilo institucional Gobernación de Antioquia
 */
class TramoModal {
    constructor() {
        this._jacData  = null;
        this._photos   = [];
        this._photoIdx = 0;
        this._buildDOM();
        this._injectStyles();
    }

    /* ═══════════════════════════════════════════
       API pública
    ═══════════════════════════════════════════ */
    setData(jacData) { this._jacData = jacData; }

    openFromFeature(feature) {
        const props   = feature?.properties || {};
        const name    = props.name || props.CIRCUITO || props.NOMBRE_VIA || '';
        const records = this._findRecords(name);
        records ? this._render(records, name) : this._renderEmpty(name);
        this._open();
    }

    /* ═══════════════════════════════════════════
       Búsqueda en jacData
    ═══════════════════════════════════════════ */
    _findRecords(name) {
        if (!this._jacData || !name) return null;
        const q = name.trim().toUpperCase();
        const r = this._jacData.filter(d =>
            (d.CIRCUITO || d.NOMBRE_VIA || '').trim().toUpperCase() === q
        );
        return r.length ? r : null;
    }

    /* ═══════════════════════════════════════════
       Render principal
    ═══════════════════════════════════════════ */
    _render(records, circuitoName) {
        const d         = records[0];
        const avancePct = Math.min(((d.Avance || 0) * 100), 100);
        const longKm    = records.reduce((s, r) => s + (parseFloat(r['Longitud (km)']) || 0), 0).toFixed(2);
        const mpios     = [...new Set(records.map(r => r.MPIO_NOMBRE).filter(Boolean))];
        const avColor   = avancePct >= 75 ? '#018d38' : avancePct >= 40 ? '#c47f00' : '#c0392b';

        // Calcular días transcurridos desde ACTA_INICIO hasta hoy
        const diasTranscurridos = (() => {
            if (!d.ACTA_INICIO) return '—';
            const inicio = new Date(d.ACTA_INICIO);
            if (isNaN(inicio)) return '—';
            const hoy  = new Date();
            hoy.setHours(0, 0, 0, 0);
            inicio.setHours(0, 0, 0, 0);
            const diff = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
            return diff >= 0 ? diff.toLocaleString('es-CO') : '—';
        })();

        /* ── Panel izquierdo ── */
        document.getElementById('tmd-info').innerHTML = `

            <!-- Encabezado del tramo -->
            <div class="tmd-head">
                <div class="tmd-head-badge">
                    <span class="tmd-subr-label">${d.SUBREGION || '—'}</span>
                    ${d.LOTE ? `<span class="tmd-lote-label">Lote ${d.LOTE}</span>` : ''}
                </div>
                <h2 class="tmd-nombre">${circuitoName}</h2>
                ${d.CODIGO_VIA ? `<p class="tmd-codigo">${d.CODIGO_VIA}</p>` : ''}
                <div class="tmd-mpios-row">
                    ${mpios.map(m => `<span class="tmd-mpio-chip">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${m}</span>`).join('')}
                </div>
            </div>

            <!-- Avance de obra -->
            <div class="tmd-avance-block">
                <div class="tmd-avance-row">
                    <span class="tmd-section-label">Avance de obra</span>
                    <span class="tmd-avance-pct" style="color:${avColor}">${avancePct.toFixed(1)}%</span>
                </div>
                <div class="tmd-prog-track">
                    <div class="tmd-prog-fill" id="tmd-prog-fill"
                         style="--target:${avancePct}%; background:${avColor};"></div>
                </div>
                <div class="tmd-prog-ticks">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
            </div>

            <!-- Indicadores rápidos -->
            <div class="tmd-kpis">
                <div class="tmd-kpi">
                    <span class="tmd-kpi-val">${longKm}</span>
                    <span class="tmd-kpi-lbl">km intervenidos</span>
                </div>
                <div class="tmd-kpi-div"></div>
                <div class="tmd-kpi">
                    <span class="tmd-kpi-val">${records.length}</span>
                    <span class="tmd-kpi-lbl">tramos</span>
                </div>
            </div>

            <!-- Detalles del contrato -->
            <div class="tmd-section">
                <div class="tmd-section-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    Detalles del contrato
                </div>
                <table class="tmd-table">
                    <tbody>
                        ${this._tr('Contratista',  d.CONTRATISTA, true)}
                        ${this._tr('N° Contrato',  d.NO_CONTRATO)}
                        ${this._tr('Circuito',     d.CIRCUITO)}
                        ${this._tr('Tipo de vía',  d.TIPO_VIA)}
                    </tbody>
                </table>
            </div>

            <!-- Información de ejecución -->
            <div class="tmd-section">
                <div class="tmd-section-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Ejecución
                </div>
                <table class="tmd-table">
                    <tbody>
                        ${this._tr('Plazo',              (d['PLAZO (MESES)'] ?? '—') + ' meses')}
                        ${this._tr('Fecha inicio',       this._fmtFecha(d.ACTA_INICIO))}
                        ${this._tr('Fecha fin',          this._fmtFecha(d.ACTA_FIN))}
                        ${this._tr('Días transcurridos', diasTranscurridos)}
                    </tbody>
                </table>
            </div>
        `;

        /* ── Panel derecho: fotos ── */
        this._loadGallery(d.NO_CONTRATO);

        /* ── Animar barra ── */
        requestAnimationFrame(() => setTimeout(() => {
            const f = document.getElementById('tmd-prog-fill');
            if (f) f.classList.add('tmd-prog-animate');
        }, 160));
    }

    /* ── Helper: fila de tabla ── */
    _tr(label, value, bold = false, type = '') {
        const valClass = bold ? 'tmd-td-v tmd-td-bold' : type === 'money' ? 'tmd-td-v tmd-td-money' : 'tmd-td-v';
        return `<tr class="tmd-tr">
            <td class="tmd-td-l">${label}</td>
            <td class="${valClass}">${value || '—'}</td>
        </tr>`;
    }

    /* ═══════════════════════════════════════════
       Galería de fotos
    ═══════════════════════════════════════════ */
    _loadGallery(contrato) {
        const panel = document.getElementById('tmd-gallery');
        if (!contrato) { panel.innerHTML = this._emptyGallery('Sin número de contrato'); return; }

        this._photos   = [];
        this._photoIdx = 0;

        panel.innerHTML = `
            <div class="tmd-gallery-loading">
                <div class="tmd-spinner"></div>
                <span>Cargando fotografías…</span>
            </div>`;

        const base   = `fotografias/${contrato}/`;
        const maxTry = 30;
        const found  = [];
        let   tried  = 0;

        const checkDone = () => {
            tried++;
            if (tried === maxTry) {
                this._photos = found.sort((a, b) => {
                    const na = parseInt(a.match(/foto(\d+)/)?.[1] || 0);
                    const nb = parseInt(b.match(/foto(\d+)/)?.[1] || 0);
                    return na - nb;
                });
                this._photos.length ? this._renderGallery(panel) : (panel.innerHTML = this._emptyGallery());
            }
        };

        for (let i = 1; i <= maxTry; i++) {
            const tryExt = (exts, idx) => {
                if (!exts.length) { checkDone(); return; }
                const ext = exts[0];
                const img = new Image();
                img.onload  = () => { found.push(`${base}foto${idx}.${ext}`); checkDone(); };
                img.onerror = () => tryExt(exts.slice(1), idx);
                img.src     = `${base}foto${idx}.${ext}`;
            };
            tryExt(['jpg', 'JPG', 'jpeg', 'png'], i);
        }
    }

    _emptyGallery(msg = 'Sin fotografías disponibles') {
        return `
            <div class="tmd-gallery-empty">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span>${msg}</span>
            </div>`;
    }

    _renderGallery(panel) {
        const photos = this._photos;
        panel.innerHTML = `

            <!-- Foto principal -->
            <div class="tmd-main-wrap" id="tmd-main-wrap">
                <img id="tmd-main-img" src="${photos[0]}" class="tmd-main-img" alt="Fotografía"
                     loading="lazy"
                     onerror="this.parentElement.innerHTML='<div class=tmd-img-err>No se pudo cargar la imagen</div>'">
                ${photos.length > 1 ? `
                <button class="tmd-nav tmd-nav-l" id="tmd-prev">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,18 9,12 15,6"/></svg>
                </button>
                <button class="tmd-nav tmd-nav-r" id="tmd-next">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg>
                </button>` : ''}
                <div class="tmd-counter" id="tmd-counter">1 / ${photos.length}</div>
                <button class="tmd-fs-btn" id="tmd-fs" title="Ver a pantalla completa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                </button>
            </div>

            <!-- Miniaturas -->
            ${photos.length > 1 ? `
            <div class="tmd-thumbs" id="tmd-thumbs">
                ${photos.map((p, i) => `
                    <button class="tmd-thumb ${i === 0 ? 'tmd-thumb-on' : ''}"
                            data-i="${i}"
                            style="background-image:url('${p}')">
                    </button>`).join('')}
            </div>` : ''}
        `;

        this._bindGallery(panel, photos);
    }

    _bindGallery(panel, photos) {
        const go = (idx) => {
            this._photoIdx = (idx + photos.length) % photos.length;
            const img = document.getElementById('tmd-main-img');
            if (img) {
                img.style.opacity   = '0';
                img.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    img.src             = photos[this._photoIdx];
                    img.style.opacity   = '1';
                    img.style.transform = 'scale(1)';
                }, 130);
            }
            const ctr = document.getElementById('tmd-counter');
            if (ctr) ctr.textContent = `${this._photoIdx + 1} / ${photos.length}`;
            panel.querySelectorAll('.tmd-thumb').forEach((t, i) =>
                t.classList.toggle('tmd-thumb-on', i === this._photoIdx));
            const at = panel.querySelector(`.tmd-thumb[data-i="${this._photoIdx}"]`);
            if (at) at.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
        };

        const prev = document.getElementById('tmd-prev');
        const next = document.getElementById('tmd-next');
        if (prev) prev.addEventListener('click', () => go(this._photoIdx - 1));
        if (next) next.addEventListener('click', () => go(this._photoIdx + 1));
        panel.querySelectorAll('.tmd-thumb').forEach(t =>
            t.addEventListener('click', () => go(parseInt(t.dataset.i))));

        const fsBtn = document.getElementById('tmd-fs');
        if (fsBtn) fsBtn.addEventListener('click', () => this._lightbox(photos, this._photoIdx));

        // swipe táctil
        const wrap = document.getElementById('tmd-main-wrap');
        if (wrap) {
            let sx = 0;
            wrap.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
            wrap.addEventListener('touchend',   e => {
                const dx = e.changedTouches[0].clientX - sx;
                if (Math.abs(dx) > 40) go(this._photoIdx + (dx < 0 ? 1 : -1));
            });
        }
    }

    /* ── Lightbox ── */
    _lightbox(photos, start) {
        let idx = start;
        const lb = document.createElement('div');
        lb.id = 'tmd-lb';
        lb.innerHTML = `
            <div class="tmd-lb-bg" id="tmd-lb-bg"></div>
            <div class="tmd-lb-body">
                ${photos.length > 1 ? `<button class="tmd-lb-nav" id="tmd-lb-p"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,18 9,12 15,6"/></svg></button>` : ''}
                <img id="tmd-lb-img" src="${photos[idx]}" class="tmd-lb-img">
                ${photos.length > 1 ? `<button class="tmd-lb-nav" id="tmd-lb-n"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg></button>` : ''}
            </div>
            <button class="tmd-lb-close" id="tmd-lb-x">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="tmd-lb-ctr" id="tmd-lb-ctr">${idx + 1} / ${photos.length}</div>`;
        document.body.appendChild(lb);
        requestAnimationFrame(() => lb.classList.add('tmd-lb-on'));

        const close = () => { lb.classList.remove('tmd-lb-on'); setTimeout(() => lb.remove(), 260); };
        const go    = (n)  => {
            idx = (n + photos.length) % photos.length;
            document.getElementById('tmd-lb-img').src = photos[idx];
            document.getElementById('tmd-lb-ctr').textContent = `${idx + 1} / ${photos.length}`;
        };

        document.getElementById('tmd-lb-x').addEventListener('click', close);
        document.getElementById('tmd-lb-bg').addEventListener('click', close);
        const lp = document.getElementById('tmd-lb-p'), ln = document.getElementById('tmd-lb-n');
        if (lp) lp.addEventListener('click', () => go(idx - 1));
        if (ln) ln.addEventListener('click', () => go(idx + 1));

        const kh = e => {
            if (e.key === 'Escape')      { close(); document.removeEventListener('keydown', kh); }
            if (e.key === 'ArrowLeft')   go(idx - 1);
            if (e.key === 'ArrowRight')  go(idx + 1);
        };
        document.addEventListener('keydown', kh);
    }

    /* ── Render vacío ── */
    _renderEmpty(name) {
        document.getElementById('tmd-info').innerHTML = `
            <div class="tmd-head">
                <h2 class="tmd-nombre">${name || 'Tramo'}</h2>
                <p style="color:#6b7280;font-size:13px;margin-top:8px;">Sin información disponible para este tramo.</p>
            </div>`;
        document.getElementById('tmd-gallery').innerHTML = this._emptyGallery();
    }

    /* ═══════════════════════════════════════════
       DOM
    ═══════════════════════════════════════════ */
    _buildDOM() {
        if (document.getElementById('tmd-overlay')) return;
        const o = document.createElement('div');
        o.id = 'tmd-overlay';
        o.innerHTML = `
            <div id="tmd-modal" role="dialog" aria-modal="true" aria-labelledby="tmd-modal-title">

                <!-- Encabezado institucional -->
                <div id="tmd-modal-header">
                    <div id="tmd-modal-header-brand">
                        <div id="tmd-modal-header-text">
                            <span id="tmd-modal-header-dep">Gobernación de Antioquia</span>
                            <span id="tmd-modal-header-sec">Secretaría de Infraestructura Física</span>
                        </div>
                    </div>
                    <button id="tmd-close" aria-label="Cerrar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <!-- Cuerpo: dos paneles -->
                <div id="tmd-body">
                    <!-- Panel izquierdo -->
                    <div id="tmd-panel-info">
                        <div id="tmd-info-scroll">
                            <div id="tmd-info"></div>
                        </div>
                    </div>
                    <!-- Panel derecho: fotografías -->
                    <div id="tmd-panel-fotos">
                        <div id="tmd-fotos-head">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                            Registro fotográfico
                        </div>
                        <div id="tmd-gallery"></div>
                    </div>
                </div>

                <!-- Pie del modal -->
                <div id="tmd-footer">
                    <span id="tmd-footer-info">Sistema de Seguimiento — Red Vial Departamental</span>
                    <button id="tmd-footer-close">Cerrar</button>
                </div>
            </div>`;
        document.body.appendChild(o);

        o.addEventListener('click', e => { if (e.target === o) this._close(); });
        document.getElementById('tmd-close').addEventListener('click',        () => this._close());
        document.getElementById('tmd-footer-close').addEventListener('click', () => this._close());
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this._close(); });
    }

    _open() {
        const o = document.getElementById('tmd-overlay');
        if (!o) return;
        o.style.display = 'flex';
        requestAnimationFrame(() => o.classList.add('tmd-on'));
        document.body.style.overflow = 'hidden';
    }

    _close() {
        const o = document.getElementById('tmd-overlay');
        if (!o) return;
        o.classList.remove('tmd-on');
        document.body.style.overflow = '';
        setTimeout(() => { o.style.display = 'none'; }, 300);
    }

    /* ═══════════════════════════════════════════
       Formato
    ═══════════════════════════════════════════ */
    _fmtValor(val) {
        if (!val) return '—';
        const n = parseFloat(val);
        if (n >= 1e12) return `$${(n/1e12).toFixed(2)} billones`;
        if (n >= 1e9)  return `$${(n/1e9).toFixed(2)} MM`;
        if (n >= 1e6)  return `$${(n/1e6).toFixed(1)} M`;
        return `$${n.toLocaleString('es-CO')}`;
    }

    _fmtFecha(str) {
        if (!str) return '—';
        try {
            const d = new Date(str);
            return isNaN(d) ? str : d.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' });
        } catch { return str; }
    }

    /* ═══════════════════════════════════════════
       Estilos
    ═══════════════════════════════════════════ */
    _injectStyles() {
        if (document.getElementById('tmd-styles')) return;
        const s = document.createElement('style');
        s.id = 'tmd-styles';
        s.textContent = `
/* ── Fuentes (mismas que el dashboard) ── */
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

/* ══════════════════════════════════════════
   VARIABLES
══════════════════════════════════════════ */
#tmd-overlay {
    --g1:       #01531f;   /* verde oscuro institucional */
    --g2:       #018d38;   /* verde principal */
    --g3:       #02a543;   /* verde acento */
    --g-pale:   #f0fdf4;
    --g-light:  #dcfce7;
    --g-border: #bbf7d0;
    --ink:      #1f2937;
    --ink-mid:  #4b5563;
    --ink-soft: #9ca3af;
    --border:   #e5e7eb;
    --bg-alt:   #f9fafb;
    --white:    #ffffff;
    --r:        12px;
    font-family: 'Prompt', Arial, sans-serif;
    font-size:   14px;
}

/* ══════════════════════════════════════════
   OVERLAY
══════════════════════════════════════════ */
#tmd-overlay {
    display:    none;
    position:   fixed;
    inset:      0;
    background: rgba(2, 18, 8, 0.72);
    backdrop-filter: blur(6px);
    z-index:    10000;
    align-items:     center;
    justify-content: center;
    padding:    20px;
    opacity:    0;
    transition: opacity 0.28s ease;
}
#tmd-overlay.tmd-on { opacity: 1; }

/* ══════════════════════════════════════════
   MODAL
══════════════════════════════════════════ */
#tmd-modal {
    background:    var(--white);
    border-radius: var(--r);
    width:         100%;
    max-width:     940px;
    max-height:    90vh;
    display:       flex;
    flex-direction: column;
    overflow:      hidden;
    box-shadow:
        0 0 0 1px rgba(1,141,56,0.15),
        0 24px 64px rgba(1,60,20,0.30),
        0 6px 20px rgba(0,0,0,0.12);
    transform:  translateY(20px) scale(0.98);
    opacity:    0;
    transition: transform 0.34s cubic-bezier(0.22,1,0.36,1),
                opacity   0.28s ease;
}
#tmd-overlay.tmd-on #tmd-modal {
    transform: translateY(0) scale(1);
    opacity:   1;
}

/* ══════════════════════════════════════════
   ENCABEZADO INSTITUCIONAL
══════════════════════════════════════════ */
#tmd-modal-header {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding:         12px 20px;
    background:      linear-gradient(90deg, var(--g1) 0%, var(--g2) 100%);
    flex-shrink:     0;
    border-bottom:   3px solid var(--g3);
}
#tmd-modal-header-brand {
    display:     flex;
    align-items: center;
    gap:         12px;
}
#tmd-logo {
    height: 38px;
    width:  auto;
    display: block;
    filter: brightness(0) invert(1);
    opacity: 0.92;
}
#tmd-modal-header-text {
    display:        flex;
    flex-direction: column;
    gap:            1px;
}
#tmd-modal-header-dep {
    font-size:      11px;
    font-weight:    700;
    color:          rgba(255,255,255,0.95);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height:    1;
}
#tmd-modal-header-sec {
    font-size:   11px;
    font-weight: 400;
    color:       rgba(255,255,255,0.70);
    line-height: 1;
}
#tmd-close {
    width:      30px;
    height:     30px;
    background: rgba(255,255,255,0.12);
    border:     1px solid rgba(255,255,255,0.22);
    border-radius: 6px;
    color:      rgba(255,255,255,0.85);
    cursor:     pointer;
    display:    flex;
    align-items:     center;
    justify-content: center;
    transition: all 0.16s ease;
    flex-shrink: 0;
}
#tmd-close:hover {
    background: rgba(255,255,255,0.22);
    color:      var(--white);
    transform:  scale(1.06);
}

/* ══════════════════════════════════════════
   CUERPO — DOS PANELES
══════════════════════════════════════════ */
#tmd-body {
    display:    grid;
    grid-template-columns: 1fr 1fr;
    flex:       1;
    overflow:   hidden;
    min-height: 0;
}

/* ── Panel izquierdo: información ── */
#tmd-panel-info {
    border-right: 1px solid var(--border);
    display:      flex;
    flex-direction: column;
    overflow:     hidden;
}
#tmd-info-scroll {
    flex:       1;
    overflow-y: auto;
    padding:    22px 22px 18px;
    scrollbar-width: thin;
    scrollbar-color: var(--g-border) transparent;
}
#tmd-info-scroll::-webkit-scrollbar        { width: 4px; }
#tmd-info-scroll::-webkit-scrollbar-thumb  { background: var(--g-border); border-radius: 4px; }
#tmd-info-scroll::-webkit-scrollbar-thumb:hover { background: var(--g2); }

/* ── Encabezado del tramo ── */
.tmd-head { margin-bottom: 18px; }

.tmd-head-badge {
    display:     flex;
    align-items: center;
    gap:         6px;
    margin-bottom: 8px;
}
.tmd-subr-label {
    font-size:      10px;
    font-weight:    600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color:          var(--g2);
    background:     var(--g-pale);
    border:         1px solid var(--g-border);
    border-radius:  4px;
    padding:        2px 8px;
}
.tmd-lote-label {
    font-size:   10px;
    font-weight: 500;
    color:       var(--ink-mid);
    background:  var(--bg-alt);
    border:      1px solid var(--border);
    border-radius: 4px;
    padding:     2px 8px;
}
.tmd-nombre {
    font-size:   18px;
    font-weight: 700;
    color:       var(--ink);
    margin:      0 0 3px;
    line-height: 1.25;
}
.tmd-codigo {
    font-size:   12px;
    color:       var(--ink-soft);
    margin:      0 0 10px;
    font-weight: 400;
}
.tmd-mpios-row {
    display:   flex;
    flex-wrap: wrap;
    gap:       5px;
}
.tmd-mpio-chip {
    display:     inline-flex;
    align-items: center;
    gap:         4px;
    font-size:   11px;
    font-weight: 500;
    color:       var(--g1);
    background:  var(--g-pale);
    border:      1px solid var(--g-border);
    border-radius: 4px;
    padding:     3px 8px;
}

/* ── Barra de avance ── */
.tmd-avance-block {
    background:    var(--bg-alt);
    border:        1px solid var(--border);
    border-radius: 8px;
    padding:       12px 14px;
    margin-bottom: 14px;
}
.tmd-avance-row {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    margin-bottom:   8px;
}
.tmd-section-label {
    font-size:      10px;
    font-weight:    700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color:          var(--ink-mid);
    display:        flex;
    align-items:    center;
    gap:            5px;
    margin-bottom:  10px;
}
.tmd-avance-block .tmd-section-label { margin-bottom: 0; color: var(--ink-soft); }
.tmd-avance-pct {
    font-size:   20px;
    font-weight: 700;
    line-height: 1;
}
.tmd-prog-track {
    height:        7px;
    background:    #e5e7eb;
    border-radius: 99px;
    overflow:      hidden;
    margin-bottom: 5px;
}
.tmd-prog-fill {
    height:        100%;
    width:         0%;
    border-radius: 99px;
    transition:    none;
}
.tmd-prog-fill.tmd-prog-animate {
    width:      var(--target);
    transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.tmd-prog-ticks {
    display:         flex;
    justify-content: space-between;
    font-size:       10px;
    color:           var(--ink-soft);
    font-weight:     400;
}

/* ── KPIs ── */
.tmd-kpis {
    display:       flex;
    align-items:   center;
    background:    var(--g-pale);
    border:        1px solid var(--g-border);
    border-radius: 8px;
    padding:       12px 0;
    margin-bottom: 16px;
}
.tmd-kpi       { flex:1; display:flex; flex-direction:column; align-items:center; gap:1px; }
.tmd-kpi-div   { width:1px; height:30px; background:var(--g-border); }
.tmd-kpi-val   { font-size:16px; font-weight:700; color:var(--g1); line-height:1; }
.tmd-kpi-lbl   { font-size:10px; color:var(--ink-soft); font-weight:400; text-align:center; }

/* ── Secciones de datos ── */
.tmd-section { margin-bottom: 14px; }
.tmd-section:last-child { margin-bottom: 0; }

/* ── Tabla de datos ── */
.tmd-table {
    width:           100%;
    border-collapse: collapse;
    font-size:       13px;
}
.tmd-tr:not(:last-child) .tmd-td-l,
.tmd-tr:not(:last-child) .tmd-td-v {
    border-bottom: 1px solid #f3f4f6;
}
.tmd-td-l {
    padding:     7px 10px 7px 0;
    color:       var(--ink-soft);
    font-weight: 400;
    width:       42%;
    vertical-align: top;
    line-height: 1.4;
    white-space: nowrap;
}
.tmd-td-v {
    padding:     7px 0 7px 4px;
    color:       var(--ink);
    font-weight: 500;
    vertical-align: top;
    line-height: 1.4;
}
.tmd-td-bold  { font-weight: 700; color: var(--g1); }
.tmd-td-money { font-weight: 700; color: var(--g1); font-size: 14px; }

/* ══════════════════════════════════════════
   PANEL DERECHO — FOTOGRAFÍAS
══════════════════════════════════════════ */
#tmd-panel-fotos {
    display:        flex;
    flex-direction: column;
    overflow:       hidden;
    background:     #f8f8f8;
}
#tmd-fotos-head {
    display:        flex;
    align-items:    center;
    gap:            6px;
    padding:        12px 16px 10px;
    font-size:      10px;
    font-weight:    700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color:          var(--ink-mid);
    border-bottom:  1px solid var(--border);
    background:     var(--white);
    flex-shrink:    0;
}
#tmd-gallery {
    flex:       1;
    display:    flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--g-border) transparent;
}
#tmd-gallery::-webkit-scrollbar       { width: 4px; }
#tmd-gallery::-webkit-scrollbar-thumb { background: var(--g-border); border-radius: 4px; }

/* Loading */
.tmd-gallery-loading {
    flex:            1;
    display:         flex;
    flex-direction:  column;
    align-items:     center;
    justify-content: center;
    gap:             12px;
    color:           var(--ink-soft);
    font-size:       12px;
    padding:         40px;
}
.tmd-spinner {
    width:        26px;
    height:       26px;
    border-radius: 50%;
    border:       3px solid var(--g-light);
    border-top-color: var(--g2);
    animation:    tmd-spin 0.75s linear infinite;
}
@keyframes tmd-spin { to { transform: rotate(360deg); } }

/* Vacío */
.tmd-gallery-empty {
    flex:            1;
    display:         flex;
    flex-direction:  column;
    align-items:     center;
    justify-content: center;
    gap:             10px;
    color:           var(--ink-soft);
    font-size:       12px;
    padding:         36px 20px;
    text-align:      center;
}
.tmd-gallery-empty svg { opacity: 0.3; }

/* Foto principal */
.tmd-main-wrap {
    position:     relative;
    overflow:     hidden;
    background:   #1a1a1a;
    flex-shrink:  0;
    aspect-ratio: 4 / 3;
}
.tmd-main-img {
    width:      100%;
    height:     100%;
    object-fit: cover;
    display:    block;
    transition: opacity 0.13s ease, transform 0.13s ease;
}
.tmd-img-err {
    display:         flex;
    align-items:     center;
    justify-content: center;
    height:          100%;
    color:           var(--ink-soft);
    font-size:       12px;
    padding:         20px;
    text-align:      center;
}

/* Navegación foto */
.tmd-nav {
    position:   absolute;
    top:        50%;
    transform:  translateY(-50%);
    width:      30px;
    height:     30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.88);
    border:     none;
    color:      var(--ink);
    cursor:     pointer;
    display:    flex;
    align-items:     center;
    justify-content: center;
    box-shadow: 0 1px 6px rgba(0,0,0,0.22);
    transition: all 0.16s ease;
    z-index:    5;
    opacity:    0.75;
}
.tmd-nav:hover  { opacity: 1; transform: translateY(-50%) scale(1.08); }
.tmd-nav-l      { left: 10px; }
.tmd-nav-r      { right: 10px; }
.tmd-counter {
    position:   absolute;
    bottom:     8px;
    left:       50%;
    transform:  translateX(-50%);
    background: rgba(0,0,0,0.52);
    color:      #fff;
    font-size:  11px;
    font-weight: 500;
    padding:    2px 10px;
    border-radius: 20px;
    backdrop-filter: blur(3px);
    pointer-events: none;
}
.tmd-fs-btn {
    position:   absolute;
    top:        8px;
    right:      8px;
    width:      26px;
    height:     26px;
    border-radius: 5px;
    background: rgba(0,0,0,0.48);
    border:     none;
    color:      #fff;
    cursor:     pointer;
    display:    flex;
    align-items:     center;
    justify-content: center;
    opacity:    0;
    transition: opacity 0.16s ease;
    z-index:    5;
}
.tmd-main-wrap:hover .tmd-fs-btn { opacity: 1; }

/* Miniaturas */
.tmd-thumbs {
    display:    flex;
    gap:        5px;
    padding:    8px 10px;
    overflow-x: auto;
    background: var(--white);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}
.tmd-thumbs::-webkit-scrollbar        { height: 3px; }
.tmd-thumbs::-webkit-scrollbar-thumb  { background: var(--border); border-radius: 3px; }
.tmd-thumb {
    width:       50px;
    height:      38px;
    flex-shrink: 0;
    border-radius: 4px;
    border:      2px solid transparent;
    background-size:     cover;
    background-position: center;
    cursor:      pointer;
    transition:  all 0.15s ease;
    opacity:     0.6;
}
.tmd-thumb:hover  { opacity: 0.85; }
.tmd-thumb-on {
    border-color: var(--g2);
    opacity:      1;
    box-shadow:   0 0 0 1px var(--g2);
}

/* ══════════════════════════════════════════
   PIE DEL MODAL
══════════════════════════════════════════ */
#tmd-footer {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding:         10px 20px;
    background:      var(--bg-alt);
    border-top:      1px solid var(--border);
    flex-shrink:     0;
}
#tmd-footer-info {
    font-size:   11px;
    color:       var(--ink-soft);
    font-weight: 400;
}
#tmd-footer-close {
    background: var(--g2);
    color:      var(--white);
    border:     none;
    padding:    7px 20px;
    border-radius: 6px;
    font-size:  12px;
    font-weight: 600;
    cursor:     pointer;
    font-family: 'Prompt', Arial, sans-serif;
    transition: background 0.16s ease, transform 0.14s ease;
    box-shadow: 0 2px 6px rgba(1,141,56,0.22);
}
#tmd-footer-close:hover {
    background: var(--g1);
    transform:  translateY(-1px);
    box-shadow: 0 4px 10px rgba(1,141,56,0.28);
}

/* ══════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════ */
#tmd-lb {
    position:   fixed;
    inset:      0;
    z-index:    11000;
    display:    flex;
    align-items:     center;
    justify-content: center;
    opacity:    0;
    transition: opacity 0.24s ease;
}
#tmd-lb.tmd-lb-on { opacity: 1; }
.tmd-lb-bg {
    position:   absolute;
    inset:      0;
    background: rgba(0,0,0,0.90);
    backdrop-filter: blur(10px);
}
.tmd-lb-body {
    position:    relative;
    z-index:     1;
    display:     flex;
    align-items: center;
    gap:         14px;
    max-width:   94vw;
    max-height:  90vh;
    padding:     0 8px;
}
.tmd-lb-img {
    max-width:   88vw;
    max-height:  86vh;
    object-fit:  contain;
    border-radius: 6px;
    box-shadow:  0 16px 50px rgba(0,0,0,0.55);
    display:     block;
}
.tmd-lb-close {
    position:   fixed;
    top:        16px;
    right:      16px;
    width:      36px;
    height:     36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.10);
    border:     1px solid rgba(255,255,255,0.18);
    color:      #fff;
    cursor:     pointer;
    display:    flex;
    align-items:     center;
    justify-content: center;
    transition: background 0.16s ease;
    z-index:    2;
}
.tmd-lb-close:hover { background: rgba(255,255,255,0.20); }
.tmd-lb-nav {
    width:       40px;
    height:      40px;
    border-radius: 50%;
    background:  rgba(255,255,255,0.08);
    border:      1px solid rgba(255,255,255,0.14);
    color:       #fff;
    cursor:      pointer;
    flex-shrink: 0;
    display:     flex;
    align-items:     center;
    justify-content: center;
    transition:  background 0.16s ease;
}
.tmd-lb-nav:hover { background: rgba(255,255,255,0.18); }
.tmd-lb-ctr {
    position:  fixed;
    bottom:    16px;
    left:      50%;
    transform: translateX(-50%);
    color:     rgba(255,255,255,0.65);
    font-size: 12px;
    font-weight: 500;
    font-family: 'Prompt', Arial, sans-serif;
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 700px) {
    #tmd-overlay { padding: 0; }
    #tmd-modal   { border-radius: 0; max-height: 100vh; }
    #tmd-body    { grid-template-columns: 1fr; }
    #tmd-panel-info  { border-right: none; border-bottom: 1px solid var(--border); max-height: 52vh; }
    #tmd-panel-fotos { min-height: 240px; }
    .tmd-nombre      { font-size: 16px; }
    .tmd-avance-pct  { font-size: 17px; }
}
        `;
        document.head.appendChild(s);
    }
}

window.TramoModal = TramoModal;
