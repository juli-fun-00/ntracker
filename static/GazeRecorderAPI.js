

var GazeRecorderAPI = new function GazeRecorderInit() {





var _rrwebRecord=function(){"use strict";var e,t=function(){return(t=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function n(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}}function r(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,a=n.call(e),i=[];try{for(;(void 0===t||t-- >0)&&!(r=a.next()).done;)i.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=a.return)&&n.call(a)}finally{if(o)throw o.error}}return i}function o(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(r(arguments[t]));return e}!function(e){e[e.Document=0]="Document",e[e.DocumentType=1]="DocumentType",e[e.Element=2]="Element",e[e.Text=3]="Text",e[e.CDATA=4]="CDATA",e[e.Comment=5]="Comment"}(e||(e={}));var a=1;function i(e){try{var t=e.rules||e.cssRules;return t?Array.from(t).reduce(function(e,t){return e+(function(e){return"styleSheet"in e}(n=t)?i(n.styleSheet)||"":n.cssText);var n},""):null}catch(e){return null}}var u=/url\((?:'([^']*)'|"([^"]*)"|([^)]*))\)/gm,c=/^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/,s=/^(data:)([\w\/\+\-]+);(charset=[\w-]+|base64).*,(.*)/i;function l(e,t){return e.replace(u,function(e,n,r,o){var a,i=n||r||o;if(!i)return e;if(!c.test(i))return"url('"+i+"')";if(s.test(i))return"url("+i+")";if("/"===i[0])return"url('"+(((a=t).indexOf("//")>-1?a.split("/").slice(0,3).join("/"):a.split("/")[0]).split("?")[0]+i)+"')";var u=t.split("/"),l=i.split("/");u.pop();for(var d=0,f=l;d<f.length;d++){var p=f[d];"."!==p&&(".."===p?u.pop():u.push(p))}return"url('"+u.join("/")+"')"})}function d(e,t){if(""===t.trim())return t;var n=e.createElement("a");return n.href=t,n.href}function f(e,t,n){return"src"===t||"href"===t?d(e,n):"srcset"===t?function(e,t){return""===t.trim()?t:t.split(",").map(function(t){var n=t.trimLeft().trimRight().split(" ");return 2===n.length?d(e,n[0])+" "+n[1]:1===n.length?""+d(e,n[0]):""}).join(",")}(e,n):"style"===t?l(n,location.href):n}function p(t,n,r,o,u,c,s){void 0===u&&(u=!1),void 0===c&&(c=!0),void 0===s&&(s=!1);var d,m=function(t,n,r,o,a){switch(t.nodeType){case t.DOCUMENT_NODE:return{type:e.Document,childNodes:[]};case t.DOCUMENT_TYPE_NODE:return{type:e.DocumentType,name:t.name,publicId:t.publicId,systemId:t.systemId};case t.ELEMENT_NODE:var u=!1;"string"==typeof r?u=t.classList.contains(r):t.classList.forEach(function(e){r.test(e)&&(u=!0)});for(var c=t.tagName.toLowerCase(),s={},d=0,p=Array.from(t.attributes);d<p.length;d++){var m=p[d],h=m.name,v=m.value;s[h]=f(n,h,v)}if("link"===c&&o){var y,g=Array.from(n.styleSheets).find(function(e){return e.href===t.href});(y=i(g))&&(delete s.rel,delete s.href,s._cssText=l(y,g.href))}if("style"===c&&t.sheet&&!(t.innerText||t.textContent||"").trim().length&&(y=i(t.sheet))&&(s._cssText=l(y,location.href)),"input"!==c&&"textarea"!==c&&"select"!==c||(v=t.value,"radio"!==s.type&&"checkbox"!==s.type&&v?s.value=a?"*".repeat(v.length):v:t.checked&&(s.checked=t.checked)),"option"===c){var b=t.parentElement;s.value===b.value&&(s.selected=t.selected)}if("canvas"===c&&(s.rr_dataURL=t.toDataURL()),u){var E=t.getBoundingClientRect(),C=E.width,w=E.height;s.rr_width=C+"px",s.rr_height=w+"px"}return{type:e.Element,tagName:c,attributes:s,childNodes:[],isSVG:(S=t,"svg"===S.tagName||S instanceof SVGElement||void 0),needBlock:u};case t.TEXT_NODE:var N=t.parentNode&&t.parentNode.tagName,T=t.textContent,I="STYLE"===N||void 0;return I&&T&&(T=l(T,location.href)),"SCRIPT"===N&&(T="SCRIPT_PLACEHOLDER"),{type:e.Text,textContent:T||"",isStyle:I};case t.CDATA_SECTION_NODE:return{type:e.CDATA,textContent:""};case t.COMMENT_NODE:return{type:e.Comment,textContent:t.textContent||""};default:return!1}var S}(t,n,o,c,s);if(!m)return console.warn(t,"not serialized"),null;d="__sn"in t?t.__sn.id:a++;var h=Object.assign(m,{id:d});t.__sn=h,r[d]=t;var v=!u;if(h.type===e.Element&&(v=v&&!h.needBlock,delete h.needBlock),(h.type===e.Document||h.type===e.Element)&&v)for(var y=0,g=Array.from(t.childNodes);y<g.length;y++){var b=p(g[y],n,r,o,u,c,s);b&&h.childNodes.push(b)}return h}function m(e,t,n){void 0===n&&(n=document);var r={capture:!0,passive:!0};return n.addEventListener(e,t,r),function(){return n.removeEventListener(e,t,r)}}var h,v,y,g,b={map:{},getId:function(e){return e.__sn?e.__sn.id:-1},getNode:function(e){return b.map[e]||null},removeNodeFromMap:function(e){var t=e.__sn&&e.__sn.id;delete b.map[t],e.childNodes&&e.childNodes.forEach(function(e){return b.removeNodeFromMap(e)})},has:function(e){return b.map.hasOwnProperty(e)}};function E(e,t,n){void 0===n&&(n={});var r=null,o=0;return function(a){var i=Date.now();o||!1!==n.leading||(o=i);var u=t-(i-o),c=this,s=arguments;u<=0||u>t?(r&&(window.clearTimeout(r),r=null),o=i,e.apply(c,s)):r||!1===n.trailing||(r=window.setTimeout(function(){o=!1===n.leading?0:Date.now(),r=null,e.apply(c,s)},u))}}function C(){return window.innerHeight||document.documentElement&&document.documentElement.clientHeight||document.body&&document.body.clientHeight}function w(){return window.innerWidth||document.documentElement&&document.documentElement.clientWidth||document.body&&document.body.clientWidth}function N(e,t){if(!e)return!1;if(e.nodeType===e.ELEMENT_NODE){var n=!1;return"string"==typeof t?n=e.classList.contains(t):e.classList.forEach(function(e){t.test(e)&&(n=!0)}),n||N(e.parentNode,t)}return N(e.parentNode,t)}function T(e){return Boolean(e.changedTouches)}function I(e,t){e.delete(t),t.childNodes.forEach(function(t){return I(e,t)})}function S(e,t){var n=t.parentNode;if(!n)return!1;var r=b.getId(n);return!!e.some(function(e){return e.id===r})||S(e,n)}function D(e,t){var n=t.parentNode;return!!n&&(!!e.has(n)||D(e,n))}!function(e){e[e.DomContentLoaded=0]="DomContentLoaded",e[e.Load=1]="Load",e[e.FullSnapshot=2]="FullSnapshot",e[e.IncrementalSnapshot=3]="IncrementalSnapshot",e[e.Meta=4]="Meta",e[e.Custom=5]="Custom"}(h||(h={})),function(e){e[e.Mutation=0]="Mutation",e[e.MouseMove=1]="MouseMove",e[e.MouseInteraction=2]="MouseInteraction",e[e.Scroll=3]="Scroll",e[e.ViewportResize=4]="ViewportResize",e[e.Input=5]="Input",e[e.TouchMove=6]="TouchMove"}(v||(v={})),function(e){e[e.MouseUp=0]="MouseUp",e[e.MouseDown=1]="MouseDown",e[e.Click=2]="Click",e[e.ContextMenu=3]="ContextMenu",e[e.DblClick=4]="DblClick",e[e.Focus=5]="Focus",e[e.Blur=6]="Blur",e[e.TouchStart=7]="TouchStart",e[e.TouchMove_Departed=8]="TouchMove_Departed",e[e.TouchEnd=9]="TouchEnd"}(y||(y={})),function(e){e.Start="start",e.Pause="pause",e.Resume="resume",e.Resize="resize",e.Finish="finish",e.FullsnapshotRebuilded="fullsnapshot-rebuilded",e.LoadStylesheetStart="load-stylesheet-start",e.LoadStylesheetEnd="load-stylesheet-end",e.SkipStart="skip-start",e.SkipEnd="skip-end",e.MouseInteraction="mouse-interaction"}(g||(g={}));var x=function(e,t){return e+"@"+t};function M(e){return"__sn"in e}function k(e,t,r,o){var a=new MutationObserver(function(a){var i,u,c,s,l=[],d=[],m=[],h=[],v=new Set,y=new Set,g=new Set,E={},C=function(e,n){if(!N(e,t)){if(M(e)){y.add(e);var r=null;n&&M(n)&&(r=n.__sn.id),r&&(E[x(e.__sn.id,r)]=!0)}else v.add(e),g.delete(e);e.childNodes.forEach(function(e){return C(e)})}};a.forEach(function(e){var n=e.type,r=e.target,o=e.oldValue,a=e.addedNodes,i=e.removedNodes,u=e.attributeName;switch(n){case"characterData":var c=r.textContent;N(r,t)||c===o||l.push({value:c,node:r});break;case"attributes":c=r.getAttribute(u);if(N(r,t)||c===o)return;var s=d.find(function(e){return e.node===r});s||(s={node:r,attributes:{}},d.push(s)),s.attributes[u]=f(document,u,c);break;case"childList":a.forEach(function(e){return C(e,r)}),i.forEach(function(e){var n=b.getId(e),o=b.getId(r);N(e,t)||(v.has(e)?(I(v,e),g.add(e)):v.has(r)&&-1===n||function e(t){var n=b.getId(t);return!b.has(n)||(!t.parentNode||t.parentNode.nodeType!==t.DOCUMENT_NODE)&&(!t.parentNode||e(t.parentNode))}(r)||(y.has(e)&&E[x(n,o)]?I(y,e):m.push({parentId:o,id:n})),b.removeNodeFromMap(e))})}});var w=[],T=function(e){var n=b.getId(e.parentNode);if(-1===n)return w.push(e);h.push({parentId:n,previousId:e.previousSibling?b.getId(e.previousSibling):e.previousSibling,nextId:e.nextSibling?b.getId(e.nextSibling):e.nextSibling,node:p(e,document,b.map,t,!0,r,o)})};try{for(var k=n(y),L=k.next();!L.done;L=k.next()){T(A=L.value)}}catch(e){i={error:e}}finally{try{L&&!L.done&&(u=k.return)&&u.call(k)}finally{if(i)throw i.error}}try{for(var _=n(v),O=_.next();!O.done;O=_.next()){var A=O.value;D(g,A)||S(m,A)?D(y,A)?T(A):g.add(A):T(A)}}catch(e){c={error:e}}finally{try{O&&!O.done&&(s=_.return)&&s.call(_)}finally{if(c)throw c.error}}for(;w.length&&!w.every(function(e){return-1===b.getId(e.parentNode)});)T(w.shift());var R={texts:l.map(function(e){return{id:b.getId(e.node),value:e.value}}).filter(function(e){return b.has(e.id)}),attributes:d.map(function(e){return{id:b.getId(e.node),attributes:e.attributes}}).filter(function(e){return b.has(e.id)}),removes:m,adds:h};(R.texts.length||R.attributes.length||R.removes.length||R.adds.length)&&e(R)});return a.observe(document,{attributes:!0,attributeOldValue:!0,characterData:!0,characterDataOldValue:!0,childList:!0,subtree:!0}),a}function L(e,t){var n=[];return Object.keys(y).filter(function(e){return Number.isNaN(Number(e))&&!e.endsWith("_Departed")}).forEach(function(r){var o=r.toLowerCase(),a=function(n){return function(r){if(!N(r.target,t)){var o=b.getId(r.target),a=T(r)?r.changedTouches[0]:r,i=a.clientX,u=a.clientY;e({type:y[n],id:o,x:i,y:u})}}}(r);n.push(m(o,a))}),function(){n.forEach(function(e){return e()})}}var _,O=["INPUT","TEXTAREA","SELECT"],A=["color","date","datetime-local","email","month","number","range","search","tel","text","time","url","week"],R=new WeakMap;function z(e,n,r,a){function i(e){var t=e.target;if(t&&t.tagName&&!(O.indexOf(t.tagName)<0)&&!N(t,n)){var o=t.type;if("password"!==o&&!t.classList.contains(r)){var i=t.value,c=!1,s=A.includes(o)||"TEXTAREA"===t.tagName;"radio"===o||"checkbox"===o?c=t.checked:s&&a&&(i="*".repeat(i.length)),u(t,{text:i,isChecked:c});var l=t.name;"radio"===o&&l&&c&&document.querySelectorAll('input[type="radio"][name="'+l+'"]').forEach(function(e){e!==t&&u(e,{text:e.value,isChecked:!c})})}}}function u(n,r){var o=R.get(n);if(!o||o.text!==r.text||o.isChecked!==r.isChecked){R.set(n,r);var a=b.getId(n);e(t({},r,{id:a}))}}var c=["input","change"].map(function(e){return m(e,i)}),s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"),l=[[HTMLInputElement.prototype,"value"],[HTMLInputElement.prototype,"checked"],[HTMLSelectElement.prototype,"value"],[HTMLTextAreaElement.prototype,"value"]];return s&&s.set&&c.push.apply(c,o(l.map(function(e){return function e(t,n,r,o){var a=Object.getOwnPropertyDescriptor(t,n);return Object.defineProperty(t,n,o?r:{set:function(e){var t=this;setTimeout(function(){r.set.call(t,e)},0),a&&a.set&&a.set.call(this,e)}}),function(){return e(t,n,a||{},!0)}}(e[0],e[1],{set:function(){i({target:this})}})}))),function(){c.forEach(function(e){return e()})}}function F(e,t){void 0===t&&(t={}),function(e,t){var n=e.mutationCb,r=e.mousemoveCb,a=e.mouseInteractionCb,i=e.scrollCb,u=e.viewportResizeCb,c=e.inputCb;e.mutationCb=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];t.mutation&&t.mutation.apply(t,o(e)),n.apply(void 0,o(e))},e.mousemoveCb=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];t.mousemove&&t.mousemove.apply(t,o(e)),r.apply(void 0,o(e))},e.mouseInteractionCb=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];t.mouseInteraction&&t.mouseInteraction.apply(t,o(e)),a.apply(void 0,o(e))},e.scrollCb=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];t.scroll&&t.scroll.apply(t,o(e)),i.apply(void 0,o(e))},e.viewportResizeCb=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];t.viewportResize&&t.viewportResize.apply(t,o(e)),u.apply(void 0,o(e))},e.inputCb=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];t.input&&t.input.apply(t,o(e)),c.apply(void 0,o(e))}}(e,t);var n,r,a,i,u,c,s,l=k(e.mutationCb,e.blockClass,e.inlineStylesheet,e.maskAllInputs),d=(n=e.mousemoveCb,r=e.mousemoveWait,i=[],u=E(function(e){var t=Date.now()-a;n(i.map(function(e){return e.timeOffset-=t,e}),e?v.TouchMove:v.MouseMove),i=[],a=null},500),c=E(function(e){var t=e.target,n=T(e)?e.changedTouches[0]:e,r=n.clientX,o=n.clientY;a||(a=Date.now()),i.push({x:r,y:o,id:b.getId(t),timeOffset:Date.now()-a}),u(T(e))},r,{trailing:!1}),s=[m("mousemove",c),m("touchmove",c)],function(){s.forEach(function(e){return e()})}),f=L(e.mouseInteractionCb,e.blockClass),p=function(e,t){return m("scroll",E(function(n){if(n.target&&!N(n.target,t)){var r=b.getId(n.target);if(n.target===document){var o=document.scrollingElement||document.documentElement;e({id:r,x:o.scrollLeft,y:o.scrollTop})}else e({id:r,x:n.target.scrollLeft,y:n.target.scrollTop})}},100))}(e.scrollCb,e.blockClass),h=function(e){return m("resize",E(function(){var t=C(),n=w();e({width:Number(n),height:Number(t)})},200),window)}(e.viewportResizeCb),y=z(e.inputCb,e.blockClass,e.ignoreClass,e.maskAllInputs);return function(){l.disconnect(),d(),f(),p(),h(),y()}}function P(e){return t({},e,{timestamp:Date.now()})}function j(e){void 0===e&&(e={});var n,o=e.emit,a=e.checkoutEveryNms,i=e.checkoutEveryNth,u=e.blockClass,c=void 0===u?"rr-block":u,s=e.ignoreClass,l=void 0===s?"rr-ignore":s,d=e.inlineStylesheet,f=void 0===d||d,y=e.maskAllInputs,g=void 0!==y&&y,E=e.hooks,N=e.mousemoveWait,T=void 0===N?50:N;if(!o)throw new Error("emit function is required");"NodeList"in window&&!NodeList.prototype.forEach&&(NodeList.prototype.forEach=Array.prototype.forEach);var I=0;function S(e){void 0===e&&(e=!1),_(P({type:h.Meta,data:{href:window.location.href,width:w(),height:C()}}),e);var t=r(function(e,t,n,r){void 0===t&&(t="rr-block"),void 0===n&&(n=!0),void 0===r&&(r=!1);var o={};return[p(e,e,o,t,!1,n,r),o]}(document,c,f,g),2),n=t[0],o=t[1];if(!n)return console.warn("Failed to snapshot the document");b.map=o,_(P({type:h.FullSnapshot,data:{node:n,initialOffset:{left:document.documentElement.scrollLeft,top:document.documentElement.scrollTop}}}))}_=function(e,t){if(o(e,t),e.type===h.FullSnapshot)n=e,I=0;else if(e.type===h.IncrementalSnapshot){I++;var r=i&&I>=i,u=a&&e.timestamp-n.timestamp>a;(r||u)&&S(!0)}};try{var D=[];D.push(m("DOMContentLoaded",function(){_(P({type:h.DomContentLoaded,data:{}}))}));var x=function(){S(),D.push(F({mutationCb:function(e){return _(P({type:h.IncrementalSnapshot,data:t({source:v.Mutation},e)}))},mousemoveCb:function(e,t){return _(P({type:h.IncrementalSnapshot,data:{source:t,positions:e}}))},mouseInteractionCb:function(e){return _(P({type:h.IncrementalSnapshot,data:t({source:v.MouseInteraction},e)}))},scrollCb:function(e){return _(P({type:h.IncrementalSnapshot,data:t({source:v.Scroll},e)}))},viewportResizeCb:function(e){return _(P({type:h.IncrementalSnapshot,data:t({source:v.ViewportResize},e)}))},inputCb:function(e){return _(P({type:h.IncrementalSnapshot,data:t({source:v.Input},e)}))},blockClass:c,ignoreClass:l,maskAllInputs:g,inlineStylesheet:f,mousemoveWait:T},E))};return"interactive"===document.readyState||"complete"===document.readyState?x():D.push(m("load",function(){_(P({type:h.Load,data:{}})),x()},window)),function(){D.forEach(function(e){return e()})}}catch(e){console.warn(e)}}return j.addCustomEvent=function(e,t){if(!_)throw new Error("please add custom event after start recording");_(P({type:h.Custom,data:{tag:e,payload:t}}))},j}();

//# sourceMappingURL=rrweb-record.min.js.map



var bStopR = false;

	var RecorginFirstEventNr = 0;

	var WebRecFinished = false;

	var isWaitForSendRec = null;



	function StopWebRec() {

		bStopR = true;

		if (_stopFn != null) {

			_stopFn();

			RecorginFirstEventNr = eventsWeb.length;

		}

	}

	//------------------------------





    //------------------------------

    	var _stopFn = null;

	function StartWebRec() {

		bStopR = false;

		_stopFn = _rrwebRecord({

			emit(event) {

				// push event into the events array

				if (!bStopR) {

					eventsWeb.push(event);

					if (true) //tmp 

					{

						try {

							if (typeof GazeCloudAPI !== 'undefined')

								GazeCloudAPI.AddIFrameEvent(event);

						} catch (e) {}

					}

				} else {

					_stopFn();

					WebRecFinished = true;

				}

			},

		});

	}

	//-------------------------

	function ShiftStartRecTime() {

		var t = Date.now(); //eventsWeb[eventsWeb.length-1].timestamp;

		for (i = 0; i < eventsWeb.length; i++)

			eventsWeb[i].timestamp = t;

	}





	//-------------------------
	//if(false)
	window.addEventListener("DOMContentLoaded", function() {

		StartWebRec();

	});

	var Logg = false;

	///////////////////////

	let eventsWeb = [];

	let eventsGaze = [];

	//-------------------

	var iframeProxyRecUrl = "https://app.gazerecorder.com/proxyrec/index.php?q="

	var iframeRec = null;

	//------------------------------------------

	var bGUIInitialized = false;
//--------------

this.preload=  function (url){

return;
var _tmp = '<div style="display:none"><iframe  sandbox id="iframepreload"></iframe></div>';
document.body.insertAdjacentHTML('beforeend',_tmp);

setTimeout( function(){
var s = 'https://app.gazerecorder.com/proxyrec/Preload?q=' + url;
document.getElementById('iframepreload').src = s;
}, 500);


}

//-------------------------
	function InitGUI() {

		if (bGUIInitialized)

			return;

		bGUIInitialized = true;

		//document.body.style.overflow='auto';

		document.body.style.overflow = 'hidden';

		document.body.style.margin = '0px';

		document.body.style.width = '100%';

		document.body.style.height = '100%';

		var _GuiHtml = '<div id = "GazeRecorderDivId" style="background-color: white; position: fixed; Left: 0px; Top:0px; z-index: 10; height:100%; width: 100%;" ><iframe  id="iframe" ;" frameborder="0" height="100%"; width="100%";   sandbox="allow-scripts allow-same-origin  allow-forms " ></iframe> <div id="loadid_"  style= " height:100%; width:100%;left: 0px; position: fixed; top: 0%;display:none;opacity: 0.8; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;"> Loading...</h1> <div class="loader"></div> </div>  <div id="loadErrid" style= " height:100%; width:100%;left: 0px; position: fixed; top: 0%;display:none;opacity: 0.93; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;"> This web side can not be loaded form security resons...</h1> <div class="loader"></div> </div> </div>';

		

		document.body.insertAdjacentHTML('beforeend', _GuiHtml);


		var iframe = document.getElementById("iframe");

		iframe.addEventListener('load', IFrameLoaded);

		try {

			if (typeof GazePlayer !== 'undefined')

				GazePlayer.FinishPlay();

		} catch (e) {

			console.log('InitGUI err gazerecorder');

		}


	}

	//------------------------------------------

this.SetLoadingEvent =  function (start){

try
{
if(start)
	AddWebEvent(10);//tmp v2
else
	AddWebEvent(11);//tmp v2

}
catch(ee)
{}
}


//------------------------------------------



	this.GetRecData = function() {

		if (false) {

			var _ix = RecorginFirstEventNr; //-1;

			if (_ix < 0)

				_ix = 0;

			for (i = _ix; i < eventsWeb.length; i++)

				if (eventsWeb[i].type == 4) break;

				else

					_ix = i;

			var _eventsWeb = eventsWeb.slice(_ix, eventsWeb.length); //tmp one blob

			var result = {

				webevents: _eventsWeb,

				gazeevents: eventsGaze

			};

		}

		var result = {

			webevents: eventsWeb,

			gazeevents: eventsGaze

		};





        if(false)// copy

        {

        var w = Object.assign({}, eventsWeb);

        var g = Object.assign({}, eventsGaze);

        	 result = {

			webevents: w ,

			gazeevents: g  

            }

		};



    



		return result;

	}

	//------------------------------------------


	function lzw_decode(s) {
		var dict = new Map(); // Use a Map!
		var data = Array.from(s + "");
		var currChar = data[0];
		var oldPhrase = currChar;
		var out = [currChar];
		var code = 256; //codeInit;
		var phrase;
		for (var i = 1; i < data.length; i++) {
			var currCode = data[i].codePointAt(0);
			if (currCode < 256) {
				phrase = data[i];
			} else {
				phrase = dict.has(currCode) ? dict.get(currCode) : (oldPhrase + currChar);
			}
			out.push(phrase);
			var cp = phrase.codePointAt(0);
			currChar = String.fromCodePoint(cp); //phrase.charAt(0);
			dict.set(code, oldPhrase + currChar);
			code++;
			if (code === 0xd800) {
				code = 0xe000;
			}
			oldPhrase = phrase;
		}
		// if(false)
		//if(bUseUnicode)//decode
		{
			var ss = out.join("");
			var data = (ss + "").split("");
			//var  data = out;//Array.from(back + "");
			var uint8array = new Uint8Array(data.length); //[];// new TextEncoder("utf-8").encode(s);
			for (var i = 0; i < data.length; i++)
				//uint8array.push(data[i].codePointAt(0));
				uint8array[i] = data[i].codePointAt(0);
			var back = new TextDecoder().decode(uint8array);
			return back;
		}
		return out.join("");
	}

//------------------------------------------

	function lzw_encode(s) {
	var bUseUnicode = true;

if (!s) return s;
		var dict = new Map(); // Use a Map!				
		var code = 256;
		var codeInit = 256;


		try {
			if (!s) return s;
			var out = [];
			var data = (s + "").split("");
			
			if (bUseUnicode) {
				var uint8array = new TextEncoder("utf-8").encode(s);
				//s = new TextDecoder().decode(uint8array);
				data = [];
				for (var i = 0; i < uint8array.length; i++) data[i] = String.fromCodePoint(uint8array[i]);
			}
			var currChar;
			var phrase = data[0];
			for (var i = 1; i < data.length; i++) {
				currChar = data[i];
				if (dict.has(phrase + currChar)) {
					phrase += currChar;
				} else {
					if (phrase.length > 0) {
						out.push(phrase.length > 1 ? dict.get(phrase) : phrase.codePointAt(0));
						dict.set(phrase + currChar, code);
						code++;
						if (code === 0xd800) {
							code = 0xe000;
						}
					}
					phrase = currChar;
				}
			}
			out.push(phrase.length > 1 ? dict.get(phrase) : phrase.codePointAt(0));
			code++;
			for (var i = 0; i < out.length; i++) {
				out[i] = String.fromCodePoint(out[i]);
			}
			//console.log ("LZW MAP SIZE", dict.size, out.slice (-50), out.length, out.join("").length);
			return out.join("");
		} catch (e) {
			var a = 1;
			a++;
		}
	}
//-------------------------------------------

this.GetRecDataCompress = function() {

var s = JSON.stringify(eventsWeb);
var out = lzw_encode(s);


return out ;

}
//-------------------------------------------

	this.OnNavigation = null;

	this.OnNavigationErr = null;


	//------------------------------------------

	this.StopRec = function() {

		if (true)

			StopWebRec();

		try {

			ShowLoadingContent(false);

			document.body.style.overflow = 'auto';

			var element = document.getElementById("GazeRecorderDivId");

			if (element)

				element.parentNode.removeChild(element);

		} catch (e) {}

	}

	//------------------------------------------


var ShiftRecSet = false;


	this.Rec = function(url = "") {

		if (typeof GazeCloudAPI !== 'undefined') {

			GazeCloudAPI.OnGazeEvent = function(event) {

				eventsGaze.push(event.data);

				if (false) //tmp 

				{

					try {

						if (typeof GazeCloudAPI !== 'undefined')

							GazeCloudAPI.AddIFrameEvent(event);

					} catch (e) {}

				}

			}

		}

		if (url == "") {

			if (false) {

				if (typeof GazeCloudAPI !== 'undefined') {

					GazeCloudAPI.OnWebEvent = function(event) {

						eventsGaze.push(event.data);

					}

				}

			}

			if (false)

				StartWebRec();

			if (true)

            {

				ShiftStartRecTime();

               // AddWebEvent(10,true);

              //  AddWebEvent(11,true); 



            }

		

		} else {

			StopWebRec();

			this.StopRec();

			InitGUI();

//setTimeout( function(){},10);
			var iframe = document.getElementById("iframe");

			this.StartRecSesion(url, iframe);


		}





        	AddWebEvent(13,true); //start rec event
		ShiftRecSet  = true;


	}

	//------------------------------------------



/*
	function deleteAllCookies() {
 var c = document.cookie.split("; ");
 for (i in c) 
  document.cookie =/^[^=]+/.exec(c[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";    
}
*/


	this.clearcookie = true;//false;//true;


	this.Navigate = function(url) {

		InitGUI();

		if (true) //////////navigate/////

		{

			ShowLoadingContent(true);

			var iframe = document.getElementById("iframe");

			iframeRec = iframe;

			var _urlsrc = iframeProxyRecUrl + url.trim() ;


			if(this.clearcookie )
 				_urlsrc +=  '&_clearcookie_=1';


			iframeRec.src = _urlsrc;

			IFrameLoc = iframeRec.src; /////!!!

			IFrameLocLast = "";

            	

			IFrameLocLast = _urlsrc + "&_noscripts_=1"; // force no script




		} //////////end navigate/////

	}

	//------------------------------------------



    this.EndRecSesion = function() {



        if(true)

             AddWebEvent(14,true); //end sesion rec event

 

		try {

			ShowLoadingContent(false);

			document.body.style.overflow = 'auto';

			var element = document.getElementById("GazeRecorderDivId");

			if (element)

				element.parentNode.removeChild(element);

		} catch (e) {}





    }



    	//------------------------------------------

	this.StartRecSesion = function(url, iframe) {

		//if(false)

		{

			eventsWeb = [];

			eventsGaze = [];

		}

		SendBlobsChunkNr = 0;

		RecordinSesionId = "";

		LastSendEventNr = 0;

		LastSendEvenGazetNr = 0;

		if (true) //loading tmp

		{

			ShowLoadingContent(true);

		}

		this.Navigate(url);

		SendWebRecLoop();

	}

	//-------------------



    this.RefreshHeatMap = function() {



       // AddWebEvent(10);

       // AddWebEvent(11);

       // setTimeout(function(){ AddWebEvent(11); }, 10);

    }



    	//-------------------

	function AddWebEvent(type, force=false) {

		var webevent = JSON.parse('{"type":' + type + ', "timestamp":' + Date.now() + ' }');

		//if (eventsWeb.length > 2 || force)

         {

			eventsWeb.push(webevent);

			if (true) //tmp 

			{

				try {

					if (typeof GazeCloudAPI !== 'undefined')

						GazeCloudAPI.AddIFrameEvent(webevent);

				} catch (e) {}

			}

		}

	}



	function ShowLoadingContent(bloading = false) {

		//return;//tmp

		try {

			if (bloading) {


				//if(false)//tmp v2
				{
				AddWebEvent(10);//tmp v2

				document.getElementById("loadid_").style.display = 'block';


			


				}

if(true)//v2
try
{

			if (typeof GazeCloudAPI !== 'undefined')
				GazeCloudAPI.SetFps(10);

var iframe = document.getElementById("iframe");

if(iframe != null)
{
				iframe .focus();

				iframe .contentWindow.focus();


}
}
catch(e)
{}



			} else /////////////finish loading///////////////

{

if(!ShiftRecSet  )
{
ShiftRecSet  = true;
ShiftStartRecTime();
AddWebEvent(13,true); //start rec event
}


				AddWebEvent(11);

				document.getElementById("loadid_").style.display = 'none';

				document.getElementById("loadErrid").style.display = 'none';


		if(true)//v2
{
try
{
	if (typeof GazeCloudAPI !== 'undefined')
				GazeCloudAPI.SetFps(30);
}
catch(ee){};

			window.focus();
}


			}

		} catch (e) {}

	}

	//-------------------

	function ShowLoadingErr() {

		try {

			AddWebEvent(12);

		} catch (e) {}

		document.getElementById("loadid_").style.display = 'none';

		document.getElementById("loadErrid").style.display = 'block';

	}

	//-------------------------

	var IFrameLoc = "";

	var IFrameLocLast = "";

	var _WaitCheckRec = null;

	var _IsRec = false;

	//--------------------

	function getIFrameDoc(frame) {

		try {

			var doc = frame.contentDocument;

			if (!doc) doc = frame.contentWindow.document;

			return doc;

		} catch (e) {

			return null;

		}

	}

	//--------------------

	var _BadNavCount = 0;
	var _GoodNavCount = 0;


	var bNoScrit = false;



	function IFrameLoaded() {

		if (document.getElementById("iframe").src == "")

			return;

		if (_WaitCheckRec != null)

			clearTimeout(_WaitCheckRec);

		if (!_IsRec) {

			console.log('IFrameLoaded force CheckIsRec');

			_WaitCheckRec = setTimeout(CheckIsRec, 5000);

		}

			if(false)
					window.focus();




	}

	//--------------------------------
var CheckUrlisProxy = '';
var winaccess = false;
function CheckIsProxy()
{
try
{
var win = document.getElementById("iframe").contentWindow;



var url = win.location.href;


if(!winaccess )
	if(url != null ||  typeof url !== 'undefined' )
		winaccess = true;


if(!winaccess) 
	return;




 


if( CheckUrlisProxy == url )// no loaded jet
{
setTimeout(CheckIsProxy, 200);
return;
}


if(!url .includes(iframeProxyRecUrl))
{
if (_WaitCheckRec != null)clearTimeout(_WaitCheckRec);		
document.getElementById("iframe").src = iframeProxyRecUrl + url ;
ShowLoadingContent(true);
var a = 1;
a++;

}


//s
//document.getElementById("iframe_id").contentWindow.location.href
}
catch(e)
{




if(winaccess)
		{

	if (_WaitCheckRec != null)clearTimeout(_WaitCheckRec);		
	document.getElementById("iframe").src = iframeProxyRecUrl + url ;
	ShowLoadingContent(true);
	var a = 1;
	a++;

			}






}
}


	//---------------------------------

function CheckIsRec()
{

	if (IFrameLoc == "")

		return;

	if (_WaitCheckRec != null)

		clearTimeout(_WaitCheckRec);

	if (!_IsRec)
	{

		ShowLoadingErr();

		// _BadNavCount++;






		if (IFrameLocLast != "")
		{


			//if(_GoodNavCount < 1)
					document.getElementById("iframe").src = IFrameLocLast + "&_noscripts_=1";

			if (false)
			{

				if (bNoScrit)

					document.getElementById("iframe").src = IFrameLocLast + "&_noscripts_=1";

				else

					document.getElementById("iframe").src = IFrameLocLast;

			}

		}

		try

		{

			if (typeof GazeCloudAPI !== 'undefined')

				GazeCloudAPI.SendLog("Loading www err: " + document.getElementById("iframe").src + " last: " + IFrameLocLast, 4);

		}

		catch (eee)

		{}

		console.log('This web side can not be loaded form security resons');

		

		if (GazeRecorderAPI.OnNavigationErr != null)
			GazeRecorderAPI.OnNavigationErr();

		//alert("This web side can not be loaded form security resons");

	}
	else
	{

		_BadNavCount = 0;

		bNoScrit = false;

	}

}

//-------------------

	function receiveMessage(event) {

		// if (event.origin !== "https://gazerecorder.com")

		//   return;

		try {

			var webevent = JSON.parse(event.data);


			var isRecEvent = false;

			if (typeof webevent.type !== 'undefined')
				isRecEvent  = true;

			if(isRecEvent )
			{
			

			bStopR = true;

			eventsWeb.push(webevent);

			if (true) //tmp 

			{

				try {

					if (typeof GazeCloudAPI !== 'undefined')

						GazeCloudAPI.AddIFrameEvent(webevent);

				} catch (e) {}

			}
			}

		} catch (ee) {

			const _start = "start rec: ";

			const _stop = "stop rec: ";

			const _go = "go: ";

			const _click = "click: ";

			const _recinit = "recinit: ";

			if (event.data.startsWith(_click)) {

				//_IsRec = false; //tmp

				var cl = event.data.substring(_click.length);

				console.log('_click iframe: ' + cl);

				cl = JSON.parse(cl);

			

				if (typeof GazeCloudAPI !== 'undefined')

					GazeCloudAPI.processClick(cl);

			}

			if (event.data.startsWith(_start)) {

				ShowLoadingContent(false);
				_IsRec = true;
				if (_WaitCheckRec != null)
					clearTimeout(_WaitCheckRec);


				if(false)
					window.focus();

				
			}


			if (event.data.startsWith(_recinit)) {

				if (true)

					SendWebRecLoop(true);

				_IsRec = true;





				_GoodNavCount++; 

				bNoScrit = false;

				if (_WaitCheckRec != null)
					clearTimeout(_WaitCheckRec);

				IFrameLoc = event.data.substring(_recinit.length);

				IFrameLocLast = IFrameLoc;

				// ShowLoadingContent(false);

				if (GazeRecorderAPI.OnNavigation != null) {

					// var url =IFrameLoc.substring( IFrameLoc.indexOf(iframeProxyRecUrl));

					var url = IFrameLoc.substring(IFrameLoc.indexOf("?q=") + 3);

					url = decodeURIComponent(url);

					GazeRecorderAPI.OnNavigation(url);

				}

				if (false) 
					window.focus();
				

			}

			if (event.data.startsWith(_stop)) {

				_IsRec = false;

				IFrameLoc = event.data.substring(_stop.length);

				if (_WaitCheckRec == null)

					_WaitCheckRec = setTimeout(CheckIsRec, 30000);

				ShowLoadingContent(true);



				if(false)//tmp
				{
					CheckUrlisProxy =IFrameLocLast ;
					setTimeout(CheckIsProxy, 1);
				}


			}

	


		}

	}

	///////////

	//======================================

	////////////////////SendRecording///////////////

	var isSendingBlobs = false;

	var SendBlobsChunkNr = 0;

	var RecordinSesionId = "";

	var LastSendBlobIx = 0;



	function FinishRecSesion() {

		// SendWebRecLoop(true);

	}

	//------------------------

	var OnWebRecUploaded = null;

	//////////////////////////////////////////////////

	var LastSendEventNr = 0;

	var LastSendEvenGazetNr = 0;



	function SendWebRecLoop(forceEnd = false) {

		return;

		const SendInterval = 10000;

		try {

			if (forceEnd)

				if (isWaitForSendRec != null) clearTimeout(isWaitForSendRec);

			var eventsToSend = eventsWeb.slice(LastSendEventNr, eventsWeb.length); //tmp one blob

			var eventsGazeToSend = [];

			var json_data = JSON.stringify(eventsToSend);

			var json_datagaze = "";

			try {

				if (typeof eventsGaze !== 'undefined')

					if (eventsGaze != null) {

						eventsGazeToSend = eventsGaze.slice(LastSendEvenGazetNr, eventsGaze.length); //tmp one blob

						json_datagaze = JSON.stringify(eventsGazeToSend);

					}

			} catch (ee) {}

			var minCount = 10;

			if (forceEnd)

				minCount = 1;

			//  if(!forceEnd)

			// if( SendBlobsChunkNr > 0) 

			// if(eventsToSend.length +  eventsGazeToSend.length < minCount) // array !!!!

			if (eventsWeb.length < 1 || eventsToSend.length + eventsGazeToSend.length < minCount) // array !!!!

			{

				isWaitForSendRec = setTimeout(SendWebRecLoop, SendInterval);

				return;

			}

			LastSendEventNr = eventsWeb.length;

			if (typeof GazeResultEvents !== 'undefined')

				if (GazeResultEvents != null)

					LastSendEvenGazetNr = eventsGaze.length;

			let formData = new FormData();

			var txtevent = "";

			var txteventgaze = "";

			if (json_data.length > 5 && eventsToSend.length > 1)

				txtevent = json_data.substring(1, json_data.length - 1);

			else {

				txtevent = json_data.length;

			}

			if (json_datagaze.length > 5 && eventsGazeToSend.length > 1)

				txteventgaze = json_datagaze.substring(1, json_datagaze.length - 1);

			else {

				txteventgaze = json_datagaze;

			}

			if (eventsGazeToSend.length == 0)

				txteventgaze = "";

			if (eventsToSend.length == 0)

				txtevent = "";

			formData.append("RecordinSesionId", RecordinSesionId);

			formData.append("data", txtevent);

			formData.append("datagaze", txteventgaze);

			formData.append("Nr", SendBlobsChunkNr);

			formData.append("SesionID", RecordinSesionId);

			SendBlobsChunkNr++;

			let req = new XMLHttpRequest();

			req.withCredentials = false;

			req.open("POST", 'https://gazerecorder.com/webrecorder/uploadWebRec.php');

			if (false)

				req.setRequestHeader("Content-Encoding", "gzip");

			try {

				req.send(formData);

			} catch (e) {}

			req.onload = function() {

				isSendingBlobs = false;

				if (RecordinSesionId == "") {

					RecordinSesionId = req.response;

					// if (Logg) Logg("rec: " + req.response, 2);

				}

				isWaitForSendRec = setTimeout(SendWebRecLoop, SendInterval);

			}

			//end onload

			req.onerror = function(e) {

				isSendingBlobs = false;

				// alert("send err"+e);

				//TODO resed

				isWaitForSendRec = setTimeout(SendWebRecLoop, SendInterval);

			}

		} catch (eee) {

			isWaitForSendRec = setTimeout(SendWebRecLoop, SendInterval);

			// if (Logg) Logg('SendBlobs exeption', -4);

		}

	}

	///////////////

	window.addEventListener("message", receiveMessage, false);

}