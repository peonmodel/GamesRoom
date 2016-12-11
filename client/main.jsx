import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

// import App from '../imports/ui/App.jsx';
import { Component } from 'react';
import { LoginLayout } from '../imports/ui/login.jsx';
import { LobbyContainer } from '../imports/ui/lobby.jsx';

Meteor.startup(() => {
	render(<App />, document.getElementById('render-target'));
});

class App extends Component {
	render() {
		return (
			<div className="container">
				<LoginLayout />
				<LobbyContainer />
			</div>
		);
	}
}
