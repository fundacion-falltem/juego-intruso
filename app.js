'use strict';

document.addEventListener('DOMContentLoaded', () => {
  /* ===== Versión ===== */
  const VERSION = "Intruso v2.3.0";
  const versionEl = document.getElementById('versionLabel');
  if (versionEl) versionEl.textContent = VERSION;

  /* ===== Catálogo (fallback interno simple) ===== */
  const CAT = Object.freeze({
    "Frutas": Object.freeze(["manzana","pera","naranja","banana","uva","limón","frutilla","sandía","melón","durazno"]),
    "Verduras": Object.freeze(["zanahoria","tomate","lechuga","cebolla","papa","zapallo","pepino","berenjena","espinaca","brócoli"]),
    "Animales": Object.freeze(["perro","gato","vaca","caballo","oveja","cerdo","cabra","burro","toro","ciervo"]),
    "Aves": Object.freeze(["paloma","gorrión","águila","loro","gallo","pavo","canario","búho","cisne","flamenco"]),
    "Herramientas": Object.freeze(["martillo","destornillador","llave inglesa","sierra","alicate","tenaza","cinta métrica","taladro","nivel","pala"]),
    "Transportes": Object.freeze(["auto","colectivo","tren","avión","bicicleta","barco","moto","tranvía","subte","camión"]),
    "Ropa": Object.freeze(["camisa","pantalón","abrigo","gorra","bufanda","medias","falda","suéter","remera","campera"]),
    "Comidas": Object.freeze(["sopa","ensalada","pasta","arroz","pizza","empanada","milanesa","guiso","asado","puré"])
  });
  let CAT_ACTIVO = CAT;

  /* ===== Estado ===== */
  let rondasTotales = 8, ronda = 0, aciertos = 0, nOpc = 4, bar;
  let categoriaActual = null, ultimaCategoria = null;

  /* ===== Refs ===== */
  const juegoEl     = document.getElementById('juego');
  const progresoEl  = document.getElementById('progreso');
  const aciertosHUD = document.getElementById('aciertos');
  const btnComenzar = document.getElementById('btnComenzar');

  const selRondas   = document.getElementById('rondas');
  const selOpc      = document.getElementById('opciones');

  // FABs / Modal
  const aboutBtn     = document.getElementById('aboutBtn');
  const aboutModal   = document.getElementById('aboutModal');
  const aboutClose   = document.getElementById('aboutClose');
  const aboutCloseTop= document.getElementById('aboutCloseTop');
  const themeBtn     = document.getElementById('themeToggle');

  /* ===== Utils ===== */
  const barajar = (arr)=>{ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; };
  const sample  = (arr,k)=>{ const c=[...arr]; barajar(c); return c.slice(0, Math.min(k, c.length)); };
  const el = (tag, cls, text)=>{ const n=document.createElement(tag); if(cls) n.className=cls; if(text!=null) n.textContent=String(text); return n; };

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

    if (!opciones.some(o=>o.ok)){
      opciones[0] = {txt:intruso, ok:true, catIntruso:otra};
      barajar(opciones);
    }
    ultimaCategoria = categoriaActual;
    return opciones;
  }

  function resetOpciones(container){
    container.querySelectorAll('button').forEach(b=>{
      b.disabled = false;
      b.className = b.className.replace(/\bmarcada\b/g,'');
      b.removeAttribute('aria-disabled');
    });
    container.removeAttribute('aria-busy');
  }

  function crearAcciones(fb){
    const tpl = document.querySelector('#accionesPlantilla .acciones');
    const acciones = tpl ? tpl.cloneNode(true) : el('div','acciones');
    const btnPistaLocal = acciones.querySelector?.('.btn-pista');
    if (btnPistaLocal){
      btnPistaLocal.hidden = false;
      btnPistaLocal.addEventListener('click', ()=>{
        fb.className = 'feedback';
        fb.textContent = `Pista: categoría del grupo = “${categoriaActual}”.`;
        fb.focus();
      });
    }
    const next = el('button','btn principal','Siguiente');
    next.disabled = true; next.setAttribute('aria-disabled','true');
    acciones.appendChild(next);
    return { acciones, next };
  }

  function renderPregunta(){
    if (ronda >= rondasTotales){ renderFin(); return; }

    const opciones = construirRonda();
    juegoEl.innerHTML = '';

    const tarjeta = el('div','tarjeta');
    tarjeta.setAttribute('role','group'); tarjeta.setAttribute('aria-labelledby','enunciado');

    const pb = el('div','progresoBar'); pb.setAttribute('aria-hidden','true');
    const fill = el('div'); pb.appendChild(fill); bar = fill; actualizar();

    const enunciado = el('p','pregunta'); enunciado.id='enunciado';
    enunciado.textContent = '🧠 ¿Qué palabra no pertenece al grupo?';

    const cont = el('div','opciones');

    const fb = el('p','feedback'); fb.setAttribute('role','status'); fb.setAttribute('aria-live','polite'); fb.setAttribute('aria-atomic','true'); fb.tabIndex = -1;

    const { acciones, next } = crearAcciones(fb);

    opciones.forEach((op, i)=>{
      const b = el('button', op.ok ? 'correcta' : 'incorrecta');
      b.setAttribute('aria-label', `Opción ${i+1}: ${op.txt}`);
      b.appendChild(el('strong', null, `${i+1}.`));
      b.appendChild(document.createTextNode(' ' + op.txt));
      b.addEventListener('click', ()=> elegir(b, op, cont, fb, next));
      cont.appendChild(b);
    });

    tarjeta.appendChild(pb);
    tarjeta.appendChild(enunciado);
    tarjeta.appendChild(cont);
    tarjeta.appendChild(fb);
    tarjeta.appendChild(acciones);
    juegoEl.appendChild(tarjeta);

    resetOpciones(cont);
    requestAnimationFrame(()=>{
      cont.querySelector('button')?.focus({preventScroll:true});
      tarjeta.scrollIntoView({behavior:'smooth', block:'start'});
    });

    const onKey = (e)=>{ const n = Number.parseInt(e.key,10); if(Number.isInteger(n) && n>=1 && n<=5){ cont.children[n-1]?.click(); } };
    document.addEventListener('keydown', onKey, { once:true });
  }

  function elegir(btn, op, cont, fb, next){
    cont.setAttribute('aria-busy','true');
    cont.querySelectorAll('button').forEach(b => b.disabled = true);
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

    next.disabled = false; next.setAttribute('aria-disabled','false');

    const acciones = next.parentElement;
    const nextClon = next.cloneNode(true);
    acciones.replaceChild(nextClon, next);
    nextClon.addEventListener('click', ()=>{
      ronda++; actualizar(); renderPregunta();
    }, { once:true });

    setTimeout(()=> cont.removeAttribute('aria-busy'), 120);
  }

  function renderFin(){
    juegoEl.innerHTML = '';

    const tarjeta = el('div','tarjeta');
    const titulo = el('p','pregunta','🎉 ¡Buen trabajo!');
    tarjeta.appendChild(titulo);

    // Feedback positivo según desempeño
    const ratio = aciertos / rondasTotales;
    let msj;
    if (ratio >= 0.85){
      msj = `¡Excelente! ${aciertos} de ${rondasTotales}. Tenés muy buena precisión.`;
    } else if (ratio >= 0.6){
      msj = `¡Bien! ${aciertos} de ${rondasTotales}. Si querés, subí la dificultad.`;
    } else if (ratio >= 0.35){
      msj = `¡Buen intento! ${aciertos} de ${rondasTotales}. Probá con menos opciones y andá subiendo.`;
    } else {
      msj = `¡Muy bien por practicar! ${aciertos} de ${rondasTotales}. Empezá con menos opciones y a tu ritmo.`;
    }

    tarjeta.appendChild(el('p', null, msj));
    tarjeta.appendChild(el('p', null, 'Podés volver a jugar cambiando las opciones del juego.'));

    // CTAs finales
    const ctas = el('div','acciones');
    const btnRejugar = el('button','btn principal','Volver a jugar');
    btnRejugar.addEventListener('click', ()=>{
      ronda=0; aciertos=0; ultimaCategoria=null; actualizar(); renderPregunta();
    });

    const aOtros = document.createElement('a');
    aOtros.href = 'https://falltem.org/juegos/#games-cards';
    aOtros.className = 'btn secundario';
    aOtros.textContent = 'Elegir otro juego';
    aOtros.target = '_blank'; aOtros.rel = 'noopener noreferrer';

    ctas.appendChild(btnRejugar);
    ctas.appendChild(aOtros);
    tarjeta.appendChild(ctas);

    juegoEl.appendChild(tarjeta);
    tarjeta.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  /* ===== Inicio ===== */
  function comenzar(){
    rondasTotales = Number(selRondas.value);
    nOpc = Number(selOpc.value);
    ronda = 0; aciertos = 0; ultimaCategoria = null;
    actualizar();
    renderPregunta();
  }

  btnComenzar?.addEventListener('click', comenzar);
  selRondas?.addEventListener('change', ()=>{ /* opcional persistencia */ });
  selOpc?.addEventListener('change', ()=>{ /* opcional persistencia */ });

  actualizar();

  /* ===== Modal ===== */
  function openAbout(){
    if (!aboutModal) return;
    aboutModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    (aboutCloseTop || aboutClose)?.focus();
  }
  function closeAbout(){
    if (!aboutModal) return;
    aboutModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }
  aboutBtn?.addEventListener('click', openAbout);
  aboutClose?.addEventListener('click', closeAbout);
  aboutCloseTop?.addEventListener('click', closeAbout);
  aboutModal?.addEventListener('click', (e)=>{ if(e.target===aboutModal) closeAbout(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeAbout(); });

  /* ===== Tema (LIGHT por defecto con persistencia) ===== */
  function labelFor(mode){ return mode==='dark' ? 'Usar modo claro' : 'Usar modo oscuro'; }
  function applyTheme(mode){
    const m = (mode==='dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', m);
    if (themeBtn){
      themeBtn.textContent = (m==='dark' ? '🌞' : '🌙');
      themeBtn.setAttribute('aria-pressed', String(m==='dark'));
      themeBtn.setAttribute('aria-label', labelFor(m));
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', m==='dark' ? '#0b0b0b' : '#f8fbf4');
  }
  (function initTheme(){
    let mode = 'light';
    try{
      const stored = localStorage.getItem('theme');
      if (stored==='dark' || stored==='light') mode = stored;
    }catch{}
    applyTheme(mode);
  })();
  themeBtn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    try{ localStorage.setItem('theme', next); }catch{}
    applyTheme(next);
  });
});
