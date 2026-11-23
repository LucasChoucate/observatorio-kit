import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { EQUIPE } from '../lib/equipe';
import { TELAS } from '../lib/telas';
import EstadoCarregando from './EstadoCarregando';

function classeLink({ isActive }) {
  const base =
    'block rounded-t-md border-b-2 px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none';
  return isActive
    ? `${base} border-teal-700 font-semibold text-teal-800`
    : `${base} border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900`;
}

export default function Layout() {
  const integrantes = EQUIPE.filter((pessoa) => pessoa.nome);
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <p className="text-xs font-medium tracking-wide text-teal-700 uppercase">
            Salvador/BA · Beiru/Tancredo Neves e Pernambués
          </p>
          <p className="text-lg font-semibold sm:text-xl">
            Observatório de Vulnerabilidade Socioenergética
          </p>
        </div>
        <nav aria-label="Telas do observatório" className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="mt-3 flex gap-1 whitespace-nowrap">
            {TELAS.map((tela) => (
              <li key={tela.caminho}>
                <NavLink to={tela.caminho} end={tela.caminho === '/'} className={classeLink}>
                  {tela.titulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<EstadoCarregando mensagem="Carregando tela…" />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-stone-500 sm:flex-row sm:justify-between">
          <p>
            Projeto integrador · Desenvolvimento Fullstack · SENAI CIMATEC · Dados: IBGE, IPEA e EPE
          </p>
          <p>
            Equipe:{' '}
            {integrantes.map((pessoa) => `${pessoa.nome} (etapa ${pessoa.etapa})`).join(' · ')}
          </p>
        </div>
      </footer>
    </div>
  );
}
