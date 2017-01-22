import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Message, Container } from 'semantic-ui-react';
import { _ } from 'lodash';

export class GlobalMessage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: 'Error',
			message: '',
			hidden: true,
			error: true,
			success: false,
			info: false,
			warning: false,
			history: [1, 2, 3, 4, 5],
			historyLimit: 5,
			expiry: 5000,
		};
		this.timerId = null;
		props.globalMessage.instance = this;
	}

	setMessage({
		message,
		title = '',
		type = 'error',
		error, reason, details,
	}, show = true, expiry = this.state.expiry) {
		if (error) {
			type = 'error';
			message = reason || error || message;
		}
		if (!['error', 'info', 'warning', 'success'].includes(type)) { type = 'error'; }
		const newState = { message, error: false, info: false, warning: false, success: false };
		newState[type] = true;
		newState.title = !!title ? _.upperFirst(title) : _.upperFirst(type);
		this.setState(newState);
		this.state.history.push(message);
		this.state.history.shift();
		if (show) { this.setState({ hidden: !show }); }
		this.timeout(expiry);
	}

	timeout(expiry) {
		clearTimeout(this.timerId);
		this.timerId = setTimeout(() => {
			this.setState({ hidden: true });
		}, expiry);
	}

	show(expiry = this.state.expiry) {
		this.setState({ hidden: false });
		this.timeout(expiry);
	}

	handleDismiss() {
		this.setState({ hidden: true });
	}

	render() {
		const style = {
			position: 'fixed', padding: '10px', bottom: 0, width: '100%',
			display: this.state.hidden ? 'none' : 'block',
		};
		return (
			<Container style={style}>
				<Message
				error={this.state.error}
				success={this.state.success}
				info={this.state.info}
				warning={this.state.warning}
				hidden={this.state.hidden}
				onDismiss={this.handleDismiss.bind(this)}
			>
				<Message.Header>{this.state.title}</Message.Header>
				<p>{this.state.message}</p>
			</Message>
			</Container>
		);
	}
}

const globalMessage = { instance: null };
globalMessage.component = (<GlobalMessage globalMessage={globalMessage}/>);
const globalMessageComponent = globalMessage.component;
const globalMessageInstance = globalMessage.instance;
export { globalMessageComponent, globalMessageInstance, globalMessage };
