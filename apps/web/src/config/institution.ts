/**
 * Dados institucionais e de conformidade regulatória (LGPD / CFP / ANPD).
 * Centralizados para facilitar preenchimento na homologação e auditoria.
 */
export const INSTITUTION_CONFIG = {
  companyName: 'Aprumo Saúde e Tecnologia em Práticas Clínicas Ltda.',
  cnpj: '00.000.000/0001-00',
  technicalLead: 'Coordenação Técnica Aprumo',
  council: 'Conselho Regional de Psicologia',
  councilRegistration: 'CRP 06/00000-0',
  dpoName: 'Encarregado pelo Tratamento de Dados Pessoais (LGPD Art. 41)',
  dpoEmail: 'dpo@aprumo.app.br',
  privacyPolicyUrl: '#seguranca',
  dataRegion: 'São Paulo, Brasil (AWS sa-east-1)',
  version: '2.0.0 (2026)',
} as const;
