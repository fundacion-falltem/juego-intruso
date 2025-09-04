'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // —— Versión centralizada ——
  const VERSION = "v1.3 (FALLTEM light + a11y + cleanup)";
  const versionEl = document.getElementById('versionLabel');
  if (versionEl) versionEl.textContent = VERSION;

  // ========= Catálogo interno (fallback) =========
  const CAT = Object.freeze({
    "Frutas": Object.freeze(["manzana","pera","naranja","banana","uva","limón","frutilla","sandía","melón","durazno"]),
    "Verduras": Object.freeze(["zanahoria","tomate","lechuga","cebolla","papa","zapallo","pepino","berenjena","espinaca","brócoli"]),
    "Animales": Object.freeze(["perro","gato","vaca","caballo","oveja","cerdo","cabra","burro","toro","ciervo"]),
    "Aves": Object.freeze(["paloma","gorrión","águila","loro","gallo","pavo","canario","búho","cisne","flamenco"]),
    "Insectos": Object.freeze(["mariposa","abeja","hormiga","mosca","mosquito","mariquita","grillo","libélula","saltamontes","avispa"]),
    "Muebles": Object.freeze(["mesa","silla","cama","ropero","sofá","estante","escritorio","cómoda","banco","biblioteca"]),
    "Electrodomésticos": Object.freeze(["heladera","lavarropas","microondas","licuadora","tostadora","plancha","aspiradora","lavavajillas","ventilador","horno"]),
    "Utensilios de cocina": Object.freeze(["cuchara","tenedor","cuchillo","espátula","batidor","cucharón","colador","pelapapas","tabla","rallador"]),
    "Herramientas": Object.freeze(["martillo","destornillador","llave inglesa","sierra","alicate","tenaza","cinta métrica","taladro","nivel","pala"]),
    "Ropa": Object.freeze(["camisa","pantalón","abrigo","gorra","bufanda","medias","falda","suéter","remera","campera"]),
    "Calzado": Object.freeze(["zapato","zapatilla","bota","sandalia","ojota","pantufla","taco","botín","alpargata","zueco"]),
    "Transportes": Object.freeze(["auto","colectivo","tren","avión","bicicleta","barco","moto","tranvía","subte","camión"]),
    "Partes del cuerpo": Object.freeze(["cabeza","brazo","mano","pierna","pie","ojo","oreja","nariz","boca","espalda"]),
    "Colores": Object.freeze(["rojo","azul","verde","amarillo","naranja","violeta","rosa","marrón","gris","negro"]),
    "Formas": Object.freeze(["círculo","cuadrado","triángulo","rectángulo","óvalo","rombo","estrella","pentágono","hexágono","corazón"]),
    "Profesiones": Object.freeze(["médico","maestra","carpintero","plomero","enfermera","ingeniero","panadero","electricista","jardinero","conductor"]),
    "Lugares de la casa": Object.freeze(["cocina","baño","dormitorio","living","comedor","garaje","patio","balcón","lavadero","pasillo"]),
    "Materiales": Object.freeze(["madera","metal","plástico","vidrio","papel","cartón","tela","cuero","cerámica","goma"]),
    "Clima": Object.freeze(["lluvia","sol","viento","nieve","granizo","neblina","tormenta","arcoíris","nube","relámpago"]),
    "Bebidas": Object.freeze(["agua","té","café","leche","jugo","mate","limonada","gaseosa","chocolate caliente","soda"]),
    "Comidas": Object.freeze(["sopa","ensalada","pasta","arroz","pizza","empanada","milanesa","guiso","asado","puré"]),
    "Instrumentos musicales": Object.freeze(["guitarra","piano","violín","batería","flauta","trompeta","saxofón","acordeón","tambor","ukelele"]),
    "Objetos de escuela": Object.freeze(["cuaderno","lápiz","lapicera","goma","regla","cartuchera","mochila","sacapuntas","tijera","libro"]),
    "Tecnologías": Object.freeze(["computadora","celular","tablet","impresora","teclado","ratón","monitor","auriculares","cámara","parlante"]),
    "Juguetes": Object.freeze(["pelota","muñeca","rompecabezas","trompo","autito","bloque","osito","yo-yo","barrilete","balero"]),
    "Flores": Object.freeze(["rosa","tulipán","margarita","girasol","lirio","jazmín","orquídea","clavel","lavanda","hortensia"])
  });

  // ========= Catálogo activo (JSON externo con fallback) =========
  let CAT_ACTIVO = CAT;
  let _catalogoListo = false;

  async function cargarCatalogo(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el catálogo");
    const data = await res.json();
    validarCatalogo(data);
    return data;
  }

  function validarCatalogo(data) {
    if (!data || !Array.isArray(data.categorias)) {
      throw new Error("Catálogo inválido: falta 'categorias'");
    }
    for (const c of data.categorias) {
      if (typeof c.pista !== "string") throw new Error("Categoría sin 'pista'");
      if (!Array.isArray(c.items) || c.items.length < 3) {
        throw new Error(`'items' inválidos en ${c.pista}`);
      }
      if (!Array.isArray(c.intrusos) || c.intrusos.length !== 1) {
        throw new Error(`'intrusos' inválidos en ${c.pista}`);
      }
    }
  }

  function catalogoAObjetoCAT(data) {
    const obj = {};
    for (const c of data.categorias) obj[c.pista] = c.items.slice();
    return obj;
  }

  async function initCatalogo() {
    if (_catalogoListo) return;
    const params = new URLSearchParams(location.search);
    const url = params.get("cat") || "./data/cat-es.json";
    try {
      const data = await cargarCatalogo(url);
      CAT_ACTIVO = catalogoAObjetoCAT(data);
      console.log("Catálogo externo activo:", url);
    } catch (e) {
      console.warn("Catálogo externo no disponible, uso fallback interno:", e.message);
      CAT_ACTIVO = CAT;
    } finally {
      _catalogoListo = true;
    }
  }

  // ========= Estado =========
  let rondasTotales = 8, ronda = 0, aciertos = 0, nOpc = 4, bar;
  let categoriaActual = null, ultimaCategoria = null;

  // ========= Refs =========
  const juegoEl     = document.getElementById('juego');
  const progresoEl  = document.getElementById('progreso');
  const aciertosHUD = document.getElementById('aciertos');
  const btnComenzar = document.getElementById('btnComenzar');
  const btnReiniciar= document.getElementById('btnReiniciar');
  const selRondas   = document.getElementById('rondas');
  const selOpc      = document.getElementById('opciones');
  const selTam      = document.getElementById('tamano');

  // Tema / modal
  const themeBtn    = document.getElementById('themeToggle');
  const aboutBtn    = document.getElementById('aboutBtn');
  const aboutModal  = document.getElementById('aboutModal');
  const aboutClose  = document.getElementById('aboutClose');

  // ========= Utilidades =========
  const barajar = (arr)=>{ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };
  const sample = (arr,k)=>{ const c=[...arr]; barajar(c); return c.slice(0, Math.min(k, c.length)); };

  const setSelectValue = (el, val, allowed) => { if (allowed.includes(String(val))) { el.value = String(val); } };

  const elegirCategoria = (excluir = [])=>{
    const excl = Array.isArray(excluir) ? excluir : [excluir];
    const keys = Object.keys(CAT_ACTIVO).filter(k=> !excl.includes(k));
    return keys[Math.floor(Math.random()*keys.length)];
  };

  function actualizar(){
    progresoEl.textContent = `${Math.min(ronda, rondasTotales)}/${rondasTotales}`;
    aciertosHUD.textContent = String(aciertos);
    if (bar) { bar.style.width = Math.round((Math.min(ronda, rondasTotales)/rondasTotales)*100) + "%"; }
  }

  function construirRonda(){
    categoriaActual = elegirCategoria(ultimaCategoria ? [ultimaCategoria] : []);
    const otra = elegirCategoria([categoriaActual]);

    const correctas = sample(CAT_ACTIVO[categoriaActual], Math.max(2, nOpc-1));
    const intruso = sample(CAT_ACTIVO[otra], 1)[0];

    let opciones = barajar([
      ...correctas.map(x=>({txt:x, ok:false})),
      {txt:intruso, ok:true, catIntruso:otra}
    ]).slice(0, nOpc);

    if (!opciones.some(o=>o.ok)) { // asegurar 1 intruso
      opciones[0] = {txt:intruso, ok:true, catIntruso:otra};
      barajar(opciones);
    }

    ultimaCategoria = categoriaActual;
    return opciones;
  }

  // ========= Render seguro =========
  function el(tag, cls, text){
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  function resetOpciones(container){
    // Limpia cualquier rastro visual por si el DOM se reusa (anti “preselección”)
    container.querySelectorAll('button').forEach(b=>{
      b.disabled = false;
      b.classList.remove('marcada','ok','bad','correcta','incorrecta');
      // no removemos el rol de correcta/incorrecta aquí; se asigna al crear cada ronda
      b.removeAttribute('aria-disabled');
    });
    container.removeAttribute('aria-busy');
  }

  // Construye bloque de acciones (NO lo inserta).
  function crearAcciones(fb){
    const tpl = document.querySelector('#accionesPlantilla .acciones');
    const acciones = tpl ? tpl.cloneNode(true) : el('div','acciones');

    // Pista (si existe en la plantilla)
    const btnPistaLocal = acciones.querySelector?.('.btn-pista');
    if (btnPistaLocal) {
      btnPistaLocal.hidden = false;
      btnPistaLocal.addEventListener('click', ()=>{
        fb.className = 'feedback';
        fb.textContent = `Pista: categoría del grupo = “${categoriaActual}”.`;
        fb.focus();
      });
    }

    // Siguiente
    const next = el('button', 'btn principal', 'Siguiente');
    next.disabled = true;
    next.setAttribute('aria-disabled','true');
    acciones.appendChild(next);

    return { acciones, next };
  }

  function renderPregunta(){
    if (ronda >= rondasTotales){ renderFin(); return; }

    const opciones = construirRonda();

    // limpiar contenedor principal
    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);

    const tarjeta = el('div', 'tarjeta');
    tarjeta.setAttribute('role','group');
    tarjeta.setAttribute('aria-labelledby','enunciado');

    // barra progreso
    const pb = el('div', 'progresoBar'); pb.setAttribute('aria-hidden','true');
    const fill = el('div'); pb.appendChild(fill); bar = fill; actualizar();

    // enunciado
    const enunciado = el('p', 'pregunta'); enunciado.id = 'enunciado';
    enunciado.textContent = '🧠 ¿Qué palabra no pertenece al grupo?';

    // opciones
    const cont = el('div', 'opciones');

    // feedback accesible
    const fb = el('p', 'feedback');
    fb.setAttribute('role','status');
    fb.setAttribute('aria-live','polite');
    fb.setAttribute('aria-atomic','true');
    fb.tabIndex = -1;

    // acciones (se insertan al final)
    const { acciones, next } = crearAcciones(fb);

    // armar botones de opciones
    opciones.forEach((op, i)=>{
      const b = el('button', op.ok ? 'correcta' : 'incorrecta');
      b.setAttribute('aria-label', `Opción ${i+1}: ${op.txt}`);
      b.appendChild(el('strong', null, `${i+1}.`));
      b.appendChild(document.createTextNode(' ' + op.txt));
      b.addEventListener('click', ()=> elegir(b, op, cont, fb, next));
      cont.appendChild(b);
    });

    // orden correcto en la tarjeta
    tarjeta.appendChild(pb);
    tarjeta.appendChild(enunciado);
    tarjeta.appendChild(cont);
    tarjeta.appendChild(fb);
    tarjeta.appendChild(acciones);

    juegoEl.appendChild(tarjeta);

    // Reset preventivo de estados + foco a primera opción
    resetOpciones(cont);
    requestAnimationFrame(()=>{
      cont.querySelector('button')?.focus({ preventScroll:true });
      tarjeta.scrollIntoView({ behavior:'smooth', block:'start' });
    });

    // Atajos 1..5 (una sola vez por render)
    const onKey = (e)=>{
      const n = Number.parseInt(e.key, 10);
      if(Number.isInteger(n) && n>=1 && n<=5){ cont.children[n-1]?.click(); }
    };
    document.addEventListener('keydown', onKey, {once:true});
  }

  function elegir(btn, op, cont, fb, next){
    // bloquear interacción mientras se evalúa
    cont.setAttribute('aria-busy','true');

    cont.querySelectorAll('button').forEach(b=> b.disabled = true);
    btn.classList.add('marcada');

    if(op.ok){
      aciertos++;
      fb.className = 'feedback ok';
      fb.textContent = `✔ Correcto. El intruso es “${op.txt}”. La categoría del grupo era “${categoriaActual}”.`;
    } else {
      fb.className = 'feedback bad';
      fb.textContent = `✘ Casi. La categoría del grupo era “${categoriaActual}”.`;
    }

    fb.focus();
    next.disabled = false;
    next.setAttribute('aria-disabled','false');

    // Reemplazar handler previo y avanzar una sola vez
    const acciones = next.parentElement;
    const nextClon = next.cloneNode(true);
    acciones.replaceChild(nextClon, next);
    nextClon.addEventListener('click', ()=>{
      ronda++; actualizar();
      renderPregunta();
    }, {once:true});

    // liberar aria-busy con pequeño retraso para que el lector anuncie el feedback
    setTimeout(()=> cont.removeAttribute('aria-busy'), 120);
  }

  function renderFin(){
    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);

    const tarjeta = el('div', 'tarjeta');
    tarjeta.appendChild(el('p','pregunta','🎉 ¡Buen trabajo!'));
    tarjeta.appendChild(el('p',null,`Tu resultado: ${aciertos} de ${rondasTotales}.`));
    tarjeta.appendChild(el('p',null,'Podés volver a jugar cambiando el tamaño de texto u opciones por pregunta.'));
    juegoEl.appendChild(tarjeta);

    btnReiniciar.hidden = false;
    btnComenzar.hidden = true;
  }

  // ========= Preferencias / tamaño =========
  function aplicarTam(){
    const muy = selTam.value === 'muy-grande';
    document.documentElement.classList.toggle('muy-grande', muy);
    try{ localStorage.setItem('intruso_tamano', muy ? 'muy-grande' : 'grande'); }catch{}
  }

  async function comenzar(){
    await initCatalogo(); // asegurar catálogo

    rondasTotales = Number(selRondas.value);
    nOpc = Number(selOpc.value);

    try{
      localStorage.setItem('intruso_rondas', selRondas.value);
      localStorage.setItem('intruso_opciones', selOpc.value);
    }catch{}

    ronda = 0; aciertos = 0; ultimaCategoria = null;
    btnReiniciar.hidden = true;
    btnComenzar.hidden = true;
    aplicarTam();
    renderPregunta();
  }

  // ========= Eventos =========
  btnComenzar?.addEventListener('click', comenzar);
  btnReiniciar?.addEventListener('click', ()=>{
    btnComenzar.hidden = false;
    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);
    aciertos = 0; ronda = 0; ultimaCategoria = null; actualizar();
  });
  selTam?.addEventListener('change', aplicarTam);

  selRondas?.addEventListener('change', ()=>{ try{ localStorage.setItem('intruso_rondas', selRondas.value); }catch{} });
  selOpc?.addEventListener('change',   ()=>{ try{ localStorage.setItem('intruso_opciones', selOpc.value); }catch{} });

  // Restaurar preferencias
  try{
    const prefTam = localStorage.getItem('intruso_tamano');
    setSelectValue(selTam, prefTam, ['grande','muy-grande']); aplicarTam();

    const sR = localStorage.getItem('intruso_rondas');
    setSelectValue(selRondas, sR, ['6','8','10']);

    const sO = localStorage.getItem('intruso_opciones');
    setSelectValue(selOpc, sO, ['3','4','5']);
  }catch{}

  actualizar();

  // ========= Modal “Acerca de” =========
  function openAbout(){ aboutModal?.setAttribute('aria-hidden','false'); aboutClose?.focus(); }
  function closeAbout(){ aboutModal?.setAttribute('aria-hidden','true'); }
  aboutBtn?.addEventListener('click', openAbout);
  aboutClose?.addEventListener('click', closeAbout);
  aboutModal?.addEventListener('click', (e)=>{ if(e.target===aboutModal) closeAbout(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeAbout(); });

  // ========= Tema claro/oscuro (LIGHT por defecto) =========
  function labelFor(mode){ return mode === 'dark' ? 'Usar modo claro' : 'Usar modo oscuro'; }
  function applyTheme(mode){
    const m = (mode === 'light' || mode === 'dark') ? mode : 'light'; // default light
    document.documentElement.setAttribute('data-theme', m);
    if (themeBtn) {
      themeBtn.textContent = labelFor(m);
      themeBtn.setAttribute('aria-pressed', String(m === 'dark'));
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', m === 'dark' ? '#0b0b0b' : '#f8fbf4');
  }

  (function initTheme(){
    let mode = 'light';
    try{
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') mode = stored;
    }catch{}
    applyTheme(mode);
  })();

  themeBtn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch {}
    applyTheme(next);
  });
});
