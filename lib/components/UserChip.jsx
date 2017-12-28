'use strict';

import React from 'react';
import PropTypes from 'prop-types';
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
	name      : PropTypes.string.isRequired,
	uri       : PropTypes.string.isRequired,
	status    : PropTypes.string,
	fullWidth : PropTypes.bool
};
