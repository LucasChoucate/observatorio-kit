export const AMBOS = 'ambos';

/**
 * Seleção de um bairro ou dos dois.
 * @param {{codigo_ibge: string, nome: string}[]} props.bairros territórios do tipo bairro
 * @param {string} props.valor código IBGE do bairro ou AMBOS
 * @param {(valor: string) => void} props.onChange
 */
export default function SeletorBairro({ bairros, valor, onChange }) {
  const opcoes = [
    ...bairros.map((b) => ({ valor: b.codigo_ibge, rotulo: b.nome })),
    { valor: AMBOS, rotulo: 'Ambos' },
  ];
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-stone-700">Bairro</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-stone-200 bg-white p-1">
        {opcoes.map((opcao) => {
          const ativo = valor === opcao.valor;
          return (
            <label
              key={opcao.valor}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-500 ${
                ativo ? 'bg-teal-700 font-medium text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <input
                type="radio"
                name="seletor-bairro"
                value={opcao.valor}
                checked={ativo}
                onChange={() => onChange(opcao.valor)}
                className="sr-only"
              />
              {opcao.rotulo}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
