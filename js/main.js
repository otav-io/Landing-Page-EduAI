(function () {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".navbar__toggle");
  const collapse = document.querySelector(".navbar__collapse");
  const yearEl = document.getElementById("footer-year");

  function setMenuOpen(isOpen) {
    if (!collapse || !toggle) return;
    collapse.classList.toggle("navbar__collapse--open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  toggle?.addEventListener("click", function () {
    if (!collapse) return;
    const willOpen = !collapse.classList.contains("navbar__collapse--open");
    setMenuOpen(willOpen);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  collapse?.querySelectorAll(".navbar__link").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Desafio extra: sombra da header após scroll */
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!header || ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (window.scrollY > 80) {
        header.classList.add("header--scrolled");
      } else {
        header.classList.remove("header--scrolled");
      }
      ticking = false;
    });
  });
})();
