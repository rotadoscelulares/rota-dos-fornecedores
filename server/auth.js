"use strict";

const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const db = require("./db");

const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarCadastro({ nomeCompleto, endereco, celular, email, senha }) {
  const erros = [];
  if (!nomeCompleto || nomeCompleto.trim().length < 3) erros.push("Informe o nome completo.");
  if (!endereco || endereco.trim().length < 5) erros.push("Informe o endereço completo.");
  if (!celular || celular.replace(/\D/g, "").length < 10) erros.push("Informe um número de celular válido.");
  if (!email || !EMAIL_REGEX.test(email)) erros.push("Informe um e-mail válido.");
  if (!senha || !SENHA_REGEX.test(senha)) {
    erros.push("A senha deve ter no mínimo 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.");
  }
  return erros;
}

function criarUsuario({ nomeCompleto, endereco, celular, email, senha, isAdmin }) {
  const senhaHash = bcrypt.hashSync(senha, 10);
  const stmt = db.prepare(`
    INSERT INTO usuarios (nome_completo, endereco, celular, email, senha_hash, is_admin)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(nomeCompleto.trim(), endereco.trim(), celular.trim(), email.trim().toLowerCase(), senhaHash, isAdmin ? 1 : 0);
  return info.lastInsertRowid;
}

function buscarPorEmail(email) {
  return db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email.trim().toLowerCase());
}

function buscarPorId(id) {
  return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id);
}

/**
 * Login com regra de sessão única: se já existir uma sessão ativa para essa
 * conta, é tratado como acesso simultâneo — a conta é suspensa e o login é negado.
 * Contas de administrador são isentas dessa regra: nunca são suspensas por
 * acesso simultâneo, apenas a sessão anterior é substituída.
 */
function login({ email, senha, ip }) {
  const usuario = buscarPorEmail(email);
  if (!usuario) return { ok: false, motivo: "credenciais_invalidas" };

  const senhaConfere = bcrypt.compareSync(senha, usuario.senha_hash);
  if (!senhaConfere) return { ok: false, motivo: "credenciais_invalidas" };

  if (usuario.status === "suspenso") {
    return { ok: false, motivo: "conta_suspensa" };
  }

  if (usuario.sessao_token && !usuario.is_admin) {
    // Já existe uma sessão aberta nesta conta — acesso simultâneo detectado.
    db.prepare(`
      UPDATE usuarios SET status = 'suspenso', sessao_token = NULL, sessao_iniciada_em = NULL
      WHERE id = ?
    `).run(usuario.id);
    return { ok: false, motivo: "acesso_simultaneo" };
  }

  const token = crypto.randomUUID();
  db.prepare(`
    UPDATE usuarios
    SET sessao_token = ?, sessao_iniciada_em = datetime('now'), ultimo_login_em = datetime('now'), ultimo_login_ip = ?
    WHERE id = ?
  `).run(token, ip || null, usuario.id);

  return { ok: true, token, usuario };
}

function logout(token) {
  db.prepare(`
    UPDATE usuarios SET sessao_token = NULL, sessao_iniciada_em = NULL
    WHERE sessao_token = ?
  `).run(token);
}

function usuarioPorToken(token) {
  if (!token) return null;
  return db.prepare("SELECT * FROM usuarios WHERE sessao_token = ?").get(token);
}

/** Garante que a conta administradora exista, criando-a a partir do .env na primeira execução. */
function seedAdmin({ email, senha }) {
  if (!email || !senha) return;
  const existente = buscarPorEmail(email);
  if (existente) return;
  criarUsuario({
    nomeCompleto: "Administrador — Rota dos Celulares 66",
    endereco: "A definir",
    celular: "A definir",
    email,
    senha,
    isAdmin: true,
  });
  console.log(`Conta de administrador criada para ${email} (senha protegida por hash).`);
}

const RESET_TOKEN_DURACAO_MIN = 30;

/** Gera um token de redefinição de senha válido por 30 minutos. */
function gerarTokenRedefinicao(email) {
  const usuario = buscarPorEmail(email);
  if (!usuario) return null; // chamador deve responder de forma genérica, sem revelar se o e-mail existe

  const token = crypto.randomUUID();
  const expiraEm = new Date(Date.now() + RESET_TOKEN_DURACAO_MIN * 60 * 1000).toISOString();
  db.prepare("UPDATE usuarios SET reset_token = ?, reset_token_expira_em = ? WHERE id = ?").run(token, expiraEm, usuario.id);
  return token;
}

function buscarPorTokenRedefinicao(token) {
  if (!token) return null;
  const usuario = db.prepare("SELECT * FROM usuarios WHERE reset_token = ?").get(token);
  if (!usuario) return null;
  if (!usuario.reset_token_expira_em || new Date(usuario.reset_token_expira_em).getTime() < Date.now()) {
    return null; // expirado
  }
  return usuario;
}

function redefinirSenhaComToken(token, novaSenha) {
  const usuario = buscarPorTokenRedefinicao(token);
  if (!usuario) return false;
  const senhaHash = bcrypt.hashSync(novaSenha, 10);
  db.prepare(`
    UPDATE usuarios
    SET senha_hash = ?, reset_token = NULL, reset_token_expira_em = NULL, sessao_token = NULL
    WHERE id = ?
  `).run(senhaHash, usuario.id);
  return true;
}

module.exports = {
  SENHA_REGEX,
  validarCadastro,
  criarUsuario,
  buscarPorEmail,
  buscarPorId,
  login,
  logout,
  usuarioPorToken,
  seedAdmin,
  gerarTokenRedefinicao,
  buscarPorTokenRedefinicao,
  redefinirSenhaComToken,
};
