/* craft/craft-lib.js: shared helpers and the registry for the Craft tools. Loads first.
   rg/G/ML/P1/eggs/hm format amounts; people is the servings the app is set to. The recipe files craft-*.js add their tools to CRAFTLIB.TOOLS
   and their notes to CRAFTLIB.LEARN; craft.js then draws them. */
(function(){
"use strict";
let people=2;try{people=Math.min(10,Math.max(1,+(JSON.parse(localStorage.getItem("mr-state")||"{}").n)||2))}catch(e){}
const rg=a=>a<10?Math.round(a*2)/2:a<100?Math.round(a):a<500?Math.round(a/5)*5:Math.round(a/10)*10;
const G=a=>rg(a)+" g",ML=a=>rg(a)+" g",P1=a=>Math.max(.5,Math.round(a*2)/2);
const eggs=gr=>{const n=Math.max(.5,Math.round(gr/50*2)/2);return n+(n===1?" egg":" eggs")+" ("+rg(gr)+" g)"};
const hm=m=>m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+m%60+" min":"");
window.CRAFTLIB={rg,G,ML,P1,eggs,hm,people,TOOLS:{},LEARN:{}};
})();
