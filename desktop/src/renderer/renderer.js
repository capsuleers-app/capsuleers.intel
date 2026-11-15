    // Escapes &, <, > AND the quote chars: esc()'d values are also placed inside
    // double-quoted HTML attributes (title="…"), so leaving " / ' raw would allow an
    // attribute-breakout XSS from any value that reaches an attribute. Encoding both
    // quotes makes esc() safe in element-content AND attribute contexts.
    const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const IMG = "https://images.evetech.net";
    // Numeric coercion for external values interpolated into HTML (NaN/garbage → 0).
    const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
    // External URLs are accepted only when https://; anything else becomes "".
    const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u) ? u : "");
    // System language (Electron reflects the system locale in navigator.language).
    const SYS_LANG = (navigator.language || "en").toLowerCase().startsWith("it") ? "it" : "en";

    // Stroke icons (24 viewBox) used by markup built at runtime.
    const ICONS = {
      users: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>",
      radar: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 12l6-6\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>",
      arrow: "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
      check: "<path d=\"M20 6 9 17l-5-5\"/>",
      copy: "<rect x=\"9\" y=\"9\" width=\"12\" height=\"12\"/><path d=\"M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1\"/>",
      ext: "<path d=\"M15 3h6v6M10 14 21 3M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7\"/>",
      target: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>",
      clip: "<rect x=\"8\" y=\"2\" width=\"8\" height=\"4\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"m9 14 2 2 4-4\"/>",
      pause: "<path d=\"M9 5v14M15 5v14\"/>",
      x: "<path d=\"M18 6 6 18M6 6l12 12\"/>",
      refresh: "<path d=\"M21 12a9 9 0 1 1-2.64-6.36L21 8\"/><path d=\"M21 3v5h-5\"/>",
      trash: "<path d=\"M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15\"/>"
    };
    const ic = (n, s = 16) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

    // Dictionary of all GUI strings (it / en, from the system locale). Entries can be
    // functions when dynamic values are needed (counts, names…).
    const I18N = {
      it: {
        wcMini: "Riduci a icona (always-on-top)", wcTray: "Riduci nel tray", wcMax: "Massimizza", wcClose: "Chiudi",
        miniExpand: "Click per espandere",
        navLabel: "Sezioni", navGroup: "Intel", navHome: "Panoramica", navLocal: "Local", navDscan: "D-Scan",
        navHistory: "Link condivisi", navAbout: "Informazioni",
        stHeading: "Stato", stClip: "Appunti", stClipOn: "In ascolto", stClipOff: "In pausa", stLast: "Ultimo scan", stLinks: "Link attivi",
        watchOn: "Ascolto attivo", watchOff: "Ascolto in pausa",
        watchOnTitle: "Sto leggendo gli appunti (Local / D-Scan). Click per mettere in pausa.",
        watchOffTitle: "Ascolto appunti in pausa. Click per attivarlo.",
        localDetected: (n) => `Rilevata una Local di ${n} piloti negli appunti`,
        localShowIntel: "Mostra intel",
        dscanDetected: (n) => `Rilevato D-Scan di ${n} oggetti`,
        dscanAnalyze: "Analizza", bannerDismiss: "Ignora",
        homeTitle: "Local e <span>D-Scan</span>", homeLede: "Intel da appunti per EVE Online.",
        btnScan: "Scansiona appunti", btnScanTitle: "Analizza subito gli appunti (Local o D-Scan)",
        homeOnH: "In ascolto degli appunti", homeOnT: "Copia la Local o un D-Scan in EVE: l'intel compare qui e un suono ti avvisa.",
        homeOffH: "Ascolto in pausa", homeOffT: "Gli appunti non vengono letti. Riattiva l'ascolto o premi Scansiona per leggerli una volta.",
        btnPause: "Metti in pausa", btnResume: "Riattiva ascolto",
        homeLocalH: "Intel Local", homeLocalT: "Nella finestra Local di EVE: Ctrl+A, Ctrl+C. Compaiono piloti, kill e perdite, rischio e tag.",
        homeDscanH: "Analisi D-Scan", homeDscanT: "Copia un D-Scan: composizione per classe di nave, calcolata offline.",
        homeHistoryH: "Condividi", homeHistoryT: "Ogni intel diventa un link di 24 ore su capsuleers.app, raccolti in Link condivisi.",
        recentTitle: "Ultimi rilevamenti", recentSub: "Da quando hai aperto l'app", recentEmpty: "Nessun rilevamento finora: copia una Local o un D-Scan da EVE.",
        localTitle: "<span>Local</span>", btnRescan: "Rileggi appunti", btnReadNow: "Leggi gli appunti ora",
        localEmptyH: "Copia la Local da EVE", localEmptyP: "Nella finestra Local di EVE: Ctrl+A, Ctrl+C. L'intel compare da sola con l'ascolto attivo.",
        danger: ["ignoto", "basso", "medio", "alto"],
        intelDetail: "Dettaglio intel", notFound: "nessuna attività PvP negli ultimi 90 giorni",
        windowDays: (n) => `${n}g`,
        localResolving: (n) => `risoluzione di ${n} piloti…`, loadingIntel: "Carico l'intel…",
        pilotsNoun: "piloti", dangerNoun: "pericolosi", resolvedOf: (r, t) => `risolti ${r}/${t}`,
        alliancesLabel: "Alleanze", corporationsLabel: "Corporazioni", pilotsLabel: "Piloti", riskHighMed: "Rischio alto o medio",
        compAlliance: "Composizione per alleanza", noAlliance: "Senza alleanza", unknownCorp: "Corporazione sconosciuta",
        colPilot: "Pilota", colKl: "Kill / perdite", colTags: "Tag", colRisk: "Rischio",
        shareBtn: "Condividi", shareTitle: "Condividi questo intel (link valido 24h)",
        sharing: "Creo il link…", shareProcessing: "Elaborazione del link condivisibile in corso…", shareErr: "Impossibile creare il link condivisibile",
        shareCopied: "Link copiato", shareExpires: (s) => `scade tra ${s}`, shareClose: "Chiudi",
        shareCopy: "Copia", shareOpen: "Apri", shareCopiedShort: "Copiato!", copyLink: "Copia link",
        historyModalTitle: "Link <span>condivisi</span>", historyLede: "Ogni link vive 24 ore su capsuleers.app.",
        historyClear: "Svuota storico", historyEmpty: "Nessun link condiviso di recente.",
        activeLinks: "Link attivi", linkLifetime: "Durata di un link",
        colType: "Tipo", colContent: "Contenuto", colCreated: "Creato", colValidity: "Validità residua", colActions: "Azioni",
        pilotsShort: (n) => `${n} piloti`, objectsShort: (n) => `${n} oggetti`, intelShort: "Local", dscanShort: "D-Scan",
        dscanTitle: "D-<span>Scan</span>",
        dscanResolving: (n) => `analisi di ${n} oggetti…`, dscanAnalyzing: "Analizzo il D-Scan…",
        dscanSystem: "Sistema", dscanShipClasses: "Classi di nave", dscanShips: "Navi",
        dscanUnits: (n) => `${n} unità`, dscanEntities: (n) => `${n} entità`, dscanNone: "nessun oggetto",
        dscanEntNoun: "entità", dsClasses: (n) => `${n} classi`, dsShipsSub: (u, h) => `${u} unità · ${h} scafi`,
        dsCapitals: "Capitali",
        dscanCats: { Ships: "Navi", Structures: "Strutture", Deployables: "Deployable", Drones: "Droni", Celestials: "Celestiali", Others: "Altro" },
        dsEmptyH: "Copia un D-Scan da EVE", dsEmptyP: "L'analisi è fatta sul tuo computer: nessun dato esce finché non premi Condividi.",
        dsS1H: "Apri il Directional Scanner", dsS1T: "Nella finestra D-Scan di EVE premi Scan.",
        dsS2H: "Seleziona e copia", dsS2T: "Clic su un risultato, poi Ctrl+A e Ctrl+C.",
        dsS3H: "Leggi qui", dsS3T: "Con l'ascolto attivo la composizione compare da sola, offline.",
        dossier: "Dossier pilota", closeDossier: "Chiudi dossier", riskWord: "Rischio",
        loadingIntelOf: (name) => `Carico l'intel di ${name}…`, noData: "Nessun dato",
        statKills: "Kill", statLoss: "Perdite", statWindow: "Finestra", statEff: "Efficienza",
        playStyle: "Stile di volo", psSolo: "Solo", psSmall: "Piccola gang", psFleet: "Flotta",
        fliesWith: "Vola spesso con", recentShips: "Ultime navi usate",
        lblOverview: "Profilo", titleOverview: "Profilo del personaggio su capsuleers.app",
        lblPvp: "Dati PvP", titlePvp: "Dati PvP e killboard su eve-kill.com",
        appPre: "App", aboutTitle: "<span>Informazioni</span>", aboutSub: "Intel da appunti per EVE Online",
        aboutVersion: "Versione", aboutPowered: "powered by",
        aboutCredit: 'Creato da <a href="https://capsuleers.app/it/character/789877270" target="_blank" rel="noopener">TremalJack</a> con il supporto della community di EVE Online.',
        aboutDataH: "Dati e servizi", aboutLegalH: "Note legali", aboutDangerH: "Zona pericolosa",
        aboutDisc1: "<b>Strumento non ufficiale</b> creato da fan, non affiliato né approvato da Fenris Creations.",
        aboutDisc2: "EVE Online e il logo EVE sono marchi registrati di Fenris Creations. Tutti i diritti riservati. Tutti i nomi di prodotti, loghi e marchi citati appartengono ai rispettivi proprietari. Fenris Creations non è in alcun modo responsabile del contenuto o del funzionamento di questa applicazione, né può essere ritenuta responsabile per eventuali danni derivanti dal suo utilizzo.",
        aboutDisc3: "EVE Static Data Export ed ESI (Fenris Creations), capsuleers.app (killboard e intel) ed eve-kill (ripiego se il sito non risponde). L'analisi del D-Scan è 100% offline; l'intel della Local interroga capsuleers.app.",
        wipeBtn: "Rimuovi tutti i dati", wipeConfirmBtn: "Conferma rimozione", setupCancel: "Annulla", computing: "Calcolo…",
        wipeHint: "Cancella la cronologia condivisioni, le impostazioni e la cache di questa app, poi la chiude. Usalo prima di disinstallare. Operazione irreversibile.",
      },
      en: {
        wcMini: "Shrink to icon (always-on-top)", wcTray: "Minimize to tray", wcMax: "Maximize", wcClose: "Close",
        miniExpand: "Click to expand",
        navLabel: "Sections", navGroup: "Intel", navHome: "Overview", navLocal: "Local", navDscan: "D-Scan",
        navHistory: "Shared links", navAbout: "About",
        stHeading: "Status", stClip: "Clipboard", stClipOn: "Watching", stClipOff: "Paused", stLast: "Last scan", stLinks: "Active links",
        watchOn: "Watching", watchOff: "Paused",
        watchOnTitle: "Reading the clipboard (Local / D-Scan). Click to pause.",
        watchOffTitle: "Clipboard watch paused. Click to enable.",
        localDetected: (n) => `Detected a Local of ${n} pilots in the clipboard`,
        localShowIntel: "Show intel",
        dscanDetected: (n) => `D-Scan detected: ${n} objects`,
        dscanAnalyze: "Analyze", bannerDismiss: "Dismiss",
        homeTitle: "Local and <span>D-Scan</span>", homeLede: "Clipboard intel for EVE Online.",
        btnScan: "Scan clipboard", btnScanTitle: "Analyze the clipboard now (Local or D-Scan)",
        homeOnH: "Watching the clipboard", homeOnT: "Copy the Local or a D-Scan in EVE: the intel shows up here and a sound alerts you.",
        homeOffH: "Watch paused", homeOffT: "The clipboard is not being read. Resume the watch or press Scan to read it once.",
        btnPause: "Pause watch", btnResume: "Resume watch",
        homeLocalH: "Local intel", homeLocalT: "In EVE's Local window: Ctrl+A, Ctrl+C. Pilots appear with kills and losses, risk and tags.",
        homeDscanH: "D-Scan analysis", homeDscanT: "Copy a D-Scan: breakdown by ship class, computed offline.",
        homeHistoryH: "Share", homeHistoryT: "Every intel becomes a 24-hour link on capsuleers.app, collected in Shared links.",
        recentTitle: "Latest detections", recentSub: "Since you opened the app", recentEmpty: "Nothing detected yet: copy a Local or a D-Scan from EVE.",
        localTitle: "<span>Local</span>", btnRescan: "Re-read clipboard", btnReadNow: "Read the clipboard now",
        localEmptyH: "Copy the Local from EVE", localEmptyP: "In EVE's Local window: Ctrl+A, Ctrl+C. The intel shows up by itself while the watch is on.",
        danger: ["unknown", "low", "medium", "high"],
        intelDetail: "Intel details", notFound: "no PvP activity in the last 90 days",
        windowDays: (n) => `${n}d`,
        localResolving: (n) => `resolving ${n} pilots…`, loadingIntel: "Loading intel…",
        pilotsNoun: "pilots", dangerNoun: "dangerous", resolvedOf: (r, t) => `resolved ${r}/${t}`,
        alliancesLabel: "Alliances", corporationsLabel: "Corporations", pilotsLabel: "Pilots", riskHighMed: "High or medium risk",
        compAlliance: "Alliance breakdown", noAlliance: "No Alliance", unknownCorp: "Unknown Corporation",
        colPilot: "Pilot", colKl: "Kills / losses", colTags: "Tags", colRisk: "Risk",
        shareBtn: "Share", shareTitle: "Share this intel (link valid for 24h)",
        sharing: "Creating link…", shareProcessing: "Processing the share link…", shareErr: "Couldn't create the share link",
        shareCopied: "Link copied", shareExpires: (s) => `expires in ${s}`, shareClose: "Close",
        shareCopy: "Copy", shareOpen: "Open", shareCopiedShort: "Copied!", copyLink: "Copy link",
        historyModalTitle: "Shared <span>links</span>", historyLede: "Every link lives 24 hours on capsuleers.app.",
        historyClear: "Clear history", historyEmpty: "No links shared recently.",
        activeLinks: "Active links", linkLifetime: "Link lifetime",
        colType: "Type", colContent: "Content", colCreated: "Created", colValidity: "Time left", colActions: "Actions",
        pilotsShort: (n) => `${n} pilots`, objectsShort: (n) => `${n} objects`, intelShort: "Local", dscanShort: "D-Scan",
        dscanTitle: "D-<span>Scan</span>",
        dscanResolving: (n) => `analyzing ${n} objects…`, dscanAnalyzing: "Analyzing the D-Scan…",
        dscanSystem: "System", dscanShipClasses: "Ship classes", dscanShips: "Ships",
        dscanUnits: (n) => `${n} units`, dscanEntities: (n) => `${n} entities`, dscanNone: "no objects",
        dscanEntNoun: "entities", dsClasses: (n) => `${n} classes`, dsShipsSub: (u, h) => `${u} units · ${h} hulls`,
        dsCapitals: "Capitals",
        dscanCats: { Ships: "Ships", Structures: "Structures", Deployables: "Deployables", Drones: "Drones", Celestials: "Celestials", Others: "Others" },
        dsEmptyH: "Copy a D-Scan from EVE", dsEmptyP: "The analysis runs on your computer: no data leaves it until you press Share.",
        dsS1H: "Open the Directional Scanner", dsS1T: "In EVE's D-Scan window press Scan.",
        dsS2H: "Select and copy", dsS2T: "Click a result, then Ctrl+A and Ctrl+C.",
        dsS3H: "Read it here", dsS3T: "With the watch on, the breakdown appears by itself, offline.",
        dossier: "Pilot dossier", closeDossier: "Close dossier", riskWord: "Risk",
        loadingIntelOf: (name) => `Loading intel for ${name}…`, noData: "No data",
        statKills: "Kills", statLoss: "Losses", statWindow: "Window", statEff: "Efficiency",
        playStyle: "Flight style", psSolo: "Solo", psSmall: "Small gang", psFleet: "Fleet",
        fliesWith: "Often flies with", recentShips: "Recently used ships",
        lblOverview: "Profile", titleOverview: "Character profile on capsuleers.app",
        lblPvp: "PvP data", titlePvp: "PvP data and killboard on eve-kill.com",
        appPre: "App", aboutTitle: "<span>About</span>", aboutSub: "Clipboard intel for EVE Online",
        aboutVersion: "Version", aboutPowered: "powered by",
        aboutCredit: 'Created by <a href="https://capsuleers.app/en/character/789877270" target="_blank" rel="noopener">TremalJack</a> with the support of the EVE Online community.',
        aboutDataH: "Data and services", aboutLegalH: "Legal notes", aboutDangerH: "Danger zone",
        aboutDisc1: "<b>Unofficial tool</b> made by fans, not affiliated with nor endorsed by Fenris Creations.",
        aboutDisc2: "EVE Online and the EVE logo are registered trademarks of Fenris Creations. All rights reserved. All product names, logos and brands mentioned are property of their respective owners. Fenris Creations is in no way responsible for the content or operation of this application, nor can it be held liable for any damage arising from its use.",
        aboutDisc3: "EVE Static Data Export and ESI (Fenris Creations), capsuleers.app (killboard and intel) and eve-kill (fallback when the site does not answer). D-Scan analysis is 100% offline; Local intel queries capsuleers.app.",
        wipeBtn: "Remove all data", wipeConfirmBtn: "Confirm removal", setupCancel: "Cancel", computing: "Computing…",
        wipeHint: "Deletes the share history, settings and cache of this app, then closes it. Use it before uninstalling. This cannot be undone.",
      },
    };
    const L = I18N[SYS_LANG];

    // Applies the static strings to elements marked with data-i18n[-title|-html|-aria].
    function applyStaticI18n() {
      for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = L[el.dataset.i18n];
      for (const el of document.querySelectorAll("[data-i18n-html]")) el.innerHTML = L[el.dataset.i18nHtml];
      for (const el of document.querySelectorAll("[data-i18n-title]")) el.title = L[el.dataset.i18nTitle];
      for (const el of document.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", L[el.dataset.i18nAria]);
    }
    applyStaticI18n();

    // ── Window controls ─────────────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);
    const ICON_MAX = ic("max", 14);
    const ICON_RESTORE = '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="14" height="14"/><path d="M7 7V3h14v14h-4"/></svg>';
    $("wc-mini").addEventListener("click", () => capsuleers.win.mini());
    $("wc-tray").addEventListener("click", () => capsuleers.win.minimize());
    $("wc-max").addEventListener("click", () => capsuleers.win.maximize());
    $("wc-close").addEventListener("click", () => capsuleers.win.close());
    capsuleers.win.onState((max) => { $("wc-max").innerHTML = max ? ICON_RESTORE : ICON_MAX; });
    // Mini-mode: click the icon to return to the interface
    document.querySelector("#mini img").addEventListener("click", () => capsuleers.win.restore());
    capsuleers.win.onMiniState((mini) => document.body.classList.toggle("mini", mini));

    // ── Info page ───────────────────────────────────────────────────────────
    // Show the running app version so "old vs new build" is distinguishable at a glance.
    capsuleers.appVersion().then((v) => { if (v) $("about-version").textContent = "v" + v; }).catch(() => {});
    // Danger zone: full data wipe with a two-step inline confirm (no native dialogs).
    const wipeBtn = $("wipe-data");
    let wipeArmed = false;
    wipeBtn.addEventListener("click", () => {
      if (wipeBtn.disabled || wipeArmed) return;
      wipeArmed = true;
      const wrap = document.createElement("span");
      wrap.className = "wipe-confirm";
      const cancel = document.createElement("button");
      cancel.className = "btn s"; cancel.type = "button"; cancel.textContent = L.setupCancel;
      const yes = document.createElement("button");
      yes.className = "btn s c"; yes.type = "button"; yes.textContent = L.wipeConfirmBtn;
      cancel.addEventListener("click", () => { wrap.remove(); wipeArmed = false; });
      yes.addEventListener("click", async () => {
        wrap.remove(); wipeBtn.disabled = true; $("wipe-label").textContent = L.computing;
        try { await capsuleers.data.wipeAll(); } catch { /* app is quitting */ }
      });
      wrap.append(cancel, yes);
      wipeBtn.parentElement.append(wrap);
    });

    // ── View router ─────────────────────────────────────────────────────────
    // Exactly one view fills the main area; the rail drives it. The pilot dossier is a drawer.
    const VIEW_IDS = { home: "chat", local: "local", dscan: "dscan", history: "history-modal", about: "about" };
    let currentView = "home";
    const navBtns = [...document.querySelectorAll(".rl [data-view]")];
    function showView(name) {
      for (const [k, id] of Object.entries(VIEW_IDS)) $(id).classList.toggle("show", k === name);
      for (const b of navBtns) {
        const on = b.dataset.view === name;
        b.classList.toggle("on", on);
        if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
      }
      closePilot();   // a view switch closes the pilot drawer
      currentView = name;
      if (name !== "history") stopHistTimer();   // stop the countdown ticker when leaving History
      if (name === "history") renderHistory();
    }
    for (const b of navBtns) b.addEventListener("click", () => showView(b.dataset.view));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePilot(); });
    const openLocal = () => showView("local");
    const openDscan = () => showView("dscan");

    // ── Clipboard watch ─────────────────────────────────────────────────────
    const localBtn = $("local-btn");
    const watchStatus = $("watch-status");
    const watchLabel = $("watch-label");
    // Reflect the clipboard-watch state everywhere: titlebar chip, rail status, home block.
    function setWatchUI(on) {
      watchStatus.classList.toggle("ok", on);
      watchStatus.classList.toggle("off", !on);
      watchLabel.textContent = on ? L.watchOn : L.watchOff;
      watchStatus.title = on ? L.watchOnTitle : L.watchOffTitle;
      const sc = $("st-clip"); sc.textContent = on ? L.stClipOn : L.stClipOff; sc.classList.toggle("ok", on);
      $("home-status").classList.toggle("off", !on);
      $("hs-h").textContent = on ? L.homeOnH : L.homeOffH;
      $("hs-p").textContent = on ? L.homeOnT : L.homeOffT;
      $("hs-btn").textContent = on ? L.btnPause : L.btnResume;
      $("hs-btn-ic").innerHTML = on ? ic("pause", 14) : ic("clip", 14);
      localBtn.classList.toggle("p", !on);
    }
    async function refreshLocalBtn() { setWatchUI(await capsuleers.local.state()); }
    // Audible cue for a detected Local: an app-played sound (not the OS toast,
    // which Windows suppresses via Focus Assist while a game runs fullscreen), so
    // you hear it even when gaming on another monitor. Primed on the toggle click
    // (a user gesture) so the AudioContext is allowed to play later.
    let _ac = null;
    function primeAudio() { try { _ac = _ac || new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === "suspended") _ac.resume(); } catch { /* no audio */ } }
    function localBeep() {
      try {
        primeAudio(); if (!_ac) return;
        const t = _ac.currentTime;
        for (const [i, f] of [[0, 880], [0.16, 1245]]) {  // two short rising tones
          const o = _ac.createOscillator(), g = _ac.createGain();
          o.type = "sine"; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t + i);
          g.gain.exponentialRampToValueAtTime(0.3, t + i + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + i + 0.16);
          o.connect(g).connect(_ac.destination);
          o.start(t + i); o.stop(t + i + 0.17);
        }
      } catch { /* audio not available */ }
    }
    const toggleWatch = async () => { primeAudio(); await capsuleers.local.toggle(); refreshLocalBtn(); };
    localBtn.addEventListener("click", toggleWatch);
    watchStatus.addEventListener("click", toggleWatch);
    refreshLocalBtn();

    // "Scan now": force an immediate clipboard check (Local or D-Scan). Buttons may be rebuilt → delegate.
    document.addEventListener("click", (e) => {
      if (e.target.closest("#scan-now, #local-rescan, [data-scan]")) { primeAudio(); capsuleers.local.scan(); }
    });

    // In-app banner when a Local is detected (reliable even if the OS toast is missed).
    const localBanner = $("local-banner");
    const hideLocalBanner = () => { localBanner.hidden = true; };
    capsuleers.local.onDetected(({ kind, count }) => {
      const isD = kind === "dscan";
      $("local-banner-text").textContent = isD ? L.dscanDetected(count) : L.localDetected(count);
      $("local-banner-show").textContent = isD ? L.dscanAnalyze : L.localShowIntel;
      localBanner.hidden = false;
      localBeep();
    });
    $("local-banner-show").addEventListener("click", () => { hideLocalBanner(); capsuleers.local.confirm(); });
    $("local-banner-x").addEventListener("click", hideLocalBanner);
    capsuleers.local.onStart(hideLocalBanner);          // local intel started → hide the banner
    capsuleers.local.onDScanStart(hideLocalBanner);     // d-scan analysis started → hide the banner

    // ── Rail status + latest detections (this session) ──────────────────────
    const fmtClock = (ts) => new Date(ts).toLocaleTimeString(SYS_LANG === "it" ? "it-IT" : "en-GB", { hour: "2-digit", minute: "2-digit" });
    const _recent = [];
    function noteDetection(kind, text, tone) {
      const ts = Date.now();
      $("st-last").textContent = fmtClock(ts);
      _recent.unshift({ kind, text, tone, ts });
      _recent.length = Math.min(_recent.length, 8);
      renderRecent();
    }
    function renderRecent() {
      const box = $("home-recent");
      if (!_recent.length) { box.innerHTML = `<div class="mut" style="font-size:13px;padding:12px 0;">${esc(L.recentEmpty)}</div>`; return; }
      const col = { crit: "var(--cap-crit)", warn: "var(--cap-warn)", ok: "var(--cap-ok)" };
      box.innerHTML = _recent.map((r, i) =>
        `<div class="hr" role="button" tabindex="0" data-i="${i}"><span class="tag${r.kind === "dscan" ? " fl" : ""}">${esc(r.kind === "dscan" ? L.dscanShort : L.intelShort)}</span>` +
        `<span class="tx">${esc(r.text)}</span><span class="dot" style="background:${col[r.tone] || col.ok};"></span><span class="num">${esc(fmtClock(r.ts))}</span>${ic("arrow", 14)}</div>`).join("");
    }
    $("home-recent").addEventListener("click", (e) => {
      const row = e.target.closest(".hr"); if (!row) return;
      showView(_recent[Number(row.dataset.i)]?.kind === "dscan" ? "dscan" : "local");
    });
    $("home-recent").addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("hr")) { e.preventDefault(); e.target.click(); } });
    // Active shared links (count shown in the rail).
    async function refreshLinkCount() {
      let list = [];
      try { list = await capsuleers.local.history.list(); } catch { list = []; }
      const n = list.filter((e) => Number(typeof e.expiresAt === "string" ? Date.parse(e.expiresAt) : e.expiresAt) > Date.now()).length;
      $("st-links").textContent = String(n);
      $("nav-history-n").textContent = n ? String(n) : "";
      return list;
    }

    // ── Local intel from clipboard ──────────────────────────────────────────
    const localBody = $("local-body");
    const localSub = $("local-sub");
    const localSummary = $("local-summary");
    const localLh = $("local-lh");
    const emptyBlock = (icon, h, p, steps) =>
      `<div class="empty">${ic(icon, 40)}<h2>${esc(h)}</h2><p>${esc(p)}</p>${steps || ""}` +
      `<button class="btn" type="button" data-scan>${ic("clip", 14)}${esc(L.btnReadNow)}</button></div>`;
    function renderLocalEmpty() {
      localSummary.hidden = true; localLh.hidden = true; localSub.innerHTML = "";
      localBody.innerHTML = emptyBlock("users", L.localEmptyH, L.localEmptyP);
    }
    const RISK_COL = ["var(--cap-ink-3)", "var(--cap-ok)", "var(--cap-warn)", "var(--cap-crit)"];
    const flagClass = (f) => /^(capital|bait|FC:High)/i.test(f) ? "crit" : /^FC:/i.test(f) ? "warn" : f === "logi" ? "fl" : "";
    function localRow(r) {
      const a = document.createElement("div");
      const dg = Math.min(3, Math.max(0, num(r.danger)));
      a.className = "lr d" + dg;
      if (r.id) {
        a.setAttribute("role", "button"); a.tabIndex = 0;
        a.title = L.intelDetail;
        const go = () => openPilot({ id: r.id, name: r.name, danger: dg, window: r.window });
        a.addEventListener("click", go);
        a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      }
      const alliLogo = r.allianceId ? `<img class="lg" src="${IMG}/alliances/${num(r.allianceId)}/logo?size=32" alt="" title="${esc(r.allianceName || "")}" />` : `<span class="lg"></span>`;
      const corpLogo = r.corpId ? `<img class="lg" src="${IMG}/corporations/${num(r.corpId)}/logo?size=32" alt="" title="${esc(r.corpName || "")}" />` : `<span class="lg"></span>`;
      const portrait = r.id ? `<img class="av" src="${IMG}/characters/${num(r.id)}/portrait?size=64" alt="" width="34" height="34" />` : `<span class="av" style="width:34px;height:34px;"></span>`;
      const sub = `${alliLogo}${corpLogo}<span>${r.allianceTicker ? "&lt;" + esc(r.allianceTicker) + "&gt; " : ""}${esc(r.corpName || "")}</span>`;
      let kl;
      if (r.found) {
        const k = num(r.kills), l = num(r.losses), tot = k + l;
        const duel = tot
          ? `<span class="duel" role="img" aria-label="${k} / ${l}"><i style="width:${Math.round((k / tot) * 100)}%;background:var(--cap-ok);"></i><i style="flex:1;background:var(--cap-crit);margin-left:2px;"></i></span>`
          : `<span class="duel"><i style="flex:1;background:var(--cap-panel-2);"></i></span>`;
        kl = `<span class="num"><b style="color:var(--cap-ok);">${k}</b> <span class="mut">/</span> <b style="color:var(--cap-crit);">${l}</b>${r.window ? ` <span class="mut">· ${esc(L.windowDays(num(r.window)))}</span>` : ""}</span>${duel}`;
      } else {
        kl = `<span class="mut" title="${esc(L.notFound)}">${esc(L.notFound)}</span>`;
      }
      const tags = (r.flags || []).map((f) => `<span class="tag ${flagClass(f)}">${esc(f)}</span>`).join("");
      a.innerHTML =
        `<i class="rb" style="background:${RISK_COL[dg]};"></i>${portrait}` +
        `<span class="nm"><b${r.found ? "" : ' class="miss"'}>${esc(r.name)}</b><span class="sub">${sub}</span></span>` +
        `<span class="kl">${kl}</span><span class="tg">${tags}</span><span class="rk" style="color:${RISK_COL[dg]};">${esc(L.danger[dg])}</span>`;
      return a;
    }

    // Local scan summary: counts (alliances/corps/pilots/risk) + alliance composition (filter buttons)
    function aggregateLocal(rows) {
      const allies = new Map();      // allianceName → { name, id, count }
      const corpKeys = new Set();    // unique "ally\0corp" pairs → corporation total
      for (const r of rows) {
        const name = r.allianceName || L.noAlliance;
        let a = allies.get(name);
        if (!a) { a = { name, id: r.allianceId || null, count: 0 }; allies.set(name, a); }
        a.count++;
        if (!a.id && r.allianceId) a.id = r.allianceId;
        corpKeys.add(name + "\u0000" + (r.corpName || L.unknownCorp));
      }
      const allies_ = [...allies.values()].sort((x, y) => y.count - x.count || x.name.localeCompare(y.name));
      return { allianceCount: allies_.length, corpCount: corpKeys.size, pilotCount: rows.length, allies: allies_ };
    }
    const COMP_COL = ["var(--cap-c1)", "var(--cap-c2)", "var(--cap-c3)", "var(--cap-c4)"];
    // Alliance filter: the legend buttons narrow the pilot list to one alliance (keyed by the
    // same name aggregateLocal groups on, so "No Alliance" filters too). Reset on every new scan.
    let _localRows = [], _allyFilter = null;
    const allyKey = (r) => r.allianceName || L.noAlliance;
    function renderLocalRows() {
      const rows = _allyFilter == null ? _localRows : _localRows.filter((r) => allyKey(r) === _allyFilter);
      localBody.innerHTML = "";
      for (const r of rows) localBody.appendChild(localRow(r));
      const chips = localSummary.querySelector(".ach");
      if (chips) {
        chips.classList.toggle("filtering", _allyFilter != null);
        for (const b of chips.querySelectorAll("button")) {
          const on = b.dataset.ally === _allyFilter;
          b.classList.toggle("on", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        }
      }
    }
    localSummary.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-ally]");
      if (!b) return;
      _allyFilter = _allyFilter === b.dataset.ally ? null : b.dataset.ally;
      renderLocalRows();
      localBody.scrollTop = 0;
    });
    function renderLocalSummary(rows) {
      if (!rows || !rows.length) { localSummary.hidden = true; localLh.hidden = true; localSummary.innerHTML = ""; return; }
      const s = aggregateLocal(rows);
      const risky = rows.filter((r) => r.danger >= 2).length;
      const col = (i) => i < COMP_COL.length ? COMP_COL[i] : "var(--cap-ink-3)";
      const bars = s.allies.map((a, i) => `<i style="flex:${num(a.count)};background:${col(i)};"></i>`).join("");
      const legend = s.allies.map((a, i) => {
        const logo = a.id ? `<img class="lg" src="${IMG}/alliances/${num(a.id)}/logo?size=32" alt="" />` : "";
        return `<button type="button" data-ally="${esc(a.name)}" aria-pressed="false" title="${esc(a.name)}"><i class="sw" style="background:${col(i)};"></i>${logo}${esc(a.name)} <b class="num">${num(a.count)}</b></button>`;
      }).join("");
      localSummary.innerHTML =
        `<div class="sum"><div class="big">` +
          `<div class="k"><b class="num">${num(s.allianceCount)}</b><span>${esc(L.alliancesLabel)}</span></div>` +
          `<div class="k"><b class="num">${num(s.corpCount)}</b><span>${esc(L.corporationsLabel)}</span></div>` +
          `<div class="k"><b class="num">${num(s.pilotCount)}</b><span>${esc(L.pilotsLabel)}</span></div>` +
          `<div class="k"><b class="num crit">${num(risky)}</b><span>${esc(L.riskHighMed)}</span></div></div>` +
        `<div class="dw"><span class="lab">${esc(L.compAlliance)}</span><div class="dist" style="margin-top:10px;">${bars}</div><div class="ach">${legend}</div></div></div>`;
      localSummary.hidden = false; localLh.hidden = false;
    }

    capsuleers.local.onStart(({ total }) => {
      openLocal();
      localSummary.hidden = true; localLh.hidden = true;
      _localRows = []; _allyFilter = null;
      localSub.innerHTML = `<span>${esc(L.localResolving(total))}</span>`;
      localBody.innerHTML = `<div class="lprog">${esc(L.loadingIntel)} <span id="lp">0</span>/${num(total)}<div class="bar"><i id="lpbar"></i></div></div>`;
    });
    capsuleers.local.onProgress(({ done, total }) => {
      const lp = $("lp"), bar = $("lpbar");
      if (lp) lp.textContent = done;
      if (bar) bar.style.width = Math.round((done / total) * 100) + "%";
    });
    capsuleers.local.onResult((res) => {
      openLocal();
      if (res.error) { localSummary.hidden = true; localLh.hidden = true; localBody.innerHTML = `<div class="lprog">⚠ ${esc(res.error)}</div>`; return; }
      const high = res.rows.filter((r) => r.danger >= 2).length;
      localSub.innerHTML = `<span><b class="num">${num(res.rows.length)}</b>${esc(L.pilotsNoun)}</span>` +
        (high ? `<span><b class="num crit">${num(high)}</b>${esc(L.dangerNoun)}</span>` : "") +
        (res.capped ? `<span>${esc(L.resolvedOf(res.resolved, res.total))}</span>` : "");
      $("nav-local-n").textContent = String(res.rows.length);
      renderLocalSummary(res.rows);
      _localRows = res.rows; _allyFilter = null;
      renderLocalRows();
      const top = res.rows.filter((r) => r.danger >= 3).length;
      noteDetection("intel", `${L.pilotsShort(res.rows.length)}${high ? " · " + num(high) + " " + L.dangerNoun : ""}`, top ? "crit" : high ? "warn" : "ok");
    });

    // ── Share the intel + history of generated links ────────────────────────
    const histPanel = $("local-history");  // content of the history view
    // NB: labels are set lazily (in onResult, below) — they depend on `L`.
    let _lastShareUrl = null, _histTimer = null;
    function stopHistTimer() { if (_histTimer) { clearInterval(_histTimer); _histTimer = null; } }

    // Human "23h 59m" / "12m 30s" / "45s" remaining; null when past/invalid.
    function fmtRemain(expMs) {
      let s = Math.floor((Number(expMs) - Date.now()) / 1000);
      if (!Number.isFinite(s) || s <= 0) return null;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    }
    // One share flow for both Local and D-Scan (same DOM shape, different ids / IPC).
    function wireShare(p, invoke) {
      const btn = $(p + "-share"), label = $(p + "-share-label"), out = $(p + "-share-out");
      const msg = $(p + "-share-msg"), urlEl = $(p + "-share-url"), expEl = $(p + "-share-exp"), copyBtn = $(p + "-share-copy");
      let last = null;
      const clearOut = () => { msg.textContent = ""; urlEl.textContent = ""; urlEl.removeAttribute("href"); expEl.textContent = ""; copyBtn.hidden = true; };
      const reset = () => { out.hidden = true; out.classList.remove("err", "pending"); btn.hidden = true; };
      const offer = () => { btn.hidden = false; btn.disabled = false; label.textContent = L.shareBtn; btn.title = L.shareTitle; copyBtn.textContent = L.shareCopy; };
      btn.addEventListener("click", async () => {
        btn.disabled = true; label.textContent = L.sharing;
        // Show the share row immediately with a "processing" placeholder until the server replies.
        out.classList.remove("err"); out.classList.add("pending");
        clearOut(); msg.textContent = L.shareProcessing; out.hidden = false;
        let r;
        try { r = await invoke(); } catch (e) { r = { error: e.message }; }
        btn.disabled = false; label.textContent = L.shareBtn;
        out.classList.remove("pending");
        if (!r || r.error) { out.classList.add("err"); clearOut(); msg.textContent = L.shareErr; out.hidden = false; return; }
        last = r.url;
        msg.textContent = L.shareCopied;
        { const u = safeUrl(r.url); urlEl.textContent = u; if (u) urlEl.href = u; else urlEl.removeAttribute("href"); }
        const rem = fmtRemain(typeof r.expiresAt === "string" ? Date.parse(r.expiresAt) : r.expiresAt);
        expEl.textContent = rem ? L.shareExpires(rem) : "";
        copyBtn.hidden = false; copyBtn.textContent = L.shareCopy;
        out.hidden = false;
        refreshLinkCount();
        if (currentView === "history") renderHistory();   // keep an open history list fresh
      });
      copyBtn.addEventListener("click", () => {
        if (!last) return;
        capsuleers.clipboard.write(last);
        copyBtn.textContent = L.shareCopiedShort;
        setTimeout(() => { copyBtn.textContent = L.shareCopy; }, 1400);
      });
      $(p + "-share-x").addEventListener("click", () => { out.hidden = true; });
      return { reset, offer };
    }
    const localShare = wireShare("local", () => capsuleers.local.share());
    capsuleers.local.onStart(localShare.reset);
    capsuleers.local.onResult((res) => {
      if (res && !res.error && Array.isArray(res.rows) && res.rows.some((r) => r.id)) localShare.offer();
    });

    function tickHistCountdowns() {
      let anyLive = false;
      for (const el of histPanel.querySelectorAll(".lh-exp[data-exp]")) {
        const left = Number(el.dataset.exp) - Date.now();
        const rem = fmtRemain(el.dataset.exp);
        if (rem) {
          anyLive = true; el.textContent = rem;
          el.classList.toggle("soon", left < 3600000);
          const bar = el.parentElement.querySelector(".bar i");
          if (bar) bar.style.width = Math.max(0, Math.min(100, Math.round(left / 864000))) + "%";   // of 24 h
        } else { el.closest(".lh-row")?.remove(); }   // expired mid-view → drop the row
      }
      if (!anyLive) renderHistory();   // list emptied → re-render the empty state
    }

    async function renderHistory() {
      const list = await refreshLinkCount();
      stopHistTimer();
      $("history-clear").hidden = !list.length;
      const head = `<div class="big" style="margin-bottom:22px;"><div class="k"><b class="num">${list.length}</b><span>${esc(L.activeLinks)}</span></div>` +
        `<div class="k"><b class="num">24 h</b><span>${esc(L.linkLifetime)}</span></div></div>`;
      if (!list.length) {
        histPanel.innerHTML = head + `<div class="mut" style="font-size:13px;">${esc(L.historyEmpty)}</div>`;
        return;
      }
      const rows = list.map((e) => {
        const when = new Date(e.createdAt).toLocaleString(SYS_LANG === "it" ? "it-IT" : "en-GB",
          { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
        const kind = e.kind || "intel";
        const count = e.count ?? e.pilotCount;   // back-compat with pre-kind entries
        const label = count != null ? (kind === "dscan" ? L.objectsShort(count) : L.pilotsShort(count)) : "";
        const exp = num(typeof e.expiresAt === "string" ? Date.parse(e.expiresAt) : e.expiresAt);
        return `<tr class="lh-row" data-url="${esc(safeUrl(e.url))}"><td><span class="tag${kind === "dscan" ? " fl" : ""}">${esc(kind === "dscan" ? L.dscanShort : L.intelShort)}</span></td>` +
          `<td style="color:var(--cap-ink);">${esc(label)}</td><td class="mut num">${esc(when)}</td>` +
          `<td style="width:220px;"><span class="lh-bar"><span class="bar"><i style="width:0;background:var(--cap-ok);"></i></span><span class="lh-exp num" data-exp="${exp}"></span></span></td>` +
          `<td class="r"><span class="lh-act"><button class="btn s lh-open" type="button">${ic("ext", 13)}${esc(L.shareOpen)}</button>` +
          `<button class="ib lh-copy" type="button" aria-label="${esc(L.copyLink)}" title="${esc(L.copyLink)}">${ic("copy", 14)}</button></span></td></tr>`;
      }).join("");
      histPanel.innerHTML = head +
        `<table class="t"><thead><tr><th>${esc(L.colType)}</th><th>${esc(L.colContent)}</th><th>${esc(L.colCreated)}</th><th>${esc(L.colValidity)}</th><th class="r">${esc(L.colActions)}</th></tr></thead><tbody>${rows}</tbody></table>`;
      for (const row of histPanel.querySelectorAll(".lh-row")) {
        row.querySelector(".lh-open")?.addEventListener("click", () => {
          const u = safeUrl(row.dataset.url); if (u) window.open(u, "_blank");   // opens in the system browser
        });
        row.querySelector(".lh-copy")?.addEventListener("click", () => {
          const u = safeUrl(row.dataset.url); if (!u) return;
          capsuleers.clipboard.write(u);
          const b = row.querySelector(".lh-copy");
          b.innerHTML = ic("check", 14); setTimeout(() => { b.innerHTML = ic("copy", 14); }, 1400);
        });
      }
      tickHistCountdowns();
      _histTimer = setInterval(tickHistCountdowns, 1000);
    }
    $("history-clear").addEventListener("click", async () => {
      try { await capsuleers.local.history.clear(); } catch { /* */ }
      renderHistory();
    });

    // ── D-Scan analysis ─────────────────────────────────────────────────────
    const dscanBody = $("dscan-body");
    const dscanSub = $("dscan-sub");
    const dsShare = wireShare("dscan", () => capsuleers.local.shareDScan());
    capsuleers.local.onDScanStart(dsShare.reset);   // reset on a fresh analysis
    const dsCat = (name) => (L.dscanCats && L.dscanCats[name]) || name;
    function renderDscanEmpty() {
      dscanSub.innerHTML = "";
      const steps = [[L.dsS1H, L.dsS1T], [L.dsS2H, L.dsS2T], [L.dsS3H, L.dsS3T]]
        .map(([h, t], i) => `<div class="stp"><span class="n">${i + 1}</span><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join("");
      dscanBody.innerHTML = emptyBlock("radar", L.dsEmptyH, L.dsEmptyP, `<div class="stps">${steps}</div>`);
    }
    capsuleers.local.onDScanStart(({ total }) => {
      openDscan();
      dscanSub.innerHTML = `<span>${esc(L.dscanResolving(total))}</span>`;
      dscanBody.innerHTML = `<div class="lprog">${esc(L.dscanAnalyzing)}</div>`;
    });
    capsuleers.local.onDScanResult((res) => {
      openDscan();
      if (!res || res.error) {
        dscanSub.innerHTML = "";
        dscanBody.innerHTML = `<div class="lprog">⚠ ${esc(res?.error || L.noData)}</div>`;
        return;
      }
      dscanSub.innerHTML = `<span><b class="num">${num(res.total)}</b>${esc(L.dscanEntNoun)}</span>` +
        (res.system ? `<span>${esc(L.dscanSystem)} <b style="font-size:14px;">${esc(res.system)}</b></span>` : "");
      $("nav-dscan-n").textContent = String(num(res.total));
      const caps = res.shipClasses.filter((c) => c.capital).reduce((n, c) => n + num(c.count), 0);
      const tile = (n, label, cls) => `<div class="k"><b class="num${cls ? " " + cls : ""}">${num(n)}</b><span>${esc(label)}</span></div>`;
      const tiles = tile(res.shipUnits, L.dscanShips) + tile(caps, L.dsCapitals, "crit") +
        res.other.map((o) => tile(o.count, dsCat(o.name))).join("");
      const mx = Math.max(1, ...res.shipClasses.map((c) => num(c.count)));
      const classes = res.shipClasses.map((c) => {
        const cap = !!c.capital;
        return `<div class="cr"><span${cap ? ' style="color:var(--cap-crit);font-weight:700;"' : ""}>${esc(c.cls)}</span>` +
          `<span class="bar"><i style="width:${Math.round((num(c.count) / mx) * 100)}%;background:${cap ? "var(--cap-crit)" : "var(--cap-accent)"};"></i></span>` +
          `<b class="num"${cap ? ' style="color:var(--cap-crit);"' : ""}>${num(c.count)}</b></div>`;
      }).join("");
      const ships = res.ships.map((s) =>
        `<div class="sr"><img loading="lazy" alt="" src="${IMG}/types/${num(s.typeId)}/icon?size=64"><span>${esc(s.name)}</span><b class="num">×${num(s.count)}</b></div>`).join("");
      dscanBody.innerHTML = (res.shipClasses.length || res.ships.length || res.other.length)
        ? `<div class="sec first"><div class="big">${tiles}</div></div>` +
          `<div class="sec" style="margin-top:22px;flex:1;min-height:0;display:flex;flex-direction:column;"><div class="ds">` +
          `<div><div class="sh"><h2>${esc(L.dscanShipClasses)}</h2><span>${esc(L.dsClasses(res.shipClasses.length))}</span></div>${classes}</div>` +
          `<div><div class="sh"><h2>${esc(L.dscanShips)}</h2><span>${esc(L.dsShipsSub(num(res.shipUnits), res.ships.length))}</span></div><div class="shg">${ships}</div></div>` +
          `</div></div>`
        : `<div class="mut" style="padding:22px 0;font-style:italic;">${esc(L.dscanNone)}</div>`;
      // Offer sharing once we have a real breakdown.
      if (res.total > 0) dsShare.offer();
      noteDetection("dscan", `${res.system ? res.system + " · " : ""}${L.dscanEntities(res.total)}`, caps ? "crit" : "ok");
    });

    // ── Pilot dossier (right-side drawer over the active view) ──────────────
    const pilotOv = $("pilot");
    const pilotCard = $("pilot-card");
    function closePilot() { pilotOv.classList.remove("open"); }
    pilotOv.addEventListener("click", (e) => { if (e.target === pilotOv) closePilot(); });
    const closeBtn = () => `<button class="ib" type="button" data-close aria-label="${esc(L.closeDossier)}" title="${esc(L.closeDossier)}" style="align-self:flex-start;">${ic("x", 14)}</button>`;
    async function openPilot(who) {
      pilotOv.classList.add("open");
      pilotCard.innerHTML = `<div class="dr-h"><div class="dr-id"><span class="lab">${esc(L.dossier)}</span><h2>${esc(who.name || "")}</h2></div>${closeBtn()}</div>` +
        `<div class="dr-msg">${esc(L.loadingIntelOf(who.name || ""))}</div>`;
      pilotCard.querySelector("[data-close]").addEventListener("click", closePilot);
      let d;
      try { d = await capsuleers.local.detail(who); } catch (e) { d = { error: e.message }; }
      if (!pilotOv.classList.contains("open")) return;   // closed while loading
      if (!d || d.error) {
        pilotCard.innerHTML = `<div class="dr-h"><div class="dr-id"><span class="lab">${esc(L.dossier)}</span><h2>${esc(who.name || "")}</h2></div>${closeBtn()}</div>` +
          `<div class="dr-msg">⚠ ${esc(d?.error || L.noData)}</div>`;
        pilotCard.querySelector("[data-close]").addEventListener("click", closePilot);
        return;
      }
      renderPilot(d, who);
    }

    function renderPilot(d, who) {
      const p = d.play || {}; const tot = Math.max(1, num(p.solo) + num(p.small) + num(p.fleet));
      const pct = (v) => Math.round((num(v) / tot) * 100);
      const dg = who && who.danger != null ? Math.min(3, Math.max(0, num(who.danger))) : (d.danger != null ? Math.min(3, Math.max(0, num(d.danger))) : null);
      const org = (kind, id, name) => name
        ? `<span class="dr-o">${id ? `<img class="lg" src="${IMG}/${kind}/${num(id)}/logo?size=32" alt="" />` : ""}<span>${esc(name)}</span></span>` : "";
      const tags = [];
      if (d.capital_pilot) tags.push(`<span class="tag crit">capital</span>`);
      if (d.fc) tags.push(`<span class="tag ${/high/i.test(d.fc) ? "crit" : "warn"}">FC:${esc(d.fc)}</span>`);
      if (d.is_logi) tags.push(`<span class="tag fl">logi</span>`);
      if (d.bait) tags.push(`<span class="tag crit">bait:${esc(d.bait)}</span>`);
      if (dg) tags.push(`<span class="tag ${["", "ok", "warn", "crit"][dg]}">${esc(L.riskWord)} ${esc(L.danger[dg])}</span>`);
      let ring = "";
      if (d.eff != null) {
        const R = 30, C = 2 * Math.PI * R, eff = Math.max(0, Math.min(100, num(d.eff)));
        ring = `<span class="ring" style="width:76px;height:76px;" role="img" aria-label="${esc(L.statEff)} ${eff}%"><svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--cap-crit)" stroke-width="7"/><circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--cap-ok)" stroke-width="7" stroke-dasharray="${(C * eff / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 38 38)"/></svg><b class="num">${eff}%</b></span>`;
      }
      const stat = (v, label, color) => `<div class="k"><b class="num"${color ? ` style="color:${color};"` : ""}>${v}</b><span>${esc(label)}</span></div>`;
      const stats = `<div class="dr-k">${ring}<div class="big" style="gap:26px;">` +
        stat(d.kills != null ? num(d.kills) : "?", L.statKills, "var(--cap-ok)") +
        stat(d.losses != null ? num(d.losses) : "?", L.statLoss, "var(--cap-crit)") +
        (who && who.window ? stat(esc(L.windowDays(num(who.window))), L.statWindow) : "") + `</div></div>`;
      const style = tot > 0 && (p.solo || p.small || p.fleet)
        ? `<div><span class="lab">${esc(L.playStyle)}</span><div class="dist" style="margin-top:9px;">` +
          `<i style="flex:${num(p.solo)};background:var(--cap-c3);"></i><i style="flex:${num(p.small)};background:var(--cap-c2);"></i><i style="flex:${num(p.fleet)};background:var(--cap-c1);"></i></div>` +
          `<div class="ach" style="margin-top:8px;"><span><i class="sw" style="background:var(--cap-c3);"></i>${esc(L.psSolo)} <b class="num">${pct(p.solo)}%</b></span>` +
          `<span><i class="sw" style="background:var(--cap-c2);"></i>${esc(L.psSmall)} <b class="num">${pct(p.small)}%</b></span>` +
          `<span><i class="sw" style="background:var(--cap-c1);"></i>${esc(L.psFleet)} <b class="num">${pct(p.fleet)}%</b></span></div></div>` : "";
      const list = (arr, mkImg, go) => {
        const mx = Math.max(1, ...arr.map((x) => num(x.count)));
        return arr.map((x) => `<div class="dr-r${go ? " go" : ""}"${go ? ` role="button" tabindex="0" data-pilot="${num(x.id)}" data-name="${esc(x.name)}"` : ""}>${mkImg(x)}<span>${esc(x.name)}</span>` +
          `<span class="bar" style="width:90px;"><i style="width:${Math.round((num(x.count) / mx) * 100)}%;background:var(--cap-ink-3);"></i></span><b class="num">${num(x.count)}</b></div>`).join("");
      };
      const partners = (d.partners || []).length
        ? `<div><span class="lab">${esc(L.fliesWith)}</span><div style="margin-top:6px;">${list(d.partners, (x) => `<img class="av" src="${IMG}/characters/${num(x.id)}/portrait?size=32" alt="" width="26" height="26" />`, true)}</div></div>` : "";
      const ships = (d.ships || []).length
        ? `<div><span class="lab">${esc(L.recentShips)}</span><div style="margin-top:6px;">${list(d.ships, (s) => `<img src="${IMG}/types/${num(s.id)}/icon?size=32" alt="" width="26" height="26" />`, false)}</div></div>` : "";

      pilotCard.innerHTML =
        `<div class="dr-h"><img class="dr-p" src="${IMG}/characters/${num(d.id)}/portrait?size=128" alt="" /><div class="dr-id"><span class="lab">${esc(L.dossier)}</span><h2>${esc(d.name)}</h2>` +
          org("alliances", d.allianceId, d.allianceName) + org("corporations", d.corpId, d.corpName) +
          (tags.length ? `<span class="dr-t">${tags.join("")}</span>` : "") + `</div>${closeBtn()}</div>` +
        `<div class="dr-s">${stats}${style}${partners}${ships}</div>` +
        `<div class="dr-f"><button class="btn" type="button" data-url="https://capsuleers.app/${SYS_LANG}/character/${num(d.id)}" title="${esc(L.titleOverview)}">${ic("ext", 14)}${esc(L.lblOverview)}</button>` +
        `<button class="btn" type="button" data-url="https://eve-kill.com/character/${num(d.id)}" title="${esc(L.titlePvp)}">${ic("target", 14)}${esc(L.lblPvp)}</button></div>`;

      pilotCard.querySelector("[data-close]").addEventListener("click", closePilot);
      // Opens external links in the system browser (overview on capsuleers.app, PvP on eve-kill.com).
      for (const a of pilotCard.querySelectorAll("[data-url]")) {
        a.addEventListener("click", () => { const u = safeUrl(a.dataset.url); if (u) window.open(u, "_blank"); });
      }
      // Click on a partner → opens their detail (drill-down).
      for (const c of pilotCard.querySelectorAll("[data-pilot]")) {
        const go = () => openPilot({ id: Number(c.dataset.pilot), name: c.dataset.name });
        c.addEventListener("click", go);
        c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      }
    }

    // Enforce a minimum window width so the titlebar never wraps. Measured from the
    // titlebar's natural content width and pushed to main, which clamps it to the screen.
    function headerMinWidth() {
      const header = document.querySelector("header");
      if (!header) return 0;
      const cs = getComputedStyle(header);
      const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
      const kids = Array.from(header.children);
      let w = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + gap * Math.max(0, kids.length - 1);
      for (const el of kids) w += el.getBoundingClientRect().width;
      return Math.ceil(w + 10);   // small breathing buffer
    }
    let _minWT = null;
    function pushMinWidth() {
      clearTimeout(_minWT);
      _minWT = setTimeout(() => { const w = headerMinWidth(); if (w > 200) capsuleers.win.setMinWidth(w); }, 120);
    }
    pushMinWidth();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(pushMinWidth);

    renderRecent();
    renderLocalEmpty();
    renderDscanEmpty();
    refreshLinkCount();
    showView("home");   // start on the home view (others swap into the same content area)
