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
    label?: string;
    /**
     * Distinguishes this item from the others — for a host reading the choose
     * event, and for a test naming what it clicked.
     */
    id?: string;
    /** Run when the item is chosen. An item with neither this nor `items` is inert. */
    action?: () => void;
    /** A menu of its own, opened from this item. */
    items?: MenuItemDef[];
    disabled?: boolean;
    /**
     * The key that also runs this command, shown at the right of the item.
     * Display only: binding it is the host's business, since only the host knows
     * what else the key might mean.
     */
    shortcut?: string;
    /** Shows a mark beside the label — for an item that names a current state. */
    checked?: boolean;
    /** A rule between groups of items. Nothing else on the item is read. */
    separator?: boolean;
    /**
     * Names the items that follow rather than being one of them: a heading over
     * the group that runs to the next heading or to the end of the menu.
     *
     * It is what tells two groups of ticked choices apart when they are about
     * different things. The view a panel is showing and the shape of the space
     * around it are each a short list of names with one of them ticked, and
     * nothing in the shape of either says which is which — side by side they
     * read as one list twice as long, and a submenu holding one of them only
     * moves it beside the other. A name over each says it once. Only `label` is
     * read.
     *
     * A menu whose items are all about one thing wants none: naming the only
     * group there is says nothing the items under it did not already say.
     */
    heading?: boolean;
}
/** An item that can be reached and chosen — no rule, no heading, not disabled. */
export declare const isChoosable: (item: MenuItemDef) => boolean;
/** Where a menu's top-left corner goes, in viewport coordinates. */
export interface MenuAnchor {
    x: number;
    y: number;
    /**
     * Put the menu's *right* edge here instead when it would otherwise run off
     * the screen — so a submenu flips to the other side of its parent rather
     * than covering it.
     */
    mirrorX?: number;
}
