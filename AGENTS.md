# AGENTS.md — Guía para agentes y contribuidores

Este archivo da instrucciones para cambios en el repositorio. Antes de implementar una función, determina si es una capacidad existente o una propuesta futura.

## Fuentes de verdad y alcance

1. Lee el [README](README.md) para visión, decisiones de producto y estado actual.
2. Para arquitectura técnica, consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); para reglas de juego, consulta [docs/SPEC_GAMEPLAY.md](docs/SPEC_GAMEPLAY.md).
3. Usa [docs/INFORME_INVESTIGACION.md](docs/INFORME_INVESTIGACION.md) como investigación y contexto, no como sustituto de decisiones actuales. Si contradice el README o la especificación actual, prioriza las decisiones actuales y señala la contradicción para corregir documentación en una tarea apropiada.
4. Consulta [docs/CHULETA.md](docs/CHULETA.md) para orientación sobre la versión web presente y [assets/ASSETS.md](assets/ASSETS.md) para el inventario de recursos.
5. Inspecciona los archivos reales antes de modificar. No deduzcas que una funcionalidad existe porque aparezca en documentos, maquetas, texto de interfaz, clases CSS o atributos HTML.

## Reglas de producto

- El proyecto se llama **WildPokeBattle**. No usar Battle Palace como nombre alternativo, título, alias o marca del proyecto.
- WildPokeBattle es una simulación de combate Pokémon autónoma en tiempo real; la web es el primer objetivo y el escritorio es futuro.
- Pokémon al nivel 100, equipos de hasta seis. No implementar nivel 50, límite de dos entidades activas u otras cifras de propuestas antiguas sin nueva confirmación.
- El usuario configura y prepara equipos; no controla directamente las acciones durante el combate.
- Combates automáticos en tiempo real, no por turnos.
- La IA estratégica y los comportamientos especiales de legendarios están previstos; no inventar una escala numérica definitiva.
- La precisión oficial orienta la dificultad de ejecución, no se transforma directamente en una probabilidad tradicional universal. Distinguir PP, cooldown, preparación/carga, ejecución y recuperación.
- Los filtros de tiers pertenecen solo a combates salvajes. En equipos NPC no completar composiciones originales con Pokémon inventados.
- Para empates online, aplicar la política de revancha de `docs/SPEC_GAMEPLAY.md`; no inventar puntuación de empates sin resolver.
- La cámara de momentos destacados (hasta dos minutos, priorizados por daño por segundo acumulado) es futura y su diseño técnico está pendiente.
- La aplicación de escritorio es posterior a completar la experiencia web. Debe investigarse accesibilidad de aplicaciones por sistema operativo; no afirmar integración iniciada.

## Estado del repositorio y lenguaje de cambios

El repositorio actualmente contiene una base visual HTML/CSS. Los atributos `data-wpb-body` y la capa `#wpb-layer` son preparatorios, no un motor físico, DOM adapter o renderer. El selector es una maqueta con opciones desactivadas; el editor no es funcional. No hay simulación, Pokémon animados, IA, combate, backend online ni runtime de escritorio.

- Describe funciones no implementadas como **propuestas**, **previstas** o **pendientes**.
- Actualiza documentación de estado cuando una implementación real cambia el estado; no marques un hito terminado solo por añadir el marcado o la interfaz.
- No anuncies pruebas, cobertura, rendimiento o compatibilidad que no hayas ejecutado y verificado.

## Reglas para cambios técnicos

- Mantén separadas las responsabilidades propuestas de core, adaptadores, renderer, backend y runtime de escritorio. La arquitectura está descrita en `docs/ARCHITECTURE.md` y no implica que todos esos módulos existan.
- No mezcles las reglas del núcleo con DOM, renderer o APIs del sistema operativo. Los adaptadores traducen entradas/salidas; no deben redefinir silenciosamente las reglas de juego.
- No confundas contenido HTML, caja visual CSS y geometría física. Solo elementos identificados explícitamente deben participar en una simulación futura.
- Respeta los identificadores físicos existentes y su estado desactivado; no cambies el HTML/CSS de una tarea documental.
- No introduzcas Phaser, Matter, Electron, Tauri, PostgreSQL, WebSockets, frameworks ni otras dependencias/tecnologías como decisiones definitivas por su mera mención en documentos antiguos. Justifica y confirma decisiones técnicas cuando corresponda.
- No añadas dependencias ni sistemas de build sin necesidad explícita y aceptación adecuada.
- Mantén la accesibilidad y la usabilidad de la página: navegación semántica, foco visible, movimiento reducido donde aplique y controles no bloqueados por capas visuales.
- La pausa/atajos de la maqueta no son funcionales ni una decisión actual confirmada; no los presentes como implementados.

## Recursos, datos y licencias

- Antes de añadir un recurso, registra autor, origen y licencia por archivo/recurso en `assets/ASSETS.md`.
- No asumas que todos los recursos de una colección tienen la misma licencia ni que una licencia comunitaria abarca derechos de personajes o arte oficial.
- Uso académico, gratuito o sin ánimo de lucro no significa automáticamente que sea legal redistribuir o monetizar material protegido.
- No subas sprites ni hagas hotlink de recursos ajenos salvo decisión expresa que revise permisos y publicación.
- Fuentes de datos mencionadas por la investigación (por ejemplo, Showdown o PokéAPI) no están integradas todavía; verifica versiones, alcance, atribución y licencia antes de implementarlas.

## Manejo de decisiones pendientes

- No conviertas una propuesta en decisión aprobada por conveniencia o por repetición en documentación histórica.
- Cuando falte una regla, documenta la pregunta, alternativas y consecuencias; solicita decisión antes de codificar comportamiento difícil de revertir.
- Si el cambio implica una decisión de arquitectura, explica por qué y actualiza `docs/ARCHITECTURE.md`; si implica reglas de juego, actualiza `docs/SPEC_GAMEPLAY.md` y el resumen del README si afecta decisiones o estado.
- No cambies funcionalidades fuera del alcance indicado. En una tarea documental, modifica solo los archivos de documentación necesarios; en una tarea de código, conserva cambios no relacionados.

## Verificación y entrega

- Ejecuta las pruebas disponibles y las comprobaciones pertinentes al cambio; registra lo no ejecutado y las limitaciones.
- Comprueba enlaces internos y nombres de archivos afectados en cambios Markdown. No declares que un validador automático se ejecutó si no se ejecutó.
- Resume con precisión:

```markdown
**Archivos:** creados / modificados
**Hecho:** cambios realizados
**Decisiones:** nuevas decisiones o cuestiones pendientes
**Dependencias:** añadidas / retiradas
**Pruebas:** comandos/comprobaciones y resultados
**Limitaciones:** aspectos no verificados o fuera de alcance
```
