<template>
<v-app dark>
  <!-- Left menu -->
  <v-navigation-drawer v-model="drawer" fixed clipped app :width="150">

    <!-- Discovery -->
    <v-subheader class="mt-3 grey--text text--darken-1">
      Discovery
    </v-subheader>
    <v-list dense>
      <v-list-tile to="/search/">
        <v-list-tile-content>
          <v-list-tile-title>
            Search
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/tree/">
        <v-list-tile-content>
          <v-list-tile-title>
            Item tree
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/">
        <v-list-tile-content>
          <v-list-tile-title>
            Item list
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/change-feed">
        <v-list-tile-content>
          <v-list-tile-title>
            Change feed
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-subheader class="mt-3 grey--text text--darken-1">
      Modification
    </v-subheader>
    <v-list dense>
      <v-list-tile to="/entry/">
        <v-list-tile-content>
          <v-list-tile-title>
            New item
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <!-- Settings -->
    <v-subheader class="mt-3 grey--text text--darken-1">
      Settings
    </v-subheader>
    <v-list dense>
      <v-list-tile to="/config">
        <v-list-tile-content>
          <v-list-tile-title class="grey--text text--darken-1">
            Configuration
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/connection">
        <v-list-tile-content>
          <v-list-tile-title class="grey--text text--darken-1">
            Connection
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/import-export">
        <v-list-tile-content>
          <v-list-tile-title class="grey--text text--darken-1">
            Import/export
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-subheader class="caption mt-3 grey--text text--darken-2 fade-out-legal">
      &#169; 2022 Jacob Liscom <br /> Version: {{version}}
    </v-subheader>
  </v-navigation-drawer>

  <!-- Toolbar -->
  <v-toolbar color="blue" dense fixed clipped-left app flat>
    <v-toolbar-title v-ripple style="cursor: pointer; overflow: visible;">
      <span class="title" @click.stop="drawer = !drawer">StoreDown</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-text-field @keyup.enter="search" placeholder="Search items" single-line color="white" class="py-0 ml-2" v-model='searchString' hide-details />
    <v-toolbar-items >
      <v-btn flat @click.stop="search" style="min-width:0">
        Search
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>

  <!-- Main content -->
  <v-content>
    <router-view />
  </v-content>

</v-app>
</template>

<script>

export default {
  components: {
  },
  data: () => ({
    drawer: null,
    searchString: '',
    version: process.env.VUE_APP_VERSION
  }),
  watch: {
    '$route' (to, from) {
      this.resetSearchString(to)
    }
  },
  mounted () {
    this.resetSearchString(this.$route)
  },
  methods: {
    resetSearchString (route) { // reset search string on route changes
      if (route.name !== 'search') { // except if they go to search
        this.searchString = ''
      } else {
        this.searchString = this.$route.query.query
      }
    },
    scan (searchString) {
      this.searchString = searchString
      this.search()
    },
    search () {
      return this.$router.push({
        name: 'search',
        query: {
          query: this.searchString
        }
      })
    }
  }
}
</script>

<style>
/* Fade everything */
* {
  animation: fadein .5s;
}

@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Fade out */
.fade-out-legal {
  animation: fadeout 10s;
  opacity: 0;
}

@keyframes fadeout {
  0% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  /* Let it sit for a bit*/
  100% {
    opacity: 0;
  }
}
</style>
