import { ConfigService } from '../services/Config.js'
import Database from '../../../storedown-common/Database.js'
import PouchDB from 'pouchdb-browser'
import Vue from 'vue'

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
