// itscass.net — the only script. No dependencies.
// 1. nav tree: [+] markers AND folder names open/close folders (remembered per visitor)
// 2. page switching without reloads: links swap the content in place, back/forward work
// 3. projects index sort + keyword filter, kept in the URL (?sort=new|old|az&kw=cs-education)
// Every page is still a real file and works without it.
(function () {
  "use strict";

  var store = {
    get: function (k, area) {
      try { return JSON.parse((area || localStorage).getItem(k)); } catch (e) { return null; }
    },
    set: function (k, v, area) {
      try { (area || localStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* private mode etc. */ }
    }
  };
  var session = (function () { try { return sessionStorage; } catch (e) { return null; } })();

  var NAV_KEY = "itscass.nav";
  var SORT_KEY = "itscass.sort";
  var SORTS = { "new": 1, old: 1, az: 1 };

  // ---------- 1. nav tree ----------
  // openMap: folder id → open?  Starts from what this visitor last did; folders on the
  // current page's path open automatically (except on phones, where the tree starts collapsed).
  var openMap = store.get(NAV_KEY) || {};
  var firstLoad = true;

  function folderParts(folder) {
    var btn = folder.querySelector(":scope > .row > .tog");
    return { btn: btn, kids: btn && document.getElementById(btn.getAttribute("aria-controls")) };
  }
  function setFolder(folder, open) {
    var p = folderParts(folder);
    if (!p.btn || !p.kids) return;
    p.btn.setAttribute("aria-expanded", String(open));
    p.kids.classList.toggle("closed", !open);
  }
  function remember(id, open) {
    openMap[id] = open;
    store.set(NAV_KEY, openMap);
  }
  function applyNav() {
    var narrow = window.matchMedia("(max-width: 900px)").matches;
    document.querySelectorAll(".tree .folder").forEach(function (folder) {
      var id = folder.getAttribute("data-folder");
      var current = folder.hasAttribute("data-current");
      if (current && !(firstLoad && narrow)) openMap[id] = true;
      setFolder(folder, openMap[id] === true);
    });
    firstLoad = false;
  }
  // Keep the whole nav reachable: if it's taller than the window, stick it by its bottom edge.
  var GAP = 48;
  function fitNav() {
    var side = document.querySelector(".side");
    if (!side) return;
    var top = Math.min(GAP, window.innerHeight - side.offsetHeight - GAP);
    side.style.top = top + "px";
  }
  var navObserver = window.ResizeObserver ? new ResizeObserver(fitNav) : null;
  function watchNav() {
    var side = document.querySelector(".side");
    if (navObserver && side) { navObserver.disconnect(); navObserver.observe(side); }
    fitNav();
  }
  window.addEventListener("resize", fitNav);

  function isOpen(folder) {
    var p = folderParts(folder);
    return !!p.btn && p.btn.getAttribute("aria-expanded") === "true";
  }

  // [+] / [−] markers
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".tree .tog");
    if (!btn) return;
    var folder = btn.closest(".folder");
    var open = !isOpen(folder);
    setFolder(folder, open);
    remember(folder.getAttribute("data-folder"), open);
  });

  // Folder names (projects/, research/ …): a closed folder opens and its page loads;
  // clicking the name of the open folder you're already looking at closes it.
  function folderNameClick(a, e) {
    var folder = a.closest(".folder");
    var here = new URL(a.href, location.href).pathname === location.pathname;
    if (isOpen(folder) && here) {
      e.preventDefault();
      setFolder(folder, false);
      remember(folder.getAttribute("data-folder"), false);
      return true;
    }
    setFolder(folder, true);
    remember(folder.getAttribute("data-folder"), true);
    return false;
  }

  // ---------- sort is kept everywhere ----------
  function withSort(href, sort) {
    var u = new URL(href, location.href);
    if (sort && sort !== "new") u.searchParams.set("sort", sort);
    else u.searchParams.delete("sort");
    return u.pathname + u.search + u.hash;
  }
  // Links to /projects/ index pages carry the visitor's sort; going to another category drops the keyword.
  function updateIndexLinks(sort) {
    document.querySelectorAll("a[data-idx]").forEach(function (a) {
      a.setAttribute("href", withSort(a.getAttribute("href"), sort));
    });
  }
  function rememberedSort() {
    var s = session && store.get(SORT_KEY, session);
    return SORTS[s] ? s : "new";
  }

  // ---------- 3. projects index ----------
  var index = null; // { render } while a projects index page is showing

  function initIndex() {
    index = null;
    var grid = document.getElementById("cards");
    if (!grid) { updateIndexLinks(rememberedSort()); return; }

    var select = document.getElementById("kw");
    var sortBtns = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
    var empty = document.getElementById("empty");
    var status = document.getElementById("status");
    var pathKw = document.getElementById("path-kw");
    var baseTitle = document.title;
    var validKw = {};
    Array.prototype.forEach.call(select.options, function (o) { if (o.value) validKw[o.value] = o.text; });

    var cards = Array.prototype.map.call(grid.querySelectorAll(".readme"), function (el) {
      return {
        el: el,
        start: Number(el.getAttribute("data-start")) || 0,
        title: el.getAttribute("data-title") || "",
        kw: el.getAttribute("data-kw") || ""
      };
    });
    var byTitle = function (a, b) { return a.title.localeCompare(b.title); };
    var compare = {
      "new": function (a, b) { return b.start - a.start || byTitle(a, b); },
      old: function (a, b) { return a.start - b.start || byTitle(a, b); },
      az: byTitle
    };

    function readState() {
      var q = new URLSearchParams(location.search);
      var sort = q.get("sort");
      if (!SORTS[sort]) sort = "new";
      var kw = (q.get("kw") || "").toLowerCase();
      if (!validKw[kw]) kw = "";
      return { sort: sort, kw: kw };
    }

    function render() {
      var s = readState();
      var shown = 0;
      cards.slice().sort(compare[s.sort]).forEach(function (c) {
        grid.appendChild(c.el);
        var match = !s.kw || c.kw.indexOf("|" + s.kw + "|") !== -1;
        c.el.hidden = !match;
        if (match) shown++;
      });
      empty.hidden = shown > 0;
      select.value = s.kw;
      sortBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-sort") === s.sort));
      });
      pathKw.textContent = s.kw ? "#" + s.kw : "";
      document.title = s.kw ? "#" + s.kw + " · " + baseTitle : baseTitle;
      status.textContent = shown + (shown === 1 ? " project" : " projects") + (s.kw ? " tagged " + validKw[s.kw] : "");
      if (session) store.set(SORT_KEY, s.sort, session);
      updateIndexLinks(s.sort);
    }

    function go(change) {
      var s = readState();
      var next = { sort: change.sort || s.sort, kw: "kw" in change ? change.kw : s.kw };
      var q = new URLSearchParams();
      if (next.sort !== "new") q.set("sort", next.sort);
      if (next.kw) q.set("kw", next.kw);
      var qs = q.toString();
      // a keyword keeps the current category page
      history.pushState(null, "", location.pathname + (qs ? "?" + qs : ""));
      render();
    }

    select.addEventListener("change", function () { go({ kw: select.value }); });
    sortBtns.forEach(function (b) {
      b.addEventListener("click", function () { go({ sort: b.getAttribute("data-sort") }); });
    });

    // Arriving with no ?sort but a remembered one: keep it ("sort is kept everywhere").
    var first = new URLSearchParams(location.search);
    var keep = rememberedSort();
    if (!first.get("sort") && keep !== "new") {
      first.set("sort", keep);
      history.replaceState(null, "", location.pathname + "?" + first.toString());
    }
    render();
    index = { render: render };
  }

  // ---------- 2. page switching without reloads ----------
  var shownPath = location.pathname;
  var loading = 0;

  function sameSiteLink(a, e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return false;
    if (/\.(xml|pdf|jpe?g|png|webp|gif|zip)$/i.test(u.pathname)) return false;
    if (u.pathname === location.pathname && u.search === location.search && u.hash) return false; // in-page anchor
    return u;
  }

  function load(url, push) {
    var ticket = ++loading;
    document.documentElement.classList.add("is-loading");
    return fetch(url.href, { headers: { Accept: "text/html" } })
      .then(function (res) {
        if (!res.ok || (res.headers.get("content-type") || "").indexOf("text/html") === -1) throw new Error("not a page");
        return res.text();
      })
      .then(function (html) {
        if (ticket !== loading) return; // a newer click won
        var doc = new DOMParser().parseFromString(html, "text/html");
        var newMain = doc.getElementById("main");
        var newSide = doc.querySelector(".side");
        var oldMain = document.getElementById("main");
        var oldSide = document.querySelector(".side");
        if (!newMain || !newSide || !oldMain || !oldSide) throw new Error("unexpected page");

        if (push) history.pushState(null, "", url.pathname + url.search + url.hash);
        document.title = doc.title;
        var desc = doc.querySelector('meta[name="description"]');
        var myDesc = document.querySelector('meta[name="description"]');
        if (desc && myDesc) myDesc.setAttribute("content", desc.getAttribute("content"));

        oldSide.replaceWith(document.importNode(newSide, true));
        oldMain.replaceWith(document.importNode(newMain, true));
        shownPath = location.pathname;

        applyNav();
        watchNav();
        initIndex();

        if (url.hash && document.getElementById(url.hash.slice(1))) {
          document.getElementById(url.hash.slice(1)).scrollIntoView();
        } else if (push) {
          window.scrollTo(0, 0);
        }
        // move keyboard / screen-reader focus to the new content
        var main = document.getElementById("main");
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      })
      .catch(function () {
        // anything odd (404, network): fall back to a normal page load
        location.href = url.href;
      })
      .then(function () {
        if (ticket === loading) document.documentElement.classList.remove("is-loading");
      });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var u = sameSiteLink(a, e);
    if (!u) return;
    if (a.closest(".tree .folder > .row") && folderNameClick(a, e)) return;
    e.preventDefault();
    if (u.pathname === location.pathname && u.search === location.search) {
      window.scrollTo(0, 0);
      return;
    }
    load(u, true);
  });

  window.addEventListener("popstate", function () {
    if (location.pathname === shownPath) {
      if (index) index.render(); // only ?sort / ?kw changed
      return;
    }
    load(new URL(location.href), false);
  });

  if ("scrollRestoration" in history) history.scrollRestoration = "auto";

  applyNav();
  watchNav();
  initIndex();
})();
