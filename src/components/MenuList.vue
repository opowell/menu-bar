<script setup lang="ts">
/*
 * One level of a menu: the items, and whichever of them has opened a level of
 * its own. Recursion is the whole implementation of "a menu of any depth".
 *
 * It positions itself with `position: fixed` from viewport coordinates rather
 * than sitting inside whatever opened it. A pane's menu is otherwise clipped
 * by the float it is on, which hides its own overflow — and a menu that is
 * cut off by the window it belongs to is worse than no menu.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MenuAnchor, MenuItemDef } from '../menu/types'
import { isChoosable } from '../menu/types'

const props = defineProps<{
  items: MenuItemDef[]
  at: MenuAnchor
  label?: string
  /** Puts the focus on the first item as soon as it is up — a keyboard opening. */
  autofocus?: boolean
}>()

const emit = defineEmits<{
  /** An item was chosen. The whole menu, every level of it, should close. */
  choose: [item: MenuItemDef]
  /** This level should close, leaving whatever opened it alone. */
  dismiss: []
}>()

const root = ref<HTMLElement | null>(null)
const buttons = ref<HTMLElement[]>([])

/** The item the keyboard is on, and the one whose submenu is open. */
const activeAt = ref<number | null>(null)
const openAt = ref<number | null>(null)
const openAnchor = ref<MenuAnchor | null>(null)
const openByKey = ref(false)

/** Where a keyboard can land: not a rule, not disabled. */
const reachable = computed(() =>
  props.items.flatMap((item, index) => (isChoosable(item) ? [index] : [])),
)

/* ------------------------------------------------------------- positioning */

const placed = ref({ x: props.at.x, y: props.at.y })

/**
 * Measured once it is on screen, because where it fits depends on how big it
 * turned out to be. A menu that would run off the right flips to the other
 * side of whatever opened it when it was given something to mirror around,
 * and is otherwise pushed back inside.
 */
async function place() {
  placed.value = { x: props.at.x, y: props.at.y }
  await nextTick()
  const box = root.value?.getBoundingClientRect()
  if (!box) return

  const margin = 8
  let x = props.at.x
  let y = props.at.y

  if (x + box.width > window.innerWidth - margin) {
    const mirrored = props.at.mirrorX === undefined ? null : props.at.mirrorX - box.width
    x = mirrored !== null && mirrored >= margin ? mirrored : window.innerWidth - box.width - margin
  }
  if (y + box.height > window.innerHeight - margin) {
    y = window.innerHeight - box.height - margin
  }
  placed.value = { x: Math.max(margin, x), y: Math.max(margin, y) }
}

const style = computed(() => ({ left: `${placed.value.x}px`, top: `${placed.value.y}px` }))

/* ------------------------------------------------------------------ moving */

function focusAt(index: number | null) {
  activeAt.value = index
  if (index === null) return
  void nextTick(() => buttons.value[index]?.focus())
}

/** The next reachable item from here, wrapping around the ends. */
function step(from: number | null, by: 1 | -1): number | null {
  const order = reachable.value
  if (order.length === 0) return null
  if (from === null) return by === 1 ? (order[0] ?? null) : (order[order.length - 1] ?? null)
  const at = order.indexOf(from)
  if (at === -1) return order[0] ?? null
  return order[(at + by + order.length) % order.length] ?? null
}

/* ---------------------------------------------------------------- choosing */

function openSubmenu(index: number, byKey: boolean) {
  const item = props.items[index]
  if (!item?.items?.length) return
  const box = buttons.value[index]?.getBoundingClientRect()
  const own = root.value?.getBoundingClientRect()
  if (!box || !own) return

  // Just over the parent's edge, and level with the item that opened it.
  openAnchor.value = { x: own.right - 4, y: box.top - 4, mirrorX: own.left + 4 }
  openAt.value = index
  openByKey.value = byKey
}

function closeSubmenu(refocus: boolean) {
  const index = openAt.value
  openAt.value = null
  openAnchor.value = null
  if (refocus && index !== null) focusAt(index)
}

function activate(index: number) {
  const item = props.items[index]
  if (!item || !isChoosable(item)) return
  if (item.items?.length) {
    openSubmenu(index, true)
    return
  }
  emit('choose', item)
}

function onKeydown(event: KeyboardEvent) {
  const key = event.key
  if (key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    if (openAt.value !== null) closeSubmenu(true)
    else emit('dismiss')
    return
  }

  /*
   * Everything below belongs to the level that has the focus, and must not
   * also reach the level that opened it — an arrow key handled by a submenu
   * would otherwise bubble to its parent, which would close the submenu the
   * focus had just moved within.
   */
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    event.preventDefault()
    event.stopPropagation()
    closeSubmenu(false)
    focusAt(step(activeAt.value, key === 'ArrowDown' ? 1 : -1))
    return
  }

  if (key === 'Home' || key === 'End') {
    event.preventDefault()
    event.stopPropagation()
    closeSubmenu(false)
    focusAt(step(null, key === 'Home' ? 1 : -1))
    return
  }

  if (key === 'ArrowRight') {
    const index = activeAt.value
    if (index !== null && props.items[index]?.items?.length) {
      event.preventDefault()
      event.stopPropagation()
      openSubmenu(index, true)
    }
    // Otherwise it belongs to the menu bar above, which moves along the bar.
    return
  }

  if (key === 'ArrowLeft') {
    if (openAt.value !== null) {
      event.preventDefault()
      event.stopPropagation()
      closeSubmenu(true)
    }
    return
  }

  if (key === 'Enter' || key === ' ') {
    const index = activeAt.value
    if (index === null) return
    event.preventDefault()
    event.stopPropagation()
    activate(index)
  }
}

/**
 * Hovering moves the focus the way the arrow keys do, so the pointer and the
 * keyboard never disagree about which item the menu is on. A submenu opens on
 * hover; hovering a different item closes whatever was open.
 */
function onEnter(index: number) {
  const item = props.items[index]
  if (!item || !isChoosable(item)) return
  if (openAt.value !== null && openAt.value !== index) closeSubmenu(false)
  focusAt(index)
  if (item.items?.length) openSubmenu(index, false)
}

onMounted(() => {
  void place()
  if (props.autofocus) focusAt(step(null, 1))
})
watch(() => props.at, place, { deep: true })
watch(() => props.items, () => void place(), { deep: true })

/* A menu is transient: nothing should outlive the level that owns it. */
onBeforeUnmount(() => {
  openAt.value = null
})

/*
 * Whatever put this menu up needs to know which part of the page is *its*
 * menu, so a press on somebody else's counts as a press outside. Every level
 * below this one is rendered within this element, so one node answers for the
 * whole tree.
 */
defineExpose({ root })
</script>

<template>
  <div
    ref="root"
    class="dc-menu"
    role="menu"
    :aria-label="label"
    :style="style"
    @keydown="onKeydown"
  >
    <template
      v-for="(item, index) in items"
      :key="item.id ?? `${index}-${item.label ?? ''}`"
    >
      <div
        v-if="item.separator"
        class="dc-menu__rule"
        role="separator"
      />
      <button
        v-else
        :ref="(element) => { if (element) buttons[index] = element as HTMLElement }"
        type="button"
        class="dc-menu__item"
        :role="item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'"
        :aria-checked="item.checked === undefined ? undefined : item.checked"
        :aria-haspopup="item.items?.length ? 'menu' : undefined"
        :aria-expanded="item.items?.length ? openAt === index : undefined"
        :aria-disabled="item.disabled ? 'true' : undefined"
        :disabled="item.disabled"
        :data-dc-item="item.id"
        tabindex="-1"
        @click="activate(index)"
        @mouseenter="onEnter(index)"
      >
        <span
          class="dc-menu__mark"
          aria-hidden="true"
        >{{ item.checked ? '✓' : '' }}</span>
        <span class="dc-menu__label dc-truncate">{{ item.label }}</span>
        <span
          v-if="item.shortcut"
          class="dc-menu__key dc-mono"
        >{{ item.shortcut }}</span>
        <span
          v-else-if="item.items?.length"
          class="dc-menu__more"
          aria-hidden="true"
        >›</span>
      </button>
    </template>

    <!-- The level this one opened. It reports a choice straight through, so a
         choice anywhere closes the whole menu rather than one level of it. -->
    <MenuList
      v-if="openAt !== null && openAnchor"
      :key="openAt"
      :items="items[openAt]?.items ?? []"
      :at="openAnchor"
      :label="items[openAt]?.label"
      :autofocus="openByKey"
      @choose="emit('choose', $event)"
      @dismiss="closeSubmenu(true)"
    />
  </div>
</template>

<style scoped>
.dc-menu {
  position: fixed;
  z-index: 80;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-width: 320px;
  padding: 4px;
  border: 1px solid var(--dc-line-2);
  border-radius: var(--dc-radius);
  background: var(--dc-raised);
  color: var(--dc-raised-ink);
  box-shadow: var(--dc-shadow);
}

.dc-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: none;
  border-radius: var(--dc-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: default;
}

.dc-menu__item:hover:not([disabled]),
.dc-menu__item:focus-visible {
  background: var(--dc-accent-bg);
  outline: none;
}

.dc-menu__item[disabled] {
  color: var(--dc-fg-3);
}

/* Held even when empty, so labels line up whether or not anything is checked. */
.dc-menu__mark {
  flex: 0 0 auto;
  width: 10px;
  color: var(--dc-accent);
  font-size: 10px;
}

.dc-menu__label {
  flex: 1 1 auto;
  min-width: 0;
}

.dc-menu__key,
.dc-menu__more {
  flex: 0 0 auto;
  color: var(--dc-fg-3);
  font-size: 11px;
}

.dc-menu__rule {
  height: 1px;
  margin: 4px 6px;
  background: var(--dc-line);
}
</style>
