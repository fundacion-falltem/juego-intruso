/* ======================================================
   FALLTEM — Juego del Intruso
   Lógica original + UI limpia
====================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ====== Estado ====== */
  let rondaActual = 0;
  let totalRondas = 0;
  let correctas = 0;

  const btnComenzar = document.getElementById("btnComenzar");
  const rondasEl = document.getElementById("rondas");
  const opcionesEl = document.getElementById("opciones");
  const juegoEl = document.getElementById("juego");
  const progresoEl = document.getElementById("progreso");
  const aciertosEl = document.getElementById("aciertos");
  const versionEl = document.getElementById("versionLabel");

  versionEl.textContent = "v2.3.31";

  /* ===== Categorías ===== */
  const categorias = [
    {
      tema: "Frutas",
      opciones: ["manzana", "pera", "banana", "colectivo"],
      intruso: 3,
      pista: "Tres son frutas; una es transporte."
    },
    {
      tema: "Transporte",
      opciones: ["auto", "tren", "avión", "sandía"],
      intruso: 3,
      pista: "Tres son vehículos; sandía es fruta."
    },
    {
      tema: "Colores",
      opciones: ["rojo", "verde", "azul", "arroz"],
      intruso: 3,
      pista: "Tres son colores; arroz no."
    },
    {
      tema: "Ropa",
      opciones: ["remera", "camisa", "zapato", "helado"],
      intruso: 3,
      pista: "Tres son prendas; helado es comida."
    },
    {
      tema: "Animales",
      opciones: ["perro", "gato", "caballo", "silla"],
      intruso: 3,
      pista: "Tres son animales; silla es objeto."
    }
  ];

  /* ===== Modal ===== */
  const aboutBtn = document.getElementById("aboutBtn");
  const aboutModal = document.getElementById("aboutModal");
  const aboutClose = document.getElementById("aboutClose");
  const aboutCloseTop = document.getElementById("aboutCloseTop");

  function abrirModal() {
    aboutModal.setAttribute("aria-hidden", "false");
    aboutBtn.setAttribute("aria-expanded", "true");
  }
  function cerrarModal() {
    aboutModal.setAttribute("aria-hidden", "true");
    aboutBtn.setAttribute("aria-expanded", "false");
  }

  aboutBtn?.addEventListener("click", abrirModal);
  aboutClose?.addEventListener("click", cerrarModal);
  aboutCloseTop?.addEventListener("click", cerrarModal);

  aboutModal?.addEventListener("click", e => {
    if (e.target === aboutModal) cerrarModal();
  });

  /* ====== Juego ====== */

  btnComenzar.addEventListener("click", iniciar);

  function iniciar() {
    rondaActual = 0;
    correctas = 0;
    totalRondas = Number(rondasEl.value);
    juegoEl.innerHTML = "";
    siguienteRonda();
  }

  function siguienteRonda() {
    if (rondaActual >= totalRondas) {
      return mostrarFinal();
    }

    const data = categorias[Math.floor(Math.random() * categorias.length)];
    renderRonda(data);
    rondaActual++;
    actualizarHUD();
  }

  function actualizarHUD() {
    progresoEl.textContent = `${rondaActual}/${totalRondas}`;
    aciertosEl.textContent = correctas;
  }

  function renderRonda({ tema, opciones, intruso, pista }) {
    const card = document.createElement("div");
    card.className = "tarjeta";

    const pregunta = document.createElement("p");
    pregunta.className = "pregunta";
    pregunta.textContent = "🧠 ¿Qué palabra no pertenece al grupo?";

    const lista = document.createElement("div");
    lista.className = "opciones";

    opciones.forEach((txt, i) => {
      const b = document.createElement("button");

      // Número + texto (DOM real compatible con CSS actual)
      const num = document.createElement("strong");
      num.textContent = i + 1;

      b.appendChild(num);
      b.appendChild(document.createTextNode(" " + txt));

      b.addEventListener("click", () => {
        marcar(b, i === intruso, intruso, lista);
        mostrarAcciones(card, pista);
      });

      lista.appendChild(b);
    });

    card.appendChild(pregunta);
    card.appendChild(lista);
    juegoEl.innerHTML = "";
    juegoEl.appendChild(card);
  }

  function marcar(boton, esCorrecta, idxIntruso, lista) {
    [...lista.children].forEach((btn, idx) => {
      if (idx === idxIntruso) {
        btn.classList.add("correcta", "marcada");
      } 
      if (btn === boton && !esCorrecta) {
        btn.classList.add("incorrecta", "marcada");
      }
      btn.disabled = true;
    });

    if (esCorrecta) correctas++;
  }

  function mostrarAcciones(card, pista) {
    if (card.querySelector(".acciones")) return;

    const box = document.createElement("div");
    box.className = "acciones";

    const btnPista = document.createElement("button");
    btnPista.className = "btn info";
    btnPista.textContent = "Mostrar pista";

    const btnSig = document.createElement("button");
    btnSig.className = "btn principal";
    btnSig.textContent = "Siguiente";

    btnPista.addEventListener("click", () => {
      if (!card.querySelector(".pista")) {
        const p = document.createElement("div");
        p.className = "pista";
        p.textContent = pista;
        card.insertBefore(p, box);
      }
      btnPista.disabled = true;
    });

    btnSig.addEventListener("click", siguienteRonda);

    box.append(btnPista, btnSig);
    card.appendChild(box);
  }

  function mostrarFinal() {
    const card = document.createElement("div");
    card.className = "tarjeta";

    card.innerHTML = `
      <p class="pregunta">🎉 ¡Felicitaciones!</p>
      <p>Tu resultado: ${correctas} de ${totalRondas}.</p>
    `;

    const box = document.createElement("div");
    box.className = "acciones";

    const btnReint = document.createElement("button");
    btnReint.className = "btn principal";
    btnReint.textContent = "Volver a jugar";
    btnReint.onclick = iniciar;

    const btnOtros = document.createElement("a");
    btnOtros.className = "btn secundario";
    btnOtros.href = "https://fundacion-falltem.github.io/juegos/";
    btnOtros.textContent = "Elegir otro juego";

    box.append(btnReint, btnOtros);
    card.append(box);

    juegoEl.innerHTML = "";
    juegoEl.appendChild(card);

    progresoEl.textContent = `${totalRondas}/${totalRondas}`;
  }




   /* JS PARA TABS (NO ROMPE NADA — INDEPENDIENTE DEL JUEGO) */

    const tabHow = document.getElementById("aboutTabHow");
    const tabWhy = document.getElementById("aboutTabWhy");
    const panelHow = document.getElementById("aboutPanelHow");
    const panelWhy = document.getElementById("aboutPanelWhy");

    function selectTab(showHow) {
      if (showHow) {
        tabHow.setAttribute("aria-selected", "true");
        tabWhy.setAttribute("aria-selected", "false");
        tabWhy.setAttribute("tabindex", "-1");

        panelHow.hidden = false;
        panelWhy.hidden = true;
      } else {
        tabHow.setAttribute("aria-selected", "false");
        tabWhy.setAttribute("aria-selected", "true");
        tabWhy.removeAttribute("tabindex");

        panelHow.hidden = true;
        panelWhy.hidden = false;
      }
    }

    tabHow?.addEventListener("click", () => selectTab(true));
    tabWhy?.addEventListener("click", () => selectTab(false));

});