# Informe de investigación de WildPokeBattle

Guía complementaria al [README](../README.md). El README dice **qué se construye**; este informe explica **por qué**, con qué fuentes y qué sigue sin confirmar.

Información consultada el 4 de noviembre de 2026. Las licencias, las APIs y los datos cambian: conviene revisarlos al empezar la fase que los usa.

---

## 1. Resumen

**Conclusiones principales**

1. **Datos:** la combinación de Showdown y PokéAPI es correcta. Showdown da las mecánicas y PokéAPI los nombres en español. No se ha encontrado ninguna API oficial de datos de juego.
2. **Sprites:** es el mayor riesgo y el punto que más condiciona el diseño. Solo PMD SpriteCollab tiene las animaciones que necesita un juego lateral, pero ninguna fuente da permiso real para redistribuir el arte. Por eso los sprites no se suben al repositorio.
3. **Formas de movimiento:** la tabla original fallaba con 130 movimientos. La nueva clasifica los 892 con reglas por orden de precedencia.
4. **Fin de combate:** faltaba garantizar que un combate termine. Sin esa regla, Normal contra Fantasma podía no acabar nunca.
5. **Ritmo:** con las fórmulas originales, un combate se decide en 2–4 golpes. Hace falta un multiplicador global, `battleScale`, y una prueba sin interfaz antes de construir la IA.
6. **Originalidad:** no se ha encontrado ningún proyecto que combine las tres ideas: la página como escenario físico, Pokémon autónomos y combate en tiempo real. Cada idea por separado sí tiene precedentes.

**Cómo usar este informe**

| Si vas a trabajar en… | Lee |
|---|---|
| `scripts/build-data.js` (Fase 4) | [Sección 2](#2-apis-y-fuentes-de-datos) y [sección 5](#5-resultados-con-datos-reales) |
| Sprites y `render` (Fase 4) | [Sección 3](#3-sprites-y-licencias) |
| IA y combate (Fases 5–7) | [Sección 4](#4-juegos-y-proyectos-similares) y [sección 5](#5-resultados-con-datos-reales) |
| Escritorio (Fase 8) | [Sección 6](#6-escritorio) |
| Publicar el repositorio | [Sección 7](#7-riesgo-legal-y-publicación) |

---

## 2. APIs y fuentes de datos

### 2.1. APIs oficiales

**No se ha encontrado ninguna API pública oficial de The Pokémon Company con datos de los juegos.** Es un resultado de búsqueda, no una confirmación de la compañía. Las fuentes que se usan en la comunidad son proyectos no oficiales.

### 2.2. Comparativa

| Fuente | Qué aporta | Licencia | Límites | Veredicto |
|---|---|---|---|---|
| **Pokémon Showdown** | Stats, movimientos con flags, aprendibles, tipos, sets de Random Battle | Código MIT | Datos pensados para un juego por turnos | **Base de mecánicas** |
| **`@pkmn/dex` + `@pkmn/data`** | Acceso a esos datos desde Node, filtrado por generación, `canLearn`, cálculo de stats | MIT | `canLearn` es asíncrono. Algunos campos pueden apuntar a datos de otra generación | **Usar en `build-data.js`** |
| **`@pkmn/sets`** | Importar y exportar sets en formato Showdown | MIT | Sería una dependencia en el navegador | **Solo en tests**, para validar el parser propio |
| **`@pkmn/sim` (`TeamValidator`)** | Valida legalidad de sets completos | MIT | Paquete pesado para esta necesidad | Opcional en tests de la Fase 6B |
| **`@smogon/calc`** | Daño según los juegos | MIT | Su fórmula es más completa que la nuestra | **Solo en tests**, como referencia con tolerancia |
| **PokéAPI: CSV del repositorio** | Nombres y textos traducidos, sin peticiones a la API | BSD-3 (código y datos del proyecto) | Conviene fijar un commit | **Nombres en español** |
| **PokéAPI: REST** | Los mismos datos, en JSON | Igual | Sin límite de peticiones desde 2018, pero exige caché local. Incumplir su política puede suponer un bloqueo permanente de IP | Innecesaria en ejecución |
| **PokéAPI: GraphQL** | Consultas a medida | Igual | 100 llamadas por hora e IP | Descartada |
| **APIs de TCG** (`pokemontcg.io` y similares) | Datos de cartas | Varía | No contienen datos de los videojuegos | Descartadas |

### 2.3. Detalles útiles para `build-data.js`

**Movimientos.** Los datos de Showdown incluyen `target`, `category`, `flags`, `priority` y `basePower`. Se pueden consultar en [`moves.json`](https://play.pokemonshowdown.com/data/moves.json).

**Sets de Random Battle.** Están en [`data/random-battles/gen9/sets.json`](https://github.com/smogon/pokemon-showdown/blob/master/data/random-battles/gen9/sets.json) con esta forma:

```json
{
  "pikachu": {
    "level": 93,
    "sets": [
      {
        "role": "Fast Attacker",
        "movepool": ["Fake Out", "Knock Off", "Play Rough", "Surf", "Volt Switch", "Volt Tackle"],
        "abilities": ["Lightning Rod"],
        "teraTypes": ["Water"]
      }
    ]
  }
}
```

- `level` está pensado para equilibrar Random Battle (entre 64 y 100). Aquí se ignora porque el nivel es 50.
- `teraTypes` no se usa.

**Nombres en español.** En el repositorio de PokéAPI, `data/v2/csv/languages.csv` indica que `es` tiene el ID **7**, comprobado en el archivo. `pokemon_species_names.csv` usa ese ID, con filas como `6,7,Charizard,Pokémon Llama`. Antes de usar los archivos equivalentes de movimientos y habilidades hay que confirmar su nombre y que cubren las especies del MVP.

**Stats.** Ejemplo de la documentación de `@pkmn/data`:

```js
gens.get(6).stats.calc('atk', 100, 31, 252, 100, gens.get(6).natures.get('adamant')) === 328;
```

**Generación.** Se fija la Gen 9. La Gen 10 (Pokémon Winds y Waves) está anunciada para 2027 y no se ha confirmado cuándo la soportará Showdown. Cambiar de generación altera datos y sets, así que debe ser una decisión consciente.

---

## 3. Sprites y licencias

### 3.1. Tres capas de derechos

Conviene separar tres cosas que se confunden con facilidad:

1. **Licencia del código:** MIT, BSD, GPL. Permite usar el *software*.
2. **Licencia del arte de la comunidad:** por ejemplo CC BY-NC. Cubre solo lo que el autor puede ceder.
3. **Derechos de Nintendo, Game Freak y The Pokémon Company:** personajes, marcas y arte oficial. **Ninguna licencia de terceros los cede.**

Por eso, que un paquete sea MIT o un repositorio sea CC0 no significa que sus imágenes sean libres.

### 3.2. Comparativa

| Fuente | Vista | Animaciones | ¿Se puede pausar? | Situación legal |
|---|---|---|---|---|
| **PMD SpriteCollab** | 8 direcciones | 35 tipos en Pikachu: Walk, Idle, Attack, Hurt, Hop, Faint… | **Sí**, son sprite sheets | CC BY-NC 4.0 para lo que aporta la comunidad; hay material oficial |
| **PokéAPI `showdown`** | Frente y espalda | Una animación en bucle | No, son GIF | Repo CC0, pero indica copyright de The Pokémon Company; arte de la comunidad de Smogon |
| **PokéAPI estáticos** | Frente y espalda | Ninguna | Sí, no se mueven | Igual que el anterior |

**Los GIF no sirven para este proyecto:** no se pueden pausar con CSS, así que incumplirían «la pausa congela las animaciones». Además, un juego lateral necesita caminar de perfil, y estas fuentes muestran al Pokémon de frente o de espaldas.

### 3.3. Lo que se ha comprobado en SpriteCollab

Se ha revisado el sprite real de Pikachu (`sprite/0025/`):

- **Animaciones:** `AnimData.xml` define 35. El tamaño del frame cambia entre animaciones: Walk es de 32×40 y Attack de 80×80.
- **Duraciones variables:** Walk usa `8, 10, 8, 10`, en unidades de 1/60 s, la misma unidad que el paso fijo. CSS `steps()` no representa duraciones desiguales, y por eso el README hace avanzar los frames con el reloj del motor.
- **`HitFrame`:** marca el frame del impacto, útil para sincronizarlo con el daño.
- **Offsets:** `Offsets.png` marca el centro del cuerpo, las manos y la cabeza. `Shadow.png` marca la sombra. Sirven para colocar efectos.
- **Direcciones:** cada fila del sheet es una dirección. La documentación no indica el orden, así que hay que comprobarlo con un sprite real. Basta con una dirección lateral y reflejarla con `scaleX(-1)`.
- **Cobertura:** `tracker.json` tiene 1026 entradas, con 965 marcadas con algún nivel de sprite completado. Hay que confirmar las 12 especies del MVP.
- **Créditos:** cada sprite tiene `credits.txt` y `tracker.json` incluye `sprite_credit`. `fetch-assets.js` puede generar `CREDITS.md` automáticamente.

> **Aviso:** de 18 especies revisadas en `tracker.json`, 16 figuran acreditadas a **CHUNSOFT**, el estudio de Pokémon Mundo Misterioso, incluidas las 12 propuestas para el MVP. Las otras dos, Mimikyu y Greninja, son obra de la comunidad. Por tanto, buena parte del repositorio es material oficial. La licencia CC BY-NC solo cubre lo que el licenciante puede ceder, y no autoriza ese material.

Además, algunos autores de la comunidad publican condiciones propias en sus páginas de créditos. Si se añaden especies acreditadas a la comunidad, hay que revisar esas condiciones.

### 3.4. Flujo recomendado

1. `fetch-assets.js` descarga solo las especies del MVP desde un commit fijado.
2. Genera `CREDITS.md` a partir de `tracker.json` y `credits.txt`.
3. `assets/sprites/` queda en `.gitignore`.
4. Si faltan sprites, `render` muestra una silueta. El repositorio público funciona sin ellos.

---

## 4. Juegos y proyectos similares

### 4.1. Combate en tiempo real

| Referencia | Cómo funciona | Qué aprovechar | Qué evitar |
|---|---|---|---|
| **Pokémon Legends: Z-A** | Movimientos con enfriamiento en lugar de PP, con preparación y ejecución. La posición importa | Enfriamientos, más largos en los ataques fuertes; alcance real; preparación visible | Copiar sus valores: es 3D, con entrenador y sin físicas de plataformas |
| **Pokémon UNITE** | Ataques básicos sin enfriamiento, más débiles que los movimientos | **Ataque básico sin enfriamiento**: evita que un Pokémon se quede quieto cuando todo está en enfriamiento | Su progresión y objetivos de equipo |
| **Pokkén Tournament** | Triángulo de ataque, agarre y contraataque; fases de campo y de duelo | Ideas para la Fase 7; dos distancias de combate con ritmos distintos | Controles de lucha; aquí el usuario no controla |
| **Monster Rancher** | Las técnicas dependen de la distancia, con un recurso que se recupera si no se ataca. Puede luchar solo | **La referencia más cercana a la IA**: elegir según distancia y recurso, en un eje | La acción que se detiene durante cada ataque |
| **Pokémon Auto Chess** | Auto-battler de fans, código abierto y sin ánimo de lucro | Su postura pública: declara que los derechos son de The Pokémon Company y que puede cerrar si se lo piden | Copiar código: es GPL-3 y este proyecto no lo es. No se ha verificado el detalle de sus mecánicas |

**Propuestas derivadas para el diseño** (no están aprobadas):

- Añadir un ataque básico sin enfriamiento, para que el combate nunca tenga huecos muertos.
- Enseñar el tiempo de preparación con una pose o un aviso, para que los esquives se vean justos y el combate se entienda.
- Modelar la decisión de la IA como puntuación por distancia, como hace Monster Rancher, antes de probar algo más complejo.

### 4.2. Mascotas de escritorio y de editor

| Referencia | Tecnología | Licencia | Qué aprovechar |
|---|---|---|---|
| **eSheep / desktopPet** | Windows; hay versión JavaScript | No verificada | Comportamientos definidos en XML (`animations.xml`) y editor en línea: **datos separados del motor** |
| **Shimeji Desktop Mascot** | Windows | GPLv3 | Caminar, trepar y sentarse sobre ventanas: es la experiencia objetivo de la Fase 8 |
| **Shijima-Qt** | Windows, macOS y Linux | GPLv3 | Hay usuarios que indican que ignora las ventanas abiertas: buen aviso de lo difícil que es hacerlo multiplataforma |
| **WindowPet** | Tauri + React | MIT | Mascotas con paso de clics y arrastre preciso. Se documenta el paso de clics, no el caminar sobre ventanas |
| **BongoCat** | Tauri | No verificada | Citado como referencia de personaje transparente con Tauri |
| **VS Code Pets** | Extensión de VS Code | MIT | Lista de créditos por recurso, ejemplo para `CREDITS.md` |
| **VS Code Pokémon** | Derivado de VS Code Pets | No verificada | Aviso de proyecto de fans sin fines comerciales; guarda las mascotas entre sesiones |

Las licencias GPLv3 solo importan si se reutiliza código: las ideas se pueden aprovechar, pero copiar código obligaría a publicar bajo GPL.

### 4.3. La página como escenario

| Referencia | Qué hace | Qué aprovechar |
|---|---|---|
| **StickFigureBookmarklet** | Un personaje usa los elementos de una página como plataformas | Su lista de tareas avisa de que `getClientRects()` devuelve un rectángulo por línea de texto: si se usan elementos en línea como superficies, una caja no basta. Se evita marcando solo bloques |
| **Snakey** | Una serpiente se come elementos del DOM tras crear cuerpos físicos | Idea de superficies destruibles para la Fase 7 |
| **Break The Dom** | Un personaje dispara a elementos de la página, con efectos temporales | Destruir sin alterar la página de verdad |
| **Tutorial de Matter.js con el DOM** | Convierte elementos en cuerpos físicos | Referencia si un ADR aprueba usar Matter.js |

### 4.4. Referencias sin verificar

| Nombre | Resultado de la búsqueda |
|---|---|
| **Pokémon Apex Arena** | No aparece. Títulos parecidos: Pokémon Apex (por turnos), Pokémon Arena (simulador PvP en tiempo real), Pokémon Emerald Arena (ROM hack) y Pokémon Campaign (Flash) |
| **DesktopInvasion** | No aparece. Títulos parecidos: Desktop Creatures, Desktop Zoo y Desktop Pet |

Se mantienen en el README con la marca «sin verificar», hasta tener un enlace o retirarlas.

---

## 5. Resultados con datos reales

**Método.** Se descargaron `moves.json` y `sets.json` de Gen 9 el 4 de noviembre de 2026 y se aplicaron las reglas con un script en Node. Se excluyeron los movimientos con `isNonstandard` distinto de `Past`, lo que deja **892 movimientos**. Las cifras cambiarán cuando Showdown actualice sus datos.

### 5.1. Formas de movimiento

La tabla original ponía en `self` todos los de categoría Estado, y **130 movimientos** quedaban mal: iban dirigidos a otro objetivo o a todo el campo. Por ejemplo, Tóxico, Onda Trueno, Fuego Fatuo, Trampa Rocas y Danza Lluvia.

Reparto con las reglas nuevas de la [sección 4.5 del README](../README.md#45-combate):

| Forma | Movimientos |
|---|---:|
| `melee` (flag `contact`) | 266 |
| `melee` (fallback Físico) | 91 |
| `projectile` (fallback Especial) | 163 |
| `projectile` (flag `bullet`) | 23 |
| `projectile` (Estado con objetivo) | 96 |
| `self` | 109 |
| `area` | 97 |
| `global` | 42 |
| `beam` (flag `pulse`) | 5 |
| **Total** | **892** |

**Limitaciones de la derivación**

- Solo 5 movimientos llegan a `beam` por flag. Hiperrayo, Rayo Hielo, Rayo Solar y Rayo salen como `projectile`, así que `move-overrides.json` debe recoger los rayos.
- `target: scripted` (Contraataque, Manto Espejo) cae en el fallback, pero depende de un daño recibido: necesita su propia regla.
- Cuatro movimientos con `target: adjacentAlly` (como Refuerzo) solo tienen sentido en combates dobles y deberían excluirse.
- Excavar y Vuelo salen como `melee`, pero en realidad son capacidades físicas de la Fase 7.

### 5.2. Movimientos que no encajan en tiempo real

Los grupos se solapan, así que no se pueden sumar. La columna «en sets» cuenta sobre los 348 movimientos distintos que aparecen en los sets.

| Grupo | Total | En sets | Ejemplos en sets |
|---|---:|---:|---|
| Daño con `basePower` 0 | 41 | 11 | Patada Baja, Hierba Lazo, Tinieblas, Superdiente |
| Carga (`charge`) | 17 | 2 | Rayo Solar, Rayo Meteórico |
| Recarga (`recharge`) | 10 | 1 | Gigaimpacto |
| Multigolpe | 31 | 11 | Triple Axel, Pedrada, Dracoflechas |
| KO directo | 4 | 0 | — |
| Autodestrucción | 7 | 2 | Explosión, Deseo Cura |
| Prioridad distinta de 0 | 55 | 25 | Golpe Bajo, Sorpresa, Protección |
| Dependen de turnos o del cambio | — | 18 | Protección, Sustituto, Ida y Vuelta, Mofa, Descanso |
| Categoría Estado | 268 | 80 | Drenadoras, Tóxico, Danza Espada |

Los 18 de «dependen de turnos o del cambio» salen de una lista hecha a mano, no de un flag, y deben revisarse. La fórmula de daño original no funcionaba con los 41 de `basePower` 0: al tener potencia 0, solo harían unos 2 puntos de daño.

### 5.3. Sets de Random Battle

| Dato | Valor |
|---|---:|
| Especies con set | 509 |
| Sets (roles) en total | 879 |
| Movimientos por set: mínimo / mediana / máximo | 1 / 5 / 10 |
| Sets con 4 movimientos o menos | 389 (44 %) |
| Sets sin ningún ataque de daño | 1 |
| Nivel por especie | 64–100 |

Conclusiones:

- En el 44 % de los sets, «4 al azar» no es azar: se cogen todos. La variedad viene sobre todo de sortear el rol.
- Las preevoluciones suelen faltar. Bulbasaur, Eevee y Magikarp no tienen set, mientras que Pikachu, Charizard, Snorlax, Gengar y Mewtwo sí. **Al elegir las 12 especies del MVP, conviene que tengan set**, para no depender del fallback.
- Los sets están pensados para combates por turnos. Snorlax puede salir con Descanso y Sonámbulo, y esa combinación no tiene sentido aquí hasta tener reglas propias. Por eso el README filtra primero los movimientos excluidos.

### 5.4. Ritmo del combate

Golpes necesarios con la fórmula del README a nivel 50, con daño medio, STAB, efectividad neutra, IV 31, EV 0 y naturaleza neutra. Atacante y defensor tienen la misma estadística base:

| Stat base | PS | Potencia 40 | Potencia 80 | Potencia 120 |
|---:|---:|---:|---:|---:|
| 60 | 135 | 5 golpes | 3 golpes | 2 golpes |
| 80 | 155 | 6 golpes | 4 golpes | 3 golpes |
| 100 | 175 | 7 golpes | 4 golpes | 3 golpes |

Un ataque supereficaz lo reduce aproximadamente a la mitad. Con enfriamientos de unos 3 segundos (cifra ilustrativa), un combate típico duraría unos 10–15 segundos, sin contar fallos ni desplazamientos. Es poco para una mascota que se disfruta mirando. De ahí `battleScale` y la propuesta de 30–90 segundos, que es una estimación de diseño y **debe confirmarse con el spike de la Fase 4**.

---

## 6. Escritorio

### 6.1. Electron o Tauri

**Recomendación: mantener Electron y decidir con un ADR al llegar a la Fase 8.** No hace falta decidirlo antes, porque el núcleo es independiente.

| | Electron | Tauri |
|---|---|---|
| Lenguaje nativo | JavaScript | Rust |
| Motor web | Chromium incluido, igual en todos los sistemas | El del sistema, puede variar |
| Memoria y tamaño | Mayores | Menores, aunque las cifras publicadas varían mucho y no hay ninguna medida con una mascota |
| Paso de clics | `setIgnoreMouseEvents` | `set_ignore_cursor_events` |
| Ejemplos de mascotas | Menos encontrados | WindowPet, BongoCat |

Electron encaja mejor con un proyecto en JavaScript vanilla, pero una mascota está siempre abierta y por eso la memoria importa. Conviene medir ambas con un prototipo antes de elegir.

### 6.2. Problemas conocidos de Electron

- **Paso de clics:** `forward` solo está documentado para macOS y Windows. Un proyecto informó de una regresión del paso de clics en Electron ~38 sobre macOS y describió la desactivación de la aceleración por GPU como solución. Es un único informe; hay que probar en la versión que se use.
- **`globalShortcut`:** si otra aplicación ya tiene el atajo, el registro falla sin aviso, y `register` no siempre lo refleja. Cuando funciona, la combinación deja de llegar a las demás aplicaciones. `Alt + P` podría interferir justo con las aplicaciones sobre las que quieren vivir los Pokémon.
- **Wayland:** los atajos pasan por un portal del sistema, con diálogo de consentimiento en GNOME.

### 6.3. Leer ventanas de otras aplicaciones

| Sistema | Posibilidad |
|---|---|
| **Windows** | Las API Win32 enumeran ventanas de nivel superior y dan su posición. Es el caso más favorable |
| **macOS** | Posible, con permisos de grabación de pantalla y accesibilidad que el usuario debe aceptar |
| **Linux X11** | Posible |
| **Linux Wayland** | `get-windows` no lo soporta, por motivos de seguridad del propio Wayland |

[`get-windows`](https://github.com/sindresorhus/get-windows) (MIT) devuelve título, identificador y posición de las ventanas abiertas, y es el primer candidato para el adaptador.

**Expectativas realistas.** Conseguir las ventanas como superficies es asequible; es lo que hacen los Shimeji. **Usar elementos internos de una aplicación, como los paneles de un DAW, es mucho más difícil.** Dependen de lo que cada aplicación exponga por accesibilidad, y es de esperar que las interfaces dibujadas a medida, habituales en audio, expongan poco. Esto último no se ha verificado: es una hipótesis que hay que probar con el DAW concreto.

**Propuesta de alcance para la Fase 8:** primero bordes de pantalla y barra de tareas, luego ventanas, y paneles internos solo como experimento.

---

## 7. Riesgo legal y publicación

> Esto es un resumen de buenas prácticas, no asesoramiento legal.

### 7.1. Antecedentes

| Caso | Qué ocurrió |
|---|---|
| **Pokémon Uranium** (2016) | Sitios que alojaban las descargas recibieron avisos de los abogados de Nintendo of America, después de más de 1,5 millones de descargas |
| **Game Jolt** (2016) | Más de 500 juegos de fans de Mario, Zelda y Pokémon recibieron retirada |
| **Pokémon Essentials** | La herramienta para crear juegos de fans recibió un aviso de retirada y FANDOM lo cumplió |
| **Relic Castle** (2024) | El sitio de juegos de fans cerró por un aviso DMCA de origen no confirmado |

**Lectura:** las retiradas se dirigen a menudo a proyectos con mucha visibilidad y a las plataformas que alojan descargas. Al mismo tiempo, varios proyectos abiertos siguen disponibles, como Pokémon Showdown, PokéAPI y Pokémon Auto Chess. Que existan no garantiza que estén permitidos. Pokémon Auto Chess lo reconoce: declara que puede cerrar cuando The Pokémon Company quiera.

### 7.2. Reglas para este proyecto

1. Sin ingresos de ningún tipo.
2. Sin sprites en el repositorio y sin demo pública con ellos.
3. Sin usar logos oficiales ni imitar la marca.
4. Aviso de proyecto no oficial en el README y en la web.
5. `LICENSE` cubre solo el código propio. Una licencia MIT no se extiende al arte ni a los nombres.
6. Si se recibe una petición de retirada, se atiende.

**Riesgo restante:** el nombre contiene «Poke» y el juego usa personajes de Pokémon, incluidos nombres y estadísticas en el JSON. El riesgo baja, pero no desaparece. Un nombre neutro lo reduciría más si el proyecto gana visibilidad.

---

## 8. ADR y cuestiones abiertas

### 8.1. ADR recomendados

Escribirlos en `docs/decisions/` al empezar la fase indicada.

| ADR | Decisión | Cuándo |
|---|---|---|
| 001 | Nombre WildPokeBattle y prefijo `data-wpb-*` | Ya |
| 002 | Sprites fuera del repositorio | Ya |
| 003 | Móvil como modo espectador | Fase 2 |
| 004 | Showdown fijado a Gen 9 | Fase 4 |
| 005 | PMD SpriteCollab como fuente de sprites | Fase 4 |
| 006 | Reglas de final de combate | Fase 6 |
| 007 | Ataque básico sin enfriamiento (si se acepta) | Fase 6 |
| 008 | Electron o Tauri | Fase 8 |

### 8.2. Cuestiones sin confirmar

| Cuestión | Estado | Cómo resolverla |
|---|---|---|
| ¿La Velocidad afecta a los enfriamientos en Legends: Z-A? | Las fuentes se contradicen y no se pudo abrir Bulbapedia (error 403) | No bloquea: `factor_por_velocidad` es decisión propia |
| ¿`Alt + P` choca en Firefox, Edge o macOS? | Confirmado solo para Chrome en Windows: no aparece en su lista oficial | Probarlo a mano en la Fase 3 |
| ¿Hay autores secundarios en los sprites del MVP? | Comprobado solo el autor principal (CHUNSOFT en las 12) | Revisar `credits.txt` de cada especie al generar `CREDITS.md` |
| ¿En qué orden están las direcciones del sheet? | La documentación no lo indica | Abrir un `Walk-Anim.png` |
| ¿`file://` funciona con módulos ES en Electron? | Sin comprobar | Prototipo en la Fase 8; alternativa: protocolo propio |
| ¿Existen Apex Arena y DesktopInvasion? | No encontradas | Enlace del autor o retirarlas |
| ¿La duración de 30–90 s es la adecuada? | Estimación de diseño | Spike de la Fase 4 y prueba con personas |

---

## 9. Fuentes

Consultadas el 4 de noviembre de 2026.

**Datos y APIs**
- [Pokémon Showdown](https://github.com/smogon/pokemon-showdown) · [Licencia](https://github.com/smogon/pokemon-showdown/blob/master/LICENSE) · [`moves.json`](https://play.pokemonshowdown.com/data/moves.json) · [`sets.json`](https://github.com/smogon/pokemon-showdown/blob/master/data/random-battles/gen9/sets.json)
- [`pkmn/ps`](https://github.com/pkmn/ps) · [Documentación de `@pkmn/data`](https://github.com/pkmn/ps/tree/main/data)
- [`@smogon/calc`](https://github.com/smogon/damage-calc)
- [Documentación de PokéAPI](https://pokeapi.co/docs/v2) · [GraphQL](https://pokeapi.co/docs/graphql) · [Repositorio y CSV](https://github.com/PokeAPI/pokeapi)
- [Pokémon TCG API](https://pokemontcg.io/)

**Sprites**
- [PMD SpriteCollab](https://github.com/PMDCollab/SpriteCollab) · [Licencia](https://github.com/PMDCollab/SpriteCollab/blob/master/LICENSE.md) · [Formato de sprites](https://wiki.pmdo.pmdcollab.org/PMD_Sprite_Format) · [Créditos y condiciones de autores](https://hacknews.pmdcollab.org/page:notspritecollab_credit)
- [PokéAPI sprites](https://github.com/PokeAPI/sprites) · [Licencia](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt)

**Combate**
- [Bulbapedia: combate en Legends: Z-A](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_battle_(Legends:_Z-A)) (no se pudo abrir; datos tomados de resultados de búsqueda)
- [RPG Site: enfriamientos en Legends: Z-A](https://www.rpgsite.net/preview/18322-pokemon-legends-z-as-shift-to-fully-real-time-battles-with-timed-cooldowns-allows-for-unconventional-tactics) · [Shacknews](https://www.shacknews.com/article/146059/pokemon-legends-z-a-demo-preview) · [Serebii](https://www.serebii.net/legendsz-a/preview/demo/)
- [Bulbapedia: movimientos de UNITE](https://bulbapedia.bulbagarden.net/wiki/Move_(UNITE)) · [Serebii: mecánicas de Pokkén](https://serebii.net/pokken/mechanics.shtml)
- [Monster Rancher: Guts](https://monster-rancher.fandom.com/wiki/Guts) · [IA de Monster Rancher 2](https://legendcup.com/mr2researchaiprocessing.php)
- [Pokémon Auto Chess](https://github.com/keldaanCommunity/pokemonAutoChess)

**Mascotas y página como escenario**
- [eSheep / desktopPet](https://github.com/Adrianotiger/desktopPet) · [Wiki](https://github.com/Adrianotiger/desktopPet/wiki)
- [Shimeji Desktop Mascot](https://sourceforge.net/projects/shimeji-desktop/) · [Shijima-Qt](https://pixelomer.itch.io/shijima)
- [WindowPet](https://github.com/SeakMengs/WindowPet) · [VS Code Pets](https://github.com/tonybaloney/vscode-pets) · [VS Code Pokémon](https://github.com/jakobhoeg/vscode-pokemon)
- [StickFigureBookmarklet](https://github.com/maxkl/StickFigureBookmarklet) · [Break The Dom](https://chromeboard.com/extension/break-the-dom-fnefjombhpgknicdemcigolnhibjdkpj) · [Física en elementos web con Matter.js](https://www.codementor.io/@benni_jolink/adding-physics-to-web-components-1zil3oxa8b)

**Escritorio**
- [Electron: `globalShortcut`](https://www.electronjs.org/docs/latest/api/global-shortcut) · [Electron: interacciones de ventana](https://electronjs.org/ja/docs/latest/tutorial/custom-window-interactions)
- [Notas de Peek sobre paso de clics](https://tangled.org/burrito.space/peek/blob/main/notes/click-through-research.md)
- [`get-windows`](https://github.com/sindresorhus/get-windows)
- [Tauri frente a Electron (comparativa de 2026)](https://tech-insider.org/tauri-vs-electron-2026/) · [Mascota de escritorio con Tauri](https://dev.to/rain9/tired-of-boring-ai-assistants-i-built-a-desktop-pet-copilot-that-wanders-around-your-screen-and-52pg)
- [Atajos de Chrome](https://support.google.com/chrome/answer/157179?hl=en)

**Legal y generaciones**
- [Nintendo y los juegos de fans](https://en.wikipedia.org/wiki/Nintendo_and_fan_games) · [Pokémon Uranium](https://techraptor.net/content/pokemon-uranium-official-hosting-taken) · [Game Jolt](https://mcvuk.com/business-news/publishing/almost-600-game-jolt-titles-struck-by-nintendo-takedown-notice/) · [Pokémon Essentials](https://www.gamedeveloper.com/console/nintendo-files-takedown-notice-against-i-pokemon-i-fan-game-creation-tool) · [Relic Castle](https://80.lv/articles/website-hosting-pok-mon-fan-games-has-been-taken-down/?amp=1)
- [Anuncio de Pokémon Winds y Waves](https://gigazine.net/gsc_news/en/20260227-pokemon-presents-30th-anniversary/)
