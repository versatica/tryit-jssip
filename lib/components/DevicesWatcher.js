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
    navigator.mediaDevices.enumerateDevices({audio:true, video:true})
      .then(devices => {
        const devicesOld = localStorage.getItem('devices')
          ? JSON.parse(localStorage.getItem('devices'))
          : devices;

        devicesOld.map((item) => {
          if (!devices.find(x => x.deviceId === item.deviceId)) {
            this.deviceRemoved(item, devices);
          }
        });

        devices.map((item) => {
          if (!devicesOld.find(x => x.deviceId === item.deviceId)) {
            this.deviceAdded(item, devices);
          }
        });

        localStorage.setItem('devices', JSON.stringify(devices));
      });
  }

  deviceAdded(device) {
    const {
      mediaDevices: {
        audioInput,
        audioOutput,
        videoInput
      },
      onMediaSettingsChange,
      onNotify
    } = this.props;

    logger.debug('deviceAdded() [device:%o]', device);

    onNotify({
      level   : 'success',
      title   : 'Device added',
      message : device.label
    });

    if (device.kind === 'audioinput') {
      localStorage.setItem('audioInputOld', audioInput);
      onMediaSettingsChange('audioInput', device.deviceId);
    } else if (device.kind === 'audiooutput') {
      localStorage.setItem('audioOutputOld', audioOutput);
      onMediaSettingsChange('audioOutput', device.deviceId);
    } else if (device.kind === 'videoinput') {
      localStorage.setItem('videoInputOld', videoInput);
      onMediaSettingsChange('videoInput', device.deviceId);
    }
  }

  deviceRemoved(device, devices) {
    const {
      mediaDevices: {
        audioInput,
        audioOutput,
        videoInput
      },
      onMediaSettingsChange,
      onNotify
    } = this.props;

    logger.debug('deviceRemoved() [device:%o]', device);

    onNotify({
      level   : 'error',
      title   : 'Device removed',
      message : device.label
    });

    // if (device.deviceId === audioInput) {
    //   if (audioInput && devices.find(x => x.deviceId === audioInput)) {
    //     onMediaSettingsChange('audioInput', audioInput)
    //   } else {
    //     onMediaSettingsChange('audioInput', 'default')
    //   }
    // }
    //
    // if (device.deviceId === audioOutput) {
    //   if (audioOutput && devices.find(x => x.deviceId === audioOutput)) {
    //     onMediaSettingsChange('audioOutput', audioOutput)
    //   } else {
    //     onMediaSettingsChange('audioOutput', 'default')
    //   }
    // }
    //
    // if (device.deviceId === videoInput) {
    //   const videoInput = localStorage.getItem('videoInput')
    //   if (videoInput && devices.find(x => x.deviceId === videoInput)) {
    //     onMediaSettingsChange('videoInput', videoInput)
    //   } else {
    //     onMediaSettingsChange('videoInput', null)
    //   }
    // }

    if (device.deviceId === audioInput) {
      const audioInputOld = localStorage.getItem('audioInputOld');
      if (audioInputOld && devices.find(x => x.deviceId === audioInputOld)) {
        onMediaSettingsChange('audioInput', audioInputOld);
        localStorage.removeItem('audioInputOld');
      } else {
        onMediaSettingsChange('audioInput', 'default');
      }
    }

    if (device.deviceId === audioOutput) {
      const audioOutputOld = localStorage.getItem('audioOutputOld');
      if (audioOutputOld && devices.find(x => x.deviceId === audioOutputOld)) {
        onMediaSettingsChange('audioOutput', audioOutputOld);
        localStorage.removeItem('audioOutputOld');
      } else {
        onMediaSettingsChange('audioOutput', 'default');
      }
    }

    if (device.deviceId === videoInput) {
      const videoInputOld = localStorage.getItem('videoInputOld');
      if (videoInputOld && devices.find(x => x.deviceId === videoInputOld)) {
        onMediaSettingsChange('videoInput', videoInputOld);
        localStorage.removeItem('videoInputOld');
      } else {
        onMediaSettingsChange('videoInput', null);
      }
    }
  }

  componentWillMount() {
    this.reloadDevices();
    navigator.mediaDevices.ondevicechange = () => this.reloadDevices();
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
    onMediaSettingsChange: PropTypes.func.isRequired,
    mediaDevices: PropTypes.object.isRequired
  };
