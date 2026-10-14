const BY_URL = {};
PAGES.forEach(function (p) { BY_URL[p.u] = p; });

const SECTIONS = {
  modulo: ['¿Qué hace exactamente?', '¿Cómo se usa en el día a día de una asesoría?', '¿Qué ganas frente a hacerlo en Excel?'],
  solucion: ['¿Qué problemas resuelve en tu caso?', '¿Qué funciones vas a usar más?', '¿Cómo empiezas?'],
  herramienta: ['¿Cómo se hace el cálculo?', '¿De dónde salen los precios?', '¿Cómo lo usas con tu cliente?'],
  recurso: ['¿Qué hay que tener en cuenta?', 'Paso a paso', '¿Cómo te ayuda ContrataLux?'],
  glosario: ['¿Dónde aparece en la factura o en el contrato?', '¿Por qué le importa al asesor?'],
  comercializadora: ['¿Qué pide para trabajar como agente?', '¿Qué productos ofrece?', '¿Cómo se gestionan sus contratos en ContrataLux?'],
  integracion: ['¿Qué se puede hacer y qué no?', '¿Qué datos se pasan?', '¿Qué necesitas para empezar?'],
  zona: ['¿Cómo trabajan las asesorías energéticas de la zona?', '¿Por qué usar un programa de gestión aquí?'],
  comparativa: ['¿En qué se diferencian?', '¿Cuál te conviene según tu asesoría?'],
  empresa: ['[Sección 1 de la página]', '[Sección 2 de la página]', '[Sección 3 de la página]'],
  pagina: ['[Sección 1 de la página]', '[Sección 2 de la página]']
};
const FAQS = [
  { q: '¿Se puede probar gratis?', a: 'Sí, 7 días gratis con todas las funciones.' },
  { q: '¿Cuánto cuesta?', a: 'Desde 90 € al mes + IVA para 1 o 2 usuarios y 195 € al mes + IVA hasta 10. Precios vigentes desde octubre de 2026.' },
  { q: '¿Qué tipos de contrato gestiona?', a: 'Luz, gas, dual, fibra, alarmas y CAEs, con más de 30 comercializadoras precargadas.' }
];
const CHILD_TITLE = { suministros: 'Suministros que gestionas con ContrataLux', zonas: 'Elige tu zona', recursos: 'Artículos', modulos: 'Todas las funciones', soluciones: 'Elige tu perfil', herramientas: 'Herramientas gratis', comparativas: 'Comparativas', integraciones: 'Comercializadoras', 'plataforma-propia': 'Todo sobre la plataforma propia' };

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { route: '/', cookies: 'open', config: false, analytics: false, ads: false, modal: null, sent: false, toast: null, calcDone: false };
    this.anchor = null;
    this.routeChanged = false;
  }
  componentDidUpdate() {
    if (this.anchor) {
      const el = document.getElementById(this.anchor);
      this.anchor = null;
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    if (this.routeChanged) { this.routeChanged = false; window.scrollTo(0, 0); }
  }
  go(url, anchor) {
    this.anchor = anchor || null;
    this.routeChanged = url !== this.state.route;
    this.setState({ route: url, toast: null, calcDone: false });
  }
  renderVals() {
    const st = this.state;
    const page = BY_URL[st.route] || BY_URL['/'];
    const isHome = page.u === '/';
    const crumbs = [];
    let cur = BY_URL[page.p];
    while (cur && cur.u !== page.u) {
      crumbs.unshift({ u: cur.u, l: cur.u === '/' ? 'Inicio' : cur.l });
      if (cur.u === '/') break;
      cur = BY_URL[cur.p];
    }
    const children = isHome ? [] : PAGES.filter(function (p) { return p.p === page.u && p.u !== page.u; });
    const related = isHome ? [] : PAGES.filter(function (p) { return p.p === page.p && p.u !== page.u && p.t !== 'especial' && p.t !== 'legal'; }).slice(0, 6);
    const t = page.t;
    const seg = page.u.split('/')[1] || '';
    const base = page.qs.concat((SECTIONS[t] || []).filter(function (h) { return page.qs.indexOf(h) === -1; }));
    const sections = page.s ? [] : base.slice(0, Math.max(3, page.qs.length)).map(function (h) { return { h: h }; });
    const modals = {
      trial: { title: 'Prueba ContrataLux 7 días gratis', text: 'Crea tu cuenta y empieza a registrar contratos hoy. Sin compromiso.', button: 'Quiero probar la demo' },
      demo: { title: 'Pide tu demo', text: 'Te enseñamos ContrataLux en 30 minutos con casos de tu asesoría.', button: 'Pedir demo' },
      asesor: { title: 'Habla con un asesor', text: 'Cuéntanos tu caso y te llamamos para ver el plan que te encaja.', button: 'Quiero que me llaméis' }
    };
    const m = modals[st.modal] || modals.trial;
    if (st.modal && !this.openedAt) { this.openedAt = Date.now(); }
    if (!st.modal) { this.openedAt = null; }
    return {
      isHome: isHome,
      hasSk: page.sk.length > 0,
      hasSec: page.sec.length > 0,
      hasClose: !!page.close,
      hasLk: page.lk.length > 0,
      hasS: !!page.s,
      noS: !page.s,
      hasImg: !!page.img,
      imgAlt: page.imgCap ? page.imgCap : page.u.indexOf('/plataforma-propia') === 0 ? 'Captura del programa de gestión ContrataLux' : 'Captura de ' + page.l.charAt(0).toLowerCase() + page.l.slice(1) + ' en ContrataLux',
      hasF: page.f.length > 0,
      hasB: page.b.length > 0,
      fTitle: t === 'modulo' ? 'Qué incluye' : 'Lo que tienes',
      hasMods: page.mods.length > 0,
      hasZl: !!(page.zl && page.zl.length),
      hasSrc: !!(page.src && page.src.length),
      updText: (function (d) { const m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']; const p = (d || '').split('-'); return p.length === 3 ? (+p[2]) + ' de ' + m[+p[1] - 1] + ' de ' + p[0] : ''; })(page.upd),
      taxText: (/^\/zonas\/(canarias|ceuta|melilla)/.test(page.u)) ? '(impuestos indirectos no incluidos)' : '+ IVA',
      hasVid: !!page.vid,
      hasImg2: !!page.img2,
      indexText: page.ni ? 'noindex hasta redactar su contenido propio' : 'index',
      isInner: !isHome,
      page: page,
      crumbs: crumbs,
      isArticle: ['recurso', 'glosario', 'comercializadora', 'comparativa'].indexOf(t) !== -1,
      isGlossary: t === 'glosario',
      isCalc: t === 'herramienta',
      calcDone: st.calcDone,
      calc: (e) => { e.preventDefault(); this.setState({ calcDone: true }); },
      isZone: t === 'zona' || (t === 'hub' && seg === 'zonas' && page.u !== '/zonas'),
      isCompare: t === 'comparativa',
      isLegal: t === 'legal',
      hasSections: sections.length > 0,
      sections: sections,
      hasChildren: children.length > 0,
      children: children,
      childrenTitle: CHILD_TITLE[seg] || 'En esta sección',
      hasFaq: t !== 'legal' && page.fq.length > 0 || (t !== 'legal' && t !== 'hub'),
      faqs: page.fq.length >= 3 ? page.fq : page.fq.concat(FAQS).slice(0, 4),
      hasRelated: related.length > 0,
      related: related,
      cookiesOpen: st.cookies === 'open',
      configOpen: st.config,
      analytics: st.analytics,
      ads: st.ads,
      modalOpen: !!st.modal,
      formPending: !!st.modal && !st.sent,
      formSent: !!st.modal && st.sent,
      modalTitle: m.title, modalText: m.text, modalButton: m.button,
      toastOpen: !!st.toast,
      toastText: st.toast || '',
      acceptAll: () => this.setState({ cookies: 'closed', config: false, analytics: true, ads: true }),
      rejectAll: () => this.setState({ cookies: 'closed', config: false, analytics: false, ads: false }),
      toggleConfig: () => this.setState({ config: !st.config }),
      toggleAnalytics: () => this.setState({ analytics: !st.analytics }),
      toggleAds: () => this.setState({ ads: !st.ads }),
      saveConfig: () => this.setState({ cookies: 'closed', config: false }),
      closeModal: () => { this.openedAt = null; this.setState({ modal: null, sent: false }); },
      submitForm: (e) => {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        const now = Date.now();
        // Antispam 1: honeypot (campo oculto que solo rellenan los bots)
        if ((data.get('_honey') || '').toString().trim() !== '') { this.setState({ sent: true, sendError: false }); return; }
        // Antispam 2: envío demasiado rápido (menos de 4 s desde que se abrió el formulario)
        if (this.openedAt && now - this.openedAt < 4000) { this.setState({ sent: true, sendError: false }); return; }
        // Antispam 3: texto con demasiados enlaces
        const txt = ['Nombre', 'Asesoría', 'Empresa'].map(function (k) { return (data.get(k) || '').toString(); }).join(' ');
        if ((txt.match(/https?:\/\/|www\./gi) || []).length > 1) { this.setState({ sendError: true }); return; }
        // Antispam 4: un envío por minuto desde el mismo navegador
        let last = 0;
        try { last = parseInt(window.localStorage.getItem('clx_form_last') || '0', 10) || 0; } catch (err) { last = this.lastSent || 0; }
        if (now - last < 60000) { this.setState({ sent: true, sendError: false }); return; }
        try { window.localStorage.setItem('clx_form_last', String(now)); } catch (err) { this.lastSent = now; }
        this.setState({ sent: true, sendError: false });
        fetch('https://formsubmit.co/ajax/info@contratalux.com', { method: 'POST', headers: { Accept: 'application/json' }, body: data })
          .then((r) => { if (!r.ok) throw new Error('envío'); })
          .catch(() => this.setState({ sendError: true }));
      },
      sendError: !!st.sendError,
      closeToast: () => this.setState({ toast: null }),
      intercept: (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        const href = a.getAttribute('href') || '';
        const label = (a.textContent || '').trim();
        if (href === '#cookies') { e.preventDefault(); this.setState({ cookies: 'open', config: true }); return; }
        if (href.indexOf('/registro') !== -1 || href === '/prueba-gratis') { e.preventDefault(); this.setState({ modal: 'trial', sent: false }); return; }
        if (href === '/demo') { e.preventDefault(); this.setState({ modal: 'demo', sent: false }); return; }
        if ((href === '#contacto' || href === '/contacto') && (label.indexOf('asesor') !== -1 || href === '/contacto')) { e.preventDefault(); this.setState({ modal: 'asesor', sent: false }); return; }
        if (href.indexOf('https://app.') === 0) { e.preventDefault(); this.setState({ toast: 'Aquí entrarán tus clientes a la app (app.contratalux.com).' }); return; }
        if (href === '/precios') { e.preventDefault(); this.go('/', 'precios'); return; }
        if (href.charAt(0) === '#') {
          if (st.route !== '/') { e.preventDefault(); this.go('/', href.slice(1)); }
          return;
        }
        if (href.charAt(0) === '/') {
          e.preventDefault();
          if (BY_URL[href]) { this.go(href); }
          else { this.setState({ toast: 'Esta dirección no está en el mapa SEO: ' + href }); }
        }
      }
    };
  }
}
