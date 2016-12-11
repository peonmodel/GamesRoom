import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Input, Button } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';

class GuestLogIn extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<Button>
					Guest login
				</Button>
			</div>
		);
	}
}

// const GuestLoginForm = () => (
// 	<Form>
// 		<Header as='h4'>Log in as guest</Header>
// 		<Button type='submit'>Guest Login</Button>
// 	</Form>
// );

// const LogInForm = (props) => (
// 	<Form>
// 		<Header as='h4'>Log In</Header>
// 		<Form.Field>
// 			<label>Username</label>
// 			<input placeholder={props.placeholder}/>
// 		</Form.Field>
// 		<Form.Field>
// 			<label>Password</label>
// 			<input type='password'/>
// 		</Form.Field>
// 		<Button type='submit' onClick={props.login}>Login</Button>
// 	</Form>
// );

class RegisterOrLogin extends Component {
	constructor(props) {
		Object.assign({
			guestLogin() {}
		}, props);
		super(props);
	}
	render() {
		return (
			<Container>
				<Input className="username" placeholder={this.props.tempName} />
				<Input className="password" type="password" />
				<Button>Login</Button>
				<Button>Register</Button>
				<GuestLogIn />
			</Container>
		);
	}
}

export class LoginLayout extends Component {
	render() {
		return (
			<RegisterOrLogin/>
		);
	}
}
