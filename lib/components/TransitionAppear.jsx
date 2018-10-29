import React from 'react';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const DEFAULT_DURATION = 1000;

class FakeTransitionWrapper extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		const children = React.Children.toArray(this.props.children);

		return children[0] || null;
	}
}

FakeTransitionWrapper.propTypes =
{
	children : PropTypes.any
};

export default class TransitionAppear extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		const props = this.props;
		const duration = props.hasOwnProperty('duration') ? props.duration : DEFAULT_DURATION;

		return (
			<ReactCSSTransitionGroup
				component={FakeTransitionWrapper}
				transitionName='transition'
				transitionAppear={Boolean(duration)}
				transitionAppearTimeout={duration}
				transitionEnter={false}
				transitionLeave={false}
			>
				{this.props.children}
			</ReactCSSTransitionGroup>
		);
	}
}

TransitionAppear.propTypes =
{
	children : PropTypes.any,
	duration : PropTypes.number
};
