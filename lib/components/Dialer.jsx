'use strict';

import React from 'react';
import Logger from '../Logger';
import User from '../User';

const logger = new Logger('Dialer');

export default class Dialer extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			me : props.me
		};
	}

	render()
	{
		let state = this.state;

		return (
			<div data-component='Dialer'>
				dialer jeje
			</div>
		);
	}
}

Dialer.propTypes =
{
	me : React.PropTypes.instanceOf(User).isRequired
};
