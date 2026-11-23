import { Link } from 'react-router-dom';

export default function NaoEncontrada() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <Link to="/" className="text-teal-800 underline">
        Voltar para a visão geral
      </Link>
    </section>
  );
}
