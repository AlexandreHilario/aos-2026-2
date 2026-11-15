# API da disciplina — users, messages e tarefas

Backend unico com Node.js, Express, Sequelize, PostgreSQL no Neon e validacao com Zod. O CRUD de tarefas foi integrado ao projeto de users/messages, conforme o enunciado.

## Configurar e executar

1. Crie um projeto no Neon. Em **Connect**, copie a connection string com SSL; para a Vercel, use a conexao com pooling (host com `-pooler`).
2. Preencha `DATABASE_URL` no arquivo local `.env`, seguindo `.env.sample`. Nao envie o `.env` ao GitHub.
3. Mantenha `ERASE_DATABASE_ON_SYNC=false` para preservar os dados.
4. Execute:

```sh
npm install
npm start
```

O servidor escuta em `http://localhost:3000`. Sequelize cria as tabelas ausentes na inicializacao, sem apagar as existentes. Na Vercel, a inicializacao ocorre na primeira requisicao ao banco. O banco deve permitir conexoes e criacao de tabelas.

## Estrutura

- `src/index.js`: inicializacao local e sincronizacao do banco.
- `src/app.js`: configuracao Express e tratamento de erros.
- `src/models/tarefa.js`: modelo Sequelize, UUID gerado pelo backend.
- `src/routes/tarefa.js`: rotas `/tarefas`.
- `src/controllers/tarefaController.js`: validacao e respostas HTTP.
- `src/services/tarefaService.js`: operacoes CRUD.
- `src/validators/tarefa.js`: schemas Zod.
- `api/index.js` e `src/serverless.js`: funcao sem servidor da Vercel.

## Endpoints de tarefas

| Metodo | Rota | Resposta |
| --- | --- | --- |
| POST | /tarefas | 201, tarefa criada |
| GET | /tarefas | 200, array de tarefas |
| GET | /tarefas/:objectId | 200, tarefa encontrada |
| PUT | /tarefas/:objectId | 200, tarefa atualizada |
| DELETE | /tarefas/:objectId | 204, sem corpo |

POST recebe `{"descricao":"Estudar Zod","concluida":false}`. Descricao obrigatoria, de 1 a 2000 caracteres apos remover espacos nas extremidades; concluida opcional com padrao false. `objectId` e um UUID v4 gerado pelo backend e e a chave primaria no PostgreSQL.

PUT aceita descricao, concluida ou ambos, preservando os campos omitidos. Corpo vazio, descricao em branco, tipos incorretos, campos desconhecidos e UUID invalido retornam 400. UUID valido inexistente retorna 404 em GET, PUT e DELETE. As tarefas nao dependem de usuario autenticado; as rotas existentes de users/messages e session permanecem disponiveis.

## Verificacao

```sh
npm test
npm run build
npm run test:neon
```

Os testes HTTP verificam CRUD, UUID, valores padrao, atualizacoes parciais, validacao e 404 com um modelo substituto em memoria. A conexao real com Neon depende de uma DATABASE_URL valida. Importe `postman/tarefas.postman_collection.json` para testar o banco real; execute as requisicoes em ordem. O UUID criado e salvo automaticamente na variavel `objectId`.

`npm run test:neon` verifica o CRUD HTTP contra o banco configurado no `.env`, cria tabelas ausentes e remove a tarefa temporaria ao finalizar. A verificacao real passou em 15/11/2026. O ambiente local utiliza a conexao com pooling; a conexao direta esta preservada em `DATABASE_URL_DIRECT` no `.env`.

## Vercel e entrega

Importe este repositorio e configure **Root Directory: express-01**, framework **Other**, sem Output Directory. O `vercel.json` encaminha as requisicoes para `api/index.js`. Cadastre `DATABASE_URL`, `MY_SECRET` e `ERASE_DATABASE_ON_SYNC=false` nas variaveis de ambiente. Use uma chave propria para MY_SECRET. Publique e confira `/tarefas`.

Antes da entrega:

1. Envie as alteracoes ao GitHub e entregue o link do codigo em `express-01`.
2. Entregue a URL real do backend publicado na Vercel.
3. Troque `baseUrl` na colecao Postman de localhost pela URL da Vercel e exporte a colecao.
4. Grave um video de ate um minuto no Postman: criar, listar, buscar, atualizar, excluir e buscar novamente (404). Publique no YouTube como publico ou nao listado e entregue o link.

Os links da Vercel e YouTube ainda precisam ser preenchidos apos publicacao. Nenhum link de publicacao ficticio foi incluido.

Referencias: [Neon — connection pooling](https://neon.com/docs/connect/connection-pooling) e [Express na Vercel](https://vercel.com/docs/frameworks/backend/express).
