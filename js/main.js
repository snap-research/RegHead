/* ============================================================
   RegHead dataset hero — synced expression slider
   ============================================================ */
(function () {
  "use strict";

  const IDENTITIES = [
    { id: "id000", name: "Doberman Dog",     style: "Photorealistic" },
    { id: "id001", name: "Polar Bear",       style: "Photorealistic" },
    { id: "id002", name: "Cormorant",        style: "Photorealistic" },
    { id: "id003", name: "Mole",             style: "Photorealistic" },
    { id: "id004", name: "Pug Dog",          style: "Video Game NPC" },
    { id: "id005", name: "Antelope",         style: "Photorealistic" },
    { id: "id006", name: "Bison",            style: "Plastic Toy" },
    { id: "id007", name: "Owl",              style: "Photorealistic" },
    { id: "id008", name: "Reindeer",         style: "Photorealistic" },
    { id: "id009", name: "Giant Anteater",   style: "Computer Animated Film 3D" },
    { id: "id011", name: "Wombat",           style: "Video Game NPC" },
    { id: "id012", name: "Swan",             style: "Plastic Toy" },
    { id: "id014", name: "Anaconda",         style: "Video Game NPC" },
    { id: "id016", name: "Bald Eagle",       style: "Video Game NPC" },
    { id: "id017", name: "Tuna",             style: "Computer Animated Film 3D" },
    { id: "id018", name: "Chameleon",        style: "Plastic Toy" },
    { id: "id019", name: "Capuchin Monkey",  style: "Computer Animated Film 3D" }
  ];

  // ordered as a smooth morph: mouth closes -> eyes close -> expressions
  const EXPRESSIONS = [
    { key: "open_m_open_e",   label: "Open mouth · open eyes", tick: "Neutral" },
    { key: "halfo_m_o_e",     label: "Half-open mouth",        tick: "½ mouth" },
    { key: "close_m_o_e",     label: "Closed mouth · open eyes", tick: "Closed mouth" },
    { key: "close_m_0_75o_e", label: "Eyes 75% open",          tick: "Eyes ¾" },
    { key: "close_m_halfo_e", label: "Eyes 50% open",          tick: "Eyes ½" },
    { key: "close_m_0_25o_e", label: "Eyes 25% open",          tick: "Eyes ¼" },
    { key: "close_m_close_e", label: "Eyes closed",            tick: "Eyes shut" },
    { key: "close_m_smile",   label: "Closed-mouth smile",     tick: "Smile" },
    { key: "raise_eyebrows",  label: "Raised eyebrows",        tick: "Brows" },
    { key: "frown",           label: "Frown",                  tick: "Frown" }
  ];
  const N = EXPRESSIONS.length;

  const grid     = document.getElementById("heroGrid");
  const slider   = document.getElementById("exprSlider");
  const ticksEl  = document.getElementById("ticks");
  const nameEl   = document.getElementById("exprName");
  const numEl    = document.getElementById("exprNum");
  const playBtn  = document.getElementById("playBtn");
  const playIco  = document.getElementById("playIco");
  if (!grid) return;

  // ---- build identity tiles (all frames stacked, crossfade by opacity) ----
  IDENTITIES.forEach(function (idObj) {
    const tile = document.createElement("div");
    tile.className = "tile";
    EXPRESSIONS.forEach(function (ex, i) {
      const img = new Image();
      img.src = "assets/dataset/" + idObj.id + "/" + ex.key + ".jpg";
      img.alt = idObj.name + " — " + ex.label;
      img.className = "frame" + (i === 0 ? " on" : "");
      img.draggable = false;
      tile.appendChild(img);
    });
    const cap = document.createElement("div");
    cap.className = "tile-cap";
    cap.textContent = idObj.name + " · " + idObj.style;
    tile.appendChild(cap);
    grid.appendChild(tile);
  });
  const tiles = Array.prototype.slice.call(grid.querySelectorAll(".tile"));

  // ---- horizontal filmstrip: arrows + drag-to-scroll ----
  const arrL = document.getElementById("arrL");
  const arrR = document.getElementById("arrR");
  function scrollByTiles(dir) {
    const tw = tiles.length ? tiles[0].getBoundingClientRect().width + 16 : 200;
    grid.scrollBy({ left: dir * tw * 3, behavior: "smooth" });
  }
  function updateArrows() {
    const max = grid.scrollWidth - grid.clientWidth;
    const scrollable = max > 4;
    if (arrL) arrL.classList.toggle("hidden", !scrollable || grid.scrollLeft <= 2);
    if (arrR) arrR.classList.toggle("hidden", !scrollable || grid.scrollLeft >= max - 2);
  }
  if (arrL) arrL.addEventListener("click", function () { scrollByTiles(-1); });
  if (arrR) arrR.addEventListener("click", function () { scrollByTiles(1); });
  grid.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  window.addEventListener("load", updateArrows);
  requestAnimationFrame(updateArrows);
  setTimeout(updateArrows, 400);

  // click-and-drag to scroll (so a plain mouse works, not just trackpad/arrows)
  let dragging = false, dragStartX = 0, dragStartScroll = 0;
  grid.addEventListener("pointerdown", function (e) {
    dragging = true; dragStartX = e.clientX; dragStartScroll = grid.scrollLeft;
    grid.classList.add("drag");
  });
  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    grid.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
  });
  window.addEventListener("pointerup", function () {
    dragging = false; grid.classList.remove("drag");
  });

  // ---- build slider ticks ----
  EXPRESSIONS.forEach(function (ex, i) {
    const t = document.createElement("div");
    t.className = "tick" + (i === 0 ? " active" : "");
    t.textContent = ex.tick;
    t.addEventListener("click", function () { stop(); setExpr(i); });
    ticksEl.appendChild(t);
  });
  const tickEls = Array.prototype.slice.call(ticksEl.querySelectorAll(".tick"));

  let cur = 0;

  function setExpr(idx) {
    cur = ((idx % N) + N) % N;
    tiles.forEach(function (t) {
      const fr = t.querySelectorAll(".frame");
      for (let i = 0; i < fr.length; i++) fr[i].classList.toggle("on", i === cur);
    });
    slider.value = cur;
    slider.style.setProperty("--fill", (cur / (N - 1) * 100) + "%");
    nameEl.textContent = EXPRESSIONS[cur].label;
    numEl.textContent = String(cur + 1).padStart(2, "0");
    tickEls.forEach(function (t, i) { t.classList.toggle("active", i === cur); });
  }

  // ---- autoplay ----
  let timer = null, playing = false;
  const PLAY_SVG  = '<path d="M4 3l10 5-10 5z"/>';
  const PAUSE_SVG = '<path d="M4 3h3v10H4zM9 3h3v10H9z"/>';

  function play() {
    playing = true;
    playIco.innerHTML = PAUSE_SVG;
    playBtn.querySelector(".pl-txt").textContent = "Pause";
    clearInterval(timer);
    timer = setInterval(function () { setExpr(cur + 1); }, 1150);
  }
  function stop() {
    playing = false;
    playIco.innerHTML = PLAY_SVG;
    playBtn.querySelector(".pl-txt").textContent = "Play";
    clearInterval(timer);
  }
  playBtn.addEventListener("click", function () { playing ? stop() : play(); });

  slider.addEventListener("input", function (e) { stop(); setExpr(parseInt(e.target.value, 10)); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { stop(); setExpr(cur + 1); }
    else if (e.key === "ArrowLeft") { stop(); setExpr(cur - 1); }
  });

  // pause autoplay when the hero scrolls out of view; resume when back
  const hero = document.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    let wasAuto = true;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && wasAuto) play();
        else if (!en.isIntersecting) { wasAuto = playing; clearInterval(timer); }
      });
    }, { threshold: 0.25 }).observe(hero);
  }

  setExpr(0);
  updateArrows();
  play();

  // ---- lazy-load + play result videos only while on screen ----
  const lvids = Array.prototype.slice.call(document.querySelectorAll("video.lazyvid"));
  if (lvids.length) {
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          const v = en.target;
          if (en.isIntersecting) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src;
            const p = v.play(); if (p && p.catch) p.catch(function () {});
          } else {
            v.pause();
          }
        });
      }, { rootMargin: "300px 0px", threshold: 0.15 });
      lvids.forEach(function (v) { vio.observe(v); });
    } else {
      lvids.forEach(function (v) { if (v.dataset.src) v.src = v.dataset.src; });
    }
  }
})();
