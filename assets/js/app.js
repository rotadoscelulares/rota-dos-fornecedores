(function () {
  "use strict";

  // Login desativado temporariamente: o site agora é entregue como pós-compra
  // (link liberado direto após a compra na Cakto), sem exigir cadastro/login.
  // Para reativar o login, basta voltar este valor para "true"
  // (e reativar REQUIRE_LOGIN em server/server.js também).
  var REQUIRE_LOGIN = false;

  var DATA = window.APP_DATA || { categorias: [], fornecedores: [] };

  var state = {
    search: "",
    categoria: "",
    marca: "",
    produto: "",
    fornecedor: "",
  };

  /* ------------------------------------------------------------------ */
  /* Ícones simples (SVG inline) por categoria                            */
  /* ------------------------------------------------------------------ */
  var ICONS = {
    phone:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" stroke-width="1.7"/><line x1="11" y1="18" x2="13" y2="18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    layers:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 13l9 5 9-5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    bolt:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    grid:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/></svg>',
    box:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5-9 5-9-5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 8v9l9 5 9-5V8" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><line x1="12" y1="13" x2="12" y2="22" stroke="currentColor" stroke-width="1.7"/></svg>',
    chip:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.7"/><line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" stroke-width="1.7"/><line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="1.7"/><line x1="2" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="1.7"/><line x1="17" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.7"/></svg>',
    plug:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0V8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="1.7"/></svg>',
    tool:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2-2 2.6-2.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    users:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="17.5" cy="9" r="2.4" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 20c.3-2.5 1.9-4.2 4.5-4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  };

  var SOCIAL_ICONS = {
    facebook:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 8.5h2V5.3c-.35-.05-1.54-.15-2.94-.15-2.91 0-4.9 1.78-4.9 5.04V13H6.5v3.6h2.66V23h3.68v-6.4h2.55l.4-3.6h-2.95V10.6c0-1.04.28-1.75 1.76-1.75z" fill="currentColor"/></svg>',
    instagram:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
    tiktok:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 3v10.8a3.2 3.2 0 11-2.4-3.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14 3c.5 2.3 2.2 4 4.6 4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    kwai:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 4v16l14-8-14-8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    maps:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-7.4 7-12.6A7 7 0 105 9.4C5 14.6 12 22 12 22z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="9.4" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>',
  };

  function socialIconFor(name) {
    return SOCIAL_ICONS[name] || SOCIAL_ICONS.maps;
  }

  function iconFor(name) {
    return ICONS[name] || ICONS.grid;
  }

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                           */
  /* ------------------------------------------------------------------ */
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function normalize(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function categoriaLabel(id) {
    var cat = DATA.categorias.filter(function (c) { return c.id === id; })[0];
    return cat ? cat.nome : id;
  }

  function categoriaLabels(ids) {
    return (ids || []).map(categoriaLabel);
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function setupShowcaseSlider() {
    var slider = document.querySelector("[data-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slider-dot]"));
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) { slide.classList.toggle("is-active", slideIndex === index); });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-selected", dotIndex === index ? "true" : "false");
      });
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () { showSlide(index + 1); }, 5200);
    }

    slider.querySelector("[data-slider-prev]").addEventListener("click", function () { showSlide(index - 1); restartTimer(); });
    slider.querySelector("[data-slider-next]").addEventListener("click", function () { showSlide(index + 1); restartTimer(); });
    dots.forEach(function (dot) { dot.addEventListener("click", function () { showSlide(Number(dot.dataset.sliderDot)); restartTimer(); }); });
    restartTimer();
  }

  /* ------------------------------------------------------------------ */
  /* Renderização — Categorias                                            */
  /* ------------------------------------------------------------------ */
  function renderCategories() {
    var grid = document.getElementById("categoriesGrid");
    if (!grid) return;
    grid.innerHTML = "";
    DATA.categorias.forEach(function (cat) {
      var card = el(
        '<button type="button" class="category-card card" role="listitem" data-category="' +
          cat.id +
          '">' +
          '<span class="category-icon">' + iconFor(cat.icone) + "</span>" +
          "<h3>" + cat.nome + "</h3>" +
          "<p>" + cat.descricao + "</p>" +
          "</button>"
      );
      card.addEventListener("click", function () {
        state.categoria = state.categoria === cat.id ? "" : cat.id;
        syncSelect("filterCategoria", state.categoria);
        applyFilters();
        markActiveCategory();
        document.getElementById("fornecedores").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      grid.appendChild(card);
    });
    observeEntrance(grid.querySelectorAll(".category-card"));
  }

  // Versão da página inicial: cada categoria é só um link para fornecedores.html.
  function renderCategoriesHome() {
    var grid = document.getElementById("categoriesGridHome");
    if (!grid) return;
    grid.innerHTML = "";
    DATA.categorias.forEach(function (cat) {
      var card = el(
        '<a href="fornecedores.html" class="category-card card" role="listitem">' +
          '<span class="category-icon">' + iconFor(cat.icone) + "</span>" +
          "<h3>" + cat.nome + "</h3>" +
          "<p>" + cat.descricao + "</p>" +
          "</a>"
      );
      grid.appendChild(card);
    });
    observeEntrance(grid.querySelectorAll(".category-card"));
  }

  function markActiveCategory() {
    document.querySelectorAll(".category-card").forEach(function (card) {
      card.classList.toggle("is-active", card.getAttribute("data-category") === state.categoria);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Renderização — Fornecedores                                          */
  /* ------------------------------------------------------------------ */
  function supplierMatchesFilters(f) {
    var s = normalize(state.search);
    var searchable = normalize(
      [f.nome, f.especialidade]
        .concat(categoriaLabels(f.categorias))
        .concat(f.produtos || [])
        .concat(f.marcas || [])
        .join(" ")
    );
    if (s && searchable.indexOf(s) === -1) return false;
    if (state.categoria && (f.categorias || []).indexOf(state.categoria) === -1) return false;
    if (state.marca && (f.marcas || []).indexOf(state.marca) === -1) return false;
    if (state.produto && (f.produtos || []).indexOf(state.produto) === -1) return false;
    if (state.fornecedor && f.nome !== state.fornecedor) return false;
    return true;
  }

  function initials(name) {
    var parts = (name || "").trim().split(/\s+/).filter(Boolean);
    var first = parts[0] ? parts[0][0] : "";
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  function whatsappUrl(number) {
    return "https://wa.me/" + number.replace(/\D/g, "");
  }

  /**
   * Constrói um botão/link de ação com estado pendente automático quando a
   * URL não está disponível ainda (ex.: link de comunidade ou WhatsApp).
   */
  function buildActionMarkup(url, label, pendingLabel, extraClass) {
    var pendente = !url;
    var attrs = pendente
      ? ' type="button" data-pending="true" aria-disabled="true"'
      : ' href="' + url + '" target="_blank" rel="noopener noreferrer"';
    var tag = pendente ? "button" : "a";
    return {
      html:
        "<" + tag + ' class="btn ' + extraClass + '"' + attrs + ">" +
        (pendente ? pendingLabel : label) +
        "</" + tag + ">",
      pendente: pendente,
    };
  }

  function wireActionButton(card, selector, pendingMessage) {
    var btn = card.querySelector(selector);
    if (!btn) return;
    if (btn.hasAttribute("data-pending")) {
      btn.addEventListener("click", function () {
        showToast(pendingMessage);
      });
    } else {
      btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        var href = btn.getAttribute("href");
        btn.classList.add("is-loading");
        window.setTimeout(function () {
          btn.classList.remove("is-loading");
          window.open(href, "_blank", "noopener");
        }, 500);
      });
    }
  }

  /**
   * Renderiza uma barra com um botão por comunidade quando o fornecedor tem
   * múltiplos links (cada um com seu próprio título), em vez de um único botão.
   */
  function buildCommunityBarMarkup(comunidades) {
    return (
      '<div class="community-bar" role="list">' +
      comunidades
        .map(function (c, i) {
          return (
            '<a class="btn btn-secondary community-pill" role="listitem" data-community-index="' +
            i +
            '" href="' +
            c.link +
            '" target="_blank" rel="noopener noreferrer">' +
            c.titulo +
            "</a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function wireCommunityBar(card, supplierName) {
    card.querySelectorAll(".community-pill").forEach(function (link) {
      link.addEventListener("click", function (evt) {
        evt.preventDefault();
        var href = link.getAttribute("href");
        link.classList.add("is-loading");
        window.setTimeout(function () {
          link.classList.remove("is-loading");
          window.open(href, "_blank", "noopener");
        }, 500);
      });
    });
  }

  function renderSupplierCard(f) {
    var verifiedBadge = f.verificado
      ? '<span class="badge-verified">✓ Verificado</span>'
      : "";
    var modelBadge = f.modelo ? '<span class="badge-model">Modelo</span>' : "";

    var tags = (f.marcas || [])
      .map(function (m) { return '<span class="tag">' + m + "</span>"; })
      .join("");

    var avatar = f.foto
      ? '<img class="supplier-avatar" src="' + f.foto + '" alt="Foto de perfil de ' + f.nome + '" width="48" height="48" />'
      : '<span class="supplier-avatar supplier-avatar-fallback" aria-hidden="true">' + initials(f.nome) + "</span>";

    var comunidadeNota = f.comunidadeMensagem
      ? '<p class="supplier-note">\u201c' + f.comunidadeMensagem + '\u201d</p>'
      : "";

    var temMultiplasComunidades = Array.isArray(f.comunidades) && f.comunidades.length > 0;
    var comunidadeAction = temMultiplasComunidades
      ? null
      : buildActionMarkup(f.linkComunidade, "Acessar comunidade", "Link em breve", "btn-primary supplier-action-comunidade");
    var comunidadeMarkup = temMultiplasComunidades
      ? buildCommunityBarMarkup(f.comunidades)
      : comunidadeAction.html;
    var whatsappAction = buildActionMarkup(
      f.whatsapp ? whatsappUrl(f.whatsapp) : null,
      "Chamar no WhatsApp",
      "WhatsApp em breve",
      "btn-secondary supplier-action-whatsapp"
    );

    var card = el(
      '<article class="supplier-card card" role="listitem" data-supplier="' + f.id + '">' +
        '<div class="supplier-card-header">' +
          avatar +
          "<div class=\"supplier-heading\">" +
            '<p class="supplier-name">' + f.nome + "</p>" +
            '<p class="supplier-specialty">' + f.especialidade + "</p>" +
          "</div>" +
          '<div class="supplier-badges">' +
            verifiedBadge + modelBadge +
          "</div>" +
        "</div>" +
        '<div class="supplier-meta">' +
          '<div class="supplier-meta-row"><span class="supplier-meta-label">Produtos</span><span class="supplier-meta-value">' + (f.produtos || []).join(", ") + '</span></div>' +
          '<div class="supplier-meta-row"><span class="supplier-meta-label">Localização</span><span class="supplier-meta-value">' + (f.localizacao || "A definir") + '</span></div>' +
        "</div>" +
        '<div class="supplier-tags">' + tags + "</div>" +
        comunidadeNota +
        '<div class="supplier-actions">' + whatsappAction.html + comunidadeMarkup + "</div>" +
      "</article>"
    );

    if (temMultiplasComunidades) {
      wireCommunityBar(card, f.nome);
    } else {
      wireActionButton(card, ".supplier-action-comunidade", "O link da comunidade de \u201c" + f.nome + "\u201d ainda n\u00e3o foi configurado.");
    }
    wireActionButton(card, ".supplier-action-whatsapp", "O WhatsApp de \u201c" + f.nome + "\u201d ainda n\u00e3o foi configurado.");

    return card;
  }

  function renderSuppliers() {
    var grid = document.getElementById("suppliersGrid");
    var emptyState = document.getElementById("emptyState");
    var resultsCount = document.getElementById("resultsCount");
    if (!grid || !emptyState || !resultsCount) return;
    grid.innerHTML = "";

    var results = DATA.fornecedores.filter(supplierMatchesFilters);

    results.forEach(function (f) {
      grid.appendChild(renderSupplierCard(f));
    });

    emptyState.hidden = results.length !== 0;
    resultsCount.textContent =
      results.length === 1
        ? "1 fornecedor encontrado"
        : results.length + " fornecedores encontrados";

    observeEntrance(grid.querySelectorAll(".supplier-card"));
  }

  function applyFilters() {
    renderSuppliers();
  }

  /* ------------------------------------------------------------------ */
  /* Filtros — popular selects a partir dos dados                        */
  /* ------------------------------------------------------------------ */
  function uniqueSorted(list) {
    var seen = {};
    var out = [];
    list.forEach(function (v) {
      if (v && !seen[v]) {
        seen[v] = true;
        out.push(v);
      }
    });
    return out.sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
  }

  function fillSelect(id, values, currentValueKey) {
    var select = document.getElementById(id);
    if (!select) return;
    values.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = typeof v === "object" ? v.value : v;
      opt.textContent = typeof v === "object" ? v.label : v;
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      state[currentValueKey] = select.value;
      applyFilters();
    });
  }

  function syncSelect(id, value) {
    var select = document.getElementById(id);
    if (select) select.value = value;
  }

  function setupFilters() {
    if (!document.getElementById("searchInput")) return;
    fillSelect(
      "filterCategoria",
      DATA.categorias.map(function (c) { return { value: c.id, label: c.nome }; }),
      "categoria"
    );

    var todasMarcas = [];
    var todosProdutos = [];
    var todosFornecedores = [];
    DATA.fornecedores.forEach(function (f) {
      todasMarcas = todasMarcas.concat(f.marcas || []);
      todosProdutos = todosProdutos.concat(f.produtos || []);
      todosFornecedores.push(f.nome);
    });

    fillSelect("filterMarca", uniqueSorted(todasMarcas), "marca");
    fillSelect("filterProduto", uniqueSorted(todosProdutos), "produto");
    fillSelect("filterFornecedor", uniqueSorted(todosFornecedores), "fornecedor");

    document.getElementById("searchInput").addEventListener("input", function (evt) {
      state.search = evt.target.value;
      applyFilters();
    });

    document.getElementById("clearFilters").addEventListener("click", function () {
      state = { search: "", categoria: "", marca: "", produto: "", fornecedor: "" };
      document.getElementById("searchInput").value = "";
      ["filterCategoria", "filterMarca", "filterProduto", "filterFornecedor"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      markActiveCategory();
      applyFilters();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Menu mobile                                                          */
  /* ------------------------------------------------------------------ */
  function setupMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.hidden = expanded;
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.hidden = true;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Links pendentes (suporte / rodapé)                                   */
  /* ------------------------------------------------------------------ */
  function setupPendingLinks() {
    document.querySelectorAll(".pending-link").forEach(function (link) {
      link.setAttribute("data-pending", "true");
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", function (evt) {
        evt.preventDefault();
        var label = link.getAttribute("data-pending-label") || link.textContent.trim();
        showToast("\u201c" + label + "\u201d ainda n\u00e3o possui link configurado.");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Animação de entrada                                                  */
  /* ------------------------------------------------------------------ */
  var observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        )
      : null;

  function observeEntrance(nodeList) {
    if (!observer) {
      nodeList.forEach(function (node) { node.classList.add("in-view"); });
      return;
    }
    nodeList.forEach(function (node) { observer.observe(node); });
  }

  /* ------------------------------------------------------------------ */
  /* Dados oficiais da empresa (rodapé)                                   */
  /* ------------------------------------------------------------------ */
  function wireLoadingLink(link) {
    link.addEventListener("click", function (evt) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      evt.preventDefault();
      link.classList.add("is-loading");
      window.setTimeout(function () {
        link.classList.remove("is-loading");
        window.open(href, "_blank", "noopener");
      }, 500);
    });
  }

  function renderEmpresaInfo() {
    var empresa = DATA.empresa;
    if (!empresa) return;

    var addressEl = document.getElementById("footerAddress");
    if (addressEl && empresa.endereco) {
      var e = empresa.endereco;
      addressEl.innerHTML =
        e.logradouro + "<br>" +
        e.cidade + " - " + e.estado + ", CEP " + e.cep + "<br>" +
        e.pais +
        (e.googleMaps
          ? ' · <a href="' + e.googleMaps + '" target="_blank" rel="noopener noreferrer" class="footer-map-link">Ver no mapa</a>'
          : "");
    }

    var cnpjEl = document.getElementById("footerCnpj");
    if (cnpjEl && empresa.cnpj) {
      cnpjEl.textContent = "CNPJ: " + empresa.cnpj;
    }

    var socialEl = document.getElementById("footerSocialIcons");
    if (socialEl && empresa.redesSociais) {
      empresa.redesSociais.forEach(function (rede) {
        var link = el(
          '<a class="social-icon-btn" role="listitem" href="' + rede.url + '" target="_blank" rel="noopener noreferrer" aria-label="' + rede.nome + '">' +
            socialIconFor(rede.icone) +
          "</a>"
        );
        socialEl.appendChild(link);
      });
    }

    if (empresa.whatsapp) {
      ["supportWhatsappLink", "footerWhatsappLink"].forEach(function (id) {
        var link = document.getElementById(id);
        if (!link) return;
        link.setAttribute("href", empresa.whatsapp);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        wireLoadingLink(link);
      });
    }

    if (empresa.suportePosCompra && empresa.suportePosCompra.whatsapp) {
      var humanLink = document.getElementById("humanSupportWhatsappLink");
      if (humanLink) {
        humanLink.setAttribute("href", empresa.suportePosCompra.whatsapp);
        humanLink.setAttribute("target", "_blank");
        humanLink.setAttribute("rel", "noopener noreferrer");
        wireLoadingLink(humanLink);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Header din\u00e2mico (Entrar / Sair) e \u00e1rea de login travada no home    */
  /* ------------------------------------------------------------------ */
  function atualizarNavAuth(usuarioLogado) {
    [document.getElementById("navAuthLink"), document.getElementById("navAuthLinkMobile")].forEach(function (link) {
      if (!link) return;
      if (usuarioLogado) {
        link.textContent = "Sair";
        link.setAttribute("href", "#");
        link.onclick = async function (evt) {
          evt.preventDefault();
          await window.AUTH.logout();
          window.location.href = "index.html";
        };
      } else {
        link.textContent = "Entrar";
        link.setAttribute("href", "login.html");
        link.onclick = null;
      }
    });
  }

  // Esconde os links "Entrar" do menu enquanto o login estiver desativado.
  function esconderNavAuth() {
    [document.getElementById("navAuthLink"), document.getElementById("navAuthLinkMobile")].forEach(function (link) {
      if (!link) return;
      var item = link.closest("li");
      (item || link).hidden = true;
    });
  }

  function wireLoginGateForm() {
    var form = document.getElementById("formLoginGate");
    if (!form) return;
    var erroEl = document.getElementById("gateErro");

    form.addEventListener("submit", async function (evt) {
      evt.preventDefault();
      erroEl.hidden = true;
      var dados = {
        email: document.getElementById("gateEmail").value.trim(),
        senha: document.getElementById("gateSenha").value,
      };
      var submitBtn = form.querySelector("button[type=submit]");
      submitBtn.classList.add("is-loading");
      var resposta = await window.AUTH.login(dados);
      submitBtn.classList.remove("is-loading");

      if (!resposta.ok) {
        erroEl.textContent = resposta.erro || "N\u00e3o foi poss\u00edvel entrar.";
        erroEl.hidden = false;
        return;
      }
      await iniciarConteudoProtegido();
    });
  }

  /**
   * Em p\u00e1ginas com \u00e1rea travada (ex.: index.html), verifica login e s\u00f3
   * libera busca/categorias/fornecedores depois de autenticado.
   */
  async function iniciarConteudoProtegido() {
    var gate = document.getElementById("loginGate");
    var conteudo = document.getElementById("gatedContent");

    if (!REQUIRE_LOGIN) {
      // Catálogo liberado direto, sem exigir login (ver REQUIRE_LOGIN acima).
      esconderNavAuth();
      if (gate) gate.hidden = true;
      if (!conteudo) return;
      conteudo.hidden = false;

      // Dados já vêm embutidos em assets/js/data.js — nenhuma chamada ao
      // backend é necessária para o catálogo público (site 100% estático).
      renderCategories();
      setupFilters();
      renderSuppliers();
      return;
    }

    if (!gate || !conteudo) {
      // Página sem área travada (ex.: central de ajuda) — só atualiza o menu.
      if (window.AUTH) {
        var resp = await window.AUTH.me();
        atualizarNavAuth(resp.ok);
      }
      return;
    }

    var resposta = await window.AUTH.me();
    if (!resposta.ok) {
      gate.hidden = false;
      conteudo.hidden = true;
      atualizarNavAuth(false);
      return;
    }

    var [catRes, fornRes] = await Promise.all([window.AUTH.categorias(), window.AUTH.fornecedores()]);
    if (catRes.ok) DATA.categorias = catRes.categorias;
    if (fornRes.ok) DATA.fornecedores = fornRes.fornecedores;

    gate.hidden = true;
    conteudo.hidden = false;
    atualizarNavAuth(true);

    renderCategories();
    setupFilters();
    renderSuppliers();
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupPendingLinks();
    renderEmpresaInfo();
    setupShowcaseSlider();
    renderCategoriesHome();
    wireLoginGateForm();
    if (window.AUTH) iniciarConteudoProtegido();
  });
})();
