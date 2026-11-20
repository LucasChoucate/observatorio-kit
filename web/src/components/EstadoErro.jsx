export default function EstadoErro({ mensagem, onTentarNovamente }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
      <p className="font-semibold">Não foi possível carregar os dados.</p>
      {mensagem && <p className="mt-1 text-sm">{mensagem}</p>}
      {onTentarNovamente && (
        <button
          type="button"
          onClick={onTentarNovamente}
          className="mt-3 rounded-md bg-red-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-900 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
