import { renderToString } from 'react-dom/server'
import {App} from "./common";
import * as React from 'react';

console.log(renderToString(<App />));