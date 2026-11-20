# Observatório de Vulnerabilidade Socioenergética de Salvador

Aplicação web que integra dados públicos do IBGE (Censo 2022), do IPEA (Atlas da Vulnerabilidade Social) e da EPE (Anuário Estatístico de Energia Elétrica) para caracterizar, comparar e visualizar indicadores de vulnerabilidade social e possíveis condições de vulnerabilidade energética nos bairros **Beiru/Tancredo Neves** e **Pernambués**, em Salvador/BA.

Projeto integrador da UC Desenvolvimento Fullstack, SENAI CIMATEC, Prof. Celso Barreto (AV3).

**Aplicação publicada:** [preencher após o primeiro deploy na Vercel]

## Equipe

| Etapa | Integrante | GitHub | Responsabilidade |
|---|---|---|---|
| A | Lucas Choucate | [@usuario] | Fundação do projeto (repositório, Supabase, React, Vercel), dados demográficos, Tela 1 |
| B | [nome] | [@usuario] | Renda, escolaridade e habitação, Tela 2 (comparativo) |
| C | [nome] | [@usuario] | Infraestrutura urbana, malha territorial, Tela 3 (mapa) |
| D | [nome] | [@usuario] | Dados energéticos (EPE), proxies socioenergéticos, Tela 4 |
| E | [nome] | [@usuario] | IPEA, Tela 5 (metodologia), IEVS, relatório e entrega final |

## Stack

Python (pandas) para ETL · Supabase (PostgreSQL) · React + Vite · Tailwind CSS · Recharts · Leaflet · Vercel · GitHub Actions

## Como a equipe trabalha

O projeto é feito em 5 etapas sequenciais (A → B → C → D → E). Cada integrante executa a sua etapa com ajuda de uma IA (Claude Code, Copilot, Cursor ou outra), que segue as regras de `AGENTS.md`. O estado do projeto fica sempre em `docs/PROGRESSO.md`.

### Passo a passo para quem vai fazer a sua etapa

1. Confira em `docs/PROGRESSO.md` se a etapa anterior está `concluída` e se o PR dela foi mergeado na `develop`.
2. Clone o repositório (se ainda não clonou) e atualize:
   ```bash
   git checkout develop
   git pull
   ```
3. Confira que o Git está com o **seu** nome e e-mail (o mesmo e-mail da sua conta do GitHub), senão seus commits não contam como seus:
   ```bash
   git config user.name
   git config user.email
   ```
4. Peça ao responsável da etapa A as chaves do Supabase **por mensagem privada** e crie `web/.env.local` e `etl/.env` a partir dos `.env.example`.
5. Abra o projeto no VS Code com a sua IA e mande esta mensagem:

   > Leia o AGENTS.md e siga as instruções. Sou [seu nome], responsável pela etapa [letra]. Verifique a etapa anterior, me mostre o plano da minha etapa e comece.

6. Acompanhe, faça os passos humanos que a IA pedir (painéis do Supabase e da Vercel, downloads) e confira o resultado no navegador.
7. No final a IA atualiza o `PROGRESSO.md` e abre o Pull Request. Avise a próxima pessoa: ela é quem revisa o seu PR.
8. Depois do merge na `develop`, abram o PR `develop → main` para atualizar o site publicado.

### Enquanto não chega a sua vez

Leia `docs/REQUISITOS.md` e o arquivo da sua etapa em `docs/etapas/`. Dá para adiantar a investigação: abrir os links das fontes, baixar os arquivos que a sua etapa usa e anotar o que existe por bairro. Isso não depende do código.

## Como rodar localmente

Pré-requisitos: Node.js 20 ou mais recente, Python 3.10 ou mais recente e Git. As chaves do Supabase são
passadas pelo responsável da etapa A **por mensagem privada**, nunca pelo repositório.

### Frontend (`web/`)

```bash
cd web
cp .env.example .env.local      # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev                     # http://localhost:5173
```

Outros comandos: `npm run lint`, `npm run format`, `npm test` e `npm run build`.

### ETL (`etl/`)

```bash
python -m venv etl/.venv
# Windows: etl\.venv\Scripts\activate    Linux/macOS: source etl/.venv/bin/activate
pip install -r etl/requirements.txt
cp etl/.env.example etl/.env    # preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (nunca no frontend)
```

1. Baixe os arquivos listados em `data/raw/README.md` e descompacte em `data/raw/`.
2. Rode o script da etapa. Exemplo da etapa A:
   ```bash
   python etl/a_demografia.py              # trata, valida, gera CSV e relatório e carrega no Supabase
   python etl/a_demografia.py --sem-carga  # só trata e valida, sem precisar do etl/.env
   ```
   Saídas: `data/processed/a_demografia.csv` e `docs/qualidade/a_demografia.md`. O script pode ser
   rodado várias vezes sem duplicar dados (upsert).

### Banco (Supabase)

Execute no SQL Editor do Supabase, nesta ordem: `supabase/migrations/001_schema.sql`,
`supabase/migrations/002_rls.sql` e `supabase/seeds/001_territorios_fontes.sql`. Migrations novas
recebem o próximo número e nunca editam as já aplicadas.

## Documentação

- `docs/REQUISITOS.md`: resumo do roteiro do professor
- `docs/PADROES.md`: padrões de código, commit, branches e dados
- `docs/PROGRESSO.md`: estado atual do projeto e registros de cada etapa
- `docs/etapas/`: instruções detalhadas de cada etapa
- `docs/catalogo/CATALOGO.md`: catálogo de indicadores e fontes
- `docs/relatorio/`: relatório comparativo dos bairros
