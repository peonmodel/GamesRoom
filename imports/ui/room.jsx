import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Button, Card } from 'semantic-ui-react';
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
		try {
			let gameId = null;
			if (this.state.activeGameId) {
				const game = CodeNames.collection.findOne(this.state.activeGameId);
				gameId = await game.recreateGame();
			} else {
				gameId = await CodeNames.createGame('new game');
			}
			this.props.currentRoom.updateGameList(gameId, 'CodeNames');
			this.setState({ activeGameId: gameId });
		} catch (error) {
			console.error(error);
		}
	}

	// TODO: need to fix the room to publish the right game collections
	// need to have a register supported game types

	async handleJoinGame(event, element) {
		const gameId = element.name;
		this.setState({ activeGameId: gameId });
	}

	render() {
		// TODO: remove this
		Object.assign(Meteor.test, { CodeNames });
		if (!this.props.ready) { return (<div></div>); }
		const room = this.props.currentRoom;
		return (
			<Container className="currentRoom">
				<h1>{room.title}</h1>
				<CodeNamesUIContainer gameId={this.state.activeGameId}/>
				<Button onClick={this.createGame.bind(this)}>Create Game</Button>
				<Button onClick={this.leaveRoom.bind(this)}>Leave Room</Button>
				<ConversationContainer chatId={room.chatId} />
				{room.games.map(gameObj => (
					<Card key={gameObj._id} name={gameObj._id}>
						<Card.Content>
							<Card.Header>
								{ gameObj.materialised.name }
							</Card.Header>
							<Card.Description>
								{ gameObj.materialised.name.type }
							</Card.Description>
						</Card.Content>
						<Card.Content extra>
							<div className='ui two buttons'>
								<Button basic color='green' name={gameObj._id} onClick={this.handleJoinGame.bind(this)}>Join</Button>
							</div>
						</Card.Content>
					</Card>
				))}
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
