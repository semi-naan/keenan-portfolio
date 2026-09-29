(() => {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector(".site-header");
  const themeToggle = document.getElementById("themeToggle");
  const revealEls = document.querySelectorAll(".project-card, .stat, .skill-block, .edu-item");
  const projectsTrack = document.getElementById("projectsTrack");
  const projectsPrev = document.getElementById("projectsPrev");
  const projectsNext = document.getElementById("projectsNext");

  const updateProjectControls = () => {
    projectsPrev.disabled = projectsTrack.scrollLeft <= 1;
    projectsNext.disabled = projectsTrack.scrollLeft + projectsTrack.clientWidth >= projectsTrack.scrollWidth - 1;
  };

  [projectsPrev, projectsNext].forEach((button, index) => {
    button.addEventListener("click", () => {
      const card = projectsTrack.querySelector(".project-card");
      const gap = parseFloat(getComputedStyle(projectsTrack).columnGap);
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      projectsTrack.scrollBy({ left: (card.getBoundingClientRect().width + gap) * (index === 0 ? -1 : 1), behavior });
    });
  });

  projectsTrack.addEventListener("scroll", updateProjectControls);
  window.addEventListener("resize", updateProjectControls);
  updateProjectControls();

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
