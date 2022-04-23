import yaml from 'js-yaml'
import DatabaseService from '../services/Database.js'

const CONFIG_KEY = 'config'

export class ConfigService {
  /**
   * [getConfigObject description]
   * @return {promise} [description]
   */
  static getConfigObject () {
    return new Promise((resolve, reject) => {
      ConfigService.getConfig().then((config) => {
        return resolve(yaml.safeLoad(config.yml))
      }).catch(reject)
    })
  }

  /**
   *
   * @return {promise} -
   */
  static getConfig () {
    return DatabaseService().getDatabase().get(CONFIG_KEY)
  }

  /**
   * [setConfig description]
   * @param {promise} config -
   */
  static setConfig (config) {
    config.type = 'config' // Future proofing/give the ability to filter out app records
    config._id = CONFIG_KEY
    return DatabaseService().getDatabase().put(config)
  }

  /**
   * Wrapper for session storage and local storage
   * @param {boolean} remember - if true use local storage, if not use session storage
   * @param {string} key - Key to store
   * @param {object} value - Value to store
   */
  static setLocalConfig (remember, key, value) {
    if (remember) {
      localStorage.setItem(key, JSON.stringify(value))
      sessionStorage.removeItem(key) // Clean up if they switch types
    } else {
      sessionStorage.setItem(key, JSON.stringify(value))
      localStorage.removeItem(key) // Clean up if they switch types
    }
  }

  /**
   * Wrapper for session storage and local storage
   * @param  {string} key - key value was stored under
   * @return {object} - object retrieved.
   */
  static getLocalConfig (key) {
    let value = localStorage.getItem(key) || sessionStorage.getItem(key)
    if (value) { return JSON.parse(value) }
  }
}
