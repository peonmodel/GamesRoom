# Chat & Message
Package for Chat and Message class
## Table of content
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Install
Import class Chat and Message from the package.
```
import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
```

## Usage

## Setup

### Server-side
```
// publish chats and messages
Meteor.publish('example', function(chatQuery, messageQuery){
  // it helps to limit messages to respective chats
  return Chat.publishChat(chatQuery, messageQuery);
});
```
Publishes relevant Chat.collection and Message.collection.

### Client-side
```
// subscribes to chat and messages
Meteor.subscribe('example', {_id: chatId}, {$sort: {timestamp: -1}});
chat = Chat.collection.findOne(chatId);
```
Subscribes to Chat and Message collections.
```
// see all messages in chat
Message.collection.find({chatId: chatId}).fetch();

```
See all messages in chat.
```
// creates instance of Chat in collection
Chat.createChat((err, res)=>{
    // res is id of created chat
    chatId = res;
});
chat = Chat.collection.findOne(chatId);
```
Creates chat in Chat.collection, returns id in callback.
```
// add message to chat
chat.createMessage('hello');

```
Creates message in chat.
```
// reply to message in chat
message.replyMessage('hi');

```
Creates a reply, add Message to the same chat.

## Configuration
// TODO: give an example
