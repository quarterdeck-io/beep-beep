<template>
  <div class="log-panel">
    <h3>Log</h3>
    <pre>{{ log }}</pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{ log: string }>()
</script>

<style scoped>
.log-panel {
  background: #f8f8f8;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 2rem;
  font-size: 0.95em;
  max-height: 200px;
  overflow-y: auto;
}
pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>
