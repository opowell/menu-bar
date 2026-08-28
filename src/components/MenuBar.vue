<script setup lang="ts">
/*
 * The application menu: a row of names, each opening a menu of its own.
 *
 * The one behaviour that makes a menu bar feel like a menu bar is that it is
 * modal once opened — with one menu up, moving the pointer along the bar swaps
 * to the next rather than making you click again.
 *
 * It carries the same three theming props the shell and the window do, and
 * imports the tokens for the same reason they do: a bar used on its own, above
 * something that is not a shell, still has to know what colour it is.
 */
import '../style/tokens.css'

import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ShellTheme } from '../types'
import type { MenuAnchor, MenuItemDef } from '../menu/types'
import { isChoosable } from '../menu/types'
import MenuList from './MenuList.vue'

const props = withDefaults(
  defineProps<{
    /** Top-level menus, each of which is an item with `items` of its own. */
    menus: MenuItemDef[]
    label?: string
    /** Overrides the `--dc-accent` token. Shorthand for `tokens`. */
    accent?: string
    /** Design tokens set on the bar — `{ '--dc-surface': '#101418' }`. */
    tokens?: Record<string, string>
    /**
     * `minimal`, the default, is paper, ink and hairlines with nothing else
     * on; `mono-size` is that theme with every word set at one size and one
     * weight; `auto` follows the system setting; `macos` and `windows` wear
     * that system's design language and follow its scheme; `inherit` brings
     * no palette at all.
     */
    theme?: ShellTheme
  }>(),
  { theme: 'minimal' },
)

const style = computed(() => {
  if (!props.accent && !props.tokens) return undefined
  return { ...props.tokens, ...(props.accent ? { '--dc-accent': props.accent } : {}) }
})

const emit = defineEmits<{ choose: [item: MenuItemDef] }>()

const bar = ref<HTMLElement | null>(null)
const buttons = ref<HTMLElement[]>([])
const openAt = ref<number | null>(null)
const anchor = ref<MenuAnchor | null>(null)
const byKey = ref(false)

const reachable = computed(() =>
  props.menus.flatMap((menu, index) => (isChoosable(menu) ? [index] : [])),
)

function show(index: number, fromKey: boolean) {
  const box = buttons.value[index]?.getBoundingClientRect()
  const menu = props.menus[index]
  if (!box || !menu || !isChoosable(menu)) return
  anchor.value = { x: box.left, y: box.bottom + 2, mirrorX: box.right }
  openAt.value = index
  byKey.value = fromKey
}

function hide(refocus: boolean) {
  const index = openAt.value
  openAt.value = null
  anchor.value = null
  if (refocus && index !== null) buttons.value[index]?.focus()
}

function toggle(index: number) {
  if (openAt.value === index) hide(true)
  else show(index, false)
}

/** With a menu already up, the pointer alone moves between them. */
function onEnter(index: number) {
  if (openAt.value === null || openAt.value === index) return
  show(index, false)
}

function step(from: number | null, by: 1 | -1): number | null {
  const order = reachable.value
  if (order.length === 0) return null
  if (from === null) return by === 1 ? (order[0] ?? null) : (order[order.length - 1] ?? null)
  const at = order.indexOf(from)
  if (at === -1) return order[0] ?? null
  return order[(at + by + order.length) % order.length] ?? null
}

/**
 * Left and right belong to the bar at every depth — a submenu that has nothing
 * to do with them lets them through, which is how the arrow keys walk from one
 * menu to the next without first closing the one that is open.
 */
function onKeydown(event: KeyboardEvent) {
  const key = event.key
  if (key === 'Escape') {
    if (openAt.value === null) return
    event.preventDefault()
    hide(true)
    return
  }

  if (key === 'ArrowDown' && openAt.value === null) {
    const index = focusedIndex()
    if (index === null) return
    event.preventDefault()
    show(index, true)
    return
  }

  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return
  const from = openAt.value ?? focusedIndex()
  const next = step(from, key === 'ArrowRight' ? 1 : -1)
  if (next === null) return
  event.preventDefault()
  if (openAt.value !== null) show(next, true)
  else buttons.value[next]?.focus()
}

/** Which top-level button has the focus, when one of them does. */
function focusedIndex(): number | null {
  const index = buttons.value.findIndex((element) => element === document.activeElement)
  return index === -1 ? (reachable.value[0] ?? null) : index
}

/*
 * A press outside the bar takes its menu down. The open menu is rendered within
 * the bar, so the bar alone answers for both — and a press on a menu the bar
 * does not own, a pane's for instance, is properly outside and closes this one
 * rather than standing beside it.
 */
function onPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target || bar.value?.contains(target)) return
  hide(false)
}

watch(openAt, (index) => {
  if (index !== null) window.addEventListener('pointerdown', onPointerDown, true)
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
  <div
    ref="bar"
    class="dc-shell dc-menubar"
    role="menubar"
    :data-dc-theme="theme"
    :aria-label="label ?? 'Main menu'"
    :style="style"
    @keydown="onKeydown"
  >
    <button
      v-for="(menu, index) in menus"
      :key="menu.id ?? menu.label ?? index"
      :ref="(element) => { if (element) buttons[index] = element as HTMLElement }"
      type="button"
      class="dc-menubar__item"
      role="menuitem"
      aria-haspopup="menu"
      :aria-expanded="openAt === index"
      :aria-disabled="menu.disabled ? 'true' : undefined"
      :disabled="menu.disabled"
      :data-dc-menu="menu.id ?? menu.label"
      :tabindex="index === (reachable[0] ?? 0) ? 0 : -1"
      @click="toggle(index)"
      @mouseenter="onEnter(index)"
    >
      {{ menu.label }}
    </button>

    <!-- Keyed by which menu is open, so moving along the bar puts up a fresh
         one rather than re-using the last with different items in it — which
         would leave the focus on an item that is no longer there. -->
    <MenuList
      v-if="openAt !== null && anchor"
      :key="openAt"
      :items="menus[openAt]?.items ?? []"
      :at="anchor"
      :label="menus[openAt]?.label"
      :autofocus="byKey"
      @choose="choose"
      @dismiss="hide(true)"
    />
  </div>
</template>

<style scoped>
/*
 * Two classes rather than one: `.dc-shell` is what brings the palette, and it
 * also says "fill the box you are given", which a bar must not do. Doubling up
 * the selector settles that whichever stylesheet the host loads first.
 */
.dc-menubar.dc-shell {
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  align-items: stretch;
  gap: 2px;
  padding: 3px 6px;
  border-bottom: 1px solid var(--dc-line);
  background: var(--dc-bg-2);
}

.dc-menubar__item {
  padding: 4px 10px;
  border: none;
  border-radius: var(--dc-radius-sm);
  background: transparent;
  color: var(--dc-fg-1);
  font: inherit;
  font-size: var(--dc-text-meta);
  cursor: default;
}

.dc-menubar__item:hover:not([disabled]),
.dc-menubar__item:focus-visible {
  background: var(--dc-bg-3, var(--dc-accent-bg));
  color: var(--dc-fg-0);
  outline: none;
}

.dc-menubar__item[aria-expanded='true'] {
  background: var(--dc-accent-bg);
  color: var(--dc-fg-0);
}

.dc-menubar__item[disabled] {
  color: var(--dc-fg-3);
}
</style>
