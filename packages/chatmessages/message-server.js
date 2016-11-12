import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';
import { _ } from 'meteor/underscore';

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
  constructor(item) {
    Object.assign(this, item);
  }

  /**
   * deleteMessage - delete message from collection
   *
   * @returns {number}  1 if succeeded, 0 otherwise
   */
  deleteMessage() {
    return Message.collection.remove({_id: this._id});
  }

  /**
   * editMessage - delete message from collection
   *
   * @param {string} text edited text
   * @returns {number}  1 if succeeded, 0 otherwise
   */
  editMessage(text) {
    return Message.collection.update(this._id, {
      $set: {text: text, editAt: new Date()}
    });
  }

  /**
   * replyMessage - create a reply to message
   *
   * @param {string} text reply content
   * @returns {string}  id of new reply message
   */
  replyMessage(text) {
    return Message.createMessage(this.chatId, text, this);
  }

  /**
   * createMessage - static class function to create message
   *
   * @param  {string} chatId  id of chat message belongs to
   * @param  {string} text    content of message
   * @param  {object} replyTo optional Message object that is being replied to
   * @returns {string}         id of created message
   */
  static createMessage(chatId, text, replyTo) {
    // TODO: filter replyTo object to contain only essentials
    let filteredReply = !!replyTo ? _.pick(replyTo, ['_id', 'from', 'text', 'timestamp']) : undefined;
    return Message.collection.insert({
      chatId,
      from: {}, // TODO: filter Meteor.user chat name somehow
      text,
      timestamp: new Date(),
      replyTo: filteredReply,
    });
  }

}
Message.prefix = `freelancecourtyard:message`;

// NOTE: https://core.telegram.org/bots/api#message
Message.schema = {
  _id: String,  // id of message
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

// NOTE: https://docs.mongodb.com/manual/core/index-intersection/
// NOTE: https://jira.mongodb.org/browse/SERVER-3071
// NOTE: https://docs.mongodb.com/manual/core/index-compound/
// TL;DR index intersection only works with 2 indices,
// compound indices are still faster and is preferred
// put high cardinality fields first and progressively lower up to 31
// compound indices also work for its prefixes, i.e. {a, b, c} works for {a, b} too
Message.collection = new Mongo.Collection(`${Message.prefix}Collection`, {
  transform: function(item) {
    return new Message(item);
  },
  defineMutationMethods: false,  // need to publish this but dont let direct edit
});
// sort index only matter when both fields need to be sorted
Message.collection._ensureIndex({chatId: 1, timestamp: 1});

// defines the mutation meteor methods DMMM
Meteor.methods({
  [`${Message.prefix}/deleteMessage`]: function deleteMessage(messageId) {
    check(messageId, String);
    this.unblock();
    let message = Message.collection.findOne({_id: messageId});
    return message.deleteMessage();
  },
  [`${Message.prefix}/editMessage`]: function editMessage(messageId, text) {
    check(messageId, String);
    check(text, String);
    this.unblock();
    let message = Message.collection.findOne({_id: messageId});
    return message.editMessage(text);
  },
  [`${Message.prefix}/replyMessage`]: function replyMessage(messageId, text) {
    check(messageId, String);
    check(text, String);
    this.unblock();
    let message = Message.collection.findOne({_id: messageId});
    return message.replyMessage(text);
  },
  [`${Message.prefix}/createMessage`]: function createMessage(chatId, text, replyTo) {
    check(chatId, String);
    check(text, String);
    check(replyTo, Object);
    this.unblock();
    return Message.createMessage(chatId, text, replyTo);
  },
});

export { Message };
