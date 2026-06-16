<script setup lang="ts">
import type { Dontcare } from '@adtalos/anyforce/types'
import List from '@/components/ivt_report/list.vue'

const slots = defineSlots<{
  default?: (props: {
    chooserName: string
    disabled: boolean
    readonly: boolean
  }) => void
  search?: (props: Record<string, Dontcare>) => void
  preview?: () => void
}>()

const prefetch = ['monetizer', 'monetizer_app']
</script>

<template>
  <af-chooser
    name="反作弊报告"
    :prefetch="prefetch"
    :list="List"
  >
    <template v-if="slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>

    <template v-if="slots.search" #search="scope">
      <slot name="search" v-bind="scope" />
    </template>

    <template v-if="slots.preview" #preview>
      <slot name="preview" />
    </template>
  </af-chooser>
</template>
