import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Button } from 'semantic-ui-react';
// import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { ConversationContainer } from './chat.jsx';
import { browserHistory } from 'react-router';
import { CodeNames, CodeNamesUIContainer } from 'meteor/freelancecourtyard:codenames';

export class CurrentRoom extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeGameId: '',
		};
	}

	leaveRoom() {
		browserHistory.push('');
	}

	async createGame() {
		const gameId = await CodeNames.createGame('new game', 'alias');
		this.setState({ activeGameId: gameId });
	}

	render() {
		// TODO: remove this
		Object.assign(Meteor.test, {CodeNames})
		if (!this.props.ready) { return (<div></div>); }
		const room = this.props.currentRoom;
		return (
			<Container className="currentRoom">
				<h1>{room.title}</h1>
				<CodeNamesUIContainer gameId={this.state.activeGameId}/>
				<Button onClick={this.createGame.bind(this)}>Create Game</Button>
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
			currentRoom: Room.collection.findOne(props.routeParams.roomId),
		});
	} else {
		onData(null, { ready: false });
	}
}

export const CurrentRoomContainer = reactify(reactiveMapper)(CurrentRoom);
