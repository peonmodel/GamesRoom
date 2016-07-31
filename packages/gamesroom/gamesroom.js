// import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
// import { _ } from 'lodash';
// TODO: chat should be a separate package

class Room {

  constructor(schema){
    check(schema, Object);
    Object.assign(this, schema);
    // NOTE: check whether on server-side can have multiple new Mongo(same id)
    // this.games = new Mongo.Collection(`Room:${this._id}:Games`);
    // room chat and games chat
    // this.roomChat =  ChatsCollection.createChat(this._id);
  }

  get schema(){
    return {
      _id: String,
      accessCode: String,  // for access to private room, also server as shortened id
      isPublic: Boolean,
      capacity: Match.Integer,
      occupacy: Match.Integer,
      users: [String],
      games: [String],
    };
  }

  defineMethods(){
    //
  }

  leaveRoom(){}

  clearRoom(){
    // will be called before deleting room
  }

  joinRoom(){}

}

export class RoomCollection {

  constructor(){
    this.collection = new Mongo.Collection('GamesRoom', {
      transform: function (item){
        return new Room(item);
      },
    });
  }

  defineMethods(){}

  createRoom(){}

  deleteRoom(roomId){
    console.log(roomId);
  }

  joinRoom(roomId){
    console.log(roomId);
    // get room, then call room.joinRoom() on current user
  }

}
