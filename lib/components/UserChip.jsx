'use strict';

import React from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import classnames from 'classnames';

export default class UserChip extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		let name = this.props.name;
		let uri = this.props.uri;
		let status = this.props.status;
		let fullWidth = this.props.fullWidth;

		return (
			<Chip data-component='UserChip' className={classnames({ 'full-width': fullWidth })}>
				{status ?
					<Avatar
						className={classnames('status', status)}
					/>
				:
					null
				}
				{name} <span className='uri'>&lt;{uri}&gt;</span>
			</Chip>
		);
	}
}

UserChip.propTypes =
{
	name      : React.PropTypes.string.isRequired,
	uri       : React.PropTypes.string.isRequired,
	status    : React.PropTypes.string,
	fullWidth : React.PropTypes.bool
};
