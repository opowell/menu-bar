/*
 * The stylesheet is not imported here: a CSS import from the type-bearing
 * entry point ends up in the emitted `.d.ts` as a module consumers cannot
 * resolve. Built output collects every component's rules into `style.css`.
 */
export { default as MenuBar } from './components/MenuBar.vue'
export { default as MenuButton } from './components/MenuButton.vue'
export { default as MenuList } from './components/MenuList.vue'

export { isChoosable } from './menu/types'
export type { MenuAnchor, MenuItemDef } from './menu/types'
