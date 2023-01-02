<template>
<v-container grid-list-lg fluid>
  <v-layout>
    <v-flex xs6>
      <h4 class="display-1">Item list</h4>
    </v-flex>
  </v-layout>
  <v-text-field placeholder="Search items" single-line color="white" class="filter py-0 ml-2" id="filter" @change="onchange($event)" />
  <!-- TODO QR code link generator -->
  <List :headers="headers" :loadData="loadData" :rowClick="rowClick" />
</v-container>
</template>

<script>
import {
  ConfigService
} from '../services/Config.js'
import DatabaseService from '../services/Database.js'
import List from '../components/List'
export default {
  components: {
    List
  },
  data: () => ({
    headers: []
  }),
  mounted () {
    this.loadHeader()// Don't need to reload with route change
  },
  methods: {
    onchange: function (event) {
      console.log(event)
      window.location.replace('/#/?filter=' + event)
    },
    /**
     * Loads headers into this.headers
     */
    loadHeader: function () {
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
     * Load data
     * @param  {Number} [skip=0]    - start seek. Number of items to skip
     * @param  {Number} [limit=100] - Number of items to pull
     * @return {Promise}            - When resolved, return database data
     */
    loadData: function (skip = 0, limit = 100) {
      return new Promise((resolve, reject) => {
        if (!DatabaseService()) {
          return reject(new Error('Database is not setup'))
        }

        // Get items
        DatabaseService().getAllItems({ skip, limit }).then((data) => {
          console.log(data)
          // Get query
          let newFilter = this.$route.query.filter
          // console.log(newFilter)
          // console.log(data.rows.filter(row => row.name.includes(newFilter)))
          // console.log(newFilter.split(':')[1].toLowerCase())
          if (newFilter) {
            let param = newFilter.split(':')[1].toLowerCase()
            if (newFilter.startsWith('name:')) {
              data.rows = data.rows.filter(row => row.name.toLowerCase().includes(param))
            }
            if (newFilter.startsWith('location:')) {
              data.rows = data.rows.filter(row => row.location.toLowerCase().includes(newFilter.split(':')[1].toLowerCase()))
            }
            if (newFilter.startsWith('tags:')) {
              // data.rows = data.rows.filter(row => row.tags.includes(newFilter.split(':')[1].toLowerCase()))
            }
          }
          return resolve(data) // important we save an original copy. So we dont need to load it again. Espicially in tree view.
        })
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
