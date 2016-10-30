'use strict';

import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
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
			me  : props.me,
			uri : ''
		};
	}

	render()
	{
		let state = this.state;
		let statusColor = '#47d41c';

		return (
			<div data-component='Dialer'>
				<div className='status-bar'>

					<Chip>
						<Avatar
							backgroundColor={statusColor}
						/>
						Iñaki Baz <span className='uri'>&lt;sip:ibc@aliax.net&gt;</span>
					</Chip>
				</div>

				<form className='uri-form' action='' onSubmit={this.handleSubmit.bind(this)}>
					<div className='uri-container'>
						<TextField
							hintText='SIP URI or username'
							fullWidth
							value={state.uri}
							onChange={this.handleUriChange.bind(this)}
						/>
					</div>

					<RaisedButton
						label='Call'
						primary
						onClick={this.handleClickCall.bind(this)}
					/>
				</form>
			</div>
		);
	}

	handleUriChange(event)
	{
		let uri = event.target.value;

		this.setState({ uri });
	}

	handleSubmit(event)
	{
		logger.debug('handleSubmit()');

		event.preventDefault();
		this._doCall();
	}

	handleClickCall()
	{
		logger.debug('handleClickCall()');

		this._doCall();
	}

	_doCall()
	{
		let uri = this.state.uri;

		logger.debug('_doCall() [uri:"%s"]', uri);
	}
}

Dialer.propTypes =
{
	me : React.PropTypes.instanceOf(User).isRequired
};
