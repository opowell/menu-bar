import type { MenuItemDef } from '../menu/types';
type __VLS_Props = {
    items: MenuItemDef[];
    /** Names the button for a screen reader, and the menu it opens. */
    label: string;
    /** The button's face. A vertical ellipsis unless the caller says otherwise. */
    glyph?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    choose: (item: MenuItemDef) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChoose?: ((item: MenuItemDef) => any) | undefined;
}>, {
    glyph: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
