'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import classnames from 'classnames';
import Logger from '../Logger';
import utils from '../utils';

const logger = new Logger('DevicesWatcher');

export default class Dialer extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  reloadDevices() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const devicesOld = localStorage.getItem('devices')
        ? JSON.parse(localStorage.getItem('devices'))
        : devices

      devicesOld.map((item) => {
        if (!devices.find(x => x.deviceId === item.deviceId)) {
          this.deviceRemoved(item)
        }
      })

      devices.map((item) => {
        if (!devicesOld.find(x => x.deviceId === item.deviceId)) {
          this.deviceAdded(item)
        }
      })

      localStorage.setItem('devices', JSON.stringify(devices))
    })
  }

  deviceAdded(device) {
    logger.debug('Device added', device)

    this.props.onNotify({
      level: 'success',
      title: 'Device connected',
      message: device.label
    })
  }

  deviceRemoved(device) {
    logger.debug('Device removed', device)

    this.props.onNotify({
      level   : 'error',
      title   : 'Device disconnected',
      message : device.label
    })
  }

  componentWillMount() {
    this.reloadDevices()
    navigator.mediaDevices.ondevicechange = () => this.reloadDevices()
  }

  render()
  {
    // let state = this.state;
    // let props = this.props;

    return null;
  }
}

Dialer.propTypes =
  {
    onNotify: PropTypes.func.isRequired
  };
