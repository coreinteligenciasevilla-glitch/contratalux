# Registro de consentimientos de cookies

El RGPD (art. 7.1) obliga a poder **demostrar** que un visitante aceptó o rechazó las cookies. Hasta ahora la elección solo quedaba en el navegador de cada visitante (`localStorage`, clave `clx_cookies`). Ahora, además, cada elección se guarda en el servidor, de forma anónima.

## Qué se guarda

Una línea JSON por elección, en `AAAA-MM.jsonl` (un archivo por mes):

```json
{"t":"2026-10-16T14:05:11+02:00","id":"9f3c…(32 hex)","v":"b-1a2b3c4d","a":true,"d":false,"s":"custom"}
```

| Campo | Significado |
|-------|-------------|
| `t` | Fecha y hora (Madrid) puestas por el servidor |
| `id` | Identificador aleatorio del navegador (`clx_cid` en `localStorage`). No se deriva de nada personal |
| `v` | Versión del banner. Se calcula sola con el texto y los botones del banner: si cambias el banner, cambia la versión |
| `a` / `d` | Análisis aceptado / publicidad aceptada |
| `s` | `accept_all`, `reject_all` o `custom` |

**No se guarda:** IP, user-agent, página visitada, cabeceras ni ningún dato personal.

## Dónde está

En el servidor (Hestia): `/home/inteligenciasevilla/web/contratalux.com/private/consent/AAAA-MM.jsonl`.

Está **fuera de `public_html`**, por dos motivos: no se puede descargar desde internet y el despliegue (`rsync --delete` de `public/`) no lo toca.

## Cómo funciona

- `static/api/consent.php` recibe el POST (solo desde `https://contratalux.com`), valida que tenga exactamente los 5 campos esperados y añade la línea. Devuelve 204. Tope de 50 MB por mes.
- `scripts/build.mjs` (`clxConsentLog`) lo envía cada vez que el visitante pulsa Aceptar, Rechazar o Guardar en el banner (con `sendBeacon`; si no existe, con `fetch`). Si el envío falla, la web funciona igual.

## Consultarlo

Descarga los archivos del servidor (por SSH o por el gestor de archivos de Hestia) y ejecuta:

```bash
node scripts/resumen-consentimientos.mjs 2026-10.jsonl            # totales, % por elección, por mes y por versión
node scripts/resumen-consentimientos.mjs 2026-*.jsonl --id <ID>   # historial de una persona que te dé su ID
```

Si alguien reclama, puede conocer su ID desde la consola del navegador: `localStorage.getItem('clx_cid')`.

## Retención

Conserva los registros mientras puedan necesitarse para demostrar el consentimiento (la política de cookies pide renovarlo como máximo a los 24 meses). Pasado ese plazo puedes borrar los archivos antiguos del servidor.

## Probarlo en local

```bash
CONSENT_DIR=/tmp/consent CONSENT_ALLOW_ANY_ORIGIN=1 php -S 127.0.0.1:8080 -t public
```
