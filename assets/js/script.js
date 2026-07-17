/* ===================================================================
   Jade Benefits  |  Shared site scripts
   Hamburger menu, smooth scroll, scroll reveal, back to top, active nav
   =================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile hamburger menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Highlight active nav link (clean URLs) ---------- */
  var here = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  if (here === "") here = "/";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href").replace(/\.html$/, "").replace(/\/+$/, "");
    if (href === "") href = "/";
    if (href === here) a.classList.add("active");
  });

  /* ---------- Smooth scroll for same page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  /* ---------- Scroll reveal animation ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Back to top button ---------- */
  var topBtn = document.querySelector(".to-top");
  if (topBtn) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 520) topBtn.classList.add("show");
        else topBtn.classList.remove("show");
      },
      { passive: true }
    );
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Photo fallback to placeholder ---------- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () {
      var label = img.getAttribute("data-label") || "Your photo here";
      var ph = document.createElement("div");
      ph.className = "img-ph";
      ph.innerHTML = label + "<small>Add this photo in assets/images</small>";
      if (img.parentNode) img.parentNode.replaceChild(ph, img);
    });
  });

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
