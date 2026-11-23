(() => {
  const EMAIL = "seminekeenan1@gmail.com";
  const GITHUB_URL = "https://github.com/semi-naan";
  const PANEL_COORDS = {
    about: "01_about",
    projects: "02_projects",
    skills: "03_skills",
    education: "04_education",
    contact: "05_contact",
  };
  const VALID_PANELS = Object.keys(PANEL_COORDS);

  const root = document.documentElement;
  const activeCoord = document.getElementById("activeCoord");
  const themeToggle = document.getElementById("themeToggle");
  const cmdTrigger = document.getElementById("cmdTrigger");
  const cmdShortcutHint = document.getElementById("cmdShortcutHint");
  const cmdPalette = document.getElementById("cmdPalette");
  const cmdSearch = document.getElementById("cmdSearch");
  const cmdClose = document.getElementById("cmdClose");
  const cmdEmpty = document.getElementById("cmdEmpty");
  const liveAnnouncer = document.getElementById("liveAnnouncer");

  const railButtons = Array.from(document.querySelectorAll("[data-panel-trigger]"));
  const jumpButtons = Array.from(document.querySelectorAll("[data-panel-jump]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const filterTabs = Array.from(document.querySelectorAll("[data-filter]"));
  const projectCards = Array.from(document.querySelectorAll(".project-card[data-category]"));
  const copyButtons = Array.from(document.querySelectorAll("[data-copy-email]"));
  const cmdItems = Array.from(document.querySelectorAll(".cmd-item[data-cmd-action]"));

  const announce = (message) => {
    if (!liveAnnouncer) return;
    liveAnnouncer.textContent = "";
    requestAnimationFrame(() => {
      liveAnnouncer.textContent = message;
    });
  };

  /* ---------- Theme Toggle ---------- */
  const syncThemeButton = () => {
    if (!themeToggle) return;
    const isDark = root.dataset.theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };

  const toggleTheme = () => {
    const nextDark = root.dataset.theme !== "dark";
    root.dataset.theme = nextDark ? "dark" : "";
    try {
      localStorage.setItem("theme", nextDark ? "dark" : "light");
    } catch (_) {
      // Ignore storage errors in restricted contexts
    }
    syncThemeButton();
    announce(nextDark ? "Dark theme enabled" : "Light theme enabled");
  };

  if (themeToggle) {
    syncThemeButton();
    themeToggle.addEventListener("click", toggleTheme);
  }

  /* ---------- Section Panel Switcher ---------- */
  const activatePanel = (panelId, options = {}) => {
    const { updateHash = true, focusTab = false } = options;
    const targetId = VALID_PANELS.includes(panelId) ? panelId : "about";

    panels.forEach((panel) => {
      const isMatch = panel.dataset.panel === targetId;
      panel.classList.toggle("is-active", isMatch);
      panel.hidden = !isMatch;
    });

    railButtons.forEach((btn) => {
      const isMatch = btn.dataset.panelTrigger === targetId;
      btn.classList.toggle("is-active", isMatch);
      btn.setAttribute("aria-selected", String(isMatch));
      btn.setAttribute("tabindex", isMatch ? "0" : "-1");
      if (isMatch) {
        if (focusTab) btn.focus();
        if (window.innerWidth <= 768 && typeof btn.scrollIntoView === "function") {
          btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "auto" });
        }
      }
    });

    if (activeCoord) {
      activeCoord.textContent = PANEL_COORDS[targetId];
    }

    if (updateHash && window.location.hash !== `#${targetId}`) {
      try {
        history.pushState(null, "", `#${targetId}`);
      } catch (_) {
        window.location.hash = targetId;
      }
    }
  };

  railButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      activatePanel(btn.dataset.panelTrigger, { updateHash: true });
    });

    btn.addEventListener("keydown", (e) => {
      let nextIdx = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        nextIdx = (idx + 1) % railButtons.length;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        nextIdx = (idx - 1 + railButtons.length) % railButtons.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = railButtons.length - 1;
      }
      if (nextIdx !== null) {
        e.preventDefault();
        activatePanel(railButtons[nextIdx].dataset.panelTrigger, { updateHash: true, focusTab: true });
      }
    });
  });

  jumpButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activatePanel(btn.dataset.panelJump, { updateHash: true });
    });
  });

  const syncFromHash = () => {
    const raw = window.location.hash.replace(/^#/, "").trim().toLowerCase();
    activatePanel(VALID_PANELS.includes(raw) ? raw : "about", { updateHash: false });
  };

  window.addEventListener("hashchange", syncFromHash);
  syncFromHash();

  /* ---------- Project Category Filter Tabs ---------- */
  const filterProjects = (category, focusTab = false) => {
    const validCategories = ["all", "mobile", "web", "desktop"];
    const target = validCategories.includes(category) ? category : "all";

    filterTabs.forEach((tab) => {
      const isMatch = tab.dataset.filter === target;
      tab.classList.toggle("is-active", isMatch);
      tab.setAttribute("aria-selected", String(isMatch));
      tab.setAttribute("tabindex", isMatch ? "0" : "-1");
      if (isMatch && focusTab) tab.focus();
    });

    let visibleCount = 0;
    projectCards.forEach((card) => {
      const show = target === "all" || card.dataset.category === target;
      card.classList.toggle("is-hidden", !show);
      card.hidden = !show;
      if (show) visibleCount += 1;
    });

    announce(`Showing ${visibleCount} ${target === "all" ? "" : target + " "}project${visibleCount === 1 ? "" : "s"}`);
  };

  filterTabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => {
      filterProjects(tab.dataset.filter);
    });

    tab.addEventListener("keydown", (e) => {
      let nextIdx = null;
      if (e.key === "ArrowRight") {
        nextIdx = (idx + 1) % filterTabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIdx = (idx - 1 + filterTabs.length) % filterTabs.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = filterTabs.length - 1;
      }
      if (nextIdx !== null) {
        e.preventDefault();
        filterProjects(filterTabs[nextIdx].dataset.filter, true);
      }
    });
  });

  /* ---------- Copy Email with Fallback ---------- */
  const copyTextToClipboard = async (text) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Fall through to execCommand fallback
      }
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch (_) {
      return false;
    }
  };

  const triggerCopyEmail = async (sourceBtn) => {
    const ok = await copyTextToClipboard(EMAIL);
    const feedback = ok ? "Copied!" : EMAIL;
    announce(ok ? `Email ${EMAIL} copied to clipboard` : `Email address is ${EMAIL}`);

    if (sourceBtn) {
      if (!sourceBtn.dataset.originalLabel) {
        sourceBtn.dataset.originalLabel = sourceBtn.textContent;
      }
      sourceBtn.textContent = feedback;
      sourceBtn.classList.add("is-copied");
      clearTimeout(Number(sourceBtn.dataset.copyTimer || 0));
      const timerId = window.setTimeout(() => {
        sourceBtn.textContent = sourceBtn.dataset.originalLabel;
        sourceBtn.classList.remove("is-copied");
      }, 1800);
      sourceBtn.dataset.copyTimer = String(timerId);
    }
  };

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerCopyEmail(btn);
    });
  });

  /* ---------- Command Palette (Ctrl+K / Cmd+K) ---------- */
  if (cmdShortcutHint && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) {
    cmdShortcutHint.textContent = "⌘ K";
  }

  let selectedCmdIndex = 0;

  const getVisibleCmdItems = () => cmdItems.filter((item) => !item.parentElement.hidden);

  const highlightCmdIndex = (index) => {
    const visible = getVisibleCmdItems();
    cmdItems.forEach((item) => item.classList.remove("is-selected"));
    if (visible.length === 0) {
      selectedCmdIndex = -1;
      return;
    }
    selectedCmdIndex = ((index % visible.length) + visible.length) % visible.length;
    visible[selectedCmdIndex].classList.add("is-selected");
    visible[selectedCmdIndex].scrollIntoView({ block: "nearest" });
  };

  const filterCommands = (query) => {
    const q = query.trim().toLowerCase();
    let matches = 0;
    cmdItems.forEach((item) => {
      const text = `${item.textContent} ${item.dataset.cmdKeywords || ""}`.toLowerCase();
      const show = !q || text.includes(q);
      item.parentElement.hidden = !show;
      if (show) matches += 1;
    });
    if (cmdEmpty) cmdEmpty.hidden = matches > 0;
    highlightCmdIndex(0);
  };

  const closePalette = () => {
    if (cmdPalette && cmdPalette.open) {
      cmdPalette.close();
    }
  };

  const executeCommand = (action) => {
    closePalette();
    if (!action) return;
    if (action.startsWith("panel:")) {
      activatePanel(action.slice(6), { updateHash: true });
    } else if (action.startsWith("filter:")) {
      activatePanel("projects", { updateHash: true });
      filterProjects(action.slice(7));
    } else if (action === "copy-email") {
      triggerCopyEmail(copyButtons[0] || null);
    } else if (action === "toggle-theme") {
      toggleTheme();
    } else if (action === "open-github") {
      window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
    }
  };

  const openPalette = () => {
    if (!cmdPalette || typeof cmdPalette.showModal !== "function") return;
    if (cmdPalette.open) return;
    if (cmdSearch) cmdSearch.value = "";
    filterCommands("");
    cmdPalette.showModal();
    if (cmdSearch) cmdSearch.focus();
  };

  if (cmdTrigger) {
    cmdTrigger.addEventListener("click", openPalette);
  }

  if (cmdClose) {
    cmdClose.addEventListener("click", closePalette);
  }

  if (cmdSearch) {
    cmdSearch.addEventListener("input", () => filterCommands(cmdSearch.value));
    cmdSearch.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        highlightCmdIndex(selectedCmdIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlightCmdIndex(selectedCmdIndex - 1);
      } else if (e.key === "Enter") {
        const visible = getVisibleCmdItems();
        if (selectedCmdIndex >= 0 && visible[selectedCmdIndex]) {
          e.preventDefault();
          executeCommand(visible[selectedCmdIndex].dataset.cmdAction);
        }
      }
    });
  }

  cmdItems.forEach((item) => {
    item.addEventListener("click", () => {
      executeCommand(item.dataset.cmdAction);
    });
  });

  if (cmdPalette) {
    cmdPalette.addEventListener("click", (e) => {
      if (e.target === cmdPalette) closePalette();
    });
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdPalette && cmdPalette.open) {
        closePalette();
      } else {
        openPalette();
      }
    }
  });
})();
