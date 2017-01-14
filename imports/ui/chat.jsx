import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Container, Input, Button, Card, Form, Comment, Header, Divider } from 'semantic-ui-react';
import { _ } from 'lodash';
// import ReactDOM from 'react-dom';
import { reactify } from 'meteor/freelancecourtyard:reactivecomponent';
import { Chat } from 'meteor/freelancecourtyard:chatmessages';
import moment from 'moment';

class MessageItem extends Component {
	constructor(props) {
		super(props);
	}

	// async replyMessage() {
	// 	// return this.props.message.replyMessage()
	// }

	render() {
		const message = this.props.message;
		// let replyItem = '';
		// if (!this.props.isReply) {
		// 	const reply = this.props.messages.find(msg => msg._id === (message.replyTo || {})._id);
		// 	if (reply) {
		// 		replyItem = (
		// 			<MessageItem message={reply} messages={this.props.messages} isReply={true}/>
		// 		);
		// 	}
		// }
		return (
			<Comment>
				<Comment.Avatar />
				<Comment.Content>
					{ /* replyItem */ }
					<Comment.Author as='a'>{message.from.displayName}</Comment.Author>
					<Comment.Text>{message.text}</Comment.Text>
					<Comment.Metadata>
						<div>{moment(message.timestamp).fromNow()}</div>
					</Comment.Metadata>
					{/* <Comment.Actions>
						<Comment.Action>Reply</Comment.Action>
					</Comment.Actions> */}
				</Comment.Content>
			</Comment>
		);
	}
}

export class Conversation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: {},
			busy: false,
			error: false,
		};
	}

	leaveChat() {

	}

	async handleSubmit(event, { formData }) {
		event.preventDefault();
		this.setState({ busy: true });
		if (!formData.chatText) { return; }
		try {
			return this.props.chat.createMessage(formData.chatText);
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
		if (!this.props.ready) { return (<div></div>); }
		const chat = this.props.chat;
		const messageArray = chat.messages.map(msg => {
			return (<MessageItem message={msg} key={msg._id} messages={chat.messages} />);
		});
		return (
			<Container className="currentChat">
				<h1>{chat.title}</h1>
				// add messages here
				<Comment.Group minimal>
				<Header>Messages</Header>
				{ messageArray }
				<Divider />
				<Form reply onSubmit={this.handleSubmit.bind(this)} onChange={this.handleChange.bind(this)}>
					<Form.TextArea name="chatText"/>
					<Button content='Add Reply' labelPosition='left' icon='edit' primary />
				</Form>
				<Button onClick={this.leaveChat.bind(this)}>Leave Chat</Button>
				</Comment.Group>
			</Container>
		);
	}
}

// usage
function reactiveMapper(props, onData) {
	const chatId = props.chatId;
	// note that the relevant messages are also subscribed
	const activeSub = Meteor.subscribe('ActiveChat', chatId);
	if (activeSub.ready()) {
		onData(null, {
			ready: true,
			chat: Chat.collection.findOne(chatId),
		});
	} else {
		onData(null, { ready: false });
	}
}

export const ConversationContainer = reactify(reactiveMapper)(Conversation);
