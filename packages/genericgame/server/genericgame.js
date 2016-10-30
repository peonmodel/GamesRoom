import { Mongo } from 'meteor/mongo';

import { genericGameSchema } from '../imports/schema.js';

export class GenericGame {
  constructor(item){
    Object.assign(this, item);
  }

	static createGame(){}

	addPlayer(){}

	
}
GenericGame.schema = genericGameSchema;
GenericGame.prefix = `freelancecourtyard:genericgame`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.prefix}Collection`, {
  transform: function(item){
    return new GenericGame(item);
  },
  defineMutationMethods: false,
});
