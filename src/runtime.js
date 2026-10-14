/* Mini runtime de ContrataLux: interpreta sc-if, sc-for y {{huecos}} de src/template.html.
   Lo usan el build (para pre-renderizar cada página) y el navegador (para la interactividad). */
class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(p) { this.state = Object.assign({}, this.state, typeof p === 'function' ? p(this.state) : p); scheduleRender(); }
}
let comp, ROOT, TPL, pending = false;
const SVGNS = 'http://www.w3.org/2000/svg';
const ONE = /^\{\{([^}]+)\}\}$/;
function look(path, scopes) {
  path = path.trim();
  if (path === 'true') return true;
  if (path === 'false') return false;
  const parts = path.split('.');
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i] && Object.prototype.hasOwnProperty.call(scopes[i], parts[0])) {
      let v = scopes[i][parts[0]];
      for (let k = 1; k < parts.length; k++) v = v == null ? undefined : v[parts[k]];
      return v;
    }
  }
  return undefined;
}
function interp(str, scopes) {
  return str.replace(/\{\{([^}]+)\}\}/g, function (_, e) { const v = look(e, scopes); return v == null ? '' : String(v); });
}
function proc(node, scopes, out) {
  if (node.nodeType === 3) { out.appendChild(document.createTextNode(node.nodeValue.indexOf('{{') > -1 ? interp(node.nodeValue, scopes) : node.nodeValue)); return; }
  if (node.nodeType !== 1) { if (node.nodeType !== 8) out.appendChild(node.cloneNode(true)); return; }
  const tag = node.tagName.toLowerCase();
  // data-for="{{lista}}" data-as="x": repite el propio elemento (filas y celdas de tabla, donde sc-for no es HTML válido)
  if (node.hasAttribute('data-for')) {
    const m = ONE.exec(node.getAttribute('data-for'));
    const as = node.getAttribute('data-as') || 'item';
    const list = m ? look(m[1], scopes) || [] : [];
    const tpl = node.cloneNode(true); tpl.removeAttribute('data-for'); tpl.removeAttribute('data-as');
    list.forEach(function (it, idx) { const sc = {}; sc[as] = it; sc[as + 'Index'] = idx; proc(tpl, scopes.concat([sc]), out); });
    return;
  }
  if (tag === 'sc-if') {
    const m = ONE.exec(node.getAttribute('value') || '');
    if (m && look(m[1], scopes)) node.childNodes.forEach(function (c) { proc(c, scopes, out); });
    return;
  }
  if (tag === 'sc-for') {
    const m = ONE.exec(node.getAttribute('list') || '');
    const as = node.getAttribute('as') || 'item';
    const list = m ? look(m[1], scopes) || [] : [];
    list.forEach(function (it, idx) { const sc = {}; sc[as] = it; sc[as + 'Index'] = idx; node.childNodes.forEach(function (c) { proc(c, scopes.concat([sc]), out); }); });
    return;
  }
  const inSvg = tag === 'svg' || out.namespaceURI === SVGNS;
  const el = inSvg ? document.createElementNS(SVGNS, node.tagName) : document.createElement(tag);
  for (const a of Array.from(node.attributes)) {
    if (a.name.indexOf('hint-placeholder') === 0) continue;
    const m = ONE.exec(a.value);
    if (/^on[a-z]+$/i.test(a.name) && m) { const fn = look(m[1], scopes); if (typeof fn === 'function') el.addEventListener(a.name.slice(2).toLowerCase(), fn); continue; }
    if (m) {
      const v = look(m[1], scopes);
      if (v === true) { el.setAttribute(a.name, ''); if (!inSvg && a.name in el) { try { el[a.name] = true; } catch (e) { /* solo lectura */ } } }
      else if (v === false || v == null) { /* atributo omitido */ }
      else el.setAttribute(a.name, String(v));
    } else el.setAttribute(a.name, a.value.indexOf('{{') > -1 ? interp(a.value, scopes) : a.value);
  }
  if (tag === 'video') el.muted = el.hasAttribute('muted');
  node.childNodes.forEach(function (c) { proc(c, scopes, el); });
  out.appendChild(el);
}
function render() {
  pending = false;
  const vals = comp.renderVals();
  const frag = document.createDocumentFragment();
  TPL.content.childNodes.forEach(function (c) { proc(c, [vals], frag); });
  ROOT.replaceChildren(frag);
  if (comp.componentDidUpdate) comp.componentDidUpdate();
}
function scheduleRender() { if (!pending) { pending = true; Promise.resolve().then(render); } }
