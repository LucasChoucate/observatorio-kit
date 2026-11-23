# Instruções para o agente de IA

Você está ajudando um integrante de uma equipe de 5 alunos do SENAI CIMATEC (UC Desenvolvimento Fullstack, AV3) a construir o **Observatório de Vulnerabilidade Socioenergética de Salvador**. O projeto é dividido em 5 etapas sequenciais (A, B, C, D, E). Cada integrante executa uma etapa com a sua própria IA, e a etapa seguinte começa de onde a anterior parou.

Seu trabalho é executar **somente a etapa do integrante que está falando com você**, seguir os padrões do projeto e, ao final, deixar registrado o que foi feito para a próxima pessoa (e a IA dela) continuar sem perguntas.

## 1. Antes de escrever qualquer código

1. Leia, nesta ordem: `docs/REQUISITOS.md`, `docs/PADROES.md` e `docs/PROGRESSO.md`.
2. Descubra qual é a etapa atual: está no topo de `docs/PROGRESSO.md` ("Etapa atual"). Confirme com o usuário: "Pelo PROGRESSO.md, a etapa atual é a X, de responsabilidade de [nome]. É você?". Se ele disser que é outra etapa, pare e explique que as etapas são sequenciais.
3. **Verifique a etapa anterior** (exceto na etapa A):
   - leia o "Registro de passagem" da etapa anterior em `docs/PROGRESSO.md`;
   - confira se os itens marcados como `[x]` realmente existem no repositório (arquivos, scripts, telas);
   - rode `npm run lint`, `npm test` e `npm run build` dentro de `web/`;
   - apresente ao usuário um relatório curto: o que está ok, o que está faltando ou quebrado. Se algo da etapa anterior estiver quebrado e bloquear a sua etapa, pergunte se deve corrigir. Correções vão em commits separados (`fix(escopo): ...`) e entram no seu registro de passagem.
4. Garanta a branch certa: `git checkout develop && git pull` e depois `git checkout -b feature/etapa-x-<tema>` (veja o nome sugerido no arquivo da etapa). Nunca trabalhe direto na `main` ou na `develop`.
5. Leia o arquivo da etapa inteiro (`docs/etapas/ETAPA_X.md`) e os critérios de aceite dela em `docs/PROGRESSO.md`. Monte um plano em forma de lista de tarefas, mostre ao usuário e só então comece.

## 2. Durante o trabalho

- Siga `docs/PADROES.md` à risca: estrutura de pastas, nomes, estilo de código, padrão de commit.
- Faça **commits pequenos e frequentes**, um assunto por commit. Nada de um commit gigante no final.
- **Nunca invente dados.** Todo número precisa vir de um arquivo oficial (IBGE, IPEA, EPE) baixado e citado. Se você não conseguir baixar um arquivo (rede bloqueada, site fora do ar), pare e peça ao usuário para baixar e colocar em `data/raw/`, informando a URL exata. Se um indicador não existir na escala de bairro, **documente isso** no catálogo em vez de estimar em silêncio.
- **Nunca atribua dado estadual (Bahia) ou municipal a um bairro.** Cada observação é gravada com o território real ao qual o dado se refere.
- **Nunca exponha a chave `service_role`** no frontend. O código em `web/` usa somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A `service_role` só existe em `etl/.env`, que não é versionado.
- Nunca commite arquivos `.env`, chaves, tokens ou senhas.
- Não altere `git config`, não use `git push --force`, não faça push para `main` ou `develop`.
- Não reescreva trabalho de outras etapas sem necessidade. Se precisar mexer, faça em commit separado e explique no registro de passagem.
- Quando um passo depender do humano (criar conta, clicar no painel do Supabase ou da Vercel, colar uma chave, rodar SQL no editor), pare, dê instruções numeradas e espere ele confirmar que fez.
- Se algo do roteiro estiver ambíguo, escolha a opção mais conservadora do ponto de vista metodológico e registre a decisão no registro de passagem.

## 3. Ao terminar a etapa

1. Rode as verificações: `npm run lint`, `npm test`, `npm run build` em `web/` e os scripts de ETL da sua etapa (eles devem rodar duas vezes seguidas sem duplicar dados).
2. Em `docs/PROGRESSO.md`, na seção da sua etapa:
   - marque cada critério de aceite cumprido com `[x]`;
   - deixe `[ ]` nos não cumpridos e escreva o motivo ao lado;
   - preencha o **Registro de passagem** (o que foi feito, decisões, pendências, o que a próxima etapa precisa saber, como testar);
   - atualize a tabela de status e mude "Etapa atual" para a próxima letra.
3. Commit: `docs(progresso): conclui etapa X`.
4. `git push -u origin feature/etapa-x-<tema>`.
5. Abra um Pull Request para a `develop` (use `gh pr create` se o GitHub CLI estiver disponível; senão, explique ao usuário como abrir pelo site). Título no padrão de commit, corpo seguindo `.github/pull_request_template.md`. Revisor: o responsável pela próxima etapa.
6. Mostre ao usuário um resumo final com: o checklist da etapa, as pendências e os próximos passos humanos (revisão do PR, merge e, quando aplicável segundo `docs/PADROES.md` seção 4, o PR `develop → main` para atualizar a Vercel).
