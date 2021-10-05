const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const q = faunadb.query;

const typeDefs = gql`
  type Query {
    bookmarks: [Bookmark!]
  }

  type Mutation {
    addBookmark(url: String!, name: String!): Bookmark
  }

  type Bookmark {
    id: ID!
    url: String!
    name: String!
  }
`;

const client = new faunadb.Client({
  secret: process.env.FAUNADB_ADMIN_SECRET,
  domain: "db.eu.fauna.com",
});

const resolvers = {
  Query: {
    bookmarks: async () => {
      try {
        const result = await client.query(
          q.Map(
            q.Paginate(q.Documents(q.Collection("bookmarks"))),
            q.Lambda((x) => q.Get(x))
          )
        );

        return result.data.map(({ data }) => {
          return {
            url: data.url,
            name: data.name,
          };
        });
      } catch (error) {
        return error;
      }
    },
  },

  Mutation: {
    addBookmark: async (_, { url, name }) => {
      try {
        const result = await client.query(
          q.Create(q.Collection("bookmarks"), {
            data: {
              url,
              name,
            },
          })
        );

        return result;
      } catch (error) {
        return error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler();
