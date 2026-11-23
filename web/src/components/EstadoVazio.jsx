export default function EstadoVazio({ mensagem = 'Nenhum dado disponível.', children }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-stone-600">
      <p>{mensagem}</p>
      {children}
    </div>
  );
}
