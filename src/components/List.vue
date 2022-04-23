<template>
<v-layout>
  <v-flex xs12>
    <v-data-table :headers="headers" :pagination.sync="pagination" :items="data.rows" :loading="loading" :total-items="data.total_rows" :rows-per-page-items="[10,50,100,1000]">
      <template v-slot:items="props">
        <ListColumnTypes :props="props" :headers="headers" :rowClick="rowClick" />
      </template>

      <template v-slot:no-data>
        <v-alert :value="!loading" color="error">
          No data was found.
        </v-alert>
      </template>
    </v-data-table>
  </v-flex>
</v-layout>
</template>

<script>
import ListColumnTypes from '../components/ListColumnTypes'

export default {
  components: {
    ListColumnTypes
  },
  props: { // Example usage <List :headers="headers" :loadData="loadData" :rowClick="rowClick" />
    headers: Array,
    rowClick: Function,
    loadData: Function
  },
  watch: {
    pagination: {
      handler () {
        this.getData()
      },
      deep: true
    },
    '$route' (to, from) {
      this.getData()
    }
  },
  data: () => ({
    pagination: {},
    loading: false,
    data: {}
  }),
  // mounted () {
  //   //Commented out. Pagination handler was calling getData
  //   this.getData()
  // },
  methods: {
    /**
     * Calls loadData and handles pagination parameters and loading bar
     */
    getData: function () {
      this.loading = true
      this.data.rows = []
      let start = (this.pagination.page - 1) * this.pagination.rowsPerPage

      this.loadData(start, this.pagination.rowsPerPage).then((data) => {
        this.data = data
        this.loading = false
      }).catch((error) => {
        if (error.status === 404) {} else {
          this.$toasted.info(`Error ${error}`)
        }
      })
    }
  }
}
</script>

<style>

</style>
