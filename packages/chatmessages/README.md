# Chat & Message
Package for Chat and Message class
## Table of content
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Install
Import class Chat and Message from the package.
```javascript
import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
```

## Usage

## Setup

### Server-side
```javascript
// publish chats and messages
Meteor.publish('example', function(chatQuery, messageQuery) {
  // it helps to limit messages to respective chats
  return Chat.publishChat(chatQuery, messageQuery);
});
```
Publishes relevant Chat.collection and Message.collection.

### Client-side
```javascript
// subscribes to chat and messages
Meteor.subscribe('example', {_id: chatId}, {$sort: {timestamp: -1}});
chat = Chat.collection.findOne(chatId);
```
Subscribes to Chat and Message collections.
```javascript
// see all messages in chat
Message.collection.find({chatId: chatId}).fetch();

```
See all messages in chat.
```javascript
// creates instance of Chat in collection
Chat.createChat((err, res) => {
    // res is id of created chat
    chatId = res;
});
chat = Chat.collection.findOne(chatId);
```
Creates chat in Chat.collection, returns id in callback.
```javascript
// add message to chat
chat.createMessage('hello');

```
Creates message in chat.
```javascript
// reply to message in chat
message.replyMessage('hi');

```
Creates a reply, add Message to the same chat.

## Configuration
// TODO: give an example
