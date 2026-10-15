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
  { q: '¿Se puede probar ContrataLux gratis?', a: 'Sí. ContrataLux se puede probar 7 días gratis con todas las funciones.' },
  { q: '¿Cuánto cuesta ContrataLux?', a: 'ContrataLux cuesta desde 90 € al mes + IVA para 1 o 2 usuarios (plan Básico) y 195 € al mes + IVA hasta 10 usuarios (plan Equipo). Precios vigentes desde octubre de 2026.' },
  { q: '¿Qué tipos de contrato gestiona ContrataLux?', a: 'ContrataLux gestiona contratos de luz, gas, dual, fibra, alarmas y CAEs, con más de 30 comercializadoras precargadas.' }
];
const IMG_D = {'bot-atr': [1600, 900], 'caes': [1600, 900], 'calc-resultado': [1568, 560], 'calculadora-ahorro': [1600, 900], 'comercializadoras': [1600, 900], 'comisionadores-qr': [1600, 900], 'comparador': [1680, 620], 'configuracion': [1600, 900], 'consultas': [1600, 900], 'contratos-tabla': [1600, 900], 'dashboard-2': [1600, 900], 'dashboard': [1600, 900], 'documentos': [1600, 900], 'exportar-datos': [1600, 900], 'ficha-contrato': [1600, 900], 'grupos-permisos': [1600, 900], 'kanban': [1600, 900], 'lead-ficha': [1600, 900], 'liquidaciones': [1600, 900], 'mercado-energetico': [1600, 900], 'pix': [1241, 1333], 'portal-ficha': [1640, 560], 'portal-login': [1000, 620], 'registro-sucesos': [1600, 900], 'usuarios': [1600, 900]};
function dimsOf(path) {
  const m = /^\/assets\/([a-z0-9-]+)\.webp$/.exec(path || '');
  return (m && IMG_D[m[1]]) || [1600, 900];
}
function srcsetFor(path) {
  const m = /^\/assets\/([a-z0-9-]+)\.webp$/.exec(path || '');
  const d = m && IMG_D[m[1]];
  if (!d) return '';
  const w = d[0];
  return w > 1100 ? '/assets/' + m[1] + '-640.webp 640w, /assets/' + m[1] + '-1024.webp 1024w, ' + path + ' ' + w + 'w' : path + ' ' + w + 'w';
}
const CHILD_TITLE = { suministros: 'Suministros que gestionas con ContrataLux', zonas: 'Elige tu zona', recursos: 'Artículos', modulos: 'Todas las funciones', soluciones: 'Elige tu perfil', herramientas: 'Herramientas gratis', comparativas: 'Comparativas', integraciones: 'Comercializadoras', 'plataforma-propia': 'Todo sobre la plataforma propia' };


/* ---------- Calculadoras gratis (/herramientas/*): los precios los pone el usuario; no hay precios precargados ---------- */
const IEE_PCT = 5.11269632;
function fEur(n) { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n); }
function fNum(n, d) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: d == null ? 2 : d }).format(n); }
function z(x) { return isNaN(x) ? 0 : x; }
function F(k, l, ph, v) { return { k: k, l: l, ph: ph || '', v: v == null ? '' : String(v) }; }
function periods(pfx, n, lab) { const a = []; for (let i = 1; i <= n; i++) a.push(F(pfx + i, lab + ' P' + i)); return a; }
function taxes() { return { h: 'Impuestos', f: [F('alq', 'Alquiler del contador (€ en el periodo)', '0'), F('iee', 'Impuesto eléctrico (%)', '', IEE_PCT), F('iva', 'IVA (%)', '', 21)] }; }
function elecTool(np, ne, title, lead, extra) {
  return {
    title: title, lead: lead,
    groups: [{ h: 'Periodo de facturación', f: [F('dias', 'Días facturados', '30')] },
      { h: 'Potencia contratada (kW)', f: periods('p', np, 'Potencia') },
      { h: 'Precio de potencia (€/kW y día)', f: periods('pp', np, 'Precio') },
      { h: 'Consumo (kWh)', f: periods('e', ne, 'Consumo') },
      { h: 'Precio de energía (€/kWh)', f: periods('pe', ne, 'Precio') }, taxes()],
    calc: function (n) {
      if (!(n.dias > 0)) return { err: 'Indica los días facturados.' };
      let pot = 0, ene = 0, kwh = 0;
      for (let i = 1; i <= np; i++) pot += z(n['p' + i]) * z(n['pp' + i]) * n.dias;
      for (let i = 1; i <= ne; i++) { ene += z(n['e' + i]) * z(n['pe' + i]); kwh += z(n['e' + i]); }
      if (pot + ene <= 0) return { err: 'Rellena al menos la potencia y su precio o el consumo y su precio.' };
      const iee = (pot + ene) * z(n.iee) / 100, alq = z(n.alq), iva = (pot + ene + iee + alq) * z(n.iva) / 100, tot = pot + ene + iee + alq + iva;
      const rows = [{ l: 'Término de potencia', v: fEur(pot) }, { l: 'Término de energía (' + fNum(kwh, 0) + ' kWh)', v: fEur(ene) },
        { l: 'Impuesto eléctrico', v: fEur(iee) }, { l: 'Alquiler del contador', v: fEur(alq) }, { l: 'IVA', v: fEur(iva) }, { l: 'Total estimado', v: fEur(tot), b: true }];
      if (kwh > 0) rows.push({ l: 'Precio medio con impuestos', v: fNum(tot / kwh, 4) + ' €/kWh' });
      return { rows: rows };
    },
    note: 'Estimación con los datos que introduces. No incluye ' + (extra || '') + 'bono social, mínimos del impuesto eléctrico ni otros conceptos que pueda llevar la factura. Impuesto eléctrico según la Ley 38/1992; el IVA general es del 21 % (en Canarias, Ceuta y Melilla se aplican IGIC o IPSI).'
  };
}
const TOOLS = {
  '/herramientas/comparador-de-tarifas': {
    title: 'Compara hasta tres ofertas', lead: 'Pon el consumo anual y las potencias del cliente y, para cada oferta, sus precios. Si una oferta tiene precios de energía por periodos, usa el precio medio ponderado por el consumo.',
    groups: [{ h: 'Datos del cliente', f: [F('c', 'Consumo anual (kWh)'), F('p1', 'Potencia P1 (kW)'), F('p2', 'Potencia P2 (kW)')] },
      { h: 'Oferta A', f: [F('a1', 'Potencia P1 (€/kW y día)'), F('a2', 'Potencia P2 (€/kW y día)'), F('ae', 'Energía (€/kWh)')] },
      { h: 'Oferta B', f: [F('b1', 'Potencia P1 (€/kW y día)'), F('b2', 'Potencia P2 (€/kW y día)'), F('be', 'Energía (€/kWh)')] },
      { h: 'Oferta C (opcional)', f: [F('c1', 'Potencia P1 (€/kW y día)'), F('c2', 'Potencia P2 (€/kW y día)'), F('ce', 'Energía (€/kWh)')] }],
    calc: function (n) {
      if (!(n.c > 0)) return { err: 'Indica el consumo anual en kWh.' };
      const offers = [];
      ['a', 'b', 'c'].forEach(function (o) {
        if (!(n[o + 'e'] > 0) || isNaN(n[o + '1'])) return; // oferta sin precios: no se compara (evita costes de 0 €)
        const cost = (z(n.p1) * z(n[o + '1']) + z(n.p2) * z(n[o + '2'])) * 365 + n.c * n[o + 'e'];
        offers.push({ n: 'Oferta ' + o.toUpperCase(), c: cost });
      });
      if (offers.length < 2) return { err: 'Rellena los precios de al menos dos ofertas (potencia P1 y energía como mínimo).' };
      offers.sort(function (x, y) { return x.c - y.c; });
      const best = offers[0];
      const rows = offers.map(function (o, i) { return { l: o.n + (i === 0 ? ' · la más barata' : ' · ' + fEur(o.c - best.c) + ' más al año'), v: fEur(o.c) + ' al año', b: i === 0 }; });
      return { rows: rows };
    },
    note: 'Coste anual sin impuestos: potencia × kW × 365 días + energía × consumo. Para la factura completa con impuestos usa la calculadora de la tarifa 2.0TD, 3.0TD o 6.1TD.'
  },
  '/herramientas/calculadora-factura-2-0td': elecTool(2, 3, 'Calcula una factura 2.0TD', 'La 2.0TD es la tarifa de acceso de hasta 15 kW: dos periodos de potencia (P1 punta y P2 valle) y tres de energía (P1 punta, P2 llano y P3 valle). Copia los datos de la factura.'),
  '/herramientas/calculadora-3-0td': elecTool(6, 6, 'Calcula una factura 3.0TD', 'La 3.0TD es la tarifa de acceso de baja tensión por encima de 15 kW, con seis periodos de potencia y seis de energía. Deja vacíos los periodos que no tengan consumo.', 'excesos de potencia, energía reactiva, '),
  '/herramientas/calculadora-6-1td': elecTool(6, 6, 'Calcula una factura 6.1TD', 'La 6.1TD es la tarifa de acceso de alta tensión entre 1 y 30 kV, con seis periodos de potencia y seis de energía. Copia los datos de la factura del cliente.', 'excesos de potencia, energía reactiva, '),
  '/herramientas/calculadora-gas': {
    title: 'Calcula una factura de gas', lead: 'Copia los datos de la factura. Si el consumo viene en m³, la factura indica el factor de conversión a kWh.',
    groups: [{ h: 'Periodo y consumo', f: [F('dias', 'Días facturados', '60'), F('kwh', 'Consumo (kWh)')] },
      { h: 'Precios', f: [F('tf', 'Término fijo (€/día)'), F('pe', 'Término variable (€/kWh)'), F('alq', 'Alquiler del contador (€ en el periodo)', '0')] },
      { h: 'Impuestos', f: [F('ih', 'Impuesto de hidrocarburos (€/kWh)', 'el de tu factura'), F('iva', 'IVA (%)', '', 21)] }],
    calc: function (n) {
      if (!(n.dias > 0) || !(n.kwh >= 0) || isNaN(n.pe)) return { err: 'Indica los días, el consumo y el término variable.' };
      const fijo = z(n.tf) * n.dias, vari = n.kwh * n.pe, ih = n.kwh * z(n.ih), alq = z(n.alq), iva = (fijo + vari + ih + alq) * z(n.iva) / 100;
      const anual = n.kwh / n.dias * 365;
      const RL = [[5000, 'RL.1'], [15000, 'RL.2'], [50000, 'RL.3'], [300000, 'RL.4'], [1500000, 'RL.5'], [5000000, 'RL.6']];
      let rl = 'RL.7 o superior';
      for (let i = 0; i < RL.length; i++) if (anual <= RL[i][0]) { rl = RL[i][1]; break; }
      return { rows: [{ l: 'Término fijo', v: fEur(fijo) }, { l: 'Término variable', v: fEur(vari) }, { l: 'Impuesto de hidrocarburos', v: fEur(ih) },
        { l: 'Alquiler del contador', v: fEur(alq) }, { l: 'IVA', v: fEur(iva) }, { l: 'Total estimado', v: fEur(fijo + vari + ih + alq + iva), b: true },
        { l: 'Consumo anual estimado', v: fNum(anual, 0) + ' kWh · peaje ' + rl }] };
    },
    note: 'Estimación con los datos que introduces. El tramo de peaje sale de extrapolar el consumo del periodo a un año; el gas tiene mucha estacionalidad, así que compruébalo con el consumo anual real (Circular 6/2020 de la CNMC).'
  },
  '/herramientas/indexada-o-fija': {
    title: 'Compara fija e indexada', lead: 'Pon el consumo anual del negocio, el precio de energía de la oferta fija y dos escenarios para la indexada: uno con el mercado bajo y otro con el mercado alto.',
    groups: [{ h: 'Consumo', f: [F('c', 'Consumo anual (kWh)')] },
      { h: 'Precios de energía (€/kWh)', f: [F('fx', 'Oferta fija'), F('ib', 'Indexada, escenario bajo'), F('ia', 'Indexada, escenario alto')] }],
    calc: function (n) {
      if (!(n.c > 0) || isNaN(n.fx) || isNaN(n.ib) || isNaN(n.ia)) return { err: 'Rellena el consumo y los tres precios.' };
      const cf = n.c * n.fx, cb = n.c * n.ib, ca = n.c * n.ia;
      let v;
      if (ca <= cf) v = 'La indexada sale mejor incluso con el mercado alto.';
      else if (cb >= cf) v = 'La fija sale mejor incluso con el mercado bajo.';
      else v = 'Depende del mercado: con la indexada ahorrarías hasta ' + fEur(cf - cb) + ' o pagarías hasta ' + fEur(ca - cf) + ' más al año.';
      return { rows: [{ l: 'Oferta fija', v: fEur(cf) + ' al año' }, { l: 'Indexada, mercado bajo', v: fEur(cb) + ' al año' }, { l: 'Indexada, mercado alto', v: fEur(ca) + ' al año' }, { l: 'Conclusión', v: v, b: true }] };
    },
    note: 'Solo compara el término de energía, sin impuestos. La potencia suele costar lo mismo en las dos ofertas; si no es así, súmala aparte.'
  },
  '/herramientas/optimizar-potencia': {
    title: 'Calcula la potencia que sobra', lead: 'Usa la potencia máxima registrada (maxímetro) de los últimos 12 meses. Si hay varios periodos, haz el cálculo para cada uno.',
    groups: [{ h: 'Datos del suministro', f: [F('pc', 'Potencia contratada (kW)'), F('mx', 'Potencia máxima registrada (kW)'), F('pp', 'Precio de potencia (€/kW y día)'), F('mg', 'Margen de seguridad (%)', '', 10)] }],
    calc: function (n) {
      if (!(n.pc > 0) || !(n.mx > 0) || !(n.pp > 0)) return { err: 'Rellena la potencia contratada, la máxima registrada y el precio.' };
      const rec = n.mx * (1 + z(n.mg) / 100);
      if (rec >= n.pc) return { rows: [{ l: 'Potencia recomendada', v: fNum(rec, 2) + ' kW' }, { l: 'Conclusión', v: 'La potencia contratada está ajustada o se queda corta: no conviene bajarla.', b: true }] };
      return { rows: [{ l: 'Potencia recomendada', v: fNum(rec, 2) + ' kW' }, { l: 'Potencia que sobra', v: fNum(n.pc - rec, 2) + ' kW' }, { l: 'Ahorro estimado sin impuestos', v: fEur((n.pc - rec) * n.pp * 365) + ' al año', b: true }] };
    },
    note: 'Redondea al alza a la potencia normalizada más cercana. Antes de bajar potencia, comprueba con la distribuidora las condiciones y el coste del cambio.'
  },
  '/herramientas/calculadora-excedentes': {
    title: 'Calcula la compensación', lead: 'En la compensación simplificada, la energía vertida se descuenta del término de energía de la factura, sin que este baje de cero.',
    groups: [{ h: 'Datos del periodo', f: [F('ex', 'Excedentes vertidos (kWh)'), F('pc', 'Precio de compensación (€/kWh)'), F('te', 'Término de energía de la factura (€)')] }],
    calc: function (n) {
      if (!(n.ex >= 0) || isNaN(n.pc) || isNaN(n.te)) return { err: 'Rellena los tres datos.' };
      const comp = n.ex * n.pc, desc = Math.min(comp, n.te), sobra = comp - desc;
      const rows = [{ l: 'Valor de los excedentes', v: fEur(comp) }, { l: 'Descuento en la factura', v: fEur(desc), b: true }, { l: 'Término de energía tras compensar', v: fEur(n.te - desc) }];
      if (sobra > 0) rows.push({ l: 'Excedentes sin compensar', v: fEur(sobra) + ' (aquí ayuda una batería virtual, si la oferta la tiene)' });
      return { rows: rows };
    },
    note: 'Cálculo antes de impuestos según la compensación simplificada del Real Decreto 244/2019. Cada comercializadora fija su precio de compensación.'
  },
  '/herramientas/calculadora-comisiones': {
    title: 'Calcula tu comisión neta', lead: 'Pon lo que paga la comercializadora por contrato, lo que se lleva el comercial y las bajas que esperas dentro del periodo de retrocomisión.',
    groups: [{ h: 'Contratos', f: [F('n', 'Número de contratos'), F('cb', 'Comisión bruta por contrato (€)')] },
      { h: 'Reparto y riesgo', f: [F('pc', 'Parte del comercial (%)', '0'), F('pb', 'Bajas previstas (%)', '0'), F('rt', 'Comisión devuelta por baja (%)', '', 100)] }],
    calc: function (n) {
      if (!(n.n > 0) || !(n.cb > 0)) return { err: 'Indica el número de contratos y la comisión bruta.' };
      const bruto = n.n * n.cb, com = bruto * z(n.pc) / 100, retro = n.n * z(n.pb) / 100 * n.cb * z(n.rt) / 100;
      return { rows: [{ l: 'Comisión bruta', v: fEur(bruto) }, { l: 'Para el comercial', v: fEur(com) }, { l: 'Retrocomisiones previstas', v: fEur(retro) }, { l: 'Neto para la asesoría', v: fEur(bruto - com - retro), b: true }] };
    },
    note: 'Supone que la asesoría asume toda la retrocomisión. Si el comercial devuelve su parte de las bajas, tu neto es mayor.'
  },
  '/herramientas/estudio-ahorro': {
    title: 'Calcula el ahorro del estudio', lead: 'Pon lo que paga hoy el cliente al año y lo que pagaría con tu propuesta, los dos con impuestos o los dos sin impuestos.',
    groups: [{ h: 'Costes anuales (€)', f: [F('ca', 'Coste actual'), F('cp', 'Coste con la propuesta'), F('an', 'Años del estudio', '', 1)] }],
    calc: function (n) {
      if (!(n.ca > 0) || isNaN(n.cp)) return { err: 'Rellena el coste actual y el de la propuesta.' };
      const ah = n.ca - n.cp, an = n.an > 0 ? n.an : 1;
      return { rows: [{ l: 'Ahorro anual', v: fEur(ah), b: true }, { l: 'Ahorro en porcentaje', v: fNum(ah / n.ca * 100, 1) + ' %' }, { l: 'Ahorro en ' + fNum(an, 0) + (an === 1 ? ' año' : ' años'), v: fEur(ah * an) }] };
    },
    note: 'Presenta el ahorro con los mismos supuestos en los dos lados (mismo consumo, mismo periodo e impuestos incluidos o excluidos en ambos).'
  }
};

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { route: '/', cookies: 'open', config: false, analytics: false, ads: false, modal: null, sent: false, toast: null, toolVals: {}, toolRes: null, toolErr: '' };
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
    this.setState({ route: url, toast: null, toolVals: {}, toolRes: null, toolErr: '' });
  }
  renderVals() {
    const st = this.state;
    const page = BY_URL[st.route] || BY_URL['/'];
    const isHome = page.u === '/';
    const crumbs = [];
    let cur = BY_URL[page.p];
    while (cur && cur.u !== page.u) {
      crumbs.unshift({ u: cur.u, l: cur.u === '/' ? 'Inicio' : (cur.bl || cur.l) });
      if (cur.u === '/') break;
      cur = BY_URL[cur.p];
    }
    const children = isHome ? [] : PAGES.filter(function (p) { return p.p === page.u && p.u !== page.u; });
    // Relacionadas: las 6 siguientes hermanas en orden circular, para que todas reciban enlaces de varias hermanas y no solo de su índice.
    const sibs = isHome ? [] : PAGES.filter(function (p) { return p.p === page.p && p.t !== 'especial' && p.t !== 'legal'; });
    const at = sibs.findIndex(function (p) { return p.u === page.u; });
    const related = isHome ? [] : at === -1 ? sibs.filter(function (p) { return p.u !== page.u; }).slice(0, 6)
      : Array.from({ length: Math.min(6, sibs.length - 1) }, function (_, k) { return sibs[(at + 1 + k) % sibs.length]; });
    const t = page.t;
    const isArt = ['recurso', 'glosario', 'comercializadora', 'comparativa'].indexOf(t) !== -1 || page.u === '/implantacion';
    const isInteg = t === 'integracion' || page.u === '/integraciones';
    const seg = page.u.split('/')[1] || '';
    const pqs = page.qs || [];
    const base = pqs.concat((SECTIONS[t] || []).filter(function (h) { return pqs.indexOf(h) === -1; }));
    const sections = page.s ? [] : base.slice(0, Math.max(3, pqs.length)).map(function (h) { return { h: h }; });
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
      hasSk: (page.sk || []).length > 0,
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
      updText: (function (d) { const m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']; const p = (d || '').slice(0, 10).split('-'); return p.length === 3 ? (+p[2]) + ' de ' + m[+p[1] - 1] + ' de ' + p[0] : ''; })(page.upd),
      taxText: (/^\/zonas\/(canarias|ceuta|melilla)/.test(page.u)) ? '(impuestos indirectos no incluidos)' : '+ IVA',
      hasVid: !!page.vid,
      hasImg2: !!page.img2,
      indexText: page.ni ? 'noindex hasta redactar su contenido propio' : 'index',
      isInner: !isHome,
      page: page,
      crumbs: crumbs,
      isArticle: isArt,
      showUpd: !isHome && !isArt,
      crumbLast: page.bl || page.l,
      isIntegration: isInteg,
      integrationNote: t === 'integracion' ? page.l + ' es una marca de su titular y se cita en esta página solo para explicar cómo trabaja ContrataLux con esa compañía. ContrataLux es un software independiente: nombrar a una comercializadora no implica un acuerdo oficial con ella, salvo que se indique expresamente.' : 'Las comercializadoras citadas son marcas de sus respectivos titulares. ContrataLux es un software independiente: nombrarlas no implica un acuerdo oficial con ellas, salvo que se indique expresamente.',
      imgW: dimsOf(page.img)[0],
      imgH: dimsOf(page.img)[1],
      img2W: dimsOf(page.img2)[0],
      img2H: dimsOf(page.img2)[1],
      imgSrcset: srcsetFor(page.img),
      img2Srcset: srcsetFor(page.img2),
      isGlossary: t === 'glosario',
      hasTool: !!TOOLS[page.u],
      tool: TOOLS[page.u] ? { title: TOOLS[page.u].title, lead: TOOLS[page.u].lead, note: TOOLS[page.u].note, groups: TOOLS[page.u].groups.map(function (g) { return { h: g.h, f: g.f.map(function (x) { const sv = (st.toolVals || {})[x.k]; return { k: x.k, l: x.l, ph: x.ph, v: sv != null ? sv : x.v }; }) }; }) } : null,
      hasToolRes: !!(st.toolRes && st.toolRes.length),
      toolRes: (st.toolRes || []).map(function (r) { return { l: r.l, v: r.v, st: r.b ? 'margin: 0; font-weight: 700; font-size: 20px; color: #13202E' : 'margin: 0; font-weight: 600; color: #22313F' }; }),
      hasToolErr: !!st.toolErr,
      toolErr: st.toolErr || '',
      runTool: (e) => {
        e.preventDefault();
        const T = TOOLS[page.u]; if (!T) return;
        const fd = new FormData(e.target); const vals = {}; const n = {};
        T.groups.forEach(function (g) { g.f.forEach(function (x) { const v = (fd.get(x.k) || '').toString().trim(); vals[x.k] = v; n[x.k] = v === '' ? NaN : parseFloat(v.replace(',', '.')); }); });
        const r = T.calc(n);
        this.setState({ toolVals: vals, toolRes: r.rows || null, toolErr: r.err || '' });
      },
      printTool: () => { window.print(); },
      isZone: t === 'zona' || (t === 'hub' && seg === 'zonas' && page.u !== '/zonas'),
      isCompare: t === 'comparativa',
      isLegal: t === 'legal',
      hasSections: sections.length > 0,
      sections: sections,
      hasChildren: children.length > 0,
      children: children,
      childrenTitle: CHILD_TITLE[seg] || 'En esta sección',
      hasFaq: t !== 'legal' && page.fq.length > 0 || (t !== 'legal' && t !== 'hub'),
      faqs: page.fq.length >= 3 ? page.fq : page.fq.concat(FAQS.filter(function (f) { return !(page.u === '/prueba-gratis' && f.q.indexOf('probar') !== -1); })).slice(0, 4),
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
        if (href.charAt(0) === '#') {
          e.preventDefault();
          if (st.route !== '/') { this.go('/', href.slice(1)); return; }
          const target = document.getElementById(href.slice(1));
          if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
