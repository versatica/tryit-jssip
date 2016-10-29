'use strict';

import React from 'react';

export default class Logo extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {};
	}

	render()
	{
		let size = this.props.size || 'big';

		return (
			<div data-component='Logo' className={size}>
				<h1><span className='colorized'>FIRST</span>SIGHT</h1>
			</div>
		);
	}
}

Logo.propTypes =
{
	size : React.PropTypes.string
};
