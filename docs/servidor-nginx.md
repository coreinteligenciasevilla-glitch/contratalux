# Servidor: compresión, caché y HSTS (nginx)

La web se publica desde Hestia, que pone **nginx** delante de Apache. nginx sirve los archivos estáticos (HTML, JS, CSS, imágenes)
directamente y **no lee `static/.htaccess`**, así que las cabeceras del `.htaccess` (compresión, caché, HSTS) pueden no llegar al visitante.
Comprueba desde fuera con `curl -sI https://contratalux.com/ -H 'Accept-Encoding: br, gzip'` y mira estas cabeceras:

- `content-encoding: br` o `gzip` (compresión del HTML; el JS y el CSS también),
- `strict-transport-security: max-age=31536000`,
- `cache-control` con `immutable` en `/assets/*` que llevan `?v=…`.

Si faltan, añade esto a la configuración nginx del dominio (en Hestia: `/home/USUARIO/conf/web/contratalux.com/nginx.ssl.conf_hsts`,
o la plantilla del dominio; después `v-rebuild-web-domain USUARIO contratalux.com`):

```nginx
add_header Strict-Transport-Security "max-age=31536000" always;

gzip on;
gzip_vary on;
gzip_comp_level 5;
gzip_min_length 1024;
gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;
# Si el módulo brotli está instalado:
# brotli on; brotli_comp_level 5; brotli_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

location ~* \.(woff2|webp|png|jpg|mp4)$ {
  expires 30d;
  add_header Cache-Control "public, max-age=2592000";
}
```

Nota: `text/html` se comprime siempre cuando gzip está activo. Prueba en un navegador privado antes de cerrar la tarea.
