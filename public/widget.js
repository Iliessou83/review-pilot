/*!
 * Caela Réputation — widget d'avis embeddable.
 * Usage sur le site du commerçant :
 *   <div data-caela-widget="123"></div>
 *   <script src="https://review-pilot-iota.vercel.app/widget.js" async></script>
 * Options sur le div : data-theme="light|dark", data-layout="grid|row", data-max="6".
 */
(function () {
  "use strict";

  // Base d'origine = celle d'où ce script est servi (marche quel que soit le domaine).
  function scriptBase() {
    var cur = document.currentScript;
    if (cur && cur.src) return new URL(cur.src).origin;
    var all = document.getElementsByTagName("script");
    for (var i = 0; i < all.length; i++) {
      if (all[i].src && all[i].src.indexOf("widget.js") !== -1) {
        return new URL(all[i].src).origin;
      }
    }
    return "";
  }
  var BASE = scriptBase();

  var STAR = "★", STAR_O = "☆";
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c];
    });
  }
  function starsHtml(rating, color) {
    var full = Math.round(rating);
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<span style="color:' + (i <= full ? color : "#d0d0d0") + '">' + (i <= full ? STAR : STAR_O) + "</span>";
    }
    return out;
  }
  function relDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  function render(el, data) {
    var dark = el.getAttribute("data-theme") === "dark";
    var layout = el.getAttribute("data-layout") === "row" ? "row" : "grid";
    var max = parseInt(el.getAttribute("data-max") || "6", 10);
    if (isNaN(max) || max < 1) max = 6;

    var bg = dark ? "#16181d" : "#ffffff";
    var card = dark ? "#1f2228" : "#ffffff";
    var border = dark ? "#2c2f36" : "#e6e8eb";
    var text = dark ? "#f1f3f5" : "#202124";
    var muted = dark ? "#9aa0a6" : "#5f6368";
    var gold = "#FBBC04";
    var blue = "#1A73E8";

    var reviews = (data.reviews || []).slice(0, max);
    var cardsCss = layout === "row"
      ? "display:flex;gap:14px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;"
      : "display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));";

    var html = "";
    html += '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:' + bg + ';color:' + text + ';border:1px solid ' + border + ';border-radius:16px;padding:22px 22px 18px;max-width:100%;box-sizing:border-box;">';
    // En-tête : note globale
    html += '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px;">';
    html += '<div style="font-size:38px;font-weight:800;line-height:1;">' + (data.avgRating || 0).toFixed(1) + "</div>";
    html += '<div><div style="font-size:20px;letter-spacing:1px;">' + starsHtml(data.avgRating || 0, gold) + "</div>";
    html += '<div style="font-size:13px;color:' + muted + ';margin-top:3px;">' + (data.totalCount || 0) + " avis · " + esc(data.businessName || "") + "</div></div>";
    html += "</div>";
    // Cartes d'avis
    if (reviews.length) {
      html += '<div style="' + cardsCss + '">';
      for (var i = 0; i < reviews.length; i++) {
        var r = reviews[i];
        var cardW = layout === "row" ? "min-width:240px;max-width:280px;flex:0 0 auto;" : "";
        html += '<div style="' + cardW + 'background:' + card + ';border:1px solid ' + border + ';border-radius:12px;padding:14px 15px;">';
        html += '<div style="font-size:15px;letter-spacing:1px;margin-bottom:7px;">' + starsHtml(r.rating, gold) + "</div>";
        html += '<div style="font-size:13px;line-height:1.55;color:' + text + ';margin-bottom:10px;">' + esc(r.text) + "</div>";
        html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:' + muted + ';">';
        html += "<span style=\"font-weight:600;\">" + esc(r.author) + "</span><span>" + esc(relDate(r.date)) + "</span></div>";
        html += "</div>";
      }
      html += "</div>";
    }
    // Pied
    html += '<div style="margin-top:16px;text-align:right;font-size:11px;color:' + muted + ';">Avis vérifiés via <a href="' + BASE + '" target="_blank" rel="noopener" style="color:' + blue + ';text-decoration:none;">Caela Réputation</a></div>';
    html += "</div>";

    el.innerHTML = html;
  }

  // Injecte le JSON-LD AggregateRating dans la page hôte (étoiles dans Google).
  function injectJsonLd(data, id) {
    if (!data.totalCount || !data.avgRating) return;
    var tagId = "caela-jsonld-" + id;
    if (document.getElementById(tagId)) return;
    var ld = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: data.businessName,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.avgRating,
        reviewCount: data.totalCount,
        bestRating: 5,
        worstRating: 1,
      },
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = tagId;
    s.text = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  function init() {
    var nodes = document.querySelectorAll("[data-caela-widget]");
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        if (el.getAttribute("data-caela-loaded")) return;
        el.setAttribute("data-caela-loaded", "1");
        var id = el.getAttribute("data-caela-widget");
        if (!id) return;
        el.innerHTML = '<div style="font-family:system-ui,sans-serif;color:#9aa0a6;font-size:13px;padding:14px;">Chargement des avis…</div>';
        fetch(BASE + "/api/widget/" + encodeURIComponent(id))
          .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
          .then(function (data) {
            render(el, data);
            injectJsonLd(data, id);
          })
          .catch(function () {
            el.innerHTML = "";
          });
      })(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
