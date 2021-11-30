import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";
import _ from "lodash";

import Book from "../models/book.js";
import Author from "../models/author.js";

// import { authors, books } from "../data/index.js";

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    authorId: { type: GraphQLID },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        // return _.find(authors, { id: parent.authorId });
        return Author.findById(parent.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // return _.filter(books, { authorId: parent.id });
        return Book.find({ authorId: parent.id });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(parent, args) {
        // code to get data for books db/other resources
        // return _.find(books, { id: args.id });
        return Book.findById(args.id);
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // code to get data for authors db/other resources
        // return _.find(authors, { id: args.id });
        return Author.findById(args.id);
      },
    },
    books: {
      type: new GraphQLObjectType({
        name: "BooksResultType",
        fields: () => ({
          totalDocCount: { type: GraphQLInt },
          page: { type: GraphQLInt },
          totalPages: { type: GraphQLInt },
          pageSize: { type: GraphQLInt },
          book: { type: new GraphQLList(BookType) },
        }),
      }),
      args: {
        page: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve(parent, args) {
        // // return _.map(books);
        const { page = 1, offset = 10 } = args;
        const response = await Book.find({})
          .skip((page - 1) * offset)
          .limit(offset);
        let totalBookCount = await Book.countDocuments({});
        let totalPages;

        if (totalBookCount % offset === 0) {
          totalPages = totalBookCount / offset;
        } else {
          totalPages = Math.floor(totalBookCount / offset) + 1;
        }

        console.log("count: ", totalBookCount);
        console.log("response:", response);
        return {
          totalDocCount: totalBookCount,
          page: args.page,
          pageSize: response.length,
          book: response,
          totalPages,
        };
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve() {
        // return _.filter(authors);
        return Author.find({});
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        let author = new Author({
          name: args.name,
          age: args.age,
        });
        return author.save();
      },
    },
    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        let book = new Book(args);
        return book.save();
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
