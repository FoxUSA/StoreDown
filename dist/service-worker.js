if(!self.define){let s,e={};const l=(l,n)=>(l=new URL(l+".js",n).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(n,r)=>{const i=s||("document"in self?document.currentScript.src:"")||location.href;if(e[i])return;let u={};const c=s=>l(s,i),o={module:{uri:i},exports:u,require:c};e[i]=Promise.all(n.map((s=>o[s]||c(s)))).then((s=>(r(...s),u)))}}define(["./workbox-2d118ab0"],(function(s){"use strict";s.setCacheNameDetails({prefix:"storedown"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"css/141.e1f217f0.css",revision:null},{url:"css/315.c3ef8b63.css",revision:null},{url:"css/324.793f3fc5.css",revision:null},{url:"css/370.e1f217f0.css",revision:null},{url:"css/42.e1f217f0.css",revision:null},{url:"css/512.1a16c162.css",revision:null},{url:"css/611.e1f217f0.css",revision:null},{url:"css/618.ec4c78fa.css",revision:null},{url:"css/760.b199817b.css",revision:null},{url:"css/829.dddfd93e.css",revision:null},{url:"css/832.50d4eea9.css",revision:null},{url:"css/chunk-vendors.6098a581.css",revision:null},{url:"index.html",revision:"7fe32297d2f412089e5801a1d737ecac"},{url:"js/103.7d336561.js",revision:null},{url:"js/141.82295f8a.js",revision:null},{url:"js/315.61b08c70.js",revision:null},{url:"js/324.ad0bc1dc.js",revision:null},{url:"js/370.c195e28c.js",revision:null},{url:"js/42.f566fd3b.js",revision:null},{url:"js/512.f9d57eaf.js",revision:null},{url:"js/611.e1429cff.js",revision:null},{url:"js/618.4b6beb92.js",revision:null},{url:"js/760.105fe337.js",revision:null},{url:"js/805.aa91ceaf.js",revision:null},{url:"js/829.dc346a6d.js",revision:null},{url:"js/832.3badbba6.js",revision:null},{url:"js/991.a413e30e.js",revision:null},{url:"js/app.ee401040.js",revision:null},{url:"js/chunk-vendors.4a185d1c.js",revision:null},{url:"manifest.json",revision:"e29f14310eee13ebd2725aedf60c2bdc"},{url:"robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map