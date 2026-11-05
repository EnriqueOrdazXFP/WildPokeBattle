# Especificación de gameplay

> **Estado del documento:** reglas y objetivos de diseño para orientar futuras implementaciones; no son funciones implementadas. Las decisiones confirmadas deben mantenerse. Los apartados marcados como pendientes necesitan decisión antes de convertirlos en reglas definitivas.
>
> La presentación del proyecto y su estado real están en el [README](../README.md). La propuesta de componentes y límites técnicos está en [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Premisa y rol del jugador

WildPokeBattle es una simulación Pokémon autónoma en tiempo real dentro de escenarios web bidimensionales con perspectiva lateral. El jugador selecciona, configura y optimiza Pokémon y equipos; no controla manualmente sus acciones durante el combate.

La experiencia combina reglas de combate con movimiento y entorno físico: gravedad, salto, plataformas, obstáculos, colisiones y elementos interactivos. La simulación y las reglas aún no están implementadas.

## 2. Pokémon y equipos

### Decisiones confirmadas

- Los Pokémon se preparan al **nivel 100**.
- Cada equipo puede contener hasta **seis Pokémon**.
- El jugador podrá configurar estadísticas, naturaleza, movimientos, objetos y otros parámetros de combate.
- No se usa la subida tradicional de nivel como mecánica central: la progresión principal de juego se apoya en preparar y optimizar equipos.
- El combate es automático.

### Pendiente de concretar

Reglas exactas de legalidad, límites de parámetros, formato de equipos, persistencia, sustituciones, estados entre combates y relación entre tamaño de equipo y formato de batalla. No se infiere que un formato use a los seis integrantes simultáneamente.

## 3. Inteligencia autónoma

La IA deberá elegir acciones según contexto y estado del combate. Objetivos confirmados para su comportamiento:

- Elegir cuándo atacar y cuándo esperar.
- Administrar movimientos que requieren preparación o carga, considerando exposición al rival.
- Adaptarse al estado de la batalla y a las oportunidades disponibles.
- Aprovechar posicionamiento, alcance, obstáculos y condiciones del escenario.
- Tomar decisiones estratégicas, no limitarse a disparar el movimiento disponible.

La inspiración es parcial en el sistema de inteligencia de Pokémon Mundo Misterioso. Los legendarios tendrán inteligencia máxima y ventajas o comportamientos personalizados.

**Pendiente:** escala/representación de inteligencia, modelo de decisión, cómo afectan características de especie y si se ofrecerán perfiles configurables. No fijar una escala numérica.

## 4. Movimiento, escenario y física

El plano de juego será lateral 2D. La visión contempla movimiento horizontal y vertical, gravedad, saltos, plataformas y colisiones con superficies y obstáculos. No se ha implementado un motor físico.

Las páginas pueden tener distintas distribuciones y ambientes. El campo se ajusta al espacio disponible del navegador; al reducir el tamaño de la ventana se reduce el campo. El sistema tendrá que identificar qué componentes de la interfaz participan en la simulación.

### Marcado físico existente

El HTML del Prado incluye atributos preparatorios `data-wpb-body` con valores como `solid`, `platform` y `wall`, y al menos un `data-wpb-enabled="false"`. Su semántica prevista es:

| Marcado | Intención de diseño |
|---|---|
| `solid` | Superficie sólida, colisionable desde más de una dirección. |
| `platform` | Plataforma para aterrizar; la regla de atravesarla desde abajo deberá verificarse al implementar. |
| `wall` | Obstáculo que bloquea movimiento lateral. |
| Sin `data-wpb-body` | No participa en la simulación. |
| `data-wpb-enabled="false"` | Se muestra en la página, pero se excluye de la geometría física. |

Por ahora esto solo existe como marcado: no hay código que lo lea ni aplique colisiones. Las coordenadas, cuerpos, contacto con entidades, respuesta ante superficies dinámicas y comportamiento de vuelo requieren especificación y pruebas.

## 5. Movimientos y combate

### Decisiones confirmadas

- Los combates son automáticos y en tiempo real, no turnados.
- La precisión oficial no se interpreta directamente como probabilidad tradicional de acertar. Se usa como referencia para la dificultad de ejecutar el movimiento.
- Cada movimiento tiene comportamiento propio. Dos movimientos de igual precisión pueden requerir soluciones de ejecución distintas.
- Hay que modelar separadamente:
  - **PP:** número de usos disponibles.
  - **Cooldown:** espera antes de poder volver a usar el movimiento.
  - **Preparación/carga.**
  - **Ejecución.**
  - **Recuperación.**
- Todos los movimientos tendrán cooldown, además de PP.
- La estrategia debe considerar posicionamiento y oportunidad, no únicamente la disponibilidad del movimiento.

### Modelo conceptual de resolución

El estado de un movimiento puede atravesar preparación, ejecución y recuperación; PP se consume de acuerdo con una regla todavía por definir, mientras que cooldown limita su reutilización. La precisión puede informar la dificultad de una ejecución concreta sin convertirse necesariamente en una tirada de acierto convencional. Esta separación es una guía de diseño; faltan reglas por movimiento.

### Pendiente

- Fórmula de daño y relación con estadísticas, tipos, nivel y objetos.
- Cómo precisión modifica dificultad de ejecutar y qué consecuencias hay por ejecución fallida.
- Momento de consumo de PP, activación del cooldown y tratamiento de interrupciones.
- Duraciones de carga y recuperación, alcances, trayectorias, hitboxes y efectos por movimiento.
- Adaptación de efectos de juegos por turnos a tiempo real.
- Condiciones de fin de combate, empates, dobles KO y recuperación posterior.

No copiar sin revisión fórmulas, temporizadores o propuestas del diseño histórico: requieren validación contra las decisiones actuales y pruebas de equilibrio.

## 6. Modos de juego

Todos los modos de esta sección son objetivos de diseño, no funcionalidades actuales.

### Combates salvajes

- Encuentros 1 contra 1 y 2 contra 2.
- Pokémon seleccionados por el usuario o elegidos aleatoriamente.
- Filtros combinables: tiers, legendarios, tipos, especies y otras categorías.
- Los filtros de tier se aplican exclusivamente a combates salvajes; no limitan los equipos de entrenadores ni otros modos salvo nueva decisión explícita.

Falta precisar cómo se generan o seleccionan equipos y Pokémon, y cómo se relacionan los formatos de combate con equipos de hasta seis.

### Entrenadores NPC

- Incluir entrenadores clásicos de Pokémon.
- Intentar conservar la composición original de sus equipos.
- Registrar variantes cuando un entrenador tenga equipos distintos según su aparición.
- No añadir integrantes inventados para completar equipos originalmente más pequeños.

Pendiente: alcance de entrenadores, fuentes de datos, reglas de variantes y licencias o restricciones aplicables a esos datos.

### Multijugador online

Objetivos previstos: cuentas de usuario, equipos, desafíos que puedan quedar pendientes hasta que ambos jugadores quieran jugar, historial por jugador y por equipo, rankings mundiales y regionales.

La partida deberá representar un enfrentamiento lógico compartido y verificable. No se debe confiar en dos simulaciones independientes sin sincronización. Se contempla sincronización de estado/datos y aleatoriedad compartida.

Pendiente: autoridad de la partida, transporte, tolerancia a desconexiones, prevención de trampas, persistencia, matchmaking y algoritmo de ranking. No se ha definido un sistema de puntuación para empates no resueltos.

#### Política de revancha en empate

- Cada jugador decide independientemente si quiere una revancha.
- Si ambos aceptan, juegan sus respectivas revanchas.
- Si solo uno acepta, ese jugador puede obtener un resultado definitivo para sí mismo; el otro conserva el empate sin resolver.
- Si ambos rechazan, el empate sigue sin resolverse.
- Si vuelve a producirse un empate, se pueden ofrecer nuevas revanchas.

Esta política no determina por sí sola el cálculo de ranking o puntuación.

## 7. Cámara de batalla

Objetivo de diseño: conservar localmente hasta **dos minutos** de los momentos destacados de una partida, seleccionados principalmente por el daño por segundo acumulado, evitando almacenar el combate entero.

No está implementada. Están pendientes la definición de “momento destacado”, ventana de cálculo, codificación/representación, coste de memoria, selección y reemplazo de segmentos, controles de reproducción y privacidad/almacenamiento local. No asumir que se guardará vídeo: el método técnico no está decidido.

## 8. Preparación y progresión

La configuración y optimización de equipos es central; subida tradicional de nivel no lo es. Los parámetros configurables incluyen, al menos, estadísticas, naturaleza, movimientos y objetos.

Pendiente: interfaz final, validación de combinaciones, editor, importación/exportación, guardado de equipos, colección, desbloqueos y cualquier progresión distinta a subir nivel.

## 9. Criterios de validación futura

Los siguientes son objetivos para pruebas al implementar, no afirmaciones de que ya se cumplan:

- Ningún equipo excede seis Pokémon.
- En todos los formatos, los Pokémon actúan autónomamente una vez iniciado el combate.
- Un movimiento puede tener PP y cooldown independientes, y sus fases de preparación, ejecución y recuperación se pueden razonar y comprobar.
- La dificultad de ejecución usa la precisión como referencia sin imponer una probabilidad universal de acierto.
- El comportamiento de los movimientos distintos se prueba por movimiento, no solo por su cifra de precisión.
- Los filtros de tier no se aplican fuera de combates salvajes.
- Los equipos NPC conservan el número de integrantes documentado; no se inventan Pokémon faltantes.
- Una partida online tiene estado y aleatoriedad compartidos bajo un protocolo verificable antes de declarar resultados.
- Los empates y decisiones de revancha siguen las reglas expresas arriba sin asignar puntuación inventada.
- La cámara nunca almacena más de dos minutos de momentos seleccionados cuando se implemente, y su selector de momentos está documentado.
- El tamaño del escenario corresponde al espacio de navegador disponible y respeta las superficies habilitadas.

## 10. Pendientes de diseño prioritarios

1. Regla por movimiento para precisión/dificultad, fases, PP, cooldown, interrupción y efecto.
2. Daño, tipos, objetos, estados, victoria y empate.
3. Modelo de decisiones de IA y tratamiento de legendarios.
4. Formatos 1v1/2v2, uso de equipos de seis y reemplazos.
5. Selección de especies y definición de roster inicial; la Pokédex HTML actual solo presenta especies propuestas.
6. Fuente y verificación de equipos de NPC.
7. Autoridad/sincronización online y ranking.
8. Reglas de selección y almacenamiento para la cámara.
9. Geometría, coordenadas, hitboxes y excepciones de superficies web.
