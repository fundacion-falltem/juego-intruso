'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const VERSION = "Intruso v2.2.3 (CTA final a otros juegos)";
  const versionEl = document.getElementById('versionLabel');
  if (versionEl) versionEl.textContent = VERSION;

  /* ===== Catálogo fallback ===== */
  const CAT = Object.freeze({
    "Frutas":["manzana","pera","naranja","banana","uva","limón","frutilla","sandía","melón","durazno"],
    "Verduras":["zanahoria","tomate","lechuga","cebolla","papa","zapallo","pepino","berenjena","espinaca","brócoli"],
    "Animales":["perro","gato","vaca","caballo","oveja","cerdo","cabra","burro","toro","ciervo"],
    "Aves":["paloma","gorrión","águila","loro","gallo","pavo","canario","búho","cisne","flamenco"],
    "Insectos":["mariposa","abeja","hormiga","mosca","mosquito","mariquita","grillo","libélula","saltamontes","avispa"],
    "Muebles":["mesa","silla","cama","ropero","sofá","estante","escritorio","cómoda","banco","biblioteca"],
    "Electrodomésticos":["heladera","lavarropas","microondas","licuadora","tostadora","plancha","aspiradora","lavavajillas","ventilador","horno"],
    "Utensilios de cocina":["cuchara","tenedor","cuchillo","espátula","batidor","cucharón","colador","pelapapas","tabla","rallador"],
    "Herramientas":["martillo","destornillador","llave inglesa","sierra","alicate","tenaza","cinta métrica","taladro","nivel","pala"],
    "Ropa":["camisa","pantalón","abrigo","gorra","bufanda","medias","falda","suéter","remera","campera"],
    "Calzado":["zapato","zapatilla","bota","sandalia","ojota","pantufla","taco","botín","alpargata","zueco"],
    "Transportes":["auto","colectivo","tren","avión","bicicleta","barco","moto","tranvía","subte","camión"],
    "Partes del cuerpo":["cabeza","brazo","mano","pierna","pie","ojo","oreja","nariz","boca","espalda"],
    "Colores":["rojo","azul","verde","amarillo","naranja","violeta","rosa","marrón","gris","negro"],
    "Formas":["círculo","cuadrado","triángulo","rectángulo","óvalo","rombo","estrella","pentágono","hexágono","corazón"],
    "Profesiones":["médico","maestra","carpintero","plomero","enfermera","ingeniero","panadero","electricista","jardinero","conductor"],
    "Lugares de la casa":["cocina","baño","dormitorio","living","comedor","garaje","patio","balcón","lavadero","pasillo"],
    "Materiales":["madera","metal","plástico","vidrio","papel","cartón","tela","cuero","cerámica","goma"],
    "Clima":["lluvia","sol","viento","nieve","granizo","neblina","tormenta","arcoíris","nube","relámpago"],
    "Bebidas":["agua","té","café","leche","jugo","mate","limonada","gaseosa","chocolate caliente","soda"],
    "Comidas":["sopa","ensalada","pasta","arroz","pizza","empanada","milanesa","guiso","asado","puré"],
    "Instrumentos musicales":["guitarra","piano","violín","batería","flauta","trompeta","saxofón","acordeón","tambor","ukelele"],
    "Objetos de escuela":["cuaderno","lápiz","lapicera","goma","regla","cartuchera","mochila","sacapuntas","tijera","libro"],
    "Tecnologías":["computadora","celular","tablet","impresora","teclado","ratón","monitor","auriculares","cámara","parlante"],
    "Juguetes":["pelota","muñeca","rompecabezas","trompo","autito","bloque","osito","yo-yo","barrilete","balero"],
    "Flores":["rosa","tulipán","margarita","girasol","lirio","jazmín","orquídea","clavel","lavanda","hortensia"]
  });

  /* ===== Catálogo externo con timeout ===== */
  let CAT_ACTIVO = CAT;
  let _catalogoListo = false;

  function cargarCatalogo(url){
    return fetch(url, {cache:'no-store'})
      .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .catch(() => ({categorias:[]}));
  }
  function catalogoAObjetoCAT(data){
    const o={}; (data.categorias||[]).forEach(c=>{ o[c.pista]=c.items.slice(); });
    return o;
  }
  function initCatalogo(){
    if (_catalogoListo) return Promise.resolve();
    const params = new URLSearchParams(location.search);
    const url = params.get('cat') || './data/cat-es.json';
    const timeout = new Promise(res => setTimeout(res, 600, {categorias:[]}));
    return Promise.race([cargarCatalogo(url), timeout])
      .then(data => { CAT_ACTIVO = (data.categorias && data.categorias.length) ? catalogoAObjetoCAT(data) : CAT; })
      .finally(() => { _catalogoListo = true; });
  }

  /* ===== Estado y refs ===== */
  let rondasTotales=8, ronda=0, aciertos=0, nOpc=4, bar;
  let categoriaActual=null, ultimaCategoria=null;

  const juegoEl      = document.getElementById('juego');
  const progresoEl   = document.getElementById('progreso');
  const aciertosHUD  = document.getElementById('aciertos');
  const btnComenzar  = document.getElementById('btnComenzar');
  const btnReiniciar = document.getElementById('btnReiniciar');
  const btnOtroJuego = document.getElementById('btnOtroJuego'); // no se usa arriba
  const selRondas    = document.getElementById('rondas');
  const selOpc       = document.getElementById('opciones');

  const themeBtn   = document.getElementById('themeToggle');
  const aboutBtn   = document.getElementById('aboutBtn');
  const aboutModal = document.getElementById('aboutModal');
  const aboutClose = document.getElementById('aboutClose');

  const srUpdates = document.getElementById('sr-updates');
  const announce = t => { if (srUpdates) srUpdates.textContent = t; };

  /* ===== Utils ===== */
  const barajar = a => { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const sample  = (a,k)=> a.slice(0).sort(()=>Math.random()-0.5).slice(0, Math.min(k,a.length));
  const elegirCategoria = (excluir=[])=>{
    const excl = Array.isArray(excluir)?excluir:[excluir].filter(Boolean);
    const keys = Object.keys(CAT_ACTIVO).filter(k => !excl.includes(k));
    return keys[Math.floor(Math.random()*keys.length)];
  };
  function actualizar(){
    if (progresoEl) progresoEl.textContent = `${Math.min(ronda, rondasTotales)}/${rondasTotales}`;
    if (aciertosHUD) aciertosHUD.textContent = String(aciertos);
    if (bar) bar.style.width = Math.round((Math.min(ronda, rondasTotales)/rondasTotales)*100) + "%";
  }
  function setTopActions(mode){
    // nunca mostramos el CTA superior “Elegir otro juego”
    if (mode==='idle'){ btnComenzar.hidden=false; btnReiniciar.hidden=true; if(btnOtroJuego) btnOtroJuego.hidden=true; }
    if (mode==='playing'){ btnComenzar.hidden=true; btnReiniciar.hidden=true; if(btnOtroJuego) btnOtroJuego.hidden=true; }
    if (mode==='finished'){ btnComenzar.hidden=false; btnReiniciar.hidden=true; if(btnOtroJuego) btnOtroJuego.hidden=true; }
  }

  /* ===== Rondas ===== */
  function construirRonda(){
    categoriaActual = elegirCategoria(ultimaCategoria || []);
    const otra = elegirCategoria([categoriaActual]);
    const correctas = sample(CAT_ACTIVO[categoriaActual], Math.max(2, nOpc-1));
    const intruso = sample(CAT_ACTIVO[otra], 1)[0];

    let opciones = barajar([
      ...correctas.map(x => ({txt:x, ok:false})),
      {txt:intruso, ok:true, catIntruso:otra}
    ]).slice(0, nOpc);

    if (!opciones.some(o=>o.ok)){
      opciones[0] = {txt:intruso, ok:true, catIntruso:otra};
      barajar(opciones);
    }
    ultimaCategoria = categoriaActual;
    return opciones;
  }

  const el = (t,c,txt)=>{ const n=document.createElement(t); if(c) n.className=c; if(txt!=null) n.textContent=String(txt); return n; };
  function resetOpciones(container){
    container.querySelectorAll('button').forEach(b=>{
      b.disabled=false; b.classList.remove('marcada','ok','bad','correcta','incorrecta'); b.removeAttribute('aria-disabled');
    });
    container.removeAttribute('aria-busy');
  }

  function crearAcciones(fb){
    const tpl = document.getElementById('accionesPlantilla');
    let proto = null;
    if (tpl){
      if (tpl.content) proto = tpl.content.querySelector('.acciones');
      else proto = tpl.querySelector('.acciones');
    }
    const acciones = proto ? proto.cloneNode(true) : el('div','acciones');

    const btnPista = acciones.querySelector('.btn-pista');
    if (btnPista){
      btnPista.hidden=false;
      btnPista.addEventListener('click', ()=>{
        fb.className='feedback';
        fb.textContent = `Pista: categoría del grupo = “${categoriaActual}”.`;
        try{ fb.focus(); }catch{}
      });
    }
    const next = el('button','btn principal','Siguiente');
    next.disabled=true; next.setAttribute('aria-disabled','true');
    acciones.appendChild(next);
    return {acciones, next};
  }

  function renderPregunta(){
    if (ronda>=rondasTotales){ renderFin(); return; }
    const opciones = construirRonda();

    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);

    const card = el('div','tarjeta'); card.setAttribute('role','group'); card.setAttribute('aria-labelledby','enunciado');
    const pb = el('div','progresoBar'); pb.setAttribute('aria-hidden','true'); const fill=el('div'); pb.appendChild(fill); bar=fill; actualizar();
    const en = el('p','pregunta','🧠 ¿Qué palabra no pertenece al grupo?'); en.id='enunciado';
    const cont = el('div','opciones');
    const fb = el('p','feedback'); fb.setAttribute('role','status'); fb.setAttribute('aria-live','polite'); fb.setAttribute('aria-atomic','true'); fb.tabIndex=-1;
    const {acciones, next} = crearAcciones(fb);

    opciones.forEach((op,i)=>{
      const b = el('button', op.ok ? 'correcta' : 'incorrecta');
      b.setAttribute('aria-label', `Opción ${i+1}: ${op.txt}`);
      b.appendChild(el('strong',null,`${i+1}.`));
      b.appendChild(document.createTextNode(' '+op.txt));
      b.addEventListener('click', ()=> elegir(b,op,cont,fb,next));
      cont.appendChild(b);
    });

    card.appendChild(pb); card.appendChild(en); card.appendChild(cont); card.appendChild(fb); card.appendChild(acciones);
    juegoEl.appendChild(card);

    resetOpciones(cont);
    requestAnimationFrame(()=>{
      cont.querySelector('button')?.focus({preventScroll:true});
      try{ card.scrollIntoView({behavior:'smooth', block:'start'}); }catch{}
    });

    const onKey = e => {
      const n = parseInt(e.key,10);
      if(!isNaN(n) && n>=1 && n<=5 && cont.children[n-1]) cont.children[n-1].click();
      document.removeEventListener('keydown', onKey);
    };
    document.addEventListener('keydown', onKey);
  }

  function elegir(btn, op, cont, fb, next){
    cont.setAttribute('aria-busy','true');
    cont.querySelectorAll('button').forEach(b=> b.disabled=true);
    btn.classList.add('marcada');

    if(op.ok){
      aciertos++; fb.className='feedback ok';
      fb.textContent = `✔ Correcto. El intruso es “${op.txt}”. La categoría del grupo era “${categoriaActual}”.`;
      announce('Correcto.');
    } else {
      fb.className='feedback bad';
      fb.textContent = `✘ Casi. La categoría del grupo era “${categoriaActual}”.`;
      announce('Incorrecto.');
    }

    try{ fb.focus(); }catch{}
    next.disabled=false; next.setAttribute('aria-disabled','false');
    const clon = next.cloneNode(true);
    next.parentElement.replaceChild(clon,next);
    clon.addEventListener('click', ()=>{ ronda++; actualizar(); renderPregunta(); });
    setTimeout(()=> cont.removeAttribute('aria-busy'), 120);
  }

  function renderFin(){
    while (juegoEl.firstChild) juegoEl.removeChild(juegoEl.firstChild);
    const card = el('div','tarjeta');
    card.appendChild(el('p','pregunta','🎉 ¡Buen trabajo!'));
    card.appendChild(el('p',null,`Tu resultado: ${aciertos} de ${rondasTotales}.`));
    card.appendChild(el('p',null,'Podés volver a jugar cambiando las opciones del juego.'));

    const acc = el('div','acciones');

    // Volver a jugar
    const again = el('button','btn principal','Volver a jugar');
    again.addEventListener('click', comenzar);
    acc.appendChild(again);

    // NUEVO: CTA “Elegir otro juego” dentro de la tarjeta final
    const linkOtro = document.createElement('a');
    linkOtro.href = 'https://falltem.org/juegos/#games-cards';
    linkOtro.className = 'btn secundario';
    linkOtro.textContent = 'Elegir otro juego';
    linkOtro.setAttribute('role','button');
    linkOtro.setAttribute('aria-label','Elegir otro juego en el sitio de FALLTEM');
    // para que coincida el ancho de .acciones button
    linkOtro.style.display = 'inline-block';
    linkOtro.style.width = '72%';
    linkOtro.style.maxWidth = '320px';
    linkOtro.style.textAlign = 'center';
    acc.appendChild(linkOtro);

    card.appendChild(acc);
    juegoEl.appendChild(card);

    setTopActions('finished');
    document.body.classList.remove('fab-compact');
    announce('Fin del juego.');
  }

  /* ===== Iniciar ===== */
  function comenzar(){
    btnComenzar.disabled = true;
    setTopActions('playing');
    document.body.classList.add('fab-compact');
    juegoEl.innerHTML = `<div class="tarjeta"><p class="pregunta">⏳ Cargando…</p></div>`;

    initCatalogo().then(()=>{
      rondasTotales = Number(selRondas?.value || 8);
      nOpc          = Number(selOpc?.value    || 4);
      try{
        if (selRondas) localStorage.setItem('intruso_rondas', selRondas.value);
        if (selOpc)    localStorage.setItem('intruso_opciones', selOpc.value);
      }catch{}
      ronda=0; aciertos=0; ultimaCategoria=null;
      renderPregunta();
      announce('Comienza el juego.');
    }).finally(()=>{
      btnComenzar.disabled = false;
    });
  }

  btnComenzar?.addEventListener('click', comenzar);
  btnReiniciar?.addEventListener('click', comenzar);
  selRondas?.addEventListener('change', ()=>{ try{ localStorage.setItem('intruso_rondas', selRondas.value); }catch{} });
  selOpc?.addEventListener('change',   ()=>{ try{ localStorage.setItem('intruso_opciones', selOpc.value); }catch{} });

  try{
    const sR=localStorage.getItem('intruso_rondas'); if(sR && ['6','8','10'].includes(sR) && selRondas) selRondas.value=sR;
    const sO=localStorage.getItem('intruso_opciones'); if(sO && ['3','4','5'].includes(sO) && selOpc) selOpc.value=sO;
  }catch{}
  actualizar(); setTopActions('idle');

  /* ===== Modal ===== */
  function openAbout(){ aboutModal?.setAttribute('aria-hidden','false'); document.body.classList.add('no-scroll'); document.body.classList.remove('fab-compact'); aboutClose?.focus(); }
  function closeAbout(){ aboutModal?.setAttribute('aria-hidden','true'); document.body.classList.remove('no-scroll'); if (btnComenzar && btnComenzar.hidden) document.body.classList.add('fab-compact'); }
  aboutBtn?.addEventListener('click', openAbout);
  aboutClose?.addEventListener('click', closeAbout);
  aboutModal?.addEventListener('click', e=>{ if(e.target===aboutModal) closeAbout(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeAbout(); });

  /* ===== Tema FAB ===== */
  function applyTheme(mode){
    const m = (mode==='dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', m);
    if (themeBtn){
      const isDark = m==='dark';
      themeBtn.textContent = isDark ? '🌞' : '🌙';
      themeBtn.setAttribute('aria-pressed', String(isDark));
      themeBtn.setAttribute('aria-label', isDark ? 'Usar modo claro' : 'Usar modo oscuro');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', m==='dark' ? '#0e0e0e' : '#f8fbf4');
  }
  (function initTheme(){
    let mode='light';
    try{
      const stored=localStorage.getItem('theme');
      if (stored==='light' || stored==='dark') mode=stored;
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) mode='dark';
    }catch{}
    applyTheme(mode);
  })();
  themeBtn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current==='dark' ? 'light' : 'dark';
    try{ localStorage.setItem('theme', next); }catch{}
    applyTheme(next);
  });

  // No hay sonidos en este juego
  document.getElementById('soundToggle')?.remove();

  announce('Listo. Elegí rondas y opciones, y presioná Comenzar.');
});

/* ===== Service Worker ===== */
if ('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./service-worker.js').then(reg=>{
      if(reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
      reg.addEventListener('updatefound', ()=>{
        const sw=reg.installing; if(!sw) return;
        sw.addEventListener('statechange', ()=>{
          if(sw.state==='installed' && navigator.serviceWorker.controller){
            // actualización disponible
          }
        });
      });
    }).catch(console.error);
  });
}
