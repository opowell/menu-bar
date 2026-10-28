import type { MenuAnchor, MenuItemDef } from '../menu/types';
type __VLS_Props = {
    items: MenuItemDef[];
    at: MenuAnchor;
    label?: string;
    /** Puts the focus on the first item as soon as it is up — a keyboard opening. */
    autofocus?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    root: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    choose: (item: MenuItemDef) => any;
    dismiss: () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChoose?: ((item: MenuItemDef) => any) | undefined;
    onDismiss?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
