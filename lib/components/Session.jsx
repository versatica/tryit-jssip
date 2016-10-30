'use strict';

import React from 'react';
import Logger from '../Logger';
import TransitionAppear from './TransitionAppear';

const logger = new Logger('Session');

export default class Session extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {};
	}

	render()
	{
		return (
			<TransitionAppear duration={1000}>
				<div data-component='Session'>
					<video ref='remoteVideo' className='remote-video' autoPlay/>
					<video ref='localVideo' className='local-video' autoPlay muted/>
				</div>
			</TransitionAppear>
		);
	}

	componentDidMount()
	{
		let localVideo = this.refs.localVideo;
		let remoteVideo = this.refs.remoteVideo;
		let session = this.props.session;
		let peerconnection = session.connection;
		let localStream = peerconnection.getLocalStreams()[0];

		// Display local video
		localVideo.srcObject = localStream;

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

		peerconnection.addEventListener('addstream', (event) =>
		{
			logger.debug('peerconnection "addstream" event');

			let stream = event.stream;

			// Display remote video
			remoteVideo.srcObject = stream;

			// Set stream events

			stream.addEventListener('addtrack', () =>
			{
				if (remoteVideo.srcObject !== stream)
					return;

				logger.debug('remote stream "addtrack" event');

				// Refresh remote video
				remoteVideo.srcObject = stream;
			});

			stream.addEventListener('removetrack', () =>
			{
				if (remoteVideo.srcObject !== stream)
					return;

				logger.debug('remote stream "removetrack" event');

				// Refresh remote video
				remoteVideo.srcObject = stream;
			});
		});
	}
}

Session.propTypes =
{
	session            : React.PropTypes.object.isRequired,
	onNotify           : React.PropTypes.func.isRequired,
	onHideNotification : React.PropTypes.func.isRequired,
};
