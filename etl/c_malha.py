"""Etapa C: malha territorial oficial (bairros e setores censitários) para o mapa da Tela 3.

Fonte: IBGE, Censo Demográfico 2022, malha de setores censitários com atributos (versão de
2024-11-13). Downloads (acesso em 2026-11-27), salvar em data/raw/ sem renomear:
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/BA_bairros_CD2022.gpkg
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/setores/gpkg/UF/BA/BA_setores_CD2022.gpkg
Dicionário dos atributos:
  https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/Dicionario_de_dados_malha_agregados.xlsx

O que o script faz:
  1. lê os polígonos dos dois bairros e dos setores que pertencem a eles (SIRGAS 2000, EPSG:4674);
  2. calcula a área em SIRGAS 2000 / UTM 24S (EPSG:31984) e compara com o AREA_KM2 do IBGE;
  3. confere se os setores cobrem o bairro sem sobra nem falta relevante;
  4. simplifica a geometria preservando as divisas comuns entre setores, converte para WGS84
     (EPSG:4326) e grava web/public/geo/bairros.geojson e web/public/geo/setores.geojson;
  5. registra os setores no Supabase (tabela territorios, tipo setor_censitario, pai = bairro).

A geometria é estática (não é indicador). Os valores que colorem o mapa vêm do Supabase.

Uso:
  python etl/c_malha.py             # gera GeoJSON, CSV e relatório e registra os setores
  python etl/c_malha.py --sem-carga # só gera os arquivos (não precisa de etl/.env)
"""

from __future__ import annotations

import argparse
import json
import sys

import geopandas as gpd
import pandas as pd

from comum import BAIRROS, DIR_PROCESSED, DIR_RAW, RAIZ, RelatorioQualidade

SCRIPT = 'c_malha'
URL_MALHA = (
    'https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/'
    'malha_com_atributos'
)
ARQUIVOS = {
    'bairros': ('BA_bairros_CD2022.gpkg', f'{URL_MALHA}/bairros/gpkg/UF/BA/BA_bairros_CD2022.gpkg'),
    'setores': ('BA_setores_CD2022.gpkg', f'{URL_MALHA}/setores/gpkg/UF/BA/BA_setores_CD2022.gpkg'),
}
DIR_GEO = RAIZ / 'web' / 'public' / 'geo'

CRS_ORIGEM = 'EPSG:4674'  # SIRGAS 2000 geográfico, como publicado pelo IBGE
CRS_METRICO = 'EPSG:31984'  # SIRGAS 2000 / UTM zona 24S (Salvador fica na zona 24)
CRS_WEB = 'EPSG:4326'  # WGS84, exigido pelo GeoJSON (RFC 7946) e usado pelo Leaflet
TOLERANCIA_M = 1.0  # simplificação em metros, bem abaixo da escala de leitura do mapa
CASAS_COORD = 6  # ~0,1 m em latitude; suficiente para o mapa e deixa o arquivo leve
LIMITE_TAMANHO_BYTES = 2 * 1024 * 1024

# Categorias de CD_TIPO do dicionário da malha (Dicionario_de_dados_malha_agregados.xlsx)
TIPOS_SETOR = {
    '0': 'Não especial',
    '1': 'Favela e Comunidade Urbana',
    '2': 'Quartel e base militar',
    '3': 'Alojamento / acampamento',
    '4': 'Setor com baixo patamar domiciliar',
    '5': 'Agrupamento indígena',
    '6': 'Unidade prisional',
    '7': 'Convento / hospital / ILPI / IACA',
    '8': 'Agrovila do PA',
    '9': 'Agrupamento quilombola',
}


def ler_malha(relatorio: RelatorioQualidade) -> tuple[gpd.GeoDataFrame, gpd.GeoDataFrame]:
    """Lê os polígonos dos bairros do projeto e dos setores contidos neles."""
    codigos = list(BAIRROS)
    filtro = 'CD_BAIRRO IN ({})'.format(', '.join(f"'{c}'" for c in codigos))
    saida = []
    for chave in ('bairros', 'setores'):
        nome, url = ARQUIVOS[chave]
        caminho = DIR_RAW / nome
        if not caminho.exists():
            raise FileNotFoundError(f'Arquivo não encontrado: {caminho}\nBaixe de {url}')
        total = len(gpd.read_file(caminho, columns=['CD_BAIRRO'], ignore_geometry=True))
        camada = gpd.read_file(caminho, where=filtro)
        relatorio.registrar_arquivo(nome, url, total, len(camada), 'GeoPackage')
        saida.append(camada)
    bairros, setores = saida
    return bairros, setores


def validar_e_medir(bairros: gpd.GeoDataFrame, setores: gpd.GeoDataFrame,
                    relatorio: RelatorioQualidade) -> pd.DataFrame:
    """Valida a malha, calcula as áreas em projeção métrica e devolve a tabela de áreas."""
    relatorio.validar(
        'Malha em SIRGAS 2000 (EPSG:4674)', bairros.crs == CRS_ORIGEM and setores.crs == CRS_ORIGEM,
        f'bairros: {bairros.crs}, setores: {setores.crs}',
    )
    relatorio.validar(
        'Os dois bairros do projeto estão na malha', set(bairros['CD_BAIRRO']) == set(BAIRROS),
        ', '.join(f'{c} = {n}' for c, n in zip(bairros['CD_BAIRRO'], bairros['NM_BAIRRO'])),
    )
    for codigo, nome in BAIRROS.items():
        nome_malha = bairros.loc[bairros['CD_BAIRRO'] == codigo, 'NM_BAIRRO'].iloc[0]
        relatorio.validar(
            f'{codigo}: nome na malha igual ao dos agregados', nome_malha == nome,
            f'{nome_malha!r}',
        )
    relatorio.validar(
        'Códigos de setor únicos e com 15 dígitos',
        setores['CD_SETOR'].is_unique and setores['CD_SETOR'].str.fullmatch(r'\d{15}').all(),
        f'{len(setores)} setores',
    )
    relatorio.validar(
        'Geometrias válidas', bairros.is_valid.all() and setores.is_valid.all(),
        f'{(~bairros.is_valid).sum()} bairros e {(~setores.is_valid).sum()} setores inválidos',
    )

    bairros_m = bairros.to_crs(CRS_METRICO)
    setores_m = setores.to_crs(CRS_METRICO)
    linhas = []
    for _, bairro in bairros_m.iterrows():
        codigo = bairro['CD_BAIRRO']
        area_calc = bairro.geometry.area / 1e6
        area_ibge = float(bairro['AREA_KM2'])
        dif_pct = (area_calc - area_ibge) / area_ibge * 100
        relatorio.validar(
            f"{bairro['NM_BAIRRO']}: área calculada (UTM 24S) difere do AREA_KM2 em menos de 1%",
            abs(dif_pct) < 1,
            f'{area_calc:.4f} km² calculada vs {area_ibge:.6f} km² do IBGE ({dif_pct:+.3f}%)',
        )
        do_bairro = setores_m[setores_m['CD_BAIRRO'] == codigo]
        uniao = do_bairro.geometry.union_all()
        sobra_falta = bairro.geometry.symmetric_difference(uniao).area / bairro.geometry.area * 100
        relatorio.validar(
            f"{bairro['NM_BAIRRO']}: setores cobrem o bairro (diferença de área < 0,5%)",
            sobra_falta < 0.5,
            f'{len(do_bairro)} setores; diferença simétrica de {sobra_falta:.4f}% da área',
        )
        soma_area_setores = do_bairro['AREA_KM2'].astype(float).sum()
        tipos = do_bairro['CD_TIPO'].astype(str).map(TIPOS_SETOR).value_counts()
        relatorio.observacoes.append(
            f"{bairro['NM_BAIRRO']}: {len(do_bairro)} setores censitários "
            f"({'; '.join(f'{n}: {q}' for n, q in tipos.items())}). Soma do AREA_KM2 dos setores "
            f'= {soma_area_setores:.6f} km².'
        )
        linhas.append({
            'codigo_ibge': codigo,
            'territorio': bairro['NM_BAIRRO'],
            'setores': len(do_bairro),
            'area_km2_ibge': round(area_ibge, 6),
            'area_km2_utm24s': round(area_calc, 6),
            'diferenca_pct': round(dif_pct, 4),
            'crs_calculo': CRS_METRICO,
        })
    relatorio.validar(
        'Todos os setores pertencem a um dos dois bairros',
        setores['CD_BAIRRO'].isin(list(BAIRROS)).all(), f'{len(setores)} setores',
    )
    return pd.DataFrame(linhas)


def simplificar(camada: gpd.GeoDataFrame) -> gpd.GeoSeries:
    """Simplifica em metros preservando as divisas comuns e devolve a geometria em WGS84."""
    metrica = camada.geometry.to_crs(CRS_METRICO)
    simplificada = metrica.simplify_coverage(TOLERANCIA_M)
    return simplificada.to_crs(CRS_WEB)


def arredondar(coordenadas):
    """Arredonda recursivamente as coordenadas de uma geometria GeoJSON."""
    if isinstance(coordenadas[0], (int, float)):
        return [round(c, CASAS_COORD) for c in coordenadas]
    return [arredondar(c) for c in coordenadas]


def gravar_geojson(nome: str, geometrias: gpd.GeoSeries, propriedades: list[dict],
                   relatorio: RelatorioQualidade) -> None:
    """Grava um FeatureCollection compacto em web/public/geo/<nome>.geojson."""
    features = []
    for geometria, props in zip(geometrias, propriedades):
        geo = geometria.__geo_interface__
        features.append({
            'type': 'Feature',
            'properties': props,
            'geometry': {'type': geo['type'], 'coordinates': arredondar(geo['coordinates'])},
        })
    colecao = {
        'type': 'FeatureCollection',
        'name': nome,
        'fonte': 'IBGE, Censo Demográfico 2022, malha de setores censitários com atributos',
        'features': features,
    }
    DIR_GEO.mkdir(parents=True, exist_ok=True)
    caminho = DIR_GEO / f'{nome}.geojson'
    texto = json.dumps(colecao, ensure_ascii=False, separators=(',', ':'))
    caminho.write_text(texto + '\n', encoding='utf-8', newline='\n')
    tamanho = caminho.stat().st_size
    relatorio.validar(
        f'{caminho.relative_to(RAIZ).as_posix()} com menos de 2 MB',
        tamanho < LIMITE_TAMANHO_BYTES, f'{tamanho / 1024:.1f} KB, {len(features)} feições',
    )
    relatorio.validar(
        f'{nome}.geojson: geometrias válidas depois da simplificação',
        geometrias.is_valid.all(), f'{(~geometrias.is_valid).sum()} inválidas',
    )


def exportar(bairros: gpd.GeoDataFrame, setores: gpd.GeoDataFrame,
             relatorio: RelatorioQualidade) -> None:
    """Gera os dois GeoJSON do mapa, com propriedades mínimas para ligar aos dados do banco."""
    gravar_geojson(
        'bairros', simplificar(bairros),
        [{'codigo_ibge': c, 'nome': n, 'tipo': 'bairro'}
         for c, n in zip(bairros['CD_BAIRRO'], bairros['NM_BAIRRO'])],
        relatorio,
    )
    setores = setores.sort_values('CD_SETOR').reset_index(drop=True)
    gravar_geojson(
        'setores', simplificar(setores),
        [{
            'codigo_ibge': s, 'codigo_bairro': b, 'nome_bairro': n, 'tipo': 'setor_censitario',
            'tipo_setor': TIPOS_SETOR.get(str(t), str(t)),
        } for s, b, n, t in zip(
            setores['CD_SETOR'], setores['CD_BAIRRO'], setores['NM_BAIRRO'], setores['CD_TIPO'],
        )],
        relatorio,
    )


def registrar_setores(setores: gpd.GeoDataFrame) -> int:
    """Cadastra os setores na tabela territorios (upsert pelo código), filhos do bairro."""
    from carregar import buscar_territorio, conectar, garantir_territorios

    cliente = conectar()
    pais = {codigo: buscar_territorio(cliente, codigo)['id'] for codigo in BAIRROS}
    registros = [
        {
            'codigo_ibge': setor, 'nome': f'Setor censitário {setor}',
            'tipo': 'setor_censitario', 'territorio_pai_id': pais[bairro],
        }
        for setor, bairro in zip(setores['CD_SETOR'], setores['CD_BAIRRO'])
    ]
    return garantir_territorios(cliente, registros)


def main() -> int:
    """Executa o fluxo completo do script."""
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--sem-carga', action='store_true', help='não envia ao Supabase')
    args = parser.parse_args()

    relatorio = RelatorioQualidade(SCRIPT, 'malha territorial (etapa C)')
    bairros, setores = ler_malha(relatorio)
    areas = validar_e_medir(bairros, setores, relatorio)
    exportar(bairros, setores, relatorio)
    relatorio.observacoes += [
        f'Área calculada em {CRS_METRICO} (SIRGAS 2000 / UTM 24S). A diferença para o AREA_KM2 '
        'do IBGE é só de projeção; os indicadores dem_area_km2 e dem_densidade_hab_km2 (etapa A) '
        'continuam com o AREA_KM2 oficial e não foram recalculados.',
        f'Simplificação de cobertura (simplify_coverage) com tolerância de {TOLERANCIA_M} m em '
        f'{CRS_METRICO}, que mantém as divisas comuns entre setores sem abrir frestas; '
        f'coordenadas em {CRS_WEB} com {CASAS_COORD} casas decimais.',
        'Os GeoJSON não trazem nenhum valor de indicador: só códigos e nomes, para ligar cada '
        'polígono às observações do Supabase.',
    ]

    DIR_PROCESSED.mkdir(parents=True, exist_ok=True)
    caminho_csv = DIR_PROCESSED / f'{SCRIPT}.csv'
    areas.to_csv(caminho_csv, index=False, encoding='utf-8', lineterminator='\n')
    caminho_md = relatorio.salvar(0, caminho_csv)
    print(f'CSV: {caminho_csv}\nRelatório: {caminho_md}\nGeoJSON: {DIR_GEO}')

    if not relatorio.aprovado:
        print('Validações falharam; nada foi enviado ao Supabase. Veja o relatório.')
        return 1
    if args.sem_carga:
        print('--sem-carga: setores não registrados no Supabase.')
        return 0
    enviados = registrar_setores(setores)
    print(f'{enviados} setores censitários registrados no Supabase (tabela territorios).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
