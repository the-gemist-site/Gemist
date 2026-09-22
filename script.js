(function () {
  "use strict";

  var GALLERY_COUNT = 5;
  var STEPPABLE_MODES = { gallery: true, pieces: true };
  var mode = "landing";
  var galleryIndex = 0;

  var navLinks = document.querySelectorAll(".nav-link, .brand, .footer-note[data-mode], .landing-enter");
  var images = document.querySelectorAll(".piece-img");
  var captions = document.querySelectorAll(".caption");

  var downBtns = document.querySelectorAll('[data-role="down"]');
  var upBtns = document.querySelectorAll('[data-role="up"]');
  var leftBtns = document.querySelectorAll('[data-role="left"]');
  var rightBtns = document.querySelectorAll('[data-role="right"]');
  var dotWraps = document.querySelectorAll('[data-role="dots"]');

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

  var dotEls = []; // one array of <span> dots per dots-wrap element
  function renderDots(p, detailIndex) {
    var count = pieceImageCount(p);
    dotWraps.forEach(function (wrap, wi) {
      if (!dotEls[wi] || dotEls[wi].length !== count) {
        wrap.innerHTML = "";
        var els = [];
        for (var d = 0; d < count; d++) {
          var dot = document.createElement("span");
          dot.className = "dot";
          wrap.appendChild(dot);
          els.push(dot);
        }
        dotEls[wi] = els;
      }
      dotEls[wi].forEach(function (dot, d) {
        dot.classList.toggle("is-active", d === detailIndex);
      });
      wrap.classList.toggle("is-visible", count > 1);
    });
  }

  // ---------------------------------------------------------
  // Landing — gem hotspots. Desktop hovers a dot to reveal its
  // story; touch devices tap to toggle it instead.
  // ---------------------------------------------------------
  var gemHotspots = document.querySelectorAll(".gem-hotspot");
  var landingTooltip = document.getElementById("landingTooltip");
  var landingTooltipTitle = document.getElementById("landingTooltipTitle");
  var landingTooltipLine = document.getElementById("landingTooltipLine");
  var canHoverGems = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function positionTooltip(btn) {
    if (!landingTooltip) return;
    var rect = btn.getBoundingClientRect();
    var gap = 14;
    var tw = landingTooltip.offsetWidth;
    var th = landingTooltip.offsetHeight;
    var left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tw - 16));
    var top = rect.top - th - gap;
    if (top < 16) top = rect.bottom + gap;
    landingTooltip.style.left = left + "px";
    landingTooltip.style.top = top + "px";
  }

  function showGem(btn) {
    if (!landingTooltip) return;
    landingTooltipTitle.textContent = btn.dataset.title;
    landingTooltipLine.textContent = btn.dataset.text;
    landingTooltip.classList.add("is-visible");
    positionTooltip(btn);
    gemHotspots.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
  }

  function resetGemInfo() {
    if (!landingTooltip) return;
    landingTooltip.classList.remove("is-visible");
    gemHotspots.forEach(function (b) { b.classList.remove("is-active"); });
  }

  gemHotspots.forEach(function (btn) {
    if (canHoverGems) {
      btn.addEventListener("mouseenter", function () { showGem(btn); });
      btn.addEventListener("mouseleave", resetGemInfo);
      btn.addEventListener("focus", function () { showGem(btn); });
      btn.addEventListener("blur", resetGemInfo);
    } else {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (btn.classList.contains("is-active")) resetGemInfo();
        else showGem(btn);
      });
    }
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
    downBtns.forEach(function (b) { b.classList.toggle("is-visible", downVisible); });
    upBtns.forEach(function (b) { b.classList.toggle("is-visible", upVisible); });

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
      dotWraps.forEach(function (wrap) { wrap.classList.remove("is-visible"); });
    }
    leftBtns.forEach(function (b) { b.classList.toggle("is-visible", leftVisible); });
    rightBtns.forEach(function (b) { b.classList.toggle("is-visible", rightVisible); });
  }

  function setMode(next) {
    if (next !== "landing") resetGemInfo();
    mode = next;
    if (STEPPABLE_MODES[mode]) galleryIndex = 0;
    render();
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      setMode(link.dataset.mode);
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

  function bindStep(btns, axis, dir) {
    btns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (wheelLock) return;
        wheelLock = true;
        step(axis, dir);
        setTimeout(function () { wheelLock = false; }, 800);
      });
    });
  }
  bindStep(downBtns, "v", 1);
  bindStep(upBtns, "v", -1);
  bindStep(rightBtns, "h", 1);
  bindStep(leftBtns, "h", -1);

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
