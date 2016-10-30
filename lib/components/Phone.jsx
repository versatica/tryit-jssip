'use strict';

import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import JsSIP from 'jssip';
import Logger from '../Logger';
import User from '../User';
import config from '../config';
import TransitionAppear from './TransitionAppear';
import Logo from './Logo';
import Dialer from './Dialer';
import Session from './Session';

const logger = new Logger('Phone');

export default class Phone extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			uri     : '',
			// 'connecting' / disconnected' / 'connected' / 'registered'
			status  : 'disconnected',
			session : null
		};

		// Mounted flag
		this._mounted = false;
		// JsSIP.UA instance
		this._ua = null;
	}

	render()
	{
		let state = this.state;
		let props = this.props;

		return (
			<TransitionAppear duration={1000}>
				<div data-component='Phone'>
					<header>
						<div className='topbar'>
							<Logo
								size='small'
							/>

							<IconMenu
								iconButtonElement={
									<IconButton>
										<MoreVertIcon color='#fff'/>
									</IconButton>
								}
								anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
								targetOrigin={{ horizontal: 'right', vertical: 'top' }}
							>
								<CopyToClipboard text='TODO'
									onCopy={this.handleMenuCopyInvitationLink.bind(this)}
								>
									<MenuItem
										primaryText='Copy invitation link'
									/>
								</CopyToClipboard>
								<CopyToClipboard text={state.uri}
									onCopy={this.handleMenuCopyUri.bind(this)}
								>
									<MenuItem
										primaryText='Copy my SIP URI'
									/>
								</CopyToClipboard>
								<MenuItem
									primaryText='Exit'
									onClick={this.handleMenuLogout.bind(this)}
								/>
							</IconMenu>
						</div>

						<Dialer
							status={state.status}
							busy={!!state.session}
							onCall={this.handleOutgoingCall.bind(this)}
						/>
					</header>

					<div className='session-container'>
						{state.session ?
							<Session
								session={state.session}
								onNotify={props.onNotify}
								onHideNotification={props.onHideNotification}
							/>
						:
							null
						}
					</div>
				</div>
			</TransitionAppear>
		);
	}

	componentDidMount()
	{
		this._mounted = true;

		this._ua = new JsSIP.UA(
			{
				uri        : `sip:${this.props.me.id}@${config.domain}`,
				ws_servers : config.socket
			});

		this._ua.on('connecting', () =>
		{
			if (!this._mounted)
				return;

			logger.debug('UA "connecting" event');

			this.setState(
				{
					uri    : this._ua.configuration.uri.toString(),
					status : 'connecting'
				});
		});

		this._ua.on('connected', () =>
		{
			if (!this._mounted)
				return;

			logger.debug('UA "connected" event');

			this.setState({ status: 'connected' });
		});

		this._ua.on('disconnected', () =>
		{
			if (!this._mounted)
				return;

			logger.debug('UA "disconnected" event');

			this.setState({ status: 'disconnected' });
		});

		this._ua.on('registered', () =>
		{
			if (!this._mounted)
				return;

			logger.debug('UA "registered" event');

			this.setState({ status: 'registered' });
		});

		this._ua.on('unregistered', () =>
		{
			if (!this._mounted)
				return;

			logger.debug('UA "unregistered" event');

			if (this._ua.isConnected())
				this.setState({ status: 'connected' });
			else
				this.setState({ status: 'disconnected' });
		});

		this._ua.on('registrationFailed', () =>
		{
			if (!this._mounted)
				return;

			logger.debug('UA "registrationFailed" event');

			if (this._ua.isConnected())
				this.setState({ status: 'connected' });
			else
				this.setState({ status: 'disconnected' });
		});

		this._ua.start();

		// TOOD: TEST
		global.ua = this._ua;
	}

	componentWillUnmount()
	{
		this._mounted = false;
	}

	handleMenuCopyInvitationLink()
	{
		let message = 'Invitation link copied to the clipboard';

		this.props.onShowSnackbar(message, 3000);
	}

	handleMenuCopyUri()
	{
		let message = 'Your SIP URI copied to the clipboard';

		this.props.onShowSnackbar(message, 3000);
	}

	handleMenuLogout()
	{
		this.props.onLogout();
	}

	handleOutgoingCall(uri)
	{
		let session = this._ua.call(uri,
			{
				mediaConstraints : { audio: true, video: true }
			});

		session.on('connecting', () =>
		{
			this._handleSession(session);
		});
	}

	_handleSession(session)
	{
		session.on('failed', () =>
		{
			this.setState({ session: null });
		});

		session.on('ended', () =>
		{
			this.setState({ session: null });
		});

		this.setState({ session });
	}
}

Phone.propTypes =
{
	me                 : React.PropTypes.instanceOf(User).isRequired,
	onNotify           : React.PropTypes.func.isRequired,
	onHideNotification : React.PropTypes.func.isRequired,
	onShowSnackbar     : React.PropTypes.func.isRequired,
	onHideSnackbar     : React.PropTypes.func.isRequired,
	onLogout           : React.PropTypes.func.isRequired
};
