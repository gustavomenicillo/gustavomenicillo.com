// Generado desde tools/feedback-widget del repo gustavomenicillo.com (rama claude/project-thread-bb4kkh):
// modern-screenshot (MIT) + widget.js, con el CSS aparte y la API del panel.
(function(w,v){typeof exports=="object"&&typeof module!="undefined"?v(exports):typeof define=="function"&&define.amd?define(["exports"],v):(w=typeof globalThis!="undefined"?globalThis:w||self,v(w.modernScreenshot={}))})(this,function(w){"use strict";var Qt=Object.defineProperty,Zt=Object.defineProperties;var er=Object.getOwnPropertyDescriptors;var Z=Object.getOwnPropertySymbols;var xe=Object.prototype.hasOwnProperty,Me=Object.prototype.propertyIsEnumerable;var Le=Math.pow,Be=(w,v,N)=>v in w?Qt(w,v,{enumerable:!0,configurable:!0,writable:!0,value:N}):w[v]=N,D=(w,v)=>{for(var N in v||(v={}))xe.call(v,N)&&Be(w,N,v[N]);if(Z)for(var N of Z(v))Me.call(v,N)&&Be(w,N,v[N]);return w},L=(w,v)=>Zt(w,er(v));var Oe=(w,v)=>{var N={};for(var I in w)xe.call(w,I)&&v.indexOf(I)<0&&(N[I]=w[I]);if(w!=null&&Z)for(var I of Z(w))v.indexOf(I)<0&&Me.call(w,I)&&(N[I]=w[I]);return N};var C=(w,v,N)=>new Promise((I,O)=>{var X=P=>{try{q(N.next(P))}catch(W){O(W)}},j=P=>{try{q(N.throw(P))}catch(W){O(W)}},q=P=>P.done?I(P.value):Promise.resolve(P.value).then(X,j);q((N=N.apply(w,v)).next())});var Fe;function v(e,t){return e[13]=1,e[14]=t>>8,e[15]=t&255,e[16]=t>>8,e[17]=t&255,e}const N=112,I=72,O=89,X=115;let j;function q(){const e=new Int32Array(256);for(let t=0;t<256;t++){let r=t;for(let n=0;n<8;n++)r=r&1?3988292384^r>>>1:r>>>1;e[t]=r}return e}function P(e){let t=-1;j||(j=q());for(let r=0;r<e.length;r++)t=j[(t^e[r])&255]^t>>>8;return t^-1}function W(e){const t=e.length-1;for(let r=t;r>=4;r--)if(e[r-4]===9&&e[r-3]===N&&e[r-2]===I&&e[r-1]===O&&e[r]===X)return r-3;return 0}function oe(e,t,r=!1){const n=new Uint8Array(13);t*=39.3701,n[0]=N,n[1]=I,n[2]=O,n[3]=X,n[4]=t>>>24,n[5]=t>>>16,n[6]=t>>>8,n[7]=t&255,n[8]=n[4],n[9]=n[5],n[10]=n[6],n[11]=n[7],n[12]=1;const i=P(n),a=new Uint8Array(4);if(a[0]=i>>>24,a[1]=i>>>16,a[2]=i>>>8,a[3]=i&255,r){const s=W(e);return e.set(n,s),e.set(a,s+13),e}else{const s=new Uint8Array(4);s[0]=0,s[1]=0,s[2]=0,s[3]=9;const o=new Uint8Array(54);return o.set(e,0),o.set(s,33),o.set(n,37),o.set(a,50),o}}const je="AAlwSFlz",qe="AAAJcEhZ",We="AAAACXBI";function Ve(e){let t=e.indexOf(je);return t===-1&&(t=e.indexOf(qe)),t===-1&&(t=e.indexOf(We)),t}const ae="[modern-screenshot]",U=typeof window!="undefined",He=U&&"Worker"in window,se=U&&"atob"in window,ze=U&&"btoa"in window,ee=U?(Fe=window.navigator)==null?void 0:Fe.userAgent:"",ie=ee.includes("Chrome"),G=ee.includes("AppleWebKit")&&!ie,te=ee.includes("Firefox"),Xe=e=>e&&"__CONTEXT__"in e,Ge=e=>e.constructor.name==="CSSFontFaceRule",Ye=e=>e.constructor.name==="CSSImportRule",R=e=>e.nodeType===1,V=e=>typeof e.className=="object",le=e=>e.tagName==="image",Je=e=>e.tagName==="use",H=e=>R(e)&&typeof e.style!="undefined"&&!V(e),Ke=e=>e.nodeType===8,Qe=e=>e.nodeType===3,B=e=>e.tagName==="IMG",Y=e=>e.tagName==="VIDEO",Ze=e=>e.tagName==="CANVAS",et=e=>e.tagName==="TEXTAREA",tt=e=>e.tagName==="INPUT",rt=e=>e.tagName==="STYLE",nt=e=>e.tagName==="SCRIPT",ot=e=>e.tagName==="SELECT",at=e=>e.tagName==="SLOT",st=e=>e.tagName==="IFRAME",it=(...e)=>console.warn(ae,...e);function lt(e){var r;const t=(r=e==null?void 0:e.createElement)==null?void 0:r.call(e,"canvas");return t&&(t.height=t.width=1),!!t&&"toDataURL"in t&&!!t.toDataURL("image/webp").includes("image/webp")}const re=e=>e.startsWith("data:");function ce(e,t){if(e.match(/^[a-z]+:\/\//i))return e;if(U&&e.match(/^\/\//))return window.location.protocol+e;if(e.match(/^[a-z]+:/i)||!U)return e;const r=J().implementation.createHTMLDocument(),n=r.createElement("base"),i=r.createElement("a");return r.head.appendChild(n),r.body.appendChild(i),t&&(n.href=t),i.href=e,i.href}function J(e){var t;return(t=e&&R(e)?e==null?void 0:e.ownerDocument:e)!=null?t:window.document}const K="http://www.w3.org/2000/svg";function ue(e,t,r){const n=J(r).createElementNS(K,"svg");return n.setAttributeNS(null,"width",e.toString()),n.setAttributeNS(null,"height",t.toString()),n.setAttributeNS(null,"viewBox",`0 0 ${e} ${t}`),n}function fe(e,t){let r=new XMLSerializer().serializeToString(e);return t&&(r=r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu,"")),`data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`}function ct(e,t="image/png",r=1){return C(this,null,function*(){try{return yield new Promise((n,i)=>{e.toBlob(a=>{a?n(a):i(new Error("Blob is null"))},t,r)})}catch(n){if(se)return ut(e.toDataURL(t,r));throw n}})}function ut(e){var o,c;const[t,r]=e.split(","),n=(c=(o=t.match(/data:(.+);/))==null?void 0:o[1])!=null?c:void 0,i=window.atob(r),a=i.length,s=new Uint8Array(a);for(let u=0;u<a;u+=1)s[u]=i.charCodeAt(u);return new Blob([s],{type:n})}function de(e,t){return new Promise((r,n)=>{const i=new FileReader;i.onload=()=>r(i.result),i.onerror=()=>n(i.error),i.onabort=()=>n(new Error(`Failed read blob to ${t}`)),t==="dataUrl"?i.readAsDataURL(e):t==="arrayBuffer"&&i.readAsArrayBuffer(e)})}const ft=e=>de(e,"dataUrl"),dt=e=>de(e,"arrayBuffer");function _(e,t){const r=J(t).createElement("img");return r.decoding="sync",r.loading="eager",r.src=e,r}function x(e,t){return new Promise(r=>{const{timeout:n,ownerDocument:i,onError:a,onWarn:s}=t!=null?t:{},o=typeof e=="string"?_(e,J(i)):e;let c=null,u=null;function l(){r(o),c&&clearTimeout(c),u==null||u()}if(n&&(c=setTimeout(l,n)),Y(o)){const f=o.currentSrc||o.src;if(!f)return o.poster?x(o.poster,t).then(r):l();if(o.readyState>=2)return l();const d=l,g=y=>{s==null||s("Failed video load",f,y),a==null||a(y),l()};u=()=>{o.removeEventListener("loadeddata",d),o.removeEventListener("error",g)},o.addEventListener("loadeddata",d,{once:!0}),o.addEventListener("error",g,{once:!0})}else{const f=le(o)?o.href.baseVal:o.currentSrc||o.src;if(!f)return l();const d=()=>C(this,null,function*(){if(B(o)&&"decode"in o)try{yield o.decode()}catch(y){s==null||s("Failed to decode image, trying to render anyway",o.dataset.originalSrc||f,y)}l()}),g=y=>{s==null||s("Failed image load",o.dataset.originalSrc||f,y),l()};if(B(o)&&o.complete)return d();u=()=>{o.removeEventListener("load",d),o.removeEventListener("error",g)},o.addEventListener("load",d,{once:!0}),o.addEventListener("error",g,{once:!0})}})}function ge(e,t){return C(this,null,function*(){H(e)&&(B(e)||Y(e)?yield x(e,t):yield Promise.all(["img","video"].flatMap(r=>Array.from(e.querySelectorAll(r)).map(n=>x(n,t)))))})}const me=function(){let t=0;const r=()=>`0000${(Math.random()*Le(36,4)<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${r()}${t}`)}();function he(e){return e==null?void 0:e.split(",").map(t=>t.trim().replace(/"|'/g,"").toLowerCase()).filter(Boolean)}let we=0;function gt(e){const t=`${ae}[#${we}]`;return we++,{time:r=>e&&console.time(`${t} ${r}`),timeEnd:r=>e&&console.timeEnd(`${t} ${r}`),warn:(...r)=>e&&it(...r)}}function mt(e){return{cache:e?"no-cache":"force-cache"}}function k(e,t){return C(this,null,function*(){return Xe(e)?e:pe(e,L(D({},t),{autoDestruct:!0}))})}function pe(e,t){return C(this,null,function*(){var g,y,h,p,b;const{scale:r=1,workerUrl:n,workerNumber:i=1}=t||{},a=!!(t!=null&&t.debug),s=(g=t==null?void 0:t.features)!=null?g:!0,o=(y=e.ownerDocument)!=null?y:U?window.document:void 0,c=(p=(h=e.ownerDocument)==null?void 0:h.defaultView)!=null?p:U?window:void 0,u=new Map,l=L(D({width:0,height:0,quality:1,type:"image/png",scale:r,backgroundColor:null,style:null,filter:null,maximumCanvasSize:0,timeout:3e4,progress:null,debug:a,fetch:D({requestInit:mt((b=t==null?void 0:t.fetch)==null?void 0:b.bypassingCache),placeholderImage:"data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",bypassingCache:!1},t==null?void 0:t.fetch),fetchFn:null,font:{},drawImageInterval:100,workerUrl:null,workerNumber:i,onCloneEachNode:null,onCloneNode:null,onEmbedNode:null,onCreateForeignObjectSvg:null,includeStyleProperties:null,autoDestruct:!1},t),{__CONTEXT__:!0,log:gt(a),node:e,ownerDocument:o,ownerWindow:c,dpi:r===1?null:96*r,svgStyleElement:ye(o),svgDefsElement:o==null?void 0:o.createElementNS(K,"defs"),svgStyles:new Map,defaultComputedStyles:new Map,workers:[...Array.from({length:He&&n&&i?i:0})].map(()=>{try{const S=new Worker(n);return S.onmessage=m=>C(this,null,function*(){var A,F,$,$e;const{url:E,result:T}=m.data;T?(F=(A=u.get(E))==null?void 0:A.resolve)==null||F.call(A,T):($e=($=u.get(E))==null?void 0:$.reject)==null||$e.call($,new Error(`Error receiving message from worker: ${E}`))}),S.onmessageerror=m=>{var T,A;const{url:E}=m.data;(A=(T=u.get(E))==null?void 0:T.reject)==null||A.call(T,new Error(`Error receiving message from worker: ${E}`))},S}catch(S){return l.log.warn("Failed to new Worker",S),null}}).filter(Boolean),fontFamilies:new Map,fontCssTexts:new Map,acceptOfImage:`${[lt(o)&&"image/webp","image/svg+xml","image/*","*/*"].filter(Boolean).join(",")};q=0.8`,requests:u,drawImageCount:0,tasks:[],features:s,isEnable:S=>{var m,E;return S==="restoreScrollPosition"?typeof s=="boolean"?!1:(m=s[S])!=null?m:!1:typeof s=="boolean"?s:(E=s[S])!=null?E:!0},shadowRoots:[]});l.log.time("wait until load"),yield ge(e,{timeout:l.timeout,onWarn:l.log.warn}),l.log.timeEnd("wait until load");const{width:f,height:d}=ht(e,l);return l.width=f,l.height=d,l})}function ye(e){if(!e)return;const t=e.createElement("style"),r=t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);return t.appendChild(r),t}function ht(e,t){let{width:r,height:n}=t;if(R(e)&&(!r||!n)){const i=e.getBoundingClientRect();r=r||i.width||Number(e.getAttribute("width"))||0,n=n||i.height||Number(e.getAttribute("height"))||0}return{width:r,height:n}}function wt(e,t){return C(this,null,function*(){const{log:r,timeout:n,drawImageCount:i,drawImageInterval:a}=t;r.time("image to canvas");const s=yield x(e,{timeout:n,onWarn:t.log.warn}),{canvas:o,context2d:c}=pt(e.ownerDocument,t),u=()=>{try{c==null||c.drawImage(s,0,0,o.width,o.height)}catch(l){t.log.warn("Failed to drawImage",l)}};if(u(),t.isEnable("fixSvgXmlDecode"))for(let l=0;l<i;l++)yield new Promise(f=>{setTimeout(()=>{c==null||c.clearRect(0,0,o.width,o.height),u(),f()},l+a)});return t.drawImageCount=0,r.timeEnd("image to canvas"),o})}function pt(e,t){const{width:r,height:n,scale:i,backgroundColor:a,maximumCanvasSize:s}=t,o=e.createElement("canvas");o.width=Math.floor(r*i),o.height=Math.floor(n*i),o.style.width=`${r}px`,o.style.height=`${n}px`,s&&(o.width>s||o.height>s)&&(o.width>s&&o.height>s?o.width>o.height?(o.height*=s/o.width,o.width=s):(o.width*=s/o.height,o.height=s):o.width>s?(o.height*=s/o.width,o.width=s):(o.width*=s/o.height,o.height=s));const c=o.getContext("2d");return c&&a&&(c.fillStyle=a,c.fillRect(0,0,o.width,o.height)),{canvas:o,context2d:c}}function be(e,t){if(e.ownerDocument)try{const a=e.toDataURL();if(a!=="data:,")return _(a,e.ownerDocument)}catch(a){t.log.warn("Failed to clone canvas",a)}const r=e.cloneNode(!1),n=e.getContext("2d"),i=r.getContext("2d");try{return n&&i&&i.putImageData(n.getImageData(0,0,e.width,e.height),0,0),r}catch(a){t.log.warn("Failed to clone canvas",a)}return r}function yt(e,t){var r;try{if((r=e==null?void 0:e.contentDocument)!=null&&r.body)return ne(e.contentDocument.body,t)}catch(n){t.log.warn("Failed to clone iframe",n)}return e.cloneNode(!1)}function bt(e){const t=e.cloneNode(!1);return e.currentSrc&&e.currentSrc!==e.src&&(t.src=e.currentSrc,t.srcset=""),t.loading==="lazy"&&(t.loading="eager"),t}function St(e,t){return C(this,null,function*(){if(e.ownerDocument&&!e.currentSrc&&e.poster)return _(e.poster,e.ownerDocument);const r=e.cloneNode(!1);r.crossOrigin="anonymous",e.currentSrc&&e.currentSrc!==e.src&&(r.src=e.currentSrc);const n=r.ownerDocument;if(n){let i=!0;if(yield x(r,{onError:()=>i=!1,onWarn:t.log.warn}),!i)return e.poster?_(e.poster,e.ownerDocument):r;r.currentTime=e.currentTime,yield new Promise(s=>{r.addEventListener("seeked",s,{once:!0})});const a=n.createElement("canvas");a.width=e.offsetWidth,a.height=e.offsetHeight;try{const s=a.getContext("2d");s&&s.drawImage(r,0,0,a.width,a.height)}catch(s){return t.log.warn("Failed to clone video",s),e.poster?_(e.poster,e.ownerDocument):r}return be(a,t)}return r})}function Et(e,t){return Ze(e)?be(e,t):st(e)?yt(e,t):B(e)?bt(e):Y(e)?St(e,t):e.cloneNode(!1)}function Ct(e){let t=e.sandbox;if(!t){const{ownerDocument:r}=e;try{r&&(t=r.createElement("iframe"),t.id=`__SANDBOX__${me()}`,t.width="0",t.height="0",t.style.visibility="hidden",t.style.position="fixed",r.body.appendChild(t),t.srcdoc='<!DOCTYPE html><meta charset="UTF-8"><title></title><body>',e.sandbox=t)}catch(n){e.log.warn("Failed to getSandBox",n)}}return t}const Tt=["width","height","-webkit-text-fill-color"],vt=["stroke","fill"];function Se(e,t,r){const{defaultComputedStyles:n}=r,i=e.nodeName.toLowerCase(),a=V(e)&&i!=="svg",s=a?vt.map(h=>[h,e.getAttribute(h)]).filter(([,h])=>h!==null):[],o=[a&&"svg",i,s.map((h,p)=>`${h}=${p}`).join(","),t].filter(Boolean).join(":");if(n.has(o))return n.get(o);const c=Ct(r),u=c==null?void 0:c.contentWindow;if(!u)return new Map;const l=u==null?void 0:u.document;let f,d;a?(f=l.createElementNS(K,"svg"),d=f.ownerDocument.createElementNS(f.namespaceURI,i),s.forEach(([h,p])=>{d.setAttributeNS(null,h,p)}),f.appendChild(d)):f=d=l.createElement(i),d.textContent=" ",l.body.appendChild(f);const g=u.getComputedStyle(d,t),y=new Map;for(let h=g.length,p=0;p<h;p++){const b=g.item(p);Tt.includes(b)||y.set(b,g.getPropertyValue(b))}return l.body.removeChild(f),n.set(o,y),y}function Ee(e,t,r){var o;const n=new Map,i=[],a=new Map;if(r)for(const c of r)s(c);else for(let c=e.length,u=0;u<c;u++){const l=e.item(u);s(l)}for(let c=i.length,u=0;u<c;u++)(o=a.get(i[u]))==null||o.forEach((l,f)=>n.set(f,l));function s(c){const u=e.getPropertyValue(c),l=e.getPropertyPriority(c),f=c.lastIndexOf("-"),d=f>-1?c.substring(0,f):void 0;if(d){let g=a.get(d);g||(g=new Map,a.set(d,g)),g.set(c,[u,l])}t.get(c)===u&&!l||(d?i.push(d):n.set(c,[u,l]))}return n}function At(e,t,r,n){var f,d,g,y;const{ownerWindow:i,includeStyleProperties:a,currentParentNodeStyle:s}=n,o=t.style,c=i.getComputedStyle(e),u=Se(e,null,n);s==null||s.forEach((h,p)=>{u.delete(p)});const l=Ee(c,u,a);l.delete("transition-property"),l.delete("all"),l.delete("d"),l.delete("content"),r&&(l.delete("margin-top"),l.delete("margin-right"),l.delete("margin-bottom"),l.delete("margin-left"),l.delete("margin-block-start"),l.delete("margin-block-end"),l.delete("margin-inline-start"),l.delete("margin-inline-end"),l.set("box-sizing",["border-box",""])),((f=l.get("background-clip"))==null?void 0:f[0])==="text"&&t.classList.add("______background-clip--text"),ie&&(l.has("font-kerning")||l.set("font-kerning",["normal",""]),(((d=l.get("overflow-x"))==null?void 0:d[0])==="hidden"||((g=l.get("overflow-y"))==null?void 0:g[0])==="hidden")&&((y=l.get("text-overflow"))==null?void 0:y[0])==="ellipsis"&&e.scrollWidth===e.clientWidth&&l.set("text-overflow",["clip",""]));for(let h=o.length,p=0;p<h;p++)o.removeProperty(o.item(p));return l.forEach(([h,p],b)=>{o.setProperty(b,h,p)}),l}function Nt(e,t){(et(e)||tt(e)||ot(e))&&t.setAttribute("value",e.value)}const It=[":before",":after"],Rt=[":-webkit-scrollbar",":-webkit-scrollbar-button",":-webkit-scrollbar-thumb",":-webkit-scrollbar-track",":-webkit-scrollbar-track-piece",":-webkit-scrollbar-corner",":-webkit-resizer"];function kt(e,t,r,n,i){const{ownerWindow:a,svgStyleElement:s,svgStyles:o,currentNodeStyle:c}=n;if(!s||!a)return;function u(l){var m;const f=a.getComputedStyle(e,l);let d=f.getPropertyValue("content");if(!d||d==="none")return;i==null||i(d),d=d.replace(/(')|(")|(counter\(.+\))/g,"");const g=[me()],y=Se(e,l,n);c==null||c.forEach((E,T)=>{y.delete(T)});const h=Ee(f,y,n.includeStyleProperties);h.delete("content"),h.delete("-webkit-locale"),((m=h.get("background-clip"))==null?void 0:m[0])==="text"&&t.classList.add("______background-clip--text");const p=[`content: '${d}';`];if(h.forEach(([E,T],A)=>{p.push(`${A}: ${E}${T?" !important":""};`)}),p.length===1)return;try{t.className=[t.className,...g].join(" ")}catch(E){n.log.warn("Failed to copyPseudoClass",E);return}const b=p.join(`
  `);let S=o.get(b);S||(S=[],o.set(b,S)),S.push(`.${g[0]}:${l}`)}It.forEach(u),r&&Rt.forEach(u)}const Ce=new Set(["symbol"]);function Te(e,t,r,n,i){return C(this,null,function*(){if(R(r)&&(rt(r)||nt(r))||n.filter&&!n.filter(r))return;Ce.has(t.nodeName)||Ce.has(r.nodeName)?n.currentParentNodeStyle=void 0:n.currentParentNodeStyle=n.currentNodeStyle;const a=yield ne(r,n,!1,i);n.isEnable("restoreScrollPosition")&&Dt(e,a),t.appendChild(a)})}function ve(e,t,r,n){return C(this,null,function*(){var a;let i=e.firstChild;R(e)&&e.shadowRoot&&(i=(a=e.shadowRoot)==null?void 0:a.firstChild,r.shadowRoots.push(e.shadowRoot));for(let s=i;s;s=s.nextSibling)if(!Ke(s))if(R(s)&&at(s)&&typeof s.assignedNodes=="function"){const o=s.assignedNodes();for(let c=0;c<o.length;c++)yield Te(e,t,o[c],r,n)}else yield Te(e,t,s,r,n)})}function Dt(e,t){if(!H(e)||!H(t))return;const{scrollTop:r,scrollLeft:n}=e;if(!r&&!n)return;const{transform:i}=t.style,a=new DOMMatrix(i),{a:s,b:o,c,d:u}=a;a.a=1,a.b=0,a.c=0,a.d=1,a.translateSelf(-n,-r),a.a=s,a.b=o,a.c=c,a.d=u,t.style.transform=a.toString()}function Pt(e,t){const{backgroundColor:r,width:n,height:i,style:a}=t,s=e.style;if(r&&s.setProperty("background-color",r,"important"),n&&s.setProperty("width",`${n}px`,"important"),i&&s.setProperty("height",`${i}px`,"important"),a)for(const o in a)s[o]=a[o]}const Ut=/^[\w-:]+$/;function ne(e,t,r=!1,n){return C(this,null,function*(){var u,l,f,d;const{ownerDocument:i,ownerWindow:a,fontFamilies:s,onCloneEachNode:o}=t;if(i&&Qe(e))return n&&/\S/.test(e.data)&&n(e.data),i.createTextNode(e.data);if(i&&a&&R(e)&&(H(e)||V(e))){const g=yield Et(e,t);if(t.isEnable("removeAbnormalAttributes")){const m=g.getAttributeNames();for(let E=m.length,T=0;T<E;T++){const A=m[T];Ut.test(A)||g.removeAttribute(A)}}const y=t.currentNodeStyle=At(e,g,r,t);r&&Pt(g,t);let h=!1;if(t.isEnable("copyScrollbar")){const m=[(u=y.get("overflow-x"))==null?void 0:u[0],(l=y.get("overflow-y"))==null?void 0:l[0]];h=m.includes("scroll")||(m.includes("auto")||m.includes("overlay"))&&(e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth)}const p=(f=y.get("text-transform"))==null?void 0:f[0],b=he((d=y.get("font-family"))==null?void 0:d[0]),S=b?m=>{p==="uppercase"?m=m.toUpperCase():p==="lowercase"?m=m.toLowerCase():p==="capitalize"&&(m=m[0].toUpperCase()+m.substring(1)),b.forEach(E=>{let T=s.get(E);T||s.set(E,T=new Set),m.split("").forEach(A=>T.add(A))})}:void 0;return kt(e,g,h,t,S),Nt(e,g),Y(e)||(yield ve(e,g,t,S)),yield o==null?void 0:o(g),g}const c=e.cloneNode(!1);return yield ve(e,c,t),yield o==null?void 0:o(c),c})}function Ae(e){if(e.ownerDocument=void 0,e.ownerWindow=void 0,e.svgStyleElement=void 0,e.svgDefsElement=void 0,e.svgStyles.clear(),e.defaultComputedStyles.clear(),e.sandbox){try{e.sandbox.remove()}catch(t){e.log.warn("Failed to destroyContext",t)}e.sandbox=void 0}e.workers=[],e.fontFamilies.clear(),e.fontCssTexts.clear(),e.requests.clear(),e.tasks=[],e.shadowRoots=[]}function _t(e){const o=e,{url:t,timeout:r,responseType:n}=o,i=Oe(o,["url","timeout","responseType"]),a=new AbortController,s=r?setTimeout(()=>a.abort(),r):void 0;return fetch(t,D({signal:a.signal},i)).then(c=>{if(!c.ok)throw new Error("Failed fetch, not 2xx response",{cause:c});switch(n){case"arrayBuffer":return c.arrayBuffer();case"dataUrl":return c.blob().then(ft);case"text":default:return c.text()}}).finally(()=>clearTimeout(s))}function z(e,t){const{url:r,requestType:n="text",responseType:i="text",imageDom:a}=t;let s=r;const{timeout:o,acceptOfImage:c,requests:u,fetchFn:l,fetch:{requestInit:f,bypassingCache:d,placeholderImage:g},font:y,workers:h,fontFamilies:p}=e;n==="image"&&(G||te)&&e.drawImageCount++;let b=u.get(r);if(!b){d&&d instanceof RegExp&&d.test(s)&&(s+=(/\?/.test(s)?"&":"?")+new Date().getTime());const S=n.startsWith("font")&&y&&y.minify,m=new Set;S&&n.split(";")[1].split(",").forEach(F=>{p.has(F)&&p.get(F).forEach($=>m.add($))});const E=S&&m.size,T=D({url:s,timeout:o,responseType:E?"arrayBuffer":i,headers:n==="image"?{accept:c}:void 0},f);b={type:n,resolve:void 0,reject:void 0,response:null},b.response=C(this,null,function*(){if(l&&n==="image"){const A=yield l(r);if(A)return A}return!G&&r.startsWith("http")&&h.length?new Promise((A,F)=>{h[u.size&h.length-1].postMessage(D({rawUrl:r},T)),b.resolve=A,b.reject=F}):_t(T)}).catch(A=>{if(u.delete(r),n==="image"&&g)return e.log.warn("Failed to fetch image base64, trying to use placeholder image",s),typeof g=="string"?g:g(a);throw A}),u.set(r,b)}return b.response}function Ne(e,t,r,n){return C(this,null,function*(){if(!Ie(e))return e;for(const[i,a]of Ft(e,t))try{const s=yield z(r,{url:a,requestType:n?"image":"text",responseType:"dataUrl"});e=e.replace($t(i),`$1${s}$3`)}catch(s){r.log.warn("Failed to fetch css data url",i,s)}return e})}function Ie(e){return/url\((['"]?)([^'"]+?)\1\)/.test(e)}const Re=/url\((['"]?)([^'"]+?)\1\)/g;function Ft(e,t){const r=[];return e.replace(Re,(n,i,a)=>(r.push([a,ce(a,t)]),n)),r.filter(([n])=>!re(n))}function $t(e){const t=e.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`,"g")}const Bt=["background-image","border-image-source","-webkit-border-image","-webkit-mask-image","list-style-image"];function xt(e,t){return Bt.map(r=>{const n=e.getPropertyValue(r);return!n||n==="none"?null:((G||te)&&t.drawImageCount++,Ne(n,null,t,!0).then(i=>{!i||n===i||e.setProperty(r,i,e.getPropertyPriority(r))}))}).filter(Boolean)}function Mt(e,t){if(B(e)){const r=e.currentSrc||e.src;if(!re(r))return[z(t,{url:r,imageDom:e,requestType:"image",responseType:"dataUrl"}).then(n=>{n&&(e.srcset="",e.dataset.originalSrc=r,e.src=n||"")})];(G||te)&&t.drawImageCount++}else if(V(e)&&!re(e.href.baseVal)){const r=e.href.baseVal;return[z(t,{url:r,imageDom:e,requestType:"image",responseType:"dataUrl"}).then(n=>{n&&(e.dataset.originalSrc=r,e.href.baseVal=n||"")})]}return[]}function Lt(e,t){var o;const{ownerDocument:r,svgDefsElement:n}=t,i=(o=e.getAttribute("href"))!=null?o:e.getAttribute("xlink:href");if(!i)return[];const[a,s]=i.split("#");if(s){const c=`#${s}`,u=t.shadowRoots.reduce((l,f)=>l!=null?l:f.querySelector(`svg ${c}`),r==null?void 0:r.querySelector(`svg ${c}`));if(a&&e.setAttribute("href",c),n!=null&&n.querySelector(c))return[];if(u)return n==null||n.appendChild(u.cloneNode(!0)),[];if(a)return[z(t,{url:a,responseType:"text"}).then(l=>{n==null||n.insertAdjacentHTML("beforeend",l)})]}return[]}function ke(e,t){const{tasks:r}=t;R(e)&&((B(e)||le(e))&&r.push(...Mt(e,t)),Je(e)&&r.push(...Lt(e,t))),H(e)&&r.push(...xt(e.style,t)),e.childNodes.forEach(n=>{ke(n,t)})}function Ot(e,t){return C(this,null,function*(){const{ownerDocument:r,svgStyleElement:n,fontFamilies:i,fontCssTexts:a,tasks:s,font:o}=t;if(!(!r||!n||!i.size))if(o&&o.cssText){const c=Pe(o.cssText,t);n.appendChild(r.createTextNode(`${c}
`))}else{const c=Array.from(r.styleSheets).filter(l=>{try{return"cssRules"in l&&!!l.cssRules.length}catch(f){return t.log.warn(`Error while reading CSS rules from ${l.href}`,f),!1}});yield Promise.all(c.flatMap(l=>Array.from(l.cssRules).map((f,d)=>C(this,null,function*(){if(Ye(f)){let g=d+1;const y=f.href;let h="";try{h=yield z(t,{url:y,requestType:"text",responseType:"text"})}catch(b){t.log.warn(`Error fetch remote css import from ${y}`,b)}const p=h.replace(Re,(b,S,m)=>b.replace(m,ce(m,y)));for(const b of qt(p))try{l.insertRule(b,b.startsWith("@import")?g+=1:l.cssRules.length)}catch(S){t.log.warn("Error inserting rule from remote css import",{rule:b,error:S})}}})))),c.flatMap(l=>Array.from(l.cssRules)).filter(l=>{var f;return Ge(l)&&Ie(l.style.getPropertyValue("src"))&&((f=he(l.style.getPropertyValue("font-family")))==null?void 0:f.some(d=>i.has(d)))}).forEach(l=>{const f=l,d=a.get(f.cssText);d?n.appendChild(r.createTextNode(`${d}
`)):s.push(Ne(f.cssText,f.parentStyleSheet?f.parentStyleSheet.href:null,t).then(g=>{g=Pe(g,t),a.set(f.cssText,g),n.appendChild(r.createTextNode(`${g}
`))}))})}})}const jt=/(\/\*[\s\S]*?\*\/)/g,De=/((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;function qt(e){if(e==null)return[];const t=[];let r=e.replace(jt,"");for(;;){const a=De.exec(r);if(!a)break;t.push(a[0])}r=r.replace(De,"");const n=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,i=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");for(;;){let a=n.exec(r);if(a)i.lastIndex=n.lastIndex;else if(a=i.exec(r),a)n.lastIndex=i.lastIndex;else break;t.push(a[0])}return t}const Wt=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Vt=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Pe(e,t){const{font:r}=t,n=r?r==null?void 0:r.preferredFormat:void 0;return n?e.replace(Vt,i=>{for(;;){const[a,,s]=Wt.exec(i)||[];if(!s)return"";if(s===n)return`src: ${a};`}}):e}function Ue(e,t){return C(this,null,function*(){const r=yield k(e,t);if(R(r.node)&&V(r.node))return r.node;const{ownerDocument:n,log:i,tasks:a,svgStyleElement:s,svgDefsElement:o,svgStyles:c,font:u,progress:l,autoDestruct:f,onCloneNode:d,onEmbedNode:g,onCreateForeignObjectSvg:y}=r;i.time("clone node");const h=yield ne(r.node,r,!0);if(s&&n){let E="";c.forEach((T,A)=>{E+=`${T.join(`,
`)} {
  ${A}
}
`}),s.appendChild(n.createTextNode(E))}i.timeEnd("clone node"),yield d==null?void 0:d(h),u!==!1&&R(h)&&(i.time("embed web font"),yield Ot(h,r),i.timeEnd("embed web font")),i.time("embed node"),ke(h,r);const p=a.length;let b=0;const S=()=>C(this,null,function*(){for(;;){const E=a.pop();if(!E)break;try{yield E}catch(T){r.log.warn("Failed to run task",T)}l==null||l(++b,p)}});l==null||l(b,p),yield Promise.all([...Array.from({length:4})].map(S)),i.timeEnd("embed node"),yield g==null?void 0:g(h);const m=Ht(h,r);return o&&m.insertBefore(o,m.children[0]),s&&m.insertBefore(s,m.children[0]),f&&Ae(r),yield y==null?void 0:y(m),m})}function Ht(e,t){const{width:r,height:n}=t,i=ue(r,n,e.ownerDocument),a=i.ownerDocument.createElementNS(i.namespaceURI,"foreignObject");return a.setAttributeNS(null,"x","0%"),a.setAttributeNS(null,"y","0%"),a.setAttributeNS(null,"width","100%"),a.setAttributeNS(null,"height","100%"),a.append(e),i.appendChild(a),i}function Q(e,t){return C(this,null,function*(){var s;const r=yield k(e,t),n=yield Ue(r),i=fe(n,r.isEnable("removeControlCharacter"));r.autoDestruct||(r.svgStyleElement=ye(r.ownerDocument),r.svgDefsElement=(s=r.ownerDocument)==null?void 0:s.createElementNS(K,"defs"),r.svgStyles.clear());const a=_(i,n.ownerDocument);return yield wt(a,r)})}function zt(e,t){return C(this,null,function*(){const r=yield k(e,t),{log:n,type:i,quality:a,dpi:s}=r,o=yield Q(r);n.time("canvas to blob");const c=yield ct(o,i,a);if(["image/png","image/jpeg"].includes(i)&&s){const u=yield dt(c.slice(0,33));let l=new Uint8Array(u);return i==="image/png"?l=oe(l,s):i==="image/jpeg"&&(l=v(l,s)),n.timeEnd("canvas to blob"),new Blob([l,c.slice(33)],{type:i})}return n.timeEnd("canvas to blob"),c})}function M(e,t){return C(this,null,function*(){const r=yield k(e,t),{log:n,quality:i,type:a,dpi:s}=r,o=yield Q(r);n.time("canvas to data url");let c=o.toDataURL(a,i);if(["image/png","image/jpeg"].includes(a)&&s&&se&&ze){const[u,l]=c.split(",");let f=0,d=!1;if(a==="image/png"){const m=Ve(l);m>=0?(f=Math.ceil((m+28)/3)*4,d=!0):f=33/3*4}else a==="image/jpeg"&&(f=18/3*4);const g=l.substring(0,f),y=l.substring(f),h=window.atob(g),p=new Uint8Array(h.length);for(let m=0;m<p.length;m++)p[m]=h.charCodeAt(m);const b=a==="image/png"?oe(p,s,d):v(p,s),S=window.btoa(String.fromCharCode(...b));c=[u,",",S,y].join("")}return n.timeEnd("canvas to data url"),c})}function _e(e,t){return C(this,null,function*(){const r=yield k(e,t),{width:n,height:i,ownerDocument:a}=r,s=yield M(r),o=ue(n,i,a),c=o.ownerDocument.createElementNS(o.namespaceURI,"image");return c.setAttributeNS(null,"href",s),c.setAttributeNS(null,"height","100%"),c.setAttributeNS(null,"width","100%"),o.appendChild(c),fe(o,r.isEnable("removeControlCharacter"))})}function Xt(e,t){return C(this,null,function*(){const r=yield k(e,t),{ownerDocument:n,width:i,height:a,scale:s,type:o}=r,c=o==="image/svg+xml"?yield _e(r):yield M(r),u=_(c,n);return u.width=Math.floor(i*s),u.height=Math.floor(a*s),u.style.width=`${i}px`,u.style.height=`${a}px`,u})}function Gt(e,t){return C(this,null,function*(){return M(yield k(e,L(D({},t),{type:"image/jpeg"})))})}function Yt(e,t){return C(this,null,function*(){const r=yield k(e,t),n=yield Q(r);return n.getContext("2d").getImageData(0,0,n.width,n.height).data})}function Jt(e,t){return C(this,null,function*(){return M(yield k(e,L(D({},t),{type:"image/png"})))})}function Kt(e,t){return C(this,null,function*(){return M(yield k(e,L(D({},t),{type:"image/webp"})))})}w.createContext=pe,w.destroyContext=Ae,w.domToBlob=zt,w.domToCanvas=Q,w.domToDataUrl=M,w.domToForeignObjectSvg=Ue,w.domToImage=Xt,w.domToJpeg=Gt,w.domToPixel=Yt,w.domToPng=Jt,w.domToSvg=_e,w.domToWebp=Kt,w.loadMedia=x,w.waitUntilLoad=ge,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"})});

/* Feedback widget: botón flotante para marcar, dictar y escribir correcciones sobre la página.
   En el panel lo carga app.js después del ingreso; guarda en /api/feedback. Requiere window.modernScreenshot. */
(function () {
  if (window.__fbWidget) return;
  window.__fbWidget = true;

  var CFG = Object.assign({ api: '/api/feedback', lang: '', color: '#e11d48' }, window.FB_CONFIG || {});
  var T = {
    es: {
      open: 'Dar feedback', capturing: 'Capturando pantalla…', draw: 'Marcá sobre la pantalla con el dedo',
      undo: 'Deshacer', clear: 'Borrar', cancel: 'Cancelar', send: 'Enviar', sending: 'Enviando…',
      placeholder: 'Escribí o dictá el cambio que querés…', mic: 'Dictar', stop: 'Parar',
      micHint: 'Tu navegador no dicta acá: usá el micrófono del teclado.',
      sent: 'Listo, comentario guardado.', error: 'No se pudo guardar. Probá de nuevo.', limit: 'Llegaste al tope de envíos permitido por ahora. Lo que escribiste no se guardó, pero queda en el cuadro. Probá de nuevo en unos minutos.', limitIdle: 'Llegaste al tope de envíos permitido por ahora. Probá de nuevo en unos minutos.', limitTitle: 'Llegaste al tope de envíos', limitOk: 'Entendido',
      day: 'Por hoy se llegó al tope de comentarios del staging. Lo que escribiste no se guardó, pero queda en el cuadro: copialo y mandalo mañana, o avisale a Ariel.', dayIdle: 'Por hoy se llegó al tope de comentarios del staging. Probá de nuevo mañana, o avisale a Ariel.',
      failTitle: 'No se pudo enviar', fail: 'No se guardó por un problema de conexión o del servidor. Lo que escribiste queda en el cuadro: probá de nuevo.', failIdle: 'No se guardó por un problema de conexión o del servidor. Probá de nuevo.',
      empty: 'Escribí, dictá o marcá algo antes de enviar.', inbox: 'Ver comentarios',
      noShot: 'Sin captura: igual se guarda la página y el elemento.'
    },
    en: {
      open: 'Give feedback', capturing: 'Capturing screen…', draw: 'Draw on the screen with your finger',
      undo: 'Undo', clear: 'Clear', cancel: 'Cancel', send: 'Send', sending: 'Sending…',
      placeholder: 'Type or dictate the change you want…', mic: 'Dictate', stop: 'Stop',
      micHint: 'Dictation is not available here: use your keyboard microphone.',
      sent: 'Done, comment saved.', error: 'Could not save. Try again.', limit: 'You reached the current sending limit. Your text was not saved, but it stays in the box. Try again in a few minutes.', limitIdle: 'You reached the current sending limit. Try again in a few minutes.', limitTitle: 'Sending limit reached', limitOk: 'Got it',
      day: "Today's comment limit for staging has been reached. Your text was not saved, but it stays in the box: copy it and send it tomorrow, or tell Ariel.", dayIdle: "Today's comment limit for staging has been reached. Try again tomorrow, or tell Ariel.",
      failTitle: "Couldn't send", fail: 'It was not saved because of a connection or server problem. Your text stays in the box: try again.', failIdle: 'It was not saved because of a connection or server problem. Try again.',
      empty: 'Type, dictate or draw something before sending.', inbox: 'See comments',
      noShot: 'No screenshot: page and element are still saved.'
    }
  };
  var lang = (CFG.lang || navigator.language || 'es').slice(0, 2);
  var t = T[lang] || T.es;
  var speechLang = lang === 'en' ? 'en-US' : 'es-AR';


  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    // style por CSSOM: la CSP del panel no permite atributos style en línea.
    for (var k in attrs || {}) { if (k === 'style') e.style.cssText = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toast(msg) {
    var x = el('div', { class: 'fbw fbw-toast' }); x.textContent = msg;
    document.body.appendChild(x); setTimeout(function () { x.remove(); }, 2600);
  }

  // T86 (Gustavo, 3/11): nunca se rechaza en silencio. Si un envío no se guarda (tope, red, servidor), se avisa en el
  // momento con un cuadro de diálogo. Con el tope, el próximo intento lo avisa antes de que la persona escriba de nuevo.
  var CLAVE_TOPE = 'fbw:tope-hasta';
  var nDlg = 0;
  // T-112: el tope diario del servidor ({error:"tope diario"}) bloquea hasta las 00:00 UTC, en todas las pestañas.
  var CLAVE_DIA = 'fbw:tope-dia-hasta';
  function finDelDiaUtc() { var d = new Date(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1); }
  function topeDia() { try { return Number(localStorage.getItem(CLAVE_DIA) || 0) > Date.now(); } catch (e) { return false; } }
  function topeActivo() { if (topeDia()) return true; try { return Number(sessionStorage.getItem(CLAVE_TOPE) || 0) > Date.now(); } catch (e) { return false; } }
  // tipo: 'tope' o 'error'. msg: texto propio (si no, el de T). origen: a quién vuelve el foco al cerrar.
  // diario: true marca el tope del día (hasta las 00:00 UTC) en lugar del de 5 minutos.
  function dialogo(tipo, msg, origen, diario) {
    var tope = tipo === 'tope';
    if (tope && diario) { try { localStorage.setItem(CLAVE_DIA, String(finDelDiaUtc())); } catch (e) {} try { sessionStorage.setItem(CLAVE_TOPE, String(finDelDiaUtc())); } catch (e) {} }
    else if (tope && !topeDia()) { try { sessionStorage.setItem(CLAVE_TOPE, String(Date.now() + 5 * 60000)); } catch (e) {} }
    var vuelta = origen || (document.activeElement && document.activeElement !== document.body ? document.activeElement : null);
    var n = ++nDlg;
    var d = el('dialog', { class: 'fbw fbw-dlg', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'fbw-dlg-t' + n, 'aria-describedby': 'fbw-dlg-p' + n });
    var h = el('h2', { id: 'fbw-dlg-t' + n }); h.textContent = tope ? t.limitTitle : t.failTitle;
    var pp = el('p', { id: 'fbw-dlg-p' + n }); pp.textContent = msg || (tope ? t.limitIdle : t.failIdle);
    var b = el('button', { type: 'button', class: 'fbw-dlg-ok' }); b.textContent = t.limitOk;
    b.addEventListener('click', function () { d.close(); });
    d.addEventListener('close', function () {
      d.remove();
      if (vuelta && document.contains(vuelta) && !vuelta.disabled) vuelta.focus(); else if (document.contains(fab)) fab.focus();
    });
    d.appendChild(h); d.appendChild(pp); d.appendChild(b); document.body.appendChild(d);
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    b.focus();
  }
  window.__fbwDialogo = dialogo;
  window.__fbwAvisoTope = function (msg, origen) { dialogo('tope', msg, origen); };
  window.__fbwTopeActivo = topeActivo;

  var fab = el('button', { class: 'fbw fbw-fab', 'aria-label': t.open, title: t.open, style: '--fbc:' + CFG.color },
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></svg>');
  document.body.appendChild(fab);
  fab.addEventListener('click', function () { if (topeActivo()) dialogo('tope', topeDia() ? t.dayIdle : null, fab); else start(); });

  function device() {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Otro';
    var br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Otro';
    var w = window.innerWidth;
    return {
      type: w < 768 ? 'celular' : w < 1100 ? 'tablet' : 'compu', os: os, browser: br,
      viewport: w + 'x' + window.innerHeight, screen: screen.width + 'x' + screen.height,
      dpr: window.devicePixelRatio || 1, dark: !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches),
      lang: navigator.language, ua: ua
    };
  }

  function selectorOf(node) {
    if (!node || node.nodeType !== 1) return '';
    var parts = [];
    while (node && node.nodeType === 1 && node !== document.body && parts.length < 5) {
      var s = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(s + '#' + node.id); break; }
      var cls = (node.getAttribute('class') || '').trim().split(/\s+/).filter(function (c) { return c && c.length < 30; }).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      var p = node.parentElement;
      if (p) {
        var same = Array.prototype.filter.call(p.children, function (c) { return c.tagName === node.tagName; });
        if (same.length > 1) s += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
      }
      parts.unshift(s);
      node = p;
    }
    return parts.join(' > ');
  }

  function elementInfo(x, y) {
    var n = document.elementFromPoint(x, y);
    if (!n) return null;
    var txt = (n.innerText || n.alt || n.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    var heading = null, h = n;
    while (h && h !== document.body) {
      var prev = h;
      while (prev) {
        if (/^H[1-3]$/.test(prev.tagName)) { heading = prev.innerText.trim().slice(0, 120); break; }
        prev = prev.previousElementSibling;
      }
      if (heading) break;
      h = h.parentElement;
    }
    var r = n.getBoundingClientRect();
    return { selector: selectorOf(n), tag: n.tagName.toLowerCase(), text: txt, section: heading, area: r.width * r.height };
  }

  async function capture() {
    var ms = window.modernScreenshot;
    if (!ms) return null;
    var w = window.innerWidth, h = window.innerHeight, sx = window.scrollX, sy = window.scrollY;
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    // Al desplazar la raíz, lo fijo (menú, botones) se correría: se compensa durante la captura.
    var fixed = Array.prototype.filter.call(document.body.querySelectorAll('*'), function (n) {
      return !n.classList.contains('fbw') && getComputedStyle(n).position === 'fixed';
    });
    var saved = fixed.map(function (n) { var v = n.style.transform; n.style.transform = 'translate(' + sx + 'px,' + sy + 'px) ' + (v || ''); return v; });
    try {
      return await ms.domToCanvas(document.documentElement, {
        width: w, height: h, scale: scale, timeout: 8000,
        backgroundColor: getComputedStyle(document.body).backgroundColor || '#fff',
        style: { transform: 'translate(' + (-sx) + 'px,' + (-sy) + 'px)', transformOrigin: '0 0' },
        filter: function (n) { return !(n.classList && n.classList.contains('fbw')); }
      });
    } catch (e) { console.warn('[feedback] captura falló', e); return null; }
    finally { fixed.forEach(function (n, i) { n.style.transform = saved[i]; }); }
  }

  async function start() {
    var meta = { url: location.href, path: location.pathname, title: document.title, scrollY: Math.round(scrollY), device: device() };
    fab.style.display = 'none';
    var tmp = el('div', { class: 'fbw fbw-toast' }); tmp.textContent = t.capturing; document.body.appendChild(tmp);
    var shot = await capture();
    tmp.remove();
    openEditor(shot, meta);
  }

  function openEditor(shot, meta) {
    var layer = el('div', { class: 'fbw fbw-layer', style: '--fbc:' + CFG.color });
    var top = el('div', { class: 'fbw-top' });
    var hint = el('span'); hint.textContent = shot ? t.draw : t.noShot;
    var bUndo = el('button', { class: 'fbw-btn', type: 'button' }); bUndo.textContent = t.undo;
    var bClear = el('button', { class: 'fbw-btn', type: 'button' }); bClear.textContent = t.clear;
    top.append(hint, bUndo, bClear);
    var stage = el('div', { class: 'fbw-stage' });
    var base = el('canvas'), ink = el('canvas');
    stage.append(base, ink);
    var sheet = el('div', { class: 'fbw-sheet' });
    var ta = el('textarea', { placeholder: t.placeholder, rows: '3' });
    var row = el('div', { class: 'fbw-row' });
    var bMic = el('button', { class: 'fbw-btn', type: 'button' }); bMic.textContent = '🎤 ' + t.mic;
    var bCancel = el('button', { class: 'fbw-btn', type: 'button' }); bCancel.textContent = t.cancel;
    var bSend = el('button', { class: 'fbw-btn pri', type: 'button' }); bSend.textContent = t.send;
    var msg = el('div', { class: 'fbw-msg' });
    row.append(bMic, bCancel, bSend);
    sheet.append(ta, row, msg);
    layer.append(top, stage, sheet);
    document.body.appendChild(layer);
    var prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    // El lienzo replica la captura con su proporción; los trazos se guardan en coordenadas de la página.
    var vw = window.innerWidth, vh = window.innerHeight, box, ratio;
    function layout() {
      var r = stage.getBoundingClientRect();
      ratio = Math.min(r.width / vw, r.height / vh);
      box = { w: vw * ratio, h: vh * ratio, x: (r.width - vw * ratio) / 2, y: (r.height - vh * ratio) / 2 };
      var d = window.devicePixelRatio || 1;
      [base, ink].forEach(function (c) { c.width = r.width * d; c.height = r.height * d; c.getContext('2d').setTransform(d, 0, 0, d, 0, 0); });
      var bc = base.getContext('2d');
      bc.fillStyle = '#222'; bc.fillRect(0, 0, r.width, r.height);
      if (shot) bc.drawImage(shot, box.x, box.y, box.w, box.h);
      else { bc.fillStyle = '#fff'; bc.fillRect(box.x, box.y, box.w, box.h); }
      redraw();
    }
    var strokes = [], cur = null;
    function toPage(e) {
      var r = ink.getBoundingClientRect();
      return { x: (e.clientX - r.left - box.x) / ratio, y: (e.clientY - r.top - box.y) / ratio };
    }
    function drawStroke(ctx, s, k, ox, oy) {
      ctx.strokeStyle = CFG.color; ctx.lineWidth = 4 * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      s.forEach(function (p, i) { var X = ox + p.x * k, Y = oy + p.y * k; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      if (s.length === 1) ctx.lineTo(ox + s[0].x * k + 0.1, oy + s[0].y * k);
      ctx.stroke();
    }
    function redraw() {
      var c = ink.getContext('2d'); c.clearRect(0, 0, ink.width, ink.height);
      strokes.concat(cur ? [cur] : []).forEach(function (s) { drawStroke(c, s, ratio, box.x, box.y); });
    }
    ink.addEventListener('pointerdown', function (e) { e.preventDefault(); ink.setPointerCapture(e.pointerId); cur = [toPage(e)]; redraw(); });
    ink.addEventListener('pointermove', function (e) { if (!cur) return; cur.push(toPage(e)); redraw(); });
    function endStroke() { if (cur) { strokes.push(cur); cur = null; redraw(); } }
    ink.addEventListener('pointerup', endStroke);
    ink.addEventListener('pointercancel', endStroke);
    bUndo.onclick = function () { strokes.pop(); redraw(); };
    bClear.onclick = function () { strokes = []; redraw(); };
    window.addEventListener('resize', layout);
    layout();

    // Dictado por voz (Web Speech API). Si no está, queda el micrófono del teclado.
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
    bMic.onclick = function () {
      if (!SR) { msg.textContent = t.micHint; ta.focus(); return; }
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = speechLang; rec.interimResults = true; rec.continuous = true;
      var baseText = ta.value ? ta.value.replace(/\s*$/, ' ') : '';
      rec.onresult = function (ev) {
        var fin = '', tmp = '';
        for (var i = 0; i < ev.results.length; i++) (ev.results[i].isFinal ? (fin += ev.results[i][0].transcript) : (tmp += ev.results[i][0].transcript));
        ta.value = baseText + fin + tmp;
      };
      rec.onerror = function (ev) { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') msg.textContent = t.micHint; };
      rec.onend = function () { rec = null; bMic.classList.remove('rec'); bMic.textContent = '🎤 ' + t.mic; };
      try { rec.start(); bMic.classList.add('rec'); bMic.textContent = '■ ' + t.stop; msg.textContent = ''; }
      catch (e) { rec = null; msg.textContent = t.micHint; }
    };

    function close() {
      if (rec) try { rec.abort(); } catch (e) {}
      window.removeEventListener('resize', layout);
      layer.remove();
      document.documentElement.style.overflow = prevOverflow;
      fab.style.display = '';
    }
    bCancel.onclick = close;

    bSend.onclick = async function () {
      var text = ta.value.trim();
      if (!text && !strokes.length) { msg.textContent = t.empty; return; }
      if (rec) try { rec.stop(); } catch (e) {}
      bSend.disabled = true; bSend.textContent = t.sending; msg.textContent = '';
      // Imagen final: captura + marcas, a tamaño de la pantalla (máx. 1200 px de ancho).
      var image = null;
      if (shot || strokes.length) {
        var k = Math.min(1, 1200 / vw), out = document.createElement('canvas');
        out.width = Math.round(vw * k); out.height = Math.round(vh * k);
        var oc = out.getContext('2d');
        oc.fillStyle = '#fff'; oc.fillRect(0, 0, out.width, out.height);
        if (shot) oc.drawImage(shot, 0, 0, out.width, out.height);
        strokes.forEach(function (s) { drawStroke(oc, s, k, 0, 0); });
        image = out.toDataURL('image/jpeg', 0.75);
      }
      // Elemento marcado: el que está debajo del primer trazo.
      var element = null;
      if (strokes.length) {
        layer.style.display = 'none';
        document.documentElement.style.overflow = prevOverflow;
        window.scrollTo(0, meta.scrollY);
        // Se elige el elemento más chico bajo los trazos (no el contenedor general).
        var best = null;
        strokes.forEach(function (st) {
          for (var i = 0; i < st.length; i += Math.max(1, Math.floor(st.length / 6))) {
            var info = elementInfo(st[i].x, st[i].y);
            if (info && info.tag !== 'body' && info.tag !== 'html' && (!best || info.area < best.area)) best = info;
          }
        });
        if (!best) {
          // Trazo en un margen: se busca el elemento más cercano por encima.
          var q = strokes[0][0];
          for (var dy = 0; dy < 200 && !best; dy += 10) { var inf = elementInfo(q.x, q.y - dy); if (inf && inf.tag !== 'body' && inf.tag !== 'html' && inf.tag !== 'section' && inf.tag !== 'main') best = inf; }
        }
        element = best;
        if (element) delete element.area;
        layer.style.display = '';
      }
      var marks = strokes.map(function (s) {
        var xs = s.map(function (p) { return p.x; }), ys = s.map(function (p) { return p.y; });
        return { x: Math.round(Math.min.apply(null, xs)), y: Math.round(Math.min.apply(null, ys) + meta.scrollY), w: Math.round(Math.max.apply(null, xs) - Math.min.apply(null, xs)), h: Math.round(Math.max.apply(null, ys) - Math.min.apply(null, ys)) };
      });
      try {
        var res = await fetch(CFG.api, {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(Object.assign({}, meta, { text: text, image: image, element: element, marks: marks, createdAt: new Date().toISOString() }))
        });
        if (res.status === 429) {
          var e429 = null; try { e429 = await res.json(); } catch (eJ) {}
          var dia = !!(e429 && e429.error === 'tope diario');
          bSend.disabled = false; bSend.textContent = t.send; msg.textContent = dia ? t.day : t.limit; dialogo('tope', dia ? t.day : t.limit, bSend, dia); return;
        }
        if (!res.ok) throw new Error(res.status);
        close(); toast(t.sent);
      } catch (e) {
        console.warn('[feedback] envío falló', e);
        bSend.disabled = false; bSend.textContent = t.send; msg.textContent = t.error;
        dialogo('error', t.fail, bSend);
      }
    };
  }
})();
