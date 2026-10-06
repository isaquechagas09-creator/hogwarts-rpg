# Hogwarts RPG · Broomstix online (4 jogadores + Mestre)

React + TypeScript + Tailwind + Supabase (Auth, Postgres com RLS, Realtime).

## 1. Supabase
1. Crie um projeto em supabase.com.
2. **SQL Editor** → cole todo `supabase/schema.sql` → Run.
3. **Authentication → Providers → Email**: ative. Para testar rápido, desligue "Confirm email".
4. **Project Settings → API**: copie *Project URL* e *anon public key*.
5. Confirme em **Database → Replication** que `messages`, `characters`, `campaigns`, `members` estão no `supabase_realtime`.

## 2. Rodar localmente
```bash
cp .env.example .env     # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## 3. Colocar online (Vercel)
Suba a pasta para um repositório GitHub → Vercel → *Import* → framework Vite →
variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` → Deploy.
(Netlify/Cloudflare Pages funcionam igual: build `npm run build`, saída `dist`.)
Em Supabase → Authentication → URL Configuration, coloque a URL do site.

## 4. Testar com 4 jogadores
Use 5 navegadores/janelas anônimas (ou 5 pessoas), cada um com uma conta.
1. Conta 1: *Criar sala* → anote o **código**.
2. Contas 2–5: *Entrar na sala* com o código (a 5ª conta recebe "Sala cheia").
3. Cada jogador: aba **Personagens** → assistente de 5 etapas → ficha criada.
4. Mestre: aba **Mestre** → dar XP/dinheiro/itens, mudar Casa, avançar ano; aba **Mapa** → mudar local.
5. Jogador: aba **Dados** → rolar; todos veem o resultado na hora. **Chat** e **Diário** também sincronizam.
6. Feche e reabra o navegador: tudo continua salvo.

## Segurança (no banco, não no front)
- Rolagens são feitas no servidor (`roll_test`); o d20 não pode ser forjado.
- Trigger `guard_character`: jogador só altera nome/idade/descrição; XP, dinheiro, itens, aptidões, perícias, Casa, ano e ferimentos são só do Mestre.
- Mensagens (chat, rolagens, sistema) não podem ser editadas nem apagadas; mensagens privadas só chegam ao destinatário.
- Limite de 4 jogadores aplicado no banco (`join_campaign`).

## Regras do Broomstix implementadas
Aptidões (5 pts + 1 por Aptidão −1; Magia = ano escolar), perícias com limite pela Aptidão e pré-requisitos,
Casas + Chapéu Seletor (10 perguntas do PDF; Mestre pode trocar a Casa; Sonserina bloqueada por padrão),
Situações Únicas (2ª custa 2 pontos; Mestre habilita/desabilita), varinha (+1/−1; configuração livre),
vassouras (Voar −1 a +2), familiar, moedas (17 Sicles = 1 Galeão; 29 Nuques = 1 Sicle),
tabela de resultados, teste oposto (subtrai a perícia do oponente), avanço (XP, pontos de perícia/aptidão, ano escolar).

**Interpretações configuráveis pelo Mestre** (o PDF é ambíguo): dinheiro inicial (10 Galeões, +20 com Riqueza — edite no trigger),
pontos de aptidão/perícia por aniversário, quando o ano escolar avança.

## Ainda NÃO incluído nesta versão
Rastreador de combate/iniciativa (use teste oposto de Combate + campo de ferimentos), grimório de feitiços e biblioteca do Mestre
(NPCs, criaturas, inimigos), módulo de Quadribol, upload de avatar/imagens, mensagens de eventos/campanha de teste pré-criada.
