import React from 'react';
import PropTypes from 'prop-types';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
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

		const settings = props.settings;

		this.state =
		{
			settings : clone(settings, false)
		};
	}

	render()
	{
		const settings = this.state.settings;

		return (
			<TransitionAppear duration={250}>
				<div data-component='Settings'>
					<h1>JsSIP UA settings</h1>

					<div className='item'>
						<TextField
							floatingLabelText='SIP URI'
							value={settings.uri || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeSipUri.bind(this)}
						/>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='SIP password'
							value={settings.password || ''}
							floatingLabelFixed
							fullWidth
							type='password'
							onChange={this.handleChangePassword.bind(this)}
						/>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='WebSocket URI'
							value={settings.socket.uri || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeWebSocketUri.bind(this)}
						/>
					</div>

					<div className='item'>
						<SelectField
							floatingLabelText='Via transport'
							value={settings.socket.via_transport || 'auto'}
							fullWidth
							onChange={this.handleChangeViaTransport.bind(this)}
						>
							<MenuItem value='auto' primaryText='auto'/>
							<MenuItem value='tcp' primaryText='TCP'/>
							<MenuItem value='tls' primaryText='TLS'/>
							<MenuItem value='ws' primaryText='WS'/>
							<MenuItem value='wss' primaryText='WSS'/>
						</SelectField>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='Registrar server'
							value={settings.registrar_server || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeRegistrarServer.bind(this)}
						/>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='Contact URI'
							value={settings.contact_uri || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeContactUri.bind(this)}
						/>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='Authorization user'
							value={settings.authorization_user || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeAuthorizationUser.bind(this)}
						/>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='Instance ID'
							value={settings.instance_id || ''}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeInstanceId.bind(this)}
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

					<div className='separator'/>

					<h1>callstats.io settings</h1>

					<List>
						<ListItem
							primaryText='Enabled'
							secondaryText='Send call statistics to callstats.io'
							secondaryTextLines={1}
							rightToggle={
								<Toggle
									defaultToggled={settings.callstats.enabled}
									onToggle={this.handleToogleCallstatsEnabled.bind(this)}
								/>
							}
						/>
					</List>

					<div className='separator'/>

					<div className='item'>
						<TextField
							floatingLabelText='AppID'
							value={settings.callstats.AppID || ''}
							disabled={!settings.callstats.enabled}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeCallstatsAppID.bind(this)}
						/>
					</div>

					<div className='item'>
						<TextField
							floatingLabelText='AppSecret'
							value={settings.callstats.AppSecret || ''}
							disabled={!settings.callstats.enabled}
							floatingLabelFixed
							fullWidth
							onChange={this.handleChangeCallstatsAppSecret.bind(this)}
						/>
					</div>

					<div className='separator'/>

					<div className='buttons'>
						<RaisedButton
							label='Cancel'
							secondary
							style={{ display: 'block' }}
							onClick={this.handleCancel.bind(this)}
						/>

						<RaisedButton
							label='OK'
							primary
							style={{ display: 'block' }}
							onClick={this.handleSubmit.bind(this)}
						/>
					</div>
				</div>
			</TransitionAppear>
		);
	}

	handleChangeSipUri(event)
	{
		const settings = this.state.settings;

		settings.uri = event.target.value;
		this.setState({ settings });
	}

	handleChangePassword(event)
	{
		const settings = this.state.settings;

		settings.password = event.target.value;
		this.setState({ settings });
	}

	handleChangeWebSocketUri(event)
	{
		const settings = this.state.settings;

		settings.socket.uri = event.target.value;
		this.setState({ settings });
	}

	handleChangeViaTransport(event, key, value)
	{
		const settings = this.state.settings;

		settings.socket['via_transport'] = value;
		this.setState({ settings });
	}

	handleChangeRegistrarServer(event)
	{
		const settings = this.state.settings;

		settings['registrar_server'] = event.target.value;
		this.setState({ settings });
	}

	handleChangeContactUri(event)
	{
		const settings = this.state.settings;

		settings['contact_uri'] = event.target.value;
		this.setState({ settings });
	}

	handleChangeAuthorizationUser(event)
	{
		const settings = this.state.settings;

		settings['authorization_user'] = event.target.value;
		this.setState({ settings });
	}

	handleChangeInstanceId(event)
	{
		const settings = this.state.settings;

		settings['instance_id'] = event.target.value;
		this.setState({ settings });
	}

	handleToogleSessionTimers()
	{
		const settings = this.state.settings;

		settings['session_timers'] = !settings.session_timers;
		this.setState({ settings });
	}

	handleToogleUsePreloadedRoute()
	{
		const settings = this.state.settings;

		settings['use_preloaded_route'] = !settings.use_preloaded_route;
		this.setState({ settings });
	}

	handleToogleCallstatsEnabled()
	{
		const settings = this.state.settings;

		settings['callstats']['enabled'] = !settings.callstats.enabled;
		this.setState({ settings });
	}

	handleChangeCallstatsAppID(event)
	{
		const settings = this.state.settings;

		settings.callstats.AppID = event.target.value;
		this.setState({ settings });
	}

	handleChangeCallstatsAppSecret(event)
	{
		const settings = this.state.settings;

		settings.callstats.AppSecret = event.target.value;
		this.setState({ settings });
	}

	handleSubmit()
	{
		logger.debug('handleSubmit()');

		const settings = this.state.settings;

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
	settings : PropTypes.object.isRequired,
	onSubmit : PropTypes.func.isRequired,
	onCancel : PropTypes.func.isRequired
};
