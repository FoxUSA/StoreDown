<template>
  <tr @click="rowClick(props)" :style="{'background-color': props.item.type==='_path' ? '#D84315':''}"><!--blue darken-1-->
    <td v-for="header in headers" :key="'header-'+header.value">
      <template v-if="header.value==='_id'">
        <template v-if="props.item.type!='_path'">
          {{props.item[header.value].substr(-6)}}
        </template>
        <template v-else>
          {{props.item[header.value]}}
        </template>
      </template> <!-- Render only last 6 characters of id -->

      <template v-else-if="header.item.type=='path'">
        {{header.item.prefixes[(props.item[header.value] || '').toLowerCase()]}}{{(props.item[header.value] || '').toLowerCase()}}
      </template>

      <template v-else-if="header.item.type=='list'">
        <template v-for="subItem in props.item[header.value]">
          {{subItem}}
        </template>
      </template>

      <template v-else-if="header.item.type=='libraryStyleStatus' && props.item.type!='_path'">
        {{ props.item[header.value] && props.item[header.value].status ? "Checked in" : "Checked out"}}
      </template>

      <template v-else>
        {{props.item[header.value]}}
      </template>
    </td>
  </tr>
</template>

<script>
export default {
  props: { // <ListColumnTypes :props="props" :headers="headers" :rowClick="rowClick"/>
    props: Object,
    headers: Array,
    rowClick: Function
  }
}
</script>
