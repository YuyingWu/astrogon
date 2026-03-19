/**
 * Decap CMS – Mobile sidebar drawer toggle
 *
 * Minimal JS: creates a hamburger button and overlay for the sidebar
 * on mobile viewports. All layout/styling is in mobile.css.
 * No DOM traversal or inline style injection.
 */
(function () {
  "use strict";

  var MOBILE_BREAKPOINT = 768;
  var toggle = null;
  var overlay = null;
  var isOpen = false;

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  /* ── Create toggle button (hamburger / close) ── */
  function ensureToggle() {
    if (toggle && toggle.isConnected) return toggle;

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-drawer-toggle";
    toggle.setAttribute("aria-label", "打开菜单");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "☰";

    toggle.addEventListener("click", function () {
      setOpen(!isOpen);
    });

    document.body.appendChild(toggle);
    return toggle;
  }

  /* ── Create overlay ── */
  function ensureOverlay() {
    if (overlay && overlay.isConnected) return overlay;

    overlay = document.createElement("div");
    overlay.className = "mobile-drawer-overlay";
    overlay.setAttribute("role", "presentation");

    overlay.addEventListener("click", function () {
      setOpen(false);
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  /* ── Open / Close ── */
  function setOpen(next) {
    isOpen = Boolean(next);
    document.body.classList.toggle("mobile-drawer-open", isOpen);

    if (toggle) {
      toggle.innerHTML = isOpen ? "✕" : "☰";
      toggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
      toggle.setAttribute("aria-expanded", String(isOpen));
    }
  }

  /* ── Show / hide controls based on viewport ── */
  function update() {
    if (isMobile()) {
      ensureToggle();
      ensureOverlay();
    } else {
      // Close drawer when resizing to desktop
      if (isOpen) setOpen(false);
    }
  }

  /* ── Keyboard: Escape closes drawer ── */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) {
      setOpen(false);
    }
  });

  /* ── Close drawer when tapping a nav link inside sidebar ── */
  document.addEventListener("click", function (e) {
    if (!isOpen) return;
    var target = e.target;
    if (!(target instanceof Element)) return;

    // Find the sidebar element
    var sidebar = document.querySelector('[class*="SidebarContainer"]');
    if (!sidebar || !sidebar.contains(target)) return;

    // If user clicked a link or button inside sidebar, close after navigation
    if (target.closest("a, button, [role='button'], [role='menuitem']")) {
      setTimeout(function () {
        setOpen(false);
      }, 100);
    }
  });

  /* ── Init ── */
  window.addEventListener("resize", update, { passive: true });
  window.addEventListener("orientationchange", update, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }

  // Also re-check after Decap finishes rendering (it's async)
  window.addEventListener("load", function () {
    setTimeout(update, 500);
  });
})();
