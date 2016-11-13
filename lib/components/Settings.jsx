'use strict';

import React from 'react';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import clone from 'clone';
import Logger from '../Logger';
import TransitionAppear from './TransitionAppear';

const logger = new Logger('Settings');

export default class Settings extends React.Component
{
	constructor(props)
	{
		super(props);

		let settings = props.settings;

		this.state =
		{
			settings : clone(settings, false)
		};
	}

	render()
	{
		let settings = this.state.settings;

		return (
			<TransitionAppear duration={250}>
				<div data-component='Settings'>
					<h1>JsSIP UA settings</h1>

					<div className='text-field'>
						<TextField
							floatingLabelText='SIP URI'
							value={settings.uri || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeSipUri.bind(this)}
						/>
					</div>

					<div className='text-field'>
						<TextField
							floatingLabelText='SIP password'
							value={settings.password || ''}
							floatingLabelFixed
							fullWidth
							type='password'
							onChange={this.handleChangePassword.bind(this)}
						/>
					</div>

					<div className='text-field'>
						<TextField
							floatingLabelText='WebSocket URI'
							value={settings.socket.uri || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeWebSocketUri.bind(this)}
						/>
					</div>

					<div className='separator'/>

					<List>
						<ListItem
							primaryText='Session Timers'
							secondaryText='Enable Session Timers as per RFC 4028'
							secondaryTextLines={1}
							rightToggle={
								<Toggle
									defaultToggled={settings.session_timers}
									onToggle={this.handleToogleSessionTimers.bind(this)}
								/>
							}
						/>

						<ListItem
							primaryText='Preloaded Route'
							secondaryText='Add a Route header with the server URI'
							secondaryTextLines={1}
							rightToggle={
								<Toggle
									defaultToggled={settings.use_preloaded_route}
									onToggle={this.handleToogleUsePreloadedRoute.bind(this)}
								/>
							}
						/>
					</List>

					{/* <h1>callstats.io settings</h1> */}

					<div className='buttons'>
						<RaisedButton
							label='Cancel'
							secondary
							style={{ display : 'block' }}
							onClick={this.handleCancel.bind(this)}
						/>

						<RaisedButton
							label='OK'
							primary
							style={{ display : 'block' }}
							onClick={this.handleSubmit.bind(this)}
						/>
					</div>
				</div>
			</TransitionAppear>
		);
	}

	handleChangeSipUri(event)
	{
		let settings = this.state.settings;
		let uri = event.target.value;

		settings.uri = uri;
		this.setState({ settings });
	}

	handleChangePassword(event)
	{
		let settings = this.state.settings;
		let password = event.target.value;

		settings.password = password;
		this.setState({ settings });
	}

	handleChangeWebSocketUri(event)
	{
		let settings = this.state.settings;
		let uri = event.target.value;

		settings.socket.uri = uri;
		this.setState({ settings });
	}

	handleToogleSessionTimers()
	{
		let settings = this.state.settings;
		let session_timers = !settings.session_timers;

		settings.session_timers = session_timers;
		this.setState({ settings });
	}

	handleToogleUsePreloadedRoute()
	{
		let settings = this.state.settings;
		let use_preloaded_route = !settings.use_preloaded_route;

		settings.use_preloaded_route = use_preloaded_route;
		this.setState({ settings });
	}

	handleSubmit()
	{
		logger.debug('handleSubmit()');

		let settings = this.state.settings;

		this.props.onSubmit(settings);
	}

	handleCancel()
	{
		logger.debug('handleCancel()');

		this.props.onCancel();
	}
}

Settings.propTypes =
{
	settings : React.PropTypes.object.isRequired,
	onSubmit : React.PropTypes.func.isRequired,
	onCancel : React.PropTypes.func.isRequired
};
