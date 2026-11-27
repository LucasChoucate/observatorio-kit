// Camadas temáticas da Tela 3 (mapa). Só configuração: nome, valores, fonte e ano vêm do
// Supabase. `atencao` diz qual ponta da escala merece mais atenção e fica com o tom mais
// escuro: 'menor' (ex.: pouca iluminação pública) ou 'maior' (ex.: mais descarte em caçamba).
// `rotuloCurto` é o nome no eixo do gráfico. A escala (setor ou bairro) é decidida pelos
// dados: se houver valores por setor, o mapa usa setor; senão, bairro, com aviso de escala.
export const CAMADAS = [
  {
    codigo: 'urb_iluminacao_publica_pct',
    rotuloCurto: 'Iluminação pública',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios com iluminação pública na face de quadra.',
  },
  {
    codigo: 'urb_calcada_pct',
    rotuloCurto: 'Calçada',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios com calçada na face de quadra.',
  },
  {
    codigo: 'urb_arborizacao_pct',
    rotuloCurto: 'Arborização',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios com ao menos uma árvore na face de quadra.',
  },
  {
    codigo: 'urb_bueiro_pct',
    rotuloCurto: 'Bueiro',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios com bueiro ou boca de lobo na face de quadra.',
  },
  {
    codigo: 'urb_via_sem_veiculos_pct',
    rotuloCurto: 'Via sem veículos',
    atencao: 'maior',
    leitura: 'Tons escuros: mais domicílios em vias onde só passam pedestres, bicicletas e motos.',
  },
  {
    codigo: 'urb_via_pavimentada_pct',
    rotuloCurto: 'Via pavimentada',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios em via pavimentada.',
  },
  {
    codigo: 'urb_rampa_cadeirante_pct',
    rotuloCurto: 'Rampa',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios com rampa para cadeirante na face de quadra.',
  },
  {
    codigo: 'hab_lixo_cacamba_pct',
    rotuloCurto: 'Lixo em caçamba',
    atencao: 'maior',
    leitura: 'Tons escuros: mais domicílios que descartam o lixo em caçamba.',
  },
  {
    codigo: 'hab_esgoto_adequado_pct',
    rotuloCurto: 'Esgoto adequado',
    atencao: 'menor',
    leitura: 'Tons escuros: menos domicílios com esgoto por rede ou fossa ligada à rede.',
  },
  {
    codigo: 'eco_rendimento_mediano_responsavel_rs',
    rotuloCurto: 'Rendimento mediano',
    atencao: 'menor',
    leitura: 'Tons escuros: rendimento mediano do responsável mais baixo.',
  },
];
