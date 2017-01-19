export const UserSchema = {
	_id: String,
	createdAt: Date,
	services: {
		password: { bcrypt: String },
		resume: { loginTokens: [Object] },
	},
	username: String,
	profile: {
		public: {
			isRegistered: Boolean,
			lastActiveAt: Date,
			isOnline: Boolean,
			displayName: String,
		},
		connections: [String],
	},
};

export const ConnectionSchema = {
	connectionId: String,
	client: String,
	userId: String, // or null
};
