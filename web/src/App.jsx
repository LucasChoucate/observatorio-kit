import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

// Cada tela é carregada sob demanda para o primeiro acesso ficar leve.
const VisaoGeral = lazy(() => import('./pages/VisaoGeral'));
const Comparativo = lazy(() => import('./pages/Comparativo'));
const Mapa = lazy(() => import('./pages/Mapa'));
const Energia = lazy(() => import('./pages/Energia'));
const Metodologia = lazy(() => import('./pages/Metodologia'));
const NaoEncontrada = lazy(() => import('./pages/NaoEncontrada'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<VisaoGeral />} />
          <Route path="comparativo" element={<Comparativo />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="energia" element={<Energia />} />
          <Route path="metodologia" element={<Metodologia />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
