(function () {
  "use strict";

  var GALLERY_COUNT = 5;
  var STEPPABLE_MODES = { gallery: true, pieces: true };
  var mode = "gallery";
  var galleryIndex = 0;

  var navLinks = document.querySelectorAll(".nav-link, .brand, .footer-note[data-mode]");
  var images = document.querySelectorAll(".piece-img");
  var captions = document.querySelectorAll(".caption");

  var menuToggle = document.getElementById("menuToggle");
  var dropdownNav = document.getElementById("dropdownNav");
  var heroLine = document.getElementById("heroLine");
  var scrollHint = document.getElementById("scrollHint");
  var scrollHintUp = document.getElementById("scrollHintUp");
  var hintLeft = document.getElementById("hintLeft");
  var hintRight = document.getElementById("hintRight");
  var frameDots = document.getElementById("frameDots");

  // Build piece boundary metadata from the "pieces" mode images in the DOM.
  // Each piece's images are listed contiguously and share a data-piece index.
  var piecesImgs = document.querySelectorAll('.piece-img[data-mode="pieces"]');
  var PIECES_TOTAL = piecesImgs.length;
  var piecesPieceOf = [];
  var pieceStart = [];
  piecesImgs.forEach(function (img) {
    var i = Number(img.dataset.i);
    var p = Number(img.dataset.piece);
    piecesPieceOf[i] = p;
    if (pieceStart[p] === undefined) pieceStart[p] = i;
  });
  var PIECE_COUNT = pieceStart.length;

  function pieceImageCount(p) {
    var end = p + 1 < PIECE_COUNT ? pieceStart[p + 1] : PIECES_TOTAL;
    return end - pieceStart[p];
  }

  var dotEls = [];
  function renderDots(p, detailIndex) {
    var count = pieceImageCount(p);
    if (count !== dotEls.length) {
      frameDots.innerHTML = "";
      dotEls = [];
      for (var d = 0; d < count; d++) {
        var dot = document.createElement("span");
        dot.className = "dot";
        frameDots.appendChild(dot);
        dotEls.push(dot);
      }
    }
    dotEls.forEach(function (dot, d) {
      dot.classList.toggle("is-active", d === detailIndex);
    });
    frameDots.classList.toggle("is-visible", count > 1);
  }

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
      var match = img.dataset.mode === mode && (!STEPPABLE_MODES[mode] || Number(img.dataset.i) === galleryIndex);
      img.classList.toggle("is-active", match);
    });
    captions.forEach(function (cap) {
      var match = cap.dataset.mode === mode && (!STEPPABLE_MODES[mode] || Number(cap.dataset.i) === galleryIndex);
      cap.classList.toggle("is-active", match);
    });
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.mode === mode);
    });
    heroLine.classList.toggle("is-active", mode === "gallery");

    var downVisible = false;
    var upVisible = false;
    if (mode === "gallery") {
      downVisible = galleryIndex < GALLERY_COUNT - 1;
      upVisible = galleryIndex > 0;
    } else if (mode === "pieces") {
      var curPiece = piecesPieceOf[galleryIndex];
      downVisible = curPiece < PIECE_COUNT - 1;
      upVisible = curPiece > 0;
    }
    scrollHint.classList.toggle("is-visible", downVisible);
    scrollHintUp.classList.toggle("is-visible", upVisible);

    var leftVisible = false;
    var rightVisible = false;
    if (mode === "pieces") {
      var piece = piecesPieceOf[galleryIndex];
      var start = pieceStart[piece];
      var detailIndex = galleryIndex - start;
      var count = pieceImageCount(piece);
      leftVisible = detailIndex > 0;
      rightVisible = detailIndex < count - 1;
      renderDots(piece, detailIndex);
    } else {
      frameDots.classList.remove("is-visible");
    }
    hintLeft.classList.toggle("is-visible", leftVisible);
    hintRight.classList.toggle("is-visible", rightVisible);
  }

  function setMode(next) {
    mode = next;
    if (STEPPABLE_MODES[mode]) galleryIndex = 0;
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

  // axis: "v" moves between gallery steps / pieces; "h" moves between a
  // piece's own detail images without leaving that piece.
  function step(axis, dir) {
    if (mode === "gallery") {
      var next = galleryIndex + dir;
      if (next < 0 || next >= GALLERY_COUNT) return;
      galleryIndex = next;
      render();
      return;
    }
    if (mode === "pieces") {
      var curPiece = piecesPieceOf[galleryIndex];
      if (axis === "h") {
        var nextIndex = galleryIndex + dir;
        if (nextIndex < 0 || nextIndex >= PIECES_TOTAL) return;
        if (piecesPieceOf[nextIndex] !== curPiece) return;
        galleryIndex = nextIndex;
      } else {
        var targetPiece = curPiece + dir;
        if (targetPiece < 0 || targetPiece >= PIECE_COUNT) return;
        galleryIndex = pieceStart[targetPiece];
      }
      render();
    }
  }

  scrollHint.addEventListener("click", function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    step("v", 1);
    setTimeout(function () { wheelLock = false; }, 800);
  });

  scrollHintUp.addEventListener("click", function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    step("v", -1);
    setTimeout(function () { wheelLock = false; }, 800);
  });

  hintRight.addEventListener("click", function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    step("h", 1);
    setTimeout(function () { wheelLock = false; }, 800);
  });

  hintLeft.addEventListener("click", function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    step("h", -1);
    setTimeout(function () { wheelLock = false; }, 800);
  });

  window.addEventListener(
    "wheel",
    function (e) {
      if (!STEPPABLE_MODES[mode]) return;
      if (wheelLock) { e.preventDefault(); return; }
      var horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      var delta = horizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 12) return;
      e.preventDefault();
      wheelLock = true;
      step(horizontal ? "h" : "v", delta > 0 ? 1 : -1);
      setTimeout(function () { wheelLock = false; }, 800);
    },
    { passive: false }
  );

  var touchStartX = null;
  var touchStartY = null;
  window.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    function (e) {
      if (touchStartX === null || touchStartY === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = touchStartY - e.changedTouches[0].clientY;
      touchStartX = null;
      touchStartY = null;
      if (!STEPPABLE_MODES[mode]) return;
      if (wheelLock) return;
      var horizontal = Math.abs(dx) > Math.abs(dy);
      var delta = horizontal ? dx : dy;
      if (Math.abs(delta) < 40) return;
      wheelLock = true;
      step(horizontal ? "h" : "v", horizontal ? (delta > 0 ? 1 : -1) : (delta > 0 ? 1 : -1));
      setTimeout(function () { wheelLock = false; }, 800);
    },
    { passive: true }
  );

  window.addEventListener("keydown", function (e) {
    if (!STEPPABLE_MODES[mode]) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowLeft") return;
    if (wheelLock) return;
    wheelLock = true;
    var horizontal = e.key === "ArrowLeft" || e.key === "ArrowRight";
    var dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    step(horizontal ? "h" : "v", dir);
    setTimeout(function () { wheelLock = false; }, 800);
  });

  render();
})();
