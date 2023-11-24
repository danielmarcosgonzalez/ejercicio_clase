import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

import mongoose from "npm:mongoose@7.6.3";
import PetModel from "../clase24_11/db/mascotas.ts";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
import { Pet } from "./type.ts";

const env = await load();


const MONGO_URL = env.MONGO_URL || Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  console.log("No mongo URL found");
  Deno.exit(1);
}

await mongoose.connect(MONGO_URL);


const gqlSchema =`#graphql
type Pet{
  id: ID!
  name: String!
  breed: String!
}
type Query{
  pets:[Pet!]!
  pet(id: ID!):Pet!
}
type Mutation {
  addPet(id: ID!, name: String!, breed: String!):Pet!
  deletePet(id: ID!): Pet!
  updatePet(id: ID!, name: String!, breed: String!): Pet!
  filterPet(breed: String!): Pet!
}

`;

const resolvers = {
  Query: {
    pets: async() => {
      //const resul = await PetModel.find();
      //const mascotas = resul.map((elem)=>{
        
      //});
      //return mascotas;
    },
    pet: async (_: unknown, args: { id: string }) => {
      const _id = args.id;
      const mascota = await PetModel.findOne({_id}).exec();
      if (!mascota) {
        throw new GraphQLError(`No pet found with id ${args.id}`, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const pet ={
        id: mascota._id.toString(),
        name: mascota.name,
        breed: mascota.breed,
      }
      return pet;
    },
  },
  Mutation: {
    addPet: async (_: unknown, args: { name: string; breed: string }) => {
      const name=args.name;
      const breed=args.breed;
      const mascota = await PetModel.findOne({name}).exec();
      if (mascota) {
        throw new GraphQLError(`Ya existe mascota con ese nombre`, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const newPet = new PetModel({ name, breed });
      await newPet.save();
      
      const pet = {
        id: newPet._id.toString(),
        name: newPet.name,
        breed: newPet.breed,
      };
      return pet;
    },
    deletePet: async (_: unknown, args: { id: string }) => {
      const _id = args.id;
      const newpet = await PetModel.findOneAndDelete({_id}).exec();
      if (!newpet) {
        throw new GraphQLError(`No pet found with id ${args.id}`, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const pet ={
        id: newpet._id.toString(),
        name: newpet.name,
        breed: newpet.breed,
      }
      
      return pet;
    },
    updatePet: async (
      _: unknown,
      args: { id: string; name: string; breed: string }
    ) => {
      const _id = args.id;
      const name =args.name;
      const breed=args.breed;
      const updatePet = await PetModel.findOneAndUpdate({_id},{name,breed},{new:true}).exec();
      if (!updatePet) {
        throw new GraphQLError(`No pet found with id ${args.id}`, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const pet ={
        id: updatePet._id.toString(),
        name: updatePet.name,
        breed: updatePet.breed,
      }
      return pet;
    },
    filterPet: async (
      _: unknown,
      args: { breed: string }
    ) => {
      const breed = args.breed;
      const filterpet = await PetModel.findOne({breed}).exec();
      
      if (!filterpet) {
        throw new GraphQLError(`No pet found with id ${args.breed}`, {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const pet ={
        id: filterpet._id.toString(),
        name: filterpet.name,
        breed: filterpet.breed,
      }
      return pet;
    },
  },
};

const server = new ApolloServer({
  typeDefs:gqlSchema,
  resolvers:resolvers
});

const { url } = await startStandaloneServer(server);
console.log(`Server ready at ${url}`);