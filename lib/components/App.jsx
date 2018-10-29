import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Logger from '../Logger';
import settingsManager from '../settingsManager';
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
			step            : settingsManager.isReady() ? 'phone' : 'login',
			settings        : settingsManager.get(),
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
		const state = this.state;
		let component;

		switch (state.step)
		{
			case 'login':
			{
				component =
					<Login
						settings={state.settings}
						onLogin={this.handleLogin.bind(this)}
					/>;

				break;
			}

			case 'phone':
			{
				component =
					<Phone
						settings={state.settings}
						onNotify={this.handleNotify.bind(this)}
						onHideNotification={this.handleHideNotification.bind(this)}
						onShowSnackbar={this.handleShowSnackbar.bind(this)}
						onHideSnackbar={this.handleHideSnackbar.bind(this)}
						onExit={this.handlePhoneExit.bind(this)}
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
		this._mounted = true;
	}

	componentWillUnmount()
	{
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

	handleLogin(settings)
	{
		logger.debug('handleLogin() [settings:%o]', settings);

		settingsManager.set(settings);

		// Go to phone
		this.setState(
			{
				step         : 'phone',
				settings     : settingsManager.get(),
				showSnackbar : false
			});
	}

	handlePhoneExit()
	{
		logger.debug('handlePhoneExit()');

		// Go to login
		this.setState(
			{
				step         : 'login',
				showSnackbar : false
			});
	}
}
