"""Funções compartilhadas do ETL: caminhos, leitura dos CSVs do IBGE, conversão, validação e
relatório de qualidade.

Todas as etapas reutilizam este módulo. Ao acrescentar uma função, mantenha-a genérica (sem
regras de um tema específico) e documente com docstring curta.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------- caminhos
RAIZ = Path(__file__).resolve().parents[1]
DIR_RAW = RAIZ / 'data' / 'raw'
DIR_PROCESSED = RAIZ / 'data' / 'processed'
DIR_QUALIDADE = RAIZ / 'docs' / 'qualidade'

# ---------------------------------------------------------------- territórios do projeto
# Códigos lidos de Agregados_por_bairros_basico_BR.csv (Censo 2022). Ver seed e catálogo.
CODIGO_SALVADOR = '2927408'
CODIGO_BAHIA = '29'
BAIRROS = {
    '2927408018': 'Beiru / Tancredo Neves',  # nome exatamente como no IBGE
    '2927408117': 'Pernambués',
}

# Marcadores usados pelo IBGE para valor ausente ou sigiloso. Nunca são convertidos em número.
MARCADORES_AUSENCIA = {'', 'X', 'x', '-', '.', '..', '...'}

COLUNAS_SAIDA = [
    'codigo_ibge', 'territorio', 'indicador_codigo', 'fonte_sigla', 'ano', 'valor', 'nota',
    'arquivo_origem', 'variaveis_origem',
]


def ler_csv_ibge(caminho: Path) -> pd.DataFrame:
    """Lê um CSV do IBGE (separador ';') como texto, tentando UTF-8 e depois latin-1.

    Os nomes de coluna são convertidos para maiúsculas (o IBGE mistura 'v0001' e 'V01006').
    """
    if not caminho.exists():
        raise FileNotFoundError(
            f'Arquivo não encontrado: {caminho}\n'
            'Baixe-o conforme data/raw/README.md e descompacte em data/raw/.'
        )
    for encoding in ('utf-8', 'latin-1'):
        try:
            df = pd.read_csv(
                caminho, sep=';', dtype=str, encoding=encoding, keep_default_na=False
            )
            break
        except UnicodeDecodeError:
            continue
    df.columns = [c.strip().upper() for c in df.columns]
    df.attrs['encoding'] = encoding
    return df


def para_numero(valor: str) -> float:
    """Converte um valor textual do IBGE em float.

    Aceita decimal com vírgula. Marcadores de ausência/sigilo viram NaN. Qualquer outro texto não
    numérico gera erro (para não esconder problema de leitura).
    """
    texto = str(valor).strip()
    if texto in MARCADORES_AUSENCIA:
        return math.nan
    try:
        return float(texto.replace(',', '.'))
    except ValueError as erro:
        raise ValueError(f'Valor não numérico inesperado: {valor!r}') from erro


def converter_colunas(df: pd.DataFrame, colunas: list[str]) -> pd.DataFrame:
    """Devolve cópia do DataFrame com as colunas indicadas convertidas para número."""
    faltando = [c for c in colunas if c not in df.columns]
    if faltando:
        raise KeyError(f'Colunas ausentes no arquivo: {faltando}')
    saida = df.copy()
    for coluna in colunas:
        saida[coluna] = saida[coluna].map(para_numero)
    return saida


def filtrar_codigos(df: pd.DataFrame, coluna: str, codigos: list[str]) -> pd.DataFrame:
    """Filtra as linhas cujo código está na lista. Erro se algum código não for encontrado."""
    filtrado = df[df[coluna].str.strip().isin(codigos)].copy()
    encontrados = set(filtrado[coluna].str.strip())
    faltando = [c for c in codigos if c not in encontrados]
    if faltando:
        raise ValueError(f'Códigos não encontrados em {coluna}: {faltando}')
    if len(filtrado) != len(codigos):
        raise ValueError(f'Códigos duplicados em {coluna}: esperado {len(codigos)} linhas')
    return filtrado


def percentual(parte: float, total: float) -> float:
    """parte ÷ total × 100. NaN quando o total é zero ou ausente (nunca inventa valor)."""
    if total is None or pd.isna(total) or total == 0 or pd.isna(parte):
        return math.nan
    return parte / total * 100


def razao(numerador: float, denominador: float) -> float:
    """numerador ÷ denominador. NaN quando o denominador é zero ou ausente."""
    if denominador is None or pd.isna(denominador) or denominador == 0 or pd.isna(numerador):
        return math.nan
    return numerador / denominador


# ---------------------------------------------------------------- relatório de qualidade
@dataclass
class RelatorioQualidade:
    """Acumula informações do processamento e gera docs/qualidade/<script>.md."""

    script: str
    titulo: str
    arquivos: list[dict] = field(default_factory=list)
    ausencias: list[str] = field(default_factory=list)
    validacoes: list[tuple[str, bool, str]] = field(default_factory=list)
    observacoes: list[str] = field(default_factory=list)

    def registrar_arquivo(self, nome: str, url: str, linhas_lidas: int, linhas_filtradas: int,
                          encoding: str = '') -> None:
        """Registra um arquivo de origem com as contagens de linhas."""
        self.arquivos.append({
            'nome': nome, 'url': url, 'lidas': linhas_lidas, 'filtradas': linhas_filtradas,
            'encoding': encoding,
        })

    def validar(self, descricao: str, condicao: bool, detalhe: str = '') -> bool:
        """Registra o resultado de uma validação e devolve a própria condição."""
        self.validacoes.append((descricao, bool(condicao), detalhe))
        return bool(condicao)

    @property
    def aprovado(self) -> bool:
        """Verdadeiro se todas as validações passaram."""
        return all(ok for _, ok, _ in self.validacoes)

    def salvar(self, total_observacoes: int, caminho_csv: Path) -> Path:
        """Escreve o relatório em Markdown e devolve o caminho."""
        DIR_QUALIDADE.mkdir(parents=True, exist_ok=True)
        linhas = [
            f'# Relatório de qualidade: {self.titulo}',
            '',
            f'Gerado automaticamente por `etl/{self.script}.py` em {date.today().isoformat()}.',
            '',
            '## Arquivos de origem',
            '',
            '| Arquivo | URL | Encoding | Linhas lidas | Linhas filtradas |',
            '|---|---|---|---|---|',
        ]
        for a in self.arquivos:
            linhas.append(
                f"| `{a['nome']}` | {a['url']} | {a['encoding']} | {a['lidas']} | "
                f"{a['filtradas']} |"
            )
        linhas += ['', '## Ausências e tratamento', '']
        linhas += [f'- {a}' for a in self.ausencias] or ['- Nenhuma ausência encontrada.']
        linhas += ['', '## Validações', '', '| Validação | Resultado | Detalhe |', '|---|---|---|']
        for descricao, ok, detalhe in self.validacoes:
            linhas.append(f"| {descricao} | {'ok' if ok else 'FALHOU'} | {detalhe} |")
        if self.observacoes:
            linhas += ['', '## Observações', '']
            linhas += [f'- {o}' for o in self.observacoes]
        caminho_rel = caminho_csv.relative_to(RAIZ).as_posix()
        linhas += [
            '', '## Resultado', '',
            f"- Situação: **{'aprovado' if self.aprovado else 'REPROVADO'}**",
            f'- Observações geradas: {total_observacoes}',
            f'- Saída: `{caminho_rel}`',
            '',
        ]
        caminho = DIR_QUALIDADE / f'{self.script}.md'
        caminho.write_text('\n'.join(linhas), encoding='utf-8', newline='\n')
        return caminho
