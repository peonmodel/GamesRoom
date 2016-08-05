import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';


/**
 * class representing a message instance
 * intended to be used in Chat
 */
class Message {

  /**
   * constructor - instantiate Message instance
   * used to transform Message.collection items
   * also see schema
   *
   * @param  {object} item object stored in collection
   */
  constructor(item){
    Object.assign(this, item);
  }

  /**
   * deleteMessage - delete this Message instance
   *
   * @param {function} callback function to call when meteor method returns
   */
  deleteMessage(callback = ()=>{}){
    check(callback, Function);
    Meteor.call(`${Message.prefix}/deleteMessage`, this._id, callback);
  }

  /**
   * editMessage - edit text content of this Message instance
   *
   * @param {string} text new content of Message
   * @param {function} callback function to call when meteor method returns
   */
  editMessage(text, callback = ()=>{}){
    check(text, String);
    check(callback, Function);
    Meteor.call(`${Message.prefix}/editMessage`, this._id, text, callback);
  }

  /**
   * replyMessage - create a Message instance as reply to another Message instance
   *
   * @param {string} text content of reply Message
   * @param {function} callback function to call when meteor method returns
   */
  replyMessage(text, callback = ()=>{}){
    check(text, String);
    check(callback, Function);
    Meteor.call(`${Message.prefix}/replyMessage`, this._id, text, callback);
  }

  /**
   * createMessage - add an instance of Message to collection
   * constructor is used to transform the collection, whereas this is to add a Message to collection
   *
   * @param {string} chatId id of chat Message belongs to
   * @param {string} text content of Message
   * @param {Message} replyTo Message object that is being replied to
   * @param {function} callback function to call when meteor method returns
   */
  static createMessage(chatId, text, replyTo, callback = ()=>{}){
    check(chatId, String);
    check(text, String);
    check(replyTo, Object);
    check(callback, Function);
    Meteor.call(`${Message.prefix}/createMessage`, chatId, text, replyTo, callback);
  }
}
Message.schema = {
  _id: String,  // id of message
  // roomId: String,
  // gameId: String,
  // teamId: String,
  chatId: String,  // id of chat it belongs to
  from: {
    // user
    _id: String,
    displayName: String,  // this may be different from userId name
  },
  timestamp: Date,
  text: String,  // NOTE: main thing

  // optional stuff

  // NOTE: rather than materializing it, might as well save a copy
  replyTo: {
    _id: String,
    from: {},
    text: String,
    timestamp: Date,
  },  // id of message replied to
  // forwardFrom: String,  // id of forwarded message
  editAt: Date,  // optional
  // contain things like special parse instruction for system message
  // system message can be member join, left, chat created
  metadata: Object,
  // audio: Object,
  // document: Object,
  // photo: Object,
  // video: Object,
  // caption: String,
  // contact: Object,
  // location: Object,
};
Message.prefix = `freelancecourtyard:Message`;

Message.collection = new Mongo.Collection(`${Message.prefix}Collection`, {
  transform: function(item){
    return new Message(item);
  },
});

export { Message };
