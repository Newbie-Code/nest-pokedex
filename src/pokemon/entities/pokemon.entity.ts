import { Document } from "mongoose";
import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";

@Schema()
export class Pokemon extends Document {

    @Prop({
        unique: true,
        index: true,
    })
    no: number;

    @Prop({
        unique: true,
        index: true,
    })
    name: string;

}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

