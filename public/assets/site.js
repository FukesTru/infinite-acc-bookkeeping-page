/* Infinite Accounting Services: shared script. The site reads and works without it;
   this adds menus, smooth contact scrolling, the form, the chat panel and scroll movement. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Built-in contact form settings.
     When the CRM form embed code arrives, it replaces the built-in form on
     every page and this block is no longer used.
     LEAD_ENDPOINT: a URL that accepts a POST of the form fields (for example
     a Formspree, Basin, Zapier or Make webhook) and emails the business and
     texts the lead-notification cell number. Leave empty and the form offers
     to open an email to the business instead, so no message is ever lost.
     ------------------------------------------------------------------ */
  var LEAD_ENDPOINT = "";
  var LEAD_EMAIL = "danielle@infiniteaccountingservices.com";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mark the current page in the menus (the header is identical on every page). */
  var here = location.pathname.replace(/index\.html$/, "");
  if (here.slice(-1) !== "/") here += "/";
  document.querySelectorAll(".site-header a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here) a.setAttribute("aria-current", "page");
  });

  /* Header shadow once the page scrolls. */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Desktop dropdowns: hover and focus open them in CSS; this adds click and Escape. */
  document.querySelectorAll(".has-dropdown").forEach(function (li) {
    var btn = li.querySelector(".nav-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    li.addEventListener("mouseenter", function () { btn.setAttribute("aria-expanded", "true"); });
    li.addEventListener("mouseleave", function () { li.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); });
    li.addEventListener("focusout", function (e) {
      if (!li.contains(e.relatedTarget)) { li.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
    });
  });

  /* Mobile menu (a <details>): close on Escape and after choosing a link. */
  var menu = document.querySelector(".menu-mobile");
  function closeMenu() { if (menu && menu.open) { menu.open = false; doc.style.overflow = ""; doc.classList.remove("menu-open"); } }
  if (menu) {
    menu.addEventListener("toggle", function () {
      doc.style.overflow = menu.open ? "hidden" : "";
      doc.classList.toggle("menu-open", menu.open);
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* Every "Contact us" link lands with the whole form in the middle of the screen. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href="#contact"]');
    if (!a) return;
    var form = document.getElementById("contact-form");
    if (!form) return;
    e.preventDefault();
    closeMenu();
    closeChat();
    /* Centre the form between the sticky header and the phone buttons; if it is taller
       than that space, put its top just under the header so nothing is cut off at the top. */
    var headerH = header ? header.offsetHeight : 0;
    var bar = document.querySelector(".mobile-bar");
    var barH = bar && getComputedStyle(bar).display !== "none" ? bar.offsetHeight : 0;
    var room = window.innerHeight - headerH - barH;
    /* offsetTop ignores the fade-up transform, so the target is right even mid-animation */
    var top = 0;
    for (var el = form; el; el = el.offsetParent) top += el.offsetTop;
    var h = form.offsetHeight;
    var target = top - headerH - (h < room ? (room - h) / 2 : 12);
    window.scrollTo({ top: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", "#contact");
    var first = form.querySelector("input:not([type=hidden]):not([tabindex='-1'])");
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  });

  /* CRM form and chat widget. Their code sits in <template> tags exactly as given and is switched on
     when it is needed, so pages load fast and no third-party cookies are set before a visitor does
     anything (Lighthouse's "facade" advice for chat widgets and embeds). The chat starts at the first
     scroll, tap, key press or mouse move, or 10 seconds after the page loads. The form starts when
     it comes near the screen once the chat gate is open, or straight away when someone heads for it. */
  var crmReady = false;
  var crmForms = [];
  function crmActivate(t) {
    if (!t || t.getAttribute("data-on")) return;
    t.setAttribute("data-on", "1");
    t.parentNode.insertBefore(document.importNode(t.content, true), t);
    var note = t.parentNode.querySelector("div.form-loading");
    if (note) note.remove();
  }
  function crmNear(t) {
    var r = t.parentNode.getBoundingClientRect();
    return r.top < window.innerHeight + 800 && r.bottom > -800;
  }
  function crmCheckForms() { crmForms.forEach(function (t) { if (crmReady && crmNear(t)) crmActivate(t); }); }
  function crmOpen() {
    if (crmReady) return;
    crmReady = true;
    crmActivate(document.querySelector('template[data-crm="chat"]'));
    crmCheckForms();
    ["scroll", "pointerdown", "keydown", "touchstart", "mousemove"].forEach(function (ev) { window.removeEventListener(ev, crmOpen, { passive: true }); });
  }
  crmForms = Array.prototype.slice.call(document.querySelectorAll('template[data-crm="form"]'));
  if (crmForms.length || document.querySelector('template[data-crm="chat"]')) {
    ["scroll", "pointerdown", "keydown", "touchstart", "mousemove"].forEach(function (ev) { window.addEventListener(ev, crmOpen, { passive: true }); });
    window.addEventListener("load", function () { setTimeout(crmOpen, 10000); });
    window.addEventListener("scroll", crmCheckForms, { passive: true });
    /* The placeholder's button opens the form at once (for anyone who has not scrolled or tapped yet). */
    document.querySelectorAll(".form-open").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var t = btn.closest(".form-embed").querySelector('template[data-crm="form"]');
        crmOpen(); crmActivate(t);
      });
    });
    /* Anyone heading for the form gets it at once. */
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest('a[href="#contact"]')) { crmOpen(); crmForms.forEach(crmActivate); }
    }, true);
  }

  /* CRM chat widget. While its greeting bubble shows, the widget's invisible box stretches from the
     bubble down to the bottom corner and would block taps on the Contact us button beside it. Let
     taps pass through that empty part; the chat button and the bubble stay tappable. The embed
     code itself is untouched. */
  var chatTries = 0;
  var chatFix = setInterval(function () {
    var cw = document.querySelector("chat-widget");
    var root = cw && cw.shadowRoot;
    var box = root && root.getElementById("lc_text-widget");
    if (box && !root.getElementById("site-chat-hit-area")) {
      var st = document.createElement("style");
      st.id = "site-chat-hit-area";
      st.textContent = "#lc_text-widget{pointer-events:none}#lc_text-widget>*{pointer-events:auto}";
      root.appendChild(st);
    }
    if (box || ++chatTries > 60) clearInterval(chatFix);
  }, 500);

  /* Built-in chat panel. It sends nothing anywhere: it offers call, text and the form. */
  var chatBtn = document.querySelector(".chat-launcher");
  var chatPanel = document.getElementById("chat-panel");
  function closeChat() {
    if (chatPanel && !chatPanel.hidden) { chatPanel.hidden = true; if (chatBtn) chatBtn.setAttribute("aria-expanded", "false"); }
  }
  if (chatBtn && chatPanel) {
    chatBtn.addEventListener("click", function () {
      var open = chatPanel.hidden;
      chatPanel.hidden = !open;
      chatBtn.setAttribute("aria-expanded", String(open));
      if (open) { var f = chatPanel.querySelector("a, button"); if (f) f.focus(); }
    });
    var closeX = chatPanel.querySelector(".chat-close");
    if (closeX) closeX.addEventListener("click", function () { closeChat(); chatBtn.focus(); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeChat();
    closeMenu();
    document.querySelectorAll(".has-dropdown.is-open").forEach(function (li) {
      li.classList.remove("is-open");
      var b = li.querySelector(".nav-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  });

  /* Scroll movement: sections ease in as they come into view. */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Blog category filter (all posts stay listed without scripts). */
  var chips = document.querySelector(".chips");
  if (chips) {
    chips.hidden = false;
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      chips.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var cat = b.getAttribute("data-cat");
      document.querySelectorAll("[data-post-cat]").forEach(function (card) {
        card.hidden = cat !== "all" && card.getAttribute("data-post-cat") !== cat;
      });
    });
  }

  /* Built-in contact form (not used once the CRM form embed is on the page). */
  var form = document.querySelector("form#contact-form");
  if (form) {
    form.noValidate = true; /* our own messages replace the browser's */
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("button[type=submit]");
    function show(kind, html) {
      status.className = "form-status form-status--" + kind;
      status.innerHTML = html;
      status.hidden = false;
      status.focus();
    }
    function setError(name, msg) {
      var input = form.elements[name];
      var err = document.getElementById("err-" + name);
      if (!input || !err) return;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      err.textContent = msg || "";
      err.hidden = !msg;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim();
      var email = f.email.value.trim();
      var phone = f.phone.value.trim();
      var ok = true;
      setError("name", name ? "" : "Please enter your name.");
      if (!name) ok = false;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setError("email", emailOk ? "" : "Please enter an email address we can reply to.");
      if (!emailOk) ok = false;
      setError("consent", f.consent.checked ? "" : "Please tick the box so we can reply to you.");
      if (!f.consent.checked) ok = false;
      if (!ok) {
        var bad = form.querySelector('[aria-invalid="true"]');
        if (bad) bad.focus();
        return;
      }
      if (f.company_site && f.company_site.value) { show("ok", "Thank you. We will be in touch soon."); form.reset(); return; }

      var data = {
        name: name, email: email, phone: phone,
        service: f.service.value, town: f.town.value, message: f.message.value.trim(),
        consent: "yes", page: location.pathname, sent_at: new Date().toISOString()
      };

      if (!LEAD_ENDPOINT) {
        var body = "Name " + data.name + "\nEmail " + data.email + "\nPhone " + (data.phone || "not given") +
          "\nHelp with " + data.service + "\nTown " + (data.town || "not given") + "\n\n" + data.message;
        var mailto = "mailto:" + LEAD_EMAIL + "?subject=" + encodeURIComponent("Website inquiry from " + data.name) +
          "&body=" + encodeURIComponent(body);
        show("info", 'Your message is ready to send. <a href="' + mailto + '">Open it in your email app</a> and press send, or call or text us at <a href="tel:+17082323003">(708) 232-3003</a>.');
        return;
      }

      submit.disabled = true;
      var params = new URLSearchParams(data);
      fetch(LEAD_ENDPOINT, { method: "POST", body: params, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          show("ok", "Thank you, " + data.name.split(" ")[0] + ". Your message is on its way. We will reply as soon as we can during office hours.");
          form.reset();
        })
        .catch(function () {
          show("error", 'Sorry, your message did not send. Please call or text us at <a href="tel:+17082323003">(708) 232-3003</a>, or email <a href="mailto:' + LEAD_EMAIL + '">' + LEAD_EMAIL + "</a>.");
        })
        .then(function () { submit.disabled = false; });
    });
  }
})();
