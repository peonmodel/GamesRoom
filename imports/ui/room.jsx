import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Button, Card } from 'semantic-ui-react';
// import { _ } from 'lodash';
import { _ } from 'meteor/underscore';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { ConversationContainer } from './chat.jsx';
import { browserHistory } from 'react-router';
// import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
import { CodeNames, CodeNamesUIContainer } from 'meteor/freelancecourtyard:codenames';
import { globalMessage } from './errormessage.jsx';

export class CurrentRoom extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeGameId: '',
			gamesSubReady: true,
			gamesSub: null,
			gameIds: [],
		};
	}

	componentWillReceiveProps(nextProps) {
		// only re-subscribe if the game list changes
		// there is no need actually, meteor subscribe will check for
		// whether params are the same and not resub
		const newRoom = nextProps.currentRoom;
		if (newRoom) {
			const gameIds = newRoom.games.map(o => o._id);
			if (!_.isEqual(gameIds, this.state.gameIds)) {
				// game list changed, need to re-sub
				this.setState({ gamesSubReady: false, gameIds });
				!!this.state.gamesSub && this.state.gamesSub.stop();
				this.state.gamesSub = Meteor.subscribe('GameList', gameIds, {
					onReady: () => {
						this.setState({ gamesSubReady: true });
					},
				});
			}
		}
	}

	async leaveRoom() {
		try {
			const room = this.props.currentRoom;
			await room.leaveRoom();
			browserHistory.push('');
		} catch (error) {
			globalMessage.instance.setMessage({ message: error.error });
		}
	}

	async createGame() {
		try {
			let gameId = null;
			if (this.state.activeGameId) {
				const game = CodeNames.findOne(this.state.activeGameId);
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

	async handleJoinGame(event, element) {
		const gameId = element.name;
		this.setState({ activeGameId: gameId });
	}

	async joinRoom() {
		try {
			const room = this.props.currentRoom;
			await room.joinRoom();
		} catch (error) {
			globalMessage.instance.setMessage({ message: error.error });
		}
	}

	goBackOrLobby() {
		// TODO: this
	}

	render() {
		if (!this.props.ready) { return (<div>Not ready</div>); }
		const room = this.props.currentRoom;
		if (!room) { return (<div>Room not found</div>); }
		return (
			<Container className="currentRoom">
				<h1>{room.title}</h1>
				<CodeNamesUIContainer gameId={this.state.activeGameId} message={globalMessage.instance}/>
				{room.member ? (
					<div>
					<Button onClick={this.createGame.bind(this)}>Create Game</Button>
					<Button onClick={this.leaveRoom.bind(this)}>Leave Room</Button>
					</div>
				) : (
					<Button onClick={this.joinRoom.bind(this)}>Join Room</Button>
				)}
				<ConversationContainer chatId={room.chatId} />
				{this.state.gamesSubReady ? room.games.map(gameObj => {
					const mat = gameObj.materialised || {};
					return (
						<Card key={gameObj._id} name={gameObj._id}>
							<Card.Content>
								<Card.Header>
									{ mat.name }
								</Card.Header>
								<Card.Description>
									{ mat.type }
								</Card.Description>
							</Card.Content>
							<Card.Content extra>
								<div className='ui two buttons'>
									<Button basic color='green' name={gameObj._id} onClick={this.handleJoinGame.bind(this)}>Join</Button>
								</div>
							</Card.Content>
						</Card>
					);
				}) : (
					<div>Loading Games...</div>
				)}
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

	// Meteor.subscribe('CurrentRoom', props.routeParams.roomId, {
	// 	onReady: () => {
	// 		onData(null, {
	// 			ready: true,
	// 			currentRoom: Room.collection.findOne(props.routeParams.roomId),
	// 		});
	// 	},
	// 	onStop: () => {
	// 		onData(null, { ready: false });
	// 	},
	// });
	// component is not rendered if data not ready
	// onData(null, { ready: false });
}

export const CurrentRoomContainer = reactify(reactiveMapper)(CurrentRoom);
