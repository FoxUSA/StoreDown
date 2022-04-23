<template>
<v-container grid-list-lg fluid>
  <v-layout>
    <v-flex xs6>
      <h4 class="display-1">Change feed</h4>
    </v-flex>
  </v-layout>
  <v-layout>
    <v-flex xs12>
      <v-data-table :headers="headers" hide-actions :items="items" :loading="true">
        <template v-slot:items="props">
          <ListColumnTypes :props="props" :headers="headers" :rowClick="rowClick"/>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info">
            No changes detected yet
          </v-alert>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import {
  ConfigService
} from '../services/Config.js'
import DatabaseService from '../services/Database.js'
import ListColumnTypes from '../components/ListColumnTypes'

export default {
  components: {
    ListColumnTypes
  },
  data: () => ({
    DatabaseService: DatabaseService(),
    items: [],
    headers: []
  }),
  mounted () {
    this.loadHeaders() // Don't need to reload with route change
    this.loadData()
  },
  methods: {
    /**
     * Load and set data.headers
     * @return {[type]} [description]
     */
    loadHeaders: function () {
      if (!DatabaseService()) {
        return
      }

      // Get config and headers
      ConfigService.getConfigObject().then((config) => {
        config.dataDefinition.forEach((group) => {
          group.fields.forEach((item) => {
            if (item.hideInList) { return }

            this.headers.push({
              text: item.displayName,
              value: item.name,
              align: 'left',
              item: item, // So you can access all the parameters. Above are given in the data table support format.
              sortable: false
            })
          })
        })
      }).catch((error) => {
        if (error.status === 404) {} else {
          this.$toasted.info(`Error ${error}`)
        }
      })
    },
    /**
     * Setup load data
     */
    loadData: function () {
      DatabaseService().getDatabase().changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        this.items.push(change.doc)
      }).on('error', (error) => {
        this.$toasted.error(`Error: ${error}`)
      })
    },
    /**
     * Hande logic for when a row is clicked
     * @param  {[type]} props  [description]
     */
    rowClick: function (props) {
      return this.$router.push(`/entry/${props.item._id}`)
    }
  }
}
</script>
