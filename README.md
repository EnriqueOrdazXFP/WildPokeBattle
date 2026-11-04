# WildPokeBattle

> **Mascota virtual Pokémon · Ecosistema físico interactivo · Web primero, escritorio como objetivo final**

**Principio fundamental:** los Pokémon no viven en un escenario hecho para ellos. Viven **dentro de la página** (y, más adelante, del escritorio) y usan los elementos que encuentran a su alrededor como su mundo físico.

| | |
|---|---|
| **Versión** | 1.3 (4 nov 2026): nombre unificado, derivación de formas corregida con datos reales, reglas de fin de combate, sprites y publicación |
| **Stack** | HTML + CSS + JavaScript (vanilla, módulos ES). Sin frameworks ni build obligatorio para jugar |
| **Plataforma inicial** | Web (escritorio con teclado; móvil en modo espectador) |
| **Plataforma objetivo** | Web + escritorio (Electron), con integración real con otras aplicaciones |
| **Límite de entidades** | Máximo **2 Pokémon activos** a la vez |
| **Publicación** | Código público; **los sprites no se suben al repositorio** |
| **Hito actual** | Fases 1 y 2 terminadas (web HTML + CSS). Siguiente: Fase 3 — Motor físico |
| **Guía complementaria** | [Informe de investigación](docs/INFORME_INVESTIGACION.md): APIs, licencias, juegos similares y datos que respaldan este documento |
| **Chuleta** | [Resumen para clase](docs/CHULETA.md): qué hay hecho, cómo funciona y por qué |

---

## Índice

1. [Visión](#1-visión)
2. [Decisiones cerradas](#2-decisiones-cerradas)
3. [La página como mundo físico](#3-la-página-como-mundo-físico)
4. [Mecánicas](#4-mecánicas)
5. [Stack técnico](#5-stack-técnico)
6. [Arquitectura](#6-arquitectura)
7. [Estructura de carpetas](#7-estructura-de-carpetas)
8. [Hoja de ruta](#8-hoja-de-ruta)
9. [Criterios de aceptación globales](#9-criterios-de-aceptación-globales)
10. [Reglas para agentes de programación](#10-reglas-para-agentes-de-programación)
11. [Riesgos y decisiones pendientes](#11-riesgos-y-decisiones-pendientes)
12. [Glosario](#12-glosario)
13. [Referencias](#13-referencias)

---

## 1. Visión

WildPokeBattle es una mascota virtual que combina la convivencia con el escritorio (estilo **eSheep** o **Shimeji**) con el universo Pokémon y un combate en tiempo real.

El usuario elige Pokémon que aparecen en la página. Se mueven solos, saltan, caen, usan las superficies y, cuando hay dos, **combaten automáticamente** hasta que uno queda debilitado. Después puede entrar otro, sin superar nunca el máximo de dos.

Se construye primero como web. El núcleo de simulación se reutiliza tal cual en una app de escritorio cuyo objetivo final es que los Pokémon usen elementos reales de otras aplicaciones (ventanas, paneles, interfaces de un DAW…) cuando el sistema operativo lo permita.

### Referencias e inspiración

| Referencia | Qué tomamos |
|---|---|
| eSheep, Shimeji | Criaturas que conviven con el escritorio y caminan sobre las ventanas |
| VS Code Pets / VS Code Pokémon | Mascotas dentro de una interfaz de trabajo, sin molestar |
| Pokémon Mundo Misterioso | Estilo visual de sprites y animaciones (sujeto a licencias) |
| Pokémon Legends: Z-A, Pokémon UNITE | Movimientos de los juegos adaptados a tiempo real con enfriamientos |
| Monster Rancher | Combate autónomo en un eje, con técnicas condicionadas por la distancia |
| Plataformas 2D | Gravedad, salto, colisiones, desplazamiento lateral |
| WikiDex | Estructura de la web: cabecera, navegación, artículos, listas |
| DesktopInvasion *(sin verificar)* | Citada en versiones anteriores; no se ha localizado ningún título con este nombre |
| Pokémon Apex Arena *(sin verificar)* | Citada en versiones anteriores; no se ha localizado ningún título con este nombre |

Son inspiración: **no se copian recursos, código ni elementos protegidos.** El análisis de cada referencia está en el [informe](docs/INFORME_INVESTIGACION.md#4-juegos-y-proyectos-similares).

---

## 2. Decisiones cerradas

No se cambian sin justificación técnica y actualización de este documento (ver [ADR](#12-glosario)).

| Área | Decisión |
|---|---|
| Entidades | Máximo 2 Pokémon activos |
| Comportamiento | Autónomo. El usuario selecciona, configura y observa; no dirige el combate |
| Generación | Cada Pokémon aparece con **estadísticas y movimientos aleatorios** dentro de lo válido para su especie |
| Edición | El usuario puede **modificar estadísticas y movimientos** de los Pokémon activos |
| Pausa | Solo por **combinación de teclas**. Sin botón de pausa en pantalla |
| Móvil | **Modo espectador:** sin teclado no hay pausa ni editor; se puede elegir Pokémon y mirar |
| Perspectiva | Lateral 2D |
| Movimiento | Libre; no está obligado a perseguir al rival |
| Física | Gravedad activa como regla general |
| Escenario | Compuesto por superficies físicas sacadas del propio DOM. Usa coordenadas de documento, y el prado es un `<main>` acotado por su suelo para que nadie caiga fuera de vista |
| Combate | Automático, continuo, en tiempo real. **Sin turnos** |
| Distancia | No existe distancia global que cancele el combate |
| Alcance | Cada movimiento conserva su alcance y condiciones |
| Final | Todo combate **termina siempre** (ver [4.9](#49-final-del-combate)) |
| Nivel | Fijo (50) hasta la Fase 9 |
| PP | No hay; el límite lo ponen los enfriamientos |
| Debilitado | Vuelve a su Poké Ball y libera el hueco |
| Choque entre Pokémon | Sí, con empuje suave, para que no se solapen |
| Datos | **Pokémon Showdown** como base de mecánicas, fijado a **Gen 9**; **PokéAPI** para nombres en español. La simulación en tiempo real es propia |
| Sprites | No se versionan: `scripts/fetch-assets.js` los descarga en local. Sin ellos, el juego funciona con siluetas |
| Arquitectura | Núcleo, física, IA, combate, datos, interfaz y plataforma separados |
| Tecnología | HTML, CSS y JavaScript vanilla |

### 2.1. Movimiento autónomo

Cada Pokémon decide según su estado y el entorno: avanzar, retroceder, detenerse, saltar, cambiar de plataforma, caer, atacar, esquivar, usar capacidades físicas o explorar. La IA evalúa cuándo un ataque es viable; la distancia nunca cancela el combate.

### 2.2. Combate híbrido

Reglas y estadísticas inspiradas en los juegos principales + movimiento, ataques y efectos físicos en tiempo real. Sin turnos ni secuencias fijas.

---

## 3. La página como mundo físico

La web tiene estructura tipo wiki Pokémon. **Cada página es un escenario.** Los elementos marcados como físicos son superficies u obstáculos reales para los Pokémon.

### 3.1. Escenarios

1. **Prado** (primero).
2. Después: bosque, cueva, volcán, montaña nevada, laboratorio…

Cada escenario tiene identidad visual y distribución propias. Fondos y texturas tienen una fuente de recursos **independiente de los sprites** (ver [11.4](#114-recursos-y-licencias)).

### 3.2. Flujo de la página del prado

1. El usuario entra en el prado.
2. Ve el botón destacado **«Seleccionar Pokémon»**.
3. Se abre el selector (Pokédex).
4. Elige un Pokémon; el selector se cierra.
5. El Pokémon se genera con estadísticas y movimientos aleatorios y sale de una Poké Ball (animación, si hay recursos).
6. Cae por gravedad, aterriza y empieza a moverse.
7. Al elegir un segundo Pokémon, empieza el combate.
8. El combate sigue hasta que uno queda debilitado (o ambos, ver [4.9](#49-final-del-combate)).
9. Se puede elegir otro, sin pasar de 2 activos.
10. En cualquier momento, **`Alt + P`** pausa la simulación y abre el editor; la misma combinación la reanuda (ver [4.7](#47-generación-aleatoria-edición-y-pausa)).

> La interfaz de selección y el editor son **capa web**. Simulación, movimiento y combate son **motor**.

### 3.3. Tres conceptos que no se mezclan

| Concepto | Qué es | Quién lo gestiona |
|---|---|---|
| **Contenido** | Texto, imagen o control en la página | HTML |
| **Caja visual** | Geometría que pinta el navegador | CSS |
| **Caja física** | Rectángulo que el motor usa para colisionar | DOM Bridge + física |

Tener contenido **no implica** tener caja física. **Regla:** si un elemento pierde o desactiva su caja física, sigue viéndose pero deja de existir para la simulación.

### 3.4. Cómo se marca un elemento físico

Con atributos `data-` en el HTML (marcado, no lógica):

```html
<header data-wpb-body="solid">…</header>
<article class="card" data-wpb-body="platform">…</article>   <!-- se puede atravesar desde abajo -->
<aside data-wpb-body="wall">…</aside>
<button data-wpb-body="platform" data-wpb-enabled="false">…</button>
```

| Valor | Comportamiento |
|---|---|
| `solid` | Colisiona por todos los lados |
| `platform` | Plataforma de un sentido: se aterriza encima, se atraviesa desde abajo |
| `wall` | Solo bloqueo lateral |
| *(sin atributo)* | No participa |

Orientación por defecto: contenedores → pared/sólido, tarjetas → plataforma, botones → plataforma u obstáculo.

### 3.5. Configuración por el usuario (Fase 7)

Activar/desactivar cajas, cambiar tamaños y tipo de superficie desde un **menú de clic derecho**. No entra en el primer prototipo, pero el marcado con `data-wpb-*` ya lo permite sin rehacer nada.

---

## 4. Mecánicas

### 4.1. Movimiento y física

Plano lateral 2D: X horizontal, Y vertical (hacia abajo positivo, como el DOM), gravedad hacia abajo.

Estado mínimo de cada Pokémon: posición, velocidad, aceleración, masa, fricción, fuerza de salto, velocidad máxima, `onGround`, contactos y modo de movimiento (`ground` | `fly`). Los valores varían por especie.

### 4.2. Gravedad, salto y vuelo

Desde la primera aparición el Pokémon: tiene cuerpo, cae, aterriza en suelo y plataformas, salta de forma controlada, choca con paredes y límites y **no atraviesa superficies**.

El **vuelo** es un modo de movimiento, no «apagar la física»: reduce la gravedad y permite controlar la aceleración vertical. Al aterrizar o salir del modo, vuelve el comportamiento terrestre. La arquitectura lo admite desde el inicio; se prueba un vuelo básico en el primer prototipo si hay recursos.

### 4.3. Colisiones

Pokémon ↔ suelo, plataformas, paredes, obstáculos, otro Pokémon. Ataques ↔ Pokémon y superficies.

La caja física es **independiente del sprite**: la animación cambia de pose, el cuerpo representa el espacio real.

Reglas para que la física sea estable:

- **Sin atravesar superficies finas:** la velocidad por tick nunca supera el grosor mínimo de una superficie; si un retroceso lo exige, se usa barrido (*swept AABB*).
- **Plataforma de un sentido:** solo aterriza si la base del cuerpo estaba por encima de la plataforma en el tick anterior y baja.
- **Superficie que cambia:** si desaparece, el Pokémon cae. Si se mueve, se recalcula el contacto y, si el cuerpo queda dentro de otra caja, se le expulsa por el lado de menor penetración.

### 4.4. Capacidades físicas

Son reglas de movimiento o de escenario que algunos ataques activan. **No son las Habilidades de Pokémon** (como Espesura o Intimidación), que son otro dato de la especie. Pueden alterar temporalmente las reglas, pero la gravedad sigue siendo la norma:

| Capacidad | Efecto | Movimientos de ejemplo |
|---|---|---|
| Vuelo | Sustentación / desplazamiento aéreo | Vuelo |
| Salto potenciado | Modifica el impulso vertical | Bote |
| Excavación | Interacción con ciertos terrenos | Excavar |
| Surf | Desplazamiento sobre superficies acuáticas | Surf |
| Teletransporte | Cambio instantáneo de posición | Teletransporte |
| Sacudida | Afecta a superficies y entidades | Terremoto |
| Conducción | Los ataques eléctricos impactan y se propagan por superficies | Rayo |

### 4.5. Combate

La IA de cada Pokémon evalúa continuamente: posiciones, distancia y altura, PS, movimientos disponibles, enfriamientos, tipos y efectividades, obstáculos y opciones de esquiva.

**Forma del movimiento.** Ningún juego la define; se **deriva de los datos de Showdown**. Las reglas se aplican **en orden** y gana la primera que coincide:

| # | Condición en Showdown | Forma |
|---|---|---|
| 1 | Está en `js/data/move-overrides.json` | La indicada ahí |
| 2 | `target` `self`, `allies`, `allyTeam`, `adjacentAllyOrSelf` o `adjacentAlly` | `self` |
| 3 | `target` `all`, `allySide` o `foeSide` | `global` |
| 4 | `target` `allAdjacent` o `allAdjacentFoes` | `area` |
| 5 | flag `contact` | `melee` |
| 6 | flag `bullet` | `projectile` |
| 7 | flag `pulse` | `beam` |
| 8 | flag `sound` | `area` |
| 9 | Categoría Estado con un objetivo | `projectile` |
| 10 | Físico → `melee`; Especial → `projectile` | fallback |

> **Importante:** la categoría Estado no significa «sobre sí mismo». Tóxico u Onda Trueno son Estado y van contra el rival. Por eso las reglas 2–4 miran `target` y la 9 los trata como proyectil. Los datos también obligan a usar la tabla de excepciones: ningún flag identifica Hiperrayo, Rayo Hielo, Rayo Solar o Rayo como `beam`.

| Forma | Regla |
|---|---|
| `melee` | Requiere proximidad |
| `projectile` | Trayectoria y alcance |
| `beam` | Gran distancia, línea recta |
| `area` | Afecta una región |
| `global` | Afecta a todo el escenario o a un bando (clima, trampas, campos) |
| `self` | Efecto sobre el propio Pokémon; no necesita alcance ni puntería |

Otros datos que se reutilizan: **prioridad** (reduce el tiempo de ejecución), **precisión** (probabilidad de impacto real además de la puntería física) y **efectos secundarios** (estados, cambios de stats).

**Daño y física son sistemas distintos pero conectados:** un ataque puede producir retroceso, desplazamiento, caída, interrupción, explosión o efectos sobre el escenario.

Fórmula de partida (simplificada de los juegos principales, a equilibrar):

```
daño = ((2·Nivel/5 + 2) · Potencia · Ataque/Defensa) / 50 + 2
       × STAB (1,5) × efectividad de tipo × aleatorio(0,85–1) × battleScale
enfriamiento = base_por_potencia × factor_por_velocidad
```

- **Ataque/Defensa:** los físicos usan Ataque y Defensa; los especiales, Ataque Esp. y Defensa Esp.
- **`battleScale`:** multiplicador global de ritmo. Sin él, a nivel 50 un ataque de 80 de potencia con STAB debilita en 3–4 golpes y uno de 120 en 2–3, demasiado rápido para algo que se disfruta mirando. Se calibra en la Fase 4 hasta alcanzar la duración objetivo ([11.6](#116-decisiones-a-tomar-con-propuesta)).
- **`factor_por_velocidad`:** decisión propia del proyecto. Las fuentes no aclaran si Legends: Z-A hace algo parecido, así que no se toma como referencia.

### 4.6. Estadísticas y personalidad

PS, Ataque, Defensa, Ataque Esp., Defensa Esp., Velocidad, tipos, habilidades y movimientos **influyen en el comportamiento**, no solo se muestran.

Cada Pokémon tiene una personalidad de combate derivada de sus datos (p. ej. alta Velocidad → hostigador; alta Defensa → aguanta y contraataca). La IA busca un comportamiento natural, variado y reconocible: **no conoce el futuro ni tiene puntería perfecta.**

### 4.7. Generación aleatoria, edición y pausa

#### Generación al aparecer

| Dato | Cómo se genera |
|---|---|
| Estadísticas | Stats base de la especie (Showdown) + IV aleatorios 0–31 + EV 0 + naturaleza aleatoria, calculadas con la fórmula de Showdown |
| Movimientos | Ver el procedimiento de abajo |
| Habilidad | Una al azar entre las del rol elegido o, si no hay rol, las de la especie (efecto en combate, cuando se implemente) |
| Nivel | Fijo (50) |

Procedimiento de movimientos:

1. Si la especie tiene set de Random Battle, se sortea **un rol** y se usa solo su `movepool`. Mezclar roles rompe la coherencia del set.
2. Se retiran los movimientos marcados como `excluded` (ver [4.8](#48-de-turnos-a-tiempo-real)).
3. Se eligen hasta 4 sin repetir. Muchos `movepool` tienen 4 o menos, así que el azar real suele estar en el rol.
4. Si faltan movimientos, se completa desde el conjunto aprendible con movimientos no excluidos.
5. Debe quedar **al menos un movimiento de daño**. Si no, se cambia uno por un ataque aprendible.

Las especies sin set (por ejemplo Bulbasaur, Eevee o Magikarp) saltan al paso 4 con un mínimo de 2 ataques de daño, uno con STAB si existe.

- Todo sale del **RNG con semilla** del núcleo. La semilla se muestra en el editor: con la misma semilla y especie se reproduce el mismo Pokémon (útil para depurar y equilibrar).
- La generación, el combate y la IA usan **flujos de RNG separados**, para que regenerar o editar un Pokémon no altere los demás resultados.
- Todo movimiento sorteado tiene **forma** y soporte, así que nunca sale uno inutilizable.

#### Editor

Panel de la capa web que permite modificar los Pokémon activos. Solo existe en escritorio, porque se abre con teclado.

- **Estadísticas:** se editan como en Showdown (**IV, EV, naturaleza y nivel**) y el valor final se recalcula al momento. Opción avanzada: editar el valor final directamente (1–999).
- **Movimientos:** cambiar cualquiera de los 4 por otro del conjunto aprendible de la especie. Los `excluded` se muestran desactivados.
- **Habilidad:** elegir entre las de la especie.
- **Regenerar:** volver a sortear todo o solo un bloque (stats o movimientos), con semilla nueva o la actual.
- **Retirar:** devuelve el Pokémon a su Poké Ball y libera el hueco, sin necesidad de combatir.
- **Importar / exportar** el Pokémon en formato de texto de Showdown: se puede traer un set ya hecho o llevarlo a Showdown. Un set importado con movimientos `excluded` se rechaza con un aviso que los enumera.

Reglas:
- Se edita **solo con la simulación en pausa**. Los cambios se aplican al reanudar, todos a la vez.
- Si cambian los PS máximos, los PS actuales se ajustan **en proporción** (un Pokémon al 50 % sigue al 50 %).
- Cambiar movimientos reinicia sus enfriamientos.
- El editor modifica el estado de la entidad en `core`; nunca escribe directamente en física ni en render.
- La exportación garantiza compatibilidad con Showdown **solo en modo legal**. Un valor final editado a mano no cabe en ese formato: se exportan IV, EV y naturaleza, y el editor avisa de lo que se pierde.

#### Pausa por teclado

| Acción | Tecla |
|---|---|
| Pausar (abre el editor) / reanudar | `Alt + P` |
| Cerrar el editor sin reanudar | `Esc` |

- Se detecta con `event.code === "KeyP"` (independiente de la distribución del teclado), `event.altKey` y `!event.ctrlKey`, con `preventDefault()`. En Windows, AltGr se notifica como Ctrl + Alt: sin esa exclusión, AltGr + P también pausaría.
- Funciona aunque el foco esté en un campo del editor, porque lleva modificador.
- La pausa congela el **paso fijo de física, la IA, los enfriamientos y las animaciones**; el render sigue mostrando el último estado.
- No hay botón de pausa, pero sí **feedback**: un indicador «Pausa» mientras dura y una línea con el atajo en el selector y en la página de ayuda, para que se pueda descubrir.
- Con el editor cerrado, el indicador muestra el enlace **«Abrir editor»** para volver a él. No pausa ni reanuda, así que no contradice la regla de la pausa.
- La combinación vive en un único sitio de configuración (`js/ui/shortcuts.js`) para poder cambiarla.
- En escritorio (Fase 8) ver [5.3](#53-escritorio).

### 4.8. De turnos a tiempo real

Los datos de Showdown describen un juego por turnos. Cada movimiento lleva un **nivel de soporte** en el JSON generado: `supported`, `adapted` o `excluded`. Solo los dos primeros entran en el sorteo.

| Grupo | Total | En sets Gen 9 | Tratamiento inicial |
|---|---:|---:|---|
| Daño directo con potencia fija | La mayoría | La mayoría | `supported` |
| Daño variable o fijo (`basePower` 0) | 41 | 11 | `excluded` hasta tener su función en `move-overrides.json` |
| Dos turnos (flag `charge`) | 17 | 2 | `adapted`: tiempo de preparación visible. Vuelo y Excavar esperan a la Fase 7 |
| Recarga (flag `recharge`) | 10 | 1 | `adapted`: inmóvil durante un tiempo tras el ataque |
| Multigolpe | 31 | 11 | `adapted`: ráfaga de impactos |
| KO directo | 4 | 0 | `excluded` |
| Autodestrucción | 7 | 2 | `excluded` hasta la Fase 7 |
| Prioridad distinta de 0 | 55 | 25 | `adapted`: reduce o aumenta el tiempo de ejecución |
| Dependen de turnos o del cambio de Pokémon (Protección, Sustituto, Ida y Vuelta, Mofa…) | Revisión manual | 18 | `excluded`, salvo los que tengan regla propia en `move-overrides.json` |

- **Sin cambio de Pokémon:** los movimientos que cambian al usuario solo hacen su daño.
- **Duraciones:** todo lo que los juegos miden en turnos (estados, clima, daño residual) se convierte con una constante única, `TURN_MS`. Una quemadura hace 1/16 de los PS cada `TURN_MS`.
- Los recuentos, y cómo repetirlos, están en el [informe](docs/INFORME_INVESTIGACION.md#5-resultados-con-datos-reales).

### 4.9. Final del combate

Sin turnos ni distancia que lo cancele, un combate podría no acabar nunca: Normal contra Fantasma, dos Pokémon solo con movimientos de Estado, o un `melee` que no puede alcanzar la plataforma del rival. Estas reglas garantizan el final **sin cancelar el combate por distancia**:

| Situación | Regla |
|---|---|
| Un Pokémon lleva `STRUGGLE_MS` sin ningún movimiento que pueda hacer daño | Usa un **ataque de último recurso** (inspirado en Forcejeo): `melee`, sin tipo y con daño propio por retroceso |
| El combate supera `SUDDEN_DEATH_MS` | **Muerte súbita:** ambos pierden un porcentaje creciente de PS máximos, estén donde estén |
| Ambos caen en el mismo tick | Doble KO: empate y los dos vuelven a su Poké Ball |
| Un Pokémon gana | El ganador sigue en el escenario. Ver la curación en [11.6](#116-decisiones-a-tomar-con-propuesta) |

---

## 5. Stack técnico

| Tecnología | Uso | Cuándo |
|---|---|---|
| **HTML** semántico | Páginas, navegación, selector, superficies | Fase 1 |
| **CSS** (custom properties) | Presentación, temas por escenario, capas | Fase 2 |
| **JavaScript** (módulos ES) | Motor, física, IA, combate, datos, puente DOM | Fase 3+ |
| JSDoc + `// @ts-check` | Tipado y autocompletado en el editor **sin TypeScript ni compilación** | Fase 3+ |
| `node --test` | Tests del núcleo | Fase 3+ |
| **Pokémon Showdown** (datos, Gen 9) | Stats base, movimientos con flags, aprendibles, tabla de tipos, naturalezas, sets de Random Battle, formato de exportación de sets | Fase 4 (solo en el script de build) |
| **PokéAPI** (CSV del repositorio) | Nombres en español | Fase 4 (solo en el script de build) |
| **PMD SpriteCollab** *(propuesta)* | Sprites animados, descargados en local | Fase 4 |
| **Electron** | Empaquetado de escritorio (Tauri como alternativa) | Fase 8 |
| Tiled | Opcional, solo si algún escenario lo necesita | Fase 7+ |

### 5.1. Por qué vanilla y sin motor gráfico

- **Los Pokémon se pintan en el DOM, no en un `<canvas>`.** Una capa `position:absolute` sobre la página con `pointer-events:none` y sprites movidos con `transform: translate3d()`. Así el mundo físico y la página comparten **el mismo sistema de coordenadas** (coordenadas de documento). El scroll no requiere conversión, salvo en elementos `fixed` o `sticky`, que se mueven respecto al documento (ver [6.4](#64-dom-bridge-fase-web)).
- **Interacción con los sprites:** la capa no captura clics. Si un sprite necesita ser interactivo, solo ese elemento activa `pointer-events:auto`.
- **La física necesaria es pequeña:** 2 cuerpos dinámicos contra unas decenas de rectángulos estáticos. Un motor AABB propio de ~200 líneas es más sencillo, ligero y controlable que integrar Phaser y sincronizarlo con el DOM.
- **Sin build para jugar:** se abre con cualquier servidor estático (Live Server, `npx serve`), porque los módulos ES no funcionan desde `file://`. Node solo hace falta para generar datos, descargar sprites y pasar tests.
- **Sin Tailwind:** exige compilación; con variables CSS y unos pocos componentes basta.

### 5.2. Pokémon Showdown como base de datos de combate

[Pokémon Showdown](https://github.com/smogon/pokemon-showdown) (código con licencia MIT) mantiene los datos de mecánicas más completos y actualizados de la comunidad. Lo usamos **como fuente de datos, no como simulador**: su motor es por turnos y el nuestro es en tiempo real.

| Dato de Showdown | Uso en WildPokeBattle |
|---|---|
| Pokédex (stats base, tipos, habilidades) | Estadísticas de cada especie |
| Moves (potencia, precisión, categoría, prioridad, objetivo, **flags**, efectos secundarios) | Daño, enfriamiento y **forma física** del movimiento (ver 4.5) |
| Learnsets | Conjunto aprendible para el editor |
| Sets de Random Battle (`data/random-battles/gen9/sets.json`) | Roles y movimientos **coherentes** al aparecer. Su nivel por especie se ignora: aquí es siempre 50 |
| Typechart y naturalezas | Efectividades y modificadores de stats |
| Fórmula de stats | Cálculo de valores finales a partir de base, IV, EV, nivel y naturaleza |
| Formato de exportación de sets | Importar/exportar Pokémon en el editor (texto que se pega en Showdown y viceversa) |

**Cómo se integra sin romper el stack vanilla:**
- Solo en `scripts/build-data.js` (Node). Se leen los datos con `@pkmn/dex` y `@pkmn/data` (MIT) y se genera **JSON estático** en `js/data/generated/`, que **sí se versiona**: quien clona el repo puede jugar sin ejecutar el build.
- El conjunto aprendible se calcula en el build con `canLearn` de `@pkmn/data`, sin leer los learnsets en bruto, para no tratar a mano las preevoluciones y las generaciones.
- En el navegador **no hay dependencias**: `main.js` carga esos JSON con `fetch` y se los inyecta al módulo `data`.
- El parser de sets para importar/exportar es propio y pequeño; los tests lo comparan con `@pkmn/sets`.
- Se registra en el JSON la versión de los paquetes y el commit de Showdown usados.
- Cuando llegue la Gen 10 no se actualiza automáticamente: cambiar de generación requiere un ADR.

> Si más adelante hace falta física compleja (articulaciones, formas no rectangulares), se valora una librería (Matter.js) **mediante ADR**, sin tocar el núcleo.

### 5.3. Escritorio

Electron con ventana transparente, sin bordes, siempre visible y con paso de clics (`setIgnoreMouseEvents(true, { forward: true })`; `forward` solo existe en macOS y Windows), persistencia de preferencias y optimización de recursos.

- **Atajo:** se registra con `globalShortcut`. Esa combinación deja de llegar a las demás aplicaciones, y si otra ya la tiene el registro falla sin error claro. Por eso debe ser configurable y la app debe comprobar que el atajo funciona.
- **Editor:** con la ventana en paso de clics no recibe teclado. Al pausar se desactiva el paso de clics y se le da el foco; al reanudar se restaura.
- **Bucle:** hay que desactivar `backgroundThrottling` para que la ventana sin foco no ralentice la simulación.

Leer elementos de **otras aplicaciones** requiere APIs del sistema operativo/accesibilidad y permisos; **Electron no lo da por sí solo**. Es objetivo de investigación de la Fase 8, no una capacidad garantizada. El [informe](docs/INFORME_INVESTIGACION.md#6-escritorio) resume qué esperar de cada sistema.

---

## 6. Arquitectura

### 6.1. Módulos

| Módulo | Responsabilidad | ¿Toca el DOM? |
|---|---|---|
| **core** | Entidades, estadísticas, estados, reglas, eventos, RNG con semilla | No |
| **physics** | Cuerpos, gravedad, colisiones AABB, paso fijo | No |
| **battle** | Daño, tipos, efectividad, enfriamientos, estados, fin de combate | No |
| **ai** | Decisiones autónomas de cada Pokémon | No |
| **data** | Consulta del JSON recibido por inyección, generación aleatoria de sets, cálculo de stats, import/export formato Showdown | No |
| **bridge** (DOM Bridge) | Convierte elementos `data-wpb-body` en cuerpos estáticos y los mantiene sincronizados | Sí |
| **render** | Sprites, animaciones y efectos en la capa DOM | Sí |
| **ui** | Selector, Pokédex, editor, atajos (`shortcuts.js`), menú contextual | Sí |
| **desktop** | Ventana Electron y fuentes de superficies del SO | Plataforma |

### 6.2. Regla de dependencias

```
ui ─┐
render ─┼──► core / physics / battle / ai / data
bridge ─┘                ▲
desktop ─────────────────┘
```

**Los módulos puros (`core`, `physics`, `battle`, `ai`, `data`) no importan nada del DOM, de Electron ni del navegador.** Tampoco hacen `fetch`: reciben sus datos como parámetros. Se prueban en Node y se reutilizan sin cambios en escritorio.

### 6.3. Bucle de juego

- `requestAnimationFrame` + **paso fijo de física** (1/60 s con acumulador) → resultados estables con cualquier tasa de refresco.
- El acumulador tiene **tope** (por ejemplo, 5 pasos por frame), para que un frame lento no provoque una espiral de actualizaciones.
- Orden por tick: `IA decide → física integra (X, resolver; Y, resolver) → combate aplica impactos → eventos`.
- El **render va fuera del paso fijo**: se ejecuta una vez por frame e interpola entre los dos últimos estados.
- **Las animaciones avanzan con el reloj del motor**, no con CSS: `render` cambia el frame del sprite según las duraciones de `AnimData.xml`, que van en 1/60 s y varían por frame. Así la pausa las congela sin código extra y el `HitFrame` de cada animación puede sincronizar el impacto.
- Cada subsistema usa su propio flujo de RNG con semilla → combates reproducibles en tests. La reproducibilidad exacta se exige **en Node con superficies fijas**; en el navegador, las superficies dependen del tamaño de la ventana.
- **Pausa:** el bucle guarda un conjunto de motivos (`pauseReasons`) y solo avanza si está vacío.
  - `manual`: lo activa y lo retira `Alt + P`.
  - `hidden`: lo activa y lo retira `visibilitychange`. Volver a la pestaña no reanuda una pausa manual.
- Al reanudar se descarta el tiempo acumulado para que no haya un «salto» de física.
- Las ediciones se encolan durante la pausa y se aplican en bloque en el primer tick tras reanudar.

### 6.4. DOM Bridge (fase web)

1. Buscar elementos `[data-wpb-body]` con caja activa.
2. Medir todos en **una sola pasada de lectura** (`getBoundingClientRect` + scroll) para evitar *layout thrashing*.
3. Crear, actualizar o retirar los cuerpos estáticos.
4. Re-medir solo cuando algo cambia: `ResizeObserver`, `MutationObserver` (atributos `data-wpb-*`, nodos), `resize` y carga de fuentes/imágenes.
5. Ignorar elementos ocultos (`display:none`, tamaño 0).

Casos que hay que cubrir expresamente:

- `ResizeObserver` avisa de cambios de **tamaño**, no de posición: un elemento desplazado porque otro creció no lo dispara. Se observa también el contenedor de la página y se re-mide todo el conjunto.
- Los elementos `position: fixed` o `sticky` cambian de coordenadas de documento al hacer scroll: se marcan y se re-miden con `scroll`.
- Una animación CSS con `transform` no dispara observadores: las superficies físicas no deben animarse así, o se tratan como dinámicas por ADR.

### 6.5. Evolución a escritorio

Se sustituye o amplía **la fuente de superficies**: en lugar de leer el DOM, un adaptador lee ventanas y elementos del SO y entrega los mismos rectángulos a `physics`. El resto no cambia.

El adaptador es responsable de convertir a un único sistema de coordenadas, teniendo en cuenta varios monitores y el escalado de pantalla.

---

## 7. Estructura de carpetas

Arrancar solo con lo de la Fase 1; el resto se crea al llegar a su fase.

```text
WildPokeBattle/
├── index.html
├── pages/
│   ├── prado.html
│   ├── pokedex.html
│   └── ayuda.html             # atajos, móvil, créditos y aviso legal
├── css/                       # Fase 2
│   ├── tokens.css             # colores, tipografía, espaciado
│   ├── base.css
│   ├── components.css         # botones, tarjetas, paneles
│   └── scenes/prado.css
├── js/                        # Fase 3+
│   ├── main.js                # arranque, carga de JSON y bucle
│   ├── core/                  # puro
│   ├── physics/               # puro
│   ├── battle/                # puro
│   ├── ai/                    # puro
│   ├── data/                  # puro: generación, stats, import/export
│   │   ├── generated/         # JSON generado (se versiona)
│   │   └── move-overrides.json
│   ├── bridge/dom-bridge.js
│   ├── render/
│   └── ui/                    # selector, editor, shortcuts.js
├── assets/
│   ├── sprites/               # descargados, en .gitignore
│   ├── backgrounds/  tiles/
│   └── ASSETS.md              # origen y licencia de CADA recurso
├── scripts/                   # Node, fuera del juego
│   ├── build-data.js          # genera el JSON desde Showdown + PokéAPI
│   └── fetch-assets.js        # descarga sprites y genera CREDITS.md
├── tests/                     # node --test
├── desktop/                   # Fase 8 (Electron: main.js, preload.js)
├── docs/
│   ├── INFORME_INVESTIGACION.md
│   ├── CHULETA.md             # resumen para clase
│   └── decisions/             # ADR: una decisión por archivo
├── package.json               # Fase 3: "type": "module", scripts, devDependencies
├── .gitignore                 # node_modules/, assets/sprites/
├── AGENTS.md                  # reglas para agentes (sección 10)
├── CREDITS.md                 # autores de sprites (generado)
├── LICENSE                    # solo del código propio
└── README.md
```

---

## 8. Hoja de ruta

Cada fase tiene un **«Hecho cuando»** comprobable. No se empieza una fase sin cerrar la anterior.

> Las Fases 1 y 2 se hicieron en el mismo trabajo y en orden: primero el HTML validado, después el CSS.

### Fase 1 — Estructura HTML pura ✅

**Objetivo:** web navegable y semántica, sin JS.

- [x] `index.html` con `header`, `nav`, `main`, `footer`.
- [x] `pages/prado.html` con secciones, artículos, listas y tarjetas.
- [x] Botón **«Seleccionar Pokémon»** y estructura del selector: `<dialog popover>`, que abre y cierra con HTML, sin JS.
- [x] Estructura del **editor** (formulario con las 6 estadísticas, 4 selectores de movimiento, semilla, «Regenerar» y «Retirar»), sin funcionalidad. Mientras no exista `Alt + P`, la maqueta se ve en `prado.html#editor`, enlazada desde la ayuda.
- [x] Elementos candidatos marcados con `data-wpb-body`.
- [x] Rutas relativas entre todas las páginas.

**Hecho cuando:** se navega por todas las páginas sin enlaces rotos, el HTML valida en el [W3C Validator](https://validator.w3.org/) y en el prado hay al menos un suelo, dos plataformas y una pared marcados.

### Fase 2 — Diseño visual (CSS) ✅

Tokens de color y tipografía, layout responsive, botones/tarjetas/paneles, identidad del prado, fondo y elementos ambientales, diseño del selector, capa reservada para los Pokémon. Estilo: **cuaderno de campo**, con fuentes del sistema y arte propio en CSS y SVG.

**Hecho cuando:** el prado es reconocible, funciona de 360 px a escritorio y el CSS no contiene lógica física.

### Fase 3 — Motor físico con caja de prueba ⬅ *siguiente*

> Antes de la Fase 4 a propósito: se valida lo más arriesgado (física + DOM Bridge) con un rectángulo, sin depender de datos externos.

El desnivel máximo entre superficies del prado es de unos 140 px en escritorio y 160 px a 360 px de ancho: el salto base debe alcanzarlo.

Bucle con paso fijo, **pausa con `Alt + P`**, gravedad, aceleración, fricción, salto, colisiones AABB, plataformas de un sentido, detección de suelo, DOM Bridge, modo vuelo básico, tests en Node.

**Hecho cuando:** un rectángulo cae, aterriza, salta y choca en el prado; al redimensionar la ventana, desplazar un elemento o desactivar un `data-wpb-body` la física se actualiza; `Alt + P` lo congela y lo reanuda sin saltos; volver a la pestaña no reanuda una pausa manual; los tests de `physics` pasan.

### Fase 4 — Datos Pokémon, selector y ritmo

`scripts/build-data.js` genera JSON desde **Showdown** para un **conjunto acotado** (≈ 12 especies): stats base, habilidades, aprendibles, roles de Random Battle, movimientos con flags, forma y nivel de soporte, typechart y naturalezas. Añade nombres en español. `scripts/fetch-assets.js` descarga sprites y créditos. Selector funcional, **generación aleatoria con semilla**, sprite asociado (o silueta), límite de 2.

Incluye un **spike de ritmo sin interfaz**: un script en Node enfrenta las especies con daño y enfriamientos, sin física, para fijar `battleScale`, `TURN_MS` y los enfriamientos base antes de construir la IA.

**Hecho cuando:** se elige un Pokémon, sale con stats y movimientos aleatorios y se comporta como la caja de la Fase 3 con su sprite; la misma semilla genera el mismo Pokémon; funciona sin conexión una vez descargados los sprites y sin sprites muestra siluetas; no se puede crear un tercero; el spike da una duración media dentro del objetivo.

### Fase 5 — Movimiento autónomo

Caminar, detenerse, girar, saltar obstáculos, explorar, no atascarse, perfiles de comportamiento. IA separada de la física.

**Hecho cuando:** un Pokémon solo explora el prado 5 minutos sin quedarse atascado y dos especies distintas se mueven de forma visiblemente diferente.

### Fase 6 — Segundo Pokémon y combate

Selección de objetivo, posicionamiento, ataques básicos, PS y daño, tipos, enfriamientos, retroceso, debilitamiento, reglas de final de combate, sustitución, victoria/derrota.

**Hecho cuando:** dos Pokémon combaten sin turnos hasta que uno cae, los tipos alteran el resultado, un combate con la misma semilla es reproducible en tests y un combate entre Pokémon que no pueden dañarse también termina.

### Fase 6B — Editor e importación

> Se separa de la Fase 4 para probar el editor con combate real.

Editor funcional en pausa (stats, movimientos, habilidad, regenerar, retirar) e import/export en formato Showdown.

**Hecho cuando:** se puede pausar a mitad de combate, editar a uno de los dos y reanudar con los cambios en efecto; un set exportado en modo legal se pega en Showdown sin errores; un set con movimientos excluidos se rechaza con un aviso.

### Fase 7 — Combate avanzado y escenarios

Proyectiles, área, esquivas, estados alterados, capacidades físicas (vuelo, excavar, teletransporte, surf), superficies destruibles, menú de clic derecho, nuevos escenarios.

### Fase 8 — Escritorio

Empaquetado con Electron, ventana transparente y click-through, atajo global configurable, persistencia, optimización, investigación de superficies del SO y prueba con aplicaciones compatibles.

### Fase 9 — Ampliación

Más especies y Pokédex progresiva, evoluciones, colección y personalización, más escenarios, mejoras de IA, rendimiento y estabilidad.

---

## 9. Criterios de aceptación globales

- [ ] Nunca hay más de 2 Pokémon activos.
- [ ] Gravedad, salto, plataformas, paredes y límites funcionan desde la primera aparición.
- [ ] El vuelo está contemplado en la arquitectura.
- [ ] Los Pokémon se mueven de forma independiente y pueden separarse sin que se cancele el combate.
- [ ] Todo combate termina, incluso entre Pokémon que no pueden dañarse.
- [ ] La IA elige acciones y ataques sola; estadísticas y tipos cambian el comportamiento.
- [ ] Cada Pokémon aparece con stats y movimientos aleatorios válidos y reproducibles por semilla, con al menos un ataque de daño.
- [ ] `Alt + P` pausa y reanuda todo sin botón en pantalla; en pausa se editan stats y movimientos y se aplican al reanudar.
- [ ] Los ataques producen efectos físicos coherentes.
- [ ] Los elementos HTML marcados actúan como superficies; desactivar su caja los saca de la física sin ocultarlos.
- [ ] Cambios de tamaño y posición se reflejan en la simulación.
- [ ] La página sigue siendo usable (clics, selección de texto) con los Pokémon encima.
- [ ] En móvil se puede elegir Pokémon y ver el combate.
- [ ] Los módulos puros funcionan en Node y se reutilizan en escritorio sin cambios.
- [ ] El repositorio no contiene sprites y cada recurso usado tiene su crédito.

---

## 10. Reglas para agentes de programación

> Recomendado: copiar esta sección a `AGENTS.md` en la raíz para que los agentes la carguen automáticamente.

**Antes de tocar nada**
1. Leer este README, el [informe](docs/INFORME_INVESTIGACION.md) y la documentación de la tarea.
2. Comprobar en qué fase está el proyecto. No implementar funciones de fases posteriores.

**Decisiones de diseño (no negociables sin ADR)**
3. Máximo 2 Pokémon activos.
4. Sin combate por turnos ni distancia global que lo cancele.
5. Movimiento libre y autónomo, perspectiva lateral 2D, gravedad como regla general.
6. El escenario es interactivo, nunca una imagen plana.
7. Generación aleatoria siempre a través del RNG con semilla del núcleo (nunca `Math.random()` directo).
8. Pausa solo por teclado: **no añadir botón de pausa** en pantalla.

**Código**
9. HTML, CSS y JS vanilla con módulos ES. **No añadir dependencias, frameworks ni pasos de build** al juego sin explicar qué necesidad resuelven. Excepción aprobada: paquetes de datos de Showdown como `devDependencies`, **solo en `scripts/` y `tests/`**.
   - Los datos de mecánicas salen de Showdown; no copiar su simulador por turnos ni mezclar su lógica con la del motor en tiempo real.
10. `core`, `physics`, `battle`, `ai` y `data` no tocan el DOM ni APIs del navegador.
11. No confundir caja visual con cuerpo físico. Cero lógica física en CSS.
12. No duplicar lógica entre web y escritorio. Rutas relativas.
13. No asumir que un recurso gráfico es libre: registrar origen y licencia en `assets/ASSETS.md`.
14. **No subir sprites al repositorio.** No enlazar en caliente sprites de terceros.
15. Toda excepción de movimientos va en `js/data/move-overrides.json`, no en condiciones repartidas por el código.

**Ante dudas**
16. Si una decisión no está definida, documentar la duda y proponer opciones. No inventarla como aprobada.
17. No sustituir una decisión aprobada por algo más sencillo sin justificarlo.

### 10.1. Reglas para el HTML y el CSS

- Las páginas no llevan JS ni física hasta la fase que los introduce.
- No simular el combate con animaciones.
- Priorizar semántica, navegación y organización.
- Preparar el marcado (`data-wpb-body`, `id`, clases) para las capas futuras sin implementarlas.
- No dar por terminada una funcionalidad que solo tenga estructura HTML.
- Las superficies físicas no usan `transform`, `translate`, `scale`, `rotate`, `fixed` ni `sticky`, tampoco en `:hover`. Solo se animan las capas decorativas sin `data-wpb-body`.

### 10.2. Informe al terminar cada tarea

```markdown
**Archivos:** creados / modificados
**Hecho:** funcionalidad implementada
**Decisiones:** técnicas tomadas (¿requiere ADR?)
**Dependencias:** añadidas / retiradas
**Pruebas:** qué se probó y resultado
**Limitaciones y pendientes:** bloqueos, documentación a actualizar
```

---

## 11. Riesgos y decisiones pendientes

No presentar nada de esto como ya resuelto.

### 11.1. Integración con aplicaciones externas
El navegador solo ve el DOM propio. En escritorio hará falta API del SO, accesibilidad y permisos; la compatibilidad variará entre apps y sistemas.

### 11.2. Sincronización DOM ↔ física
Scroll, zoom, redimensionado, elementos dinámicos y cambios de visibilidad. Mitigado usando coordenadas de documento y observadores (6.4); hay que cubrirlo con pruebas manuales en la Fase 3.

### 11.3. Rendimiento
Con 2 cuerpos dinámicos el coste de colisión es mínimo; el riesgo real es **re-medir el DOM en cada frame**. Medir solo ante cambios y limitar la física a elementos marcados. Objetivo: 60 fps estables en un portátil medio.

### 11.4. Recursos y licencias

Que algo esté en Internet no da permiso para redistribuirlo. Pokémon es propiedad de Nintendo/Game Freak/The Pokémon Company: proyecto de fans, **sin uso comercial** (sin anuncios, donaciones ni ventas). Hay antecedentes de retiradas de proyectos de fans, así que el proyecto puede tener que cerrarse si los titulares lo piden.

**Propuesta de sprites: PMD SpriteCollab.** Es la única fuente estudiada con animaciones de caminar y atacar en 8 direcciones, y sus sprite sheets se pueden congelar en la pausa. Los GIF animados no, y además las fuentes de Showdown y PokéAPI son sobre todo poses frontales.

| Fuente | Decisión | Motivo |
|---|---|---|
| PMD SpriteCollab | Propuesta principal | CC BY-NC 4.0: uso no comercial y crédito a cada autor. Algunos autores pueden imponer condiciones propias. Parte del material procede de los juegos oficiales (las 12 especies del MVP figuran acreditadas a CHUNSOFT), y esa licencia no puede autorizarlo: es otro motivo para no redistribuirlo |
| PokéAPI (`PokeAPI/sprites`) | No se usa para el juego | Se reparte como CC0, pero indica que las imágenes son copyright de The Pokémon Company. Incluye los GIF de Showdown (`other/showdown`), hechos por la comunidad de Smogon |
| Showdown (`play.pokemonshowdown.com`) | No se usa | No se enlaza ni se redistribuye |

**Publicación.** El código es público y los sprites no se versionan: cada persona los descarga con `scripts/fetch-assets.js`, que también genera `CREDITS.md`. El repositorio funciona sin ellos, con siluetas. Por eso no hay demo pública con sprites. La licencia de `LICENSE` cubre solo el código propio, y la portada lleva el aviso legal del final de este documento.

Los detalles y la comparación están en el [informe](docs/INFORME_INVESTIGACION.md#3-sprites-y-licencias).

### 11.5. Equilibrio de combate
Las estadísticas oficiales son referencia; tiempos, enfriamientos, alcance y daño en tiempo real necesitan reglas propias y pruebas de equilibrio. El spike de la Fase 4 fija los primeros valores.

### 11.6. Decisiones a tomar (con propuesta)

| Pregunta | Propuesta |
|---|---|
| ¿Cuánto debe durar un combate? | 30–90 s de media; se ajusta con `battleScale` en la Fase 4 |
| ¿Cuánto valen `TURN_MS`, `STRUGGLE_MS` y `SUDDEN_DEATH_MS`? | Partir de 2 s, 15 s y 3 min, y ajustar con el spike |
| ¿El ganador se cura? | Sí: recupera todos los PS y pierde sus estados al terminar, para que el siguiente combate sea justo |
| ¿Edición libre o dentro de límites legales del juego? | Por defecto, legal según Showdown (IV 0–31, EV ≤ 252 por stat y 510 en total, movimientos aprendibles). Interruptor «modo libre» para saltarse los límites |
| ¿Se conservan los cambios entre sesiones? | No en la web inicial; en Fase 8/9, guardar Pokémon favoritos (semilla + ediciones) |
| ¿`Alt + P` choca con algún atajo? | No figura en la lista oficial de Chrome para Windows. Falta comprobarlo en Firefox, Edge y macOS (`Option + P` escribe «π») |
| ¿Qué sprites se usan? | PMD SpriteCollab, tras revisar las condiciones de los autores de las 12 especies del MVP |
| ¿Qué 12 especies forman el MVP? | Venusaur, Charizard, Blastoise, Pikachu, Gengar, Snorlax, Dragonite, Scizor, Tyranitar, Gardevoir, Garchomp y Lucario. Todas tienen set y animación de caminar. Se fija en la Fase 4 |

---

## 12. Glosario

| Término | Significado |
|---|---|
| Pokémon activo | Entidad presente ahora en el escenario |
| Core | Núcleo independiente con reglas y estado del juego |
| DOM | Árbol de elementos HTML de la página |
| DOM Bridge | Módulo que traduce elementos HTML marcados a superficies físicas |
| Caja visual | Geometría que pinta el navegador |
| Caja física | Geometría que usa el motor para colisionar |
| AABB | Rectángulo alineado con los ejes; base de las colisiones |
| Paso fijo | Física calculada a intervalos constantes, independiente de los fps |
| Arena | Escenario físico donde se mueven los Pokémon |
| IA | Sistema de decisiones autónomas del Pokémon |
| Enfriamiento | Tiempo antes de reutilizar un movimiento |
| Forma | Cómo se comporta un movimiento en el espacio: `melee`, `projectile`, `beam`, `area`, `global` o `self` |
| Nivel de soporte | Si un movimiento funciona tal cual (`supported`), con reglas propias (`adapted`) o no está disponible (`excluded`) |
| Habilidad | Rasgo de la especie en los juegos Pokémon (Espesura, Intimidación…) |
| Capacidad física | Regla de movimiento o escenario que activa un ataque (vuelo, excavación…) |
| Rol | Variante de set de Random Battle con sus propios movimientos (por ejemplo, «Fast Attacker») |
| Semilla | Número que fija el resultado del generador aleatorio; misma semilla, mismo resultado |
| Conjunto aprendible | Movimientos que una especie puede aprender según los learnsets de Showdown |
| Set | Configuración completa de un Pokémon (stats, movimientos, habilidad, naturaleza), en el formato de texto de Showdown |
| Muerte súbita | Pérdida progresiva de PS que garantiza el final de un combate demasiado largo |
| ADR | Registro breve de una decisión de arquitectura y su porqué, en `docs/decisions/` |

---

## 13. Referencias

- [Informe de investigación](docs/INFORME_INVESTIGACION.md) — análisis y fuentes completas
- Pokémon Showdown (código y datos) — https://github.com/smogon/pokemon-showdown
- Paquetes de datos `@pkmn` — https://github.com/pkmn/ps
- PokéAPI — https://pokeapi.co/
- PMD SpriteCollab — https://github.com/PMDCollab/SpriteCollab
- MDN: Módulos JavaScript — https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules
- MDN: `ResizeObserver` — https://developer.mozilla.org/es/docs/Web/API/ResizeObserver
- MDN: `MutationObserver` — https://developer.mozilla.org/es/docs/Web/API/MutationObserver
- Node.js test runner — https://nodejs.org/api/test.html
- Electron — https://www.electronjs.org/docs/latest/
- Tauri — https://tauri.app/start/
- Tiled — https://www.mapeditor.org/

---

**Aviso legal:** WildPokeBattle es un proyecto de fans, gratuito y sin ánimo de lucro. No está afiliado, patrocinado ni aprobado por Nintendo, Game Freak, Creatures Inc. ni The Pokémon Company. Pokémon y los nombres de sus personajes son marcas de sus respectivos titulares.

**WildPokeBattle — Los Pokémon no son animaciones colocadas sobre una página: son entidades autónomas que viven, se mueven e interactúan con el entorno digital.**
