import axios from "axios"
import a from './A-module';
import g from './G-module';
import h from './H-module';
import(/* webpackChunkName: "async-lodash" */ 'lodash');
import(/* webpackChunkName: "async-b" */ './B-module');

a();
g();
h();

console.log('加载index2.js...')

let div=document.createElement("div");
div.innerHTML = "<br><i>index2.js已加载</i>";
document.body.appendChild(div);