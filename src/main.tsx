import * as React from 'react';
import {render} from 'react-dom';
import get = Reflect.get;

const mountNode = document.getElementById('app');


interface IItem {
    v: number;
    h: number;
    i: number;

    positions: [number, number][]
}

class Cell {
    private _item?: IItem;

    set(item: IItem) {
        if (void 0 !== this._item) {
            throw new Error('Cell already filled.');
        }

        this._item = item;
    }

    get(): IItem {
        return this._item;
    }

    empty(): boolean {
        return void 0 === this._item;
    }
}

class Row  {
    private _cells: Cell[] = [];

    private _full = false;

    private _emptyCells = [];

    constructor(private _countCell: number) {
        [...new Array(_countCell)].forEach((_, i) => {
            this._cells.push(new Cell);
            this._emptyCells.push(i);
        });
    }

    isFull() {
        return this._full;
    }

    get cells(): Cell[] {
        return this._cells;
    }

    get emptyCellIndex(): number[] {
        return this._emptyCells;
    }

    canPlace(item: IItem, index: number): boolean {
        if (index + item.h > this._countCell) { // overflow
            return false;
        }

        for (let i = 0; i < item.h; i++, index++) {
            if (-1 === this._emptyCells.indexOf(index)) {
                return false;
            }
        }

        return true;
    }

    place(item: IItem, cellIndex: number) {
        this._cells[cellIndex].set(item);

        this._emptyCells = this._emptyCells.filter(i => i !== cellIndex);

        this._full = 0 === this._emptyCells.length;
    }
}

interface IPosition {
    rowIndex: number;
    cellIndex: number;
}

class Grid {
    private _rows: Row[] = [];

    constructor(private _countCells: number) {
    }

    get rows() {
        return this._rows;
    }

    push(item: IItem) {
        let position;

        while (void 0 === (position = this.findRowAndCell(item))) {
            this.createRow();
        }

        this.insertInto(position, item);
    }

    private insertInto({rowIndex, cellIndex}: IPosition, item: IItem) {
        for (let i = 0; i < item.v; i++, rowIndex++) {
            for (let ii = cellIndex; ii < cellIndex + item.h; ii++) {
                item.positions.push([rowIndex, ii]);

                this._rows[rowIndex].place(item, ii);
            }
        }
    }

    private findRowAndCell(item: IItem): IPosition | undefined {
        for (let rowIndex = 0; rowIndex < this._rows.length; rowIndex++) {
            const row = this._rows[rowIndex];

            if (row.isFull()) {
                continue; // row already contains cells with items
            }

            for (let cellIndex of row.emptyCellIndex) {
                if (row.canPlace(item, cellIndex) && this.bottomRowsCanPlaceItem(rowIndex, cellIndex, item)) {
                    return {rowIndex, cellIndex};
                }
            }
        }
    }

    private bottomRowsCanPlaceItem(topRowIndex: number, cellIndex: number, item: IItem) {
        let bottomRowIndex = topRowIndex;

        let countRow = item.v;

        while (--countRow) {
            if (!this.rowCanPlaceItemAtIndex(++bottomRowIndex, cellIndex, item)) {
                return false;
            }
        }

        return true;
    }

    private rowCanPlaceItemAtIndex(rowIndex: number, cellIndex: number, item: IItem) {
        if (rowIndex >= this._rows.length) {
            this.createRow();
        }

        return this._rows[rowIndex].canPlace(item, cellIndex);
    }


    private createRow() {
        this._rows.push(new Row(this._countCells));
    }
}

const rand = (from, to) => Math.floor(Math.random() * to) + from;

const range = count => [...new Array(count)].map((_, i) => i);

const generate = (count: number): IItem[] => range(count).map(i => ({v: rand(1, 2), h: rand(1, 2), i, positions: []}));


const items = generate(10000);

const getStyle = (item: IItem, base: number, rowIndex: number, cellIndex: number) => {
    return {
        top: `${rowIndex * base}px`,
        left: `${cellIndex * base}px`,
        position: 'absolute',
        width: `${item.h * base}px`,
        height: `${item.v * base}px`,
        lineHeight: `${item.v * base}px`
    }
};

const setStyles = (styles: Object, element: HTMLDivElement) => {
    Object.keys(styles).forEach(name => {
        element.style[name] = styles[name];
    })
};

// const grid = new Grid(4);
//
// items.forEach(item => grid.push(item));
//
// this._grid = grid;
//
// drawGrid(grid, mountNode);
//
// const print = (grid: Grid) => {
//     grid.rows.forEach((row, rowIndex) => {
//         const cells = row.cells.map(cell => cell.empty() ? '   o   ' : `${cell.get().i}::${cell.get().h}:${cell.get().v}`);
//
//         console.log(`row ${rowIndex}: ${cells.join(', ')}`);
//     })
// };

interface CellElement extends HTMLDivElement {
    __item: IItem;
}

class GridRender {
    private _base = 100;

    private _grid: Grid;

    private _cells: CellElement[] = [];

    private _scroll = window.scrollY;

    constructor(private _mountNode: HTMLElement) {
        const grid = new Grid(4);

        items.forEach(item => grid.push(item));

        this._grid = grid;

        this._cells = this.createCells();

        ///
        document.addEventListener('resize', this.onResize);

        document.addEventListener('scroll', () => {
            if (Math.abs(this._scroll - window.scrollY) > this._base) {
                this._scroll = window.scrollY;

                this.render();
            }
        });

        this.render();
    }

    private createCells(): CellElement[] {
        const placed = [];

        const cellElements = [];

        this._grid.rows.forEach((row, rowIndex) => {
            row.cells.forEach((cell, cellIndex) => {

                const item = cell.get();

                if (
                    void 0 === item ||
                    void 0 !== item && -1 !== placed.indexOf(item.i)
                ) {
                    return;
                }

                const cellElement = document.createElement('div') as CellElement;

                cellElement.classList.add('cell');

                cellElement.innerText = `${item.i}`;

                cellElement.__item = item;

                placed.push(item.i);

                setStyles(getStyle(cell.get(), 100, rowIndex, cellIndex), cellElement);

                cellElements.push(cellElement);
            });
        });

        return cellElements;
    }

    private render() {
        this.clear();

        const {top, bottom} = this.computeRenderIndex();

        this._mountNode.style.height = `${this._grid.rows.length * this._base}px`;

        const gap = document.createElement('div');

        gap.style.width = `${top * this._base}px`;

        gap.classList.add('__gap');

        this._mountNode.appendChild(gap);

        for (const cellElement of this._cells) {
            const [row] = cellElement.__item.positions[0];

            if (row >= top && row <= bottom) {
                this._mountNode.appendChild(cellElement);
            }
        }

    }

    private onResize = () => {

    };

    private clear() {
        while (this._mountNode.firstChild) {
            this._mountNode.removeChild(this._mountNode.firstChild);
        }
    }

    private computeRenderIndex(): {top: number, bottom: number} {
        const currentScroll = window.scrollY;

        const firstTopVisibleRow = Math.ceil(currentScroll / this._base);

        const viewPort = Math.ceil(window.innerHeight / this._base);

        const bottomVisibleRow = firstTopVisibleRow + viewPort;

        const topRowForRender = Math.max(0, firstTopVisibleRow - viewPort);

        const bottomRowForRender = bottomVisibleRow + viewPort;

        return {top: topRowForRender, bottom: bottomRowForRender};
    }
}

const render = new GridRender(mountNode);
