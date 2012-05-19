﻿/**daFx
*JS动画机制核心类
* @author danny.xu
* @version daFx_1.0 2011-9-15 10:33:34
*/
da.extend({_mark:function(a,b){if(a){b=(b||"fx")+"mark";da.data(a,b,(da.data(a,b,undefined,true)||0)+1,true)}},_unmark:function(a,b,c){if(a!==true){c=b;b=a;a=false}if(b){c=c||"fx";var d=c+"mark",count=a?0:((da.data(b,d,undefined,true)||1)-1);if(count){da.data(b,d,count,true)}else{da.undata(b,d,true);handleQueueMarkDefer(b,c,"mark")}}},queue:function(a,b,c){if(a){b=(b||"fx")+"queue";var q=da.data(a,b,undefined,true);if(c){if(!q||da.isArray(c)){q=da.data(a,b,da.pushArray(c),true)}else{q.push(c)}}return q||[]}},dequeue:function(a,b){b=b||"fx";var c=da.queue(a,b),fn=c.shift(),defer;if(fn==="inprogress"){fn=c.shift()}if(fn){if(b==="fx"){c.unshift("inprogress")}fn.call(a,function(){da.dequeue(a,b)})}if(!c.length){da.undata(a,b+"queue",true);handleQueueMarkDefer(a,b,"queue")}}});da.fnStruct.extend({queue:function(b,c){if("string"!==typeof b){c=b;b="fx"}if(undefined===c){return da.queue(this.dom[0],b)}return this.each(function(){var a=da.queue(this,b,c);if("fx"===b&&"inprogress"!==a[0]){da.dequeue(this,b)}})},dequeue:function(a){return this.each(function(){da.dequeue(this,a)})},delay:function(b,c){b=daFx?daFx.speeds[b]||b:b;c=c||"fx";return this.queue(c,function(){var a=this;setTimeout(function(){da.dequeue(a,c)},b)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){if(typeof a!=="string"){b=a;a=undefined}a=a||"fx";var c=jQuery.Deferred(),elements=this,i=elements.length,count=1,deferDataKey=a+"defer",queueDataKey=a+"queue",markDataKey=a+"mark";function resolve(){if(!(--count)){c.resolveWith(elements,[elements])}}while(i--){if((tmp=da.data(elements[i],deferDataKey,undefined,true)||(da.data(elements[i],queueDataKey,undefined,true)||da.data(elements[i],markDataKey,undefined,true))&&da.data(elements[i],deferDataKey,jQuery._Deferred(),true))){count++;tmp.done(resolve)}}resolve();return c.promise()}});function handleQueueMarkDefer(a,b,c){var d=b+"defer",queueDataKey=b+"queue",markDataKey=b+"mark",defer=da.data(a,d,undefined,true);if(defer&&(c==="queue"||!da.data(a,queueDataKey,undefined,true))&&(c==="mark"||!da.data(a,markDataKey,undefined,true))){setTimeout(function(){if(!da.data(a,queueDataKey,undefined,true)&&!da.data(a,markDataKey,undefined,true)){da.undata(a,d,true);defer.resolve()}},0)}}(function(g,h){var j=g.document;var k=(function(){var f=function(a,b,c){return new f.fnStruct.init(a,b,c)};f.fnStruct=f.prototype={version:"daFx v1.0 \n author: danny.xu \n date: 2011-9-15 10:34:25",options:null,elem:null,prop:null,orig:null,init:function(a,b,c){this.options=b;this.elem=a;this.prop=c;b.orig=b.orig||{};return this},update:function(){var a;if(this.options.step)a=this.options.step.call(this.elem,this.now,this);if(false!==a)(this.options.update||f.step[this.prop]||f.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]}var a,r=da.css(this.elem,this.prop);return isNaN(a=parseFloat(r))?!r||r==="auto"?0:r:a},custom:function(b,c,d){var e=this,fx=f,raf;this.startTime=fxNow||createFxNow();this.start=b;this.end=c;this.unit=d||this.unit||(da.cssNumber[this.prop]?"":"px");this.now=this.start;this.pos=this.state=0;function t(a){return e.step(a)}t.elem=this.elem;if(t()&&f.timers.push(t)&&!timerId){if(requestAnimationFrame){timerId=1;raf=function(){if(timerId){requestAnimationFrame(raf);fx.tick()}};requestAnimationFrame(raf)}else{timerId=setInterval(fx.tick,fx.interval)}}},show:function(){this.options.orig[this.prop]=da.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());da(this.elem).show()},hide:function(){this.options.orig[this.prop]=da.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(c){var t=fxNow||createFxNow(),done=true,elem=this.elem,options=this.options,i,n;if(c||t>=(options.duration+this.startTime)){this.now=this.end;this.pos=this.state=1;this.update();options.animatedProperties[this.prop]=true;for(i in options.animatedProperties){if(options.animatedProperties[i]!==true){done=false}}if(done){if(options.overflow!=null&&!da.support.shrinkWrapBlocks){da.each(["","X","Y"],function(a,b){elem.style["overflow"+b]=options.overflow[a]})}if(options.hide){da(elem).hide()}if(options.hide||options.show){for(var p in options.animatedProperties){da.style(elem,p,options.orig[p])}}options.complete.call(elem)}return false}else{if(options.duration==Infinity){this.now=t}else{n=t-this.startTime;this.state=n/options.duration;this.pos=f.easing[options.animatedProperties[this.prop]](this.state,n,0,1,options.duration);this.now=this.start+((this.end-this.start)*this.pos)}this.update()}return true}};f.fnStruct.init.prototype=f.prototype;f.off=false;f.timers=[];f.interval=13;f.speeds={slow:600,fast:200,_default:400};f.parseParams=function(b,c,d){var e=(b&&"object"===typeof b)?da.extend({},b):{complete:d||!d&&c||da.isFunction(b)&&b,duration:b,easing:d&&c||c&&!da.isFunction(c)&&c};e.duration=f.off?0:"number"===typeof e.duration?e.duration:e.duration in f.speeds?f.speeds[e.duration]:f.speeds._default;e.old=e.complete;e.complete=function(a){if(false!==e.queue){da.dequeue(this)}else if(false!==a){da._unmark(this)}if(da.isFunction(e.old)){e.old.call(this)}};return e};f.tick=function(){var a=f.timers,i=a.length;while(i--){if(!a[i]()){a.splice(i,1)}}if(!a.length){f.stop()}};f.stop=function(){clearInterval(timerId);timerId=null};f.step={opacity:function(a){da.style(a.elem,"opacity",a.now)},_default:function(a){if(a.elem.style&&a.elem.style[a.prop]!=null){a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit}else{a.elem[a.prop]=a.now}}};f.easing={linear:function(p,n,a,b){return a+b*p},swing:function(p,n,a,b){return((-Math.cos(p*Math.PI)/2)+0.5)*b+a}};return f})();g.daFx=k})(window);var elemdisplay={},iframe,iframeDoc,daRe_fxtypes=/^(?:toggle|show|hide)$/,daRe_fxnum=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,fxAttrs=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],fxNow,timerId,requestAnimationFrame=window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame;function createFxNow(){setTimeout(clearFxNow,0);return(fxNow=da.nowId())}function clearFxNow(){fxNow=undefined}function genFx(a,b){var c={};da.each(fxAttrs.concat.apply([],fxAttrs.slice(0,b)),function(){c[this]=a});return c}da.each({slideDown:genFx("show",1),slideUp:genFx("hide",1),slideToggle:genFx("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(d,e){da.fnStruct[d]=function(a,b,c){return this.act(e,a,b,c)}});if(da.expr&&da.expr.filters){da.expr.filters.acted=function(b){return da.grep(daFx.timers,function(a){return b===a.elem}).length}}function defaultDisplay(a){if(!elemdisplay[a]){var b=da("<"+a+">").appendTo("body"),display=b.css("display");b.remove();if(display==="none"||display===""){if(!iframe){iframe=document.createElement("iframe");iframe.frameBorder=iframe.width=iframe.height=0}document.body.appendChild(iframe);if(!iframeDoc||!iframe.createElement){iframeDoc=(iframe.contentWindow||iframe.contentDocument).document;iframeDoc.write("<!doctype><html><body></body></html>")}b=iframeDoc.createElement(a);iframeDoc.body.appendChild(b);display=da.css(b,"display");document.body.removeChild(iframe)}elemdisplay[a]=display}return elemdisplay[a]}da.fnStruct.extend({show:function(a,b,c){var d,display;if(a||a===0){return this.act(genFx("show",3),a,b,c)}else{for(var i=0,j=this.dom.length;i<j;i++){d=this.dom[i];if(d.style){display=d.style.display;if(!da.data(d,"olddisplay")&&display==="none"){display=d.style.display=""}if(display===""&&da.css(d,"display")==="none"){da.data(d,"olddisplay",defaultDisplay(d.nodeName))}}}for(i=0;i<j;i++){d=this.dom[i];if(d.style){display=d.style.display;if(display===""||display==="none"){d.style.display=da.data(d,"olddisplay")||""}}}return this}},hide:function(a,b,c){if(a||a===0){return this.act(genFx("hide",3),a,b,c)}else{for(var i=0,j=this.dom.length;i<j;i++){if(this.dom[i].style){var d=da.css(this.dom[i],"display");if(d!=="none"&&!da.data(this.dom[i],"olddisplay")){da.data(this.dom[i],"olddisplay",d)}}}for(i=0;i<j;i++){if(this.dom[i].style){this.dom[i].style.display="none"}}return this}},_toggle:da.fnStruct.toggle,toggle:function(b,c,d){var e=typeof b==="boolean";if(da.isFunction(b)&&da.isFunction(c)){this._toggle.apply(this,arguments)}else if(b==null||e){this.each(function(){var a=e?b:da(this).is(":hidden");da(this)[a?"show":"hide"]()})}else{this.act(genFx("toggle",3),b,c,d)}return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().act({opacity:b},a,c,d)},act:function(b,c,d,f){var g=daFx.parseParams(c,d,f);if(da.isEmptyObj(b)){return this.each(g.complete,[false])}return this[false===g.queue?"each":"queue"](function(){if(false===g.queue){da._mark(this)}var a=da.extend({},g),isElement=this.nodeType===1,hidden=isElement&&da(this).is(":hidden"),name,val,p,display,e,parts,start,end,unit;a.animatedProperties={};for(p in b){name=da.camelCase(p);if(p!==name){b[name]=b[p];delete b[p]}val=b[name];if("hide"===val&&hidden||"show"===val&&!hidden){return a.complete.call(this)}if(isElement&&(name==="height"||name==="width")){a.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY];if(da.css(this,"display")==="inline"&&da.css(this,"float")==="none"){if(!da.support.inlineBlockNeedsLayout){this.style.display="inline-block"}else{display=defaultDisplay(this.nodeName);if(display==="inline"){this.style.display="inline-block"}else{this.style.display="inline";this.style.zoom=1}}}}a.animatedProperties[name]=da.isArray(val)?val[1]:a.specialEasing&&a.specialEasing[name]||a.easing||'swing'}if(a.overflow!=null){this.style.overflow="hidden"}for(p in b){e=daFx(this,a,p);val=b[p];val=da.isArray(val)?val[0]:val;if(daRe_fxtypes.test(val)){e[val==="toggle"?hidden?"show":"hide":val]()}else{parts=daRe_fxnum.exec(val);start=e.cur();if(parts){end=parseFloat(parts[2]);unit=parts[3]||(da.cssNumber[name]?"":"px");if(unit!=="px"){da.style(this,p,(end||1)+unit);start=((end||1)/e.cur())*start;da.style(this,p,start+unit)}if(parts[1]){end=((parts[1]==="-="?-1:1)*end)+start}e.custom(start,end,unit)}else{e.custom(start,val,"")}}}return true})},stop:function(b,c){if(b){this.queue([])}this.each(function(){var a=daFx.timers,i=a.length;if(!c){da._unmark(true,this)}while(i--){if(a[i].elem===this){if(c){a[i](true)}a.splice(i,1)}}});if(!c){this.dequeue()}return this}});daFx.easing['jswing']=daFx.easing['swing'];da.extend(daFx.easing,{def:'easeOutQuad',swing:function(x,t,b,c,d){return daFx.easing[daFx.easing.def](x,t,b,c,d)},easeInQuad:function(x,t,b,c,d){return c*x*x+b},easeOutQuad:function(x,t,b,c,d){return-c*(t/=d)*(t-2)+b},easeInOutQuad:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t+b;return-c/2*((--t)*(t-2)-1)+b},easeInCubic:function(x,t,b,c,d){return c*(t/=d)*t*t+b},easeOutCubic:function(x,t,b,c,d){return c*((t=t/d-1)*t*t+1)+b},easeInOutCubic:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t+b;return c/2*((t-=2)*t*t+2)+b},easeInQuart:function(x,t,b,c,d){return c*(t/=d)*t*t*t+b},easeOutQuart:function(x,t,b,c,d){return-c*((t=t/d-1)*t*t*t-1)+b},easeInOutQuart:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t+b;return-c/2*((t-=2)*t*t*t-2)+b},easeInQuint:function(x,t,b,c,d){return c*(t/=d)*t*t*t*t+b},easeOutQuint:function(x,t,b,c,d){return c*((t=t/d-1)*t*t*t*t+1)+b},easeInOutQuint:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t*t+b;return c/2*((t-=2)*t*t*t*t+2)+b},easeInSine:function(x,t,b,c,d){return-c*Math.cos(t/d*(Math.PI/2))+c+b},easeOutSine:function(x,t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b},easeInOutSine:function(x,t,b,c,d){return-c/2*(Math.cos(Math.PI*t/d)-1)+b},easeInExpo:function(x,t,b,c,d){return(t==0)?b:c*Math.pow(2,10*(t/d-1))+b},easeOutExpo:function(x,t,b,c,d){return(t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b},easeInOutExpo:function(x,t,b,c,d){if(t==0)return b;if(t==d)return b+c;if((t/=d/2)<1)return c/2*Math.pow(2,10*(t-1))+b;return c/2*(-Math.pow(2,-10*--t)+2)+b},easeInCirc:function(x,t,b,c,d){return-c*(Math.sqrt(1-(t/=d)*t)-1)+b},easeOutCirc:function(x,t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b},easeInOutCirc:function(x,t,b,c,d){if((t/=d/2)<1)return-c/2*(Math.sqrt(1-t*t)-1)+b;return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b},easeInElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4}else var s=p/(2*Math.PI)*Math.asin(c/a);return-(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b},easeOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4}else var s=p/(2*Math.PI)*Math.asin(c/a);return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b},easeInOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d/2)==2)return b+c;if(!p)p=d*(.3*1.5);if(a<Math.abs(c)){a=c;var s=p/4}else var s=p/(2*Math.PI)*Math.asin(c/a);if(t<1)return-.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*.5+c+b},easeInBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;return c*(t/=d)*t*((s+1)*t-s)+b},easeOutBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b},easeInOutBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;if((t/=d/2)<1)return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b},easeInBounce:function(x,t,b,c,d){return c-daFx.easing.easeOutBounce(x,d-t,0,c,d)+b},easeOutBounce:function(x,t,b,c,d){if((t/=d)<(1/2.75)){return c*(7.5625*t*t)+b}else if(t<(2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b}else if(t<(2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b}else{return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b}},easeInOutBounce:function(x,t,b,c,d){if(t<d/2)return daFx.easing.easeInBounce(x,t*2,0,c,d)*.5+b;return daFx.easing.easeOutBounce(x,t*2-d,0,c,d)*.5+c*.5+b}});