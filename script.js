(() => {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector(".site-header");
  const themeToggle = document.getElementById("themeToggle");
  const revealEls = document.querySelectorAll(".project-card, .stat, .skill-block, .edu-item");

  const toggleNav = () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", toggleNav);

  themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next === "dark" ? "dark" : "";
    localStorage.setItem("theme", next === "dark" ? "dark" : "light");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("open")) toggleNav();
    });
  });

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
})();