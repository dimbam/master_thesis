const { ApolloServer } = require('apollo-server');
const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'db1', url: 'http://localhost:4001' },
      { name: 'db2', url: 'http://localhost:4002' },
      { name: 'db3', url: 'http://localhost:4003' },
    ],
  }),
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`Apollo Gateway ready at ${url}`);
});
