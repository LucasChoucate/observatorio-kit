"""Etapa C: características urbanísticas do entorno dos domicílios (bairro, município e setor).

Fonte: IBGE, Censo Demográfico 2022, "Características urbanísticas do entorno dos domicílios",
divulgação própria dos Agregados por Setores Censitários (arquivos de 2025-04-17).
Downloads (acesso em 2026-11-27), descompactar em data/raw/:
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Bairro_csv/Agregados_por_bairros_entorno_domic%c3%adlios_BR.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Municipio_csv/Agregados_por_municipios_entorno_domic%c3%adlios_BR.zip
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Setor_csv/Agregados_por_setores_entorno_domic%c3%adlios_BR.zip
Dicionário (dicionario_entorno_domicilios.xlsx dentro do zip):
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/dicionarios_de_dados_entorno.zip
Relação setor → bairro: malha BA_setores_CD2022.gpkg (ver etl/c_malha.py).

Universo: domicílios particulares permanentes ocupados (DPPO) em setores escolhidos para a
aplicação do entorno (V05000). Cada variável conta os domicílios cuja face de quadra tem (ou não)
a característica. Todos os indicadores são V05xxx ÷ V05000 × 100.

Uso:
  python etl/c_urbano.py             # trata, valida, salva CSV e relatório e carrega no Supabase
  python etl/c_urbano.py --sem-carga # só trata, valida e salva (não precisa de etl/.env)
"""

from __future__ import annotations

import argparse
import math
import sys

import geopandas as gpd
import pandas as pd

from comum import (
    BAIRROS, CODIGO_SALVADOR, COLUNAS_SAIDA, DIR_PROCESSED, DIR_RAW, MARCADORES_AUSENCIA,
    RelatorioQualidade,
    converter_colunas, filtrar_codigos, ler_csv_ibge, percentual,
)

SCRIPT = 'c_urbano'
ANO = 2022
FONTE = 'IBGE_CENSO_2022'
URL_BASE = (
    'https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/'
    'Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios'
)
ARQUIVOS = {
    'bairro': (
        'Agregados_por_bairros_entorno_domicílios_BR.csv',
        f'{URL_BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_entorno_domic%c3%adlios_BR.zip',
    ),
    'municipio': (
        'Agregados_por_municipios_entorno_domicílios_BR.csv',
        f'{URL_BASE}/Agregados_por_Municipio_csv/'
        'Agregados_por_municipios_entorno_domic%c3%adlios_BR.zip',
    ),
    'setor': (
        'Agregados_por_setores_entorno_domicílios_BR.csv',
        f'{URL_BASE}/Agregados_por_Setor_csv/Agregados_por_setores_entorno_domic%c3%adlios_BR.zip',
    ),
}
MALHA_SETORES = 'BA_setores_CD2022.gpkg'
CSV_DEMOGRAFIA = DIR_PROCESSED / 'a_demografia.csv'

UNIVERSO = 'V05000'
# Grupos de categorias que, somados, devem fechar o universo V05000 (dicionário do entorno).
GRUPOS = {
    'circulação da via': ['V05001', 'V05002', 'V05003', 'V05004', 'V05005'],
    'via pavimentada': ['V05006', 'V05007', 'V05008'],
    'bueiro': ['V05009', 'V05010', 'V05011'],
    'iluminação pública': ['V05012', 'V05013', 'V05014'],
    'calçada': ['V05021', 'V05022', 'V05023'],
    'rampa para cadeirante': ['V05027', 'V05028', 'V05029'],
    'arborização': ['V05030', 'V05031', 'V05032', 'V05033', 'V05034'],
}
NAO_DECLARADO = 'V05008'  # mesmo valor em todos os grupos sim/não (face não declarada)
VARIAVEIS = [UNIVERSO] + sorted({v for grupo in GRUPOS.values() for v in grupo})

LIMITACAO_ENTORNO = (
    'Descreve a face de quadra onde fica o domicílio, observada pelo recenseador, e não a casa. '
    'Universo: domicílios particulares permanentes ocupados em setores escolhidos para a pesquisa '
    'do entorno (V05000); o denominador inclui as faces não declaradas, por isso o percentual é '
    'um piso. Não mede a qualidade nem a manutenção do item.'
)
LIMITACAO_BAIRRO = (
    'Limites de bairro e setor do IBGE no Censo 2022, que podem não coincidir com a percepção '
    'local.'
)

INDICADORES = [
    {
        'codigo': 'urb_iluminacao_publica_pct',
        'nome': 'Domicílios em face com iluminação pública',
        'numerador': ['V05012'],
        'descricao': 'Percentual de domicílios cuja face de quadra tem iluminação pública.',
        'limitacoes': (
            'Iluminação pública NÃO mede a continuidade nem a qualidade do fornecimento de energia '
            'elétrica nas casas, nem se o poste funciona. ' + LIMITACAO_ENTORNO
        ),
    },
    {
        'codigo': 'urb_via_pavimentada_pct',
        'nome': 'Domicílios em face com via pavimentada',
        'numerador': ['V05006'],
        'descricao': 'Percentual de domicílios cuja face de quadra tem via pavimentada.',
        'limitacoes': (
            'Não distingue o tipo nem o estado do pavimento. ' + LIMITACAO_ENTORNO
        ),
    },
    {
        'codigo': 'urb_calcada_pct',
        'nome': 'Domicílios em face com calçada',
        'numerador': ['V05021'],
        'descricao': 'Percentual de domicílios cuja face de quadra tem calçada.',
        'limitacoes': (
            'Não mede largura, continuidade nem obstáculos (há variável própria para obstáculo). '
            + LIMITACAO_ENTORNO
        ),
    },
    {
        'codigo': 'urb_bueiro_pct',
        'nome': 'Domicílios em face com bueiro ou boca de lobo',
        'numerador': ['V05009'],
        'descricao': 'Percentual de domicílios cuja face de quadra tem bueiro (drenagem).',
        'limitacoes': (
            'Indica a presença do dispositivo, não se a drenagem funciona ou se a área alaga. '
            + LIMITACAO_ENTORNO
        ),
    },
    {
        'codigo': 'urb_arborizacao_pct',
        'nome': 'Domicílios em face com pelo menos uma árvore',
        'numerador': ['V05031', 'V05032', 'V05033'],
        'descricao': (
            'Percentual de domicílios cuja face de quadra tem ao menos uma árvore (1 a 2, 3 a 4 ou '
            '5 ou mais).'
        ),
        'limitacoes': (
            'Conta árvores na face, não a cobertura de copa nem o sombreamento. Junta as faixas de '
            '1 a 2, 3 a 4 e 5 ou mais árvores. ' + LIMITACAO_ENTORNO
        ),
    },
    {
        'codigo': 'urb_rampa_cadeirante_pct',
        'nome': 'Domicílios em face com rampa para cadeirante',
        'numerador': ['V05027'],
        'descricao': 'Percentual de domicílios cuja face de quadra tem rampa para cadeirante.',
        'limitacoes': (
            'Onde não há calçada a rampa não é investigada (fica como não declarada), então o '
            'indicador acompanha a falta de calçada. ' + LIMITACAO_ENTORNO
        ),
    },
    {
        'codigo': 'urb_via_sem_veiculos_pct',
        'nome': 'Domicílios em via só para pedestres, bicicletas e motos',
        'numerador': ['V05003'],
        'descricao': (
            'Percentual de domicílios cuja face de quadra fica em via onde só circulam pedestres, '
            'bicicletas e motocicletas (sem passagem de carros, vans, caminhões ou ônibus).'
        ),
        'limitacoes': (
            'Mede a circulação possível na via (becos, escadarias, vielas), não o motivo nem o '
            'impacto sobre serviços. Pode ajudar a contextualizar o descarte em caçamba, mas não '
            'prova causa. ' + LIMITACAO_ENTORNO
        ),
    },
]
for _ind in INDICADORES:
    _ind.update({
        'unidade': '%', 'dimensao': 'urbana', 'classificacao': 'derivado',
        'metodologia': (
            f"({' + '.join(_ind['numerador'])}) ÷ {UNIVERSO} × 100 do arquivo Agregados por "
            'entorno dos domicílios (Censo 2022). Escalas: bairro, setor censitário e município.'
        ),
        'variaveis': ', '.join(_ind['numerador'] + [UNIVERSO]),
    })
    _ind['limitacoes'] += ' ' + LIMITACAO_BAIRRO


def setores_dos_bairros() -> pd.DataFrame:
    """Setores dos bairros do projeto segundo a malha oficial (CD_SETOR, CD_BAIRRO, NM_BAIRRO)."""
    caminho = DIR_RAW / MALHA_SETORES
    if not caminho.exists():
        raise FileNotFoundError(f'Arquivo não encontrado: {caminho}. Veja etl/c_malha.py.')
    filtro = 'CD_BAIRRO IN ({})'.format(', '.join(f"'{c}'" for c in BAIRROS))
    malha = gpd.read_file(
        caminho, where=filtro, columns=['CD_SETOR', 'CD_BAIRRO', 'NM_BAIRRO'],
        ignore_geometry=True,
    )
    return malha.sort_values('CD_SETOR').reset_index(drop=True)


def ler_agregados(relatorio: RelatorioQualidade, setores: pd.DataFrame) -> dict:
    """Lê os três recortes (bairro, município, setor) e devolve DataFrames numéricos por código."""
    saida = {}
    for nivel, coluna_cod, coluna_nome, codigos in (
        ('bairro', 'CD_BAIRRO', 'NM_BAIRRO', list(BAIRROS)),
        ('municipio', 'CD_MUN', 'NM_MUN', [CODIGO_SALVADOR]),
    ):
        nome, url = ARQUIVOS[nivel]
        bruto = ler_csv_ibge(DIR_RAW / nome)
        filtrado = filtrar_codigos(bruto, coluna_cod, codigos)
        relatorio.registrar_arquivo(nome, url, len(bruto), len(filtrado), bruto.attrs['encoding'])
        for var in VARIAVEIS:
            ausentes = filtrado[filtrado[var].str.strip().isin(MARCADORES_AUSENCIA)]
            for _, linha in ausentes.iterrows():
                relatorio.ausencias.append(
                    f'{linha[coluna_nome]}: {var} sem valor ({linha[var]!r}); mantido como ausente.'
                )
        tabela = converter_colunas(filtrado[[coluna_cod, coluna_nome] + VARIAVEIS], VARIAVEIS)
        saida[nivel] = tabela.rename(columns={coluna_nome: 'NOME'}).set_index(coluna_cod)

    nome, url = ARQUIVOS['setor']
    bruto = ler_csv_ibge(DIR_RAW / nome)
    filtrado = bruto[bruto['CD_SETOR'].str.strip().isin(setores['CD_SETOR'])].copy()
    relatorio.registrar_arquivo(nome, url, len(bruto), len(filtrado), bruto.attrs['encoding'])
    relatorio.validar(
        'Setores do entorno sem duplicidade', filtrado['CD_SETOR'].is_unique,
        f'{len(filtrado)} linhas',
    )
    sem_linha = sorted(set(setores['CD_SETOR']) - set(filtrado['CD_SETOR']))
    for codigo in sem_linha:
        relatorio.ausencias.append(
            f'Setor {codigo}: não aparece no arquivo do entorno (setor não incluído na pesquisa do '
            'entorno); gravado como ausente (null) em todos os indicadores.'
        )
    sigilosos = filtrado[filtrado[VARIAVEIS].isin(MARCADORES_AUSENCIA).any(axis=1)]['CD_SETOR']
    for codigo in sigilosos:
        relatorio.ausencias.append(
            f'Setor {codigo}: valores marcados com "X" (sigilo do IBGE); gravado como ausente '
            '(null), sem estimativa.'
        )
    saida['setor'] = converter_colunas(filtrado[['CD_SETOR'] + VARIAVEIS], VARIAVEIS).set_index(
        'CD_SETOR'
    )
    saida['sem_linha'] = sem_linha
    saida['sigilosos'] = list(sigilosos)
    return saida


def calcular(dados: dict, setores: pd.DataFrame) -> pd.DataFrame:
    """Calcula os indicadores em todas as escalas e devolve no formato longo."""
    linhas = []

    def registrar(codigo, territorio, indicador, valor, nota, arquivo):
        linhas.append({
            'codigo_ibge': codigo,
            'territorio': territorio,
            'indicador_codigo': indicador['codigo'],
            'fonte_sigla': FONTE,
            'ano': ANO,
            'valor': round(float(valor), 4) if valor is not None and pd.notna(valor) else None,
            'nota': nota,
            'arquivo_origem': arquivo,
            'variaveis_origem': indicador['variaveis'],
        })

    for indicador in INDICADORES:
        for nivel in ('bairro', 'municipio'):
            for codigo, linha in dados[nivel].iterrows():
                valor = percentual(linha[indicador['numerador']].sum(), linha[UNIVERSO])
                registrar(codigo, linha['NOME'], indicador, valor, texto_base(linha),
                          ARQUIVOS[nivel][0])
        for _, setor in setores.iterrows():
            codigo = setor['CD_SETOR']
            territorio = f"Setor censitário {codigo} ({setor['NM_BAIRRO']})"
            if codigo in dados['sem_linha']:
                registrar(codigo, territorio, indicador, None,
                          'Setor fora da pesquisa do entorno do IBGE: sem dado.',
                          ARQUIVOS['setor'][0])
                continue
            linha = dados['setor'].loc[codigo]
            numerador = linha[indicador['numerador']]
            if numerador.isna().any() or pd.isna(linha[UNIVERSO]):
                registrar(codigo, territorio, indicador, None,
                          'Valor sigiloso (X) no arquivo do IBGE: sem dado.',
                          ARQUIVOS['setor'][0])
                continue
            valor = percentual(numerador.sum(), linha[UNIVERSO])
            nota = texto_base(linha) if not math.isnan(valor) else (
                'Sem domicílios no universo do entorno: sem dado.'
            )
            registrar(codigo, territorio, indicador, valor, nota, ARQUIVOS['setor'][0])
    return pd.DataFrame(linhas, columns=COLUNAS_SAIDA)


def texto_base(linha: pd.Series) -> str:
    """Texto da nota: universo do entorno e parcela de faces não declaradas (formato pt-BR)."""
    base = int(linha[UNIVERSO])
    nd = percentual(linha[NAO_DECLARADO], linha[UNIVERSO])
    base_txt = f'{base:,}'.replace(',', '.')
    nd_txt = f'{nd:.1f}'.replace('.', ',')
    return (
        f'Base: {base_txt} domicílios no universo do entorno (V05000); faces não declaradas: '
        f'{nd_txt}%.'
    )


def validar(dados: dict, setores: pd.DataFrame, saida: pd.DataFrame,
            relatorio: RelatorioQualidade) -> None:
    """Fechamento das categorias, consistência entre escalas, cobertura e faixas."""
    for nivel in ('bairro', 'municipio'):
        for codigo, linha in dados[nivel].iterrows():
            for grupo, variaveis in GRUPOS.items():
                soma = linha[variaveis].sum()
                relatorio.validar(
                    f"{linha['NOME']}: categorias de {grupo} somam V05000",
                    soma == linha[UNIVERSO], f'{soma:.0f} vs {linha[UNIVERSO]:.0f}',
                )

    numericos = dados['setor'].dropna()
    falhas = sum(
        int((numericos[variaveis].sum(axis=1) != numericos[UNIVERSO]).sum())
        for variaveis in GRUPOS.values()
    )
    relatorio.validar(
        'Setores: categorias de cada grupo somam V05000', falhas == 0,
        f'{len(numericos)} setores com dados, {falhas} falhas',
    )

    junto = dados['setor'].join(setores.set_index('CD_SETOR')['CD_BAIRRO'])
    for codigo, nome in BAIRROS.items():
        soma = junto.loc[junto['CD_BAIRRO'] == codigo, UNIVERSO].sum()
        total = dados['bairro'].loc[codigo, UNIVERSO]
        relatorio.validar(
            f'{nome}: soma de V05000 dos setores igual ao total do bairro', soma == total,
            f'{soma:.0f} vs {total:.0f}',
        )

    demografia = pd.read_csv(CSV_DEMOGRAFIA, dtype={'codigo_ibge': str})
    domicilios = demografia[demografia['indicador_codigo'] == 'dem_domicilios'].set_index(
        'codigo_ibge'
    )['valor']
    for nivel in ('bairro', 'municipio'):
        for codigo, linha in dados[nivel].iterrows():
            cobertura = percentual(linha[UNIVERSO], domicilios.get(codigo))
            relatorio.validar(
                f"{linha['NOME']}: universo do entorno cobre ao menos 90% dos domicílios ocupados",
                cobertura >= 90,
                f'V05000 = {linha[UNIVERSO]:.0f} de {domicilios.get(codigo):.0f} domicílios '
                f'ocupados (dem_domicilios, V0007): {cobertura:.1f}%',
            )
            relatorio.observacoes.append(
                f"{linha['NOME']}: faces não declaradas = "
                f'{percentual(linha[NAO_DECLARADO], linha[UNIVERSO]):.2f}% do universo do entorno.'
            )

    relatorio.validar(
        'Percentuais entre 0 e 100', saida['valor'].dropna().between(0, 100).all(),
        f"{saida['valor'].notna().sum()} valores",
    )
    esperado = len(INDICADORES) * (len(BAIRROS) + 1 + len(setores))
    relatorio.validar(
        'Uma observação por indicador e território (bairros, Salvador e todos os setores)',
        len(saida) == esperado, f'{len(saida)} de {esperado}',
    )
    ausentes = saida[saida['valor'].isna()]
    relatorio.validar(
        'Bairros e Salvador sem valor ausente',
        ausentes['codigo_ibge'].str.len().gt(10).all(),
        f'{len(ausentes)} observações ausentes, todas de setor censitário',
    )
    relatorio.validar(
        'Sem duplicidade na chave (território, indicador, fonte, ano)',
        not saida.duplicated(['codigo_ibge', 'indicador_codigo', 'fonte_sigla', 'ano']).any(),
    )
    relatorio.observacoes.append(
        f"Setores com dado: {len(numericos)} de {len(setores)}. Sem linha no arquivo: "
        f"{', '.join(dados['sem_linha']) or 'nenhum'}. Com sigilo (X): "
        f"{', '.join(dados['sigilosos']) or 'nenhum'}. A soma dos setores com dado já fecha o "
        'total publicado de cada bairro, então os setores ausentes não acrescentam domicílios a '
        'esse total.'
    )


def main() -> int:
    """Executa o fluxo completo do script."""
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--sem-carga', action='store_true', help='não envia ao Supabase')
    args = parser.parse_args()

    relatorio = RelatorioQualidade(SCRIPT, 'entorno urbano dos domicílios (etapa C)')
    setores = setores_dos_bairros()
    dados = ler_agregados(relatorio, setores)
    saida = calcular(dados, setores)
    validar(dados, setores, saida, relatorio)

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
    campos = ('codigo', 'nome', 'unidade', 'dimensao', 'classificacao', 'descricao',
              'metodologia', 'limitacoes')
    for ind in INDICADORES:
        garantir_indicador(cliente, **{k: ind[k] for k in campos})
    enviados = upsert_observacoes(
        cliente, saida, tipos_permitidos={'bairro', 'municipio', 'setor_censitario'}
    )
    print(f'{len(INDICADORES)} indicadores e {enviados} observações enviados ao Supabase.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
