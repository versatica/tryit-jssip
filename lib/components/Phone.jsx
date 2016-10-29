'use strict';

import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Logger from '../Logger';
import audioPlayer from '../audioPlayer';
import Player from '../Player';
import TransitionAppear from './TransitionAppear';
import Logo from './Logo';
import Polyhedron from './Polyhedron';
import NetClient from '../NetClient';

const logger = new Logger('Room');

// TODO: hardcoded for now
const ROOM_ID = 'abcd1234';

export default class Room extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			me        : props.me,
			players   : [ props.me ],
			showAbout : false,
			showHelp  : false
		};

		// Mounted flag
		this._mounted = false;
		// NetClient instance
		this._netClient = null;
	}

	dump()
	{
		logger.debug('dump()');

		let data =
		{
			netClient : this._netClient.getDump()
		};

		console.log(JSON.stringify(data, null, '\t'));

		// Also tell some components to dump info
		this.refs.Polyhedron.dump();
	}

	render()
	{
		let state = this.state;

		return (
			<TransitionAppear duration={2000}>
				<div data-component='Room'>
					<div className='logo-container'>
						<Logo
							size='small'
						/>
					</div>

					<div className='menu-container'>
						<IconMenu
							iconButtonElement={
								<IconButton>
									<MoreVertIcon color='#fff'/>
								</IconButton>
							}
							anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
							targetOrigin={{ horizontal: 'right', vertical: 'top' }}
						>
							<MenuItem
								primaryText='Leave room'
								onClick={this.handleMenuLeaveRoom.bind(this)}
							/>
							<MenuItem
								primaryText='Help'
								onClick={this.handleMenuHelp.bind(this)}
							/>
							<MenuItem
								primaryText='About'
								onClick={this.handleMenuAbout.bind(this)}
							/>
						</IconMenu>
					</div>

					<Polyhedron ref='Polyhedron'
						me={this.state.me}
						players={this.state.players}
						onActivePlayer={this.handleActivePlayer.bind(this)}
						onUnactivePlayer={this.handleUnactivePlayer.bind(this)}
						onMatch={this.handleMatch.bind(this)}
						onUnMatch={this.handleUnMatch.bind(this)}
						onLike={this.handleLike.bind(this)}
						onUnLike={this.handleUnLike.bind(this)}
					/>

					<Dialog
						className='firstsight-dialog'
						title='About'
						modal={false}
						open={state.showAbout}
						onRequestClose={() => this.setState({ showAbout: false })}
						actions={
							[
								<FlatButton
									key='ok'
									label='OK'
									primary
									onClick={() => this.setState({ showAbout: false })}
								/>
							]
						}
					>
						<p>FIRSTSIGHT is a multi-video-conference application built on top of <span className='mediasoup'>mediasoup</span>, a "powerful WebRTC SFU for Node.js".</p>

						<p>Learn more about <span className='mediasoup'>mediasoup</span> at <a href='http://mediasoup.org' target='_blank'>mediasoup.org</a>.</p>
					</Dialog>

					<Dialog
						className='firstsight-dialog'
						title='Help'
						modal={false}
						autoScrollBodyContent
						open={state.showHelp}
						onRequestClose={() => this.setState({ showHelp: false })}
						actions={
							[
								<FlatButton
									key='ok'
									label='OK'
									primary
									onClick={() => this.setState({ showHelp: false })}
								/>
							]
						}
					>
						<p>Turn the polyhedron in any direction to see the webcam of all the other players.</p>

						<p>Send likes to those players you like and wait for them to send you back a like. If that happens and, you both focus one to each other, then you can talk.</p>

						<p>Enjoy!</p>
					</Dialog>
				</div>
			</TransitionAppear>
		);
	}

	componentDidMount()
	{
		// Set flag
		this._mounted = true;

		// Create window.Room and window.dd() function that invokes dump() on this Room
		global.dd = () =>
		{
			global.Room = this;
			if (this._mounted)
				this.dump();
		};

		this._netClient = new NetClient(this.props.me);

		this._netClient.on('open', () =>
		{
			this._netClient.joinRoom(ROOM_ID)
				.then(() =>
				{
					this.props.onNotify(
					{
						level       : 'success',
						title       : 'Yes!',
						message     : 'You are in the room!',
						image       : '/resources/images/room.svg',
						imageWidth  : 80,
						imageHeight : 80
					});
				})
				.catch((error) =>
				{
					this.props.onNotify(
						{
							level   : 'error',
							title   : 'Error',
							message : `Couldn't join the room: ${error.message}`
						});

					this.props.onExit();
				});
		});

		this._netClient.on('close', (error) =>
		{
			if (error)
			{
				this.props.onNotify(
					{
						level   : 'error',
						title   : 'Error',
						message : error.message
					});
			}

			this.props.onExit();
		});

		this._netClient.on('connecting', (attempt) =>
		{
			if (attempt > 0 && attempt <= 4)
			{
				this.props.onNotify(
				{
					level   : 'info',
					message : `Connecting to the server (attempt ${attempt})...`
				});
			}
			else if (attempt > 4)
			{
				this.props.onNotify(
					{
						level   : 'error',
						title   : 'Error',
						message : 'Couldn\'t connect to the server'
					});

				this.props.onExit();
			}
		});

		this._netClient.on('existingplayer', (player) =>
		{
			this.props.onNotify(
				{
					level       : 'success',
					message     : `${player.name} is in the room`,
					image       : player.photoSrc,
					imageWidth  : 80,
					imageHeight : 80,
					action      :
					{
						label    : 'Go',
						callback : () =>
						{
							this.refs.Polyhedron.focusPlayer(player);
						}
					}
				});
		});

		this._netClient.on('newplayer', (player) =>
		{
			this.props.onNotify(
				{
					level       : 'success',
					message     : `${player.name} joined the room`,
					image       : player.photoSrc,
					imageWidth  : 80,
					imageHeight : 80,
					action      :
					{
						label    : 'Go',
						callback : () =>
						{
							this.refs.Polyhedron.focusPlayer(player);
						}
					}
				});
		});

		this._netClient.on('removeplayer', (player) =>
		{
			this.props.onNotify(
				{
					level       : 'info',
					message     : `${player.name} left the room`,
					image       : player.photoSrc,
					imageWidth  : 50,
					imageHeight : 50
				});
		});

		this._netClient.on('otherplayers', (otherPlayers) =>
		{
			let players = [ this.props.me ].concat(otherPlayers);

			this.setState({ players });
		});

		this._netClient.on('remotelike', (player) =>
		{
			let uid = `remotelike-${player.id}`;

			this.props.onHideNotification(uid);
			this.props.onNotify(
				{
					uid         : uid,
					level       : 'success',
					message     : `${player.name} sent you a like`,
					image       : player.photoSrc,
					imageWidth  : 80,
					imageHeight : 80,
					action      :
					{
						label    : 'Go',
						callback : () =>
						{
							this.refs.Polyhedron.focusPlayer(player);
						}
					}
				});

			audioPlayer.play('like');

			this._checkRemotePlayer(player);
		});

		this._netClient.on('remoteunlike', (player) =>
		{
			let uid = `remotelike-${player.id}`;

			this.props.onHideNotification(uid);

			this._checkRemotePlayer(player);
		});
	}

	componentWillUnmount()
	{
		// Unset flag
		this._mounted = false;

		// Remove window.Room
		delete global.Room;

		this._netClient.removeAllListeners();
		this._netClient.close();
	}

	handleActivePlayer(player)
	{
		logger.debug('handleActivePlayer() [id:"%s", player:%o]', player.id, player);

		// Send request
		this._netClient.sendActivePlayer(player);

		this._checkRemotePlayer(player);
	}

	handleUnactivePlayer(player)
	{
		logger.debug('handleUnactivePlayer() [id:"%s", player:%o]', player.id, player);

		// Send request
		this._netClient.sendUnactivePlayer(player);
	}

	handleMatch(player)
	{
		logger.debug('handleMatch() [id:"%s", player:%o]', player.id, player);

		this.props.onHideNotification('match');
		this.props.onHideNotification('unmatch');
		this.props.onNotify(
		{
			uid         : 'match',
			position    : 'bc',
			level       : 'success',
			title       : 'Match!',
			message     : `You can talk to ${player.name}`,
			autoDismiss : 3,
			image       : '/resources/images/match.svg',
			imageWidth  : 50,
			imageHeight : 50
		});

		audioPlayer.play('match');
	}

	handleUnMatch()
	{
		logger.debug('handleUnMatch()');

		this.props.onHideNotification('match');
		this.props.onHideNotification('unmatch');
		this.props.onNotify(
		{
			uid         : 'unmatch',
			position    : 'bc',
			level       : 'info',
			title       : 'Unmatch :(',
			message     : 'Conversation ended',
			autoDismiss : 2,
			image       : '/resources/images/unmatch.svg',
			imageWidth  : 50,
			imageHeight : 50
		});

		audioPlayer.play('unmatch');
	}

	handleLike(player)
	{
		logger.debug('handleLike() [id:"%s", player:%o]', player.id, player);

		let uid = `locallike-${player.id}`;

		this.props.onHideNotification(uid);
		this.props.onNotify(
			{
				uid         : uid,
				level       : 'info',
				message     : `Like sent to ${player.name}`,
				image       : player.photoSrc,
				imageWidth  : 50,
				imageHeight : 50
			});

		// Send request
		this._netClient.sendLike(player);
	}

	handleUnLike(player)
	{
		logger.debug('handleUnLike() [id:"%s", player:%o]', player.id, player);

		let uid = `locallike-${player.id}`;

		this.props.onHideNotification(uid);

		// Send request
		this._netClient.sendUnLike(player);
	}

	handleMenuLeaveRoom()
	{
		this.props.onExit();
	}

	handleMenuAbout()
	{
		this.setState({ showAbout: true });
	}

	handleMenuHelp()
	{
		this.setState({ showHelp: true });
	}

	_checkRemotePlayer(player)
	{
		// Show message
		if (
			player.remoteLike &&
			!player.localLike &&
			player.active
		)
		{
			let message = `Click the \u2661 icon to talk to ${player.name}`;

			this.props.onShowSnackbar(message, 2500);
		}
	}
}

Room.propTypes =
{
	me                 : React.PropTypes.instanceOf(Player).isRequired,
	onNotify           : React.PropTypes.func.isRequired,
	onHideNotification : React.PropTypes.func.isRequired,
	onShowSnackbar     : React.PropTypes.func.isRequired,
	onHideSnackbar     : React.PropTypes.func.isRequired,
	onExit             : React.PropTypes.func.isRequired
};
