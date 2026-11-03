# API de currículos

API REST em Express com persistência no Back4App (Parse), conforme a troca de banco autorizada pelo professor. Esta versão não utiliza PostgreSQL/NeonDB. O exemplo anterior em `express-01` foi preservado.

## Executar

Requer Node.js 22 ou superior. No PowerShell:

```powershell
cd curriculum-api
npm.cmd ci
Copy-Item .env.example .env
# Preencha as credenciais em .env antes dos próximos comandos.
npm.cmd run seed
npm.cmd start
```

No Back4App, crie um aplicativo Backend e copie Application ID e Master Key de suas configurações para `BACK4APP_APP_ID` e `BACK4APP_MASTER_KEY`. Defina também `API_WRITE_KEY` com um segredo próprio. Nunca versione `.env` ou coloque a Master Key no Postman. O servidor usa a Master Key; os objetos são criados com ACL privada. Desabilite criação pública de classes e permissões públicas de escrita no dashboard; o servidor continua tendo acesso pela Master Key.

O seed cria duas pessoas fictícias, Ana Silva e Bruno Souza, cada uma com formação, experiência profissional e projeto. Não representa currículos reais. Pode ser repetido sequencialmente sem duplicar os dados de demonstração; não deve ser executado simultaneamente. O cadastro no banco só ocorre quando `npm.cmd run seed` termina com sucesso.

## Entidades e relacionamentos

| Rota | Classe Back4App | Campos obrigatórios |
| --- | --- | --- |
| `/pessoas` | Person | nome, email |
| `/formacoes` | Education | instituicao, curso, inicio, pessoaId |
| `/experiencias` | Experience | empresa, cargo, inicio, pessoaId |
| `/projetos` | Project | nome, descricao, pessoaId |

Uma pessoa tem muitas formações, experiências e projetos. Cada filho aponta para exatamente uma pessoa usando Pointer do Parse. A API valida a existência da pessoa antes de criar ou transferir um vínculo. Campos disponíveis estão em `src/app.js`.

Todas as entidades oferecem `GET /entidade`, `POST /entidade`, `GET /entidade/:id`, `PUT /entidade/:id`, `PATCH /entidade/:id` e `DELETE /entidade/:id`. PUT exige os campos obrigatórios; campos opcionais omitidos são preservados. PATCH aceita atualização parcial. Use `objectId` retornado no cadastro como ID. Exclusão de pessoa com vínculos retorna 409; exclua ou transfira os filhos primeiro. Não há transação entre operações distintas do Parse: evite excluir pessoas e criar vínculos simultaneamente neste projeto acadêmico.

Consultas de relacionamento: `GET /pessoas/:id/formacoes`, `/experiencias`, `/projetos` e `/curriculo`. Listagens aceitam `limit` (1 a 100) e `skip` (a partir de 0). O currículo completo também aplica essa paginação a cada seção. Filtre filhos usando `GET /projetos?pessoaId=ID` (também nas outras seções).

Leituras são públicas. POST, PUT, PATCH e DELETE exigem o cabeçalho `x-api-key` com o valor de `API_WRITE_KEY`. Respostas: 201 criação, 200 consulta/atualização, 204 exclusão, 400 entrada inválida, 401 chave inválida, 404 inexistente, 409 pessoa com vínculos, 502 falha no provedor, 503 configuração ausente. `/health` verifica o processo, não a conexão com o banco.

## Publicar no Vercel

1. Envie a pasta e o lockfile ao GitHub. Repositório existente: https://github.com/AlexandreHilario/aos-2026-2
2. Importe o repositório no Vercel e selecione **Root Directory: curriculum-api**, preset **Other**. Não configure diretório de saída nem comando de build.
3. Cadastre `BACK4APP_APP_ID`, `BACK4APP_MASTER_KEY`, `BACK4APP_SERVER_URL` e `API_WRITE_KEY` nas variáveis de ambiente do Vercel. Faça o deploy.
4. Execute o seed localmente com as credenciais do mesmo banco. Confirme os dois currículos via `GET /pessoas` e `/pessoas/:id/curriculo` na URL publicada.
5. Importe `postman/curriculos.postman_collection.json`. Na aba Variables da coleção, troque `baseUrl` pela URL real HTTPS do Vercel, sem barra final, e preencha `apiKey`. Salve e execute a coleção em ordem. Os IDs são preenchidos automaticamente pelos testes. Exporte a coleção com a URL publicada antes de entregar. Não divulgue uma chave reutilizada em outros serviços.

A coleção inicia em localhost porque ainda não existe URL de deploy confirmada. Não há links fictícios de publicação nesta entrega.

## Vídeo de até dois minutos

- 0:00–0:15: mostrar Variables, trocar `baseUrl` para o Vercel e mostrar onde configurar `apiKey` sem expor seu valor.
- 0:15–0:30: consultar pessoas previamente cadastradas e um currículo completo.
- 0:30–1:10: criar pessoa, formação, experiência e projeto; consultar e atualizar os registros.
- 1:10–1:35: consultar vínculos, transferir projeto usando `outraPessoaId` e confirmar a nova relação.
- 1:35–1:55: mostrar bloqueio de exclusão com vínculos, remover filhos e pessoas de teste, e mostrar 404 após exclusão.

Publique no YouTube como público ou não listado. Entregue link do código, link do Vercel, JSON do Postman exportado e link do vídeo. A gravação e a publicação no YouTube ainda precisam ser feitas.

## Verificação

`npm.cmd test` executa testes HTTP locais com repositório em memória. Eles não substituem a execução da coleção contra o Back4App publicado.

Referências: https://docs.parseplatform.org/rest/guide/ e https://vercel.com/docs/functions/runtimes/node-js
