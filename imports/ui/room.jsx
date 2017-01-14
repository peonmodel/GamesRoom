import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Input, Button, Card, Form } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { ConversationContainer } from './chat.jsx';

export class CurrentRoom extends Component {
	constructor(props) {
		super(props);
	}

	leaveRoom() {

	}

	render() {
		if (!this.props.ready) { return (<div></div>); }
		const room = this.props.currentRoom;
		console.log(room, this.props)
		return (
			<Container className="currentRoom">
				<h1>{room.title}</h1>
				<Button onClick={this.leaveRoom.bind(this)}>Leave Room</Button>
				<ConversationContainer chatId={room.chatId} />
			</Container>
		);
	}
}

// usage
function reactiveMapper(props, onData) {
	const activeSub = Meteor.subscribe('CurrentRoom', props.routeParams.roomId);
	if (activeSub.ready()) {
		onData(null, {
			ready: true,
			currentRoom: Room.collection.findOne(),
		});
	} else {
		onData(null, { ready: false });
	}
}

export const CurrentRoomContainer = reactify(reactiveMapper)(CurrentRoom);
