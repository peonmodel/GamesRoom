import { Tracker } from 'meteor/tracker';
import { compose } from 'react-komposer';

function getTrackerLoader(reactiveMapper) {
	return (props, onData, env) => {
		let trackerCleanup = null;
		const handler = Tracker.nonreactive(() => {
			return Tracker.autorun(() => {
				// assign the custom clean-up function.
				trackerCleanup = reactiveMapper(props, onData, env);
			});
		});

		return () => {
			if (typeof trackerCleanup === 'function') trackerCleanup();
			return handler.stop();
		};
	};
}

export default function reactify(reactiveMapper) {
	return compose(getTrackerLoader(reactiveMapper));
}

export { reactify };
