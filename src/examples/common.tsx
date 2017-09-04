import {IItem} from "../Grid";
import {StaticItemProvider} from "../ItemProvider";
import {GridComponent} from "../GridComponent";
import * as React from 'react';

export const getMountNode = () => document.getElementById('app');

const rand = (from, to) => Math.floor(Math.random() * to) + from;

const range = count => [...new Array(count)].map((_, i) => i);

const generate = (count: number): IItem[] => range(count).map(i => ({
    height: rand(1, 2),
    width: rand(1, 2),
    key: i,
    positions: [],
    props: {}
}));

const imgs = [
    'https://stakers.com/cache/platform/resources/media/games_images/microgaming/Jurasic_World_1462.jpg',
    'https://stakers.com/cache/platform/resources/media/games_images/yggdrasil/Holmes_amp_the_Stolen_Stones_1461.jpg'
];

let src = 'https://stakers.com/cache/platform/resources/media/games_images/yggdrasil/Holmes_amp_the_Stolen_Stones_1461.jpg';

const itemFactory = (item: IItem, {height}) => {
    return (
        <div className="item">
            <div style={{
                fontSize: '75px',
                textAlign: 'center',
                lineHeight: `${height}px`,
                color: '#fff',
                textShadow: '3px 1px #000',
            }}>{item.key}</div>
            <img
                src={src}
                style={{
                    zIndex: -1
                }}
            />
        </div>
    );
};

export class App extends React.Component<any, any> {
    private _provider: StaticItemProvider;

    state = {
        set: 10
    };

    componentWillMount() {
        this._provider = new StaticItemProvider();

        this.setSet(this.state.set);
    }

    render() {
        return <div>
            <div style={{height: '300px', width: '100%', background: '#ddd'}}>
                Header
                <ul>
                    <li><a href="#" onClick={() => this.setSet(10)}>10</a></li>
                    <li><a href="#" onClick={() => this.setSet(100)}>100</a></li>
                    <li><a href="#" onClick={() => this.setSet(1000)}>1000</a></li>
                    <li><a href="#" onClick={() => this.update()}>up</a></li>
                </ul>
            </div>
            <GridComponent provider={this._provider} base={18} elementFactory={itemFactory}/>
            <div style={{height: '1000px', width: '100%', background: '#ddd'}}>
                Footer
            </div>
        </div>
    }

    private update() {
        src = imgs[rand(0, 2)];

        this._provider.updateItems(this._provider.getLoadedItems());
    }

    private setSet(count: number) {
        this._provider.setItems(generate(count));


        this.setState({set: count});
    }
}