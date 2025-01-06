<template>
  <v-container grid-list-lg fluid>
    <v-row>
      <v-col cols="9">
        <h4 class="text-h4"> Configuration </h4>
      </v-col>

      <v-col cols="3" text-xs-right >
        <v-btn color="success" variant="flat" @click.stop="save">
          Save
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card flat fill-height>
          <v-card-actions>
            <v-container fluid>
              <v-row>
                <v-col cols="12">
                  <v-textarea auto-grow  flat v-model="config.yml" label="Config YAML" hint="StoreDown config"></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ConfigService } from '../services/Config.js'

export default {
  data: () => ({
    config: {
      yml: ''
    }
  }),
  mounted () {
    this.loadConfig()
  },

  methods: {
    loadConfig: function () {
      ConfigService.getConfig().then((config) => {
        this.config = config
      }).catch((error) => {
        if (error.status === 404) {} else {
          this.$toasted.error(`Error: ${error.status}`)
        }
      })
    },
    save: function () {
      ConfigService.setConfig(this.config).then((data) => {
        this.loadConfig()
        this.$toasted.info('Configuration saved')
      }).catch((error) => {
        this.$toasted.error(`Error: ${error.status}`)
      })
    }
  }
}
</script>
