const { ApolloServer, gql } = require('apollo-server');
const { Neo4jGraphQL } = require('@neo4j/graphql');
const neo4j = require('neo4j-driver');

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type StoredStringDB3 {
    value: String!
  }
`;

const driver = neo4j.driver('bolt://localhost:7689', neo4j.auth.basic('neo4j', 'testpass3'));

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
  config: {
    enableFederation: true,
  },
});

async function startServer() {
  try {
    const schema = await neoSchema.getSubgraphSchema();
    const server = new ApolloServer({ schema });
    const { url } = await server.listen({ port: 4003 });
    console.log(`DB3 GraphQL service ready at ${url}`);
  } catch (error) {
    console.error('Failed to start DB3 GraphQL service:', error);
  }
}

startServer();
