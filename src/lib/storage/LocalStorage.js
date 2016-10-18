'use babel';
'use strict';

import Database from 'node-json-db';

/**
 * Creates a persistent storage file and handles interacting with the persistent
 * storage
 * @class LocalStorage
 * @param {string} fileName - The name of the persistent storage file. Will be json format
 */
export default class LocalStorage
{
	constructor(fileName)
	{
		if (!fileName) throw new Error('You must provide a file name for the LocalStorage');

		/**
		 * The data loaded from persistent storage kept in memory
		 * @memberof LocalStorage
		 * @type {Object}
		 * @name data
		 * @instance
		 */
		this.data = null;

		/**
		 * Create or load the node-json-db database json file
		 * @memberof LocalStorage
		 * @type {Object}
		 * @name db
		 * @instance
		 */
		this.db = new Database(fileName, true, true);

		/**
		 * Temporary key/value storage, cleared on creation
		 * @memberof LocalStorage
		 * @type {Object}
		 * @name temp
		 * @instance
		 */
		this.temp = {};
	}

	/**
	 * The number of keys in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @type {number}
	 */
	get length()
	{
		try
		{
			let data = this.db.getData('/');
			return Object.keys(data).length || 0;
		}
		catch (err)
		{
			return 0;
		}
	}

	/**
	 * The names of all keys in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @type {string[]}
	 */
	get keys()
	{
		try
		{
			let data = this.db.getData('/');
			return Object.keys(data);
		}
		catch (err)
		{
			return null;
		}
	}

	/**
	 * Get the name of the key at the given index in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {number} index - The index of the key to find
	 * @returns {string}
	 */
	key(index)
	{
		if (!index || index < 0) return null;
		try
		{
			let data = this.db.getData('/');
			if (index >= data.length) return null;
			return Object.keys(data)[index];
		}
		catch (err)
		{
			return null;
		}
	}

	/**
	 * Get the value of the given key in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to get
	 * @returns {*}
	 */
	getItem(key)
	{
		if (typeof key !== 'string') return null;
		try
		{
			let data = this.db.getData(`/${key}`);
			return data;
		}
		catch (err)
		{
			return null;
		}
	}

	/**
	 * Set the value of a given key in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to set
	 * @param {*} value - The value to set
	 */
	setItem(key, value)
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this.db.push(`/${key}`, value, true);
	}

	/**
	 * Delete an item in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to delete
	 */
	removeItem(key)
	{
		if (typeof key !== 'string') return;
		this.db.delete(`/${key}`);
	}

	/**
	 * Check if key/value pair exists in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to check for
	 * @returns {boolean}
	 */
	exists(key)
	{
		if (typeof key !== 'string') return false;
		return this.getItem(key) !== null;
	}

	/**
	 * Delete all items from this storage
	 * @memberof LocalStorage
	 * @instance
	 */
	clear()
	{
		this.db.push('/', {}, true);
	}

	/**
	 * Allow access to a storage item only when it is not currently being
	 * accessed. Waits for other nonConcurrentAccess operations to finish
	 * before proceeding with callback
	 * @memberof LocalStorage
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
				while(this.temp[`checking${key}`]) {} // eslint-disable-line
				this.temp[`checking${key}`] = true;
				callback(key); // eslint-disable-line
				delete this.temp[`checking${key}`];
				resolve();
			}
			catch (err)
			{
				delete this.temp[`checking${key}`];
				reject(err);
			}
		});
	}
}