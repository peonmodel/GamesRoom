import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Grid, Button, Header, Accordion, Icon } from 'semantic-ui-react';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { CodeNames } from '../codenames.js';

export class CodeNamesUI extends Component {
	constructor(props) {
		super(props);
	}

	async handleClick(event, element) {
		// if (element.color !== 'grey') { return 1; }
		const game = this.props.game;
		if (game.isGameInProgress) {
			return game.revealWord(element.name);
		} else {
			return game.changeWord(element.name);
		}
	}

	async handleStart() {

	}

	async handleJoin() {

	}

	async handleLeave() {

	}

	async handleResetWords() {}

	async handleResetGame() {}

	render() {
		if (!this.props.ready) { return (<div>subscription not ready</div>); }
		const game = this.props.game;
		if (!game) { return (<div>error: game not found</div>); }
		// NOTE: somehow exclusive={false} for accordion gives an error, unsure why, disabled for now
		return (
			<Container>
				<Header>{game.name}</Header>
				<p>current active team: {game.state.activeTeam}</p>
				<p>current clue: {game.currentClue.clue} - {game.currentClue.count}</p>
				<p>{ game.state.winningTeam ? `winningTeam: ${game.state.winningTeam}` : '' }</p>
				<Accordion>
					<Accordion.Title><Icon name='dropdown'/> Team Info </Accordion.Title>
					<Accordion.Content>
						<p>red team: { game.players.filter(o => o.team === 'red').map(o => o.alias) }</p>
						<p>red cluegiver: { game.players.find(o => o.role === 'cluegiver' && o.team === 'red') }</p>
						<p>blue team: { game.players.filter(o => o.team === 'blue').map(o => o.alias) }</p>
						<p>blue cluegiver: { game.players.find(o => o.role === 'cluegiver' && o.team === 'blue') }</p>
					</Accordion.Content>
					<Accordion.Title><Icon name='dropdown'/> All Clues </Accordion.Title>
					<Accordion.Content>
						{game.state.clues.map((clue, idx) => (
							<p key={idx}>clue: {clue.clue} - {clue.count} by: {clue.team}</p>
						))}
					</Accordion.Content>
				</Accordion>
				<Grid columns={5} padded>
					{game.words.map(wordObj => (
						<Grid.Column key={wordObj.word}>
							<Button fluid={true} color={wordObj.revealedTeam || 'grey'} name={wordObj.word} onClick={this.handleClick.bind(this)}>{wordObj.word}</Button>
						</Grid.Column>
					))}
				</Grid>
				<Button onClick={this.handleStart.bind(this)}>Start game</Button>
				<Button onClick={this.handleStart.bind(this)}>Reset words</Button>
				{game.player ? (
					<Button onClick={this.handleLeave.bind(this)}>Leave game</Button>
				) : (
					<Button onClick={this.handleJoin.bind(this)}>Join game</Button>
				)}
			</Container>
		);
	}
}

// usage
function reactiveMapper(props, onData) {
	const activeSub = Meteor.subscribe('CodeNames', props.gameId);
	if (activeSub.ready()) {
		onData(null, {
			ready: true,
			game: CodeNames.collection.findOne(props.gameId),
		});
	} else {
		onData(null, { ready: false });
	}
}

export const CodeNamesUIContainer = reactify(reactiveMapper)(CodeNamesUI);
