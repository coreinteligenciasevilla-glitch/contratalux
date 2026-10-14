// Build de contratalux.com: genera una página HTML estática por ruta en public/.
// Uso: npm run build   (variable opcional BUILD_DATE=AAAA-MM-DD para fijar la fecha de cambios)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public');
const read = (f) => readFileSync(join(SRC, f), 'utf8');

const SITE = JSON.parse(read('site.json'));
const D = SITE.domain;
const TEMPLATE = read('template.html');
const RUNTIME = read('runtime.js');
const COMPONENT = read('component.js');
const BASECSS = read('base.css');
const PAGES = JSON.parse(read('pages.json'));
const TODAY = process.env.BUILD_DATE || new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());

// ---------- fechas reales de cambio (hash del contenido por ruta) ----------
const STATE_F = join(SRC, 'estado-paginas.json');
const state = existsSync(STATE_F) ? JSON.parse(readFileSync(STATE_F, 'utf8')) : {};
for (const p of PAGES) {
  const { upd, ...rest } = p;
  const h = createHash('sha256').update(JSON.stringify(rest)).digest('hex').slice(0, 16);
  if (!state[p.u] || state[p.u].hash !== h) state[p.u] = { hash: h, upd: TODAY };
  p.upd = state[p.u].upd;
}
for (const u of Object.keys(state)) if (!PAGES.some((p) => p.u === u)) delete state[u];
writeFileSync(STATE_F, JSON.stringify(state, null, 1) + '\n');

const BY_URL = Object.fromEntries(PAGES.map((p) => [p.u, p]));
const pagesJs = JSON.stringify(PAGES).replace(/</g, '\\u003c');

// ---------- pre-render con el mismo runtime que usa el navegador ----------
const dom = new JSDOM(`<!doctype html><html><body><div id="app"></div><template id="tpl">${TEMPLATE}</template></body></html>`, { runScripts: 'outside-only' });
const w = dom.window;
w.eval(`${RUNTIME}\nconst PAGES = ${pagesJs};\n${COMPONENT}\n
ROOT = document.getElementById('app'); TPL = document.getElementById('tpl');
comp = new Component({}); comp.componentDidUpdate = null;
const INIT = Object.assign({}, comp.state);
window.prerender = function (u) { comp.state = Object.assign({}, INIT, { route: u, cookies: 'closed' }); render(); return ROOT.innerHTML; };`);

// ---------- recursos versionados ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'static'), OUT, { recursive: true });

const FONTS = [['Kanit', 500], ['Kanit', 600], ['Kanit', 700], ['Figtree', 400], ['Figtree', 500], ['Figtree', 600], ['Figtree', 700]];
const css = FONTS.map(([f, wgt]) => `@font-face{font-family:'${f}';font-style:normal;font-weight:${wgt};font-display:swap;src:url(/assets/fonts/${f.toLowerCase()}-latin-${wgt}-normal.woff2) format('woff2')}`).join('\n') + '\n' + BASECSS;
const ver = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
const CSS_V = ver(css);
writeFileSync(join(OUT, 'assets/site.css'), css);

const CLIENT = `${RUNTIME}
const PAGES = ${pagesJs};
const TPL_HTML = ${JSON.stringify(TEMPLATE).replace(/</g, '\\u003c')};
${COMPONENT}
(function () {
  var t = document.createElement('template'); t.innerHTML = TPL_HTML; TPL = t; ROOT = document.getElementById('app');
  comp = new Component({});
  var path = location.pathname.replace(/\\.html$/, '').replace(/\\/index$/, '/');
  if (path.length > 1) path = path.replace(/\\/$/, '');
  comp.state.route = BY_URL[path] ? path : '/';
  if (location.hash) comp.anchor = location.hash.slice(1);
  try { var ck = JSON.parse(localStorage.getItem('clx_cookies') || 'null'); if (ck) { comp.state.cookies = 'closed'; comp.state.analytics = !!ck.a; comp.state.ads = !!ck.d; } } catch (e) {}
  var set = comp.setState.bind(comp);
  comp.setState = function (p) { set(p); if (p && p.cookies === 'closed') { try { localStorage.setItem('clx_cookies', JSON.stringify({ a: comp.state.analytics, d: comp.state.ads })); } catch (e) {} } };
  var go = comp.go.bind(comp);
  comp.go = function (url, anchor) { if (url === comp.state.route) go(url, anchor); else location.href = url + (anchor ? '#' + anchor : ''); };
  render();
})();
`;
const JS_V = ver(CLIENT);
writeFileSync(join(OUT, 'assets/app.js'), CLIENT);

// ---------- utilidades ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const url = (u) => D + (u === '/' ? '/' : u);
const abs = (p) => (p && p.startsWith('/') ? D + p : p);
const isGuide = (p) => p.u.startsWith('/recursos/') && ['recurso', 'glosario', 'comercializadora'].includes(p.t);
function crumbs(p) {
  const out = []; let cur = BY_URL[p.p];
  while (cur && cur.u !== p.u) { out.unshift({ u: cur.u, l: cur.u === '/' ? 'Inicio' : cur.l }); if (cur.u === '/') break; cur = BY_URL[cur.p]; }
  out.push({ u: p.u, l: p.l });
  return out;
}

// ---------- JSON-LD ----------
const ORG = { '@type': 'Organization', '@id': D + '/#org', name: SITE.name, legalName: SITE.legalName, url: D + '/',
  logo: { '@type': 'ImageObject', url: D + '/assets/logo-contratalux.png', width: 640, height: 206 },
  address: { '@type': 'PostalAddress', ...SITE.address }, telephone: SITE.telephone };
if (SITE.email) ORG.email = SITE.email;
if (SITE.taxID) ORG.taxID = SITE.taxID;
if (SITE.sameAs && SITE.sameAs.length) ORG.sameAs = SITE.sameAs;
const WEB = { '@type': 'WebSite', '@id': D + '/#web', url: D + '/', name: SITE.name, inLanguage: 'es-ES', publisher: { '@id': D + '/#org' } };
const APP = { '@type': 'SoftwareApplication', '@id': D + '/#app', name: SITE.name, url: D + '/', applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
  description: SITE.description, publisher: { '@id': D + '/#org' },
  offers: SITE.plans.map((pl) => ({ '@type': 'Offer', name: pl.name, description: pl.description, price: pl.price, priceCurrency: 'EUR', url: D + '/precios',
    priceSpecification: { '@type': 'UnitPriceSpecification', price: pl.price, priceCurrency: 'EUR', unitCode: 'MON', valueAddedTaxIncluded: false } })) };

function jsonld(p) {
  const g = [];
  const page = { '@type': p.t === 'hub' ? 'CollectionPage' : 'WebPage', '@id': url(p.u) + '#page', url: url(p.u), name: p.ti, description: p.md, inLanguage: 'es-ES',
    isPartOf: { '@id': D + '/#web' }, about: { '@id': D + '/#app' }, publisher: { '@id': D + '/#org' }, dateModified: p.upd };
  if (p.u === '/') {
    g.push(ORG, WEB, APP, page);
    const v = SITE.video;
    if (v && v.uploadDate) g.push({ '@type': 'VideoObject', name: v.name, description: v.description, contentUrl: abs(v.url), thumbnailUrl: abs(v.thumbnail), uploadDate: v.uploadDate });
  } else {
    page.breadcrumb = { '@id': url(p.u) + '#breadcrumb' };
    g.push(page, { '@type': 'BreadcrumbList', '@id': url(p.u) + '#breadcrumb',
      itemListElement: crumbs(p).map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.l, item: url(c.u) })) });
    if (isGuide(p)) g.push({ '@type': 'Article', '@id': url(p.u) + '#article', headline: p.h1, description: p.md, mainEntityOfPage: { '@id': url(p.u) + '#page' },
      author: { '@id': D + '/#org' }, publisher: { '@id': D + '/#org' }, dateModified: p.upd, image: abs(p.img || SITE.ogImage), inLanguage: 'es-ES' });
    if (p.u === '/herramientas/comparador-de-tarifas') g.push({ '@type': 'WebApplication', name: p.h1, url: url(p.u), applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: { '@id': D + '/#org' } });
  }
  const out = JSON.stringify({ '@context': 'https://schema.org', '@graph': g });
  const bad = out.match(/\[[^\]"{}]*\]|\{[a-z_]+\}|TODO|AAAA-MM-DD/);
  if (bad) throw new Error(`Marcador sin rellenar en el JSON-LD de ${p.u}: ${bad[0]}`);
  return out.replace(/</g, '\\u003c');
}

// ---------- head ----------
function head(p) {
  const og = abs(SITE.ogImage);
  const type = p.u.startsWith('/recursos/') ? 'article' : 'website';
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.ti)}</title>
<meta name="description" content="${esc(p.md)}">
<link rel="canonical" href="${url(p.u)}">
${p.ni ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${esc(p.ti)}">
<meta property="og:description" content="${esc(p.md)}">
<meta property="og:url" content="${url(p.u)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.ti)}">
<meta name="twitter:description" content="${esc(p.md)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="/assets/favicon.png">
<link rel="preload" href="/assets/fonts/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/kanit-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
${p.u === '/' ? '<link rel="preload" as="image" href="/assets/dashboard.webp" fetchpriority="high">\n' : ''}<link rel="stylesheet" href="/assets/site.css?v=${CSS_V}">
<script type="application/ld+json">${jsonld(p)}</script>
<script src="/assets/app.js?v=${JS_V}" defer></script>`;
}

// ---------- páginas ----------
const warn = new Set();
for (const p of PAGES) {
  const html = `<!doctype html>\n<html lang="es">\n<head>\n${head(p)}\n</head>\n<body>\n<div id="app">${w.prerender(p.u)}</div>\n</body>\n</html>\n`;
  if (html.includes('[NIF]')) warn.add(p.u);
  const f = p.u === '/' ? 'index.html' : p.u.slice(1) + '.html';
  mkdirSync(dirname(join(OUT, f)), { recursive: true });
  writeFileSync(join(OUT, f), html);
}

// ---------- 404 real ----------
writeFileSync(join(OUT, '404.html'), `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página no encontrada | ContrataLux</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/favicon.png">
<link rel="stylesheet" href="/assets/site.css?v=${CSS_V}">
</head>
<body>
<header style="border-bottom: 1px solid #E6EBF0; padding: 14px 24px"><a href="/"><img src="/assets/logo-contratalux.png" alt="ContrataLux" width="640" height="206" style="height: 52px; width: auto"></a></header>
<main style="max-width: 760px; margin: 0 auto; padding: 72px 24px; font-family: 'Figtree', system-ui, sans-serif; color: #22313F">
<p style="margin: 0; font-weight: 700; color: #0B7A70; letter-spacing: 0.08em">ERROR 404</p>
<h1 style="font-family: 'Kanit', sans-serif; font-size: 44px; color: #13202E; margin: 12px 0">Página no encontrada</h1>
<p style="font-size: 19px; color: #3D4E5F">La dirección que buscas no existe o ha cambiado. Puedes seguir por aquí:</p>
<ul style="font-size: 18px; line-height: 2">
<li><a href="/">Portada de ContrataLux</a></li>
<li><a href="/modulos">Funciones del programa</a></li>
<li><a href="/precios">Precios</a></li>
<li><a href="/recursos">Guía del asesor energético</a></li>
</ul>
</main>
</body>
</html>
`);

// ---------- sitemaps ----------
const GROUPS = { modulos: 'modulos', soluciones: 'soluciones', herramientas: 'herramientas', comparativas: 'comparativas', integraciones: 'integraciones',
  recursos: 'recursos', zonas: 'zonas', suministros: 'suministros', 'plataforma-propia': 'plataforma-propia' };
const groups = {};
for (const p of PAGES) {
  if (p.ni) continue;
  const g = GROUPS[p.u.split('/')[1]] || 'paginas';
  (groups[g] = groups[g] || []).push(p);
}
const idx = [];
for (const [g, list] of Object.entries(groups)) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    list.map((p) => `  <url><loc>${url(p.u)}</loc><lastmod>${p.upd}</lastmod></url>`).join('\n') + '\n</urlset>\n';
  writeFileSync(join(OUT, `sitemap-${g}.xml`), xml);
  idx.push(`  <sitemap><loc>${D}/sitemap-${g}.xml</loc><lastmod>${list.map((p) => p.upd).sort().pop()}</lastmod></sitemap>`);
}
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${idx.join('\n')}\n</sitemapindex>\n`);

// ---------- robots.txt ----------
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /
Disallow: /registro
Disallow: /gracias

Sitemap: ${D}/sitemap.xml
`);

// ---------- llms.txt ----------
const sec = (title, filter) => {
  const list = PAGES.filter((p) => !p.ni && filter(p));
  return list.length ? `## ${title}\n\n` + list.map((p) => `- [${p.l}](${url(p.u)}): ${p.md}`).join('\n') + '\n' : '';
};
const top = (seg) => (p) => p.u.split('/')[1] === seg;
const llms = `# ContrataLux

> ${SITE.description} Desarrollado por ${SITE.legalName} (${SITE.address.addressLocality}, ${SITE.address.addressRegion}).

- Precios sin impuestos: Básico 90 €/mes (1–2 usuarios), Equipo 195 €/mes (hasta 10 usuarios); Ilimitado y Plataforma propia, a consultar. Prueba gratis de 7 días.
- El cliente elige qué suministros gestiona: luz, gas, dual, fibra y telefonía, alarmas y CAEs.
- ContrataLux registra los contratos; no los envía a la comercializadora salvo con el bot ATR de Naturgy, que es un servicio adicional.
- Plataforma propia: el programa instalado en el servidor del cliente, con su marca y licencia de uso sin cuota mensual.

## Producto

- [Portada](${D}/): qué es ContrataLux y para quién es.
- [Precios](${D}/precios): planes, usuarios y prueba gratis.
${sec('Funciones', (p) => top('modulos')(p) && p.u !== '/modulos').trim()}

${sec('Suministros', top('suministros'))}
${sec('Para quién', (p) => top('soluciones')(p) && p.u !== '/soluciones')}
${sec('Plataforma propia', top('plataforma-propia'))}
${sec('Herramientas', (p) => top('herramientas')(p) && p.u !== '/herramientas')}
${sec('Comparativas', (p) => top('comparativas')(p) && p.u !== '/comparativas')}
${sec('Guía del asesor', (p) => isGuide(p))}
## Empresa

- [Sobre nosotros](${D}/sobre-nosotros): quién hay detrás de ContrataLux.
- [Seguridad y RGPD](${D}/seguridad-y-rgpd): cómo se protegen los datos.
- [Aviso legal](${D}/aviso-legal): datos del titular.
`;
writeFileSync(join(OUT, 'llms.txt'), llms.replace(/\n{3,}/g, '\n\n'));

console.log(`OK: ${PAGES.length} páginas en public/ (fecha de cambios ${TODAY}).`);
if (warn.size) console.log(`Aviso: [NIF] pendiente en ${warn.size} páginas (pie y textos legales). Rellénalo en src/ antes de publicar.`);
