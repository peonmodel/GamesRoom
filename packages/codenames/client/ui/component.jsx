import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Grid, Button, Header, Accordion, Icon, Dropdown, Input, Select } from 'semantic-ui-react';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { CodeNames } from '../codenames.js';

// TODO: fix error messages
// low priority - the various loading/disabled component states

/**
 * CodeNamesUI - class for UI react component for CodeNames
 *
 * @export
 * @class CodeNamesUI
 * @extends {Component}
 */
export class CodeNamesUI extends Component {
	/**
	 * Creates an instance of CodeNamesUI.
	 *
	 * @param {any} props - react properties
	 *
	 * @memberOf CodeNamesUI
	 */
	constructor(props) {
		super(props);
		this.message = props.message;
		this.state = {
			role: '',
			roleChangeEnabled: true,
			team: '',
			teamChangeEnabled: true,
			alias: '',
			aliasChangeEnabled: true,
			resetWordsEnabled: true,
			clue: '',
			clueNumber: 3,
			showColours: false,
			clueGiverSubscription: undefined,
			hiddenReady: false,
		};
	}

	/**
	 * handleClickWord - handles when word is clicked, either reveal or change
	 *
	 * @param {Proxy} event - dom event proxy
	 * @param {Object} element - properties of react element
	 * @returns {Number} - update result
	 *
	 * @memberOf CodeNamesUI
	 */
	async handleClickWord(event, element) {
		const game = this.props.game;
		try {
			if (game.isGameInProgress) {
				await game.revealWord(element.name);
			} else {
				await game.changeWord(element.name);
			}
		} catch (error) {
			console.error(error);
			this.message.setMessage(error);
		}
	}

	/**
	 * handleStart - start game
	 *
	 * @returns {undefined} - no return value
	 * @memberOf CodeNamesUI
	 */
	async handleStart() {
		const game = this.props.game;
		try {
			await game.startGame();
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * handleJoin - handle joining game
	 *
	 * @returns {undefined} - no value
	 * @memberOf CodeNamesUI
	 */
	async handleJoin() {
		const game = this.props.game;
		try {
			await game.joinGame(this.state.alias, this.state.team, this.state.role);
			// problem is that at this point, the this.props.game is not updated yet
			// is fixed indirectly since the state is set again every re-render
			// this.setState({ team: this.props.game.player.team });
			// this.setState({ role: this.props.game.player.role });
		} catch (error) {
			this.message.setMessage(error);
			console.error(error);
			// setMessage(error);
		}
	}

	/**
	 * handleLeave - leave game
	 *
	 * @returns {undefined} - no return value
	 * @memberOf CodeNamesUI
	 */
	async handleLeave() {
		const game = this.props.game;
		try {
			await game.leaveGame();
		} catch (error) {
			this.message.setMessage(error);
			console.error(error);
		}
	}

	/**
	 * handleResetWords - handle resetting of all words
	 *
	 * @returns {undefined} - no return value
	 * @memberOf CodeNamesUI
	 */
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

	async handleGiveClue() {
		const game = this.props.game;
		try {
			await game.giveClue(this.state.clue, this.state.clueNumber);
			this.setState({ clue: '', clueNumber: 3 });
		} catch (error) {
			console.error(error);
			this.message.setMessage(error);
		}
	}

	// async endGame() {}

	/**
	 * handleTeamChange - change team of joined player else just component state
	 *
	 * @param {Proxy} event - proxy change event
	 * @param {Object} element - element properties
	 * @returns {undefined} - no return value
	 *
	 * @memberOf CodeNamesUI
	 */
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
			}
		} else {
			// else not joined game, just change component state
			this.setState({ team: element.value });
		}
	}

	/**
	 * handleRoleChange - change role of joined player else just component state
	 *
	 * @param {Proxy} event - proxy change event
	 * @param {Object} element - element properties
	 * @returns {undefined} - no return value
	 *
	 * @memberOf CodeNamesUI
	 */
	async handleRoleChange(event, element) {
		const game = this.props.game;
		this.setState({ showColours: false });  // just in case, always hide answers
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

	handleClueChange(event, element) {
		this.setState({ clue: element.value });
	}

	handleClueNumberChange(event, element) {
		this.setState({ clueNumber: element.value });
	}

	handleShowColours() {
		this.setState({ showColours: !this.state.showColours });
	}

	async handleEndTurn() {
		try {
			await this.props.game.endTurn();
		} catch (error) {
			console.error(error);
		}
	}

	componentWillReceiveProps(nextProps) {
		// is called when data changes
		const game = nextProps.game || {};
		const player = game.player;
		if (player) {
			this.setState({
				team: player.team,
				role: player.role,
				alias: player.alias,
			});
		}
		// not stopping subscription manually since meteor is supposed to not resub if params remains same
		this.state.clueGiverSubscription = Meteor.subscribe('CodeNamesClueGiver', (game._id || ''), ((player || {}).role || ''), {
			onReady: () => {
				this.setState({ hiddenReady: true });
			},
		});
	}

	componentWillUpdate(nextProps, nextState) {
		// console.log('nextProps, nextState', nextProps, nextState)
		// const game = this.props.game;
	}

	render() {
		if (!this.props.ready) { return (<div>subscription not ready</div>); }
		const game = this.props.game;
		if (!game) { return (<div>error: game not found</div>); }
		const player = game.player;

		const teamOptions = [{ text: 'red', value: 'red' }, { text: 'blue', value: 'blue' }];
		const roleOptions = [{ text: 'cluegiver', value: 'cluegiver' }, { text: 'others', value: 'others' }];
		// NOTE: somehow exclusive={false} for accordion gives an error, unsure why, disabled for now
		const numberRange = [
			{ key: 0, text: 0, value: 0 },
			{ key: Infinity, text: Infinity, value: Infinity },
			...game.words.map((val, idx) => ({ key: (idx + 1), text: (idx + 1), value: (idx + 1) })),
		];

		return (
			<Container>
				<Header>{game.name}</Header>
				<p>current active team: {game.state.activeTeam}</p>
				<p>most recent clue: {game.currentClue.clue} - {game.currentClue.count} - {game.currentClue.team}</p>
				{player ? (<p>your team: {player.team} - {player.role}</p>) : ''}
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
					{game.words.map(wordObj => {
						let colour = wordObj.revealedTeam || undefined;
						if (game.isClueGiver && this.state.showColours) { colour = wordObj.hiddenTeam; }
						return (
							<Grid.Column key={wordObj.word}>
								<Button fluid={true} color={colour} name={wordObj.word} onClick={this.handleClickWord.bind(this)}>
									{wordObj.word}
								</Button>
							</Grid.Column>
						);
					})}
				</Grid>
				{(game.isActivePlayer && !game.isClueGiver) ? (
					<Button onClick={this.handleEndTurn.bind(this)}>Pass</Button>
				) : ''}
				{game.isClueGiver ? (
					<div>
					<Button onClick={this.handleShowColours.bind(this)} loading={!this.state.hiddenReady} >Show Colours</Button>
					<Input type='text' placeholder='clue...' value={this.state.clue} onChange={this.handleClueChange.bind(this)} action>
						<input />
						{/* somehow Dropdown dont work to merge into the input but Select does */}
						<Select compact options={numberRange} value={this.state.clueNumber} onChange={this.handleClueNumberChange.bind(this)} />
						<Button onClick={this.handleGiveClue.bind(this)} disabled={!game.isActivePlayer}>Give Clue</Button>
					</Input>
					</div>
				) : ''}
				{/* can only start/resetwords when game in setup */}
				{game.state.activeTeam === 'setup' ? (
					<div>
						<Button onClick={this.handleStart.bind(this)}>Start game</Button>
						<Button onClick={this.handleResetWords.bind(this)}
							loading={!this.state.resetWordsEnabled} disabled={!this.state.resetWordsEnabled}
						>
							Reset words
						</Button>
					</div>
				) : ''}
				{/* TODO: to make this thing appear when required, no team change in midst of game*/}
				<Dropdown placeholder="select team" fluid
					loading={!this.state.teamChangeEnabled} disabled={!this.state.teamChangeEnabled}
					value={this.state.team} options={teamOptions} onChange={this.handleTeamChange.bind(this)}
				/>
				<Dropdown placeholder="select role" fluid
					loading={!this.state.roleChangeEnabled} disabled={!this.state.roleChangeEnabled}
					value={this.state.role} options={roleOptions} onChange={this.handleRoleChange.bind(this)}
				/>
				{player ? (
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
			game: CodeNames.findOne(props.gameId),
			message: props.message,
		});
	} else {
		onData(null, { ready: false });
	}
}

export const CodeNamesUIContainer = reactify(reactiveMapper)(CodeNamesUI);
