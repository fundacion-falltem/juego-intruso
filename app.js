'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ------- Catálogo -------
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

  // ------- Estado -------
  let rondasTotales = 8, ronda = 0, aciertos = 0, nOpc = 4, bar;
  let categoriaActual = null, ultimaCategoria = null;

  // ------- Refs -------
  const juegoEl     = document.getElementById('juego');
  const progresoEl  = document.getElementById('progreso');
  const aciertosEl  = document.getElementById('aciertos');
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

  // ------- Utilidades -------
  const barajar = (arr)=>{ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };
  const elegirCategoria = (excluir = [])=>{
    const excl = Array.isArray(excluir) ? excluir : [excluir];
    const keys = Object.keys(CAT).filter(k=> !excl.includes(k));
    return keys[Math.floor(Math.random()*keys.length)];
  };
  const sample = (arr,k)=>{ const c=[...arr]; barajar(c); return c.slice(0, Math.min(k, c.length)); };

  const setSelectValue = (el, val, allowed) => { if (allowed.includes(String(val))) { el.value = String(val); } };

  function actualizar(){
    progresoEl.textContent = `${Math.min(ronda, rondasTotales)}/${rondasTotales}`;
    aciertosEl.textContent = String(aciertos);
    if (bar) { bar.style.width = Math.round((Math.min(ronda, rondasTotales)/rondasTotales)*100) + "%"; }
  }

  function construirRonda(){
    categoriaActual = elegirCategoria(ultimaCategoria ? [ultimaCategoria] : []);
    const otra = elegirCategoria([categoriaActual]);

    const correctas = sample(CAT[categoriaActual], Math.max(2, nOpc-1));
    const intruso = sample(CAT[otra], 1)[0];

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

  // ------- Render seguro -------
  function el(tag, cls, text){
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  function montarAcciones(tarjeta, fb){
    // Clonar la plantilla de acciones
    const tpl = document.querySelector('#accionesPlantilla .acciones');
    const acciones = tpl.cloneNode(true);

    // Botón Pista
    const btnPista = acciones.querySelector('.btn-pista');
    if (btnPista) {
      btnPista.hidden = false;
      btnPista.addEventListener('click', ()=>{
        fb.className = 'feedback';
        fb.textContent = `Pista: categoría del grupo = “${categoriaActual}”.`;
        fb.focus();
      });
    }

    // Botón Siguiente
    const next = el('button', 'btn principal', 'Siguiente');
    next.disabled = true;
    next.setAttribute('aria-disabled','true');
    acciones.appendChild(next);

    tarjeta.appendChild(acciones);
    return next;
  }

  function renderPregunta(){
    if (ronda >= rondasTotales){ renderFin(); return; }

    const opciones = construirRonda();

    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);

    const tarjeta = el('div', 'tarjeta');
    tarjeta.setAttribute('role','group');
    tarjeta.setAttribute('aria-labelledby','enunciado');

    const pb = el('div', 'progresoBar'); pb.setAttribute('aria-hidden','true');
    const fill = el('div'); pb.appendChild(fill); bar = fill; actualizar();

    const enunciado = el('p', 'pregunta'); enunciado.id = 'enunciado';
    enunciado.textContent = '🧠 ¿Qué palabra no pertenece al grupo?';

    const cont = el('div', 'opciones');
    opciones.forEach((op, i)=>{
      const b = el('button', op.ok ? 'correcta' : 'incorrecta');
      b.setAttribute('aria-label', `Opción ${i+1}: ${op.txt}`);
      b.appendChild(el('strong', null, `${i+1}.`));
      b.appendChild(document.createTextNode(' ' + op.txt));
      b.addEventListener('click', ()=> elegir(b, op, fb, next));
      cont.appendChild(b);
    });

    const fb = el('p', 'feedback');
    fb.setAttribute('role','status');
    fb.setAttribute('aria-live','polite');
    fb.setAttribute('aria-atomic','true');
    fb.tabIndex = -1;

    tarjeta.appendChild(pb);
    tarjeta.appendChild(enunciado);
    tarjeta.appendChild(cont);
    tarjeta.appendChild(fb);

    // Montar acciones dentro de la tarjeta
    const next = montarAcciones(tarjeta, fb);

    juegoEl.appendChild(tarjeta);

    // Atajos teclado
    const onKey = (e)=>{
      const n = Number.parseInt(e.key, 10);
      if(Number.isInteger(n) && n>=1 && n<=5){ cont.children[n-1]?.click(); }
    };
    document.addEventListener('keydown', onKey, {once:true});
  }

  function elegir(btn, op, fb, next){
    document.querySelectorAll('.opciones button').forEach(b=> b.disabled = true);
    btn.classList.add('marcada');

    if(op.ok){
      aciertos++;
      fb.className = 'feedback ok';
      fb.textContent = `✔ Correcto. El intruso es “${op.txt}”. La categoría es “${categoriaActual}”.`;
    } else {
      fb.className = 'feedback bad';
      fb.textContent = `✘ Casi. La categoría del grupo es “${categoriaActual}”.`;
    }

    fb.focus();
    next.disabled = false;
    next.setAttribute('aria-disabled','false');
    next.replaceWith(next.cloneNode(true));
    const nuevoNext = juegoEl.querySelector('.btn.principal');
    nuevoNext.addEventListener('click', ()=>{ ronda++; actualizar(); renderPregunta(); }, {once:true});
  }

  function renderFin(){
    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);

    const tarjeta = el('div', 'tarjeta');
    tarjeta.appendChild(el('p','pregunta','🎉 ¡Buen trabajo!'));
    const p2 = el('p',null,`Tu resultado: ${aciertos} de ${rondasTotales}.`);
    tarjeta.appendChild(p2);
    tarjeta.appendChild(el('p',null,'Puedes volver a jugar cambiando el tamaño de texto u opciones por pregunta.'));
    juegoEl.appendChild(tarjeta);

    btnReiniciar.hidden = false;
    btnComenzar.hidden = true;
  }

  // ------- Preferencias -------
  function aplicarTam(){
    const muy = selTam.value === 'muy-grande';
    document.documentElement.classList.toggle('muy-grande', muy);
    try{ localStorage.setItem('intruso_tamano', muy ? 'muy-grande' : 'grande'); }catch{}
  }

  function comenzar(){
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

  // ------- Eventos -------
  btnComenzar?.addEventListener('click', comenzar);
  btnReiniciar?.addEventListener('click', ()=>{
    btnComenzar.hidden = false;
    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);
    aciertos = 0; ronda = 0; ultimaCategoria = null; actualizar();
  });
  selTam?.addEventListener('change', aplicarTam);

  selRondas?.addEventListener('change', ()=>{ try{ localStorage.setItem('intruso_rondas', selRondas.value); }catch{} });
  selOpc?.addEventListener('change', ()=>{ try{ localStorage.setItem('intruso_opciones', selOpc.value); }catch{} });

  try{
    const prefTam = localStorage.getItem('intruso_tamano');
    setSelectValue(selTam, prefTam, ['grande','muy-grande']); aplicarTam();
    const sR = localStorage.getItem('intruso_rondas');
    setSelectValue(selRondas, sR, ['6','8','10']);
    const sO = localStorage.getItem('intruso_opciones');
    setSelectValue(selOpc, sO, ['3','4','5']);
  }catch{}

  actualizar();

  // ------- Modal -------
  function openAbout(){ aboutModal?.setAttribute('aria-hidden','false'); aboutClose?.focus(); }
  function closeAbout(){ aboutModal?.setAttribute('aria-hidden','true'); }
  aboutBtn?.addEventListener('click', openAbout);
  aboutClose?.addEventListener('click', closeAbout);
  aboutModal?.addEventListener('click', (e)=>{ if(e.target===aboutModal) closeAbout(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeAbout(); });

  // ------- Tema -------
  function applyTheme(mode){
    const m = (mode === 'light' || mode === 'dark') ? mode : 'dark';
    document.documentElement.setAttribute('data-theme', m);
    if (themeBtn) {
      const isDark = (m === 'dark');
      themeBtn.textContent = isDark ? '🌞 Cambiar a claro' : '🌙 Cambiar a oscuro';
      themeBtn.setAttribute('aria-pressed', String(isDark));
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', m === 'dark' ? '#0b0b0b' : '#ffffff');
  }

  (function initTheme(){
    let mode = 'dark';
    try{
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        mode = stored;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        mode = 'light';
      }
    }catch{}
    applyTheme(mode);
  })();

  try {
    if (!localStorage.getItem('theme') && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      mq.addEventListener?.('change', (e) => applyTheme(e.matches ? 'light' : 'dark'));
    }
  } catch {}

  themeBtn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch {}
    applyTheme(next);
  });
});
