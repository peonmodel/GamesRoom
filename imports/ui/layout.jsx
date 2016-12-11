import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Dropdown, Input, Grid, Popup, Button, Header, Form } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';

const LogInForm = (props) => (
	<Form>
		<Header as='h4'>Log In</Header>
		<Form.Field>
			<label>Username</label>
			<input placeholder={props.placeholder}/>
		</Form.Field>
		<Form.Field>
			<label>Password</label>
			<input type='password'/>
		</Form.Field>
		<Button type='submit' onClick={props.login}>Login</Button>
	</Form>
);

const SignUpForm = () => (
	<Form>
		<Header as='h4'>Sign Up</Header>
		<Form.Field>
			<label>Username</label>
			<input/>
		</Form.Field>
		<Form.Field>
			<label>Email</label>
			<input/>
		</Form.Field>
		<Form.Field>
			<label>Password</label>
			<input type='password'/>
		</Form.Field>
		<Form.Field>
			<label>Confirm Password</label>
			<input type='password'/>
		</Form.Field>
		<Button type='submit'>Login</Button>
	</Form>
);

const GuestLoginForm = () => (
	<Form>
		<Header as='h4'>Log in as guest</Header>
		<Button type='submit'>Guest Login</Button>
	</Form>
);

const SignUpLogInPopUp = () => (
	<Popup
		trigger={<Button>Log in/Sign up</Button>}
		flowing
		// hoverable
		on="click"
	>
		<Grid centered divided columns={3}>
			<Grid.Column textAlign='center'>
				<LogInForm />
			</Grid.Column>
			<Grid.Column textAlign='center'>
				<SignUpForm />
			</Grid.Column>
			<Grid.Column textAlign='center'>
				<GuestLoginForm />
			</Grid.Column>
		</Grid>
	</Popup>
);

class LogIn extends Component {
	constructor(props) {
		super(props);
		console.log(this, this.state, 'con')
		this.state = { stuff: '111' }
	}

	async click() {
		console.log('stuff')
		this.setState({ stuff: '222' })
		console.log(this)
	}

	render() {
		let logIn = null;
		if (!this.isLoggedIn) {
			// not logged in
			logIn = (
				<div>
				<SignUpLogInPopUp/>
				</div>
			);
		} else if (!this.isRegistered) {
			// logged in but not registered
			logIn = <div>is not registered</div>;
		} else {
			// registered log in
			logIn = <div>Welcome { this.user.username }</div>;
		}
		console.log(this, 'ren')
		this.user = this.props.user;
		this.displayName = _.get(this.user, 'profile.displayName') || _.get(this.user, 'username') || 'Unknown';
		return (
			<div>
				{ logIn }
				<Button onClick={this.click.bind(this)}>Click</Button>
				{ this.state.stuff }
				{ this.displayName }
			</div>
		);
	}
}
LogIn.propTypes = {
	user: React.PropTypes.object,
};

function reactiveMapper(props, onData) {
	onData(null, { user: Meteor.user() });
}

const LogInContainer = reactify(reactiveMapper)(LogIn);

export class HeaderLayout extends Component {
	render() {
		return (
			<Container>
				<LogInContainer/>
			</Container>
		);
	}
}
// class RegisteredLoggedIn extends Component {
	// // normal log in, show logout button, show display name, notifications etc
// }

// class GuestLoggedIn extends Component {
	// // same as registered, but add RegisterUser
// }

// class NotLoggedIn extends Component {
	// // shows LogInAsGuest & RegisterUser & normal login
// }

// class RegisterUser extends Component {
	// either register from scratch or from a guest user
// }

// class LogInAsGuest extends Component {
	// creates and log in as guest
// }
