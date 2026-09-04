"use strict";

/**
 * Funções compartilhadas de autenticação para as páginas
 * cadastro.html, login.html e admin.html.
 */
window.AUTH = (function () {
  async function api(method, url, body) {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* resposta sem corpo */ }
    if (!res.ok && !data.erro && !data.erros) data.erro = "Não foi possível completar a solicitação.";
    return { status: res.status, ...data };
  }

  return {
    registrar: (dados) => api("POST", "/api/auth/registro", dados),
    login: (dados) => api("POST", "/api/auth/login", dados),
    logout: () => api("POST", "/api/auth/logout"),
    me: () => api("GET", "/api/auth/me"),
    esqueciSenha: (email) => api("POST", "/api/auth/esqueci-senha", { email }),
    redefinirSenha: (token, novaSenha) => api("POST", "/api/auth/redefinir-senha", { token, novaSenha }),
    categorias: () => api("GET", "/api/categorias"),
    fornecedores: () => api("GET", "/api/fornecedores"),
    listarUsuarios: () => api("GET", "/api/admin/usuarios"),
    suspender: (id) => api("POST", `/api/admin/usuarios/${id}/suspender`),
    reativar: (id) => api("POST", `/api/admin/usuarios/${id}/reativar`),
    redefinirSenhaAdmin: (id) => api("POST", `/api/admin/usuarios/${id}/redefinir-senha`),
  };
})();

window.SENHA_REGRAS = [
  { label: "Mínimo de 8 caracteres", test: (s) => s.length >= 8 },
  { label: "Uma letra maiúscula", test: (s) => /[A-Z]/.test(s) },
  { label: "Uma letra minúscula", test: (s) => /[a-z]/.test(s) },
  { label: "Um número", test: (s) => /\d/.test(s) },
  { label: "Um caractere especial", test: (s) => /[^A-Za-z0-9]/.test(s) },
];
