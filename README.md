# contratalux.com

Web de ContrataLux, el programa de gestión para asesorías energéticas. Es un sitio estático: cada una de las 251 rutas se genera como una página HTML completa (contenido, `<title>`, descripción, canonical, Open Graph y datos estructurados) que se lee sin ejecutar JavaScript. El JavaScript (`/assets/app.js`) solo añade la interactividad: menú, modales, formulario, cookies y las calculadoras gratis de `/herramientas` (definidas en `TOOLS`, dentro de `src/component.js`). Cada página lleva sus propios datos en `<script type="application/json" id="clx-data">`; `app.js` no incluye el contenido de las demás rutas.

## Estructura

```
src/
  template.html        plantilla de todas las páginas (sc-if, sc-for y {{huecos}})
  pages.json           datos de las 251 rutas: título (ti), descripción (md), contenido…
  component.js         lógica de la página (estado, router, formularios)
  runtime.js           mini runtime que pinta la plantilla (lo usan el build y el navegador)
  base.css             estilos base
  site.json            datos de la empresa para el JSON-LD (NIF, email, perfiles…)
  estado-paginas.json  hash, fecha de publicación (datePublished) y de último cambio (lastmod y dateModified) de cada ruta
static/                se copia tal cual: assets, fuentes, .htaccess
scripts/build.mjs      genera public/
docs/                  propuestas pendientes de aprobar
public/                salida del build (no se sube al repositorio)
```

## Generar el sitio

```bash
npm install
npm run build
```

El build:

1. Calcula un hash del contenido de cada ruta. Si cambia, actualiza su fecha en `src/estado-paginas.json`; esa fecha es el `lastmod` del sitemap, el `dateModified` del JSON-LD y la fecha visible «Actualizado el…». **Sube siempre `src/estado-paginas.json` con tus cambios** para que las fechas no se reinicien.
2. Pinta cada ruta con el mismo runtime que usa el navegador y escribe `public/ruta.html` (la portada es `public/index.html`).
3. Genera el `<head>` de cada página, el JSON-LD (Organization, WebSite, SoftwareApplication, WebPage o CollectionPage, BreadcrumbList, Article en las guías y WebApplication en el comparador gratis), `sitemap*.xml`, `robots.txt`, `llms.txt` y `404.html`.
4. Falla si queda un marcador sin rellenar (`[…]`, `{campo}`, `TODO`, `AAAA-MM-DD`) en algún JSON-LD, y avisa si queda `[NIF]` en las páginas.

## Publicación

Cada push a `main` lanza `.github/workflows/deploy.yml`: instala dependencias, ejecuta el build y sube `public/` por rsync a `public_html` de contratalux.com.

El servidor debe ser Apache o LiteSpeed (lee `static/.htaccess`):

- `/ruta` se sirve desde `ruta.html` con 200 y sin redirección.
- `/ruta.html`, `/ruta/` e `/index.html` redirigen con 301 a la URL canónica.
- Las URLs que no existen devuelven un 404 real con `404.html`.
- HTTP y www redirigen a `https://contratalux.com` en un solo salto.
- Compresión gzip/brotli y caché larga para CSS, JS y fuentes versionados.

## Datos pendientes

Se rellenan en `src/site.json` (JSON-LD) y en el contenido (`src/pages.json`, pie de `src/template.html`):

- NIF de Inteligenthia Sevilla SL (pie, aviso legal, privacidad, cookies).
- Datos de inscripción en el Registro Mercantil (aviso legal).
- URLs de los perfiles oficiales (`sameAs`).
- Fecha de publicación del vídeo de demostración (`video.uploadDate`) para activar su VideoObject.
- Host definitivo del botón «Entrar».
