'use strict';

import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Logger from './Logger';
import utils from './utils';
import App from './components/App';

const logger = new Logger();

injectTapEventPlugin();

domready(() =>
{
	logger.debug('DOM ready');

	// Load stuff and run
	utils.initialize()
		.then(run)
		.catch((error) =>
		{
			console.error(error);
		});
});

function run()
{
	logger.debug('run() [environment:%s]', process.env.NODE_ENV);

	let container = document.getElementById('tryit-jssip-container');

	ReactDOM.render(<App/>, container);
}
