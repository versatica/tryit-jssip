'use strict';

import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import JsSIP from 'jssip';
import UrlParse from 'url-parse';
import Logger from '../Logger';
import audioPlayer from '../audioPlayer';
import User from '../User';
import config from '../config';
import TransitionAppear from './TransitionAppear';
import Logo from './Logo';
import Dialer from './Dialer';
import Session from './Session';
import Incoming from './Incoming';

const logger = new Logger('Phone');

export default class Phone extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			// 'connecting' / disconnected' / 'connected' / 'registered'
			status          : 'disconnected',
			session         : null,
			incomingSession : null
		};

		// Mounted flag
		this._mounted = false;
		// JsSIP.UA instance
		this._ua = null;
		// Site URL
		this._u = new UrlParse(window.location.href, true);
	}

	render()
	{
		let state = this.state;
		let props = this.props;
		let invitationLink = `${this._u.protocol}//${this._u.host}${this._u.pathname}?callme=${props.me.uri}`;

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
								<CopyToClipboard text={invitationLink}
									onCopy={this.handleMenuCopyInvitationLink.bind(this)}
								>
									<MenuItem
										primaryText='Copy invitation link'
									/>
								</CopyToClipboard>
								<CopyToClipboard text={props.me.uri || ''}
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
							me={props.me}
							status={state.status}
							busy={!!state.session || !!state.incomingSession}
							callme={this._u.query.callme}
							onCall={this.handleOutgoingCall.bind(this)}
						/>
					</header>

					<div className='content'>
						{state.session ?
							<Session
								session={state.session}
								onNotify={props.onNotify}
								onHideNotification={props.onHideNotification}
							/>
						:
							null
						}

						{state.incomingSession ?
							<Incoming
								session={state.incomingSession}
								onAnswer={this.handleAnswerIncoming.bind(this)}
								onReject={this.handleRejectIncoming.bind(this)}
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

		let me = this.props.me;

		// Set user uri
		me.uri = `sip:${me.id}@${config.domain}`;

		this._ua = new JsSIP.UA(
			{
				uri          : me.uri,
				display_name : me.name,
				ws_servers   : config.socket
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

		this._ua.on('newRTCSession', (data) =>
		{
			if (!this._mounted)
				return;

			if (data.originator === 'local')
				return;

			logger.debug('UA "newRTCSession" event');

			let state = this.state;
			let session = data.session;

			// Avoid if busy or other incoming
			if (state.session || state.incomingSession) {
				logger.debug('incoming call replied with 486 "Busy Here"');

				session.terminate(
					{
						status_code   : 486,
						reason_phrase : 'Busy Here'
					});

				return;
			}

			audioPlayer.play('ringing');
			this.setState({ incomingSession: session });

			session.on('failed', () =>
			{
				audioPlayer.stop('ringing');
				this.setState(
					{
						session         : null,
						incomingSession : null
					});
			});

			session.on('ended', () =>
			{
				this.setState(
					{
						session         : null,
						incomingSession : null
					});
			});

			session.on('accepted', () =>
			{
				audioPlayer.stop('ringing');
				this.setState(
					{
						session         : session,
						incomingSession : null
					});
			});
		});

		this._ua.start();
	}

	componentWillUnmount()
	{
		this._mounted = false;
	}

	handleMenuCopyInvitationLink()
	{
		logger.debug('handleMenuCopyInvitationLink()');

		let message = 'Invitation link copied to the clipboard';

		this.props.onShowSnackbar(message, 3000);
	}

	handleMenuCopyUri()
	{
		logger.debug('handleMenuCopyUri()');

		let message = 'Your SIP URI copied to the clipboard';

		this.props.onShowSnackbar(message, 3000);
	}

	handleMenuLogout()
	{
		logger.debug('handleMenuLogout()');

		this._ua.stop();
		this.props.onLogout();
	}

	handleOutgoingCall(uri)
	{
		logger.debug('handleOutgoingCall() [uri:"%s"]', uri);

		let session = this._ua.call(uri,
			{
				mediaConstraints : { audio: true, video: true }
			});

		audioPlayer.play('ringback');

		session.on('connecting', () =>
		{
			this.setState({ session });
		});

		session.on('failed', () =>
		{
			audioPlayer.stop('ringback');
			audioPlayer.play('rejected');
			this.setState({ session: null });
		});

		session.on('ended', () =>
		{
			audioPlayer.stop('ringback');
			this.setState({ session: null });
		});

		session.on('accepted', () =>
		{
			audioPlayer.stop('ringback');
			audioPlayer.play('answered');
		});
	}

	handleAnswerIncoming()
	{
		logger.debug('handleAnswerIncoming()');

		let session = this.state.incomingSession;

		session.answer();
	}

	handleRejectIncoming()
	{
		logger.debug('handleRejectIncoming()');

		let session = this.state.incomingSession;

		session.terminate();
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
