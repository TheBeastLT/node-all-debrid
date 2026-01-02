'use strict'

const fs = require('fs')
const axios = require('axios')

class AllDebridClient {

	constructor (token, defaultOptions = {}) {
		this.token = token
		this.ip = defaultOptions.ip
		this.base_agent = defaultOptions.base_agent || 'node-all-debrid'
		this.base_url = defaultOptions.base_url || 'https://api.alldebrid.com'
		this.defaultOptions = defaultOptions
		delete this.defaultOptions.ip
		delete this.defaultOptions.base_agent
		delete this.defaultOptions.base_url
		this._initMethods()
	}

	_readFile (path) {
		return fs.createReadStream(path)
	}

	_request (endpoint, o = {}) {
		const url = this.base_url + endpoint

		const options = { ...this.defaultOptions, ...o }
		options.url = url
		options.json = true
		options.params = o.params || {}
		options.params.ip = this.ip
		options.params.agent = this.base_agent
		options.headers = options.headers || {}
		options.headers['Authorization'] = 'Bearer ' + this.token

		return axios.request(options)
			.then(response => {
				if (response.data?.status === 'error') {
					return Promise.reject(response.data.error)
				}
				return response.data
			})
	}

	_get (endpoint, options = {}) {
		options.method = 'get'
		return this._request(endpoint, options)
	}

	_post (endpoint, options = {}) {
		options.method = 'post'
		return this._request(endpoint, options)
	}

	_initMethods () {
		this.pin = {
			get: () => {
				return this._get('/v4.1/pin/get')
			},
			check: (check, pin) => {
				return this._get('/v4/pin/check', {
					params: {
						check,
						pin
					}
				})
			},
		}

		this.hosts = {
			supported: (hostsOnly = null) => {
				return this._get('/v4/hosts', {
					params: {
						hostsOnly
					}
				})
			},
			domains: () => {
				return this._get('/v4/hosts/domains')
			},
			regexp: () => {
				return this._get('/v4/hosts/regexp')
			},
			priority: () => {
				return this._get('/v4/hosts/priority')
			},
		}

		this.user = {
			info: () => {
				return this._get('/v4/user')
			},
			hosts: (hostsOnly = null) => {
				return this._get('/v4.1/user/hosts', {
					params: {
						hostsOnly
					}
				})
			},
			links: () => {
				return this._get('/v4/user/links')
			},
			saveLink: (link) => {
				return this._get('/v4/user/links/save', {
					params: {
						link
					}
				})
			},
			deleteLink: (link) => {
				return this._get('/v4/user/links/delete', {
					params: {
						link
					}
				})
			},
			recentLinks: () => {
				return this._get('/v4/user/history')
			},
			purgeRecentLinks: () => {
				return this._get('/v4/user/history/delete')
			}
		}

		this.link = {
			infos: (link, password = null) => {
				return this._get('/v4/link/infos', {
					params: {
						link,
						password
					}
				})
			},
			redirector: (link) => {
				return this._get('/v4/link/redirector', {
					params: {
						link
					}
				})
			},
			unlock: (link, password = null) => {
				return this._get('/v4/link/unlock', {
					params: {
						link,
						password
					}
				})
			},
			streaming: (id, stream) => {
				return this._get('/v4/link/streaming', {
					params: {
						id,
						stream
					}
				})
			},
			delayed: (id) => {
				return this._get('/v4/link/delayed', {
					params: {
						id
					}
				})
			}
		}

		this.magnet = {
			upload: (magnets) => {
				return this._post('/v4/magnet/upload', {
					data: {
						magnets
					},
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				})
			},
			uploadFile: (file) => {
				const stream = (file.Readable) ? file : this._readFile(file)
				return this._post('/v4/magnet/upload/file', {
					data: {
						files: [stream],
					},
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				})
			},
			status: (id) => {
				return this._get('/v4.1/magnet/status', {
					params: {
						id
					}
				})
			},
			delete: (id) => {
				return this._get('/v4/magnet/delete', {
					params: {
						id
					}
				})
			},
			restart: (id) => {
				return this._get('/v4/magnet/restart', {
					params: {
						id
					}
				})
			},
		}

	}

}

module.exports = AllDebridClient
