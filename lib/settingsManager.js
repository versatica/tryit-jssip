'use strict';

import clone from 'clone';
import Logger from './Logger';

import storage from './storage';

const logger = new Logger('settingsManager');

const DEFAULT_SIP_DOMAIN = 'tryit.jssip.net';
const DEFAULT_SETTINGS =
{
	display_name        : null,
	uri                 : null,
	password            : null,
	socket              :
	{
		uri           : 'wss://tryit.jssip.net:10443',
		via_transport : 'auto',
	},
	registrar_server    : null,
	contact_uri         : null,
	authorization_user  : null,
	instance_id         : null,
	session_timers      : true,
	use_preloaded_route : false,
	callstats           :
	{
		enabled   : false,
		AppID     : null,
		AppSecret : null
	}
};

let settings;

// Try to read settings from a global and custom SETTINGS object
if (window.SETTINGS)
{
	logger.debug('window.SETTINGS found');

	settings = window.SETTINGS;
}
// Otherwise read settings from local storage
else
{
	settings = storage.get();

	if (settings)
		logger.debug('settings found in local storage');
}

// If not settings are found, clone default ones
if (!settings)
{
	logger.debug('no settings found, using default ones');

	settings = clone(DEFAULT_SETTINGS, false);
}

module.exports =
{
	get()
	{
		return settings;
	},

	set(newSettings)
	{
		storage.set(newSettings);
		settings = newSettings;
	},

	clear()
	{
		storage.clear();
		settings = clone(DEFAULT_SETTINGS, false);
	},

	isReady()
	{
		return !!settings.uri;
	},

	getDefaultDomain()
	{
		return DEFAULT_SIP_DOMAIN;
	}
};
