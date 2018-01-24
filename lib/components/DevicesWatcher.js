'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Logger from '../Logger';

const logger = new Logger('DevicesWatcher');

export default class Dialer extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  reloadDevices() {
    navigator.mediaDevices.enumerateDevices({audio:true,video:true})
      .then(devices => {
        const devicesOld = localStorage.getItem('devices')
          ? JSON.parse(localStorage.getItem('devices'))
          : devices

        devicesOld.map((item) => {
          if (!devices.find(x => x.deviceId === item.deviceId)) {
            this.deviceRemoved(item, devices)
          }
        })

        devices.map((item) => {
          if (!devicesOld.find(x => x.deviceId === item.deviceId)) {
            this.deviceAdded(item, devices)
          }
        })

        localStorage.setItem('devices', JSON.stringify(devices));
      })
  }

  deviceAdded(device) {
    const settings = this.props.settings

    logger.debug('deviceAdded() [device:%o]', device);

    this.props.onNotify({
      level   : 'success',
      title   : 'Device added',
      message : device.label
    })

    if (device.kind === 'audioinput') {
      localStorage.setItem('audioInputOld', settings.media.audioInput)
      settings.media.audioInput = device.deviceId
    } else if (device.kind === 'audiooutput') {
      localStorage.setItem('audioOutputOld', settings.media.audioOutput)
      settings.media.audioOutput = device.deviceId
    } else if (device.kind === 'videoinput') {
      localStorage.setItem('videoInputOld', settings.media.videoInput)
      settings.media.videoInput = device.deviceId
    }

    this.props.onSettingsUpdate(settings)
  }

  deviceRemoved(device, devices) {
    const settings = this.props.settings

    logger.debug('deviceRemoved() [device:%o]', device);

    this.props.onNotify({
      level   : 'error',
      title   : 'Device removed',
      message : device.label
    })

    let updateNeeded = false

    if (device.deviceId === settings.media.audioInput) {
      const audioInputOld = localStorage.audioInputOld
      if (audioInputOld && devices.find(x => x.deviceId === audioInputOld)) {
        settings.media.audioInput = audioInputOld
        localStorage.removeItem('audioInputOld')
      } else {
        settings.media.audioInput = null
      }

      updateNeeded = true
    }

    if (device.deviceId === settings.media.audioOutput) {
      const audioOutputOld = localStorage.audioOutputOld
      if (audioOutputOld && devices.find(x => x.deviceId === audioOutputOld)) {
        settings.media.audioOutput = audioOutputOld
        localStorage.removeItem('audioOutputOld')
      } else {
        settings.media.audioOutput = null
      }

      updateNeeded = true
    }

    if (device.deviceId === settings.media.videoInput) {
      const videoInputOld = localStorage.videoInputOld
      if (videoInputOld && devices.find(x => x.deviceId === videoInputOld)) {
        settings.media.videoInput = videoInputOld
        localStorage.removeItem('videoInputOld')
      } else {
        settings.media.videoInput = null
      }

      updateNeeded = true
    }

    if (updateNeeded) {
      this.props.onSettingsUpdate(settings)
    }
  }

  componentWillMount() {
    this.reloadDevices()
    navigator.mediaDevices.ondevicechange = () => this.reloadDevices()
  }

  render()
  {
    return null;
  }
}

Dialer.propTypes =
  {
    settings: PropTypes.object.isRequired,
    onNotify: PropTypes.func.isRequired,
    onSettingsUpdate: PropTypes.func.isRequired
  };
