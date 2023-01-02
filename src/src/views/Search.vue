<template>
  <v-container grid-list-lg fluid>
    <v-layout>
      <v-flex xs6>
        <h4 class="display-1">Search results</h4>
      </v-flex>
    </v-layout>
    <!-- TODO QR code link generator -->
    <List :headers="headers" :loadData="loadData" :rowClick="rowClick" />
  </v-container>
</template>
<!-- TODO
scan and search
search syntax field:regex
can search path with a regex to just get the last slit for boxes. Can qr code this search for box tags.
fuzzy search

/([^;\n]*):([^;\n]*)(?:;)?[^\n]*/gim

test data
```
//Fuzzy search on key b //Testing single letter keys
b:a
//Fuzzy search on key foo2
fo o :  query   ;
//Fuzzy search on key foo2
foo2:query;
//Fuzzy search on key foo2
foo2:query
//Regex search
location:[^//]//(.*box3)
//Fuzzy search on all keys
query
```

-->

<script>
import {
  ConfigService
} from '../services/Config.js'
import DatabaseService from '../services/Database.js'
import Fuse from 'fuse.js'
import List from '../components/List'

const RECORD_TO_PULL = 10000

export default {
  components: {
    List
  },
  data: () => ({
    DatabaseService: DatabaseService(),
    headers: []
  }),
  watch: {
    '$route' (to, from) {
    }
  },
  mounted () {
    this.loadHeaders()// Don't need to reload with route change
  },
  methods: {
    loadHeaders: function () {
      if (!DatabaseService()) {
        return
      }

      // Get config and headers
      ConfigService.getConfigObject().then((config) => {
        config.dataDefinition.forEach((group) => {
          group.fields.forEach((item) => {
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
     * @param  {Number} [skipResults=0]    - start seek. Number of results to skip before returning
     * @param  {Number} [resultLimit=100] - Number of result to try and find before we stop
     * @return {Promise}            - When resolved, return database data
     */
    loadData: function (skipResults = 0, resultLimit = 100) {
      // TODO TRIM queryRegex matches

      return new Promise((resolve, reject) => {
        if (!DatabaseService()) {
          return reject(new Error('Database is not setup'))
        }

        ConfigService.getConfigObject().then((config) => {
          let keys = []
          let results = []
          let resultsSkipped = 0
          let i = 0

          // Get query
          let query = this.$route.query.query

          config.dataDefinition.forEach((group) => {
            // Get keys for fuse
            group.fields.forEach((item) => {
              keys.push(item.name)
            })
          })

          // Setup fuse
          let fuseOptions = {
            // shouldSort: true,//TODO
            threshold: 0.3,
            keys: keys
          }

          let loopFunction = () => {
            DatabaseService().getAllItems({ skip: i, limit: RECORD_TO_PULL }).then((data) => {
              i += data.rows.length || 10// If no items are returned the database only has config. We need to add some manually so we dont loop forever

              results = results.concat((new Fuse(data.rows, fuseOptions)).search(query))

              let resultsToSkip = skipResults - resultsSkipped
              if (resultsToSkip > 0) {
                resultsSkipped += Math.min(resultsToSkip, results.length)
                if (resultsToSkip <= results.length) { results = results.slice(resultsToSkip) } else { results = [] }
              }

              // console.log(`i: ${i} toskip: ${resultsToSkip} results: ${results.length}`);//Keep for debug purposes
              if (results.length < resultLimit && i < data.total_rows) { return loopFunction() }

              let totalRows = results.length + resultsSkipped
              // +10 to account for configuration that shows up in data.total_rows but not in this return.
              if ((i + 10) < data.total_rows) { totalRows += 1 }// +1 So the table show there is more data

              results = results.slice(0, resultLimit)// Return the quested amount even if we have more as to not confuse the data-table
              return resolve({
                total_rows: totalRows,
                rows: results
              })
            }).catch(reject)
          }

          // Engage
          loopFunction()
        }).catch(reject)

        // let queryRegex= /^([^;\n]*):([^;\n]*)(?:;)?[^\n]*$/gim

        // let regexQueryMap={}

        // let match=null
        // while ((match = queryRegex.exec(query))) {
        //   console.dir(match)//FIXME
        // }
        //
        // let regexSearch=false
        // if(!Object.keys(regexQueryMap).length){
        //   regexSearch=true//TODO get columns
        // }
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

<style>

</style>
