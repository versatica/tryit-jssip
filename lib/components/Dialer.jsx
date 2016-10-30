'use strict';

import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import classnames from 'classnames';
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
			uri : ''
		};
	}

	render()
	{
		let state = this.state;
		let props = this.props;

		return (
			<div data-component='Dialer'>
				<div className='status-bar'>
					<Chip className='chip'>
						<Avatar
							className={classnames('status', props.status)}
						/>
						{props.me.name} <span className='uri'>&lt;{props.me.uri}&gt;</span>
					</Chip>
				</div>

				<form
					className={classnames('uri-form', { hidden: props.busy })}
					action=''
					onSubmit={this.handleSubmit.bind(this)}
				>
					<div className='uri-container'>
						<TextField
							hintText='SIP URI or username'
							fullWidth
							disabled={!this._canCall()}
							value={state.uri}
							onChange={this.handleUriChange.bind(this)}
						/>
					</div>

					<RaisedButton
						label='Call'
						primary
						disabled={!this._canCall() || !state.uri}
						onClick={this.handleClickCall.bind(this)}
					/>
				</form>
			</div>
		);
	}

	handleUriChange(event)
	{
		this.setState({ uri: event.target.value });
	}

	handleSubmit(event)
	{
		logger.debug('handleSubmit()');

		event.preventDefault();

		if (!this._canCall() || !this.state.uri)
			return;

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

		this.setState({ uri: '' });
		this.props.onCall(uri);
	}

	_canCall()
	{
		let props = this.props;

		return (
			!props.busy &&
			(props.status === 'connected' || props.status === 'registered')
		);
	}
}

Dialer.propTypes =
{
	me     : React.PropTypes.instanceOf(User).isRequired,
	status : React.PropTypes.string.isRequired,
	busy   : React.PropTypes.bool.isRequired,
	onCall : React.PropTypes.func.isRequired
};
