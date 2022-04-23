<template>
<v-container grid-list-lg fluid>
  <v-layout>
    <v-flex xs3>
      <h4 class="display-1"> Item Editor</h4>
    </v-flex>

    <v-flex xs9 text-xs-right>
      <v-btn small v-if="item._id" color="info" depressed @click.stop="duplicate">
        Duplicate
      </v-btn><!-- TODO  add a quantity field that automatically insert that number of copies with different ids. Only for new items? -->
      <v-btn small color="success" depressed @click.stop="save">
        Save
      </v-btn>

      <v-btn small color="error" depressed @click.stop="tempState.deleteConfirm=true">
        Delete
      </v-btn>
    </v-flex>
  </v-layout>

  <!-- TODO QR code generator -->

  <v-layout wrap>
    <v-flex d-flex :class="[group.size ? `xs${group.size}` : 'xs12 lg6 xl4']" v-for="group in dataDefinition" :key="group.displayName">
      <v-card flat :class="group.color">
        <v-card-title>
          <h5 class="headline">{{group.displayName}}</h5>
        </v-card-title>

        <v-card-actions>
          <v-container fluid class="pt-0">
            <v-layout wrap>
              <v-form class="flex xs12">
                <v-layout wrap>
                  <v-flex :class="field.size ? `xs${field.size}` : 'xs12 sm6 xl4'" v-for="field in group.fields" :key="field.name">

                    <!-- String  -->
                    <v-text-field :color="field.color ? field.color :'white'" v-if="field.type=='string'" v-model="item[field.name]" :label="field.displayName" :disabled="field.disabled"></v-text-field>

                    <!-- path -->
                    <v-text-field :color="field.color ? field.color :'white'" v-if="field.type=='path'" v-model="item[field.name]" :label="field.displayName" :prefix="field.prefixes[item[field.name]]" :disabled="field.disabled"></v-text-field>

                    <!-- lastDate or last modified-->
                    <v-text-field :color="field.color ? field.color :'white'" v-if="field.type=='lastDate' || field.type=='lastModified' " v-model="item[field.name]" :label="field.displayName" :disabled="true"></v-text-field>

                    <!-- TODO Markdown Default being rendered, click edit button to get text area -->
                    <!-- list -->
                    <template v-if="field.type=='list'">
                      <v-combobox :color="field.color ? field.color :'white'" v-model="item[field.name]" :label="field.displayName" chips clearable multiple>
                        <template v-slot:selection="data">
                          <v-chip :selected="data.selected" close @input="item[field.name].splice(item[field.name].indexOf(data.item), 1)">

                            <!-- List full of links -->
                            <strong v-if="field.listType=='link'">
                              <a :href="data.item" target="_blank">Link</a>
                            </strong>

                            <!-- Default just text -->
                            <strong v-else>{{ data.item }}</strong>&nbsp;
                          </v-chip>
                        </template>
                      </v-combobox>
                    </template>

                    <!-- Date -->
                    <v-menu v-if="field.type=='date'" v-model="fieldStates[field.name]" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="290px">
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="item[field.name]" :label="field.displayName" v-on="on"></v-text-field>
                      </template>
                      <v-date-picker v-model="item[field.name]" @input="fieldStates[field.name] = false"></v-date-picker>
                    </v-menu>

                    <!-- Boolean -->
                    <v-switch v-if="field.type=='boolean'" v-model="item[field.name]" :label="field.displayName" :color="field.color ? field.color :'white'" hide-details></v-switch>

                    <!-- libraryStyleStatus -->
                    <template v-if="field.type=='libraryStyleStatus'">
                      <v-layout>
                        <v-flex xs6>
                          <v-btn depressed block :color="field.color ? field.color :'primary'" @click.stop="toggleLibraryStyleStatus(field,true)" :disabled="getOrSetDefault(field,{}).status">Check In</v-btn>
                        </v-flex>
                        <v-flex xs6>
                          <v-btn depressed block :color="field.color ? field.color :'primary'" @click.stop="toggleLibraryStyleStatus(field,false)" :disabled="!getOrSetDefault(field,{}).status">Check Out</v-btn>
                        </v-flex>
                      </v-layout>
                    </template>

                  </v-flex>
                </v-layout>
              </v-form>
            </v-layout>
          </v-container>
        </v-card-actions>

      </v-card>
    </v-flex>
  </v-layout>

  <v-dialog v-model="tempState.deleteConfirm" width="500">
    <v-card>
      <v-card-title class="headline">Delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete this item?
      </v-card-text>
      <v-card-actions>
        <v-btn color="" depressed @click.stop="tempState.deleteConfirm=false">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" depressed @click.stop="deleteItem">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</v-container>
</template>

<script>
import {
  ConfigService
} from '../services/Config.js'
import DatabaseService from '../services/Database.js'

export default {
  components: {
  },
  data: () => {
    return {
      // Custom field config
      config: {},
      item: {},
      fieldStates: {}, // Temporary object to track state for entry fields
      tempState: { // Static state
        deleteConfirm: false
      }
    }
  },
  computed: {
    dataDefinition: function () {
      if (!this.config || !this.config.dataDefinition) {
        return
      }
      return this.config.dataDefinition
    }
  },
  mounted () {
    this.loadData()

    // Get config
    ConfigService.getConfigObject().then((config) => {
      this.config = config
    }).catch((error) => {
      if (error.status === 404) {} else {
        this.$toasted.show(`Received error: ${error.status}`)
      }
    })
  },
  watch: {
    '$route' (to, from) {
      this.loadData() // Handle if user is in an entry then tries to go to a blank entry.
    }
  },
  methods: {
    /**
     * Duplicate and existing item
     */
    duplicate () {
      this.item._id = null // Removing _id and _rev and saving is equivilent to creating a copy. A new item will be created and the existing item with remain
      this.item._rev = null
    },
    /**
     * Load data into this.item
     */
    loadData: function () {
      if (!this.$route.params.id || !DatabaseService()) {
        return this.item = {}
      }
      DatabaseService().getDatabase().get(this.$route.params.id).then(item => this.item = item).catch((error) => {
        if (error.status === 404) {
          this.$toasted.error('Item does not exist')
        } else {
          this.$toasted.error(`Received error: ${error.status}`)
        }
      })
    },
    save: function () {
      this.item.type = 'item' // Future proofing/give the ability to filter out app records

      // Update any lastModified types
      this.dataDefinition.forEach(group => group.fields.filter(field => field.type === 'lastModified').forEach((field) => this.item[field.name] = new Date().toISOString()))

      // Update any lastDate types
      this.dataDefinition.forEach(group => group.fields.filter(field => field.type === 'lastDate').forEach((field) => {
        let dates = []
        field.dateFields.forEach((date) => {
          let value = this.item[date.name]
          if (date.type !== 'libraryStyleStatus') {
            if (value) {
              return dates.push(new Date(value))
            }
          }

          if (value && value.checkInDate) {
            dates.push(new Date(value.checkInDate))
          }
          if (value && value.checkOutDate) {
            dates.push(new Date(value.checkOutDate))
          }
        })

        if (dates.length) {
          this.item[field.name] = new Date(Math.max.apply(null, dates)).toISOString()
        }
      }))

      // Buisness end of saving
      let callback = (response, error) => {
        if (error || !response.ok) {
          return this.$toasted.error(`Received save error ${error}`)
        }

        this.$toasted.info('Saved')
        this.$router.push({
          path: `/entry/${response.id}`,
          query: {
            rev: response.rev
          }
        }) // pass in the rev so it always reloads the page
      }

      if (!this.item._id) {
        DatabaseService().getDatabase().post(this.item).then(callback)
      } else {
        DatabaseService().getDatabase().put(this.item).then(callback)
      }
    },
    /**
     * Delete item
     */
    deleteItem: function () {
      if (!this.item._id) {
        this.$toasted.info('Form cleared')
        this.$router.push({
          path: '/'
        })
      } else {
        DatabaseService().getDatabase().remove(this.item).then(() => {
          this.$toasted.info('Item deleted')
          this.$router.push({
            path: '/'
          })
        }).catch((error) => {
          this.$toasted.info(`Error ${error}`)
        })
      }
    },

    /**
     * Getter that will set the object to the default value if it does not exist
     * @param  {dataDefinition} field - field in question
     * @param  {} defaultValue - value instantiate the object to
     * @return - object
     */
    getOrSetDefault: function (field, defaultValue) {
      if (this.item[field.name] === undefined) {
        this.$set(this.item, field.name, defaultValue)
      } // create the object if it has not been crated yet.

      return this.item[field.name]
    },
    /**
     * Checks in our out a field
     * @param  {dataDefinition} field  - field in question
     * @param  {boolean} status - Status we want to set
     */
    toggleLibraryStyleStatus: function (field, status) {
      if (!this.item[field.name]) {
        this.$set(this.item, field.name, {})
      } // create the object if it has not been crated yet.

      // Get user if its available
      let userConfig = ConfigService.getLocalConfig('user')
      let user = 'Local'

      if (userConfig && userConfig.user) {
        user = userConfig.user
      }

      if (status) { // checkIn
        this.$set(this.item[field.name], 'checkInDate', new Date().toISOString())
        this.$set(this.item[field.name], 'checkInBy', user)
      } else { // checkOut
        this.$set(this.item[field.name], 'checkOutDate', new Date().toISOString())
        this.$set(this.item[field.name], 'checkOutBy', user)
      }
      this.$set(this.item[field.name], 'status', status)
    }
  }
}
</script>
<style>

</style>
