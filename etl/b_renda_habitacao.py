"""Etapa B: indicadores de alfabetização e condições habitacionais (água, esgoto, lixo, banheiro).

Fonte: IBGE, Censo Demográfico 2022, Agregados por Setores Censitários (bairros e municípios).
Downloads (acesso em 2026-11-22), descompactar em data/raw/:
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_alfabetizacao_BR.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_alfabetizacao_BR.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_caracteristicas_domicilio2_BR_20250417.zip

Nota sobre rendimento:
  O Censo Demográfico 2022 não divulgou dados de rendimento/renda nos arquivos de agregados
  por bairros (verificada ausência no dicionário oficial de variáveis em docs/catalogo/CATALOGO.md).
  A indisponibilidade metodológica está registrada no catálogo e nos relatórios analíticos.

Uso:
  python etl/b_renda_habitacao.py             # trata, valida, salva CSV e relatório e carrega no Supabase
  python etl/b_renda_habitacao.py --sem-carga # só trata, valida e salva (não precisa de etl/.env)
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from comum import (
    BAIRROS, CODIGO_SALVADOR, COLUNAS_SAIDA, DIR_PROCESSED, DIR_RAW, MARCADORES_AUSENCIA,
    RelatorioQualidade,
    converter_colunas, filtrar_codigos, ler_csv_ibge, percentual,
)

SCRIPT = 'b_renda_habitacao'
ANO = 2022
FONTE = 'IBGE_CENSO_2022'
URL_BASE = 'https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios'

ARQUIVOS = {
    'bairro_alfabetizacao': (
        'Agregados_por_bairros_alfabetizacao_BR.csv',
        f'{URL_BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_alfabetizacao_BR.zip',
    ),
    'municipio_alfabetizacao': (
        'Agregados_por_municipios_alfabetizacao_BR.csv',
        f'{URL_BASE}/Agregados_por_Municipio_csv/Agregados_por_municipios_alfabetizacao_BR.zip',
    ),
    'bairro_domicilio2': (
        'Agregados_por_bairros_caracteristicas_domicilio2_BR.csv',
        f'{URL_BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip',
    ),
    'municipio_domicilio2': (
        'Agregados_por_municipios_caracteristicas_domicilio2_BR.csv',
        f'{URL_BASE}/Agregados_por_Municipio_csv/Agregados_por_municipios_caracteristicas_domicilio2_BR_20250417.zip',
    ),
}

# Variáveis do dicionário do IBGE:
# Alfabetização (população com 15 anos ou mais):
# V00900: Sabe ler e escrever
# V00901: Não sabe ler e escrever
VARS_ALFA = ['V00900', 'V00901']

# Características do Domicílio - Parte 2:
# V00111: Utiliza rede geral de distribuição de água
# V00309: Destinação do esgoto: rede geral ou pluvial
# V00310: Destinação do esgoto: fossa séptica ou fossa filtro ligada à rede
# V00397: Lixo coletado no domicílio por serviço de limpeza
# V00398: Lixo depositado em caçamba de serviço de limpeza
# V00494: Com banheiro de uso exclusivo com chuveiro e vaso sanitário
# V00495: Sem banheiro de uso exclusivo com chuveiro e vaso sanitário
VARS_DOM2 = ['V00111', 'V00309', 'V00310', 'V00397', 'V00398', 'V00494', 'V00495']

LIMITACAO_BAIRRO = (
    'Os limites de bairro são os adotados pelo IBGE no Censo 2022, que podem não coincidir com a '
    'percepção local ou com outras delimitações municipais.'
)

LIMITACAO_SANEAMENTO = (
    'Refere-se exclusivamente a Domicílios Particulares Permanentes Ocupados (DPPO). Não afere a '
    'qualidade ou a regularidade diária do serviço de fornecimento de água, esgoto ou coleta de lixo.'
)

INDICADORES = [
    {
        'codigo': 'soc_taxa_alfabetizacao_pct',
        'nome': 'Taxa de alfabetização (15 anos ou mais)',
        'unidade': '%',
        'dimensao': 'social',
        'classificacao': 'derivado',
        'descricao': 'Percentual de pessoas com 15 anos ou mais que sabem ler e escrever.',
        'metodologia': (
            'V00900 ÷ (V00900 + V00901) × 100 do arquivo Agregados alfabetização.'
        ),
        'limitacoes': (
            'Critério de alfabetização declarado (capacidade de ler e escrever um bilhete simples '
            'no idioma conhecido). ' + LIMITACAO_BAIRRO
        ),
        'variaveis': 'V00900, V00901',
    },
    {
        'codigo': 'hab_agua_rede_geral_pct',
        'nome': 'Domicílios com água da rede geral',
        'unidade': '%',
        'dimensao': 'habitacional',
        'classificacao': 'derivado',
        'descricao': (
            'Percentual de domicílios particulares permanentes ocupados cuja principal forma de '
            'abastecimento de água é a rede geral de distribuição.'
        ),
        'metodologia': (
            'V00111 ÷ (V00494 + V00495) × 100 do arquivo Características do Domicílio 2.'
        ),
        'limitacoes': LIMITACAO_SANEAMENTO + ' ' + LIMITACAO_BAIRRO,
        'variaveis': 'V00111, V00494, V00495',
    },
    {
        'codigo': 'hab_esgoto_adequado_pct',
        'nome': 'Domicílios com esgoto adequado (rede ou fossa ligada)',
        'unidade': '%',
        'dimensao': 'habitacional',
        'classificacao': 'derivado',
        'descricao': (
            'Percentual de domicílios com esgotamento ligado à rede geral/pluvial ou à fossa '
            'séptica/filtro ligada à rede coletora.'
        ),
        'metodologia': (
            '(V00309 + V00310) ÷ (V00494 + V00495) × 100 do arquivo Características do Domicílio 2.'
        ),
        'limitacoes': (
            'Considera esgotamento adequado conforme critério do Censo 2022/PNSB. Não mede o '
            'tratamento final dos efluentes na estação emissária. ' + LIMITACAO_BAIRRO
        ),
        'variaveis': 'V00309, V00310, V00494, V00495',
    },
    {
        'codigo': 'hab_lixo_coletado_pct',
        'nome': 'Domicílios com lixo coletado',
        'unidade': '%',
        'dimensao': 'habitacional',
        'classificacao': 'derivado',
        'descricao': (
            'Percentual de domicílios atendidos por coleta de lixo (direta no domicílio ou '
            'depositado em caçamba de serviço de limpeza).'
        ),
        'metodologia': (
            '(V00397 + V00398) ÷ (V00494 + V00495) × 100 do arquivo Características do Domicílio 2.'
        ),
        'limitacoes': (
            'Soma a coleta direta e em caçamba. Em bairros com relevo acidentado e vielas, '
            'o descarte em caçamba predomina sobre a coleta porta a porta. ' + LIMITACAO_BAIRRO
        ),
        'variaveis': 'V00397, V00398, V00494, V00495',
    },
    {
        'codigo': 'hab_lixo_cacamba_pct',
        'nome': 'Domicílios com descarte em caçamba',
        'unidade': '%',
        'dimensao': 'habitacional',
        'classificacao': 'derivado',
        'descricao': (
            'Percentual de domicílios cujo lixo é depositado em caçamba pública de serviço de limpeza.'
        ),
        'metodologia': (
            'V00398 ÷ (V00494 + V00495) × 100 do arquivo Características do Domicílio 2.'
        ),
        'limitacoes': (
            'Reflete limitações viárias e topográficas para a circulação de caminhões coletores '
            'no interior das comunidades. ' + LIMITACAO_BAIRRO
        ),
        'variaveis': 'V00398, V00494, V00495',
    },
    {
        'codigo': 'hab_sem_banheiro_exclusivo_pct',
        'nome': 'Domicílios sem banheiro exclusivo',
        'unidade': '%',
        'dimensao': 'habitacional',
        'classificacao': 'derivado',
        'descricao': (
            'Percentual de domicílios particulares permanentes ocupados sem banheiro de uso exclusivo '
            'com chuveiro e vaso sanitário.'
        ),
        'metodologia': (
            'V00495 ÷ (V00494 + V00495) × 100 do arquivo Características do Domicílio 2.'
        ),
        'limitacoes': (
            'Identifica carência extrema de privacidade e infraestrutura sanitária domiciliar. '
            + LIMITACAO_BAIRRO
        ),
        'variaveis': 'V00495, V00494',
    },
]


def carregar_fontes(relatorio: RelatorioQualidade) -> pd.DataFrame:
    """Lê os arquivos de alfabetização e domicílio 2, filtra territórios e consolida."""
    codigos_bairros = list(BAIRROS)
    partes = []

    for nivel, coluna_cod, coluna_nome, codigos in (
        ('bairro', 'CD_BAIRRO', 'NM_BAIRRO', codigos_bairros),
        ('municipio', 'CD_MUN', 'NM_MUN', [CODIGO_SALVADOR]),
    ):
        tabelas = []
        for tema, variaveis in (('alfabetizacao', VARS_ALFA), ('domicilio2', VARS_DOM2)):
            nome, url = ARQUIVOS[f'{nivel}_{tema}']
            caminho = DIR_RAW / nome
            bruto = ler_csv_ibge(caminho)
            filtrado = filtrar_codigos(bruto, coluna_cod, codigos)
            relatorio.registrar_arquivo(
                nome, url, len(bruto), len(filtrado), bruto.attrs['encoding']
            )
            filtrado = filtrado[[coluna_cod, coluna_nome] + variaveis]

            for var in variaveis:
                ausentes = filtrado[filtrado[var].str.strip().isin(MARCADORES_AUSENCIA)]
                for _, linha in ausentes.iterrows():
                    relatorio.ausencias.append(
                        f'{linha[coluna_nome]}: {var} sem valor no arquivo ({linha[var]!r}); '
                        'mantido como ausente (null), sem estimativa.'
                    )
            tabelas.append(converter_colunas(filtrado, variaveis).set_index(coluna_cod))

        alfa, dom2 = tabelas
        relatorio.validar(
            f'Nome do território consistente entre alfabetização e domicílio 2 ({nivel})',
            (alfa[coluna_nome] == dom2[coluna_nome]).all(),
        )
        junto = alfa.join(dom2.drop(columns=[coluna_nome]))
        junto = junto.rename(columns={coluna_nome: 'NOME'})
        junto.index.name = 'CODIGO'
        partes.append(junto)

    return pd.concat(partes)


def calcular(dados: pd.DataFrame) -> pd.DataFrame:
    """Calcula indicadores sociais e habitacionais e formata na estrutura longa."""
    total_alfa_15 = dados['V00900'] + dados['V00901']
    total_dppo = dados['V00494'] + dados['V00495']

    valores = {
        'soc_taxa_alfabetizacao_pct': [
            percentual(sabe, tot) for sabe, tot in zip(dados['V00900'], total_alfa_15)
        ],
        'hab_agua_rede_geral_pct': [
            percentual(agua, tot) for agua, tot in zip(dados['V00111'], total_dppo)
        ],
        'hab_esgoto_adequado_pct': [
            percentual(esg, tot)
            for esg, tot in zip(dados['V00309'] + dados['V00310'], total_dppo)
        ],
        'hab_lixo_coletado_pct': [
            percentual(lixo, tot)
            for lixo, tot in zip(dados['V00397'] + dados['V00398'], total_dppo)
        ],
        'hab_lixo_cacamba_pct': [
            percentual(cac, tot) for cac, tot in zip(dados['V00398'], total_dppo)
        ],
        'hab_sem_banheiro_exclusivo_pct': [
            percentual(sem_banh, tot) for sem_banh, tot in zip(dados['V00495'], total_dppo)
        ],
    }

    origem = {
        'bairro': 'Agregados_por_bairros_{}.csv',
        'municipio': 'Agregados_por_municipios_{}.csv',
    }

    linhas = []
    for indicador in INDICADORES:
        serie = list(valores[indicador['codigo']])
        tema = 'alfabetizacao' if indicador['codigo'].startswith('soc_') else 'caracteristicas_domicilio2'
        for (codigo, linha), valor in zip(dados.iterrows(), serie):
            nivel = 'municipio' if codigo == CODIGO_SALVADOR else 'bairro'
            linhas.append({
                'codigo_ibge': codigo,
                'territorio': linha['NOME'],
                'indicador_codigo': indicador['codigo'],
                'fonte_sigla': FONTE,
                'ano': ANO,
                'valor': round(float(valor), 4) if pd.notna(valor) else None,
                'nota': None,
                'arquivo_origem': origem[nivel].format(tema),
                'variaveis_origem': indicador['variaveis'],
            })
    return pd.DataFrame(linhas, columns=COLUNAS_SAIDA)


def validar(dados: pd.DataFrame, saida: pd.DataFrame, relatorio: RelatorioQualidade) -> None:
    """Regras de validação e consistência metodológica."""
    relatorio.validar(
        'Três territórios encontrados (2 bairros + Salvador)',
        len(dados) == 3,
        ', '.join(f'{c} = {n}' for c, n in dados['NOME'].items()),
    )

    for codigo, linha in dados.iterrows():
        nome = linha['NOME']
        tot_dppo = linha['V00494'] + linha['V00495']
        relatorio.validar(
            f'{nome}: total de DPPO positivo',
            tot_dppo > 0,
            f'{tot_dppo:.0f} domicílios',
        )
        tot_15 = linha['V00900'] + linha['V00901']
        relatorio.validar(
            f'{nome}: população 15+ positiva',
            tot_15 > 0,
            f'{tot_15:.0f} pessoas',
        )
        relatorio.validar(
            f'{nome}: água rede geral <= total DPPO',
            linha['V00111'] <= tot_dppo,
            f'{linha["V00111"]:.0f} vs {tot_dppo:.0f}',
        )
        relatorio.validar(
            f'{nome}: esgoto rede+fossa <= total DPPO',
            (linha['V00309'] + linha['V00310']) <= tot_dppo,
            f'{(linha["V00309"] + linha["V00310"]):.0f} vs {tot_dppo:.0f}',
        )
        relatorio.validar(
            f'{nome}: lixo coletado (direto + caçamba) <= total DPPO',
            (linha['V00397'] + linha['V00398']) <= tot_dppo,
            f'{(linha["V00397"] + linha["V00398"]):.0f} vs {tot_dppo:.0f}',
        )

    # Validações dos percentuais
    relatorio.validar(
        'Todos os percentuais calculados estão entre 0 e 100',
        saida['valor'].between(0, 100).all(),
        f'{len(saida)} observações calculadas',
    )

    # Taxa de alfabetização plausível para Salvador (> 80% e < 100%)
    alfa_vals = saida[saida['indicador_codigo'] == 'soc_taxa_alfabetizacao_pct']['valor']
    relatorio.validar(
        'Taxas de alfabetização na faixa plausível (80% a 100%)',
        alfa_vals.between(80, 100).all(),
        ', '.join(f'{v:.2f}%' for v in alfa_vals),
    )

    relatorio.validar(
        'Nenhum valor ausente na saída gerada',
        saida['valor'].notna().all(),
        f'{saida["valor"].isna().sum()} ausentes',
    )

    relatorio.validar(
        'Sem duplicidade de chave (território, indicador, fonte, ano)',
        not saida.duplicated(['codigo_ibge', 'indicador_codigo', 'fonte_sigla', 'ano']).any(),
    )


def main() -> int:
    """Executa o pipeline da etapa B."""
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--sem-carga', action='store_true', help='não envia ao Supabase')
    args = parser.parse_args()

    relatorio = RelatorioQualidade(SCRIPT, 'renda e habitação (etapa B)')
    dados = carregar_fontes(relatorio)
    saida = calcular(dados)
    validar(dados, saida, relatorio)

    DIR_PROCESSED.mkdir(parents=True, exist_ok=True)
    caminho_csv = DIR_PROCESSED / f'{SCRIPT}.csv'
    saida.to_csv(caminho_csv, index=False, encoding='utf-8', lineterminator='\n')
    caminho_md = relatorio.salvar(len(saida), caminho_csv)
    print(f'CSV: {caminho_csv}\nRelatório: {caminho_md}')

    if not relatorio.aprovado:
        print('Validações falharam; nada foi enviado ao Supabase. Veja o relatório.')
        return 1
    if args.sem_carga:
        print('--sem-carga: dados não enviados ao Supabase.')
        return 0

    from carregar import conectar, garantir_indicador, upsert_observacoes

    cliente = conectar()
    for ind in INDICADORES:
        garantir_indicador(cliente, **{k: v for k, v in ind.items() if k != 'variaveis'})
    enviados = upsert_observacoes(
        cliente, saida, tipos_permitidos={'bairro', 'municipio'}
    )
    print(f'{len(INDICADORES)} indicadores e {enviados} observações enviados ao Supabase.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
