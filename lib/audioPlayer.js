'use strict';

import Logger from './Logger';

const FILES = require('./sounds.json');

const logger = new Logger('audioPlayer');

const SOUNDS = new Map(
	[
		[ 'ringback', { audio: new Audio(FILES['ringback']), volume: 1.0 } ],
		[ 'ringing',  { audio: new Audio(FILES['ringing']),  volume: 1.0 } ],
		[ 'answered', { audio: new Audio(FILES['answered']), volume: 1.0 } ],
		[ 'rejected', { audio: new Audio(FILES['rejected']), volume: 0.5 } ]
	]);

let initialized = false;

module.exports =
{
	/**
	 * Play all the sounds so they will play in mobile browsers at any time
	 */
	initialize()
	{
		if (initialized)
			return;

		logger.debug('initialize()');

		for (let sound of SOUNDS.values())
		{
			sound.audio.volume = 0;

			try { sound.audio.play(); } catch (error) {}
		}

		initialized = true;
	},

	/**
	 * Play a sound
	 * @param {String} name - Sound name
	 * @param {[Float]} relativeVolume - Relative volume (0.0 - 1.0)
	 */
	play(name, relativeVolume)
	{
		this.initialize();

		if (typeof relativeVolume !== 'number')
			relativeVolume = 1.0;

		logger.debug('play() [name:%s, relativeVolume:%s]', name, relativeVolume);

		let sound = SOUNDS.get(name);

		if (!sound)
			throw new Error(`unknown sound name "${name}"`);

		try
		{
			sound.audio.pause();
			sound.audio.currentTime = 0.0;
			sound.audio.volume = (sound.volume || 1.0) * relativeVolume;
			sound.audio.play();
		}
		catch (error)
		{
			logger.warn('play() | error: %o', error);
		}
	},

	stop(name)
	{
		logger.debug('stop() [name:%s]', name);

		let sound = SOUNDS.get(name);

		if (!sound)
			throw new Error(`unknown sound name "${name}"`);

		sound.audio.pause();
		sound.audio.currentTime = 0.0;
	}
};
