'use strict';

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import Logger from '../Logger';
import TransitionAppear from './TransitionAppear';

const logger = new Logger('Incoming');

export default class Incoming extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		let session = this.props.session;
		let name = session.remote_identity.display_name;
		let uri = session.remote_identity.uri.toString();

		return (
			<TransitionAppear duration={1000}>
				<div data-component='Incoming'>
					<div className='info'>
						<Chip className='chip'>
							{name} <span className='uri'>&lt;{uri}&gt;</span>
						</Chip>
					</div>

					<div className='buttons'>
						<RaisedButton
							label='Answer'
							primary
							onClick={this.handleClickAnswer.bind(this)}
						/>
						<RaisedButton
							label='Reject'
							secondary
							onClick={this.handleClickReject.bind(this)}
						/>
					</div>
				</div>
			</TransitionAppear>
		);
	}

	handleClickAnswer()
	{
		logger.debug('handleClickAnswer()');

		this.props.onAnswer();
	}

	handleClickReject()
	{
		logger.debug('handleClickReject()');

		this.props.onReject();
	}
}

Incoming.propTypes =
{
	session  : React.PropTypes.object.isRequired,
	onAnswer : React.PropTypes.func.isRequired,
	onReject : React.PropTypes.func.isRequired
};
