/* ======================================================
   FALLTEM — Juego del Intruso
   Lógica original + FIX botones visibles desde el inicio
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
      pista: "Tres son frutas; uno es transporte."
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
      pista: "Tres son animales; silla es un objeto."
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

  /* ======================================================
     Render de la ronda — FIX: botones visibles desde inicio
  ====================================================== */

  function renderRonda({ opciones, intruso, pista }) {
    const card = document.createElement("div");
    card.className = "tarjeta";

    const pregunta = document.createElement("p");
    pregunta.className = "pregunta";
    pregunta.textContent = "🧠 ¿Qué palabra no pertenece al grupo?";

    const lista = document.createElement("div");
    lista.className = "opciones";

    let respondido = false;

    opciones.forEach((txt, i) => {
      const b = document.createElement("button");

      const num = document.createElement("strong");
      num.textContent = i + 1;

      b.appendChild(num);
      b.appendChild(document.createTextNode(" " + txt));

      b.addEventListener("click", () => {
        if (respondido) return;

        respondido = true;
        marcar(b, i === intruso, intruso, lista);
        btnSiguiente.disabled = false;
      });

      lista.appendChild(b);
    });

    /* === Botones de acción SIEMPRE visibles === */

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const btnPista = document.createElement("button");
    btnPista.className = "btn info";
    btnPista.textContent = "Mostrar pista";

    const btnSiguiente = document.createElement("button");
    btnSiguiente.className = "btn principal";
    btnSiguiente.textContent = "Siguiente";
    btnSiguiente.disabled = true;

    btnPista.addEventListener("click", () => {
      if (!card.querySelector(".pista")) {
        const p = document.createElement("div");
        p.className = "pista";
        p.textContent = pista;
        card.insertBefore(p, acciones);
      }
      btnPista.disabled = true;
    });

    btnSiguiente.addEventListener("click", siguienteRonda);

    acciones.append(btnPista, btnSiguiente);

    /* Render final */
    card.appendChild(pregunta);
    card.appendChild(lista);
    card.appendChild(acciones);

    juegoEl.innerHTML = "";
    juegoEl.appendChild(card);
  }

  /* ===== Selección correcta / incorrecta ===== */
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

  /* ===== Pantalla final ===== */
  function mostrarFinal() {
    const card = document.createElement("div");
    card.className = "tarjeta";

    card.innerHTML = `
      <p class="pregunta">🎉 ¡Buen trabajo!</p>
      <p>Tu resultado: ${correctas} de ${totalRondas}.</p>
    `;

    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const btnReint = document.createElement("button");
    btnReint.className = "btn principal";
    btnReint.textContent = "Volver a jugar";
    btnReint.onclick = iniciar;

    const btnOtros = document.createElement("a");
    btnOtros.className = "btn secundario";
    btnOtros.href = "https://falltem.org/juegos/";
    btnOtros.textContent = "Elegir otro juego";

    acciones.append(btnReint, btnOtros);
    card.appendChild(acciones);

    juegoEl.innerHTML = "";
    juegoEl.appendChild(card);

    progresoEl.textContent = `${totalRondas}/${totalRondas}`;
  }

});
