<template>
<v-container grid-list-lg fluid>
  <v-layout>
    <v-flex xs12>
      <h4 v-if="!$route.query.prefix" class="display-1">Item tree</h4>
      <h5 v-else class="headline">
        <button @click="breadcrumbsClick(-1)">Item tree</button>
        /
        <template v-for="(p, i) in prefix">
          <button :key="p" @click="breadcrumbsClick(i)">{{p}}</button>
          /
        </template>
      </h5>

    </v-flex>
  </v-layout>
  <!-- TODO QR code generator -->
  <List :headers="headers" :loadData="loadData" :rowClick="rowClick" />
</v-container>
</template>

<script>
import {
  ConfigService
} from '../services/Config.js'
import DatabaseService from '../services/Database.js'
import List from '../components/List'

const RECORD_TO_PULL = 10000

export default {
  components: {
    List
  },
  data: () => ({
    tree: { _items: [] },
    headers: [],
    pathField: false, // TODO if false, put message here how to enable list view
    prefix: []
  }),
  watch: {
    '$route' (to, from) {

    }
  },
  mounted () {
    this.loadHeaders()
  },
  methods: {
    /**
     * Hande logic for when a row is clicked
     * @param  {[type]} props  [description]
     * @param  {[type]} header [description]
     */
    rowClick: function (props) {
      if (props.item.type === 'item') { return this.$router.push(`/entry/${props.item._id}`) }

      return this.$router.push({
        name: 'tree',
        query: {
          prefix: `${this.$route.query.prefix || ''}${props.item.name}/`
        }
      })
    },

    /**
     * Handle a breadcrumb click
     * @param  {[type]} index - index of breadcrumb part
     */
    breadcrumbsClick: function (index) {
      let prefix = ''
      if (index !== -1) {
        prefix = `${this.prefix.slice(0, index + 1).join('/')}/`
      }

      if (prefix === this.$route.query.prefix) {
        return
      }

      return this.$router.push({
        name: 'tree',
        query: {
          prefix: prefix
        }
      })
    },

    /**
     * Loads headers into this.headers
     */
    loadHeaders: function () {
      if (!DatabaseService()) {
        return
      }

      // Get config and headers
      ConfigService.getConfigObject().then((config) => {
        config.dataDefinition.forEach((group) => {
          group.fields.forEach((item) => {
            if (!item.showInTree) { return }

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
      * Load, cache, and return prefix data to List component
      * @param  {Number} [skip=0]    - start seek. Number of items to skip
      * @param  {Number} [limit=100] - Number of items to pull
      * @return {Promise}            - When resolved, return database data
      */
    loadData: function (skip = 0, limit = 100) {
      this.prefix = (this.$route.query.prefix || '').slice(0, -1).toLowerCase().split('/')

      /**
       * Get the last path field and make sure there is a name field. Used to determine support for tree view.
       * @param  {[type]} config [description]
       * @return {String} - Returns path field name. This value is also set this.pathField
       */
      let findPathField = (config) => {
        let hasName = false
        config.dataDefinition.forEach(group => group.fields.forEach(field => {
          if (field.name === 'name') {
            hasName = true
          }
          if (field.type === 'path') {
            this.pathField = field
          }
        }))

        if (!hasName) {
          this.pathField = false
        } // No name, no tree view. Even if a path was found

        return this.pathField
      }

      /**
       * Build Tree and set it to this.tree
       * @return {[type]} [description]
       */
      let buildTree = () => {
        this.$toasted.info('Building tree cache')
        return new Promise((resolve, reject) => {
          ConfigService.getConfigObject().then((config) => {
            let i = 0
            if (!findPathField(config)) { return reject(new Error('Tree view not supported because a name field or field with type path is not set.')) }

            let pathFieldName = this.pathField.name.charAt(0).toUpperCase() + this.pathField.name.slice(1)
            let loopFunction = () => {
              DatabaseService().getAllItems({ skip: i, limit: RECORD_TO_PULL }).then((data) => {
                i += data.rows.length || 10// If no items are returned the database only has config. We need to add some manually so we dont loop forever

                data.rows.forEach((item) => {
                  let prefix = this.pathField.prefixes[(item[this.pathField.name] || '').toLowerCase()]
                  if (!prefix) {
                    prefix = '' // Blanks it out instead of printing undefined.
                  }

                  let path = 'none' // Special case if no path is given use None
                  if (item[this.pathField.name]) {
                    path = `${prefix}${item[this.pathField.name]}`.toLowerCase() // Lower case everything because computer science
                  }

                  if (path.substr(-1) !== '/') { // Make sure path ends with a /
                    path += '/'
                  }

                  path = path.slice(0, -1) // So we can chop it off

                  let pathsSplit = path.split('/')
                  let subTree = this.tree
                  pathsSplit.forEach((pathPart) => {
                    // TODO trim this. iPhone adds spaces between parts. `20243 / foo` should = `20243/foo`
                    if (!subTree[pathPart]) {
                      subTree[pathPart] = {
                        _items: []
                      }
                      subTree._items.unshift({
                        name: pathPart,
                        type: '_path',
                        _id: pathFieldName
                      })
                    }

                    subTree = subTree[pathPart]
                  })

                  subTree._items.push(item)
                })

                if ((i + 10) < data.total_rows) { return loopFunction() }// +10 to account for configuration that shows up in data.total_rows but not in this return

                return resolve(this.tree)
              }).catch(reject)
            }

            // Engage
            return loopFunction()
          }).catch(reject)
        })
      }

      /**
       * Internal method to load sub tree for a given prefix
       * @param  {Array} prefix - prefix parts array
       * @return {Object} - Sub tree for that path
       */
      let loadPrefix = (prefix) => {
        // We already have a cache
        let subTree = this.tree
        prefix.forEach((path) => {
          if (!subTree[path]) { return subTree._items }// Nothing found
          return subTree = subTree[path]
        })

        return {
          total_rows: subTree._items.length,
          rows: subTree._items.slice(skip, skip + limit)
        }
      }

      // Execute
      return new Promise((resolve, reject) => {
        if (this.tree._items.length) { return resolve(loadPrefix(this.prefix)) }// If tree is already set Ether prefixes or

        buildTree().then(() => { // Build a cache
          return resolve(loadPrefix(this.prefix))
        })// .catch(reject)
      })
    }
  }
}
</script>
