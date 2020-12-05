import fs from "fs";
import path from "path";

import getUser from "./utils/getUser";

import { ApolloServer } from "apollo-server-express";
// import { typeDefs, resolvers } from "./schema";

// import typeDefs from './schema/typeDefs'
import resolvers from "./resolvers/index";

const typeDefs = fs
  .readFileSync(path.join(__dirname, "schema", "schema.graphql"), "utf8")
  .toString();

const server = new ApolloServer({
  typeDefs,
  resolvers,

  context: ({ req }) => {
    // Check token from headers
    const token = req.headers.authorization || "";

    // Extract userId from token
    const userId = getUser(token);

    return { userId };
  },
});

export default server;
