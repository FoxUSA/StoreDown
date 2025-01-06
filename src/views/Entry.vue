<template>
<v-container grid-list-lg fluid>
  <v-row>
    <v-col cols="3">
      <h4 class="text-h4"> Item Editor</h4>
    </v-col>

    <v-col cols="9" text-xs-right>
      <v-btn size="small" v-if="item._id" color="info" variant="flat" @click.stop="duplicate">
        Duplicate
      </v-btn><!-- TODO  add a quantity field that automatically insert that number of copies with different ids. Only for new items? -->
      <v-btn size="small" color="success" variant="flat" @click.stop="save">
        Save
      </v-btn>

      <v-btn size="small" color="error" variant="flat" @click.stop="tempState.deleteConfirm=true">
        Delete
      </v-btn>
    </v-col>
  </v-row>

  <!-- TODO QR code generator -->

  <v-row>
    <v-col :class="[group.size ? `v-col-${group.size}` : 'v-col-12 v-col-lg-6 v-col-xl-4']" v-for="group in dataDefinition" :key="group.displayName">
      <v-card flat :color="group.color">
        <v-card-title>
          <h5 class="text-h5">{{group.displayName}}</h5>
        </v-card-title>

        <v-card-actions>
          <v-form cols="12">
            <v-container>
              <v-row>
                <v-col :class="field.size ? `v-col-${field.size}` : 'v-col-12 v-col-sm-6 v-col-xl-4'" v-for="field in group.fields" :key="field.name">

                  <!-- String  -->
                  <v-text-field :color="field.color ? field.color :'white'" v-if="field.type=='string'" v-model="item[field.name]" :label="field.displayName" :disabled="field.disabled"></v-text-field>

                  <!-- path -->
                  <v-text-field :color="field.color ? field.color :'white'" v-if="field.type=='path'" v-model="item[field.name]" :label="field.displayName" :prefix="field.prefixes[(item[field.name]|| '').toLowerCase()]" :disabled="field.disabled"></v-text-field>

                  <!-- lastDate or last modified-->
                  <v-text-field :color="field.color ? field.color :'white'" v-if="field.type=='lastDate' || field.type=='lastModified' " v-model="item[field.name]" :label="field.displayName" :disabled="true"></v-text-field>

                  <!-- TODO Markdown Default being rendered, click edit button to get text area -->
                  <!-- list -->
                  <template v-if="field.type=='list'">
                    <v-combobox :color="field.color ? field.color :'white'" v-model="item[field.name]" :label="field.displayName" chips clearable multiple>
                      <template v-slot:chip="data">
                        <v-chip :value="data.selected" closable @update:model-value="item[field.name].splice(item[field.name].indexOf(data.item), 1)">

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
                  <v-menu v-if="field.type=='date'" v-model="fieldStates[field.name]" :close-on-content-click="false" lazy transition="scale-transition" full-width min-width="290px">
                    <!-- TODO :nudge-right="40" offset-y -->
                    <template v-slot:activator="{ props }">
                      <v-text-field v-model="item[field.name]" :label="field.displayName" v-bind="props"></v-text-field>
                    </template>
                    <v-date-picker v-model="item[field.name]" @input="fieldStates[field.name] = false"></v-date-picker>
                  </v-menu>

                  <!-- Boolean -->
                  <v-switch v-if="field.type=='boolean'" v-model="item[field.name]" :label="field.displayName" :color="field.color ? field.color :'white'" hide-details></v-switch>

                  <!-- libraryStyleStatus -->
                  <template v-if="field.type=='libraryStyleStatus'">
                    <v-row>
                      <v-col cols="6">
                        <v-btn variant="flat" block :color="field.color ? field.color :'primary'" @click.stop="toggleLibraryStyleStatus(field,true)" :disabled="getOrSetDefault(field,{}).status">Check In</v-btn>
                      </v-col>
                      <v-col cols="6">
                        <v-btn variant="flat" block :color="field.color ? field.color :'primary'" @click.stop="toggleLibraryStyleStatus(field,false)" :disabled="!getOrSetDefault(field,{}).status">Check Out</v-btn>
                      </v-col>
                    </v-row>
                  </template>

                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-actions>

      </v-card>
    </v-col>
  </v-row>

  <v-dialog v-model="tempState.deleteConfirm" width="500">
    <v-card>
      <v-card-title class="text-h5">Delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete this item?
      </v-card-text>
      <v-card-actions>
        <v-btn color="" variant="flat" @click.stop="tempState.deleteConfirm=false">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="flat" @click.stop="deleteItem">
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
      this.item._id = null // Removing _id and _rev and saving is equivalent to creating a copy. A new item will be created and the existing item with remain
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

      // Business end of saving
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
        DatabaseService().getDatabase().post(this.item).then(callback).catch(this.$toasted.error)
      } else {
        DatabaseService().getDatabase().put(this.item).then(callback).catch(this.$toasted.error)
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
        this.item[field.name] = defaultValue
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
        this.item[field.name] = {}
      } // create the object if it has not been crated yet.

      // Get user if its available
      let userConfig = ConfigService.getLocalConfig('user')
      let user = 'Local'

      if (userConfig && userConfig.user) {
        user = userConfig.user
      }

      if (status) { // checkIn
        this.item[field.name]['checkInDate'] = new Date().toISOString()
        this.item[field.name]['checkInBy'] = user
      } else { // checkOut
        this.item[field.name]['checkOutDate'] = new Date().toISOString()
        this.item[field.name]['checkOutBy'] = user
      }
      this.item[field.name]['status'] = status
    }
  }
}
</script>
<style>

</style>
