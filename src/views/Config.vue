<template>
  <v-container grid-list-lg fluid>
    <v-layout>
      <v-flex xs9>
        <h4 class="display-1"> Configuration </h4>

      </v-flex>

      <v-flex xs3 text-xs-right >
        <v-btn color="success" depressed @click.stop="save">
          Save
        </v-btn>
      </v-flex>
    </v-layout>

    <v-layout>
      <v-flex xs12>
        <v-card flat fill-height>
          <v-card-actions>
            <v-container fluid>
              <v-layout wrap>
                <v-flex xs12>
                  <v-textarea auto-grow  flat v-model="config.yml" label="Config YAML" hint="StoreDown config"></v-textarea>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
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
