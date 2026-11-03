import { ParseStore, pointer } from '../src/store.js';

const store = new ParseStore();
const samples = [
  { nome: 'Ana Silva', email: 'ana.silva@example.com', cidade: 'Recife', resumo: 'Pessoa fictícia para demonstração. Desenvolvedora de aplicações web.', curso: 'Ciência da Computação', empresa: 'Empresa Exemplo A', cargo: 'Desenvolvedora júnior', projeto: 'Portal de eventos' },
  { nome: 'Bruno Souza', email: 'bruno.souza@example.com', cidade: 'Olinda', resumo: 'Pessoa fictícia para demonstração. Estudante de tecnologia.', curso: 'Sistemas de Informação', empresa: 'Empresa Exemplo B', cargo: 'Estagiário de desenvolvimento', projeto: 'Organizador de estudos' },
];

// Não apaga dados. Pode ser executado novamente após falha parcial.
for (const sample of samples) {
  const { curso, empresa, cargo, projeto, ...person } = sample;
  let saved = (await store.list('Person', { email: person.email }))[0];
  if (!saved) saved = await store.create('Person', person);
  const pessoa = pointer(saved.objectId);
  const records = [
    ['Education', { pessoa, instituicao: 'Universidade Exemplo', curso, nivel: 'Graduação', inicio: '2024-02-01', descricao: 'Formação fictícia para atividade acadêmica.' }],
    ['Experience', { pessoa, empresa, cargo, inicio: '2025-03-01', descricao: 'Desenvolvimento de APIs e integração com banco de dados.' }],
    ['Project', { pessoa, nome: projeto, descricao: 'Projeto demonstrativo com API REST.', tecnologias: ['JavaScript', 'Express', 'Back4App'] }],
  ];
  for (const [entity, data] of records) {
    if (!(await store.list(entity, { pessoa })).length) await store.create(entity, data);
  }
  console.log(`Currículo cadastrado: ${person.nome} (${saved.objectId})`);
}
