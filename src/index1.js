import axios from "axios"
import lodash from 'lodash'
import a from './A-module';
import f from './F-module';
import g from './G-module';
import(/* webpackChunkName: "async-b" */ './B-module');
import(/* webpackChunkName: "async-c" */ './C-module');

a();
f();
g();

console.log('加载index1.js...')

let div=document.createElement("div");
div.innerHTML = "<br><i>index1.js已加载</i>";
document.body.appendChild(div);