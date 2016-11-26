import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
// import { Room } from 'meteor/freelancecourtyard:gamesroom';
// import { sAlert } from 'meteor/juliancwirko:s-alert';

FlowRouter.route('/', {
	name: 'public',
	action(pathParams, queryParams) {  // eslint-disable-line no-unused-vars
		BlazeLayout.render('MainLayout', {
			// sidebar: '',
			content: 'Lobby',
		});
	},
});

FlowRouter.route('/room/:roomId', {
	name: 'room',
	action(/* pathParams, queryParams */) {
		BlazeLayout.render('MainLayout', {
			content: 'RoomWrapper',
		});
	},
});
