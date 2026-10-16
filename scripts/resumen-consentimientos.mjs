// Resumen del registro de consentimientos de cookies.
// Uso:  node scripts/resumen-consentimientos.mjs ARCHIVO.jsonl [OTRO.jsonl ...]
//       node scripts/resumen-consentimientos.mjs ARCHIVO.jsonl --id <id del navegador>   (historial de una persona: el ID aparece en los emails de los formularios)
// Los archivos están en el servidor: /home/inteligenciasevilla/web/contratalux.com/private/consent/AAAA-MM.jsonl
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const i = args.indexOf('--id');
const wanted = i >= 0 ? args.splice(i, 2)[1] : null;
if (!args.length) {
  console.error('Uso: node scripts/resumen-consentimientos.mjs ARCHIVO.jsonl [...] [--id ID]');
  process.exit(1);
}

const rows = [];
for (const f of args) {
  for (const l of readFileSync(f, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try { rows.push(JSON.parse(l)); } catch { /* línea dañada: se ignora */ }
  }
}
rows.sort((a, b) => a.t.localeCompare(b.t));

if (wanted) {
  const mine = rows.filter((r) => r.id === wanted);
  if (!mine.length) console.log('No hay registros para ese ID.');
  for (const r of mine) console.log(`${r.t}  IP ${r.ip || '-'}  banner ${r.v}  ${r.s}  análisis=${r.a ? 'sí' : 'no'}  publicidad=${r.d ? 'sí' : 'no'}`);
  process.exit(0);
}

const count = (key) => rows.reduce((m, r) => ((m[key(r)] = (m[key(r)] || 0) + 1), m), {});
const pct = (n) => (rows.length ? ((100 * n) / rows.length).toFixed(1) + ' %' : '-');
console.log(`Elecciones registradas: ${rows.length}`);
console.log(`Navegadores distintos: ${new Set(rows.map((r) => r.id)).size}`);
if (rows.length) console.log(`Primera: ${rows[0].t}   Última: ${rows[rows.length - 1].t}`);
console.log('\nPor elección:');
for (const [k, n] of Object.entries(count((r) => r.s))) console.log(`  ${k.padEnd(11)} ${String(n).padStart(6)}  ${pct(n)}`);
console.log(`\nAceptan análisis: ${pct(rows.filter((r) => r.a).length)}`);
console.log('\nPor mes:');
for (const [k, n] of Object.entries(count((r) => r.t.slice(0, 7))).sort()) console.log(`  ${k}  ${n}`);
console.log('\nPor versión del banner:');
for (const [k, n] of Object.entries(count((r) => r.v))) console.log(`  ${k}  ${n}`);
