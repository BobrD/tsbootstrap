import {IItem} from "./Grid";

export interface IItemProvider {
    getItems(offset: number, count: number): Promise<IItem[]>;

    onReset(fn: () => void);
}