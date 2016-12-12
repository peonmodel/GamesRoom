import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Input, Button, Card, Form } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { Room } from 'meteor/freelancecourtyard:gamesroom';

class RoomListItem extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<Card>
				<Card.Content>
					<Card.Header>
						{ this.props.room.title }
					</Card.Header>
					<Card.Description>
						{ this.props.room.isPublic ? 'public room' : 'private room' }
					</Card.Description>
				</Card.Content>
				<Card.Content extra>
        <div className='ui two buttons'>
          <Button basic color='green'>Join</Button>
        </div>
				</Card.Content>
			</Card>
		);
	}
}

export class Lobby extends Component {
	constructor(props) {
		super(props);
	}

	async createRoom() {
		console.log(arguments)
		try {
			await Room.createRoom(false);
		} catch (error) {
			console.error(error);
			// sAlert.error(error);
		}
	}

	render() {
		if (this.props.ready === false) { return (<div></div>); }
		const publicRooms = this.props.publicRooms.map(room => (
			<RoomListItem room={room} key={room._id} />
		));
		return (
			<Container className="lobby">
				<h1>Public Lobby</h1>
				<Button onClick={this.createRoom.bind(this)}>Create Room</Button>
				<Button>Create Private Room</Button>
				<Button>Clear All Rooms</Button>
				<h2>Public Room List</h2>
				<ul>
					{ publicRooms }
				</ul>
				<Form>
					<Form.Field>
						<input placeholder="Fill in the room code"/>
					</Form.Field>
					<Button type='submit'>Find Room</Button>
				</Form>
				<div>
				</div>
			</Container>
		);
	}
}

// usage
function reactiveMapper(props, onData) {
	const publicSub = Meteor.subscribe('PublicRooms');
	const activeSub = Meteor.subscribe('ActiveRooms');
	if (publicSub.ready() && activeSub.ready()) {
		onData(null, {
			ready: true,
			publicRooms: Room.collection.find({ isPublic: true }).fetch(),
			privateRooms: Room.collection.find({ isPublic: { $ne: true } }).fetch(),
		});
	} else {
		onData(null, { ready: false });
	}
}

export const LobbyContainer = reactify(reactiveMapper)(Lobby);