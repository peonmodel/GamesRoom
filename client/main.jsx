import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

// import App from '../imports/ui/App.jsx';
import { Component } from 'react';
import { LoginContainer } from '../imports/ui/login.jsx';
import { LobbyContainer } from '../imports/ui/lobby.jsx';

import { Router, Route, browserHistory, IndexRoute } from 'react-router';

class App extends Component {
	// 			<LobbyContainer />
	render() {
		return (
			<div className="container">
				<LoginContainer />
				{this.props.children}
			</div>
		);
	}
}

const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
			<IndexRoute component={LobbyContainer} />
    </Route>
  </Router>
);

Meteor.startup(() => {
	// render(<App />, document.getElementById('render-target'));
	render(renderRoutes(), document.getElementById('render-target'));
});
