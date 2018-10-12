'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import HangUpIcon from 'material-ui/svg-icons/communication/call-end';
import PauseIcon from 'material-ui/svg-icons/av/pause-circle-outline';
import ResumeIcon from 'material-ui/svg-icons/av/play-circle-outline';
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
			canHold        : false,
			ringing        : false
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

		if (props.session.isInProgress() && !state.ringing)
			noRemoteVideo = <div className='message'>connecting ...</div>;
		else if (state.ringing)
			noRemoteVideo = <div className='message'>ringing ...</div>;
		else if (state.localHold && state.remoteHold)
			noRemoteVideo = <div className='message'>both hold</div>;
		else if (state.localHold)
			noRemoteVideo = <div className='message'>local hold</div>;
		else if (state.remoteHold)
			noRemoteVideo = <div className='message'>remote hold</div>;
		else if (!state.remoteHasVideo)
			noRemoteVideo = <div className='message'>no remote video</div>;

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
							<HangUpIcon
								className='control'
								color={'#fff'}
								onClick={this.handleHangUp.bind(this)}
							/>
							{!state.localHold ?
								<PauseIcon
									className='control'
									color={'#fff'}
									onClick={this.handleHold.bind(this)}
								/>
							:
								<ResumeIcon
									className='control'
									color={'#fff'}
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
		logger.debug('componentDidMount()');

		this._mounted = true;

		let localVideo = this.refs.localVideo;
		let session = this.props.session;
    let mediaSettings = this.props.settings.media;

		let peerconnection = session.connection;
		let localStream = peerconnection.getLocalStreams()[0];
		let remoteStream = peerconnection.getRemoteStreams()[0];

		// Handle local stream
		if (localStream)
		{
			// Clone local stream
			this._localClonedStream = localStream.clone();

			// Display local stream
			this._attachStreamToElement(localVideo, this._localClonedStream, mediaSettings.audioOutput);

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
		{
			logger.debug('already have a remote stream');

      this._handleRemoteStream(remoteStream);
		}

		if (session.isEstablished())
		{
			setTimeout(() =>
			{
				if (!this._mounted)
					return;

				this.setState({ canHold: true });
			});
		}

		session.on('progress', (data) =>
		{
			if (!this._mounted)
				return;

			logger.debug('session "progress" event [data:%o]', data);

			if (session.direction === 'outgoing')
				this.setState({ ringing: true });
		});

		session.on('accepted', (data) =>
		{
			if (!this._mounted)
				return;

			logger.debug('session "accepted" event [data:%o]', data);

			if (session.direction === 'outgoing')
			{
				this.props.onNotify(
					{
						level : 'success',
						title : 'Call answered'
					});
			}

			this.setState({ canHold: true, ringing: false });
		});

		session.on('failed', (data) =>
		{
			if (!this._mounted)
				return;

			logger.debug('session "failed" event [data:%o]', data);

			this.props.onNotify(
				{
					level   : 'error',
					title   : 'Call failed',
					message : `Cause: ${data.cause}`
				});

			if (session.direction === 'outgoing')
				this.setState({ ringing: false });
		});

		session.on('ended', (data) =>
		{
			if (!this._mounted)
				return;

			logger.debug('session "ended" event [data:%o]', data);

			this.props.onNotify(
				{
					level   : 'info',
					title   : 'Call ended',
					message : `Cause: ${data.cause}`
				});

			if (session.direction === 'outgoing')
				this.setState({ ringing: false });
		});

		session.on('hold', (data) =>
		{
			if (!this._mounted)
				return;

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
			if (!this._mounted)
				return;

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

			if (!this._mounted)
			{
				logger.error('_handleRemoteStream() | component not mounted');

				return;
			}

			this._handleRemoteStream(event.stream);
		});
	}

	componentWillUnmount()
	{
		logger.debug('componentWillUnmount()');

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
		logger.debug('_handleRemoteStream() [stream:%o]', stream);

		let remoteVideo = this.refs.remoteVideo;
		let mediaSettings = this.props.settings.media;

		// Display remote stream
    this._attachStreamToElement(remoteVideo, stream, mediaSettings.audioOutput);

		this._checkRemoteVideo(stream);

		stream.addEventListener('addtrack', (event) =>
		{
			let track = event.track;

			if (remoteVideo.srcObject !== stream)
				return;

			logger.debug('remote stream "addtrack" event [track:%o]', track);

			// Refresh remote video
      this._attachStreamToElement(remoteVideo, stream, mediaSettings.audioOutput);

			this._checkRemoteVideo(stream);

			track.addEventListener('ended', () =>
			{
				logger.debug('remote track "ended" event [track:%o]', track);
			});
		});

		stream.addEventListener('removetrack', () =>
		{
			if (remoteVideo.srcObject !== stream)
				return;

			logger.debug('remote stream "removetrack" event');

			// Refresh remote video
			this._attachStreamToElement(remoteVideo, stream, mediaSettings.audioOutput);

			this._checkRemoteVideo(stream);
		});
	}

	_checkRemoteVideo(stream)
	{
		if (!this._mounted)
		{
			logger.error('_checkRemoteVideo() | component not mounted');

			return;
		}

		let videoTrack = stream.getVideoTracks()[0];

		this.setState({ remoteHasVideo: !!videoTrack });
	}

  /**
   * Re/Attach stream to element with deviceId
   * @param {HTMLMediaElement} element - Target audio/video element
   * @param {Stream} stream - Stream to attach
	 * @param {String} deviceId - DeviceId to use for audio output
   */
	_attachStreamToElement(element, stream, deviceId) {
    // Pause stream before device change
    element.pause();

    // Redirect audio output to exact device
    if (deviceId && element.setSinkId) {
    	element.setSinkId(deviceId);
    }

		// ReAttach stream
		element.srcObject = stream;

    // Continue on new device
    element.play();
	}
}

Session.propTypes =
{
  settings					 : PropTypes.object.isRequired,
	session            : PropTypes.object.isRequired,
	onNotify           : PropTypes.func.isRequired,
	onHideNotification : PropTypes.func.isRequired
};
