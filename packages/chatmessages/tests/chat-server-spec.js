/* jshint node: true */
/* jshint expr: true*/
'use strict';

// import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';

import { chai } from 'meteor/practicalmeteor:chai';
import { describe, it, xdescribe, xit } from 'meteor/practicalmeteor:mocha';
// import { sinon } from 'meteor/practicalmeteor:sinon';
import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';

let expect = chai.expect;
chai.config.truncateThreshold = 0;
xdescribe('x', function(){});  // just to ignore the jshint not used error
xit('x', function(){});

describe('Chat', function(){

  describe('Chat#constructor', function(){

    it('should assign object to this', function(){
      let item = new Chat({test: 1});
      expect(item.test).to.equal(1);
    });

  });

  describe('Chat#createChat', function(){

    it('should add chat to collection and return chatId', function(){
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

  describe('Chat#deleteChat', function(){

    it('should remove messages and chat of id from collection', function(){
      let chat = Chat.collection.findOne();
      expect(Message.collection.find({chatId: chat._id}).count()).to.equal(1);
      chat.deleteChat();
      expect(Chat.collection.findOne({_id: chat._id})).to.be.undefined;
      expect(Message.collection.find({chatId: chat._id}).count()).to.equal(0);
    });

  });

});
