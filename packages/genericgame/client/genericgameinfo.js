import { Mongo } from 'meteor/mongo';
import { genericGameInfoSchema } from '../imports/schema.js';

/**
 * class for information of a game that may need to be restricted
 *
 * @export
 * @class GenericGameInfo
 */
export class GenericGameInfo {
	constructor(item) {
		Object.assign(item);
	}
}
GenericGameInfo.collectionName = `freelancecourtyard:genericgame/InfoCollection`;
GenericGameInfo.collection = new Mongo.Collection(`${GenericGameInfo.collectionName}`, {
	transform: null,
});
GenericGameInfo.collection._ensureIndex({ gameId: 1 });
GenericGameInfo.collection._ensureIndex({ expiredAt: 1 }, { expireAfterSeconds: 3600 });

GenericGameInfo.schema = genericGameInfoSchema;
