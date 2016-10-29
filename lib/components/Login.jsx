'use strict';

import React from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import classnames from 'classnames';
import randomString from 'random-string';
import Logger from '../Logger';
import storage from '../storage';
import User from '../User';
import TransitionAppear from './TransitionAppear';
import Logo from './Logo';

const logger = new Logger('Login');

export default class Login extends React.Component
{
	constructor(props)
	{
		super(props);

		let user = storage.getUser();

		this.state =
		{
			id        : user ? user.id : null,
			name      : user ? user.name : '',
			stream    : null,
			streamSrc : null,
			errors    :
			{
				name : null
			}
		};
	}

	render()
	{
		let state = this.state;

		return (
			<TransitionAppear>
				<div data-component='Login'>
					<div className='logo-container'>
						<Logo
							size='big'
						/>
					</div>

					<div className='main-container'>
						<div className='form-container'>
							<TextField
								floatingLabelText='Your Name'
								value={state.name}
								errorText={state.errors.name}
								fullWidth
								onChange={this.handleChangeName.bind(this)}
							/>
							<FlatButton
								label='Reset'
								secondary
								style={{
									display : 'table',
									margin  : '20px auto 0 auto'
								}}
								onClick={this.handleClickReset.bind(this)}
							/>
						</div>
					</div>

					<div className='play-container'>
						<div
							className={classnames('play-button', { disabled: !this._checkCanPlay() })}
							onClick={this.handleClickPlay.bind(this)}
						/>
					</div>
				</div>
			</TransitionAppear>
		);
	}

	handleChangeName(event)
	{
		let name = event.target.value;
		let errors = this.state.errors;

		errors.name = null;
		this.setState({ id: null, name, errors });
	}

	handleClickReset()
	{
		this.setState(
			{
				id       : null,
				name     : '',
				errors   : {}
			});

		storage.clear();
	}

	handleClickPlay()
	{
		logger.debug('handleClickPlay()');

		let state = this.state;
		let errors = state.errors;
		let ok = true;

		// Check name
		{
			if (state.name.length < 3)
			{
				ok = false;
				errors.name = 'Name too short';
			}
		}

		if (!ok)
		{
			this.setState({ errors });
			return;
		}

		// Create our user
		let user = new User(
			{
				id   : state.id || this._createUserId(state.name),
				name : state.name
			});

		// Store our user
		storage.setUser(user);

		// Fire event
		this.props.onLogin(user);
	}

	_checkCanPlay()
	{
		let state = this.state;

		return state.name;
	}

	_createUserId(name)
	{
		logger.debug('_createUserId() [name:"%s"]', name);

		return `${name.toLowerCase().replace(/[\t\s\\]/g, '')}_${randomString({ length: 6 })}`;
	}
}

Login.propTypes =
{
	onLogin : React.PropTypes.func.isRequired
};
