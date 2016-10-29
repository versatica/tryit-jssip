'use strict';

import React from 'react';
import Flag from 'react-flags';
import classnames from 'classnames';
import Logger from '../Logger';
import utils from '../utils';
import Player from '../Player';

const logger = new Logger('PlayerView');

export default class PlayerView extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			dump : false
		};
	}

	dump()
	{
		this.setState({ dump: true });
	}

	render()
	{
		let props = this.props;
		let state = this.state;
		let player = props.player;
		let noOverlay = !utils.canCssOverlayWithPerspective();
		let klass = classnames(
			{
				focused      : props.focused,
				'no-overlay' : noOverlay
			});
		let style =
		{
			backgroundImage : `url('${player.photoSrc}')`
		};
		let likeClass;

		if (player.localLike && player.remoteLike)
			likeClass = 'full';
		else if (player.localLike)
			likeClass = 'local';
		else if (player.remoteLike)
			likeClass = 'remote';
		else
			likeClass = 'empty';

		return (
			<div data-component='PlayerView' className={klass} style={style}>
				<div className={classnames('video-wrapper', { hidden: !player.streamSrc })}>
					<video className={classnames({ isMe: props.isMe })} src={player.streamSrc} autoPlay loop muted={!props.match}/>
					}
				</div>

				<div className='bar'>
					<div className='info'>
						{!state.dump ?
							<p className='name'>{`${player.name}, ${player.age}`}</p>
						:
							<p className='name'>{`${player.name}, ${player.age} [active:${player.active}]`}</p>
						}
						{player.location ?
							<div className='location'>
								<Flag
									basePath='/resources/vendor/react-flags'
									name={player.location.countryCode}
									format='png'
									pngSize={utils.isDesktop() ? 24 : 16}
									shiny={false}
									alt={player.location.country}
								/>
								<p>{`${player.location.country}, ${player.location.city}`}</p>
							</div>
						:
							<div className='location'/>
						}
					</div>

					{!props.isMe ?
						<div className='actions'>
							<div className={classnames('like', likeClass, { clickable: props.focused })} onClick={this.handleLike.bind(this)}/>
						</div>
					:null}
				</div>

				{props.match ? <div className='audio-on'/> : null}
			</div>
		);
	}

	handleLike()
	{
		logger.debug('handleLike()');

		let player = this.props.player;

		if (!player.localLike)
			this.props.onLike();
		else
			this.props.onUnLike();
	}
}

PlayerView.propTypes =
{
	player   : React.PropTypes.instanceOf(Player).isRequired,
	isMe     : React.PropTypes.bool.isRequired,
	focused  : React.PropTypes.bool.isRequired,
	match    : React.PropTypes.bool.isRequired,
	onLike   : React.PropTypes.func.isRequired,
	onUnLike : React.PropTypes.func.isRequired
};
