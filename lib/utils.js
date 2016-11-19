'use strict';

import Logger from './Logger';

const logger = new Logger('utils');

let mediaQueryDetectorElem;

module.exports =
{
	initialize()
	{
		logger.debug('initialize()');

		// Media query detector stuff
		mediaQueryDetectorElem = document.getElementById('tryit-jssip-media-query-detector');

		return Promise.resolve();
	},

	isDesktop()
	{
		return !!mediaQueryDetectorElem.offsetParent;
	},

	isMobile()
	{
		return !mediaQueryDetectorElem.offsetParent;
	}
};
