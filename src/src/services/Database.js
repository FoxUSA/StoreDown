import { ConfigService } from '../services/Config.js'
import PouchDB from 'pouchdb-browser'
import Vue from 'vue'

let Database = class {
  /**
   * Minimal PouchDB harness. For use in browser and cli
   * @param {[type]} databaseConfig       - config object. Containers url, syncOptions, and syncCallback
   * @param {[type]} PouchDB              [description]
   * @param {String} [dbPath='StoreDown'] [description]
   */
  constructor (databaseConfig, PouchDB, dbPath = 'StoreDown') { // Dependency injector pattern
    // Create or find database
    this.localDatabase = new PouchDB(dbPath)

    // Re-init sync
    if (databaseConfig && databaseConfig.url) {
      this.remoteDatabase = new PouchDB(databaseConfig.url)
      databaseConfig.syncCallback(this.localDatabase.sync(this.remoteDatabase, databaseConfig.syncOptions))
    }
  }

  /**
   * Get database object for crud operations. Doesn't really make sense to abstract out interface.
   * @return {PouchDB} - PouchDB local database object
   */
  getDatabase () {
    return this.localDatabase
  }

  /**
   * [getAllItems description]
   * @return {promise} - when it resolves return array of item.doc's
   */
  getAllItems (options = {}) {
    return new Promise((resolve, reject) => {
      let returnItems = []
      this.localDatabase.allDocs(Object.assign(options, { // Merge options
        include_docs: true
      })).then((data) => {
        data.rows = data.rows.filter(row => row.doc.type === 'item').forEach(item => returnItems.push(item.doc))
        data.rows = returnItems
        return resolve(data)
      }).catch(reject)
    })
  }
}

let database = null
let replicationTimeout = null
const REPLICATION_TIMEOUT_DURATION = 5000
// Factory pattern
export default function (forceCreate, replicationCompleteCallback) {
  if (forceCreate || !database) {
    // Customized object for browser use
    let remoteDatabaseConfig = {
      syncOptions: {
        live: true,
        retry: true
      },
      syncCallback: function (syncObject) {
        syncObject.on('error', function () {
          Vue.toasted.error('Replication error')
        }).on('paused', function () {
          clearTimeout(replicationTimeout)
          replicationTimeout = setTimeout(function () {
            Vue.toasted.info('Replication complete')
            replicationTimeout = null
            if (replicationCompleteCallback) { replicationCompleteCallback() }// Let folks know
          }, REPLICATION_TIMEOUT_DURATION)
        })
      }
    }

    let userConfig = ConfigService.getLocalConfig('user')
    let databaseConfig = ConfigService.getLocalConfig('database')

    // Only give url if one is defined
    if (userConfig && databaseConfig) {
      remoteDatabaseConfig.url = `${databaseConfig.protocol}://${userConfig.username}:${userConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`
    }

    database = new Database(remoteDatabaseConfig, PouchDB)
  }
  return database
}
