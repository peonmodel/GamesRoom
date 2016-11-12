/* jshint node: true */
/* jshint expr: true*/
'use strict';

// import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';

import { chai } from 'meteor/practicalmeteor:chai';
import { describe, it, xdescribe, xit, after, before } from 'meteor/practicalmeteor:mocha';
// import { sinon } from 'meteor/practicalmeteor:sinon';
import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';

let expect = chai.expect;
chai.config.truncateThreshold = 0;
xdescribe('x', function() {});  // just to ignore the jshint not used error
xit('x', function() {});

describe('Chat', function() {

  after(function() {
    Chat.collection.remove({});
    Message.collection.remove({});
  });

  describe('Chat#constructor', function() {

    it('should assign object to this', function() {
      let item = new Chat({test: 1});
      expect(item.test).to.equal(1);
    });

  });

  describe('Chat#createChat static', function() {

    it('should add chat to collection and return chatId', function() {
      Chat.collection.remove({});
      Message.collection.remove({});
      expect(Chat.collection.find().count()).to.equal(0);
      expect(Message.collection.find().count()).to.equal(0);
      let chatId = Chat.createChat();
      expect(chatId).to.be.a('string');
      expect(Chat.collection.find({_id: chatId}).fetch()).to.deep.equal([
        new Chat({_id: chatId, type: 'private', title: '', members: []}),
      ]);
      // creates initial message
      let message = Message.collection.findOne({chatId});
      expect(message).to.deep.equal(new Message({
        _id: message._id,
        chatId,
        from: {},
        text: 'chat created',
        timestamp: message.timestamp,
        replyTo: null,
      }));
    });

  });

  describe('Chat#publishChat static', function() {
    // TODO: write more tests for different query types
    before(function() {
      Chat.collection.remove({});
      Message.collection.remove({});
    });

    it('should publish Chat and Message cursors', function() {
      let chatId = Chat.createChat();
      let decoyId = Chat.createChat();  // decoy, should not get this
      let chat = Chat.collection.findOne(chatId);
      let decoy = Chat.collection.findOne(decoyId);
      chat.createMessage('first');
      decoy.createMessage('fake');
      let [msgs, chats] = Chat.publishChat({_id: chatId});
      expect(msgs.count()).to.equal(2);
      expect(chats.count()).to.equal(1);

      let [decoymsgs, decoychats] = Chat.publishChat({_id: decoyId});
      expect(decoymsgs.count()).to.equal(2);
      expect(decoychats.count()).to.equal(1);

      let [allmsgs, allchats] = Chat.publishChat();
      expect(allmsgs.count()).to.equal(4);
      expect(allchats.count()).to.equal(2);
    });

  });

  describe('Chat#deleteChat', function() {

    it('should remove messages and chat of id from collection', function() {
      let chatId = Chat.createChat();
      let chat = Chat.collection.findOne(chatId);
      expect(Message.collection.find({chatId: chat._id}).count()).to.equal(1);
      chat.deleteChat();
      expect(Chat.collection.findOne({_id: chat._id})).to.be.undefined;
      expect(Message.collection.find({chatId: chat._id}).count()).to.equal(0);
    });

  });

  describe('Chat#joinChat', function() {

    it('should add member to chat members array', function() {
      let chatId = Chat.createChat();
      let chat = Chat.collection.findOne(chatId);
      expect(chat.members).to.deep.equal([]);
      chat.joinChat({id: '1', displayName: 'test'});
      expect(chat.members).to.deep.equal([
        {id: '1', displayName: 'test'}
      ]);
      expect(chat).to.deep.equal(Chat.collection.findOne(chatId));
      chat.joinChat({id: '2', displayName: 'test'});
      expect(chat.members).to.deep.equal([
        {id: '1', displayName: 'test'},
        {id: '2', displayName: 'test'},
      ]);
      expect(chat).to.deep.equal(Chat.collection.findOne(chatId));
    });
  });

  describe('Chat#leaveChat', function() {

    it('should remove member from chat members array', function() {
      let chatId = Chat.createChat();
      let chat = Chat.collection.findOne(chatId);
      chat.joinChat({id: '1', displayName: 'test'});
      chat.joinChat({id: '2', displayName: 'test'});
      expect(chat.members).to.deep.equal([
        {id: '1', displayName: 'test'},
        {id: '2', displayName: 'test'},
      ]);
      chat.leaveChat({id: '1', displayName: 'test'});
      expect(chat.members).to.deep.equal([
        {id: '2', displayName: 'test'},
      ]);
    });
  });

  describe('Chat#createMessage', function() {

    it('should remove member from chat members array', function() {
      let chatId = Chat.createChat();
      let chat = Chat.collection.findOne(chatId);
      let messageCursor = Message.collection.find({chatId});
      expect(messageCursor.count()).to.equal(1);
      let messageId = chat.createMessage('first post');
      expect(messageCursor.count()).to.equal(2);
      let message = messageCursor.fetch()[1];
      expect(message).to.deep.equal(new Message({
        _id: messageId,
        chatId,
        from: {},
        text: 'first post',
        timestamp: message.timestamp,
        replyTo: null,
      }));
    });
  });

});
