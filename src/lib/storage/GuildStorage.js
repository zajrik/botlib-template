'use babel';
'use strict';

/**
 * Handle loading, saving, and storing Guild data and settings
 * via persistent storage. Created automatically per-guild
 * by {@link GuildStorageLoader}
 * @class GuildStorage
 * @param {Bot} bot - Bot instance
 * @param {(external:Guild|string)} guild - Discord.js Guild object or guild ID string
 * @param {LocalStorage} dataStorage - LocalStorage instance containing all guild-specific data
 * @param {LocalStorage} settingsStorage - LocalStorage instance containing all guild-specific settings
 */
export default class GuildStorage
{
	constructor(bot, guild, dataStorage, settingsStorage)
	{
		/** @type {string} */
		this._id = guild.id || guild;

		/** @type {LocalStorage} */
		this._dataStorage = dataStorage;

		/** @type {LocalStorage} */
		this._settingsStorage = settingsStorage;

		/** @type {Object} */
		this._temp = {};

		// Create blank storage for the guild if no storage is present
		if (!this._dataStorage.getItem(this.id)) this._dataStorage.setItem(this.id, {});

		// Set default settings if no settings are present
		if (!this._settingsStorage.getItem(this.id))
		{
			this._settingsStorage.setItem(this.id, {});
			let defaults = bot.storage.getItem('defaultGuildSettings');
			Object.keys(defaults).forEach(key =>
			{
				this._settingsStorage.setItem(`${this.id}/${key}`, defaults[key]);
			});
		}
	}

	/**
	 * Discord.js Guild ID string
	 * @memberof GuildStorage
	 * @instance
	 * @type {string}
	 * @name id
	 */
	get id() { return this._id; }

	// Settings storage ////////////////////////////////////////////////////////

	/**
	 * The number of keys in this Guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {number}
	 */
	get settingsLength() { return Object.keys(this._settingsStorage.getItem(this.id)).length || 0; }

	/**
	 * The names of all keys in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {string[]}
	 */
	get settingsKeys() { return Object.keys(this._settingsStorage.getItem(this.id)); }

	/**
	 * Get the name of the key at the given index in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {number} index - The index of the key to find
	 * @returns {string}
	 */
	settingKey(index)
	{
		if (!index || index < 0) return null;
		let settings = this._settingsStorage.getItem(this.id);
		if (index >= settings.length) return null;
		return Object.keys(settings)[index];
	}

	/**
	 * Get the value of the given key in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to get
	 * @returns {*}
	 */
	getSetting(key)
	{
		if (typeof key !== 'string') return null;
		return this._settingsStorage.getItem(`${this.id}/${key}`);
	}

	/**
	 * Set the value of a setting in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to set
	 * @param {*} value - The value to set
	 */
	setSetting(key, value)
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this._settingsStorage.setItem(`${this.id}/${key}`, value);
	}

	/**
	 * Delete a setting in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to delete
	 */
	removeSetting(key)
	{
		if (typeof key !== 'string') return;
		this._settingsStorage.removeItem(`${this.id}/${key}`);
	}

	/**
	 * Check if a setting exists
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to check for
	 * @returns {boolean}
	 */
	settingExists(key)
	{
		if (typeof key !== 'string') return false;
		return this.getSetting(key) !== null;
	}

	/**
	 * Reset the settings for this guild to default, deleting any
	 * extra settings that are not part of the provided defaults
	 * @example
	 * <GuildStorage>.resetSettings(<Bot>.storage.getItem('defaultGuildSettings'));
	 * @memberof GuildStorage
	 * @instance
	 * @param {Object} defaults - Should always use {@link defaultGuildSettings}
	 */
	resetSettings(defaults)
	{
		this._settingsStorage.setItem(this.id, defaults);
	}

	// Non-settings storage ////////////////////////////////////////////////////

	/**
	 * The number of keys in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @type {number}
	 */
	get length()
	{
		return Object.keys(this._dataStorage.getItem(this.id)).length || 0;
	}

	/**
	 * The names of all keys in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @type {string[]}
	 */
	get keys()
	{
		return Object.keys(this._dataStorage.getItem(this.id));
	}

	/**
	 * Get the name of the key at the given index in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {number} index - The index of the key to find
	 * @returns {string}
	 */
	key(index)
	{
		if (!index || index < 0) return null;
		let data = this._dataStorage.getItem(this.id);
		if (index >= data.length) return null;
		return Object.keys(data)[index];
	}

	/**
	 * Get the value of the given key in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to get
	 * @returns {*}
	 */
	getItem(key)
	{
		if (typeof key !== 'string') return null;
		return this._dataStorage.getItem(`${this.id}/${key}`);
	}

	/**
	 * Set the value of a given key in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to set
	 * @param {*} value - The value to set
	 */
	setItem(key, value)
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this._dataStorage.setItem(`${this.id}/${key}`, value);
	}

	/**
	 * Delete an item in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to delete
	 */
	removeItem(key)
	{
		if (typeof key !== 'string') return;
		this._dataStorage.removeItem(`${this.id}/${key}`);
	}

	/**
	 * Check if key/value pair exists in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to check for
	 * @returns {boolean}
	 */
	exists(key)
	{
		if (typeof key !== 'string') return false;
		return !!this.getItem(key);
	}

	/**
	 * Delete all data from this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 */
	clear()
	{
		this._dataStorage.setItem(this.id, {});
	}

	/**
	 * Allow access to a storage/settings item only when it is not currently being
	 * accessed. Waits for other nonConcurrentAccess operations to finish
	 * before proceeding with callback
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - the storage key you will be accessing
	 * @param {function} callback - callback to execute that will be accessing the key
	 * @returns {Promise}
	 */
	nonConcurrentAccess(key, callback)
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				while(this._temp[`checking${key}`]) {} // eslint-disable-line
				this._temp[`checking${key}`] = true;
				callback(key); // eslint-disable-line
				delete this._temp[`checking${key}`];
				resolve();
			}
			catch (err)
			{
				delete this._temp[`checking${key}`];
				reject(err);
			}
		});
	}
}
