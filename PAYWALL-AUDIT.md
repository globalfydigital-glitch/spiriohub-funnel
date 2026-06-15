# Auditoria multi-agente — Pagina de venda (paywall) do funil Spiriohub

**56 achados confirmados** (verificados adversarialmente) · 7 dimensoes
functional-bugs 6 · placeholder-content 12 · gender-coverage 5 · layout-responsive 6 · accessibility 11 · code-quality 10 · structure-completeness 6

> Resumo: a pagina renderiza e o checkout funciona, mas tem 2 defeitos criticos de confianca/legal (disclaimer diz subscricao 39.99 EUR/mes quando os planos sao compra unica 1/3/6 meses; e a FAQ esta inerte sem respostas). Ha conteudo placeholder, lacunas de genero nos testemunhos, um bug de performance React (Card remonta a pagina inteira a cada segundo) e varias melhorias de acessibilidade/layout.

Ficheiros: `src/funnel/screens.tsx`, `src/funnel/steps.ts`, `src/funnel/types.ts`, `src/funnel/FunnelApp.tsx`.

## Critico

### 1. Disclaimer de cobranca contradiz o modelo (subscricao vs. compra unica)
`screens.tsx:1557-1559`. Diz "automatic renewal of the subscription, then 39.99 EUR every month", mas os planos sao 1/3/6-Month a 19.99/44.99/59.99 EUR (`steps.ts:289-291`) e os upsells dizem "one-time purchase, non-recurring" (`steps.ts:316,330`). O 39.99 e hardcoded, nao existe nos dados. Maior risco legal/chargeback.
**Fix:** reescrever para compra unica espelhando o upsell. Confirmar o modelo real antes de lancar.

### 2. Acordeao de FAQ nao tem respostas — clicar nao revela nada
`screens.tsx:1414-1418` (dados) + `1690-1696` (render). FAQS sao 3 strings de pergunta, sem resposta; o botao vira o galao sobre o vazio. Bloco de objecoes inerte, le-se como pagina avariada.
**Fix:** FAQS vira objetos `{q,a}`; renderizar a resposta como irma do botao (nao filha) guardada por `faq===i`; adicionar `aria-expanded`/`aria-controls`/`type=button`.

## Alto

### 3. `Card` definido dentro de PaywallView remonta a arvore a cada segundo
`screens.tsx:1459-1461`. `Card` ganha nova identidade a cada render; o timer faz `setSecs` a cada 1000 ms, logo o React desmonta/remonta toda a subarvore por segundo.
**Fix:** icar `Card` para escopo de modulo.

### 4. Estatisticas de eficacia fabricadas (82/78/45%) como factos
`screens.tsx:1403-1407,1607`. Numeros inventados sem fonte, ligados a promessa de "4 weeks". Exposicao regulatoria (UE).
**Fix:** dados reais com fonte, ou reformular qualitativamente sem falsa precisao.

### 5. Renovacao "39.99 EUR every month" hardcoded
`screens.tsx:1557-1559`. Mesma raiz do #1.
**Fix:** apos confirmar termos, modelar nos dados ou remover.

### 6. Avatares de testemunhos fixos em 2 caras femininas, ignoram o genero
`screens.tsx:1409-1413,1666`. REVIEWS estatica; para lead masculino o cabecalho diz "284,620 men" mas os testemunhos leem-se so-mulheres.
**Fix:** REVIEWS gender-aware; dar foto masculina ao Scott G.

## Medio

### 8. Contagem "284,620" fabricada e invariante
`screens.tsx:1604`. Numero exato hardcoded. **Fix:** mover para dados com fonte, ou suavizar.

### 10. Figura do blueprint reutiliza o retrato "Now" (low-vibration)
`screens.tsx:1451,1653-1658`. Overlay usa `nowImg` (a foto do estado atual) como figura aspiracional — contradicao semantica; para homem e um retrato de cabeca. **Fix:** asset dedicado `MEDIA.meditationFemale/Male`.

### 11. Icones do blueprint sao emoji repetidos nas 3 semanas
`screens.tsx:1420,1642-1646`. **Fix:** SVG/CDN de marca por modulo real, variando por semana.

### 12. "As featured in" sao texto, nao logotipos
`screens.tsx:1408,1611-1615`. Afirma colocacoes de imprensa. **Fix:** `img` de logotipos verificados; remover nao-verificados.

### 13. Linha do premio: gramatica partida + emoji + ano 2023 obsoleto
`screens.tsx:1616-1619`. "nominated for an: Best...Award - 2023". **Fix:** "for the Best...Award", badge real, atualizar/remover ano.

### 15. Timer expira em 00:00 sem reset, com desconto ainda ativo
`screens.tsx:1439-1445`. Congela em 00:00 para sempre; escassez visivelmente falsa. **Fix:** persistir/re-semear o deadline, ou expirar o UI de desconto.

### 16. Sem resumo de plano/preco junto do CTA final
`screens.tsx:1699-1701`. O preco so aparece na microcopia legal. **Fix:** mostrar nome+preco do plano no botao e linha de resumo.

### 17. Garantia repetida 3x mas nunca explicada (como pedir reembolso)
`screens.tsx:1551,1562-1569`. **Fix:** expandir `moneyBackBody` com a mecanica (email, 30 dias, reembolso total) na pagina.

### 18. Campos do Step do paywall (title/titleGold/cta/goalFrom) nunca lidos
`steps.ts:285-287`. PaywallView so le `plans` e `moneyBack*`; editar steps.ts nao tem efeito. **Fix:** tornar data-driven, ou apagar campos mortos.

### 19. PaywallView e um monolito de ~280 linhas
`screens.tsx:1427-1704`. **Fix:** extrair PlanCard, NowVsGoalComparison, BlueprintGrid, StatsCard, TestimonialCard, FaqAccordion (resolve tambem o #3).

### 20. Grelha do blueprint desalinha cabecalho dos dias + aperta em ~360px
`screens.tsx:1624-1651`. `pl-10` (40px) vs aba `w-8`+gap = 36px → "Day1..7" ~4px a direita; "10 min" sem min-w. **Fix:** `pl-9`, `min-w-0` na celula, `whitespace-nowrap` no label.

### 21. Nome livre sem maxLength injetado no H1 e recap
`screens.tsx:1474-1476,1503`. Nome longo empurra preco/CTA. **Fix:** `maxLength 40` no passo do nome; `break-words` no H1/recap; `truncate` no chip promo, `shrink-0` no timer.

## Baixo (selecao)

- **27.** Headline de desconto muda (-60/-55/-54) ao clicar nos cartoes; fallback "-54%" morto (`1473`).
- **28.** Minutos diarios do blueprint (BP_MINS) inventados (`1421-1425`).
- **29.** Parser de preco/dia cai para "0 EUR" sem decimal (`1542-1543`).
- **30.** `buy()` grava `plan` cru em vez de `selected.id`; `step.plans[0]` sem guarda.
- **31.** `#1a1626` hardcoded em vez do token `card` (`1539`).
- **22/23/24/25/26/36/37/39/40.** Acessibilidade: timer sem `aria-live`; estrelas sem alternativa textual; FAQ sem `aria-expanded`; cartoes de plano sem `role=radio`; 3x "GET MY PLAN" sem contexto; sem foco visivel; emoji significativos sem `sr-only`; link de reembolso `_blank` sem aviso; logo Harvard sem alt.
- **33/34.** Now/Goal usam 4 pessoas diferentes; figura de meditacao = placeholder summary.
- **35.** Badges de pagamento sao texto, nao logotipos.
- **43/44.** Markup de cartao duplicado; opacidade de superficie inconsistente; `-mx-5` fragil.

## Precisa do TEU input (antes de lancar)
- **Modelo de cobranca** (#1/#5): compra unica como os upsells indicam? Confirmar termos.
- **Estatisticas reais** (#4/#8): 82/78/45% e 284.620 — numeros reais+fonte, ou suavizar?
- **Imprensa/premio/pagamentos** (#12/#13/#35): que outlets, premio e metodos sao verdadeiros?
- **Imagens** (#6/#10/#11/#33/#34): assets reais de meditacao/testemunhos/icones do blueprint.
