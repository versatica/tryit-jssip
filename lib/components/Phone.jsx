'use strict';

import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Logger from '../Logger';
import audioPlayer from '../audioPlayer';
import User from '../User';
import TransitionAppear from './TransitionAppear';
import Logo from './Logo';
import Dialer from './Dialer';

const logger = new Logger('Phone');

export default class Phone extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			me : props.me
		};

		// Mounted flag
		this._mounted = false;
	}

	render()
	{
		let state = this.state;

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
								<CopyToClipboard text='SALUDOS JAJAJA'
									onCopy={this.handleMenuCopyInvitationLink.bind(this)}
								>
									<MenuItem
										primaryText='Copy invitation link'
									/>
								</CopyToClipboard>
								<MenuItem
									primaryText='Exit'
									onClick={this.handleMenuLogout.bind(this)}
								/>
							</IconMenu>
						</div>

						<Dialer
							me={this.props.me}
						/>
					</header>
				</div>
			</TransitionAppear>
		);
	}

	componentDidMount()
	{
		this._mounted = true;
	}

	componentWillUnmount()
	{
		this._mounted = false;
	}

	handleMenuCopyInvitationLink(text)
	{
		let message = `Invitation link copied to the clipboard: ${text}`;

		this.props.onShowSnackbar(message, 3000);
	}

	handleMenuLogout()
	{
		this.props.onLogout();
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
