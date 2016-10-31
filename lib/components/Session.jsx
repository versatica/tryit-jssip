'use strict';

import React from 'react';
import classnames from 'classnames';
import JsSIP from 'jssip';
import Logger from '../Logger';
import TransitionAppear from './TransitionAppear';

const logger = new Logger('Session');

export default class Session extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			localHasVideo  : false,
			remoteHasVideo : false,
			localHold      : false,
			remoteHold     : false,
			canHold        : false
		};

		// Mounted flag
		this._mounted = false;
		// Local cloned stream
		this._localClonedStream = null;
	}

	render()
	{
		let state = this.state;
		let props = this.props;
		let noRemoteVideo;

		if (props.session.isInProgress())
			noRemoteVideo = <div className='message ringing'>ringing ...</div>;
		else if (state.localHold && state.remoteHold)
			noRemoteVideo = <div className='message both-hold'>both hold</div>;
		else if (state.localHold)
			noRemoteVideo = <div className='message local-hold'>local hold</div>;
		else if (state.remoteHold)
			noRemoteVideo = <div className='message remote-hold'>remote hold</div>;
		else if (!state.remoteHasVideo)
			noRemoteVideo = <div className='message no-remote-video'>no remote video</div>;

		return (
			<TransitionAppear duration={1000}>
				<div data-component='Session'>
					<video
						ref='localVideo'
						className={classnames('local-video', { hidden: !state.localHasVideo })}
						autoPlay
						muted
					/>

					<video
						ref='remoteVideo'
						className={classnames('remote-video', { hidden: noRemoteVideo })}
						autoPlay
					/>

					{noRemoteVideo ?
						<div className='no-remote-video-info'>
							{noRemoteVideo}
						</div>
					:
						null
					}

					<div className='controls-container'>
						<div className='controls'>
							<div
								className={classnames('control', 'hang-up')}
								onClick={this.handleHangUp.bind(this)}
							/>
							{!state.localHold ?
								<div
									className={classnames('control', 'hold', { disabled: !state.canHold })}
									onClick={this.handleHold.bind(this)}
								/>
							:
								<div
									className={classnames('control', 'resume', { disabled: !state.canHold })}
									onClick={this.handleResume.bind(this)}
								/>
							}
						</div>
					</div>
				</div>
			</TransitionAppear>
		);
	}

	componentDidMount()
	{
		this._mounted = true;

		let localVideo = this.refs.localVideo;
		let session = this.props.session;
		let peerconnection = session.connection;
		let localStream = peerconnection.getLocalStreams()[0];
		let remoteStream = peerconnection.getRemoteStreams()[0];

		// Handle local stream
		if (localStream)
		{
			// Clone local stream
			this._localClonedStream = localStream.clone();

			// Display local stream
			localVideo.srcObject = this._localClonedStream;

			setTimeout(() =>
			{
				if (!this._mounted)
					return;

				if (localStream.getVideoTracks()[0])
					this.setState({ localHasVideo: true });
			}, 1000);
		}

		// If incoming all we already have the remote stream
		if (remoteStream)
			this._handleRemoteStream(remoteStream);

		if (session.isEstablished())
		{
			setTimeout(() =>
			{
				if (!this._mounted)
					return;

				this.setState({ canHold: true });
			});
		}

		session.on('accepted', (data) =>
		{
			logger.debug('session "accepted" event [data:%o]', data);

			if (session.direction === 'outgoing')
			{
				this.props.onNotify(
					{
						level : 'success',
						title : 'Call answered'
					});
			}

			this.setState({ canHold: true });
		});

		session.on('failed', (data) =>
		{
			logger.debug('session "failed" event [data:%o]', data);

			this.props.onNotify(
				{
					level   : 'error',
					title   : 'Call failed',
					message : `Cause: ${data.cause}`
				});
		});

		session.on('ended', (data) =>
		{
			logger.debug('session "ended" event [data:%o]', data);

			this.props.onNotify(
				{
					level   : 'info',
					title   : 'Call ended',
					message : `Cause: ${data.cause}`
				});
		});

		session.on('hold', (data) =>
		{
			let originator = data.originator;

			logger.debug('session "hold" event [originator:%s]', originator);

			switch (originator)
			{
				case 'local':
					this.setState({ localHold: true });
					break;
				case 'remote':
					this.setState({ remoteHold: true });
					break;
			}
		});

		session.on('unhold', (data) =>
		{
			let originator = data.originator;

			logger.debug('session "unhold" event [originator:%s]', originator);

			switch (originator)
			{
				case 'local':
					this.setState({ localHold: false });
					break;
				case 'remote':
					this.setState({ remoteHold: false });
					break;
			}
		});

		peerconnection.addEventListener('addstream', (event) =>
		{
			logger.debug('peerconnection "addstream" event');

			this._handleRemoteStream(event.stream);
		});
	}

	componentWillUnmount()
	{
		this._mounted = false;
		JsSIP.Utils.closeMediaStream(this._localClonedStream);
	}

	handleHangUp()
	{
		logger.debug('handleHangUp()');

		this.props.session.terminate();
	}

	handleHold()
	{
		logger.debug('handleHold()');

		this.props.session.hold({ useUpdate: true });
	}

	handleResume()
	{
		logger.debug('handleResume()');

		this.props.session.unhold({ useUpdate: true });
	}

	_handleRemoteStream(stream)
	{
		let remoteVideo = this.refs.remoteVideo;

		// Display remote stream
		remoteVideo.srcObject = stream;

		this._checkRemoteVideo(stream);

		stream.addEventListener('addtrack', () =>
		{
			if (remoteVideo.srcObject !== stream)
				return;

			logger.debug('remote stream "addtrack" event');

			// Refresh remote video
			remoteVideo.srcObject = stream;

			this._checkRemoteVideo(stream);
		});

		stream.addEventListener('removetrack', () =>
		{
			if (remoteVideo.srcObject !== stream)
				return;

			logger.debug('remote stream "removetrack" event');

			// Refresh remote video
			remoteVideo.srcObject = stream;

			this._checkRemoteVideo(stream);
		});
	}

	_checkRemoteVideo(stream)
	{
		let videoTrack = stream.getVideoTracks()[0];

		this.setState({ remoteHasVideo: !!videoTrack });
	}
}

Session.propTypes =
{
	session            : React.PropTypes.object.isRequired,
	onNotify           : React.PropTypes.func.isRequired,
	onHideNotification : React.PropTypes.func.isRequired,
};
