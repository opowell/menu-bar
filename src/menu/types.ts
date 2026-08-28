/**
 * The menu model: a tree of items, the same shape at every level.
 *
 * A menu is data rather than markup, so the thing that owns a command — a
 * window, a shell, a host application — can describe what it offers without
 * knowing how a menu is drawn, and the same description can drive a menu bar,
 * a pane's own menu, or a command palette.
 */

/** One entry in a menu: a command, a submenu, or a rule between them. */
export interface MenuItemDef {
  /** What the item says. Ignored on a separator. */
  label?: string
  /**
   * Distinguishes this item from the others — for a host reading the choose
   * event, and for a test naming what it clicked.
   */
  id?: string
  /** Run when the item is chosen. An item with neither this nor `items` is inert. */
  action?: () => void
  /** A menu of its own, opened from this item. */
  items?: MenuItemDef[]
  disabled?: boolean
  /**
   * The key that also runs this command, shown at the right of the item.
   * Display only: binding it is the host's business, since only the host knows
   * what else the key might mean.
   */
  shortcut?: string
  /** Shows a mark beside the label — for an item that names a current state. */
  checked?: boolean
  /** A rule between groups of items. Nothing else on the item is read. */
  separator?: boolean
}

/** An item that can be reached and chosen — neither a rule nor disabled. */
export const isChoosable = (item: MenuItemDef): boolean =>
  item.separator !== true && item.disabled !== true

/** Where a menu's top-left corner goes, in viewport coordinates. */
export interface MenuAnchor {
  x: number
  y: number
  /**
   * Put the menu's *right* edge here instead when it would otherwise run off
   * the screen — so a submenu flips to the other side of its parent rather
   * than covering it.
   */
  mirrorX?: number
}
