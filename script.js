(function () {
  "use strict";

  var STEP_COUNTS = { gallery: 5, pieces: 3 };
  var mode = "landing";
  var galleryIndex = 0;

  var navLinks = document.querySelectorAll(".nav-link, .brand, .landing-enter, .landing-mark-link");
  var images = document.querySelectorAll(".piece-img");
  var captions = document.querySelectorAll(".caption");

  var downBtns = document.querySelectorAll('[data-role="down"]');
  var upBtns = document.querySelectorAll('[data-role="up"]');

  // ---------------------------------------------------------
  // Landing — gem hotspots. Desktop hovers a dot to reveal its
  // story; touch devices tap to toggle it instead.
  // ---------------------------------------------------------
  var gemHotspots = document.querySelectorAll(".gem-hotspot");
  var landingTooltip = document.getElementById("landingTooltip");
  var landingTooltipTitle = document.getElementById("landingTooltipTitle");
  var landingTooltipMeta = document.getElementById("landingTooltipMeta");
  var landingTooltipLine = document.getElementById("landingTooltipLine");
  var landingSpotlight = document.getElementById("landingSpotlight");
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
    landingTooltipMeta.textContent = btn.dataset.meta;
    landingTooltipLine.textContent = btn.dataset.text;
    landingTooltip.classList.add("is-visible");
    positionTooltip(btn);
    if (landingSpotlight) {
      landingSpotlight.style.setProperty("--spot-x", btn.style.left);
      landingSpotlight.style.setProperty("--spot-y", btn.style.top);
      landingSpotlight.classList.add("is-visible");
    }
    gemHotspots.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
  }

  function resetGemInfo() {
    if (landingSpotlight) landingSpotlight.classList.remove("is-visible");
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

  // Clicking anywhere else on the page closes an active stone.
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".gem-hotspot")) return;
    resetGemInfo();
  });

  window.addEventListener("resize", function () {
    var active = document.querySelector(".gem-hotspot.is-active");
    if (active) positionTooltip(active);
  });

  // Each arrival on the landing page opens one stone by itself, so a
  // visitor sees straight away that the stones can be explored. It's
  // a different stone from the last visit's whenever possible.
  var LAST_STONE_KEY = "gm-last-stone";
  var introStoneTimer = null;

  function showIntroStone() {
    if (!gemHotspots.length) return;
    var last = null;
    try { last = localStorage.getItem(LAST_STONE_KEY); } catch (err) {}
    var pool = Array.prototype.filter.call(gemHotspots, function (b) {
      return b.dataset.stone !== last;
    });
    if (!pool.length) pool = Array.prototype.slice.call(gemHotspots);
    var pick = pool[Math.floor(Math.random() * pool.length)];
    try { localStorage.setItem(LAST_STONE_KEY, pick.dataset.stone); } catch (err) {}
    clearTimeout(introStoneTimer);
    // Waits for the landing fade-in to settle so the text lands in place.
    introStoneTimer = setTimeout(function () {
      var busy = document.querySelector(".gem-hotspot.is-active") ||
        (landingContact && landingContact.classList.contains("is-open"));
      if (mode === "landing" && !busy) showGem(pick);
    }, 1100);
  }

  // ---------------------------------------------------------
  // Landing — enquiries overlay. Covers the photo in place
  // rather than navigating to the main site's Contact page, so
  // the splash keeps its own identity until dismissed.
  // ---------------------------------------------------------
  var landingContact = document.getElementById("landingContact");
  var landingEnquiriesToggle = document.getElementById("landingEnquiriesToggle");
  var landingContactClose = document.getElementById("landingContactClose");

  function closeLandingContact() {
    if (landingContact) landingContact.classList.remove("is-open");
  }

  if (landingEnquiriesToggle) {
    landingEnquiriesToggle.addEventListener("click", function (e) {
      e.preventDefault();
      landingContact.classList.add("is-open");
    });
  }
  if (landingContactClose) {
    landingContactClose.addEventListener("click", function (e) {
      e.preventDefault();
      closeLandingContact();
    });
  }
  if (landingContact) {
    landingContact.addEventListener("click", function (e) {
      if (e.target === landingContact) closeLandingContact();
    });
  }

  // ---------------------------------------------------------
  // Landing — light / dark background, remembered per visitor.
  // ---------------------------------------------------------
  var landingPanel = document.querySelector(".landing-panel");
  var landingThemeToggle = document.getElementById("landingThemeToggle");
  var THEME_KEY = "gm-landing-theme";

  function applyLandingTheme(theme) {
    var dark = theme === "dark";
    landingPanel.classList.toggle("is-dark", dark);
    landingThemeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    landingThemeToggle.setAttribute("aria-label", dark ? "Switch to light background" : "Switch to dark background");
  }

  if (landingPanel && landingThemeToggle) {
    var savedTheme = null;
    try { savedTheme = localStorage.getItem(THEME_KEY); } catch (err) {}
    applyLandingTheme(savedTheme);
    landingThemeToggle.addEventListener("click", function () {
      var next = landingPanel.classList.contains("is-dark") ? "light" : "dark";
      applyLandingTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (err) {}
    });
  }

  // ---------------------------------------------------------
  // Gallery zoom — magnifies the active photo inside its own frame
  // and lets the visitor drag it around; the page never scrolls.
  // The photos are letterboxed (object-fit: contain), so the zoom
  // button and the zoomed view are both kept to the photo's own
  // visible edges rather than the wider frame around it.
  // ---------------------------------------------------------
  var frame = document.querySelector(".frame");
  var zoomTrigger = document.getElementById("zoomTrigger");
  var ZOOM_SCALE = 2.5;
  var zoomed = false;
  var zoomImg = null;
  var zoomPan = { x: 0, y: 0 };
  var panStart = null;
  var zoomAnimTimer = null;

  function activeFrameImg() {
    return frame.querySelector(".piece-img.is-active");
  }

  function contentBox(img) {
    var W = frame.clientWidth;
    var H = frame.clientHeight;
    var k = Math.min(W / img.naturalWidth, H / img.naturalHeight);
    var cw = img.naturalWidth * k;
    var ch = img.naturalHeight * k;
    return { W: W, H: H, cw: cw, ch: ch, L: (W - cw) / 2, T: (H - ch) / 2 };
  }

  var colRight = document.querySelector(".col-right");

  // Keeps the zoom button and the caption tied to the photo's own
  // visible edges rather than to the (wider) frame and column.
  function updatePhotoLayout() {
    var img = activeFrameImg();
    if (!img || !img.naturalWidth) return;
    var b = contentBox(img);
    frame.style.setProperty("--img-inset-x", b.L + "px");
    frame.style.setProperty("--img-inset-y", b.T + "px");

    var cap = colRight.querySelector(".caption.is-active");
    if (!cap) return;
    var photoRight = frame.getBoundingClientRect().left + b.L + b.cw;
    var gap = Math.min(56, Math.max(32, window.innerWidth * 0.033));
    var shift = Math.min(0, photoRight + gap - colRight.getBoundingClientRect().left);
    cap.style.setProperty("--caption-shift", shift + "px");
  }

  // Clip-path is in the image's own (untransformed) coordinates, so the
  // photo's visible rectangle is mapped back through the current
  // translate + scale to find the inset that keeps it exactly in place.
  function applyZoom() {
    if (!zoomImg || !zoomImg.naturalWidth) return;
    var b = contentBox(zoomImg);
    var s = zoomed ? ZOOM_SCALE : 1;
    var tx = zoomed ? zoomPan.x : 0;
    var ty = zoomed ? zoomPan.y : 0;
    var cx = b.W / 2;
    var cy = b.H / 2;
    var left = cx + (b.L - cx - tx) / s;
    var right = b.W - (cx + (b.W - b.L - cx - tx) / s);
    var top = cy + (b.T - cy - ty) / s;
    var bottom = b.H - (cy + (b.H - b.T - cy - ty) / s);
    zoomImg.style.clipPath = "inset(" + top + "px " + right + "px " + bottom + "px " + left + "px)";
    frame.style.setProperty("--zoom-x", tx + "px");
    frame.style.setProperty("--zoom-y", ty + "px");
  }

  function clampPan(x, y) {
    var b = contentBox(zoomImg);
    var maxX = b.cw * (ZOOM_SCALE - 1) / 2;
    var maxY = b.ch * (ZOOM_SCALE - 1) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y))
    };
  }

  function setZoomAria(on) {
    zoomTrigger.setAttribute("aria-pressed", on ? "true" : "false");
    zoomTrigger.setAttribute("aria-label", on ? "Zoom out" : "Zoom in on the photo");
  }

  function setZoom(on) {
    var img = activeFrameImg();
    if (!img) return;
    clearTimeout(zoomAnimTimer);
    zoomImg = img;
    zoomed = on;
    zoomPan = { x: 0, y: 0 };
    panStart = null;
    frame.classList.remove("is-panning");
    frame.classList.add("is-zoom-anim");
    frame.classList.toggle("is-zoomed", on);
    applyZoom();
    setZoomAria(on);
    zoomAnimTimer = setTimeout(function () {
      frame.classList.remove("is-zoom-anim");
      if (!zoomed && zoomImg) zoomImg.style.clipPath = "";
    }, 500);
  }

  // Leaving a zoomed photo (next piece, another page) snaps it back
  // without animating, so it can't swell past the frame while it fades.
  function dropZoomInstantly() {
    if (!zoomed) return;
    clearTimeout(zoomAnimTimer);
    var img = zoomImg;
    img.style.transition = "none";
    frame.classList.remove("is-zoomed", "is-zoom-anim", "is-panning");
    img.style.clipPath = "";
    void img.offsetWidth;
    img.style.transition = "";
    zoomed = false;
    zoomImg = null;
    panStart = null;
    setZoomAria(false);
  }

  zoomTrigger.addEventListener("click", function (e) {
    e.preventDefault();
    setZoom(!zoomed);
  });

  frame.addEventListener("pointerdown", function (e) {
    if (!zoomed || e.target !== zoomImg) return;
    e.preventDefault();
    frame.setPointerCapture(e.pointerId);
    frame.classList.add("is-panning");
    panStart = { px: e.clientX, py: e.clientY, x: zoomPan.x, y: zoomPan.y };
  });
  frame.addEventListener("pointermove", function (e) {
    if (!panStart) return;
    zoomPan = clampPan(panStart.x + e.clientX - panStart.px, panStart.y + e.clientY - panStart.py);
    applyZoom();
  });
  function endPan() {
    panStart = null;
    frame.classList.remove("is-panning");
  }
  frame.addEventListener("pointerup", endPan);
  frame.addEventListener("pointercancel", endPan);

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && zoomed) setZoom(false);
  });

  window.addEventListener("resize", function () {
    updatePhotoLayout();
    if (zoomed) {
      zoomPan = clampPan(zoomPan.x, zoomPan.y);
      applyZoom();
    }
  });

  images.forEach(function (img) {
    img.addEventListener("load", function () {
      if (img.classList.contains("is-active")) updatePhotoLayout();
    });
  });

  function render() {
    dropZoomInstantly();
    images.forEach(function (img) {
      var match = img.dataset.mode === mode && (!STEP_COUNTS[mode] || Number(img.dataset.i) === galleryIndex);
      img.classList.toggle("is-active", match);
    });
    captions.forEach(function (cap) {
      var match = cap.dataset.mode === mode && (!STEP_COUNTS[mode] || Number(cap.dataset.i) === galleryIndex);
      cap.classList.toggle("is-active", match);
    });
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.mode === mode);
    });

    var count = STEP_COUNTS[mode] || 0;
    var downVisible = count > 0 && galleryIndex < count - 1;
    var upVisible = count > 0 && galleryIndex > 0;
    downBtns.forEach(function (b) { b.classList.toggle("is-visible", downVisible); });
    upBtns.forEach(function (b) { b.classList.toggle("is-visible", upVisible); });
    zoomTrigger.classList.toggle("is-visible", mode === "pieces");
    updatePhotoLayout();
  }

  function setMode(next) {
    if (next !== "landing") {
      resetGemInfo();
      closeLandingContact();
    }
    var arrivingOnLanding = next === "landing" && mode !== "landing";
    mode = next;
    if (arrivingOnLanding) showIntroStone();
    if (STEP_COUNTS[mode]) galleryIndex = 0;
    render();
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      setMode(link.dataset.mode);
    });
  });

  var wheelLock = false;

  function step(dir) {
    var count = STEP_COUNTS[mode];
    if (!count) return;
    var next = galleryIndex + dir;
    if (next < 0 || next >= count) return;
    galleryIndex = next;
    render();
  }

  function stepLocked(dir) {
    if (wheelLock) return;
    wheelLock = true;
    step(dir);
    setTimeout(function () { wheelLock = false; }, 800);
  }

  downBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) { e.preventDefault(); stepLocked(1); });
  });
  upBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) { e.preventDefault(); stepLocked(-1); });
  });

  window.addEventListener(
    "wheel",
    function (e) {
      if (!STEP_COUNTS[mode] || zoomed) return;
      if (wheelLock) { e.preventDefault(); return; }
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 12) return;
      e.preventDefault();
      stepLocked(delta > 0 ? 1 : -1);
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
      if (!STEP_COUNTS[mode] || zoomed) return;
      var delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(delta) < 40) return;
      stepLocked(delta > 0 ? 1 : -1);
    },
    { passive: true }
  );

  window.addEventListener("keydown", function (e) {
    if (!STEP_COUNTS[mode]) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") stepLocked(1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") stepLocked(-1);
  });

  render();
  if (mode === "landing") showIntroStone();
})();
