"use strict";

/**
 * Dados públicos da plataforma Rota dos Celulares 66 (usados no rodapé em
 * todas as páginas, inclusive antes do login).
 *
 * O catálogo de categorias e fornecedores NÃO fica mais aqui — agora só é
 * carregado após login, via /api/categorias e /api/fornecedores (ver
 * server/catalogo.js e assets/js/app.js).
 */
window.APP_DATA = {
  empresa: {
    nome: "Rota dos Celulares 66",
    cnpj: "54.637.507/0001-80",
    endereco: {
      logradouro: "Avenida Brasil, 89A",
      cidade: "Nova Canaã do Norte",
      estado: "MT",
      cep: "78515-000",
      pais: "Brasil",
      googleMaps: "https://share.google/voE0NaZCRYzBv5TBw",
    },
    whatsapp: "https://wa.me/rotadoscelulares66",
    redesSociais: [
      { nome: "Facebook", url: "https://www.facebook.com/profile.php?id=61551387841024", icone: "facebook" },
      { nome: "Instagram", url: "https://www.instagram.com/rotadoscelulares66?igsi=OTJ0Y2F2d2E2cHdr&utm_source=qr", icone: "instagram" },
      { nome: "TikTok", url: "https://www.tiktok.com/@rotadoscelulares66?_r=1&_t=ZS-99Qog9SWjkT", icone: "tiktok" },
      { nome: "Kwai", url: "https://k.kwai.com/u/@RotadosCelulares/A9qaCFWy", icone: "kwai" },
    ],
    suportePosCompra: {
      whatsapp: "https://wa.me/5543998208721",
      aviso: "Atendimento exclusivo para tirar dúvidas de quem já comprou. Não é canal de vendas nem de dúvidas pré-compra.",
    },
  },

  // Preenchidos em tempo de execução após login (ver app.js -> carregarCatalogo()).
  categorias: [],
  fornecedores: [],
};

