# ¿Cuál es el intruso? — Juego cognitivo accesible

Juego web simple para personas mayores: elige la palabra que **no pertenece** al grupo.  
Funciona en **cualquier** celular, tablet o PC. **Sin cuentas, sin datos personales.**


## ¿Para qué sirve?
Actividad lúdica que ejercita **categorización semántica**, **atención selectiva** e **inhibición** (evitar la respuesta impulsiva).  
No es práctica médica ni diagnóstico.

## Cómo jugar
- Elegí **Rondas** (8–10 recomendado) y **Opciones** (4 por pregunta recomendado).  
- Botón **Comenzar**, luego elegí la opción que **no** pertenece.  
- Atajos de teclado: **1–5** para opciones, **Enter/Siguiente** para avanzar.  
- Botón **Mostrar pista** revela la categoría del grupo.

## Uso recomendado
- Sesiones **cortas** de 8–10 rondas, **2–3 veces por semana**.  
- Sin límite de tiempo: hacelo con calma.  
- Cuando resulte fácil, subí a 5 opciones por pregunta.

## Accesibilidad
- Tipografía grande, alto contraste y botones táctiles (48px).  
- Funciona con teclado.  
- Opción **“Muy grande”** para texto.  
- Sin audios ni animaciones agresivas; respeta `prefers-reduced-motion`.

## Evidencia (resumen)
- El **entrenamiento cognitivo computarizado** (CCT) en mayores sanos muestra **mejoras modestas** si está bien diseñado; la **dosificación** importa (mejor ≤3 sesiones/semana).  
- Entrenos centrados en **atención/control** han mostrado beneficios sostenidos en ensayos con personas mayores.  
- Este juego pertenece a la familia de tareas de **atención/ejecutivo** (no clínica).

> Actividad **lúdica/educativa**. No reemplaza la consulta con profesionales de la salud.

## Privacidad
- **No** recolecta datos personales.  
- No usa formularios, cookies de seguimiento ni cuentas.  
- Todo corre en el navegador del usuario.

## Contenido
Las categorías y palabras están en `app.js` (objeto `CAT`).  
Podés ampliarlas o moverlas a un `cat.json` si querés editar sin tocar el JS.

## Desarrollo
Es un sitio **estático** (HTML/CSS/JS).  
Para probar localmente, abrí `index.html` en el navegador.  
Para publicar, usá GitHub Pages (branch `main`, carpeta `/root`).

## Licencia
Este proyecto se distribuye bajo licencia **MIT** (ver `LICENSE.txt`).

## Créditos, reutilización y aviso

Este software fue desarrollado originalmente para su uso por **FALLTEM**  
Sitio: https://falltem.org/

**Reutilización por otras ONG:**  
El código se publica con **Licencia MIT** (ver `LICENSE`). Esto significa que cualquier organización (incluidas ONG) puede **usar, copiar, modificar y redistribuir** el software, incluso con fines comerciales, **siempre** que conserve el aviso de copyright y el texto de la licencia.

**Atribución sugerida (no obligatoria):**  
“Basado en el proyecto *Juegos Cognitivos* (MIT), desarrollado originalmente para [FALLTEM](https://falltem.org/).”

**Marcas y logotipos:**  
Los nombres, marcas y logotipos de **FALLTEM** son propiedad de sus titulares. Su uso **no** está autorizado por esta licencia. Para emplearlos en materiales propios, solicitar permiso previo.

**Descargo de responsabilidad (uso y alcance):**  
- Esta es una **actividad lúdica de estimulación cognitiva**; **no** constituye práctica médica, diagnóstico ni tratamiento.  
- El software se provee **“TAL CUAL”**, sin garantías de ningún tipo (ver `LICENSE`). El uso es **bajo exclusiva responsabilidad** de cada organización y de sus usuarios.  
- Por diseño, este proyecto **no recolecta datos personales**. Si su organización agrega formularios, analítica u otros servicios, ustedes serán responsables de cumplir con la normativa aplicable (p. ej., AAIP/Ley 25.326, GDPR, etc.).  
- Se recomienda mantener criterios de **accesibilidad** (tipografías legibles, alto contraste, navegación por teclado) y evaluar la pertinencia de cada actividad para su población objetivo.

