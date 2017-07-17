import * as React from 'react';
import {render} from 'react-dom';
import {StaticItemProvider} from "../StaticItemProvider";
import {IItem} from "../Grid";
import {GridComponent} from "../GridComponent";

const mountNode = document.getElementById('app');

const rand = (from, to) => Math.floor(Math.random() * to) + from;

const range = count => [...new Array(count)].map((_, i) => i);

const generate = (count: number): IItem[] => range(count).map(i => ({height: rand(1, 2), width: rand(1, 2), i, positions: []}));

const itemFactory = (item: IItem, {height}) => {
    return (
        <div className="item">
            <div style={{
                fontSize: '75px',
                textAlign: 'center',
                lineHeight: `${height}px`,
                color: '#fff',
                textShadow: '3px 1px #000',
            }}>{item.i}</div>
            <img
                src="https://stakers.com/cache/platform/resources/media/games_images/yggdrasil/Holmes_amp_the_Stolen_Stones_1461.jpg"
                style={{
                    zIndex: -1
                }}
            />
        </div>
    );
};

class App extends React.Component {
    private _provider;

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
                </ul>
            </div>
            <GridComponent provider={this._provider} base={9} elementFactory={itemFactory}/>
            <div style={{height: '1000px', width: '100%', background: '#ddd'}}>
                Footer
            </div>
        </div>
    }

    private setSet(count: number) {
        this._provider.setItems(generate(count));

        this.setState({set: count});
    }
}

render(<App/>, mountNode);