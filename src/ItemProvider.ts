import {IItem} from "./Grid";
import {serverSide} from "./isServerSide";

export interface IItemProvider {
    getLoadedItems(): IItem[]

    getItems(offset: number, count: number): Promise<IItem[]> | IItem[];

    onReset(fn: () => void);

    onUpdate(fn: (items: IItem[]) => void);
}

export class StaticItemProvider implements IItemProvider {
    private _items: IItem[] = [];

    private _onResetCallback = () => {};

    private _onUpdateCallback = (items: IItem[]) => {};

    setItems(items: IItem[]) {
        this._items = items;

        this._onResetCallback();
    }

    getLoadedItems() {
        return this._items;
    }

    updateItems(items: IItem[]) {
        this._items = items;

        this._onUpdateCallback(items);
    }

    onReset(fn: () => void) {
        this._onResetCallback = fn;
    }

    onUpdate(fn: (items: IItem[]) => void) {
        this._onUpdateCallback = fn;
    }

    getItems(offset: number, count: number): Promise<IItem[]> | IItem[] {
        const items = this._items.slice(offset, offset + count);

        if (serverSide) {
            return items;
        }

        return Promise.resolve(this._items.slice(offset, offset + count));
    }
}