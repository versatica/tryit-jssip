'use strict';

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Logger from '../Logger';
import muiTheme from './muiTheme';
import Snackbar from 'material-ui/Snackbar';
import Notifier from './Notifier';
import Login from './Login';
import Phone from './Phone';

const logger = new Logger('App');

export default class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			step            : 'login',
			me              : null,
			showSnackbar    : false,
			snackbarMessage : null
		};

		// Mounted flag
		this._mounted = false;
		// Timer for snackbar
		this._snackbarTimer = null;
	}

	render()
	{
		let state = this.state;
		let component;

		switch (state.step)
		{
			case 'login':
			{
				component =
					<Login
						onLogin={this.handleLogin.bind(this)}
					/>;

				break;
			}

			case 'phone':
			{
				component =
					<Phone
						me={state.me}
						onNotify={this.handleNotify.bind(this)}
						onHideNotification={this.handleHideNotification.bind(this)}
						onShowSnackbar={this.handleShowSnackbar.bind(this)}
						onHideSnackbar={this.handleHideSnackbar.bind(this)}
						onExit={this.handleRoomExit.bind(this)}
					/>;

				break;
			}
		}

		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<div data-component='App'>
					<Notifier ref='Notifier'/>

					{component}

					<Snackbar
						open={state.showSnackbar}
						message={state.snackbarMessage || ''}
						bodyStyle={{ textAlign: 'center' }}
						onRequestClose={() => {}} // Avoid auto-hide on click away
					/>
				</div>
			</MuiThemeProvider>
		);
	}

	componentDidMount()
	{
		// Set flag
		this._mounted = true;
	}

	componentWillUnmount()
	{
		// Unset flag
		this._mounted = false;
	}

	handleNotify(data)
	{
		this.refs.Notifier.notify(data);
	}

	handleHideNotification(uid)
	{
		this.refs.Notifier.hideNotification(uid);
	}

	handleShowSnackbar(message, duration)
	{
		clearTimeout(this._snackbarTimer);

		this.setState(
			{
				showSnackbar    : true,
				snackbarMessage : message
			});

		if (duration)
		{
			this._snackbarTimer = setTimeout(() =>
			{
				if (!this._mounted)
					return;

				this.setState({ showSnackbar: false });
			}, duration);
		}
	}

	handleHideSnackbar()
	{
		clearTimeout(this._snackbarTimer);

		this.setState(
			{
				showSnackbar : false
			});
	}

	handleLogin(user)
	{
		logger.debug('handleLogin() [user:%o]', user);

		// Go to room
		this.setState(
			{
				step         : 'room',
				me           : user,
				showSnackbar : false
			});
	}

	handleRoomExit()
	{
		logger.debug('handleRoomExit()');

		// Go to login
		this.setState(
			{
				step         : 'login',
				me           : null,
				showSnackbar : false
			});
	}
}
