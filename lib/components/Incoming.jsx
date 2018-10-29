import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import AnswerIcon from 'material-ui/svg-icons/communication/phone';
import RejectIcon from 'material-ui/svg-icons/communication/call-end';
import Logger from '../Logger';
import TransitionAppear from './TransitionAppear';
import UserChip from './UserChip';

const logger = new Logger('Incoming');

export default class Incoming extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		const session = this.props.session;
		const name = session.remote_identity.display_name;
		const uri = session.remote_identity.uri.toString();

		return (
			<TransitionAppear duration={1000}>
				<div data-component='Incoming'>
					<UserChip
						name={name}
						uri={uri}
					/>

					<div className='buttons'>
						<RaisedButton
							label='Answer'
							primary
							icon={<AnswerIcon color={'#fff'}/>}
							onClick={this.handleClickAnswer.bind(this)}
						/>
						<RaisedButton
							label='Reject'
							secondary
							icon={<RejectIcon color={'#fff'}/>}
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
	session  : PropTypes.object.isRequired,
	onAnswer : PropTypes.func.isRequired,
	onReject : PropTypes.func.isRequired
};
