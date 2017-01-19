import { Meteor } from 'meteor/meteor';
import { Connection } from 'meteor/freelancecourtyard:connection';
import React, { Component } from 'react';
import { Container, Button, Form, Header, Message, Label, Input, Icon, List } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';

class PlayersOnline extends Component {
	constructor(props) {
		super(props);  // this.props is "reactive", the other this attributes are reused
	}

	render() {
		const playerArray = this.props.players.map(player => {
			// FIXME: should user should show game display name too
			return (
				<List.Item>
					<List.Icon name='user' size='large' verticalAlign='middle' />
					<List.Content>
						<List.Header as='a'>{player.displayName}</List.Header>
						<List.Description as='a'>Last active {this.player.profile.lastActiveAt}</List.Description>
					</List.Content>
				</List.Item>
			);
		});
		return (
			<Container>
				<List divided relaxed>
					{ playerArray }
				</List>
			</Container>
		);
	}
}

// should receive reactive array of other userids
function reactiveMapper(props, onData) {
	const players = props.users.map(id => {
		return Meteor.users.findOne({ _id: id }) || { _id: id };
	});
	onData(null, { players });
}

export const PlayersOnlineContainer = reactify(reactiveMapper)(PlayersOnline);
