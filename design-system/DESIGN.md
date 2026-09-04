# DESIGN.md — Rota dos Celulares 66

Contrato de marca e sistema de design da plataforma. Qualquer nova tela, componente
ou fornecedor adicionado ao projeto deve seguir estas regras para manter consistência.

## Marca

- **Nome:** Rota dos Celulares 66
- **Território:** catálogo pós-compra de fornecedores de celulares, smartphones,
  eletrônicos e acessórios.
- **Tom de voz:** direto, confiável, profissional, com toque premium e tecnológico.
- **Leitura do nome:** "Rota" remete a estrada/trajeto — a plataforma é o caminho
  mais rápido até o fornecedor certo. A referência estética de "placa de rota"
  (estilo sinalização de estrada) inspira o logotipo temporário do projeto.

## Princípios visuais

1. Fundo escuro premium — nunca aparência genérica de template.
2. Dourado é destaque cirúrgico: títulos, bordas, selos, ícones-chave. Nunca
   preenchimento de áreas grandes.
3. Azul-del-rei conduz a ação: botões primários, links, navegação, foco.
4. Um destaque por seção — sem elementos competindo por atenção.
5. Cantos levemente arredondados (nem "pill", nem quadrado seco).
6. Sombra suave + brilho sutil (glow) apenas em elementos de destaque.

## Paleta (tokens)

| Token CSS | Hex | Uso |
|---|---|---|
| `--color-blue-primary` | `#1F3B8F` | botões primários, links, navegação, foco |
| `--color-blue-deep` | `#14265F` | fundos secundários, hover, contraste |
| `--color-black-tech` | `#0B0D10` | fundo principal |
| `--color-black-graphite` | `#17191D` | cartões, menus, blocos de conteúdo |
| `--color-gold-premium` | `#C8A15A` | títulos, bordas, selos, ícones |
| `--color-gold-light` | `#E2C47A` | brilho, hover, detalhes de destaque |
| `--color-bronze` | `#8A4F2A` | detalhes decorativos, molduras |
| `--color-white-warm` | `#F7F4EC` | texto principal |
| `--color-gray-soft` | `#A9B0BC` | texto secundário |

Os tokens estão implementados em `assets/css/styles.css` (`:root`). Nenhuma cor fora
da paleta deve ser adicionada sem atualizar este arquivo primeiro.

## Tipografia

- **Títulos:** "Poppins", peso 600–700.
- **Corpo:** "Inter", peso 400–500.
- **Escala:** 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48px.
- Fallback do sistema (`system-ui, sans-serif`) garante funcionamento offline.

## Espaçamento

- Escala base de 4px: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Respiro generoso entre seções: mínimo 64px em desktop, 40px em mobile.

## Componentes

- **Botão primário** (`.btn-primary`): fundo azul-del-rei, texto branco quente;
  hover para azul profundo com leve glow dourado na borda; foco com anel dourado.
- **Botão secundário** (`.btn-secondary`): borda dourada 1px, fundo transparente,
  texto dourado claro; hover preenche com grafite.
- **Botão pendente/desabilitado** (`.btn[data-pending="true"]`): opacidade
  reduzida, cursor `not-allowed`, rótulo "Link em breve" — usado sempre que não
  houver URL real de comunidade/contato.
- **Cartão** (`.card`): fundo preto grafite, borda 1px em dourado translúcido,
  raio 16px, sombra suave; hover eleva 2px e intensifica o brilho da borda.
- **Selo "Verificado"** (`.badge-verified`): pílula dourada com ícone de check —
  só é renderizada quando `verificado: true` no dado do fornecedor.
- **Selo "Modelo"** (`.badge-model`): identifica módulos de exemplo/placeholder,
  para nunca serem confundidos com fornecedores reais.

## Logotipo

- Enquanto o arquivo oficial não é integrado, `assets/img/logo.svg` traz um
  wordmark temporário (placa estilo rota, moldura em bronze, fundo azul-del-rei,
  "66" em dourado) como referência visual provisória.
- Ao receber o arquivo oficial, substituir `assets/img/logo.svg` mantendo a
  mesma proporção (uso no header ~40px de altura, no rodapé ~32px).

## Regras de dados (obrigatórias)

- Nenhum dado de fornecedor é inventado. Os módulos em `assets/js/data.js`
  marcados com `modelo: true` são exemplos de estrutura, não fornecedores reais.
- Campo sem informação real deve exibir o placeholder `"A definir"` — nunca ser
  omitido silenciosamente.
- Link de comunidade sem URL real mantém `linkComunidade: null` e o botão
  correspondente é renderizado como pendente (`Link em breve`), nunca como link
  funcional falso.
- Para adicionar um fornecedor real: edite o array `fornecedores` em
  `assets/js/data.js` seguindo o mesmo formato dos objetos existentes.
