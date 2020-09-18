<style lang="sass" scoped>
@import 'src/styles/app.variables'

.hello-world-main
  font-family: Avenir, Helvetica, Arial, sans-serif
  color: $blue-grey-9
  @extend %text-h4
  font-weight: map_get($text-weights, "medium")
  text-align: center
</style>

<template>
  <div class="hello-world-main">
    <div>{{ msg }}</div>
  </div>
</template>
