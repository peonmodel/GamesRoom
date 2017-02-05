import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

// import App from '../imports/ui/App.jsx';
import { Component } from 'react';
import { LoginContainer } from '../imports/ui/login.jsx';
import { LobbyContainer } from '../imports/ui/lobby.jsx';
import { CurrentRoomContainer } from '../imports/ui/room.jsx';

import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { globalMessage } from '../imports/ui/errormessage.jsx';

class App extends Component {
	render() {
		return (
			<div className="container">
				<LoginContainer />
				{this.props.children}
				{globalMessage.component}
			{/* <Sidebar.Pushable as={Segment} style={style}>
				{ errorSideBar.component }
				<Sidebar.Pusher>
					<Segment basic>
						<LoginContainer />
						{this.props.children}
					</Segment>
				</Sidebar.Pusher>
			</Sidebar.Pushable> */}
			</div>
		);
	}
}
// <Route path="lobby" component={LobbyContainer} />
const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
			<IndexRoute component={LobbyContainer} />
			<Route path="room/:roomId" component={CurrentRoomContainer}></Route>
    </Route>
  </Router>
);

Meteor.startup(() => {
	// render(<App />, document.getElementById('render-target'));
	render(renderRoutes(), document.getElementById('render-target'));
});
