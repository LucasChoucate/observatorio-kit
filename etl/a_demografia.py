"""Etapa A: indicadores demográficos dos bairros (e de Salvador como referência).

Fonte: IBGE, Censo Demográfico 2022, Agregados por Setores Censitários.
Downloads (acesso em 2026-11-20), descompactar em data/raw/:
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_demografia_BR.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_basico_BR_20260520.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_demografia_BR.zip
Dicionário de variáveis:
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/dicionario_de_dados_agregados_por_setores_censitarios_20261113.xlsx

Uso:
  python etl/a_demografia.py             # trata, valida, salva CSV e relatório e carrega no Supabase
  python etl/a_demografia.py --sem-carga # só trata, valida e salva (não precisa de etl/.env)
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from comum import (
    BAIRROS, CODIGO_SALVADOR, COLUNAS_SAIDA, DIR_PROCESSED, DIR_RAW, MARCADORES_AUSENCIA,
    RelatorioQualidade,
    converter_colunas, filtrar_codigos, ler_csv_ibge, percentual, razao,
)

SCRIPT = 'a_demografia'
ANO = 2022
FONTE = 'IBGE_CENSO_2022'
URL_BASE = 'https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios'

ARQUIVOS = {
    'bairro_basico': (
        'Agregados_por_bairros_basico_BR.csv',
        f'{URL_BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip',
    ),
    'bairro_demografia': (
        'Agregados_por_bairros_demografia_BR.csv',
        f'{URL_BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_demografia_BR.zip',
    ),
    'municipio_basico': (
        'Agregados_por_municipios_basico_BR.csv',
        f'{URL_BASE}/Agregados_por_Municipio_csv/Agregados_por_municipios_basico_BR_20260520.zip',
    ),
    'municipio_demografia': (
        'Agregados_por_municipios_demografia_BR.csv',
        f'{URL_BASE}/Agregados_por_Municipio_csv/Agregados_por_municipios_demografia_BR.zip',
    ),
}

# Variáveis do dicionário do IBGE usadas aqui
VARS_BASICO = ['AREA_KM2', 'V0001', 'V0005', 'V0006', 'V0007']
FAIXAS_0_14 = ['V01031', 'V01032', 'V01033']  # 0-4, 5-9, 10-14
FAIXAS_15_59 = ['V01034', 'V01035', 'V01036', 'V01037', 'V01038', 'V01039']  # 15-19 ... 50-59
FAIXAS_60_MAIS = ['V01040', 'V01041']  # 60-69, 70 ou mais
FAIXAS_TODAS = FAIXAS_0_14 + FAIXAS_15_59 + FAIXAS_60_MAIS
VARS_DEMOGRAFIA = ['V01006', 'V01007', 'V01008'] + FAIXAS_0_14 + FAIXAS_15_59 + FAIXAS_60_MAIS

LIMITACAO_FAIXAS = (
    'O arquivo de demografia por bairro agrupa as idades em 60 a 69 e 70 ou mais, por isso o '
    'recorte de idosos é 60+ (não 65+). O denominador é a soma das 11 faixas etárias publicadas '
    '(V01031 a V01041), que no arquivo oficial fica ligeiramente abaixo do total de moradores '
    '(V01006) e de V0001; a diferença é registrada em docs/qualidade/a_demografia.md.'
)
LIMITACAO_BAIRRO = (
    'Os limites de bairro são os adotados pelo IBGE no Censo 2022, que podem não coincidir com a '
    'percepção local ou com outras delimitações municipais.'
)

INDICADORES = [
    {
        'codigo': 'dem_populacao', 'nome': 'População residente', 'unidade': 'pessoas',
        'dimensao': 'demografica', 'classificacao': 'observado',
        'descricao': 'Total de pessoas recenseadas no território.',
        'metodologia': 'Variável V0001 (Total de pessoas) do arquivo Agregados básico.',
        'limitacoes': LIMITACAO_BAIRRO,
        'variaveis': 'V0001',
    },
    {
        'codigo': 'dem_domicilios', 'nome': 'Domicílios particulares ocupados',
        'unidade': 'domicílios', 'dimensao': 'demografica', 'classificacao': 'observado',
        'descricao': 'Domicílios particulares permanentes e improvisados ocupados (DPPO + DPIO).',
        'metodologia': 'Variável V0007 do arquivo Agregados básico.',
        'limitacoes': 'Não inclui domicílios coletivos, vagos ou de uso ocasional. ' + LIMITACAO_BAIRRO,
        'variaveis': 'V0007',
    },
    {
        'codigo': 'dem_moradores_por_domicilio', 'nome': 'Média de moradores por domicílio',
        'unidade': 'moradores/domicílio', 'dimensao': 'demografica', 'classificacao': 'observado',
        'descricao': 'Média de moradores em domicílios particulares ocupados, publicada pelo IBGE.',
        'metodologia': (
            'Variável V0005 do arquivo Agregados básico: pessoas em domicílios particulares '
            'ocupados ÷ (DPPO + DPIO), calculada e publicada pelo IBGE.'
        ),
        'limitacoes': (
            'Publicada com uma casa decimal. Não usar V0001 ÷ V0007, porque V0001 inclui pessoas '
            'em domicílios coletivos.'
        ),
        'variaveis': 'V0005',
    },
    {
        'codigo': 'dem_area_km2', 'nome': 'Área do território', 'unidade': 'km²',
        'dimensao': 'demografica', 'classificacao': 'observado',
        'descricao': 'Área do território segundo a malha do Censo 2022.',
        'metodologia': 'Campo AREA_KM2 do arquivo Agregados básico.',
        'limitacoes': 'Área total do polígono, inclusive áreas não residenciais. ' + LIMITACAO_BAIRRO,
        'variaveis': 'AREA_KM2',
    },
    {
        'codigo': 'dem_densidade_hab_km2', 'nome': 'Densidade demográfica', 'unidade': 'hab/km²',
        'dimensao': 'demografica', 'classificacao': 'derivado',
        'descricao': 'Pessoas por quilômetro quadrado.',
        'metodologia': 'V0001 ÷ AREA_KM2 (arquivo Agregados básico).',
        'limitacoes': (
            'Densidade bruta: a área inclui vias, áreas verdes e equipamentos, o que subestima a '
            'densidade das áreas efetivamente ocupadas.'
        ),
        'variaveis': 'V0001, AREA_KM2',
    },
    {
        'codigo': 'dem_idade_0_14_pct', 'nome': 'População de 0 a 14 anos', 'unidade': '%',
        'dimensao': 'demografica', 'classificacao': 'derivado',
        'descricao': 'Percentual de moradores com 0 a 14 anos.',
        'metodologia': (
            '(V01031 + V01032 + V01033) ÷ (V01031 + ... + V01041) × 100 '
            '(arquivo Agregados demografia).'
        ),
        'limitacoes': LIMITACAO_FAIXAS,
        'variaveis': 'V01031 a V01041',
    },
    {
        'codigo': 'dem_idade_15_59_pct', 'nome': 'População de 15 a 59 anos', 'unidade': '%',
        'dimensao': 'demografica', 'classificacao': 'derivado',
        'descricao': 'Percentual de moradores com 15 a 59 anos.',
        'metodologia': (
            '(V01034 + ... + V01039) ÷ (V01031 + ... + V01041) × 100 '
            '(arquivo Agregados demografia).'
        ),
        'limitacoes': LIMITACAO_FAIXAS,
        'variaveis': 'V01031 a V01041',
    },
    {
        'codigo': 'dem_idade_60_mais_pct', 'nome': 'População de 60 anos ou mais', 'unidade': '%',
        'dimensao': 'demografica', 'classificacao': 'derivado',
        'descricao': 'Percentual de moradores com 60 anos ou mais.',
        'metodologia': (
            '(V01040 + V01041) ÷ (V01031 + ... + V01041) × 100 (arquivo Agregados demografia).'
        ),
        'limitacoes': LIMITACAO_FAIXAS,
        'variaveis': 'V01031 a V01041',
    },
    {
        'codigo': 'dem_mulheres_pct', 'nome': 'Mulheres na população', 'unidade': '%',
        'dimensao': 'demografica', 'classificacao': 'derivado',
        'descricao': 'Percentual de moradoras do sexo feminino.',
        'metodologia': 'V01008 ÷ V01006 × 100 (arquivo Agregados demografia).',
        'limitacoes': (
            'Denominador V01006 (moradores do arquivo de demografia), que no arquivo oficial é '
            'igual a V01007 + V01008.'
        ),
        'variaveis': 'V01008, V01006',
    },
]


def carregar_fontes(relatorio: RelatorioQualidade) -> pd.DataFrame:
    """Lê os quatro arquivos, filtra os territórios e devolve uma linha por território."""
    codigos_bairros = list(BAIRROS)
    partes = []
    for nivel, coluna_cod, coluna_nome, codigos in (
        ('bairro', 'CD_BAIRRO', 'NM_BAIRRO', codigos_bairros),
        ('municipio', 'CD_MUN', 'NM_MUN', [CODIGO_SALVADOR]),
    ):
        tabelas = []
        for tema, variaveis in (('basico', VARS_BASICO), ('demografia', VARS_DEMOGRAFIA)):
            nome, url = ARQUIVOS[f'{nivel}_{tema}']
            bruto = ler_csv_ibge(DIR_RAW / nome)
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
        basico, demografia = tabelas
        relatorio.validar(
            f'Nome do território igual nos arquivos básico e demografia ({nivel})',
            (basico[coluna_nome] == demografia[coluna_nome]).all(),
        )
        junto = basico.join(demografia.drop(columns=[coluna_nome]))
        junto = junto.rename(columns={coluna_nome: 'NOME'})
        junto.index.name = 'CODIGO'
        partes.append(junto)
    return pd.concat(partes)


def calcular(dados: pd.DataFrame) -> pd.DataFrame:
    """Calcula os indicadores (observados e derivados) e devolve no formato longo."""
    total_faixas = dados[FAIXAS_TODAS].sum(axis=1)
    valores = {
        'dem_populacao': dados['V0001'],
        'dem_domicilios': dados['V0007'],
        'dem_moradores_por_domicilio': dados['V0005'],
        'dem_area_km2': dados['AREA_KM2'],
        'dem_densidade_hab_km2': [razao(p, a) for p, a in zip(dados['V0001'], dados['AREA_KM2'])],
        'dem_idade_0_14_pct': [
            percentual(p, t) for p, t in zip(dados[FAIXAS_0_14].sum(axis=1), total_faixas)
        ],
        'dem_idade_15_59_pct': [
            percentual(p, t) for p, t in zip(dados[FAIXAS_15_59].sum(axis=1), total_faixas)
        ],
        'dem_idade_60_mais_pct': [
            percentual(p, t) for p, t in zip(dados[FAIXAS_60_MAIS].sum(axis=1), total_faixas)
        ],
        'dem_mulheres_pct': [percentual(p, t) for p, t in zip(dados['V01008'], dados['V01006'])],
    }
    origem = {
        'bairro': 'Agregados_por_bairros_{}_BR.csv',
        'municipio': 'Agregados_por_municipios_{}_BR.csv',
    }
    linhas = []
    for indicador in INDICADORES:
        serie = list(valores[indicador['codigo']])
        tema = 'demografia' if indicador['variaveis'].startswith('V01') else 'basico'
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
    """Validações de consistência e de faixas plausíveis."""
    relatorio.validar(
        'Três territórios encontrados (2 bairros + Salvador)', len(dados) == 3,
        ', '.join(f'{c} = {n}' for c, n in dados['NOME'].items()),
    )
    for codigo, linha in dados.iterrows():
        nome = linha['NOME']
        soma_faixas = linha[FAIXAS_TODAS].sum()
        relatorio.validar(
            f'{nome}: soma das faixas etárias difere de V01006 em menos de 0,1%',
            abs(soma_faixas - linha['V01006']) / linha['V01006'] < 0.001,
            f'{soma_faixas:.0f} vs {linha["V01006"]:.0f}',
        )
        if soma_faixas != linha['V01006']:
            relatorio.observacoes.append(
                f'{nome}: a soma das faixas etárias ({soma_faixas:.0f}) é '
                f'{linha["V01006"] - soma_faixas:.0f} pessoa(s) menor que V01006 '
                f'({linha["V01006"]:.0f}) no próprio arquivo do IBGE. Não foi corrigida; as faixas '
                'usam a soma das faixas como denominador para fecharem em 100%.'
            )
        soma_sexo = linha['V01007'] + linha['V01008']
        relatorio.validar(
            f'{nome}: homens + mulheres = V01006', soma_sexo == linha['V01006'],
            f'{soma_sexo:.0f} vs {linha["V01006"]:.0f}',
        )
        dif = linha['V0001'] - linha['V01006']
        relatorio.validar(
            f'{nome}: V0001 e V01006 diferem menos de 1%',
            abs(dif) / linha['V0001'] < 0.01,
            f'V0001 = {linha["V0001"]:.0f}, V01006 = {linha["V01006"]:.0f}, diferença = {dif:.0f}',
        )
        relatorio.validar(
            f'{nome}: média de moradores entre 1 e 6', 1 <= linha['V0005'] <= 6,
            f'{linha["V0005"]}',
        )
        relatorio.validar(f'{nome}: área positiva', linha['AREA_KM2'] > 0, f'{linha["AREA_KM2"]}')
        relatorio.observacoes.append(
            f'{nome}: V0006 = {linha["V0006"]} (dicionário do IBGE: total de domicílios '
            'particulares ocupados imputados ÷ total de domicílios particulares ocupados).'
        )
    pct = saida[saida['indicador_codigo'].str.endswith('_pct')]
    relatorio.validar(
        'Percentuais entre 0 e 100', pct['valor'].between(0, 100).all(),
        f'{len(pct)} valores',
    )
    faixas = saida[saida['indicador_codigo'].str.startswith('dem_idade_')]
    somas = faixas.groupby('codigo_ibge')['valor'].sum()
    relatorio.validar(
        'Faixas etárias somam 100% em cada território', ((somas - 100).abs() < 0.01).all(),
        ', '.join(f'{c}: {v:.4f}' for c, v in somas.items()),
    )
    pop = dados['V0001']
    relatorio.validar(
        'População de cada bairro menor que a de Salvador',
        (pop.drop(CODIGO_SALVADOR) < pop[CODIGO_SALVADOR]).all(),
    )
    relatorio.validar(
        'Nenhum valor ausente na saída', saida['valor'].notna().all(),
        f'{saida["valor"].isna().sum()} ausentes',
    )
    relatorio.validar(
        'Sem duplicidade na chave (território, indicador, fonte, ano)',
        not saida.duplicated(['codigo_ibge', 'indicador_codigo', 'fonte_sigla', 'ano']).any(),
    )


def main() -> int:
    """Executa o fluxo completo do script."""
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--sem-carga', action='store_true', help='não envia ao Supabase')
    args = parser.parse_args()

    relatorio = RelatorioQualidade(SCRIPT, 'demografia (etapa A)')
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
