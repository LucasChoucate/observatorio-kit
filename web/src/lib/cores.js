// Cores categóricas de uma paleta validada para daltonismo (ordem fixa, nunca reciclada).
// A cor segue o território, nunca a posição: filtrar um bairro não repinta os demais.
// Os 3 primeiros tons passam na validação entre todos os pares; acima disso, agrupe ou divida.
export const PALETA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];

const COR_POR_TERRITORIO = {
  2927408018: PALETA[0], // Beiru/Tancredo Neves
  2927408117: PALETA[1], // Pernambués
  2927408: PALETA[2], // Salvador (referência municipal)
};

/** Cor fixa de um território pelo código IBGE. */
export function corDoTerritorio(codigoIbge) {
  return COR_POR_TERRITORIO[codigoIbge] ?? PALETA[3];
}
