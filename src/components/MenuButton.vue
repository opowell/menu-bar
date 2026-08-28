<script setup lang="ts">
/*
 * A button that opens a menu: the whole of a pane's menu, and the shape any
 * other one-off menu takes. What is *in* it is the caller's business — this
 * knows only how to put it up, take it down, and give the focus back.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { MenuAnchor, MenuItemDef } from '../menu/types'
import MenuList from './MenuList.vue'

withDefaults(
  defineProps<{
    items: MenuItemDef[]
    /** Names the button for a screen reader, and the menu it opens. */
    label: string
    /** The button's face. A vertical ellipsis unless the caller says otherwise. */
    glyph?: string
  }>(),
  { glyph: '⋯' },
)

const emit = defineEmits<{ choose: [item: MenuItemDef] }>()

const trigger = ref<HTMLElement | null>(null)
const menu = ref<{ root: HTMLElement | null } | null>(null)
const anchor = ref<MenuAnchor | null>(null)
/** Set when the menu was opened by a key, which also moves the focus into it. */
const byKey = ref(false)

const open = computed(() => anchor.value !== null)

function show(fromKey: boolean) {
  const box = trigger.value?.getBoundingClientRect()
  if (!box) return
  // Below the button, and mirrored to end at its right edge if it cannot fit.
  anchor.value = { x: box.left, y: box.bottom + 4, mirrorX: box.right }
  byKey.value = fromKey
}

function hide(refocus: boolean) {
  anchor.value = null
  if (refocus) trigger.value?.focus()
}

function onClick() {
  if (open.value) hide(true)
  else show(false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' || open.value) return
  event.preventDefault()
  show(true)
}

/*
 * A press anywhere else takes the menu down. Listened for on the way *down*
 * rather than on click, so the menu is gone before whatever was pressed acts —
 * a pane header under it, say, which would otherwise begin a drag beneath an
 * open menu.
 *
 * "Anywhere else" is measured against this button and the menu it opened, not
 * against menus in general: another pane's menu is somewhere else, and pressing
 * it has to take this one down. Reading it by class instead would leave both
 * standing, overlapping each other.
 */
function onPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target) return
  if (trigger.value?.contains(target) || menu.value?.root?.contains(target)) return
  hide(false)
}

watch(open, (is) => {
  if (is) window.addEventListener('pointerdown', onPointerDown, true)
  else window.removeEventListener('pointerdown', onPointerDown, true)
})

onBeforeUnmount(() => window.removeEventListener('pointerdown', onPointerDown, true))

function choose(item: MenuItemDef) {
  hide(true)
  item.action?.()
  emit('choose', item)
}
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="dc-menu-button"
    :aria-label="label"
    aria-haspopup="menu"
    :aria-expanded="open"
    :disabled="items.length === 0"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span aria-hidden="true">{{ glyph }}</span>
  </button>

  <MenuList
    v-if="anchor"
    ref="menu"
    :items="items"
    :at="anchor"
    :label="label"
    :autofocus="byKey"
    @choose="choose"
    @dismiss="hide(true)"
  />
</template>

<style scoped>
.dc-menu-button {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: var(--dc-radius-sm);
  background: transparent;
  color: var(--dc-fg-3);
  font-size: 13px;
  line-height: 1;
  cursor: default;
}

.dc-menu-button:hover:not([disabled]),
.dc-menu-button[aria-expanded='true'] {
  background: var(--dc-accent-bg);
  color: var(--dc-fg-0);
}

.dc-menu-button[disabled] {
  opacity: 0.4;
}
</style>
