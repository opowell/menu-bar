import { defineComponent as V, ref as m, computed as R, onMounted as G, watch as O, onBeforeUnmount as W, resolveComponent as J, openBlock as f, createElementBlock as b, normalizeStyle as j, Fragment as I, renderList as U, toDisplayString as P, createCommentVNode as X, createElementVNode as N, createBlock as z, nextTick as T } from "vue";
const H = (i) => i.separator !== !0 && i.heading !== !0 && i.disabled !== !0, Q = ["aria-label"], Y = ["role", "aria-label"], Z = ["data-dc-item"], ee = {
  key: 0,
  class: "dc-menu__rule",
  role: "separator"
}, te = ["role", "aria-checked", "aria-haspopup", "aria-expanded", "aria-disabled", "disabled", "data-dc-item", "onClick", "onMouseenter"], ne = {
  class: "dc-menu__mark",
  "aria-hidden": "true"
}, le = { class: "dc-menu__label dc-truncate" }, ae = {
  key: 0,
  class: "dc-menu__key dc-mono"
}, oe = {
  key: 1,
  class: "dc-menu__more",
  "aria-hidden": "true"
}, ue = /* @__PURE__ */ V({
  __name: "MenuList",
  props: {
    items: {},
    at: {},
    label: {},
    autofocus: { type: Boolean }
  },
  emits: ["choose", "dismiss"],
  setup(i, { expose: A, emit: p }) {
    const a = i, k = p, g = m(null), w = m([]), o = m(null), s = m(null), y = m(null), D = m(!1), $ = R(
      () => a.items.flatMap((e, t) => H(e) ? [t] : [])
    ), _ = R(() => {
      const e = [{ entries: [] }];
      return a.items.forEach((t, r) => {
        t.heading ? e.push({ heading: t, entries: [] }) : e[e.length - 1]?.entries.push({ item: t, index: r });
      }), e.filter((t) => t.entries.length > 0);
    }), M = m({ x: a.at.x, y: a.at.y });
    async function c() {
      M.value = { x: a.at.x, y: a.at.y }, await T();
      const e = g.value?.getBoundingClientRect();
      if (!e) return;
      const t = 8;
      let r = a.at.x, d = a.at.y;
      if (r + e.width > window.innerWidth - t) {
        const x = a.at.mirrorX === void 0 ? null : a.at.mirrorX - e.width;
        r = x !== null && x >= t ? x : window.innerWidth - e.width - t;
      }
      d + e.height > window.innerHeight - t && (d = window.innerHeight - e.height - t), M.value = { x: Math.max(t, r), y: Math.max(t, d) };
    }
    const h = R(() => ({ left: `${M.value.x}px`, top: `${M.value.y}px` }));
    function C(e) {
      o.value = e, e !== null && T(() => w.value[e]?.focus());
    }
    function L(e, t) {
      const r = $.value;
      if (r.length === 0) return null;
      if (e === null) return t === 1 ? r[0] ?? null : r[r.length - 1] ?? null;
      const d = r.indexOf(e);
      return d === -1 ? r[0] ?? null : r[(d + t + r.length) % r.length] ?? null;
    }
    function B(e, t) {
      if (!a.items[e]?.items?.length) return;
      const d = w.value[e]?.getBoundingClientRect(), x = g.value?.getBoundingClientRect();
      !d || !x || (y.value = { x: x.right - 4, y: d.top - 4, mirrorX: x.left + 4 }, s.value = e, D.value = t);
    }
    function E(e) {
      const t = s.value;
      s.value = null, y.value = null, e && t !== null && C(t);
    }
    function n(e) {
      const t = a.items[e];
      if (!(!t || !H(t))) {
        if (t.items?.length) {
          B(e, !0);
          return;
        }
        k("choose", t);
      }
    }
    function u(e) {
      const t = e.key;
      if (t === "Escape") {
        e.preventDefault(), e.stopPropagation(), s.value !== null ? E(!0) : k("dismiss");
        return;
      }
      if (t === "ArrowDown" || t === "ArrowUp") {
        e.preventDefault(), e.stopPropagation(), E(!1), C(L(o.value, t === "ArrowDown" ? 1 : -1));
        return;
      }
      if (t === "Home" || t === "End") {
        e.preventDefault(), e.stopPropagation(), E(!1), C(L(null, t === "Home" ? 1 : -1));
        return;
      }
      if (t === "ArrowRight") {
        const r = o.value;
        r !== null && a.items[r]?.items?.length && (e.preventDefault(), e.stopPropagation(), B(r, !0));
        return;
      }
      if (t === "ArrowLeft") {
        s.value !== null && (e.preventDefault(), e.stopPropagation(), E(!0));
        return;
      }
      if (t === "Enter" || t === " ") {
        const r = o.value;
        if (r === null) return;
        e.preventDefault(), e.stopPropagation(), n(r);
      }
    }
    function l(e) {
      const t = a.items[e];
      !t || !H(t) || (s.value !== null && s.value !== e && E(!1), C(e), t.items?.length && B(e, !1));
    }
    return G(() => {
      c(), a.autofocus && C(L(null, 1));
    }), O(() => a.at, c, { deep: !0 }), O(() => a.items, () => void c(), { deep: !0 }), W(() => {
      s.value = null;
    }), A({ root: g }), (e, t) => {
      const r = J("MenuList", !0);
      return f(), b("div", {
        ref_key: "root",
        ref: g,
        class: "dc-menu",
        role: "menu",
        "aria-label": i.label,
        style: j(h.value),
        onKeydown: u
      }, [
        (f(!0), b(I, null, U(_.value, (d, x) => (f(), b("div", {
          key: `${x}-${d.heading?.label ?? ""}`,
          class: "dc-menu__group",
          role: d.heading ? "group" : "none",
          "aria-label": d.heading?.label
        }, [
          d.heading ? (f(), b("div", {
            key: 0,
            class: "dc-menu__heading dc-truncate",
            "aria-hidden": "true",
            "data-dc-item": d.heading.id
          }, P(d.heading.label), 9, Z)) : X("", !0),
          (f(!0), b(I, null, U(d.entries, ({ item: v, index: K }) => (f(), b(I, {
            key: v.id ?? `${K}-${v.label ?? ""}`
          }, [
            v.separator ? (f(), b("div", ee)) : (f(), b("button", {
              key: 1,
              ref_for: !0,
              ref: (S) => {
                S && (w.value[K] = S);
              },
              type: "button",
              class: "dc-menu__item",
              role: v.checked === void 0 ? "menuitem" : "menuitemcheckbox",
              "aria-checked": v.checked === void 0 ? void 0 : v.checked,
              "aria-haspopup": v.items?.length ? "menu" : void 0,
              "aria-expanded": v.items?.length ? s.value === K : void 0,
              "aria-disabled": v.disabled ? "true" : void 0,
              disabled: v.disabled,
              "data-dc-item": v.id,
              tabindex: "-1",
              onClick: (S) => n(K),
              onMouseenter: (S) => l(K)
            }, [
              N("span", ne, P(v.checked ? "✓" : ""), 1),
              N("span", le, P(v.label), 1),
              v.shortcut ? (f(), b("span", ae, P(v.shortcut), 1)) : v.items?.length ? (f(), b("span", oe, "›")) : X("", !0)
            ], 40, te))
          ], 64))), 128))
        ], 8, Y))), 128)),
        s.value !== null && y.value ? (f(), z(r, {
          key: s.value,
          items: i.items[s.value]?.items ?? [],
          at: y.value,
          label: i.items[s.value]?.label,
          autofocus: D.value,
          onChoose: t[0] || (t[0] = (d) => k("choose", d)),
          onDismiss: t[1] || (t[1] = (d) => E(!0))
        }, null, 8, ["items", "at", "label", "autofocus"])) : X("", !0)
      ], 44, Q);
    };
  }
}), F = (i, A) => {
  const p = i.__vccOpts || i;
  for (const [a, k] of A)
    p[a] = k;
  return p;
}, q = /* @__PURE__ */ F(ue, [["__scopeId", "data-v-9b1413fa"]]), re = ["data-dc-theme", "aria-label"], ie = ["aria-expanded", "aria-disabled", "disabled", "data-dc-menu", "tabindex", "onClick", "onMouseenter"], se = /* @__PURE__ */ V({
  __name: "MenuBar",
  props: {
    menus: {},
    label: {},
    accent: {},
    tokens: {},
    theme: { default: "minimal" }
  },
  emits: ["choose"],
  setup(i, { emit: A }) {
    const p = i, a = R(() => {
      if (!(!p.accent && !p.tokens))
        return { ...p.tokens, ...p.accent ? { "--dc-accent": p.accent } : {} };
    }), k = A, g = m(null), w = m([]), o = m(null), s = m(null), y = m(!1), D = R(
      () => p.menus.flatMap((n, u) => H(n) ? [u] : [])
    );
    function $(n, u) {
      const l = w.value[n]?.getBoundingClientRect(), e = p.menus[n];
      !l || !e || !H(e) || (s.value = { x: l.left, y: l.bottom + 2, mirrorX: l.right }, o.value = n, y.value = u);
    }
    function _(n) {
      const u = o.value;
      o.value = null, s.value = null, n && u !== null && w.value[u]?.focus();
    }
    function M(n) {
      o.value === n ? _(!0) : $(n, !1);
    }
    function c(n) {
      o.value === null || o.value === n || $(n, !1);
    }
    function h(n, u) {
      const l = D.value;
      if (l.length === 0) return null;
      if (n === null) return u === 1 ? l[0] ?? null : l[l.length - 1] ?? null;
      const e = l.indexOf(n);
      return e === -1 ? l[0] ?? null : l[(e + u + l.length) % l.length] ?? null;
    }
    function C(n) {
      const u = n.key;
      if (u === "Escape") {
        if (o.value === null) return;
        n.preventDefault(), _(!0);
        return;
      }
      if (u === "ArrowDown" && o.value === null) {
        const t = L();
        if (t === null) return;
        n.preventDefault(), $(t, !0);
        return;
      }
      if (u !== "ArrowLeft" && u !== "ArrowRight") return;
      const l = o.value ?? L(), e = h(l, u === "ArrowRight" ? 1 : -1);
      e !== null && (n.preventDefault(), o.value !== null ? $(e, !0) : w.value[e]?.focus());
    }
    function L() {
      const n = w.value.findIndex((u) => u === document.activeElement);
      return n === -1 ? D.value[0] ?? null : n;
    }
    function B(n) {
      const u = n.target;
      !u || g.value?.contains(u) || _(!1);
    }
    O(o, (n) => {
      n !== null ? window.addEventListener("pointerdown", B, !0) : window.removeEventListener("pointerdown", B, !0);
    }), W(() => window.removeEventListener("pointerdown", B, !0));
    function E(n) {
      _(!0), n.action?.(), k("choose", n);
    }
    return (n, u) => (f(), b("div", {
      ref_key: "bar",
      ref: g,
      class: "dc-shell dc-menubar",
      role: "menubar",
      "data-dc-theme": i.theme,
      "aria-label": i.label ?? "Main menu",
      style: j(a.value),
      onKeydown: C
    }, [
      (f(!0), b(I, null, U(i.menus, (l, e) => (f(), b("button", {
        key: l.id ?? l.label ?? e,
        ref_for: !0,
        ref: (t) => {
          t && (w.value[e] = t);
        },
        type: "button",
        class: "dc-menubar__item",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": o.value === e,
        "aria-disabled": l.disabled ? "true" : void 0,
        disabled: l.disabled,
        "data-dc-menu": l.id ?? l.label,
        tabindex: e === (D.value[0] ?? 0) ? 0 : -1,
        onClick: (t) => M(e),
        onMouseenter: (t) => c(e)
      }, P(l.label), 41, ie))), 128)),
      o.value !== null && s.value ? (f(), z(q, {
        key: o.value,
        items: i.menus[o.value]?.items ?? [],
        at: s.value,
        label: i.menus[o.value]?.label,
        autofocus: y.value,
        onChoose: E,
        onDismiss: u[0] || (u[0] = (l) => _(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : X("", !0)
    ], 44, re));
  }
}), me = /* @__PURE__ */ F(se, [["__scopeId", "data-v-d73f53ad"]]), ce = ["aria-label", "aria-expanded", "disabled"], de = { "aria-hidden": "true" }, fe = /* @__PURE__ */ V({
  __name: "MenuButton",
  props: {
    items: {},
    label: {},
    glyph: { default: "⋯" }
  },
  emits: ["choose"],
  setup(i, { emit: A }) {
    const p = A, a = m(null), k = m(null), g = m(null), w = m(!1), o = R(() => g.value !== null);
    function s(c) {
      const h = a.value?.getBoundingClientRect();
      h && (g.value = { x: h.left, y: h.bottom + 4, mirrorX: h.right }, w.value = c);
    }
    function y(c) {
      g.value = null, c && a.value?.focus();
    }
    function D() {
      o.value ? y(!0) : s(!1);
    }
    function $(c) {
      c.key !== "ArrowDown" || o.value || (c.preventDefault(), s(!0));
    }
    function _(c) {
      const h = c.target;
      h && (a.value?.contains(h) || k.value?.root?.contains(h) || y(!1));
    }
    O(o, (c) => {
      c ? window.addEventListener("pointerdown", _, !0) : window.removeEventListener("pointerdown", _, !0);
    }), W(() => window.removeEventListener("pointerdown", _, !0));
    function M(c) {
      y(!0), c.action?.(), p("choose", c);
    }
    return (c, h) => (f(), b(I, null, [
      N("button", {
        ref_key: "trigger",
        ref: a,
        type: "button",
        class: "dc-menu-button",
        "aria-label": i.label,
        "aria-haspopup": "menu",
        "aria-expanded": o.value,
        disabled: i.items.length === 0,
        onClick: D,
        onKeydown: $
      }, [
        N("span", de, P(i.glyph), 1)
      ], 40, ce),
      g.value ? (f(), z(q, {
        key: 0,
        ref_key: "menu",
        ref: k,
        items: i.items,
        at: g.value,
        label: i.label,
        autofocus: w.value,
        onChoose: M,
        onDismiss: h[0] || (h[0] = (C) => y(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : X("", !0)
    ], 64));
  }
}), he = /* @__PURE__ */ F(fe, [["__scopeId", "data-v-48f5ada5"]]);
export {
  me as MenuBar,
  he as MenuButton,
  q as MenuList,
  H as isChoosable
};
