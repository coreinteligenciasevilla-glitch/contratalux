# ContrataLux — web

Web de ContrataLux, el programa de gestión para asesorías energéticas. Es un sitio estático e independiente: no necesita servidor de aplicaciones, base de datos ni ningún otro proyecto.

## Qué contiene

- `index.html`: toda la web. Incluye la portada y las 293 páginas del mapa SEO, que se muestran según la URL (`/modulos/...`, `/plataforma-propia/...`, `/zonas/...`, etc.).
- `404.html`: copia de `index.html`. En alojamientos como GitHub Pages hace que cualquier URL interna abra la página correcta.
- `assets/`: logos, capturas del programa y vídeos.
- `robots.txt`, `sitemap.xml` y `sitemap-*.xml`, `llms.txt`: SEO técnico.
- `seo/`: mapa de keywords (`mapa-keywords.csv`) y plantillas de datos estructurados (JSON-LD).

## Cómo verla en local

```bash
python3 -m http.server 8000
```

Abre http://localhost:8000. Las rutas internas funcionan al navegar desde la portada. Para abrir directamente una URL interna hace falta un servidor que devuelva `index.html` en las rutas que no existen; GitHub Pages lo hace con `404.html`.

## Publicación

Las rutas de los recursos son absolutas (`/assets/...`), así que la web debe servirse en la raíz de un dominio, por ejemplo `contratalux.com`, o en GitHub Pages con dominio propio.

## Pendiente antes de publicar

- Formulario: FormSubmit envía a info@contratalux.com. Hay que activarlo con el correo de confirmación del primer envío y, después, cambiar el email del código por la dirección aleatoria que da FormSubmit.
- Completar el NIF de Inteligenthia Sevilla SL en el pie (`[NIF]`).
