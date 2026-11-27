"""Carga dos dados tratados no Supabase (upsert idempotente).

Usa a chave service_role lida de etl/.env (nunca versionado). A service_role ignora o RLS e
por isso só existe nos scripts locais; o frontend usa apenas a chave anon.

Uso típico em um script de ETL:

    cliente = conectar()
    garantir_indicador(cliente, codigo='dem_populacao', nome='População', ...)
    upsert_observacoes(cliente, df)  # df no formato de comum.COLUNAS_SAIDA
"""

from __future__ import annotations

import math
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

ARQUIVO_ENV = Path(__file__).resolve().parent / '.env'
DIMENSOES = {
    'demografica', 'economica', 'social', 'habitacional', 'urbana', 'energetica', 'socioenergetica'
}
CLASSIFICACOES = {'observado', 'derivado', 'proxy'}
TIPOS_TERRITORIO = {'pais', 'estado', 'municipio', 'bairro', 'setor_censitario'}
TAMANHO_LOTE = 500  # linhas por requisição de upsert e códigos por consulta .in_()


def conectar():
    """Cria o cliente Supabase com a service_role de etl/.env."""
    from supabase import create_client

    load_dotenv(ARQUIVO_ENV)
    url = os.getenv('SUPABASE_URL')
    chave = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not chave or 'SEU-PROJETO' in url:
        raise RuntimeError(
            'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configurados. '
            'Copie etl/.env.example para etl/.env e preencha com as chaves do projeto.'
        )
    return create_client(url, chave)


def buscar_territorio(cliente, codigo_ibge: str) -> dict:
    """Devolve {'id', 'nome', 'tipo'} do território pelo código IBGE. Erro se não existir."""
    resposta = (
        cliente.table('territorios').select('id, nome, tipo')
        .eq('codigo_ibge', codigo_ibge).execute()
    )
    if not resposta.data:
        raise LookupError(
            f'Território com codigo_ibge={codigo_ibge} não existe. Rode o seed '
            'supabase/seeds/001_territorios_fontes.sql.'
        )
    return resposta.data[0]


def buscar_territorios(cliente, codigos: list[str]) -> dict[str, dict]:
    """Devolve {codigo_ibge: {'id', 'nome', 'tipo'}} em lotes. Erro se algum código não existir."""
    unicos = sorted(set(codigos))
    encontrados = {}
    for inicio in range(0, len(unicos), TAMANHO_LOTE):
        lote = unicos[inicio:inicio + TAMANHO_LOTE]
        resposta = (
            cliente.table('territorios').select('id, nome, tipo, codigo_ibge')
            .in_('codigo_ibge', lote).execute()
        )
        for linha in resposta.data:
            encontrados[linha['codigo_ibge']] = {
                'id': linha['id'], 'nome': linha['nome'], 'tipo': linha['tipo'],
            }
    faltando = [c for c in unicos if c not in encontrados]
    if faltando:
        raise LookupError(
            f'Territórios não cadastrados: {faltando[:5]}{"..." if len(faltando) > 5 else ""}. '
            'Rode o seed supabase/seeds/001_territorios_fontes.sql e, para setores censitários, '
            'python etl/c_malha.py.'
        )
    return encontrados


def garantir_territorios(cliente, registros: list[dict]) -> int:
    """Cria ou atualiza territórios (upsert pelo codigo_ibge). Devolve quantos foram enviados.

    Cada registro tem codigo_ibge, nome, tipo e territorio_pai_id. Usado para os setores
    censitários do mapa; os territórios fixos (país, estado, município, bairros) vêm do seed.
    """
    for reg in registros:
        if reg['tipo'] not in TIPOS_TERRITORIO:
            raise ValueError(f"Tipo de território inválido: {reg['tipo']}")
        if not reg.get('codigo_ibge') or not reg.get('nome'):
            raise ValueError(f'Território sem código ou nome: {reg}')
    for inicio in range(0, len(registros), TAMANHO_LOTE):
        cliente.table('territorios').upsert(
            registros[inicio:inicio + TAMANHO_LOTE], on_conflict='codigo_ibge'
        ).execute()
    return len(registros)


def buscar_fonte(cliente, sigla: str) -> int:
    """Devolve o id da fonte pela sigla. Erro se não existir."""
    resposta = cliente.table('fontes').select('id').eq('sigla', sigla).execute()
    if not resposta.data:
        raise LookupError(f'Fonte {sigla} não existe. Rode o seed de fontes.')
    return resposta.data[0]['id']


def garantir_indicador(cliente, codigo: str, nome: str, unidade: str, dimensao: str,
                       classificacao: str, descricao: str = '', metodologia: str = '',
                       limitacoes: str = '') -> int:
    """Cria ou atualiza o indicador (upsert pelo código) e devolve o id."""
    if dimensao not in DIMENSOES:
        raise ValueError(f'Dimensão inválida: {dimensao}')
    if classificacao not in CLASSIFICACOES:
        raise ValueError(f'Classificação inválida: {classificacao}')
    registro = {
        'codigo': codigo, 'nome': nome, 'unidade': unidade, 'dimensao': dimensao,
        'classificacao': classificacao, 'descricao': descricao or None,
        'metodologia': metodologia or None, 'limitacoes': limitacoes or None,
    }
    resposta = cliente.table('indicadores').upsert(registro, on_conflict='codigo').execute()
    return resposta.data[0]['id']


def _valor_json(valor):
    """Converte NaN/None em None (null no banco) e numpy em float nativo."""
    if valor is None or (isinstance(valor, float) and math.isnan(valor)) or pd.isna(valor):
        return None
    return float(valor)


def upsert_observacoes(cliente, df: pd.DataFrame,
                       tipos_permitidos: set[str] | None = None) -> int:
    """Grava observações com upsert pela chave (territorio_id, indicador_id, fonte_id, ano).

    df precisa das colunas codigo_ibge, indicador_codigo, fonte_sigla, ano, valor e nota.
    tipos_permitidos (opcional) impede gravar em tipos de território indevidos, por exemplo
    {'estado'} para dados da EPE, garantindo que nada estadual caia em um bairro.
    Devolve o número de linhas enviadas.
    """
    fontes, indicadores = {}, {}
    territorios = buscar_territorios(cliente, [str(c) for c in df['codigo_ibge']])
    linhas = []
    for reg in df.to_dict('records'):
        codigo = str(reg['codigo_ibge'])
        territorio = territorios[codigo]
        if tipos_permitidos and territorio['tipo'] not in tipos_permitidos:
            raise ValueError(
                f"{reg['indicador_codigo']}: território {territorio['nome']} é do tipo "
                f"{territorio['tipo']}, fora de {sorted(tipos_permitidos)}"
            )
        if reg['fonte_sigla'] not in fontes:
            fontes[reg['fonte_sigla']] = buscar_fonte(cliente, reg['fonte_sigla'])
        if reg['indicador_codigo'] not in indicadores:
            resposta = (
                cliente.table('indicadores').select('id')
                .eq('codigo', reg['indicador_codigo']).execute()
            )
            if not resposta.data:
                raise LookupError(
                    f"Indicador {reg['indicador_codigo']} não cadastrado: "
                    'chame garantir_indicador antes.'
                )
            indicadores[reg['indicador_codigo']] = resposta.data[0]['id']
        nota = reg.get('nota')
        linhas.append({
            'territorio_id': territorio['id'],
            'indicador_id': indicadores[reg['indicador_codigo']],
            'fonte_id': fontes[reg['fonte_sigla']],
            'ano': int(reg['ano']),
            'valor': _valor_json(reg['valor']),
            'nota': None if nota is None or pd.isna(nota) or nota == '' else str(nota),
        })
    for inicio in range(0, len(linhas), TAMANHO_LOTE):
        cliente.table('observacoes').upsert(
            linhas[inicio:inicio + TAMANHO_LOTE],
            on_conflict='territorio_id,indicador_id,fonte_id,ano',
        ).execute()
    return len(linhas)
