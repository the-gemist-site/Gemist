(function () {
  "use strict";

  var GALLERY_COUNT = 5;
  var mode = "gallery";
  var galleryIndex = 0;

  var navLinks = document.querySelectorAll(".nav-link, .brand, .footer-note[data-mode]");
  var images = document.querySelectorAll(".piece-img");
  var captions = document.querySelectorAll(".caption");

  var menuToggle = document.getElementById("menuToggle");
  var dropdownNav = document.getElementById("dropdownNav");
  var heroLine = document.getElementById("heroLine");
  var scrollHint = document.getElementById("scrollHint");

  function closeMenu() {
    dropdownNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    var open = dropdownNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  menuToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener("click", function (e) {
    if (!dropdownNav.classList.contains("is-open")) return;
    if (dropdownNav.contains(e.target) || e.target === menuToggle) return;
    closeMenu();
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  function render() {
    images.forEach(function (img) {
      var match = img.dataset.mode === mode && (mode !== "gallery" || Number(img.dataset.i) === galleryIndex);
      img.classList.toggle("is-active", match);
    });
    captions.forEach(function (cap) {
      var match = cap.dataset.mode === mode && (mode !== "gallery" || Number(cap.dataset.i) === galleryIndex);
      cap.classList.toggle("is-active", match);
    });
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.mode === mode);
    });
    heroLine.classList.toggle("is-active", mode === "gallery");
    var isLast = mode === "gallery" && galleryIndex === GALLERY_COUNT - 1;
    scrollHint.classList.toggle("is-visible", mode === "gallery" && (galleryIndex < GALLERY_COUNT - 1 || isLast));
    scrollHint.classList.toggle("is-reversed", isLast);
  }

  function setMode(next) {
    mode = next;
    if (mode === "gallery") galleryIndex = 0;
    render();
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      setMode(link.dataset.mode);
      closeMenu();
    });
  });

  var wheelLock = false;
  function step(dir) {
    if (mode !== "gallery") return;
    var next = galleryIndex + dir;
    if (next < 0 || next >= GALLERY_COUNT) return;
    galleryIndex = next;
    render();
  }

  scrollHint.addEventListener("click", function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    step(scrollHint.classList.contains("is-reversed") ? -1 : 1);
    setTimeout(function () { wheelLock = false; }, 1400);
  });

  window.addEventListener(
    "wheel",
    function (e) {
      if (mode !== "gallery") return;
      if (wheelLock) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < 12) return;
      e.preventDefault();
      wheelLock = true;
      step(e.deltaY > 0 ? 1 : -1);
      setTimeout(function () { wheelLock = false; }, 1400);
    },
    { passive: false }
  );

  var touchStartY = null;
  window.addEventListener(
    "touchstart",
    function (e) {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    function (e) {
      if (touchStartY === null) return;
      var dy = touchStartY - e.changedTouches[0].clientY;
      touchStartY = null;
      if (Math.abs(dy) < 40) return;
      if (wheelLock) return;
      wheelLock = true;
      step(dy > 0 ? 1 : -1);
      setTimeout(function () { wheelLock = false; }, 1400);
    },
    { passive: true }
  );

  window.addEventListener("keydown", function (e) {
    if (mode !== "gallery") return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowLeft") return;
    if (wheelLock) return;
    wheelLock = true;
    step(e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1);
    setTimeout(function () { wheelLock = false; }, 1400);
  });

  render();
})();
