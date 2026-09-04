# Rota dos Celulares 66

Catálogo pós-compra de fornecedores de celulares, smartphones, eletrônicos e
acessórios. Site estático (HTML/CSS/JS puro, sem build), pronto para receber
novos fornecedores editando um único arquivo de dados.

## Estrutura

```
rota-dos-celulares-66/
├── index.html                 ← página única (header, hero, busca, categorias, catálogo, suporte, rodapé)
├── assets/
│   ├── css/styles.css         ← tokens de cor, tipografia, layout, animações
│   ├── js/data.js             ← DADOS REUTILIZÁVEIS: categorias + fornecedores
│   ├── js/app.js               ← renderização, busca/filtros, menu mobile, links pendentes
│   └── img/logo.svg           ← wordmark temporário (substituir pela logo oficial)
├── design-system/DESIGN.md    ← contrato de marca: paleta, tipografia, componentes, regras de dados
└── server.ps1                 ← servidor local simples (PowerShell) para pré-visualização
```

## Como visualizar localmente

Este computador não tem Node.js/Python instalados, então o projeto foi feito
para rodar sem build. Duas formas de abrir:

1. **Servidor local (recomendado)** — evita eventuais bloqueios de `fetch`/CORS
   em alguns navegadores e permite gerar um link `http://localhost`:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\server.ps1
   ```
   Depois acesse **http://localhost:5566/**.

2. **Abrir direto** — dê duplo clique em `index.html`. Como os dados ficam em
   `assets/js/data.js` (JavaScript puro, não `fetch` de JSON), a página funciona
   mesmo sem servidor.

## Como adicionar/editar fornecedores

Edite apenas `assets/js/data.js`:

- Adicione um objeto ao array `fornecedores` seguindo o mesmo formato dos
  existentes (`nome`, `especialidade`, `categoria`, `produtos`, `marcas`,
  `localizacao`, `verificado`, `linkComunidade`).
- Campos sem informação real devem usar `"A definir"`.
- Sem link real de comunidade → mantenha `linkComunidade: null` (o botão vira
  "Link em breve" automaticamente).
- Remova `modelo: true` quando o fornecedor for real (esse campo só marca
  módulos de exemplo).
- O layout, filtros e busca se atualizam automaticamente — nenhuma alteração
  de HTML/CSS é necessária.

## Regras de conteúdo (ver design-system/DESIGN.md)

- Nenhum dado de fornecedor foi inventado; os 9 módulos atuais são **modelos**
  de estrutura (um por categoria), claramente identificados pelo selo "Modelo".
- Links de suporte, política de privacidade e comunidades sem URL real ficam
  visivelmente marcados como pendentes ("Link em breve"), nunca como links
  falsos.
- A logo em `assets/img/logo.svg` é um wordmark temporário inspirado no nome
  da marca — substitua pelo arquivo oficial assim que disponível.

## Acessibilidade

- Link "pular para o conteúdo", navegação por teclado, foco visível em dourado.
- `aria-live` no contador de resultados e nos toasts de feedback.
- Rótulos (`label`) em todos os campos de busca/filtro.
- Respeita `prefers-reduced-motion` (desativa animações quando o usuário pedir).
