export default function EstadoCarregando({ mensagem = 'Carregando dados…' }) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-xl bg-white p-6 text-stone-600">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-stone-300 border-t-teal-700"
      />
      {mensagem}
    </div>
  );
}
