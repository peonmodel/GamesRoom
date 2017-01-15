import { Meteor } from 'meteor/meteor';
import { Connection } from 'meteor/freelancecourtyard:connection';
import React, { Component } from 'react';
import { Container, Button, Form, Header, Message, Label, Input, Icon, Modal, Grid } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';

class GuestLogin extends Component {
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
					<Input name="username" placeholder={this.state.placeholder} />
				</Form.Field>
					<Message error header='Action Forbidden' content='username is used' />
				<Button type='submit' loading={this.state.busy}>Guest Login</Button>
			</Form>
		);
	}
}

// normal user login form
class UserLogin extends Component {
	constructor(props) {
		super(props);
		this.state = {
			busy: false,
			formData: {},
		};
	}

	async handleSubmit(event, { formData }) {
		event.preventDefault();
		this.setState({ busy: true });
		try {
			await Connection.loginUser(formData.username, formData.password);
		} catch (e) {
			console.error(e);
			this.setState({ error: true, reason: e });
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
				<Header as='h4'>Sign up</Header>
				<Form.Field>
					<label>Username</label>
					<Form.Input name="username" />
				</Form.Field>
				<Form.Field>
					<label>Password</label>
					<Form.Input name="password" type="password" />
				</Form.Field>
				<Message error header='Action Forbidden' content='username/password combination not found' />
				<Button type='submit' loading={this.state.busy}>Login</Button>
			</Form>
		);
	}
}

// should ask to make existing user non-guest
class RegisterUser extends Component {
	constructor(props) {
		super(props);
		this.state = {
			busy: false,
			formData: {},
			confirmPassword: '',
			password: '',
		};
	}

	async handleSubmit(event, { formData }) {
		event.preventDefault();
		this.setState({ busy: true });
		try {
			if (formData.password !== formData.confirmPassword) {
				throw new Meteor.Error('password and password confirmation not the same');
			}
			await Connection.createGuest(formData.username, formData.password);
		} catch (e) {
			console.error(e);
			this.setState({ error: true, reason: e });
		} finally {
			this.setState({ busy: false });
		}
	}

	handleChange() {
		this.setState({ error: false });
	}

	handlePasswordChange(event, value) {
		this.setState({ password: value.value });
	}

	handleConfirmPasswordChange(event, value) {
		this.setState({ confirmPassword: value.value });
	}

	render() {
		const isMatch = this.state.password === this.state.confirmPassword;
		const isLong = this.state.password.length >= 10;  // check password for length & complexity
		const passwordMatch = (this.state.password && isMatch) ? 'checkmark' : null;
		const isValid = passwordMatch && isLong;
		return (
			<Form error={this.state.error} onSubmit={this.handleSubmit.bind(this)} onChange={this.handleChange.bind(this)}>
				<Header as='h4'>Sign up</Header>
				<Form.Field>
					<label>Username</label>
					<Form.Input name="username" placeholder={this.state.placeholder} />
				</Form.Field>
				<Form.Field>
					<label>Password</label>
					<Form.Input name="password" type="password" onChange={this.handlePasswordChange.bind(this)} icon={isLong}/>
				</Form.Field>
				<Form.Field>
					<label>Confirm password</label>
					<Form.Input name="confirmPassword" type="password" onChange={this.handleConfirmPasswordChange.bind(this)} error={!isMatch} icon={passwordMatch}/>
				</Form.Field>
				<Message error header='Action Forbidden' content='username is used' />
				<Button type='submit' loading={this.state.busy} disabled={!isValid}>Sign up</Button>
			</Form>
		);
	}
}

class LogInOrRegisterModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: 'back', // 'login', 'register', 'guestlogin'
			modalOpen: !!props.user,
		};
	}

	handleSelect(event, element) {
		this.setState({ selected: element.name });
	}

	handleOpen() {
		this.setState({ modalOpen: true });
	}

	handleClose() {
		this.setState({ modalOpen: false, selected: 'back' });
	}

	render() {
		const choices = {
			back: (
				<Grid columns={3} divided>
					<Grid.Row>
						<Grid.Column>
							<Header size="tiny">Login to an existing account</Header>
							<Button size="tiny" name="login" onClick={this.handleSelect.bind(this)}>Login</Button>
						</Grid.Column>
						<Grid.Column>
							<Header size="tiny">Register a new account</Header>
							<Button size="tiny" name="register" onClick={this.handleSelect.bind(this)}>Register</Button>
						</Grid.Column>
						<Grid.Column>
							<Header size="tiny">Login as a temporary guest user</Header>
							<Button size="tiny" name="guestlogin" onClick={this.handleSelect.bind(this)}>Guest Login</Button>
						</Grid.Column>
					</Grid.Row>
				</Grid>
			),
			login: (
				<UserLogin/>
			),
			register: (
				<RegisterUser/>
			),
			guestlogin: (
				<GuestLogin/>
			),
		};
		return (
			<Modal
				size="large" 
				trigger={<Button size="mini" onClick={this.handleOpen.bind(this)}>Login / Register</Button>} 
				closeIcon='close'
				onClose={this.handleClose.bind(this)}
			>
				<Header icon='user' content='Login / Register' />
				<Modal.Content>
					{ choices[this.state.selected] }
				</Modal.Content>
				<Modal.Actions>
					<Button basic color='red' name="back" onClick={this.handleSelect.bind(this)}>
						<Icon name='remove' /> Back
					</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

class Login extends Component {
	constructor(props) {
		super(props);  // this.props is "reactive", the other this attributes are reused
	}

	handleClick() {}

	async handleLogout() {
		try {
			await Connection.logoutUser();
			console.log(`logged out`);
		} catch (error) {
			console.error(`error logging out`);
		}
	}

	render() {
		const user = this.props.user;
		const isRegistered = !!_.get(user, 'profile.isRegistered');
		let selectiveLogin = null;
		if (!!user && isRegistered) {
			selectiveLogin = (
				<Container>
					<Label>
						{user.profile.displayName || user.username}
						<Label.Detail>registered</Label.Detail>
					</Label>
					<Button onClick={this.handleLogout.bind(this)}>Log out</Button>
				</Container>
			);
		}
		if (!!user && !isRegistered) {
			selectiveLogin = (
				<Container>
					<Label>
						{user.profile.displayName || user.username}
						<Label.Detail>guest</Label.Detail>
					</Label>
					<Button onClick={this.handleClick.bind(this)}>Register</Button>
					<Button onClick={this.handleLogout.bind(this)}>Log out</Button>
				</Container>
			);
		}
		if (!user) {
			selectiveLogin = (
				<LogInOrRegisterModal user={user}/>
			);
		}
		// if (!loggedIn) {
		// 	selectiveLogin = (
		// 		<div>
		// 		<GuestLogin />
		// 		<RegisterUser user={this.props.user}/>
		// 		<UserLogin/>
		// 		</div>
		// 	);  // UserLogin & RegisterUser
		// } else if (!isRegistered) {
		// 	selectiveLogin = (<Logout user={this.props.user} />);  // RegisterUser
		// } else {
		// 	selectiveLogin = (<Logout user={this.props.user} />);
		// }
		// if logged in registered, details & logout Button
		// if guest logged in, details, register & logout Button
		// if not logged in, log in / register button
		return (
			<div>{ selectiveLogin }</div>
		);
		// return (
		// 	<Modal trigger={<Button>Login</Button>} basic size='small'>
		// 		<Header icon='user' content='Login / Register' />
		// 		<Modal.Content>
		// 			<p>Log in to existing account or as a guest user</p>
		// 			{ selectiveLogin }
		// 		</Modal.Content>
		// 		<Modal.Actions>
		// 			<Button basic color='red' inverted>
		// 				<Icon name='remove' /> No
		// 			</Button>
		// 			<Button color='green' inverted>
		// 				<Icon name='checkmark' /> Yes
		// 			</Button>
		// 		</Modal.Actions>
		// 	</Modal>
		// );
	}
}

function reactiveMapper(props, onData) {
	onData(null, { user: Meteor.user() });
}

export const LoginContainer = reactify(reactiveMapper)(Login);
