# Arquitectura propuesta

> **Estado del documento:** propuesta de diseño. Describe límites y responsabilidades deseados; no afirma que estos componentes estén implementados ni fija tecnologías de infraestructura.
>
> La visión pública y las decisiones de producto están en el [README](../README.md). Las reglas de juego previstas están en [SPEC_GAMEPLAY.md](SPEC_GAMEPLAY.md). Las reglas para contribuir están en [`AGENTS.md`](../AGENTS.md).

## Objetivos

- Separar las reglas de simulación de la plataforma, el DOM y la interfaz.
- Compartir el núcleo de simulación entre la experiencia web y una posible aplicación de escritorio.
- Permitir que los elementos HTML se conviertan en geometría del escenario sin trasladar la lógica física al CSS.
- Hacer reproducibles los cálculos de simulación cuando se suministren las mismas entradas y semillas.
- Mantener la implementación incremental: primero una prueba de física y del adaptador web; después datos, representación, IA y combate.

## Estado real

Actualmente el repositorio tiene páginas HTML, estilos CSS, ciertos atributos `data-wpb-body` y una capa vacía `#wpb-layer`. No hay todavía código JavaScript, motor físico, puente DOM, núcleo, renderer, backend ni runtime de escritorio. Los nombres de componentes y flujos siguientes son arquitectura prevista.

## Componentes y límites

```text
                 ┌──────────────────────────────────────┐
                 │        WildPokeBattle Core            │
                 │ estado · datos · IA · combate · física│
                 └──────────────────▲───────────────────┘
                                    │ API independiente
               ┌────────────────────┴────────────────────┐
               │                                         │
      Web Runtime / Web Adapter                Desktop Runtime / Adapter
      DOM y entradas de navegador              ventanas y entradas del SO
               │                                         │
         Renderer web                              Renderer de escritorio
               │
          Interfaz web

             Backend online (servicio aparte e integración por definir)
```

### WildPokeBattle Core

Lógica determinista tanto como sea posible y sin dependencias de navegador o sistema operativo. Responsabilidades previstas:

- Estado de partida, entidades Pokémon, estadísticas y estado de combate.
- Reglas de movimientos, PP, cooldown, fases de preparación/ejecución/recuperación y efectos.
- Decisiones autónomas de IA.
- Simulación física: gravedad, movimiento, colisiones y resolución de contactos.
- Fuente de aleatoriedad con semilla y flujos separados para generación, combate e IA, de forma que una operación en un subsistema no cambie accidentalmente los resultados de otro.
- Producción de eventos o cambios de estado que los adaptadores y el renderer puedan consumir.

El núcleo no debe leer ni modificar el DOM, dibujar sprites, hacer peticiones de red ni acceder a APIs de escritorio. Recibirá como entradas los datos de especies/movimientos, las superficies del escenario, el estado de la partida y el tiempo de simulación necesario.

### Web Runtime / Web Adapter

Conecta el núcleo a la página y proporciona superficies del DOM como geometría física. Debe ser responsable de:

- Leer los elementos marcados con `data-wpb-body` y respetar los controles de activación como `data-wpb-enabled="false"`.
- Convertir cajas de elementos a un sistema de coordenadas acordado y comunicar cambios al núcleo.
- Gestionar los eventos de redimensionado, scroll, mutaciones, visibilidad y otras modificaciones relevantes sin medir todo el DOM en cada frame.
- Recibir entradas de usuario y traducirlas a comandos del juego, sin adjudicarse reglas de combate.

Los valores existentes (`solid`, `platform`, `wall`) son marcado preparatorio en HTML. Su semántica y las reglas de interacción se detallan en [SPEC_GAMEPLAY.md](SPEC_GAMEPLAY.md); por ahora no hay lector ni colisionador que los aplique.

### Renderer

Representa el estado del núcleo (sprites, animaciones, efectos y señales de combate) sin decidir reglas. La capa `#wpb-layer` ya está vacía y reservada en algunas páginas; su existencia no significa que exista renderer. En la web se debe preservar la interacción normal con enlaces y controles, evitando que la capa visual capture clics por defecto.

Si los recursos de animación se integran, el diseño deberá poder sincronizar poses e impactos con el tiempo de simulación y respetar la pausa. La elección de formato y pipeline de sprites está pendiente.

### Backend online

Componente futuro para cuentas, equipos persistentes, desafíos, historial, matchmaking, clasificaciones y coordinación de partidas. Una partida online debe tener un estado lógico común verificable y una fuente compartida de aleatoriedad; dos navegadores no deben simular resultados independientes sin sincronización.

Autoridad de servidor, transporte, persistencia, modelo de datos, medidas contra trampas y reconciliación de estados son decisiones aún abiertas. No se han elegido protocolos ni tecnologías.

### Desktop Runtime / Desktop Adapter

Etapa futura, posterior a la experiencia web. Adaptará la fuente de superficies para representar ventanas, escritorio y, si el sistema lo permite, elementos internos de otras aplicaciones. Debe traducir la geometría del sistema operativo a la misma interfaz de superficies que consume la simulación web.

La integración dependerá de APIs de accesibilidad y permisos del sistema operativo. La disponibilidad varía según plataforma y aplicación; que una ventana sea detectable no implica que sus controles internos sean accesibles. No están elegidos sistema operativo inicial, framework, lenguaje ni mecanismo de integración.

## Contratos conceptuales

Estos son contratos de diseño, no nombres de API implementados:

1. **Datos de entrada:** el core recibe datos normalizados de especies y movimientos; no los descarga ni conoce el proveedor.
2. **Superficies:** los adaptadores entregan geometría y tipo de superficie en coordenadas del mundo. Deben identificar altas, cambios, desactivaciones y retiradas.
3. **Comandos:** selector, configuración, juego online y escritorio envían comandos explícitos; no modifican estado interno del core directamente.
4. **Salida:** el core publica snapshots o eventos para renderer, historial y sincronización. La política exacta de eventos queda por diseñar.
5. **Tiempo:** la simulación deberá tener un paso estable e independiente de la frecuencia de dibujo. Tamaño del paso, orden de subsistemas y límites del acumulador se definirán y probarán.
6. **Aleatoriedad:** las partidas reproducibles requieren semillas y reglas claras para compartirlas; el protocolo online sigue pendiente.

## Bucle de simulación propuesto

La propuesta separa avance de simulación y renderizado: una simulación con paso fijo recibe las decisiones de IA, integra física, aplica consecuencias de combate y emite eventos; el renderer pinta el estado más reciente y puede interpolar. La frecuencia y orden finales deben validarse con pruebas; no se deben tratar estos detalles como código existente.

Las condiciones de pausa, suspensión de pestaña y reanudación deberán evitar saltos de tiempo. La elección de controles/atajos y su compatibilidad entre navegadores queda pendiente; no se debe inferir que el atajo de la maqueta ya funciona.

## Adaptación del DOM y geometría

Principios previstos para el Web Adapter:

- Solo los elementos identificados expresamente participan en física; ser visible no equivale a ser una superficie.
- Desactivar la caja física retira el elemento de la simulación sin ocultar el contenido web.
- Medir en lotes y separar lecturas de layout de escrituras visuales para reducir trabajo de render del navegador.
- Detectar cambios de tamaño y estructura mediante observadores apropiados y revisar también cambios de posición, que no siempre generan una notificación de tamaño.
- Tener en cuenta scroll, redimensionado, contenido dinámico, fuentes e imágenes, elementos ocultos y ventanas pequeñas.
- Las superficies CSS transformadas o posicionadas de forma fija/adhesiva requieren tratamiento explícito si se admiten: su geometría puede no seguir el flujo de medición simple. No dar por sincronizadas esas transformaciones automáticamente.

Las páginas deben seguir siendo utilizables (clics, selección de texto y navegación) bajo la capa visual futura.

## Organización de código posible

La estructura exacta se decidirá cuando empiece el desarrollo correspondiente. Como guía conceptual, no como árbol ya creado:

```text
src/ o js/                 punto de entrada y composición del runtime
  core/                    estado y reglas independientes de plataforma
  physics/                 integración y colisiones
  battle/                  resolución de ataques y efectos
  ai/                      decisiones autónomas
  data/                    modelos y normalización de datos
  adapters/web/            DOM, entradas y ciclo del navegador
  adapters/desktop/        futura integración de escritorio
  render/                  presentación visual
  ui/                      selector, edición y navegación de juego
backend/                   servicios online (ubicación por decidir)
tests/                     pruebas unitarias, integración y escenarios
assets/                    inventario de recursos; licencias por recurso
```

No se debe crear toda esta estructura de antemano ni conservar nombres propuestos por inercia. Añadir carpetas al avanzar fases y actualizar esta guía si las responsabilidades cambian.

## Datos y fuentes

La investigación existente estudia Pokémon Showdown para datos de mecánicas y PokéAPI para nombres en español; son candidatos documentados, no una integración existente en este repositorio. Antes de usarlos se deben comprobar versión, generación, condiciones de licencia y modo de generación de datos. Los datos normalizados deben consumirse desde el core sin dependencia en tiempo de ejecución del proveedor, si esa estrategia sigue siendo apropiada.

## Calidad y verificación

- Probar el core sin DOM ni plataforma, incluyendo casos de física, movimientos, reproducción por semilla y condiciones límite.
- Probar el adaptador web en páginas con distintos tamaños, scroll, cambios de contenido y superficies activadas/desactivadas.
- Probar visualmente que la representación no bloquea la web y que sus animaciones reflejan el estado real.
- Para partidas online, verificar que una misma partida conduce a resultados compatibles bajo el modelo de sincronización elegido; definir tolerancias y autoridad antes de implementar.
- No afirmar que hay estabilidad, rendimiento objetivo o determinismo verificados sin pruebas reproducibles.

## Decisiones técnicas abiertas

- Modelo de paso de simulación, colisión y coordinación entre IA, física y combate.
- Contrato de datos, generación, actualización y licencia de fuentes de especies/movimientos.
- Interfaces entre core, adaptadores, renderer y backend.
- Sincronización/autoridad online, persistencia, seguridad y aleatoriedad común.
- Frameworks, librerías, protocolo de red y almacenamiento, si alguno resulta necesario.
- Tecnología y plataformas de escritorio; acceso a ventanas frente a controles internos.
- Formato de sprites, animaciones, caché y almacenamiento local de momentos destacados.

No se deben adoptar Phaser, Matter, Electron, Tauri, PostgreSQL, WebSockets u otra tecnología como decisión tomada sin una decisión explícita documentada, tras comprobar la necesidad correspondiente.
