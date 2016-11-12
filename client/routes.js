import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {
	name: 'public',
	action(pathParams, queryParams) {  // eslint-disable-line no-unused-vars
		BlazeLayout.render('MainLayout', {
			// sidebar: '',
			content: 'Lobby',
		});
	},
});

// FlowRouter.route('/room/:accesscode', {
// 	name: 'room',
// 	action(pathParams, queryParams) {
// 		if (!Room.collection.findOne(pathParams.accesscode)) {
// 			FlowRouter.go('public');
// 			console.warn('room not found, redirecting to public lobby');
// 			// sAlert.warning('room not found, redirecting to public lobby');
// 			return;
// 		}
// 		BlazeLayout.render('MainLayout', {
// 			content: 'Room',
// 		});
// 	},
// });
