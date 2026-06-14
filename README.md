# Spiriohub Funnel (clone)

Réplica fiel do funil de quiz da Spiriohub (`signup.spiriohub.com`, fluxo *energy_b*),
construída na stack do **Lovable**: **Vite + React + TypeScript + Tailwind CSS**.

Pronto para subir ao GitHub e importar no Lovable.

---

## ▶️ Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:8080`.

Build de produção: `npm run build` (gera `dist/`).

---

## ✏️ Onde editar o conteúdo

Está **tudo num só ficheiro**: [`src/funnel/steps.ts`](src/funnel/steps.ts)

- `BRAND` → o nome da marca (no topo do ficheiro).
- `STEPS` → o array com **todos os ecrãs** por ordem. Cada item tem `type` e o seu conteúdo:
  - `gender` / `single` / `scale` → pergunta de escolha única (avança ao clicar)
  - `multi` → escolha múltipla (com `max`)
  - `info` / `summary` → ecrã de conteúdo com botão
  - `input` → recolhe nome / email
  - `loader` → ecrã "a criar o plano"
  - `paywall` → planos e preços (edita em `plans`)
  - `upsell` → oferta aceitar/recusar
  - `success` → ecrã final

Adicionar / remover / reordenar perguntas = mexer no array `STEPS`. O resto (progresso,
navegação, botão de voltar) ajusta-se sozinho.

---

## 🗂️ Estrutura

```
src/
  main.tsx              # entrada
  index.css            # tema (fundo, cores)
  funnel/
    types.ts           # tipos dos ecrãs
    steps.ts           # ◀ TODO o conteúdo do funil (editar aqui)
    screens.tsx        # componentes de UI de cada tipo de ecrã
    FunnelApp.tsx      # motor: estado, progresso, navegação
```

---

## ⬆️ Subir para o GitHub

```bash
cd spiriohub-funnel
git init
git add -A
git commit -m "Spiriohub funnel clone (Vite+React+TS+Tailwind)"
git branch -M main
# cria o repo (privado) e faz push — troca o nome se quiseres:
gh repo create spiriohub-funnel --private --source=. --remote=origin --push
# (ou, sem gh: cria o repo no github.com e depois)
# git remote add origin git@github.com:<conta>/spiriohub-funnel.git
# git push -u origin main
```

---

## 🎨 Importar no Lovable

1. No Lovable: **New Project → Import from GitHub** (autoriza o GitHub se for a 1.ª vez).
2. Escolhe o repo `spiriohub-funnel`.
3. O Lovable deteta Vite+React+Tailwind e arranca o preview.
4. A partir daí editas por prompt ou no código.

---

## ⚠️ Notas

- **Imagens** são placeholders (emoji + gradientes) — não copiei imagens da marca original.
  Substitui em `screens.tsx` / `steps.ts` pelas tuas.
- **Preços** no paywall são representativos — ajusta em `steps.ts`.
- **Sem backend**: email, pagamento e upsells são só front-end (guardam a resposta em estado).
  Para funcionar a sério, liga no Lovable: **Supabase** (guardar leads/respostas) e
  **Stripe/Solidgate** (checkout). É aí que o paywall e os upsells passam a cobrar.
- **Ramificação**: o original muda alguns ecrãs por género/idade/objetivo. Este clone é
  linear (mesma sequência para todos) e já guarda essas respostas em `answers` — dá para
  adicionar variantes depois se quiseres.
