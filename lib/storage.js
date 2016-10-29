'use strict';

import Logger from './Logger';
import User from './User';

const logger = new Logger('storage');

module.exports =
{
	getUser()
	{
		let data = localStorage.getItem('user');
		let user;

		if (data)
			user = new User(JSON.parse(data));

		logger.debug('getUser() [user:%o]', user);

		return user;
	},

	setUser(user)
	{
		logger.debug('setUser() [user:%o]', user);

		if (!(user instanceof User))
			throw new TypeError('user must be an instance of User');

		localStorage.setItem('user', user.stringify());
	},

	clear()
	{
		logger.debug('clear()');

		localStorage.clear();
	}
};
