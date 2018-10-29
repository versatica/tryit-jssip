import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';
import Logger from './Logger';
import utils from './utils';
import App from './components/App';

const logger = new Logger();

domready(() =>
{
	logger.debug('DOM ready');

	utils.initialize()
		.then(run);
});

function run()
{
	logger.debug('run() [environment:%s]', process.env.NODE_ENV);

	const container = document.getElementById('tryit-jssip-container');

	ReactDOM.render(<App/>, container);
}
