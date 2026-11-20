export default function EmConstrucao({ titulo, etapa }) {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-stone-600">
        Em construção: etapa {etapa}.
      </div>
    </section>
  );
}
