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
			aliasChangeEnabled: true,
			resetWordsEnabled: true,
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
		const game = this.props.game;
		if (game.player) { return 1; }
		try {
			await game.joinGame(this.state.alias, this.state.team, this.state.role);
		} catch (error) {
			console.error(error);
			// setMessage(error);
		} finally {
			this.setState({ team: game.player.team });
			this.setState({ role: game.player.role });
		}
	}

	async handleLeave() {

	}

	async handleResetWords() {
		try {
			this.setState({ resetWordsEnabled: false });
			await this.props.game.resetWords();
		} catch (error) {
			console.error(error);
		} finally {
			this.setState({ resetWordsEnabled: true });
		}
	}

	async handleResetGame() {}

	async handleTeamChange(event, element) {
		const game = this.props.game;
		if (game.player) {
			// if already joined game, update the player state
			if (element.value === game.player.team) { return 1; }  // no change required
			try {
				// attempt to change team, disable element meanwhile
				this.setState({ teamChangeEnabled: false });
				await game.player.updateTeam(element.value);
			} catch (error) {
				console.error(error);
				// setMessage(error);
			} finally {
				// update component state to align with server
				this.setState({ teamChangeEnabled: true });
				this.setState({ team: game.player.team });
			}
		} else {
			// else not joined game, just change component state
			this.setState({ team: element.value });
		}
	}

	async handleRoleChange(event, element) {
		const game = this.props.game;
		if (game.player) {
			if (element.value === game.player.role) { return 1; }
			try {
				this.setState({ roleChangeEnabled: false });
				await game.player.updateRole(element.value);
			} catch (error) {
				console.error(error);
				// setMessage(error);
			} finally {
				// update component state to align with server
				this.setState({ roleChangeEnabled: true });
				this.setState({ role: game.player.role });
			}
		} else {
			// else not joined game, just change component state
			this.setState({ role: element.value });
		}
	}

	render() {
		if (!this.props.ready) { return (<div>subscription not ready</div>); }
		const game = this.props.game;
		if (!game) { return (<div>error: game not found</div>); }
		if (game.player) {
			this.state.team = game.player.team;
			this.state.role = game.player.role;
			this.state.alias = game.player.alias;
		}
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
							<Button fluid={true} color={wordObj.revealedTeam || 'grey'} name={wordObj.word} onClick={this.handleClick.bind(this)}>
								{wordObj.word}
							</Button>
						</Grid.Column>
					))}
				</Grid>
				<Button onClick={this.handleStart.bind(this)}>Start game</Button>
				<Button onClick={this.handleResetWords.bind(this)}
					loading={!this.state.resetWordsEnabled} disabled={!this.state.resetWordsEnabled}
				>
					Reset words
				</Button>
				<Dropdown placeholder="select team" fluid
					loading={!this.state.teamChangeEnabled} disabled={!this.state.teamChangeEnabled}
					value={this.state.team} options={teamOptions} onChange={this.handleTeamChange.bind(this)}
				/>
				<Dropdown placeholder="select role" fluid
					loading={!this.state.roleChangeEnabled} disabled={!this.state.roleChangeEnabled}
					value={this.state.role} options={roleOptions} onChange={this.handleRoleChange.bind(this)}
				/>
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
