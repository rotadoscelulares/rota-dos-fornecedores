"use strict";

require("dotenv").config();
const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const cookieParser = require("cookie-parser");
const auth = require("./auth");
const db = require("./db");
const catalogo = require("./catalogo");
const mailer = require("./mailer");

const app = express();
const PORT = process.env.PORT || 5566;
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "rc66_session";
const PROJECT_ROOT = path.join(__dirname, "..");
const ADMIN_APP_DIST = path.join(PROJECT_ROOT, "admin-app", "dist");

// Login desativado temporariamente: site entregue como pós-compra (link liberado
// direto após a compra na Cakto). Para reativar o cadastro/login de clientes,
// volte este valor para "true" (mantém tudo funcionando, só volta a exigir login
// para ver o catálogo). O login do admin em /admin continua ativo sempre.
const REQUIRE_LOGIN = false;
const catalogoAuthMiddleware = REQUIRE_LOGIN ? [requireAuth] : [];

app.use(express.json());
app.use(cookieParser());
app.use(express.static(PROJECT_ROOT));

// Painel administrativo (React + Ant Design), buildado separadamente em admin-app/.
app.use("/admin", express.static(ADMIN_APP_DIST));
app.get("/admin/*", (req, res) => res.sendFile(path.join(ADMIN_APP_DIST, "index.html")));

function usuarioPublico(u) {
  return {
    id: u.id,
    nomeCompleto: u.nome_completo,
    endereco: u.endereco,
    celular: u.celular,
    email: u.email,
    isAdmin: !!u.is_admin,
    status: u.status,
    ultimoLoginEm: u.ultimo_login_em,
    ultimoLoginIp: u.ultimo_login_ip,
    criadoEm: u.criado_em,
  };
}

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  const usuario = auth.usuarioPorToken(token);
  if (!usuario) return res.status(401).json({ ok: false, erro: "Sessão inválida ou expirada." });
  if (usuario.status === "suspenso") return res.status(403).json({ ok: false, erro: "Conta suspensa." });
  req.usuario = usuario;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.usuario.is_admin) return res.status(403).json({ ok: false, erro: "Acesso restrito ao administrador." });
  next();
}

/* ------------------------------------------------------------------ */
/* Autenticação                                                         */
/* ------------------------------------------------------------------ */
app.post("/api/auth/registro", (req, res) => {
  const { nomeCompleto, endereco, celular, email, senha } = req.body || {};
  const erros = auth.validarCadastro({ nomeCompleto, endereco, celular, email, senha });
  if (erros.length) return res.status(400).json({ ok: false, erros });

  if (auth.buscarPorEmail(email)) {
    return res.status(409).json({ ok: false, erros: ["Já existe uma conta com esse e-mail."] });
  }

  auth.criarUsuario({ nomeCompleto, endereco, celular, email, senha, isAdmin: false });
  res.json({ ok: true });
});

app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ ok: false, erro: "Informe e-mail e senha." });

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const resultado = auth.login({ email, senha, ip });

  if (!resultado.ok) {
    const mensagens = {
      credenciais_invalidas: "E-mail ou senha incorretos.",
      conta_suspensa: "Esta conta está suspensa. Fale com o administrador.",
      acesso_simultaneo: "Detectamos um acesso simultâneo nesta conta. Ela foi suspensa por segurança — fale com o administrador para reativar.",
    };
    return res.status(401).json({ ok: false, erro: mensagens[resultado.motivo] || "Não foi possível entrar." });
  }

  res.cookie(COOKIE_NAME, resultado.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 12,
  });
  res.json({ ok: true, usuario: usuarioPublico(resultado.usuario) });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  auth.logout(req.cookies[COOKIE_NAME]);
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ ok: true, usuario: usuarioPublico(req.usuario) });
});

app.post("/api/auth/esqueci-senha", (req, res) => {
  const { email } = req.body || {};
  if (email) {
    const token = auth.gerarTokenRedefinicao(email);
    if (token) {
      const link = `${req.protocol}://${req.get("host")}/redefinir-senha.html?token=${token}`;
      mailer.enviarLinkRedefinicao({ paraEmail: email, link }).catch((e) => console.error("Falha ao enviar e-mail:", e.message));
    }
  }
  // Resposta sempre genérica, para não revelar se o e-mail existe na base.
  res.json({ ok: true, mensagem: "Se esse e-mail estiver cadastrado, enviamos um link de redefinição (válido por 30 minutos)." });
});

app.post("/api/auth/redefinir-senha", (req, res) => {
  const { token, novaSenha } = req.body || {};
  const erros = auth.validarCadastro({ nomeCompleto: "x", endereco: "x", celular: "0000000000", email: "a@a.com", senha: novaSenha }).filter((e) => e.includes("senha"));
  if (erros.length) return res.status(400).json({ ok: false, erro: erros[0] });

  const sucesso = auth.redefinirSenhaComToken(token, novaSenha);
  if (!sucesso) return res.status(400).json({ ok: false, erro: "Link inválido ou expirado. Solicite um novo." });
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Catálogo (público quando REQUIRE_LOGIN = false, ver topo do arquivo) */
/* ------------------------------------------------------------------ */
app.get("/api/categorias", ...catalogoAuthMiddleware, (req, res) => {
  res.json({ ok: true, categorias: catalogo.categorias });
});

app.get("/api/fornecedores", ...catalogoAuthMiddleware, (req, res) => {
  res.json({ ok: true, fornecedores: catalogo.fornecedores });
});

/* ------------------------------------------------------------------ */
/* Administração                                                        */
/* ------------------------------------------------------------------ */
app.get("/api/admin/usuarios", requireAuth, requireAdmin, (req, res) => {
  const usuarios = db.prepare("SELECT * FROM usuarios ORDER BY criado_em DESC").all();
  res.json({ ok: true, usuarios: usuarios.map(usuarioPublico) });
});

app.post("/api/admin/usuarios/:id/suspender", requireAuth, requireAdmin, (req, res) => {
  db.prepare("UPDATE usuarios SET status = 'suspenso', sessao_token = NULL WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.post("/api/admin/usuarios/:id/reativar", requireAuth, requireAdmin, (req, res) => {
  db.prepare("UPDATE usuarios SET status = 'ativo', sessao_token = NULL WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Gera uma nova senha temporária para o usuário (o admin nunca vê a senha original).
app.post("/api/admin/usuarios/:id/redefinir-senha", requireAuth, requireAdmin, (req, res) => {
  const usuario = auth.buscarPorId(req.params.id);
  if (!usuario) return res.status(404).json({ ok: false, erro: "Usuário não encontrado." });

  const novaSenha = crypto.randomBytes(6).toString("base64url") + "@9Aa";
  const bcrypt = require("bcryptjs");
  db.prepare("UPDATE usuarios SET senha_hash = ?, sessao_token = NULL WHERE id = ?")
    .run(bcrypt.hashSync(novaSenha, 10), usuario.id);

  res.json({ ok: true, novaSenhaTemporaria: novaSenha });
});

/* ------------------------------------------------------------------ */
/* Boot                                                                 */
/* ------------------------------------------------------------------ */
auth.seedAdmin({ email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_PASSWORD });

app.listen(PORT, () => {
  console.log(`Rota dos Celulares 66 — servidor rodando em http://localhost:${PORT}/`);
});
