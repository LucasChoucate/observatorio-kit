# Padrões do projeto

Todas as etapas seguem estes padrões. Se alguma regra precisar mudar, a mudança é feita neste arquivo, em commit próprio, e registrada no PROGRESSO.md.

## 1. Estrutura de pastas

```
/
├── AGENTS.md, CLAUDE.md, README.md
├── .github/                    # template de PR e CI
├── docs/
│   ├── REQUISITOS.md, PADROES.md, PROGRESSO.md
│   ├── etapas/                 # instruções de cada etapa (A a E)
│   ├── catalogo/CATALOGO.md    # catálogo de indicadores e fontes
│   ├── qualidade/              # relatórios de qualidade do ETL, um por script
│   └── relatorio/              # seções do relatório final, uma por arquivo
├── data/
│   ├── raw/                    # arquivos oficiais baixados (grandes não vão pro Git)
│   └── processed/              # CSVs tratados gerados pelo ETL (versionados)
├── etl/
│   ├── comum.py                # funções compartilhadas (leitura, limpeza, validação)
│   ├── carregar.py             # carga no Supabase (upsert)
│   ├── a_demografia.py         # um script por etapa/tema
│   ├── requirements.txt
│   └── .env                    # NÃO versionado
├── supabase/
│   ├── migrations/             # 001_schema.sql, 002_rls.sql, ...
│   └── seeds/                  # dados fixos (territórios, fontes)
└── web/                        # aplicação React + Vite
    ├── public/geo/             # GeoJSON dos limites (etapa C)
    └── src/
        ├── components/         # componentes reutilizáveis
        ├── pages/              # uma página por tela
        ├── services/           # acesso ao Supabase
        ├── lib/                # cliente Supabase e configurações
        ├── hooks/
        └── utils/              # formatação e cálculos puros (com testes)
```

## 2. Branches

- `main`: produção. É o que a Vercel publica. Só recebe merge vindo da `develop`.
- `develop`: integração. Só recebe merge via Pull Request revisado.
- `feature/etapa-<letra>-<tema>`: trabalho de cada etapa. Ex.: `feature/etapa-b-renda-habitacao`.
- `fix/<descricao>`: correções pontuais fora de uma etapa.

## 3. Commits (Conventional Commits em português)

Formato: `tipo(escopo): descrição`

- Descrição no imperativo, minúscula, sem ponto final, até 72 caracteres.
- Corpo opcional, depois de uma linha em branco, explicando o porquê.
- Um assunto por commit.

| Tipo | Quando usar |
|---|---|
| `feat` | nova funcionalidade (tela, componente, script de ETL, tabela) |
| `fix` | correção de bug |
| `docs` | documentação, catálogo, relatório, PROGRESSO |
| `refactor` | mudança de código sem mudar comportamento |
| `style` | formatação, sem mudança de lógica |
| `test` | testes |
| `chore` | configuração, dependências, arquivos auxiliares |
| `ci` | GitHub Actions |
| `build` | configuração de build ou deploy (Vite, Vercel) |

Escopos usados: `web`, `etl`, `db`, `mapa`, `energia`, `docs`, `catalogo`, `relatorio`, `progresso`, `ci`, `deploy`.

Exemplos:
```
feat(etl): adiciona script de importação da população por bairro
feat(web): cria tela de visão geral com seletor de bairro
feat(db): cria tabelas de territórios, fontes, indicadores e observações
fix(web): corrige diferença percentual quando valor base é zero
docs(catalogo): registra indicadores de saneamento do censo 2022
docs(progresso): conclui etapa B
```

## 4. Pull Requests

- Título no padrão de commit. Corpo segue `.github/pull_request_template.md`.
- **Revisor: o responsável pela próxima etapa.** Assim quem continua já conhece o que recebeu.
- Merge com **"Create a merge commit"** (não usar squash), para preservar os commits individuais de cada integrante no histórico.
- Depois do merge na `develop`, abrir PR `develop → main` para atualizar a Vercel.

## 5. Código JavaScript / React

- JavaScript (não TypeScript), módulos ES, componentes funcionais com hooks.
- ESLint + Prettier: 2 espaços, aspas simples, ponto e vírgula, até 100 colunas. Rodar `npm run lint` e `npm run format` antes de commitar.
- Componentes em `PascalCase.jsx`, um por arquivo. Hooks `useAlgo.js`. Utilitários em `camelCase.js`.
- Nomes de domínio em português (`buscarObservacoes`, `SeletorBairro`); termos técnicos podem ficar em inglês (`loading`, `props`).
- Estilo com Tailwind CSS. Layout responsivo obrigatório (testar em largura de celular).
- **Nenhum número de indicador fixo no código.** Todo valor vem do Supabase pelo `services/`.
- Toda visualização mostra fonte, ano e escala (componente `SeloFonte`).
- Toda tela trata três estados: carregando, erro e sem dados.
- Funções puras de cálculo ficam em `utils/` e têm teste no Vitest.
- Variáveis de ambiente só via `import.meta.env.VITE_*`.

## 6. Código Python (ETL)

- Python 3.10+, PEP 8, funções com docstring curta, nomes em português.
- Um script por tema: `etl/<letra>_<tema>.py`. Cada script segue o fluxo:
  1. ler o arquivo bruto de `data/raw/` (documentar a URL de download no topo do script);
  2. filtrar os territórios do projeto;
  3. padronizar nomes, tipos e códigos; tratar ausências (nunca preencher com valor inventado);
  4. calcular derivados com a fórmula escrita no código e no catálogo;
  5. validar (contagens, faixas plausíveis, percentuais entre 0 e 100, códigos IBGE existentes);
  6. salvar em `data/processed/<letra>_<tema>.csv`;
  7. carregar no Supabase via `carregar.py`;
  8. gerar `docs/qualidade/<letra>_<tema>.md` com: arquivo de origem, linhas lidas, linhas filtradas, ausências encontradas e como foram tratadas, validações e resultado.
- Scripts **idempotentes**: rodar duas vezes não duplica dados (upsert pela chave única).
- A `service_role` do Supabase é lida de `etl/.env`, nunca escrita no código.

## 7. Banco de dados (SQL)

- Nomes em `snake_case`, tabelas no plural.
- Toda mudança de esquema é uma nova migration numerada em `supabase/migrations/`. Nunca editar uma migration já aplicada.
- RLS ligado em todas as tabelas: leitura pública (`anon`), escrita somente pela `service_role`.
- Códigos de indicador (`indicadores.codigo`) em `snake_case` com prefixo da dimensão: `dem_`, `eco_`, `soc_`, `hab_`, `urb_`, `ene_`, `sen_`. Ex.: `dem_populacao`, `hab_agua_rede_geral_pct`, `ene_consumo_residencial_ba_mwh`.

## 8. Regras de dados (inegociáveis)

1. Toda observação tem território, indicador, fonte e ano.
2. Dado estadual ou municipal é gravado no território estadual ou municipal, nunca no bairro.
3. Todo indicador tem classificação: `observado`, `derivado` ou `proxy`.
4. Nada de valor inventado ou "aproximado de cabeça". Sem dado, registra a ausência.
5. Toda fonte tem URL e data de acesso.
6. Diferenças entre bairros só são mostradas quando os valores são comparáveis (mesmo indicador, mesmo ano, mesma unidade).

## 9. Catálogo (`docs/catalogo/CATALOGO.md`)

Cada indicador ocupa uma linha desta tabela:

| Código | Nome | Dimensão | Classificação | Fórmula (se derivado) | Unidade | Fonte | Arquivo de origem | Ano | Escala | Limitações | Etapa |
|---|---|---|---|---|---|---|---|---|---|---|---|

Abaixo da tabela, uma seção "Indicadores investigados e não disponíveis" lista o que foi procurado e não existe na escala necessária, com o motivo.

## 10. Seções do relatório (`docs/relatorio/`)

Arquivos numerados, um por pergunta ou grupo de perguntas (ex.: `01-perfil-demografico.md`). Modelo de cada seção:

```markdown
# Pergunta N: <texto da pergunta>

## Resposta curta
2 a 4 frases com a conclusão.

## Dados
Tabela com os valores dos dois bairros (indicador, valor, ano, fonte, classificação).

## Interpretação
O que os dados indicam e o que não indicam.

## Limitações
Escala, ano, proxies, comparabilidade.
```
