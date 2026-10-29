# menu-bar

> **Pre-alpha.** Breaking changes go out freely, in any release, with no
> deprecation period and no migration path. Pin an exact tag, and read the
> diff before moving to the next one.

`<MenuBar>` is the application menu the window's own menus are built out of: a
row of names, each opening a menu of any depth.

```vue
<script setup lang="ts">
import { MenuBar } from 'menu-bar'
import type { MenuItemDef } from 'menu-bar'

const menus: MenuItemDef[] = [
  {
    label: 'File',
    items: [
      { id: 'new', label: 'New panel', shortcut: 'N', action: addPanel },
      { separator: true },
      { label: 'Open recent', items: [{ label: 'items.json', disabled: true }] },
      { separator: true },
      { id: 'close-all', label: 'Close every panel', disabled: !panels.length, action: closeAll },
    ],
  },
  { label: 'Help', items: [{ label: 'About', checked: true }] },
]
</script>

<template>
  <MenuBar :menus="menus" @choose="(item) => track(item.id)" />
</template>
```

A menu is data: a `label`, an `action`, `items` for a submenu, and `disabled`,
`checked`, `shortcut`, `separator` or `heading` as needed. `shortcut` is
display only — the hint at the right of an item — because only the host knows
what else the key might mean. `heading` names the items that follow it rather
than being one of them, which is what tells two groups of ticked choices apart
when they are about different things; it is drawn as a `role="group"` around
what it named, so the name is heard once and the keyboard steps over it.

It behaves the way a menu bar does. With one menu up, moving the pointer along
the bar swaps to the next rather than asking for another click. The arrow keys
walk the bar at any depth, up and down move within a menu and skip whatever is
disabled, right opens a submenu and left closes it, Escape closes, and a press
anywhere else takes the whole thing down.

Menus are `position: fixed` and measured once they are up, so one opened near
an edge flips to the other side of what opened it rather than being cut off by
the window it belongs to — which hides its own overflow.

`<MenuButton>` is the same menu behind a single button, which is what a pane
of [window-frame](https://github.com/opowell/window-frame) uses, and
`<MenuList>` is the menu itself, for a host that opens it from a control of
its own. All three take the `theme`, `accent` and `tokens` every `.dc-shell`
component takes — see [themes](https://github.com/opowell/themes).

## Install

```bash
npm install github:opowell/menu-bar#v0.1.0
```

`vue` is a peer dependency, and so is
[`themes`](https://github.com/opowell/themes), whose tokens the menus resolve
against: install it beside this package. It is a peer rather than a dependency
because pnpm 11 refuses a git-hosted package that another package pulls in
(`blockExoticSubdeps`); one the app lists itself is fine.

```bash
npm install github:opowell/themes#v0.1.0
```

## Stylesheets

The package's stylesheet holds the menus' own rules and nothing else, so a
page loads the tokens once beside it:

```ts
import 'themes/tokens.css'
import 'menu-bar/style.css'
```

## Development

```bash
npm install
npm run lint
npm run typecheck      # vue-tsc
npm run build          # dist/ + declarations
```

The menus' behaviour is covered where it is used, by the browser tests of
[window-frame](https://github.com/opowell/window-frame) and
[appfr](https://github.com/opowell/appfr).

## Releasing

There is no registry in the middle: a consumer names a tag of this repository
and gets `dist/` out of the tarball, which is why `dist/` is committed. So a
release is a tag, and `npm version` cuts it; `npm run release` publishes it:

```bash
git commit -m 'What changed'   # the work, without dist/
npm version minor              # lint, typecheck, build, commit, tag
npm run release                # git push origin main --follow-tags
```

`npm version` refuses a dirty tree, so the change lands as its own commit first
and the version commit carries only the bump and the artifacts it implies. The
push is its own command, run on purpose: everything before it can be undone
with a `git reset` and `git tag -d`, and a consumer can only name the tag once
it is on the remote.

Versions are pre-1.0 and the minor is where breaking goes. CI rebuilds on every
push and fails if the committed `dist/` is not what `src/` builds.
