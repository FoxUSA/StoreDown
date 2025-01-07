<template>
<v-app>
  <!-- Toolbar -->
  <v-app-bar color="blue" dense   flat>
    <v-app-bar-title v-ripple style="cursor: pointer; overflow: visible;">
      <span class="text-h6" @click.stop="drawer = !drawer">StoreDown</span>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-text-field @keyup.enter="search" placeholder="Search items" single-line color="white" class="py-0 ml-2" v-model='searchString' hide-details />
    <v-btn variant="text" @click.stop="search">
      Search
    </v-btn>
  </v-app-bar>

  <!-- Left menu -->
  <v-navigation-drawer v-model="drawer" :width="150">
    <v-list density="compact">
      <!-- Discovery -->
      <v-list-subheader class="text-grey-darken-1">
        Discovery
      </v-list-subheader>

      <v-list-item to="/search/">
        <v-list-item-title>
          Search
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/tree/">
        <v-list-item-title>
          Item tree
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/">
        <v-list-item-title>
          Item list
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/change-feed">
        <v-list-item-title>
          Change feed
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list density="compact">
      <v-list-subheader class="text-grey-darken-1">
        Modification
      </v-list-subheader>

      <v-list-item to="/entry/">
        <v-list-item-title>
          New item
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list density="compact">
      <!-- Settings -->
      <v-list-subheader class="text-grey-darken-1">
        Settings
      </v-list-subheader>
      <v-list-item to="/config">
        <v-list-item-title class="text-grey-darken-1">
          Configuration
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/connection">
        <v-list-item-title class="text-grey-darken-1">
          Connection
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/import-export">
        <v-list-item-title class="text-grey-darken-1">
          Import/export
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-list-subheader class="text-caption text-grey-darken-2 fade-out-legal">
      &#169; 2025 Jacob Liscom <br /> Version: {{version}}
    </v-list-subheader>
  </v-navigation-drawer>

  <!-- Main content -->
  <v-main>
    <router-view />
  </v-main>

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
.v-application * {  /* Just on application prevent a white blink 2/2*/
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
