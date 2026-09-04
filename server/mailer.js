"use strict";

/**
 * Envio de e-mail via SMTP (Gmail). Se SMTP_USER/SMTP_PASS não estiverem
 * configurados no .env, o link de redefinição é apenas exibido no console
 * do servidor (modo de desenvolvimento), para não travar o fluxo.
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  const nodemailer = require("nodemailer");
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function enviarLinkRedefinicao({ paraEmail, link }) {
  const t = getTransporter();
  const assunto = "Redefinição de senha — Rota dos Celulares 66";
  const corpo =
    `Você solicitou a redefinição de senha na Rota dos Celulares 66.\n\n` +
    `Clique no link abaixo para criar uma nova senha (válido por 30 minutos):\n${link}\n\n` +
    `Se você não solicitou isso, ignore este e-mail.`;

  if (!t) {
    console.log("\n[E-MAIL NÃO CONFIGURADO] Link de redefinição de senha para " + paraEmail + ":");
    console.log(link + "\n");
    return { enviado: false };
  }

  await t.sendMail({
    from: `"Rota dos Celulares 66" <${process.env.SMTP_USER}>`,
    to: paraEmail,
    subject: assunto,
    text: corpo,
  });
  return { enviado: true };
}

module.exports = { enviarLinkRedefinicao };
