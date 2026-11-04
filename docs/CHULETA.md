# Chuleta de WildPokeBattle

Resumen para clase: qué hay hecho, cómo funciona y por qué se hizo así. El detalle completo está en el [README](../README.md) y en el [informe de investigación](INFORME_INVESTIGACION.md).

**Última actualización:** 4 nov 2026 · **Estado:** Fases 1 y 2 terminadas (HTML + CSS). Siguiente: Fase 3, motor físico.

---

## 1. El proyecto en 30 segundos

WildPokeBattle es una mascota virtual al estilo eSheep con Pokémon. La idea central es que **la propia web es el mundo físico**: las fichas de contenido son plataformas y los Pokémon caminan, saltan y combaten sobre ellas, solos y en tiempo real.

Por ahora existe el escenario: una web navegable, sin JavaScript. Todavía no hay Pokémon en movimiento, pero la página ya indica qué elementos serán suelo, plataforma o pared.

---

## 2. Qué hemos hecho y cómo

1. **Investigación:** juegos parecidos, APIs de Pokémon y licencias de sprites. El resultado es el informe de `docs/`.
2. **Diseño del proyecto:** el README fija las decisiones, la arquitectura y las fases.
3. **Fase 1, HTML:** cuatro páginas semánticas, validadas antes de añadir estilos.
4. **Fase 2, CSS:** estilo de cuaderno de campo, adaptable de 360 px a escritorio.
5. **Comprobación:** validador del W3C, enlaces, contraste y pruebas en Edge (sección 8).

| Página | Para qué sirve |
|---|---|
| [index.html](../index.html) | Portada: qué es, cómo funciona y lista de escenarios |
| [pages/prado.html](../pages/prado.html) | El escenario, el selector y la maqueta del editor |
| [pages/pokedex.html](../pages/pokedex.html) | Las 12 especies propuestas, con una inicial en lugar de imagen |
| [pages/ayuda.html](../pages/ayuda.html) | Atajos, uso en móvil, créditos y aviso legal |

---

## 3. Carpetas

```text
WildPokeBattle/
├── index.html                  portada (en la raíz para que sea la página de entrada)
├── README.md                   documento principal: decisiones, arquitectura y fases
├── pages/                      el resto de páginas
│   ├── prado.html
│   ├── pokedex.html
│   └── ayuda.html
├── css/                        todos los estilos
│   ├── tokens.css              variables: colores, fuentes, espaciado, sombras
│   ├── base.css                reset y estilo de las etiquetas HTML
│   ├── components.css          piezas reutilizables: botones, fichas, paneles, tablas
│   └── scenes/
│       └── prado.css           solo el prado: fondo, rejilla y posición de las fichas
├── assets/
│   └── ASSETS.md               origen y licencia de cada recurso
└── docs/
    ├── INFORME_INVESTIGACION.md  APIs, licencias y juegos similares
    └── CHULETA.md              este documento
```

- **`pages/`** separa la portada del resto. Por eso sus enlaces a CSS empiezan por `../`.
- **`css/`** se carga siempre en el mismo orden, de lo general a lo particular: `tokens` → `base` → `components` → `scenes`. A igual especificidad gana la última regla, así que cada escenario puede sobrescribir lo común.
- **`css/scenes/`** tendrá un archivo por escenario. Añadir el bosque no obligará a tocar los estilos compartidos.
- **`assets/`** de momento solo tiene el registro, porque todo el arte es CSS y SVG escrito dentro de `prado.css`.

**Carpetas previstas, aún sin crear**

| Carpeta | Fase | Contenido |
|---|---|---|
| `js/` | 3 en adelante | Motor, física, combate, IA, datos e interfaz |
| `tests/` | 3 | Pruebas del motor con `node --test` |
| `scripts/` | 4 | Generar los datos y descargar los sprites |
| `assets/sprites/` | 4 | Sprites descargados en local, fuera de Git |
| `desktop/` | 8 | Versión de escritorio con Electron |

---

## 4. Cómo funciona la web

### Tres cosas que no se mezclan

| Concepto | Qué es | Quién lo lleva |
|---|---|---|
| Contenido | Texto y controles | HTML |
| Caja visual | Lo que pinta el navegador | CSS |
| Caja física | Rectángulo con el que chocarán los Pokémon | JavaScript, desde la Fase 3 |

Una ficha puede verse y no tener caja física. «Cartel caído» está en el prado justo para demostrarlo.

### Superficies físicas

El HTML declara qué es cada elemento con atributos `data-`. No hay lógica: es información que leerá el motor.

```html
<article data-wpb-body="platform">…</article>
<article data-wpb-body="platform" data-wpb-enabled="false">…</article>
```

| Valor | Comportamiento previsto | En el prado |
|---|---|---|
| `solid` | Choca por todos los lados | Cabecera y suelo (2) |
| `platform` | Se aterriza encima y se atraviesa desde abajo | Rutas, Flora, Fauna, Clima, Sendero y Cartel caído (6, una desactivada) |
| `wall` | Bloquea de lado | Muro de piedra (1) |
| Sin atributo | No existe para la física | Texto de presentación, nubes y colinas |

### Capa de los Pokémon

`<div id="wpb-layer">` está vacío y reservado para los sprites. Cubre toda la página y tiene `pointer-events: none`, así que los Pokémon nunca taparán los clics. `body` lleva `position: relative` para que la capa mida la página entera y no solo la ventana. Así los sprites y las fichas comparten las mismas coordenadas, también al hacer scroll.

### Selector y editor sin JavaScript

- **Selector:** `<dialog popover>` más un botón con `popovertarget="selector"`. El navegador lo abre y lo cierra, y `Esc` funciona sin programar nada.
- **Editor:** es una maqueta. Un `<dialog>` cerrado está oculto, y la regla `#editor:target` lo muestra cuando la URL termina en `#editor`. No hay botón en el prado porque el editor real se abrirá con `Alt + P`.

---

## 5. Detalles del CSS

| Qué | Dónde | Para qué |
|---|---|---|
| Rejilla de 12 columnas y 7 filas | `.arena` | Colocar cada ficha a una altura exacta. Las filas miden al menos `5rem` |
| Una columna por debajo de `62rem` | `@media` de `prado.css` | En móvil las fichas se alternan a izquierda y derecha, como escalones |
| `minmax(0, 1fr)` | Columnas de `.arena` | Evita que un texto largo ensanche la columna y provoque scroll horizontal |
| `isolation: isolate` | `.arena` | Mantiene el decorado con `z-index: -1` dentro del escenario, sin que se esconda detrás de su fondo |
| Suelo con `position: absolute` | `.ground` | Ocupa todo el ancho sin los márgenes de la rejilla |
| `padding-bottom` igual a `--ground-height` | `.arena` | Hace que fichas y muro apoyen justo sobre el suelo |
| `max()` en el `padding` | `.arena` | Centra el contenido y deja que el cielo llegue a los bordes |
| `clamp()` | `h1` y `h2` | Tamaño de letra fluido sin añadir media queries |
| `100vh` y después `100dvh` | `body` | `dvh` descuenta la barra del móvil; `vh` es la alternativa para navegadores antiguos |
| `prefers-reduced-motion` | `base.css` | Detiene las nubes si el usuario pide menos movimiento |

### La regla más importante

Las superficies físicas **no pueden usar** `transform`, `translate`, `scale`, `rotate`, `fixed` ni `sticky`, tampoco en `:hover`.

- Una animación con `transform` mueve lo que se ve, pero no avisa a los observadores que usará el motor. La caja física se quedaría en el sitio antiguo.
- `fixed` y `sticky` cambian de posición en el documento con el scroll.
- Por eso el `:hover` de las fichas solo cambia la sombra, y lo único animado son las nubes, que no tienen `data-wpb-body`.

---

## 6. Por qué se hizo así

| Decisión | Justificación |
|---|---|
| HTML, CSS y JS sin frameworks | Solo habrá 2 Pokémon y unas decenas de rectángulos: no compensa añadir dependencias ni compilación |
| Sin Tailwind | Exige compilar, y con variables CSS y pocos componentes basta |
| Pokémon en el DOM, no en `<canvas>` | Comparten coordenadas con las fichas y no hay que convertir nada al hacer scroll |
| Física propia en lugar de Phaser o Matter.js | Un motor de rectángulos (AABB) es pequeño y controlable; sincronizar otro motor con el DOM costaría más |
| `data-wpb-*` en el HTML | El marcado describe y el motor decide. El menú para activar o desactivar cajas no obligará a rehacer las páginas |
| HTML y CSS antes que JS | Cada fase se cierra y se comprueba antes de la siguiente |
| Física antes que datos Pokémon | Se prueba lo más arriesgado con un simple rectángulo, sin depender de datos externos |
| Variables en `tokens.css` | Un color se cambia en un solo sitio |
| Fuentes del sistema | Funcionan sin conexión y no hay archivos ni licencias que gestionar |
| Sprites fuera del repositorio | Pokémon es una marca protegida. Cada persona los descarga en local, y sin ellos el juego usará siluetas |
| Sin uso comercial y con aviso legal | Es un proyecto de fans, y el aviso lo deja claro en el pie de cada página |
| Estructura de wiki | La página tiene que parecer una web real, porque esa es la gracia: su contenido es el terreno |

**Datos previstos para la Fase 4:** Pokémon Showdown (Gen 9) para las mecánicas y PokéAPI para los nombres en español. Se usarán en un script que genera JSON, así que el navegador no dependerá de ninguna API en tiempo real.

---

## 7. Accesibilidad

- Enlace «Saltar al contenido» y foco visible en todos los controles.
- La página actual se marca con `aria-current="page"`.
- Las etiquetas de tipo usan fondos claros con tinta oscura, y el texto siempre dice el tipo: no depende solo del color.
- El decorado y la capa de Pokémon llevan `aria-hidden="true"`, para que los lectores de pantalla los ignoren.

---

## 8. Comprobaciones

| Comprobación | Resultado |
|---|---|
| Validador W3C, 4 páginas | 0 errores y 0 avisos |
| Enlaces locales de las páginas | 46, ninguno roto |
| Scroll horizontal a 360, 768, 1024 y 1280 px | No hay |
| Solapes entre superficies a 360, 1024 y 1280 px | No hay |
| Propiedades prohibidas en superficies | Ninguna |
| Contraste de texto | 18 pares, todos por encima de 4,5:1. Etiquetas de tipo: mínimo 6,42:1 |
| Selector en Edge | Abre con clic y cierra con `Esc` |
| Editor en Edge | Oculto por defecto, visible con `#editor`, cabe a 360 px |

Estas pruebas se hicieron con scripts temporales que no están en el repositorio. El W3C se puede repetir en [validator.w3.org](https://validator.w3.org/), y el ancho con las herramientas de desarrollo del navegador.

### Limitaciones que conviene decir tú antes de que te pregunten

- Solo se ha probado en Edge. Faltan Firefox, Safari y móviles reales.
- `Alt + P` es solo un texto: empezará a funcionar en la Fase 3.
- Los botones de especies del selector están desactivados hasta la Fase 4.
- Los campos del editor están desactivados: es una maqueta.
- Las 12 especies son una propuesta que se fija en la Fase 4.
- Aún no hay commits: todos los archivos están sin versionar.

---

## 9. Cómo enseñarla en clase

1. Abre la carpeta con **Live Server** o ejecuta `npx serve`. Así se probó, y desde la Fase 3 será obligatorio, porque los módulos de JavaScript no funcionan abriendo el archivo directamente.
2. Entra en el prado y explica que las fichas serán plataformas.
3. Pulsa «Seleccionar Pokémon» y ciérralo con `Esc`: todo eso funciona sin JS.
4. Añade `#editor` al final de la URL para mostrar la maqueta del editor.
5. Reduce el ancho de la ventana para ver cómo las fichas pasan a una columna.
6. Inspecciona una ficha para enseñar `data-wpb-body`, y compárala con «Cartel caído».

---

## 10. Glosario rápido

| Término | Significado |
|---|---|
| AABB | Colisión entre rectángulos sin rotar: la más simple y barata |
| DOM Bridge | Módulo futuro que mide los elementos marcados y se los pasa a la física |
| Token | Variable CSS con un valor de diseño, como un color o un espaciado |
| Superficie | Elemento de la página con caja física |
| Popover | Función nativa de HTML para abrir y cerrar paneles flotantes |
| MVP | Primera versión jugable, con 12 especies |
