import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Grid, Button, Header, Accordion, Icon, Dropdown } from 'semantic-ui-react';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { CodeNames } from '../codenames.js';

export class CodeNamesUI extends Component {
	constructor(props) {
		super(props);
		this.state = {
			role: '',
			roleChangeEnabled: true,
			team: '',
			teamChangeEnabled: true,
			alias: '',
		};
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

	async handleResetWords() {
		return this.props.game.resetWords();
	}

	async handleResetGame() {}

	async handleTeamChange(event, element) {
		const game = this.props.game;
		console.log(game.player);
		if (element.value === game.player.team) { return 1; }
		try {
			this.setState({ teamChangeEnabled: false });
			await game.player.updateTeam(element.value);
		} catch (error) {
			// setMessage(error);
		} finally {
			this.setState({ teamChangeEnabled: true });
			this.setState({ team: game.player.team });
		}
	}

	async handleRoleChange(event, element) {
		this.setState({ role: element.value });
	}

	render() {
		if (!this.props.ready) { return (<div>subscription not ready</div>); }
		const game = this.props.game;
		if (!game) { return (<div>error: game not found</div>); }
		const teamOptions = [{ text: 'red', value: 'red' }, { text: 'blue', value: 'blue' }];
		const roleOptions = [{ text: 'cluegiver', value: 'cluegiver' }, { text: 'others', value: 'others' }];
		// NOTE: somehow exclusive={false} for accordion gives an error, unsure why, disabled for now
		return (
			<Container>
				<Header>{game.name}</Header>
				<p>current active team: {game.state.activeTeam}</p>
				<p>most recent clue: {game.currentClue.clue} - {game.currentClue.count} - {game.currentClue.team}</p>
				<p>your team: {this.state.team} - {this.state.role}</p>
				<p>{ game.state.winningTeam ? `winningTeam: ${game.state.winningTeam}` : '' }</p>
				<Accordion>
					<Accordion.Title><Icon name='dropdown'/> Team Info </Accordion.Title>
					<Accordion.Content>
						<p>red team: { game.players.filter(o => o.team === 'red').map(o => o.alias) }</p>
						<p>red cluegiver: { game.players.filter(o => o.role === 'cluegiver' && o.team === 'red').map(o => o.alias) }</p>
						<p>blue team: { game.players.filter(o => o.team === 'blue').map(o => o.alias) }</p>
						<p>blue cluegiver: { game.players.filter(o => o.role === 'cluegiver' && o.team === 'blue').map(o => o.alias) }</p>
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
				<Dropdown placeholder="select team" fluid value={this.state.team} options={teamOptions} onChange={this.handleTeamChange.bind(this)}></Dropdown>
				<Dropdown placeholder="select role" fluid value={this.state.role} options={roleOptions} onChange={this.handleRoleChange.bind(this)}></Dropdown>
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
