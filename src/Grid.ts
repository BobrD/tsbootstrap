export interface IItem {
    height: number;
    width: number;
    i: number;

    positions: [number, number][]
}

interface IPosition {
    rowIndex: number;
    cellIndex: number;
}

export class Cell {
    private _item?: IItem;

    set(item: IItem) {
        if (void 0 !== this._item) {
            throw new Error('Cell already filled.');
        }

        this._item = item;
    }

    set item(item: IItem) {
        this._item = item;
    }

    get item(): IItem | undefined {
        return this._item;
    }
}

export class Row  {
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
        if (index + item.width > this._countCell) { // overflow
            return false;
        }

        for (let i = 0; i < item.width; i++, index++) {
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

export class Grid {
    private _rows: Row[] = [];

    constructor(private _countCells: number) {
    }

    clear() {
        this._rows = [];
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
        for (let i = 0; i < item.height; i++, rowIndex++) {
            for (let ii = cellIndex; ii < cellIndex + item.width; ii++) {
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

        let countRow = item.height;

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