<template>
  <v-container grid-list-lg fluid>
    <v-layout>
      <v-flex xs9>
        <h4 class="display-1">Import/Export</h4>
      </v-flex>
    </v-layout>

    <v-layout wrap>
      <v-flex xs12 md6>
        <v-card flat>
          <v-card-title>
            <h5 class="headline">Database</h5>
          </v-card-title>

          <v-card-actions>
            <v-container fluid class="pt-0">
              <v-layout wrap>
                <v-flex xs12 sm6 xl4>
                  <v-btn depressed block @click.stop="deleteConfirm=true">Empty database</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-actions>

        </v-card>
      </v-flex>

      <v-flex xs12 lg6>
        <v-card flat>
          <v-card-title>
            <h5 class="headline">Export</h5>
          </v-card-title>

          <v-card-actions>
            <v-container fluid class="pt-0">
              <v-layout wrap>
                <v-form class="flex xs12">
                  <v-layout wrap>
                    <v-flex xs12 sm4 >
                      <v-btn depressed block @click.stop="exportYML">Export YML</v-btn>
                    </v-flex>
                    <v-flex xs12 sm4 >
                      <v-btn depressed block @click.stop="exportJSON">Export JSON</v-btn>
                    </v-flex>
                    <v-flex xs12 sm4 >
                      <v-btn depressed block @click.stop="exportCSV">Export CSV</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-layout>
            </v-container>
          </v-card-actions>

        </v-card>
      </v-flex>

      <v-flex xs12 lg6>
        <v-card flat>
          <v-card-title>
            <h5 class="headline">Import</h5>
          </v-card-title>

          <v-card-actions>
            <v-container fluid class="pt-0">
              <v-layout wrap>
                <v-form class="flex xs12">
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-textarea flat v-model="importText" label="Import" hint="YML or JSON paste"></v-textarea>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-btn depressed block @click.stop="importYML">Import YML</v-btn>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-btn depressed block @click.stop="importJSON">Import JSON</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-layout>
            </v-container>
          </v-card-actions>

        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="deleteConfirm" width="500" :persistent="deleteInProgress">
      <v-card>
        <template v-if="!deleteInProgress">
          <v-card-title class="headline">Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete all items in the database?
            This will also delete record on the database server.
          </v-card-text>
          <v-card-actions>
            <v-btn color="" depressed @click.stop="deleteConfirm=false">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" depressed @click.stop="destroyDatabase">
              Delete
            </v-btn>
          </v-card-actions>
        </template>

        <template v-else>
          <v-card-text>
            Delete in progress
            <v-progress-linear indeterminate color="white"></v-progress-linear>
          </v-card-text>
        </template>
      </v-card>
    </v-dialog>

    <v-dialog :value="progressModalText.length>0" width="500" :persistent="true">
      <v-card>
        <v-card-text>
          {{progressModalText}}
          <v-progress-linear indeterminate color="white"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ConfigService } from '../services/Config.js'
import DatabaseService from '../services/Database.js'
import yaml from 'js-yaml'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'

export default {
  data: () => ({
    importText: '',
    config: {},
    deleteConfirm: false,
    deleteInProgress: false,
    progressModalText: '',
    DatabaseService: DatabaseService()
  }),
  computed: {
    exportFileName: function () {
      // Figure out file name
      let timestamp = (new Date()).getTime()
      let databaseConfig = ConfigService.getLocalConfig('database')
      let fileName = `StoreDown.${timestamp}`
      if (databaseConfig && databaseConfig.database) { fileName = `${databaseConfig.database}.${timestamp}` }

      return fileName
    }
  },
  mounted () {
    // Get config
    ConfigService.getConfigObject().then((config) => {
      this.config = config
    }).catch((error) => {
      if (error.status === 404) {} else {
        this.$toasted.show(`Received error: ${error.status}`)
      }
    })
  },
  methods: {
    /**
     * Main import logic
     * @param  {array} responses - bulkDoc error array
     */
    importItems: function (items) {
      this.progressModalText = 'Importing...'
      items.forEach(item => item.type = 'item')
      DatabaseService().getDatabase().bulkDocs(items).then((responses) => { // This function displays errors and provides user with error file.
        let importCount = 0
        let errors = []
        responses.forEach((response) => {
          if (response.ok) { return importCount++ }
          errors.push(response)
        })

        this.progressModalText = ''
        this.$toasted.info(`${importCount} items imported successfully.`)

        if (errors.length) {
          this.$toasted.error(`${errors.length} items had errors.`)
          saveAs(new Blob([yaml.safeDump(errors)], { type: 'text/plain;charset=utf-8' }), 'importErrors.yml')
        }
      }).catch((error) => {
        this.$toasted.error(`Error ${error}`)
      })
    },

    /**
     * Hande import yml button. Get this.importText parse it and past it to import logic.
     */
    importYML: function () {
      try {
        this.importItems(yaml.load(this.importText))
      } catch (error) {
        this.$toasted.error('Invalid YML')
      }
    },
    /**
     * Hande import json button. Get this.importText parse it and past it to import logic.
     */
    importJSON: function () {
      try {
        this.importItems(JSON.parse(this.importText))
      } catch (error) {
        this.$toasted.error('Invalid JSON')
      }
    },
    /**
     * generate yml and prompt to download
     */
    exportJSON: function () {
      this.progressModalText = 'Generating JSON extract...'
      // Get data
      DatabaseService().getAllItems().then((data) => {
        saveAs(new Blob([JSON.stringify(data.rows)], { type: 'text/plain;charset=utf-8' }), `${this.exportFileName}.json`)
        this.progressModalText = ''
      })
    },
    /**
     * generate yml and prompt to download
     */
    exportYML: function () {
      this.progressModalText = 'Generating YML extract...'
      // Get data
      DatabaseService().getAllItems().then((data) => {
        saveAs(new Blob([yaml.safeDump(data.rows)], { type: 'text/plain;charset=utf-8' }), `${this.exportFileName}.yml`)
        this.progressModalText = ''
      })
    },
    /**
     * Generate CSV and prompt to download
     */
    exportCSV: function () {
      this.progressModalText = 'Generating CSV extract...'

      let columns = []
      let objectColumns = []

      // Get columns
      this.config.dataDefinition.forEach((group) => {
        group.fields.forEach((item) => {
          columns.push(item.name)

          if (item.type === 'libraryStyleStatus') { objectColumns.push(item.name) }
        })
      })

      // Make sure required variables are included

      if (!columns.includes('_id')) { columns.push('_id') }

      if (!columns.includes('_rev')) { columns.push('_rev') }

      // Get data
      DatabaseService().getAllItems().then((data) => {
        data.rows.forEach((item) => { // Stringify escape object field types
          objectColumns.forEach((excapeField) => {
            item[excapeField] = JSON.stringify(item[excapeField])
          })
        })
        saveAs(new Blob([Papa.unparse(data.rows, {
          columns: columns
        })], { type: 'text/plain;charset=utf-8' }), `${this.exportFileName}.csv`)
        this.progressModalText = ''
      })
    },
    /**
     * Delete every database record on both remote and local
     */
    destroyDatabase: function () {
      this.deleteInProgress = true
      let deleteTimeout = null
      let deleteCount = 0 // Count how many record we delete
      let deleteTimeoutDuration = 5000 // How long we wait for more deletes

      // Handle all the async delete return
      let deleteHandler = (response) => {
        if (response && response.ok) { deleteCount++ }

        clearTimeout(deleteTimeout)

        deleteTimeout = setTimeout(() => {
          this.$toasted.info(`${deleteCount} items deleted`)
          // Reset
          deleteTimeout = null
          this.deleteConfirm = false
          this.deleteInProgress = false
        }, deleteTimeoutDuration)
      }

      DatabaseService().getAllItems().then((items) => {
        items.rows.forEach((item) => {
          DatabaseService().getDatabase().remove(item).then(deleteHandler).catch((error) => {
            this.$toasted.info(`Error ${error}`)
          })
        })
      })
    }
  }
}
</script>
