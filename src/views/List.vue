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
    /**
     * Detect filter change for implementing the below filter to query specific items.
     */
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
          // Get query
          // get the query from the GET variable via route.
          let newFilter = this.$route.query.filter
          if (newFilter === 'undefined') { newFilter = '' }
          // Using the new query, separate out the call from the value.  I.E path:house or tags:tool
          // I also changed everything to lowercase so that capitalization is ignored in the filter.
          // Lastly, the filter breaks if some objects or items do not have that category, so we must use a !! to make sure the property exists.
          // Lastly, update the total_rows value to ensure the vue item count is correct.  This should probably be done with a CASE statement, but I am lazy.
          // Might also want to make the command a .toLower as well, so that Name:Jig is the same as name:Jig
          if (newFilter) {
            // let param = newFilter.toLowerCase()
            let re = RegExp()
            if (newFilter.includes(':')) {
              // param = newFilter.split(':')[1].toLowerCase()
              re = new RegExp(newFilter.split(':')[1].toLowerCase())
            } else {
              re = new RegExp(newFilter.toLowerCase())
            }
            if (newFilter.startsWith('name:')) {
              data.rows = data.rows.filter(row => !!row.name && re.test(row.name))
              // data.rows = data.rows.filter(row => row.name.toLowerCase().match(param))
            } else if (newFilter.startsWith('manufacturer:')) {
              // data.rows = data.rows.filter(row => !!row.manufacturer && row.manufacturer.toLowerCase().match(param))
              data.rows = data.rows.filter(row => !!row.manufacturer && re.test(row.manufacturer.toLowerCase()))
            } else if (newFilter.startsWith('acquiredfrom:')) {
              data.rows = data.rows.filter(row => !!row.acquiredFrom && re.test(row.acquiredFrom.toLowerCase()))
            } else if (newFilter.startsWith('warranty:')) {
              data.rows = data.rows.filter(row => !!row.warranty && re.test(row.warranty.toLowerCase()))
            } else if (newFilter.startsWith('location:')) {
              data.rows = data.rows.filter(row => !!row.location && re.test(row.location.toLowerCase()))
            } else if (newFilter.startsWith('pricepaid:')) {
              data.rows = data.rows.filter(row => !!row.pricePaid && re.test(row.pricePaid.toLowerCase()))
            } else if (newFilter.startsWith('tags:')) {
              data.rows = data.rows.filter(row => !!row.tags && re.test(row.tags.toString().toLowerCase()))
            } else if (newFilter.startsWith('weight:')) {
              data.rows = data.rows.filter(row => !!row.weight && re.test(row.weight.toLowerCase()))
            } else {
              data.rows = data.rows.filter(row => re.test(row.name.toLowerCase()))
            }
            data.total_rows = data.rows.length
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
