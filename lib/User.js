'use strict';

export default class User
{
	constructor(data)
	{
		if (typeof data !== 'object')
			throw new TypeError('data must be an Object');

		this._data = data;
	}

	get id()
	{
		return this._data.id;
	}

	get name()
	{
		return this._data.name;
	}

	get uri()
	{
		return this._data.uri;
	}

	set uri(value)
	{
		this._data.uri = value;
	}

	get stream()
	{
		return this._data.stream;
	}

	get streamSrc()
	{
		return this._data.streamSrc;
	}

	set stream(stream)
	{
		this._data.stream = stream;
		this._data.streamSrc = URL.createObjectURL(stream);
	}

	toJson()
	{
		return {
			id   : this.id,
			uri  : this.uri,
			name : this.name
		};
	}

	stringify()
	{
		return JSON.stringify(this.toJson());
	}

	getDump()
	{
		return {
			id        : this.id,
			uri       : this.uri,
			name      : this.name,
			streamSrc : this.streamSrc
		};
	}
}
