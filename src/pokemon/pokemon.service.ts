import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}
  

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {
      console.log(error);
      this.handleException(error)
    }

  }

  async findAll() {
    return await this.pokemonModel.find();
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    if( !isNaN(+term) ){
      pokemon = await this.pokemonModel.findOne({no: term});
    }
    
    //MongoID
    if( !pokemon && isValidObjectId(term) ){
      pokemon = await this.pokemonModel.findById(term);
    }

    // Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }


    if(!pokemon)
      throw new NotFoundException(`Pokemon with id, name or no '${term}' not found`)
    
    return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemonDB = await this.findOne(term);

    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {

      await pokemonDB.updateOne(updatePokemonDto);
      return {...pokemonDB.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handleException(error)
    }

  }

  async remove(id: string) {
    // const pokemonDB = await this.findOne(id);
    // await pokemonDB.deleteOne()
    // return{id} 
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if(deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`)

    return;

  }


  private handleException(error : any) {
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exist in DB with the ID or Name ${ JSON.stringify( error.keyValue ) }`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't update Pokemon - check server logs`);
  }




}
