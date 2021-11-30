import bodyParser from "body-parser";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";

import schema from "./schema/index.js";

const app = express();
app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

mongoose.connect(process.env.MONGO_DB_URI);
mongoose.connection.once("open", () => {
  app.listen(4000, () => {
    console.log(
      `Your GraphQL ${process.env.ENVIRONMENT} server is started at port 4000`
    );
  });
  console.log("Db connected");
});
