# Propuesta: consolidar las páginas de provincia

**Estado: propuesta, no aplicada.** No se ha borrado ni redirigido nada.

Hay 43 páginas de provincia con la misma oferta y una o dos frases de geografía. Google puede tratarlas como páginas puerta. La propuesta es quedarse con las 19 páginas de comunidad autónoma (incluidas Ceuta y Melilla) y redirigir las provincias a su comunidad con un 301, salvo Sevilla, que es la sede.

Antes de redirigir, lo que tenga de propio cada provincia (por ejemplo, las islas de Las Palmas o el IGIC en Canarias) se pasa a una sección de su comunidad, para no perder contenido útil.

| Provincia | Se redirige a |
|---|---|
| Sevilla | Se mantiene (sede) |
| Málaga | Andalucía (`/zonas/andalucia`) |
| Cádiz | Andalucía (`/zonas/andalucia`) |
| Córdoba | Andalucía (`/zonas/andalucia`) |
| Granada | Andalucía (`/zonas/andalucia`) |
| Huelva | Andalucía (`/zonas/andalucia`) |
| Jaén | Andalucía (`/zonas/andalucia`) |
| Almería | Andalucía (`/zonas/andalucia`) |
| Huesca | Aragón (`/zonas/aragon`) |
| Teruel | Aragón (`/zonas/aragon`) |
| Zaragoza | Aragón (`/zonas/aragon`) |
| Las Palmas | Canarias (`/zonas/canarias`) |
| Santa Cruz de Tenerife | Canarias (`/zonas/canarias`) |
| Ávila | Castilla y León (`/zonas/castilla-y-leon`) |
| Burgos | Castilla y León (`/zonas/castilla-y-leon`) |
| León | Castilla y León (`/zonas/castilla-y-leon`) |
| Palencia | Castilla y León (`/zonas/castilla-y-leon`) |
| Salamanca | Castilla y León (`/zonas/castilla-y-leon`) |
| Segovia | Castilla y León (`/zonas/castilla-y-leon`) |
| Soria | Castilla y León (`/zonas/castilla-y-leon`) |
| Valladolid | Castilla y León (`/zonas/castilla-y-leon`) |
| Zamora | Castilla y León (`/zonas/castilla-y-leon`) |
| Albacete | Castilla-La Mancha (`/zonas/castilla-la-mancha`) |
| Ciudad Real | Castilla-La Mancha (`/zonas/castilla-la-mancha`) |
| Cuenca | Castilla-La Mancha (`/zonas/castilla-la-mancha`) |
| Guadalajara | Castilla-La Mancha (`/zonas/castilla-la-mancha`) |
| Toledo | Castilla-La Mancha (`/zonas/castilla-la-mancha`) |
| Barcelona | Cataluña (`/zonas/cataluna`) |
| Girona | Cataluña (`/zonas/cataluna`) |
| Lleida | Cataluña (`/zonas/cataluna`) |
| Tarragona | Cataluña (`/zonas/cataluna`) |
| Alicante | Comunidad Valenciana (`/zonas/comunidad-valenciana`) |
| Castellón | Comunidad Valenciana (`/zonas/comunidad-valenciana`) |
| Valencia | Comunidad Valenciana (`/zonas/comunidad-valenciana`) |
| Badajoz | Extremadura (`/zonas/extremadura`) |
| Cáceres | Extremadura (`/zonas/extremadura`) |
| A Coruña | Galicia (`/zonas/galicia`) |
| Lugo | Galicia (`/zonas/galicia`) |
| Ourense | Galicia (`/zonas/galicia`) |
| Pontevedra | Galicia (`/zonas/galicia`) |
| Álava | País Vasco (`/zonas/pais-vasco`) |
| Bizkaia | País Vasco (`/zonas/pais-vasco`) |
| Gipuzkoa | País Vasco (`/zonas/pais-vasco`) |

Resultado: 19 páginas de comunidad + Sevilla = 20 páginas de zona, en lugar de 62.

## Reglas listas para el `.htaccess` (no activas)

Se añadirían antes de la sección 4 de `static/.htaccess`, y las provincias se quitarían de `src/pages.json` para que salgan del sitemap.

```apache
RewriteRule ^zonas/andalucia/malaga$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/andalucia/cadiz$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/andalucia/cordoba$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/andalucia/granada$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/andalucia/huelva$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/andalucia/jaen$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/andalucia/almeria$ https://contratalux.com/zonas/andalucia [R=301,L]
RewriteRule ^zonas/aragon/huesca$ https://contratalux.com/zonas/aragon [R=301,L]
RewriteRule ^zonas/aragon/teruel$ https://contratalux.com/zonas/aragon [R=301,L]
RewriteRule ^zonas/aragon/zaragoza$ https://contratalux.com/zonas/aragon [R=301,L]
RewriteRule ^zonas/canarias/las-palmas$ https://contratalux.com/zonas/canarias [R=301,L]
RewriteRule ^zonas/canarias/santa-cruz-de-tenerife$ https://contratalux.com/zonas/canarias [R=301,L]
RewriteRule ^zonas/castilla-y-leon/avila$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/burgos$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/leon$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/palencia$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/salamanca$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/segovia$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/soria$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/valladolid$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-y-leon/zamora$ https://contratalux.com/zonas/castilla-y-leon [R=301,L]
RewriteRule ^zonas/castilla-la-mancha/albacete$ https://contratalux.com/zonas/castilla-la-mancha [R=301,L]
RewriteRule ^zonas/castilla-la-mancha/ciudad-real$ https://contratalux.com/zonas/castilla-la-mancha [R=301,L]
RewriteRule ^zonas/castilla-la-mancha/cuenca$ https://contratalux.com/zonas/castilla-la-mancha [R=301,L]
RewriteRule ^zonas/castilla-la-mancha/guadalajara$ https://contratalux.com/zonas/castilla-la-mancha [R=301,L]
RewriteRule ^zonas/castilla-la-mancha/toledo$ https://contratalux.com/zonas/castilla-la-mancha [R=301,L]
RewriteRule ^zonas/cataluna/barcelona$ https://contratalux.com/zonas/cataluna [R=301,L]
RewriteRule ^zonas/cataluna/girona$ https://contratalux.com/zonas/cataluna [R=301,L]
RewriteRule ^zonas/cataluna/lleida$ https://contratalux.com/zonas/cataluna [R=301,L]
RewriteRule ^zonas/cataluna/tarragona$ https://contratalux.com/zonas/cataluna [R=301,L]
RewriteRule ^zonas/comunidad-valenciana/alicante$ https://contratalux.com/zonas/comunidad-valenciana [R=301,L]
RewriteRule ^zonas/comunidad-valenciana/castellon$ https://contratalux.com/zonas/comunidad-valenciana [R=301,L]
RewriteRule ^zonas/comunidad-valenciana/valencia$ https://contratalux.com/zonas/comunidad-valenciana [R=301,L]
RewriteRule ^zonas/extremadura/badajoz$ https://contratalux.com/zonas/extremadura [R=301,L]
RewriteRule ^zonas/extremadura/caceres$ https://contratalux.com/zonas/extremadura [R=301,L]
RewriteRule ^zonas/galicia/a-coruna$ https://contratalux.com/zonas/galicia [R=301,L]
RewriteRule ^zonas/galicia/lugo$ https://contratalux.com/zonas/galicia [R=301,L]
RewriteRule ^zonas/galicia/ourense$ https://contratalux.com/zonas/galicia [R=301,L]
RewriteRule ^zonas/galicia/pontevedra$ https://contratalux.com/zonas/galicia [R=301,L]
RewriteRule ^zonas/pais-vasco/alava$ https://contratalux.com/zonas/pais-vasco [R=301,L]
RewriteRule ^zonas/pais-vasco/bizkaia$ https://contratalux.com/zonas/pais-vasco [R=301,L]
RewriteRule ^zonas/pais-vasco/gipuzkoa$ https://contratalux.com/zonas/pais-vasco [R=301,L]
```
