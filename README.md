# WildPokeBattle (Battle Palace)

> **Simulación de combates Pokémon autónomos en tiempo real, donde la propia página web forma parte del escenario.**

WildPokeBattle, también denominado **Battle Palace**, es un proyecto de fans que imagina Pokémon capaces de moverse e interactuar con una web como un entorno físico: con perspectiva lateral, gravedad, saltos, plataformas, obstáculos y elementos interactivos. Los combates serán automáticos: quien juega prepara y optimiza sus equipos, pero no dirige las acciones durante la batalla.

La web será tanto la experiencia jugable como una wiki de referencia sobre Pokémon, movimientos, equipos y el proyecto. A largo plazo se contempla una aplicación de escritorio en la que los Pokémon puedan interactuar con ventanas y aplicaciones; primero debe completarse la experiencia web.

> **Estado importante:** el repositorio contiene actualmente una primera versión visual en HTML y CSS. No contiene todavía simulación física, Pokémon animados, IA ni combates funcionales. Las ideas de juego y arquitectura que siguen se distinguen expresamente de lo ya implementado.

## Características y visión

- **Combate autónomo en tiempo real:** los Pokémon toman decisiones durante la batalla; el jugador se centra en preparar el equipo.
- **Entorno físico integrado con la web:** páginas y elementos HTML podrán constituir superficies, plataformas y obstáculos, en vez de ser solo un fondo decorativo.
- **Escenarios bidimensionales laterales:** movimiento, gravedad, saltos, colisiones y elementos interactivos son parte de la visión del juego, no funcionalidades ya implementadas.
- **Preparación de equipos:** se podrán configurar Pokémon, estadísticas, naturalezas, movimientos, objetos y otros parámetros.
- **Web como juego y wiki:** la experiencia jugable convivirá con información de Pokémon, movimientos, equipos y documentación.

## Decisiones de diseño confirmadas

### Pokémon y equipos

- Los Pokémon estarán al **nivel 100**; la subida tradicional de nivel no será una mecánica central.
- Se podrán configurar estadísticas, naturaleza, movimientos, objetos y otros parámetros de combate.
- Cada equipo podrá tener **hasta seis Pokémon**. La composición del equipo no implica que todos combatan a la vez; los formatos de batalla se describen por separado.
- Preparar y optimizar equipos será una parte importante del juego.
- Durante los combates, las acciones de los Pokémon serán automáticas.

### Inteligencia y movimientos

- La inteligencia influirá en la elección del momento de atacar, la gestión de movimientos con preparación, la adaptación al combate, el posicionamiento y las decisiones estratégicas. Su diseño se inspira parcialmente en Pokémon Mundo Misterioso.
- Los Pokémon legendarios tendrán inteligencia máxima y ventajas o comportamientos personalizados. **No se ha fijado una escala numérica de inteligencia.**
- La precisión oficial no se convertirá directamente en una probabilidad tradicional de acierto: servirá de referencia para la dificultad de ejecutar correctamente cada movimiento. Cada movimiento tendrá su propio comportamiento; la misma precisión no implica el mismo funcionamiento.
- Se distinguen **PP** (usos disponibles), **cooldown** (espera para volver a usar un movimiento), preparación o carga, ejecución y recuperación. Cada movimiento tendrá cooldown además de PP.

## Modos de juego previstos

Estos modos forman parte del diseño; ninguno está implementado todavía.

- **Combates salvajes:** encuentros 1 contra 1 y 2 contra 2, con Pokémon elegidos o aleatorios. Se podrán combinar filtros de tiers, legendarios, tipos, especies y otras categorías. Los filtros de tiers se aplican solo a este modo.
- **Entrenadores NPC:** se incluirán entrenadores clásicos y se intentará conservar sus equipos originales. Se podrán registrar variantes si sus equipos cambian según la aparición. No se añadirán Pokémon para completar equipos originalmente más pequeños.
- **Multijugador online:** cuentas, equipos, desafíos pendientes, historial por jugador y equipo, y rankings mundiales y regionales son objetivos de diseño. El enfrentamiento lógico deberá ser compartido y verificable, con sincronización y aleatoriedad compartida; no se dependerá de resultados calculados independientemente en cada navegador.

**Empates online:** cada jugador podrá decidir por separado si acepta una revancha. Si ambos aceptan, jugarán sus revanchas; si solo uno acepta, podrá obtener un resultado definitivo para sí mismo mientras el otro conserva el empate sin resolver. Si ambos rechazan, el empate seguirá sin resolverse. Se podrán ofrecer nuevas revanchas si vuelve a haber empate. La puntuación de empates no resueltos sigue pendiente.

## Escenarios y experiencia web

Las páginas serán escenarios con distribuciones y ambientes propios. El campo de batalla se adaptará al espacio disponible en el navegador; una ventana más pequeña dará lugar a un campo menor. El sistema deberá identificar los elementos de la interfaz que participan en la simulación.

En la implementación actual, el Prado ya contiene marcado HTML que identifica algunos elementos con `data-wpb-body` y una capa de renderizado reservada, pero no hay código que los convierta en cuerpos físicos ni Pokémon que los usen. La capa y el marcado son estructura preparatoria, no un motor físico.

## Arquitectura prevista

La siguiente es una **propuesta conceptual**, no módulos existentes en el repositorio. La idea central es compartir la simulación entre web y escritorio:

| Componente | Responsabilidad prevista |
|---|---|
| **Battle Palace Core** | Lógica de combate, Pokémon, estadísticas, IA, movimientos, PP, cooldown y simulación, independiente de la plataforma. |
| **Web Runtime / Web Adapter** | Adaptar el DOM y los elementos HTML al escenario físico. |
| **Renderer** | Sprites, animaciones y representación visual. |
| **Backend** | Cuentas, equipos, historial, matchmaking, rankings y sincronización online. |
| **Desktop Runtime / Desktop Adapter** | Integración futura con escritorio, ventanas y aplicaciones externas. |

No se han confirmado motores, frameworks, bases de datos, protocolos de red ni tecnología de escritorio. La integración con aplicaciones deberá estudiar APIs de accesibilidad del sistema operativo: las aplicaciones no exponen todas sus interfaces del mismo modo.

## Estado actual del desarrollo

**Implementado:** estructura semántica y navegable de la web, estilos responsive y visuales para el Prado, una Pokédex de presentación y una página de ayuda. El marcado del Prado incluye identificadores físicos `data-wpb-body`; existe una capa `#wpb-layer` vacía reservada para una futura representación.

El selector permite abrir y cerrar su panel, pero las opciones de Pokémon están desactivadas. La Pokédex muestra especies propuestas, no una selección definitiva de juego. El editor es una maqueta con campos desactivados; el atajo que aparece en la interfaz es informativo y no activa una pausa.

**Aún no implementado:** motor de física, lectura de superficies del DOM, renderizado o movimiento de Pokémon, selección jugable, IA, movimientos y combate, configuración funcional de equipos, cámara de batalla, cuentas, multijugador, backend y aplicación de escritorio.

El inventario actual de recursos registra ilustraciones propias en CSS y tipografías del sistema; no hay sprites de Pokémon incluidos. Consulta [assets/ASSETS.md](assets/ASSETS.md).

## Próximas fases

1. Completar la experiencia web empezando por una simulación física básica y la adaptación de superficies del DOM.
2. Incorporar representación y movimiento de Pokémon, decisiones de IA y combate automático; después, la preparación de equipos y los modos de juego previstos.
3. Diseñar la cámara de batalla y las funciones online, incluida la sincronización verificable.
4. Solo después de completar la experiencia web, investigar y desarrollar la integración de escritorio.

Esta secuencia expresa prioridades generales, no un calendario ni especificaciones técnicas cerradas. No se ha determinado aquí una planificación detallada por hitos.

## Decisiones importantes pendientes

- Diseño y evaluación de la IA, incluida la escala o representación de inteligencia y los comportamientos específicos de legendarios.
- Reglas concretas de combate en tiempo real: cómo se relacionan precisión, ejecución, carga, recuperación, PP, cooldown y daño para cada movimiento.
- Alcance inicial de especies, equipos, modos y contenidos de entrenadores NPC.
- Reglas, sincronización, aleatoriedad compartida y clasificación online, especialmente el tratamiento de empates no resueltos.
- Cámara de batalla: selección de momentos destacados (principalmente por daño por segundo acumulado) para guardar localmente hasta dos minutos. Los criterios exactos y el funcionamiento técnico están por diseñar; no es una función existente.
- Distribución de escenarios, escala del campo y selección de elementos HTML que participarán en la simulación.
- Tecnología, sistemas operativos iniciales y APIs de accesibilidad para la futura aplicación de escritorio.
- Tecnologías de implementación para cada componente de la arquitectura; ninguna está declarada como decisión definitiva.

## Recursos y licencias

La prioridad visual son sprites y animaciones de **Pokémon Mundo Misterioso: Exploradores del Cielo**, u otros recursos similares que cubran muchas especies. También se podrán estudiar otros juegos de Mundo Misterioso, recursos comunitarios, sprites de generaciones anteriores y recursos originales para cubrir ausencias.

La procedencia y licencia deben comprobarse **para cada recurso y autor**: no se debe asumir que todos los archivos de un repositorio comunitario comparten licencia. El uso académico o sin ánimo de lucro no concede automáticamente permiso para redistribuir o monetizar material protegido. Antes de incorporar recursos, registra autor, origen y licencia en [assets/ASSETS.md](assets/ASSETS.md). El proyecto no incluye actualmente sprites de Pokémon.

<a id="114-recursos-y-licencias"></a>

## Referencias y documentación

- [Chuleta del proyecto](docs/CHULETA.md): resumen del estado, páginas y decisiones de la primera versión web.
- [Informe de investigación](docs/INFORME_INVESTIGACION.md): investigación sobre fuentes de datos, recursos gráficos, licencias, referencias y riesgos. Sus propuestas antiguas deben leerse teniendo en cuenta las decisiones actuales de este README.
- [Inventario de recursos](assets/ASSETS.md): procedencia y licencia de los recursos incorporados.
- [Portada web](index.html), [Prado](pages/prado.html), [Pokédex](pages/pokedex.html) y [Ayuda](pages/ayuda.html).

<a id="45-combate"></a>

## Aviso

WildPokeBattle es un proyecto de fans, gratuito y sin ánimo de lucro, no afiliado, patrocinado ni aprobado por Nintendo, Game Freak, Creatures Inc. ni The Pokémon Company. Pokémon y sus elementos asociados pertenecen a sus respectivos titulares. Este aviso no sustituye la revisión de permisos y licencias de cada recurso.
