import {IItem} from "./Grid";

export interface IElementFactory {
    (element: IItem, position: {x: number, y: number, width: number, height: number}): any;
}