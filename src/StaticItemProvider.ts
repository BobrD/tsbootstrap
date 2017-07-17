import {IItemProvider} from "./IItemProvider";
import {IItem} from "./Grid";

export class StaticItemProvider implements IItemProvider {
    private _items: IItem[];

    private _onResetCallback = () => {};

    setItems(items: IItem[]) {
        this._items = items;

        this._onResetCallback();
    }
    onReset(fn: () => void) {
        this._onResetCallback = fn;
    }

    getItems(offset: number, count: number): Promise<IItem[]> {
        return Promise.resolve(this._items.slice(offset, offset + count));
    }
}