import {Grid} from "./Grid";
import {IItemProvider} from "./IItemProvider";
import {IElementFactory} from "./ElementFactory";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface IGridComponentProps {
    provider: IItemProvider,
    elementFactory: IElementFactory,
    base: number
}

export class GridComponent extends React.Component<IGridComponentProps, any> {

    private _grid: Grid;

    private _scroll = window.scrollY;

    private _loadedCount = 0;

    private _parent;

    private _noHoverTimer;

    state = {
        top: 0,
        bottom: 100
    };

    componentWillMount() {
        this._grid = new Grid(this.props.base);
    }

    componentDidMount() {
        this._parent = ReactDOM.findDOMNode(this).parentNode;

        this.updateState();

        window.addEventListener('resize', this.updateState);
        window.addEventListener('scroll', this.onScroll);
        window.addEventListener('scroll', this.disableHoverOnScroll);
    }

    componentWillReceiveProps({provider}: IGridComponentProps) {
        provider.onReset(() => {
            this._loadedCount = 0;

            this._grid.clear();

            this.updateState();
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateState);
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('scroll', this.disableHoverOnScroll);
    }

    render() {
        const {top, bottom} = this.state;

        return (
            <div
                ref='container'
                className="__bookie-grid"
                style={{
                    height: `${this._grid.rows.length * this.baseInPixels}px`
                }}
            >
                {this.createCells(top, bottom)}
            </div>
        );
    }

    private onScroll = () => {
        if (Math.abs(this._scroll - window.scrollY) > this.baseInPixels) {
            this._scroll = window.scrollY;

            this.updateState();
        }
    };

    private updateState = () => {
        const {top, bottom} = this.computeRenderIndex();

        if (bottom >= this._grid.rows.length) {
            this.load(100).then(() => {
                this.setState({top, bottom});
            });

            return;
        }

        this.setState({top, bottom});
    };

    private get offsetTop() {
        return (this.refs.container as HTMLDivElement).offsetTop;
    };

    private get baseInPixels() {
        return this._parent ? this._parent.clientWidth / this.props.base : 0;
    }

    private async load(count: number) {
        const items = await this.props.provider.getItems(this._loadedCount,  count);

        this._loadedCount += items.length;

        items.forEach(item => this._grid.push(item));

        this.forceUpdate();
    }

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
                    void 0 !== item && -1 !== placed.indexOf(item.i)
                ) {
                    return;
                }

                const [[itemFirstRow, itemFirstCell]] = item.positions;

                if (void 0 !== item && itemFirstRow !== rowIndex || itemFirstCell !== cellIndex) {
                    return;
                }

                placed.push(item.i);

                const x = cellIndex * this.baseInPixels;
                const y = this.offsetTop + rowIndex * this.baseInPixels;
                const width = item.width * this.baseInPixels;
                const height = item.height * this.baseInPixels;

                cellElements.push(<div
                    className="__bookie-grid__cell-container"
                    key={item.i}
                    style={{
                        top: 0,
                        left: 0,
                        position: 'absolute',
                        transform: `translateX(${x}px) translateY(${y}px)`,
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
        const firstTopVisibleRow = Math.ceil(window.scrollY / this.baseInPixels);

        const viewPort = Math.max(4, Math.ceil(window.innerHeight / this.baseInPixels));

        const bottomVisibleRow = firstTopVisibleRow + viewPort;

        const topRowForRender = Math.max(0, firstTopVisibleRow - viewPort);

        const bottomRowForRender = bottomVisibleRow + viewPort;

        return {top: topRowForRender, bottom: bottomRowForRender};
    }
}
