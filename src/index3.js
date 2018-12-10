import lodash from 'lodash'
import a from './A-module';
import f from './F-module';
import h from './H-module';
import(/* webpackChunkName: "async-c" */ './C-module');

a();
f();
h();

console.log('加载index3.js...')

let div=document.createElement("div");
div.innerHTML = "<br><i>index3.js已加载</i>";
document.body.appendChild(div);