import mongoose from "npm:mongoose@7.6.3";
import {Pet} from "../type.ts";

const Schema = mongoose.Schema;

const petSchema = new Schema({
    name: {type:String, required: true},
    breed: {type:String, required: true}
  
});

export type PetModelType = mongoose.Document & Omit<Pet, "id">;

export default mongoose.model<PetModelType>("Pet", petSchema);