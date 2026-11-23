import { useCallback, useEffect, useState } from 'react';

/**
 * Executa uma consulta assíncrona e expõe { dados, carregando, erro, recarregar }.
 * `consultar` precisa ter identidade estável (função de módulo ou useCallback),
 * senão a consulta é refeita a cada renderização.
 */
export function useConsulta(consultar) {
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState({
    origem: null,
    tentativa: -1,
    dados: null,
    erro: null,
  });

  useEffect(() => {
    let ativo = true;
    Promise.resolve()
      .then(consultar)
      .then(
        (dados) => ativo && setResultado({ origem: consultar, tentativa, dados, erro: null }),
        (erro) => ativo && setResultado({ origem: consultar, tentativa, dados: null, erro }),
      );
    return () => {
      ativo = false;
    };
  }, [consultar, tentativa]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);
  const carregando = resultado.origem !== consultar || resultado.tentativa !== tentativa;

  return {
    dados: carregando ? null : resultado.dados,
    erro: carregando ? null : resultado.erro,
    carregando,
    recarregar,
  };
}
