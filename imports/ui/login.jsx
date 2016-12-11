import { Meteor } from 'meteor/meteor';
import { Connection } from 'meteor/freelancecourtyard:connection';
import React, { Component } from 'react';
import { Container, Button, Form, Header, Message, Label } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';

class GuestLogIn extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: {},
			placeholder: this.placeholder,
			busy: false,
			error: undefined,
		};
	}

	get placeholder() {
		const colorArray = [
			'Pink', 'Blue', 'Orange', 'Green', 'Yellow', 'Fuchsia', 'Red', 'Golden', 'Silver', 'Brown'
		];
		const sizeArray = [
			'Little', 'Small', 'Big', 'Fat', 'Tiny', 'Huge', 'Mini'
		];
		const emotionArray = [
			'Happy', 'Sad', 'Depressed', 'Excited', 'Angry', 'Motivated', 'Scared', 'Energized', 'Surprised', 'Tired'
		];
		const nounArray = [
			'Diamond', 'JetPack', 'Cruiser', 'Bunny', 'Lambini', 'Bird', 'Elephant', 'Frog', 'Player', 'Lover', 'Guest',
			'User', 'Cow', 'Mustang', 'Student', 'Driver', 'Hawker', 'Villager', 'Explorer', 'Dancer', 'Stranger', 'Farmer', 'Boat', 'Car', 'Chicken', 'Machine', 'Thing'
		];
		const number = _.sample(_.range(10, 2110));
		const tempName = _.sample(emotionArray) + _.sample(sizeArray) + _.sample(colorArray) + _.sample(nounArray) + number;
		return tempName;
	}

	async handleSubmit(event, { formData }) {
		event.preventDefault();
		this.setState({ busy: true });
		try {
			await Connection.createGuest(formData.username || this.state.placeholder);
		} catch (e) {
			console.error(e);
			this.setState({ error: true });
		} finally {
			this.setState({ busy: false });
		}
	}

	handleChange() {
		this.setState({ error: false });
	}

	render() {
		return (
			<Form error={this.state.error} onSubmit={this.handleSubmit.bind(this)} onChange={this.handleChange.bind(this)}>
				<Header as='h4'>Log in as guest</Header>
				<Form.Field>
					<label>Username</label>
					<input name="username" placeholder={this.state.placeholder} />
				</Form.Field>
					<Message error header='Action Forbidden' content='username is used' />
				<Button type='submit' loading={this.state.busy}>Guest Login</Button>
			</Form>
		);
	}
}

class Logout extends Component {
	constructor(props) {
		super(props);
	}

	async handleClick() {
		try {
			await Connection.logoutUser();
			console.log(`logged out`);
		} catch (error) {
			console.error(`error logging out`);
		}
	}

	render() {
		const username = _.get(this.props.user, 'username') || '';
		const isGuest = !_.get(this.props.user, 'profile.isRegistered');
		return (
			<Container>
				<Label>
					{username}
					<Label.Detail>{isGuest ? 'Guest' : 'User'}</Label.Detail>
				</Label>
				<Button onClick={this.handleClick.bind(this)}>Log out</Button>
			</Container>
		);
	}
}

export class Login extends Component {
	constructor(props) {
		super(props);  // this.props is "reactive", the other this attributes are reused
	}

	render() {
		const loggedIn = !!this.props.user;
		const isRegistered = !!_.get(this.props.user, 'profile.isRegistered');
		let selectiveLogin = null;
		if (!loggedIn) {
			selectiveLogin = (<GuestLogIn />);
		} else if (!isRegistered) {
			selectiveLogin = (<Logout user={this.props.user}/>);
		} else {
			selectiveLogin = (<Logout user={this.props.user}/>);
		}
		return (
			<Container>
				{ selectiveLogin }
			</Container>
		);
	}
}

function reactiveMapper(props, onData) {
	onData(null, { user: Meteor.user() });
}

export const LoginContainer = reactify(reactiveMapper)(Login);
