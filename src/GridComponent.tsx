import {Grid, IItem} from "./Grid";
import {IItemProvider} from "./ItemProvider";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {serverSide} from "./isServerSide";

export interface IElementFactory {
    (element: IItem, position: {x: number, y: number, width: number, height: number}): any;
}

export interface IGridComponentProps {
    provider: IItemProvider,
    elementFactory: IElementFactory,
    base: number
}

const makeCancelable = (promise) => {
    let hasCanceled_ = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
            error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
};

export class GridComponent extends React.Component<IGridComponentProps, any> {

    private _grid: Grid;

    private _scroll = serverSide ? 1000 : window.scrollY;

    private _loadedCount = 0;

    private _parent;

    private _noHoverTimer;

    private _loadItemsPromise: {promise: Promise<any>, cancel: () => void} = makeCancelable(Promise.resolve());

    state = {
        top: 0,
        bottom: 100
    };

    componentWillMount() {
        this._grid = new Grid(this.props.base);

        this.props.provider.onReset(this.onReset);
        this.props.provider.onUpdate(this.onUpdate);

        if (serverSide) {
            this.updateState();
        }
    }

    componentDidMount() {
        this._parent = ReactDOM.findDOMNode(this).parentNode;

        this.updateState();

        if (serverSide) {
            return;
        }

        window.addEventListener('resize', this.updateState);
        window.addEventListener('scroll', this.onScroll);
        window.addEventListener('scroll', this.disableHoverOnScroll);
    }

    componentWillReceiveProps({provider, base, elementFactory}: IGridComponentProps) {
        if (provider === this.props.provider) {
            provider.onReset(this.onReset);
            provider.onUpdate(this.onUpdate);
        }

        if (base !== this.props.base) {
            this._grid = new Grid(base);

            this.updateState();
        }

        if (elementFactory !== this.props.elementFactory) {
            this.updateState();
        }
    }

    componentWillUnmount() {
        clearTimeout(this._noHoverTimer);

        if (serverSide) {
            return;
        }

        window.removeEventListener('resize', this.updateState);
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('scroll', this.disableHoverOnScroll);

        // remove on reset listener
        this.props.provider.onReset(() => {});

        this._loadItemsPromise.cancel();
    }

    render() {
        const {top, bottom} = this.state;

        return (
            <div
                ref='container'
                className="__bookie-grid"
                style={{
                    height: `${this._grid.rows.length * this.baseInPixels}px`,
                    position: 'relative'
                }}
            >
                {this.createCells(top, bottom)}
            </div>
        );
    }

    private getCurrentScrollY() {
        if (serverSide) {
            return 1000;
        }

        return window.scrollY;
    }

    private onScroll = () => {
        if (Math.abs(this._scroll - this.getCurrentScrollY()) > this.baseInPixels / 2) {
            this._scroll = this.getCurrentScrollY();

            this.updateState();
        }
    };

    private updateState = () => {
        const {top, bottom} = this.computeRenderIndex();

        if (bottom >= this._grid.rows.length) {
            if (serverSide) {
                this.load(100);

                this.setState({top, bottom});
            } else {
                (this.load(100) as Promise<any>).then(() => {
                    this.setState({top, bottom});
                }).catch(() => {});
            }

            return;
        }

        this.setState({top, bottom});
    };

    private get baseInPixels() {
        return this._parent ? this._parent.clientWidth / this.props.base : 0;
    }

    private load(count: number): Promise<any> | void {
        // cancel prev promise
        this._loadItemsPromise.promise.catch(() => {});

        this._loadItemsPromise.cancel();

        if (serverSide) {
            const items = this.props.provider.getItems(this._loadedCount,  count);

            this.handleLoaded(items);
        } else {
            // start async load
            this._loadItemsPromise = makeCancelable(this.props.provider.getItems(this._loadedCount,  count));

            return this._loadItemsPromise.promise.then(this.handleLoaded);
        }
    }

    private handleLoaded = (items) =>
    {
        this._loadedCount += items.length;

        items.forEach(item => this._grid.push(item));

        this.forceUpdate();
    };

    // todo optimize me
    private createCells(top, bottom): React.ReactElement<any>[] {
        const placed = [];

        const cellElements = [];
        this._grid.rows.slice(top, top + bottom).forEach((row, rowIndex) => {

            rowIndex += top;

            row.cells.forEach((cell, cellIndex) => {
                const {item} = cell;

                if (
                    void 0 === item ||
                    void 0 !== item && -1 !== placed.indexOf(item.key)
                ) {
                    return;
                }

                const [[itemFirstRow, itemFirstCell]] = item.positions;

                if (void 0 !== item && itemFirstRow !== rowIndex || itemFirstCell !== cellIndex) {
                    return;
                }

                placed.push(item.key);

                const x = cellIndex * this.baseInPixels;
                const y = rowIndex * this.baseInPixels;
                const width = item.width * this.baseInPixels;
                const height = item.height * this.baseInPixels;

                cellElements.push(<div
                    className="__bookie-grid__cell-container"
                    key={item.key}
                    style={{
                        top: `${y}px`,
                        left: `${x}px`,
                        position: 'absolute',
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                >{this.props.elementFactory(item, {x, y, width, height})}</div>);
            });
        });

        return cellElements;
    }

    private disableHoverOnScroll = () => {
        clearTimeout(this._noHoverTimer);

        (this.refs.container as HTMLDivElement).style.pointerEvents = 'none';

        this._noHoverTimer = setTimeout(() => {
            (this.refs.container as HTMLDivElement).style.pointerEvents = 'auto';
        },100);
    };

    private computeRenderIndex(): {top: number, bottom: number} {
        if (serverSide) {
            return {top: 0, bottom: 5};
        }

        const firstTopVisibleRow = Math.ceil((this.getCurrentScrollY() - (this.refs.container as HTMLDivElement).offsetTop) / this.baseInPixels) - 1;

        const viewPort = Math.max(4, Math.ceil(window.innerHeight / this.baseInPixels));

        const bottomVisibleRow = firstTopVisibleRow + viewPort;

        const topRowForRender = Math.max(0, firstTopVisibleRow - viewPort);

        const bottomRowForRender = bottomVisibleRow + viewPort;

        return {top: topRowForRender, bottom: bottomRowForRender};
    }

    private onUpdate = (items: IItem[]) => {
        this._grid.update(items);

        this.forceUpdate();
    };

    private onReset = () => {
        this._loadedCount = 0;

        this._grid.clear();

        this.updateState();
    };
}
