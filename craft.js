/* craft.js: the engine for the Craft hub: cards, controls, saving, the spin animation and the spinner art. Load order: after craft-*.js, before engine.js.
   The recipes live in craft/craft-*.js (one file per hub group) and register themselves in CRAFTLIB.TOOLS; helpers are in craft/craft-lib.js.
   Each tool fills <div id="tab-ID"> and keeps its settings in localStorage ("mr-craft").
   To add a tool: add an entry (controls + calc) to the right craft/craft-*.js file, add <div id="tab-ID" class="tab" role="tabpanel" hidden></div>
   to index.html, add its spinner in SPIN below, and set ready:1, rec:1 for ID in the UI table. Every amount is worked out in grams.
   To add a new craft-*.js file, list it in index.html's FILES (before craft.js) and in sw.js, and bump V there. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const I=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const {rg,G,ML,P1,eggs,hm,people}=window.CRAFTLIB;
const KEY="mr-craft";let ST={};try{ST=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}};
/* copy to the clipboard; falls back to a hidden textarea + execCommand where the Clipboard API is missing or refused (older browsers, non-secure pages). Resolves true/false. */
const copyText=async t=>{
 try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(t);return true}}catch(e){}
 try{const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.cssText="position:fixed;top:0;left:0;opacity:0";document.body.appendChild(a);a.select();a.setSelectionRange(0,t.length);const ok=document.execCommand("copy");a.remove();return !!ok}catch(e){return false}};
/* flash a button label ("Copied" / "Couldn't copy"), then put the original back after 2 s; a second press restarts the timer */
const flash=(b,icon,txt)=>{if(b._t)clearTimeout(b._t);else b._o=b.innerHTML;b.innerHTML=I(icon)+txt;b._t=setTimeout(()=>{b.innerHTML=b._o;b._t=b._o=null},2000)};

/* ---- ingredient icons: drawn here in the same flat, outlined style as the scenes (emoji vary by phone); each is a 30 x 30 drawing centred on 0,0 ---- */
const IS='style="stroke:var(--ink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"',IS1='style="stroke:var(--ink)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
const ICO={
"🥕":`<g transform="rotate(40)"><path d="M-6 -7Q0 -10 6 -7L1.5 14Q0 16 -1.5 14Z" fill="#f08a24" ${IS}/><path d="M-3 -1h4M-2 5h3" stroke="#c25f10" stroke-width="1.5" stroke-linecap="round"/><path d="M0 -8Q-6 -13 -3 -15Q0 -14 0 -8ZM0 -8Q0 -14 3 -15Q6 -12 0 -8Z" fill="#4caf50" ${IS1}/></g>`,
"🧅":`<path d="M0 -14Q3 -9 8 -6Q15 0 13 7Q10 14 0 14Q-10 14 -13 7Q-15 0 -8 -6Q-3 -9 0 -14Z" fill="#e5b7d6" ${IS}/><path d="M0 -9Q-6 0 0 13M0 -9Q6 0 0 13" fill="none" stroke="#b9779f" stroke-width="1.5" stroke-linecap="round"/>`,
"🍅":`<circle cx="0" cy="2" r="12" fill="#e53b2c" ${IS}/><path d="M-6 0Q-5 -5 -1 -6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/><path d="M0 -12L2 -8L7 -9L4 -5L8 -3L2 -3L0 0L-2 -3L-8 -3L-4 -5L-7 -9L-2 -8Z" fill="#43a047" ${IS1}/>`,
"🥔":`<path d="M-12 -2Q-12 -10 -3 -11Q8 -13 12 -5Q15 4 8 10Q-1 14 -9 9Q-13 5 -12 -2Z" fill="#d9a35f" ${IS}/><g fill="#a06b2c"><circle cx="-4" cy="-3" r="1.3"/><circle cx="5" cy="1" r="1.3"/><circle cx="-2" cy="6" r="1.3"/></g>`,
"🌿":`<path d="M-11 12Q0 3 10 -11" fill="none" stroke="#2e7d32" stroke-width="2.4" stroke-linecap="round"/><g fill="#4caf50" ${IS1}><ellipse cx="-4" cy="4" rx="6" ry="3" transform="rotate(-50 -4 4)"/><ellipse cx="4" cy="-1" rx="6" ry="3" transform="rotate(40 4 -1)"/><ellipse cx="1" cy="-6" rx="5.5" ry="2.8" transform="rotate(-55 1 -6)"/><ellipse cx="9" cy="-9" rx="4.5" ry="2.4" transform="rotate(30 9 -9)"/></g>`,
"🧄":`<path d="M0 -13Q2 -8 7 -6Q14 -1 12 7Q9 14 0 14Q-9 14 -12 7Q-14 -1 -7 -6Q-2 -8 0 -13Z" fill="#f6efe0" ${IS}/><path d="M0 -8Q-5 0 -2 13M0 -8Q5 0 3 13" fill="none" stroke="#c9b99a" stroke-width="1.5" stroke-linecap="round"/>`,
"🥟":`<path d="M-14 5Q-14 -9 0 -9Q14 -9 14 5Q14 10 9 10H-9Q-14 10 -14 5Z" fill="#f6e7c8" ${IS}/><path d="M-9 -6Q-7 -1 -4 -8M-3 -8.5Q-1 -2 2 -8.5M4 -8Q6 -2 9 -6" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/>`,
"🥩":`<path d="M-13 -3Q-14 -11 -4 -11Q6 -13 12 -6Q16 2 9 9Q1 14 -7 10Q-13 6 -13 -3Z" fill="#c0392b" ${IS}/><path d="M-6 -5Q0 -7 4 -3M-5 5Q0 7 6 3" fill="none" stroke="#fbd5cf" stroke-width="1.8" stroke-linecap="round"/><circle cx="3" cy="0" r="3.4" fill="#fff3e0" ${IS1}/>`,
"🍗":`<path d="M-4 5L-10 11" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/><path d="M-4 5L-10 11" stroke="#fff3e0" stroke-width="3" stroke-linecap="round"/><circle cx="-12" cy="10" r="3" fill="#fff3e0" ${IS1}/><circle cx="-9" cy="13" r="3" fill="#fff3e0" ${IS1}/><ellipse cx="3" cy="-3" rx="11" ry="9" transform="rotate(-35 3 -3)" fill="#d2873a" ${IS}/><path d="M-2 -8Q3 -10 8 -6" fill="none" stroke="#f0b266" stroke-width="2" stroke-linecap="round"/>`,
"🌽":`<path d="M-6 -12Q0 -16 6 -12Q9 0 6 10Q0 14 -6 10Q-9 0 -6 -12Z" fill="#ffd23f" ${IS}/><path d="M-3 -11V10M3 -11V10M-7 -4H7M-7 3H7" stroke="#e0a800" stroke-width="1.2"/><path d="M-8 13Q-13 0 -7 -3Q-3 6 0 14Z" fill="#6ab04c" ${IS1}/><path d="M8 13Q13 0 7 -3Q3 6 0 14Z" fill="#6ab04c" ${IS1}/>`,
"🍄":`<path d="M-5 0V8Q-5 12 0 12Q5 12 5 8V0Z" fill="#f6efe0" ${IS}/><path d="M-14 1Q-14 -13 0 -13Q14 -13 14 1Z" fill="#c4553a" ${IS}/><g fill="#fff"><circle cx="-6" cy="-6" r="2"/><circle cx="3" cy="-8" r="2"/><circle cx="8" cy="-3" r="1.6"/></g>`,
"🌶️":`<path d="M-10 -7Q-2 -12 4 -4Q10 4 12 12Q4 12 -2 6Q-8 0 -10 -7Z" fill="#e0301e" ${IS}/><path d="M-12 -7Q-10 -12 -6 -10L-7 -5Z" fill="#43a047" ${IS1}/><path d="M-4 -3Q0 -3 3 2" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`,
"🥒":`<g transform="rotate(-35)"><rect x="-15" y="-5.5" width="30" height="11" rx="5.5" fill="#58b34a" ${IS}/><g fill="#2e7d32"><circle cx="-8" cy="-1" r="1.2"/><circle cx="-1" cy="2" r="1.2"/><circle cx="6" cy="-1.5" r="1.2"/><circle cx="10" cy="2" r="1.2"/></g></g>`,
"🫒":`<ellipse cx="0" cy="0" rx="9" ry="11" fill="#8c9a3a" ${IS}/><ellipse cx="0" cy="-7" rx="3.4" ry="2.6" fill="#d63a22" ${IS1}/><path d="M-5 -2Q-5 3 -3 6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`,
"🥑":`<path d="M0 -14Q8 -14 10 -2Q14 10 6 14Q0 16 -6 14Q-14 10 -10 -2Q-8 -14 0 -14Z" fill="#3f7d34" ${IS}/><path d="M0 -9Q6 -9 7 -1Q10 8 5 11Q0 13 -5 11Q-10 8 -7 -1Q-6 -9 0 -9Z" fill="#cfe58b"/><circle cx="0" cy="4" r="5" fill="#8a5a2b" ${IS1}/>`,
"🥚":`<ellipse cx="0" cy="0" rx="9" ry="12" fill="#fffdf5" ${IS}/><ellipse cx="0" cy="2" rx="5" ry="6" fill="#ffb81c" ${IS1}/>`,
"🍥":`<circle r="12" fill="#fffdf5" ${IS}/><circle r="9.5" fill="none" stroke="#ef6f9a" stroke-width="1.4" stroke-dasharray="3 3"/><path d="M0 0a2 2 0 0 1 4 0a4 4 0 0 1-8 0a6 6 0 0 1 12 0" fill="none" stroke="#ef6f9a" stroke-width="2" stroke-linecap="round"/>`,
"🥬":`<path d="M0 14Q-14 8 -12 -4Q-10 -13 0 -14Q10 -13 12 -4Q14 8 0 14Z" fill="#8fd36a" ${IS}/><path d="M0 12V-8M0 4L-6 -2M0 4L6 -2M0 -2L-4 -6M0 -2L4 -6" fill="none" stroke="#3f8a2f" stroke-width="1.5" stroke-linecap="round"/>`,
"🥢":`<path d="M-12 -12L12 12M-5 -14L14 5" stroke="var(--ink)" stroke-width="5.5" stroke-linecap="round"/><path d="M-12 -12L12 12M-5 -14L14 5" stroke="#c98a3a" stroke-width="3" stroke-linecap="round"/>`,
"🍞":`<path d="M-13 2Q-15 -8 -6 -11Q0 -13 6 -11Q15 -8 13 2V8Q13 12 9 12H-9Q-13 12 -13 8Z" fill="#d9964a" ${IS}/><path d="M-6 -6L-3 1M0 -8L3 0M6 -6L9 1" fill="none" stroke="#f3d08a" stroke-width="2" stroke-linecap="round"/>`,
"🥖":`<g transform="rotate(-40)"><rect x="-16" y="-5.5" width="32" height="11" rx="5.5" fill="#d9964a" ${IS}/><path d="M-10 -3L-7 3M-3 -3L0 3M4 -3L7 3" stroke="#f3d08a" stroke-width="2" stroke-linecap="round"/></g>`,
"🥐":`<path d="M-14 8Q-15 -4 -4 -9Q6 -12 14 8Q10 12 6 7Q0 2 -6 7Q-10 12 -14 8Z" fill="#e8a33d" ${IS}/><path d="M-6 -4Q-5 2 -6 6M2 -7Q3 -1 2 3M9 -2Q8 3 7 6" fill="none" stroke="#b96f17" stroke-width="1.5" stroke-linecap="round"/>`,
"🥨":`<path d="M-8 11Q-15 0 -8 -7Q-2 -12 0 -5Q2 -12 8 -7Q15 0 8 11M-8 11L8 -2M8 11L-8 -2" fill="none" stroke="var(--ink)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-8 11Q-15 0 -8 -7Q-2 -12 0 -5Q2 -12 8 -7Q15 0 8 11M-8 11L8 -2M8 11L-8 -2" fill="none" stroke="#b9692a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><g fill="#fff"><circle cx="-10" cy="0" r="1"/><circle cx="10" cy="0" r="1"/><circle cx="0" cy="-8" r="1"/></g>`,
"🌾":`<path d="M0 14V-11" stroke="#b8862b" stroke-width="2" stroke-linecap="round"/><g fill="#e8b84a" ${IS1}>${[-9,-3,3,9].map(y=>`<ellipse cx="-4" cy="${y}" rx="2.6" ry="4.4" transform="rotate(-30 -4 ${y})"/><ellipse cx="4" cy="${y}" rx="2.6" ry="4.4" transform="rotate(30 4 ${y})"/>`).join("")}<ellipse cx="0" cy="-13" rx="2.4" ry="3.8"/></g>`,
"🍚":`<path d="M-11 -1Q-11 -11 0 -12Q11 -11 11 -1Z" fill="#fffdf5" ${IS}/><path d="M-5 -6l2 1M2 -8l2 1M5 -4l2 1" stroke="#c9b99a" stroke-width="1.4" stroke-linecap="round"/><path d="M-14 -1H14Q14 12 0 13Q-14 12 -14 -1Z" fill="#4a90c2" ${IS}/>`,
"🍒":`<path d="M-6 3Q-4 -8 3 -13M6 5Q6 -6 3 -13" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/><path d="M3 -13Q9 -16 12 -12Q8 -9 3 -13Z" fill="#43a047" ${IS1}/><circle cx="-6" cy="7" r="6" fill="#d6203a" ${IS}/><circle cx="6" cy="9" r="6" fill="#d6203a" ${IS}/><circle cx="-8" cy="5" r="1.6" fill="#fff" fill-opacity=".7"/><circle cx="4" cy="7" r="1.6" fill="#fff" fill-opacity=".7"/>`,
"🍓":`<path d="M0 14Q-12 8 -12 -2Q-12 -9 -5 -9Q0 -8 0 -8Q0 -8 5 -9Q12 -9 12 -2Q12 8 0 14Z" fill="#e53b52" ${IS}/><g fill="#ffe082"><circle cx="-5" cy="0" r="1.1"/><circle cx="3" cy="-2" r="1.1"/><circle cx="6" cy="4" r="1.1"/><circle cx="-2" cy="6" r="1.1"/><circle cx="0" cy="1.5" r="1.1"/></g><path d="M0 -7L-5 -12L-1 -11L0 -14L1 -11L5 -12Z" fill="#43a047" ${IS1}/>`,
"🍋":`<path d="M-14 0Q-12 -9 0 -10Q12 -9 14 0Q12 9 0 10Q-12 9 -14 0Z" fill="#ffe14d" ${IS}/><path d="M-6 -3Q-3 -6 2 -6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/><path d="M8 -9Q14 -14 15 -8Q10 -6 8 -9Z" fill="#43a047" ${IS1}/>`,
"🍊":`<circle r="12" fill="#ff9a2e" ${IS}/><path d="M-6 -3Q-4 -7 1 -7" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/><path d="M0 -12Q6 -16 10 -11Q5 -8 0 -12Z" fill="#43a047" ${IS1}/>`,
"🧈":`<path d="M-13 -3L-4 -9H13L4 -3Z" fill="#fff0a8" ${IS}/><path d="M-13 -3H4V9H-13Z" fill="#ffe27a" ${IS}/><path d="M4 -3L13 -9V3L4 9Z" fill="#f3c944" ${IS}/>`,
"🥓":`<path d="M-14 -4Q-9 -9 -4 -4Q1 1 6 -4Q10 -8 14 -5L14 3Q10 0 6 4Q1 9 -4 4Q-9 -1 -14 4Z" fill="#e8574a" ${IS}/><path d="M-12 0Q-9 -3 -4 1Q1 5 6 0Q10 -3 12 -1" fill="none" stroke="#fbd5cf" stroke-width="2" stroke-linecap="round"/>`,
"🍑":`<circle r="12" fill="#ffb085" ${IS}/><circle cx="5" cy="2" r="5" fill="#ff7a6e" fill-opacity=".4"/><path d="M0 -10Q-4 0 0 12" fill="none" stroke="#e8805a" stroke-width="1.8" stroke-linecap="round"/><path d="M0 -11Q6 -16 10 -11Q5 -8 0 -11Z" fill="#43a047" ${IS1}/>`,
"🍇":`<path d="M0 -10V-14" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/><path d="M0 -13Q6 -16 9 -12Q4 -9 0 -13Z" fill="#43a047" ${IS1}/><g fill="#8e4cc4" ${IS1}><circle cx="-7" cy="-4" r="5"/><circle cx="0" cy="-4" r="5"/><circle cx="7" cy="-4" r="5"/><circle cx="-3.5" cy="3" r="5"/><circle cx="3.5" cy="3" r="5"/><circle cx="0" cy="10" r="5"/></g><g fill="#fff" fill-opacity=".6"><circle cx="-8" cy="-6" r="1.2"/><circle cx="-1" cy="-6" r="1.2"/><circle cx="6" cy="-6" r="1.2"/></g>`,
"🧀":`<path d="M-14 -6L14 -12V8H-14Z" fill="#ffc83d" ${IS}/><g fill="#e6a312"><circle cx="-6" cy="0" r="2.4"/><circle cx="4" cy="-2" r="2"/><circle cx="8" cy="3" r="2.2"/><circle cx="-2" cy="5" r="1.8"/></g>`,
"🍯":`<path d="M-9 -8Q-12 -3 -12 4Q-12 12 -5 12H5Q12 12 12 4Q12 -3 9 -8Z" fill="#f3a712" ${IS}/><rect x="-8" y="-13" width="16" height="5" rx="2" fill="#8a5a2b" ${IS1}/><rect x="-6" y="-1" width="12" height="8" rx="2" fill="#fff3cf"/><path d="M-8 -4Q-8 0 -9 3" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`,
"🍫":`<rect x="-11" y="-13" width="22" height="26" rx="3" fill="#7a3b1d" ${IS}/><path d="M-3.7 -13V13M3.7 -13V13M-11 -4.3H11M-11 4.3H11" stroke="#4a2410" stroke-width="1.5"/>`,
"🧂":`<path d="M-7 -3H7L8 11Q8 14 5 14H-5Q-8 14 -8 11Z" fill="#eef3f6" ${IS}/><path d="M-7 -3Q-7 -13 0 -13Q7 -13 7 -3Z" fill="#aab4be" ${IS}/><g fill="var(--ink)"><circle cx="-3" cy="-8" r="1"/><circle cx="0" cy="-9.5" r="1"/><circle cx="3" cy="-8" r="1"/></g><path d="M-5 5H5" stroke="#cfd8df" stroke-width="1.4" stroke-linecap="round"/>`,
"🔥":`<path d="M0 -14Q3 -7 8 -2Q13 4 9 10Q5 15 0 15Q-6 15 -9 10Q-12 4 -6 -3Q-4 0 -2 -3Q-3 -8 0 -14Z" fill="#ff7a1a" ${IS}/><path d="M0 4Q4 7 4 10Q3 13 0 13Q-4 13 -4 9Q-3 6 0 4Z" fill="#ffd23f" ${IS1}/>`,
"🍖":`<path d="M-13 3Q-13 -8 -3 -10Q8 -11 11 -2Q13 6 4 10Q-6 14 -11 8Q-13 6 -13 3Z" fill="#b5532a" ${IS}/><path d="M-8 -2Q-3 -6 3 -3M-7 4Q-2 7 4 4" fill="none" stroke="#7a3318" stroke-width="1.6" stroke-linecap="round"/><path d="M7 -5L13 -12" stroke="var(--ink)" stroke-width="6.5" stroke-linecap="round"/><path d="M7 -5L13 -12" stroke="#fff3e0" stroke-width="3.5" stroke-linecap="round"/>`,
"🌭":`<g transform="rotate(-30)"><rect x="-15" y="-5" width="30" height="10" rx="5" fill="#c9572f" ${IS}/><path d="M-9 -2L-7 2M-3 -2L-1 2M3 -2L5 2" stroke="#8a3418" stroke-width="1.6" stroke-linecap="round"/><path d="M-12 -2.2Q-10 -3.4 -6 -3.2" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/></g>`,
"🐟":`<path d="M-13 0Q-5 -9 5 -5L9 -9V9L5 5Q-5 9 -13 0Z" fill="#6fb3d9" ${IS}/><path d="M-1 -5Q2 0 -1 5" fill="none" stroke="#3b82b0" stroke-width="1.5" stroke-linecap="round"/><circle cx="-7" cy="-1.5" r="1.4" fill="#2a1a13"/>`,
"🍝":`<path d="M-9 1Q-9 -9 -3 -8Q0 -12 3 -8Q9 -9 9 1Z" fill="#f2c94c" ${IS}/><circle cx="0" cy="-3" r="2.2" fill="#e53b2c"/><path d="M-13 1H13Q12 12 0 13Q-12 12 -13 1Z" fill="#f6efe0" ${IS}/>`,
"🥛":`<path d="M-8 -12H8L6 11Q6 13 4 13H-4Q-6 13 -6 11Z" fill="#dff0fa" ${IS}/><path d="M-7.3 -3H7.3L6 11Q6 13 4 13H-4Q-6 13 -6 11Z" fill="#fff" ${IS1}/>`,
"🥦":`<path d="M-3 14L-2 5H2L3 14Z" fill="#8bc34a" ${IS1}/><circle cx="-6" cy="-1" r="6" fill="#43a047" ${IS}/><circle cx="6" cy="-1" r="6" fill="#43a047" ${IS}/><circle cx="0" cy="-6" r="7" fill="#4caf50" ${IS}/>`,
"🍌":`<path d="M-12 -6Q-10 8 4 11Q12 12 14 6Q6 8 0 2Q-4 -4 -4 -12L-9 -12Q-12 -9 -12 -6Z" fill="#ffd54f" ${IS}/>`,
"🍎":`<path d="M0 -6Q-6 -9 -11 -4Q-14 4 -8 11Q-4 14 0 12Q4 14 8 11Q14 4 11 -4Q6 -9 0 -6Z" fill="#e53b2c" ${IS}/><path d="M0 -6Q0 -11 3 -13" fill="none" stroke="#5d4037" stroke-width="1.8" stroke-linecap="round"/><path d="M2 -9Q6 -13 10 -10Q6 -6 2 -9Z" fill="#43a047" ${IS1}/>`,
"🫘":`<path d="M-12 -2Q-12 -10 -4 -9Q4 -8 2 0Q0 8 -7 8Q-12 7 -12 -2Z" fill="#a1432a" ${IS}/><path d="M2 3Q2 -4 8 -4Q14 -3 13 4Q12 12 6 12Q2 11 2 3Z" fill="#c25a35" ${IS}/>`,
"🍆":`<path d="M5 -9Q13 -2 9 6Q4 14 -5 12Q-12 10 -9 3Q-5 -3 1 -8Z" fill="#6a3a8c" ${IS}/><path d="M1 -8L5 -9L7 -13Q2 -14 -1 -11Z" fill="#43a047" ${IS1}/>`
};
window.__ico=e=>icoHTML(e);const icoHTML=e=>ICO[e]?`<svg viewBox="-16 -16 32 32" width="30" height="30" aria-hidden="true">${ICO[e]}</svg>`:e;
/* burger spinner art: the layers lift off one after another and drop back into a stack (animated in index.html) */
const BURGER_ART=`<div class="bgr"><svg viewBox="0 0 240 190" aria-hidden="true"><circle cx="120" cy="95" r="84" fill="#f6efe0" style="stroke:var(--ink)" stroke-width="3"/><circle class="rim" cx="120" cy="95" r="76" fill="none" stroke="#d63a22" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"/><g transform="translate(120 100) scale(.66) translate(-120 -108)">
<g class="bl" style="--k:0"><path d="M44 150h152v6q0 16-16 16H60q-16 0-16-16z" fill="#e8a84d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/></g>
<g class="bl" style="--k:1"><rect x="40" y="128" width="160" height="22" rx="11" fill="#7a3b1d" style="stroke:var(--ink)" stroke-width="3"/><path d="M62 137h14M94 141h12M130 136h14M160 141h12" stroke="#a5552a" stroke-width="3" stroke-linecap="round"/></g>
<g class="bl" style="--k:2"><path d="M46 121h148v7h-44l-10 14-10-14H46z" fill="#ffc63d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/></g>
<g class="bl" style="--k:3"><rect x="50" y="109" width="140" height="11" rx="5.5" fill="#d63a22" style="stroke:var(--ink)" stroke-width="3"/></g>
<g class="bl" style="--k:4"><path d="M40 103q9.5 10 19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0v9H40z" fill="#5fbf6a" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/></g>
<g class="bl" style="--k:5"><path d="M38 101C38 64 72 44 120 44S202 64 202 101z" fill="#e8a84d" style="stroke:var(--ink)" stroke-width="3" stroke-linejoin="round"/><g fill="#fff3cf"><ellipse cx="94" cy="68" rx="5" ry="2.6" transform="rotate(-25 94 68)"/><ellipse cx="122" cy="58" rx="5" ry="2.6" transform="rotate(10 122 58)"/><ellipse cx="148" cy="70" rx="5" ry="2.6" transform="rotate(30 148 70)"/><ellipse cx="108" cy="84" rx="5" ry="2.6" transform="rotate(15 108 84)"/><ellipse cx="136" cy="85" rx="5" ry="2.6" transform="rotate(-20 136 85)"/></g></g></g></svg></div>`;
window.__burgerArt=BURGER_ART;

/* pasta spinner art: a bowl with a noodle spiral that twirls at the shared spin speed; tomato, basil and cheese orbit it */
const PASTA_ART=`<div class="pgr"><svg class="base" viewBox="0 0 240 190" aria-hidden="true"><circle cx="120" cy="95" r="84" fill="#4a90c2" style="stroke:var(--ink)" stroke-width="3"/><circle cx="120" cy="95" r="77" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"/><circle cx="120" cy="95" r="70" fill="#f6efe0" style="stroke:var(--ink)" stroke-width="3"/></svg>
<div class="pspin"><svg viewBox="-33 -33 66 66" aria-hidden="true"><path d="M0 0a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0" fill="none" style="stroke:var(--ink)" stroke-width="6.2" stroke-linecap="round"/><path d="M0 0a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0" fill="none" stroke="#f2c14e" stroke-width="3.4" stroke-linecap="round"/></svg></div>
<svg class="pcap" viewBox="0 0 240 190" aria-hidden="true"><circle cx="120" cy="95" r="14" fill="#d63a22" style="stroke:var(--ink)" stroke-width="3"/><path d="M120 92q-10-12 2-16 8 6-2 16zM120 92q12-10 18 2-8 8-18-2z" fill="#3fae5a" style="stroke:var(--ink)" stroke-width="2" stroke-linejoin="round"/></svg>
<div class="ring"><div class="ing" style="--k:0;--r:0deg;--R:52px"><u><i>${icoHTML("🍅")}</i></u></div><div class="ing" style="--k:1;--r:120deg;--R:52px"><u><i>${icoHTML("🌿")}</i></u></div><div class="ing" style="--k:2;--r:240deg;--R:52px"><u><i>${icoHTML("🧀")}</i></u></div></div></div>`;
window.__pastaArt=PASTA_ART;

/* controls: {k,label,icon,tg:[[value,label]]} or {k,label,icon,step:[min,max,by,unit]}; def = default value */
const TOOLS=window.CRAFTLIB.TOOLS; // filled in by the craft-*.js recipe files

/* ---- one spinner per section: burger and pasta have hand-drawn art; every other section gets a base (bowl, pan, board, jar, glass) with its own colour,
   a big emoji in the middle and three more orbiting it. Same size and speed as every other spinner. ---- */
const emojiArt=(base,col,c,o)=>{
 const ik='style="stroke:var(--ink)" stroke-width="3"',dash='fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"';
 const B={ // every base is seen from above and turns at the shared speed; the dashed rim (and handle / straw) makes the turn visible
  bowl:`<circle cx="120" cy="95" r="84" fill="${col}" ${ik}/><circle cx="120" cy="95" r="77" ${dash}/><circle cx="120" cy="95" r="70" fill="#f6efe0" ${ik}/>`,
  pan:`<rect x="186" y="88" width="40" height="15" rx="7.5" fill="#6b4a2b" ${ik}/><circle cx="120" cy="95" r="76" fill="#3b3b44" ${ik}/><circle cx="120" cy="95" r="70" ${dash}/><circle cx="120" cy="95" r="64" fill="${col}" ${ik}/>`,
  board:`<rect x="196" y="87" width="34" height="16" rx="8" fill="${col}" ${ik}/><circle cx="120" cy="95" r="84" fill="${col}" ${ik}/><circle cx="120" cy="95" r="74" ${dash}/><circle cx="220" cy="95" r="4" fill="#f6efe0" ${ik}/>`,
  jar:`<circle cx="120" cy="95" r="84" fill="#e9f5d0" fill-opacity=".9" ${ik}/><circle cx="120" cy="95" r="72" fill="${col}" fill-opacity=".85"/><circle cx="120" cy="95" r="78" ${dash}/>`,
  glass:`<circle cx="120" cy="95" r="84" fill="#e9f5fb" fill-opacity=".9" ${ik}/><circle cx="120" cy="95" r="72" fill="${col}" fill-opacity=".85"/><circle cx="120" cy="95" r="78" ${dash}/><path d="M130 86L164 28" ${ik} stroke-width="11" stroke-linecap="round"/><path d="M130 86L164 28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`}[base];
 const R=base==="board"?60:base==="pan"?48:base==="bowl"?54:56;
 return `<div class="pgr"><svg class="base" viewBox="0 0 240 190" aria-hidden="true">${B}</svg><div class="cem"><i>${c}</i></div><div class="ring">${o.map((e,k)=>`<div class="ing" style="--k:${k};--r:${Math.round(k*360/o.length)}deg;--R:${R}px"><u><i>${e}</i></u></div>`).join("")}</div></div>`};
/* ---- themed section spinners: each one is a little scene seen from above that turns at the shared speed (emoji sit on the turning base, like food on a turntable);
   sandwich is a side-view stack like the burger. SCENES[id](colour) returns the art. ---- */
const IK='style="stroke:var(--ink)" stroke-width="3"',DASH='fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"';
const CI=(r,f,x="")=>`<circle cx="120" cy="95" r="${r}" fill="${f}" ${IK} ${x}/>`,RG=r=>`<circle cx="120" cy="95" r="${r}" ${DASH}/>`;
const EM=(e,r,a,s=30,t=0)=>{const x=(120+r*Math.cos(a*Math.PI/180)).toFixed(1),y=(95+r*Math.sin(a*Math.PI/180)).toFixed(1);if(ICO[e])return `<g transform="translate(${x} ${y}) rotate(${t}) scale(${(s/23).toFixed(2)})">${ICO[e]}</g>`;return `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central" transform="rotate(${t} ${x} ${y})">${e}</text>`};
const SPI="M0 0a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0";
const SW=(s,w,c,o=1)=>`<path d="${SPI}" transform="translate(120 95) scale(${s})" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`;
const RR=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const SC=inner=>`<div class="pgr"><svg class="base" viewBox="0 0 240 190" aria-hidden="true">${inner}</svg></div>`;
const HANDLE=(c,x=186,w=40)=>`<rect x="${x}" y="87" width="${w}" height="16" rx="8" fill="${c}" ${IK}/>`;
const EGG=(x,y,s,t)=>`<g transform="translate(${x} ${y}) rotate(${t}) scale(${s})"><path d="M-22 -6C-30 -22 -6 -30 6 -22C24 -26 34 -4 24 8C28 24 6 32 -6 24C-24 30 -34 8 -22 -6Z" fill="#fffdf5" ${IK} stroke-width="2.5" stroke-linejoin="round"/><circle cx="1" cy="0" r="9" fill="#ffb81c" ${IK} stroke-width="2"/><circle cx="-2" cy="-3" r="2.6" fill="#fff" fill-opacity=".8"/></g>`;
const LAY=(k,d)=>`<g class="bl" style="--k:${k}">${d}</g>`;
const SCENES={
 soup:c=>SC(HANDLE("#8a2f1b",192,34)+`<rect x="14" y="87" width="34" height="16" rx="8" fill="#8a2f1b" ${IK}/>`+CI(84,c)+RG(77)+CI(70,"#5a2a22")+CI(64,"#f0a03c")+SW(1.8,2.6,"#fff",.4)+[[30,40],[-50,34],[110,48],[190,26]].map(([a,r])=>`<circle cx="${(120+r*Math.cos(a*.01745)).toFixed(0)}" cy="${(95+r*Math.sin(a*.01745)).toFixed(0)}" r="5" fill="rgba(255,255,255,.55)" ${IK} stroke-width="2"/>`).join("")+EM("🥕",42,20,30,30)+EM("🧅",42,95,28)+EM("🍅",42,170,28)+EM("🥔",42,245,28,20)+EM("🌿",42,320,24,-20)+EM("🧄",16,60,22)),
 dumpling:c=>SC(CI(84,c)+RG(78)+CI(68,"#e8c98b")+[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M120 95L${(120+68*Math.cos(i*Math.PI/6)).toFixed(1)} ${(95+68*Math.sin(i*Math.PI/6)).toFixed(1)}" stroke="#b9853f" stroke-width="2.2"/>`).join("")+`<circle cx="120" cy="95" r="40" fill="none" stroke="#b9853f" stroke-width="2.2"/>`+[0,72,144,216,288].map((a,i)=>EM("🥟",44,a+18,32,Math.round(RR(i+3)*360))).join("")+EM("🥟",0,0,30,Math.round(RR(9)*360))),
 grill:c=>SC(CI(84,"#2f2f36")+`<circle cx="120" cy="95" r="79" fill="none" stroke="#ff8a2a" stroke-opacity=".75" stroke-width="4" stroke-dasharray="6 9" stroke-linecap="round"/>`+[62,42,22].map(r=>`<circle cx="120" cy="95" r="${r}" fill="none" stroke="#6b6b76" stroke-width="3"/>`).join("")+[0,1,2,3,4,5,6,7].map(i=>`<path d="M120 95L${(120+70*Math.cos(i*Math.PI/4)).toFixed(1)} ${(95+70*Math.sin(i*Math.PI/4)).toFixed(1)}" stroke="#55555f" stroke-width="3"/>`).join("")+EM("🥩",46,-25,36,20)+EM("🍗",46,95,34,-30)+EM("🌽",46,215,34,35)+EM("🍄",20,40,24)+EM("🌶️",20,160,24,40)+EM("🥕",20,280,24,-30)),
 salad:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+CI(64,"#8fd36a")+[[60,14,22,40],[150,18,26,-20],[240,12,30,10],[310,16,20,60],[30,40,24,0],[200,44,22,30]].map(([a,r,rx,t])=>`<ellipse cx="${(120+r*Math.cos(a*.01745)+14).toFixed(0)}" cy="${(95+r*Math.sin(a*.01745)).toFixed(0)}" rx="${rx}" ry="9" transform="rotate(${t} 120 95)" fill="#6fbf4a" fill-opacity=".7"/>`).join("")+EM("🥒",42,10,28,20)+EM("🍅",42,80,28)+EM("🫒",42,150,22)+EM("🥕",42,220,28,-30)+EM("🧅",42,290,24)+EM("🥑",14,40,26)+EM("🌽",18,200,24,50)),
 noodle:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+CI(64,"#e0a14a")+SW(2,5.4,"#2a1a13")+SW(2,3.2,"#f7e2a0")+EM("🥚",42,35,28)+EM("🍥",42,150,28)+EM("🥬",42,265,28,-20)+EM("🥢",40,210,32,40)),
 bread:c=>SC(`<rect x="196" y="87" width="34" height="16" rx="8" fill="${c}" ${IK}/>`+CI(84,c)+RG(75)+Array.from({length:22},(_,i)=>`<circle cx="${(120+Math.sqrt(RR(i+7))*64*Math.cos(RR(i)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+7))*64*Math.sin(RR(i)*6.28)).toFixed(0)}" r="${(1.5+RR(i+30)*2).toFixed(1)}" fill="#fff" fill-opacity=".6"/>`).join("")+`<circle cx="220" cy="95" r="4" fill="#f6efe0" ${IK}/>`+EM("🍞",44,-20,40,10)+EM("🥖",44,100,40,-35)+EM("🥐",44,215,36,20)+EM("🥨",12,30,28)+EM("🌾",44,320,24,30)),
 grain:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+CI(63,"#f3e3b8")+Array.from({length:34},(_,i)=>`<ellipse cx="${(120+Math.sqrt(RR(i+5))*58*Math.cos(RR(i+60)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+5))*58*Math.sin(RR(i+60)*6.28)).toFixed(0)}" rx="4.5" ry="2" transform="rotate(${Math.round(RR(i+90)*180)} ${(120+Math.sqrt(RR(i+5))*58*Math.cos(RR(i+60)*6.28)).toFixed(0)} ${(95+Math.sqrt(RR(i+5))*58*Math.sin(RR(i+60)*6.28)).toFixed(0)})" fill="#fffaf0"/>`).join("")+EM("🍚",0,0,36)+EM("🥕",40,30,26)+EM("🧅",40,150,24)+EM("🌾",40,270,26,20)),
 bake:c=>SC(CI(84,"#c9ced6")+RG(77)+CI(70,"#aeb4bd")+CI(64,"#f7c6d4")+Array.from({length:12},(_,i)=>`<circle cx="${(120+52*Math.cos(i*Math.PI/6)).toFixed(1)}" cy="${(95+52*Math.sin(i*Math.PI/6)).toFixed(1)}" r="6" fill="#fff" ${IK} stroke-width="2"/>`).join("")+EM("🍒",0,0,36)+[0,72,144,216,288].map(a=>EM("🍓",30,a,22,a)).join("")),
 drinks:c=>SC(CI(84,"#e9f5fb")+CI(72,c,'fill-opacity=".9"')+RG(78)+[[40,30,14],[160,36,-18],[270,30,28]].map(([a,r,t])=>`<rect x="${(120+r*Math.cos(a*.01745)-12).toFixed(0)}" y="${(95+r*Math.sin(a*.01745)-12).toFixed(0)}" width="24" height="24" rx="6" transform="rotate(${t} ${(120+r*Math.cos(a*.01745)).toFixed(0)} ${(95+r*Math.sin(a*.01745)).toFixed(0)})" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width="2"/>`).join("")+EM("🍋",42,-60,36,10)+EM("🍊",42,100,32)+EM("🌿",44,205,28,-40)+`<path d="M130 86L164 28" ${IK} stroke-width="11" stroke-linecap="round"/><path d="M130 86L164 28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
 sauce:c=>SC(HANDLE("#6b4a2b")+CI(76,"#3b3b44")+RG(70)+CI(64,c)+SW(1.8,3,"#fff",.45)+EM("🍅",44,30,30)+EM("🧄",44,150,26)+EM("🌿",44,270,28,20)+EM("🌶️",18,210,24,30)),
 eggs:c=>SC(HANDLE("#6b4a2b")+CI(76,"#3b3b44")+RG(70)+CI(64,"#55555f")+EGG(98,76,1,-15)+EGG(146,114,.92,20)+EM("🍄",42,215,26,20)+EM("🧈",44,-30,24,30)+EM("🥓",20,45,26,-40)),
 jam:c=>SC(CI(84,"#e9f5d0",'fill-opacity=".9"')+RG(78)+`<circle cx="120" cy="95" r="58" fill="${c}" ${IK}/><circle cx="120" cy="95" r="52" fill="#fff" stroke="#d63a22" stroke-width="7" stroke-dasharray="9 7"/><circle cx="120" cy="95" r="44" fill="none" stroke="#c9a26a" stroke-width="3"/>`+EM("🍓",0,0,36)+EM("🍓",70,0,24)+EM("🍑",70,72,24)+EM("🍇",70,144,24)+EM("🍋",70,216,24)+EM("🍒",70,288,24)),
 dairy:c=>SC(CI(84,"#8fb8de")+RG(77)+CI(70,"#f6efe0")+CI(62,"#fffaf0")+SW(1.7,4,"#e9dcc0")+EM("🧀",40,40,28,20)+EM("🧈",40,160,26)+EM("🍯",40,280,26)),
 spice:c=>SC(CI(84,"#9a9aa3")+RG(77)+CI(70,"#6d6d76")+CI(62,c)+Array.from({length:30},(_,i)=>`<circle cx="${(120+Math.sqrt(RR(i+2))*54*Math.cos(RR(i+40)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+2))*54*Math.sin(RR(i+40)*6.28)).toFixed(0)}" r="${(2+RR(i+70)*2).toFixed(1)}" fill="${["#8a3a10","#e8a33a","#b5481c","#f3d27a"][i%4]}"/>`).join("")+`<rect x="116" y="87" width="66" height="16" rx="8" fill="#d9d0c0" ${IK}/><circle cx="182" cy="95" r="9" fill="#d9d0c0" ${IK}/>`+EM("🌶️",42,115,26,20)+EM("🧄",42,195,24)+EM("🌿",42,275,26,-30)),
 frozen:c=>SC(CI(84,c)+RG(77)+CI(70,"#f6efe0")+[[30,"#f7b6cc"],[150,"#fff1c9"],[270,"#b6e8cf"]].map(([a,f])=>{const x=120+34*Math.cos(a*.01745),y=95+34*Math.sin(a*.01745);return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="${f}" ${IK}/><path d="M${(x-14).toFixed(0)} ${(y-8).toFixed(0)}q8-12 20-8" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>`}).join("")+EM("🍒",0,0,28)+EM("🍓",50,90,18)+EM("🍫",50,210,18)+EM("🍋",50,330,18)),
 cheese:c=>SC(`<rect x="196" y="87" width="34" height="16" rx="8" fill="#c98a3a" ${IK}/>`+CI(84,"#c98a3a")+RG(77)+CI(70,"#e0a85a")+CI(36,c)+CI(30,"#ffe58a",'fill-opacity=".9"')+[[-25,12,4],[40,18,3],[120,14,3.5],[200,20,3],[290,12,4]].map(([a,r,d])=>`<circle cx="${(120+r*Math.cos(a*.01745)).toFixed(0)}" cy="${(95+r*Math.sin(a*.01745)).toFixed(0)}" r="${d}" fill="#e6a312"/>`).join("")+`<circle cx="220" cy="95" r="4" fill="#f6efe0" ${IK}/>`+EM("🧀",50,-48,30,15)+EM("🥛",44,100,24)+EM("🧂",50,205,24,-15)+EM("🌿",50,25,26,-20)),
 starter:c=>SC(CI(84,"#e9f5d0",'fill-opacity=".9"')+RG(78)+`<circle cx="120" cy="95" r="62" fill="${c}" ${IK}/>`+Array.from({length:9},(_,i)=>`<circle cx="${(120+Math.sqrt(RR(i+11))*46*Math.cos(RR(i+50)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+11))*46*Math.sin(RR(i+50)*6.28)).toFixed(0)}" r="${(3+RR(i+80)*5).toFixed(1)}" fill="#fff" fill-opacity=".6" ${IK} stroke-width="2"/>`).join("")+EM("🌾",0,0,36)+EM("🍯",46,60,24)+EM("🍋",46,180,24)+EM("🍞",46,300,26,-10)),
 cure:c=>SC(`<rect x="196" y="87" width="34" height="16" rx="8" fill="#d9a45a" ${IK}/>`+CI(84,"#d9a45a")+RG(77)+`<rect x="76" y="64" width="88" height="62" rx="16" fill="${c}" ${IK}/>`+[78,92,106].map(y=>`<path d="M84 ${y}Q102 ${y-5} 120 ${y}T156 ${y}" fill="none" stroke="#ffe9dc" stroke-width="6" stroke-linecap="round"/>`).join("")+Array.from({length:26},(_,i)=>`<circle cx="${(120+(RR(i+3)-.5)*74).toFixed(0)}" cy="${(95+(RR(i+40)-.5)*48).toFixed(0)}" r="${(1+RR(i+70)*1.4).toFixed(1)}" fill="#fff"/>`).join("")+`<circle cx="220" cy="95" r="4" fill="#f6efe0" ${IK}/>`+EM("🧂",58,-40,26,-10)+EM("🌿",58,40,26,20)+EM("🧄",58,140,24)+EM("🌶️",58,225,24,25)),
 rub:c=>SC(`<rect x="196" y="87" width="34" height="16" rx="8" fill="#d9a45a" ${IK}/>`+CI(84,"#d9a45a")+RG(77)+`<path d="M76 92Q72 64 102 60Q138 52 162 76Q176 100 150 124Q122 140 94 126Q78 116 76 92Z" fill="#b8382a" ${IK}/><path d="M92 112Q86 90 100 76" fill="none" stroke="#ffd9c9" stroke-width="6" stroke-linecap="round"/>`+Array.from({length:44},(_,i)=>`<circle cx="${(122+Math.sqrt(RR(i+5))*40*Math.cos(RR(i+60)*6.28)).toFixed(0)}" cy="${(94+Math.sqrt(RR(i+5))*30*Math.sin(RR(i+60)*6.28)).toFixed(0)}" r="${(1.2+RR(i+90)*1.8).toFixed(1)}" fill="${["#8a3a10","#e8a33a","#4c8c2b","#f3d27a","#5a2a14"][i%5]}"/>`).join("")+`<circle cx="220" cy="95" r="4" fill="#f6efe0" ${IK}/>`+EM("🌶️",60,-40,26,20)+EM("🧄",60,50,24)+EM("🌿",60,140,26,-20)+EM("🍋",60,230,26,10)),
 bbq:c=>SC(CI(84,"#2f2f36")+`<circle cx="120" cy="95" r="79" fill="none" stroke="#ff8a2a" stroke-opacity=".75" stroke-width="4" stroke-dasharray="6 9" stroke-linecap="round"/>`+CI(68,"#3a2622")+Array.from({length:18},(_,i)=>`<circle cx="${(120+Math.sqrt(RR(i+13))*58*Math.cos(RR(i+20)*6.28)).toFixed(0)}" cy="${(95+Math.sqrt(RR(i+13))*58*Math.sin(RR(i+20)*6.28)).toFixed(0)}" r="${(3+RR(i+44)*4).toFixed(1)}" fill="${["#ff7a1a","#ffb02e","#e0301e"][i%3]}" fill-opacity=".85"/>`).join("")+[-36,-12,12,36].map(y=>`<path d="M${(120-Math.sqrt(66*66-y*y)).toFixed(0)} ${95+y}H${(120+Math.sqrt(66*66-y*y)).toFixed(0)}" stroke="#6b6b76" stroke-width="3.5" stroke-linecap="round"/>`).join("")+EM("🍖",44,-20,36,15)+EM("🌽",44,100,34,35)+EM("🍗",44,220,34,-25)+EM("🔥",16,40,24)),
 sausage:c=>SC(HANDLE("#6b4a2b")+CI(76,"#3b3b44")+RG(70)+CI(64,"#55555f")+[[70,-8],[95,6],[120,-6]].map(([y,b])=>`<path d="M82 ${y}Q120 ${y+b} 158 ${y}" fill="none" style="stroke:var(--ink)" stroke-width="23" stroke-linecap="round"/><path d="M82 ${y}Q120 ${y+b} 158 ${y}" fill="none" stroke="${c}" stroke-width="17" stroke-linecap="round"/><path d="M94 ${y-4}Q120 ${y-4+b} 148 ${y-4}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/><path d="M98 ${y-6}l5 12M114 ${y-6+b/4}l5 12M130 ${y-6+b/4}l5 12M146 ${y-6}l5 12" stroke="#7a2f14" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`).join("")+EM("🧅",50,-90,24)+EM("🌶️",50,90,24,30)),
 sandwich:()=>`<div class="bgr"><svg viewBox="0 0 240 190" aria-hidden="true"><circle cx="120" cy="95" r="84" fill="#f6efe0" style="stroke:var(--ink)" stroke-width="3"/><circle class="rim" cx="120" cy="95" r="76" fill="none" stroke="#d63a22" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 24"/><g transform="translate(120 98) scale(.7) translate(-120 -121)">`+
  LAY(0,`<rect x="44" y="144" width="152" height="24" rx="11" fill="#e8c98b" ${IK}/><path d="M60 156h120" stroke="#fff3cf" stroke-width="3" stroke-linecap="round"/>`)+
  LAY(1,`<path d="M40 136q9.5 10 19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0v12H40z" fill="#f4a3a3" ${IK} stroke-linejoin="round"/>`)+
  LAY(2,`<path d="M46 124h148v8h-40l-10 12-10-12H46z" fill="#ffc63d" ${IK} stroke-linejoin="round"/>`)+
  LAY(3,`<ellipse cx="82" cy="119" rx="30" ry="6.5" fill="#d63a22" ${IK}/><ellipse cx="158" cy="119" rx="30" ry="6.5" fill="#d63a22" ${IK}/>`)+
  LAY(4,`<path d="M38 108q9.5 10 19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0t19 0v6H38z" fill="#5fbf6a" ${IK} stroke-linejoin="round"/>`)+
  LAY(5,`<path d="M44 106v-14q0-18 18-18h116q18 0 18 18v14z" fill="#e8c98b" ${IK} stroke-linejoin="round"/><path d="M66 88h108" stroke="#fff3cf" stroke-width="3" stroke-linecap="round"/>`)+`</g></svg></div>`};
/* id: [button label, spinner caption, base, colour, centre emoji, orbiting emojis] */
const SPIN={
 bread:["Spin a bread!","Kneading the dough…","board","#c98a3a","🍞",["🌾","🧈","🥖"]],
 grain:["Spin a grain dish!","Fluffing the grains…","bowl","#e07a3a","🍚",["🌾","🥕","🧅"]],
 bake:["Spin a bake!","Preheating the oven…","board","#e58fa6","🧁",["🥚","🧈","🍫"]],
 drinks:["Spin a drink!","Shaking it up…","glass","#f5a623","🍹",["🍋","🍊","🌿"]],
 soup:["Spin a soup!","Stirring the pot…","bowl","#d95f3b","🍲",["🥕","🧅","🍅"]],
 sauce:["Spin a sauce!","Whisking it together…","jar","#d63a22","🥫",["🍅","🧄","🌿"]],
 eggs:["Spin an egg dish!","Cracking the eggs…","pan","#ffd35c","🍳",["🥚","🧈","🍄"]],
 jam:["Spin a jam!","Bubbling the fruit…","jar","#a33a6b","🍓",["🍑","🍇","🍋"]],
 dairy:["Spin a dairy ferment!","Warming the milk…","jar","#fff1c9","🥛",["🧀","🧈","🥣"]],
 dumpling:["Spin a dumpling!","Pleating the dumplings…","bowl","#c9a26a","🥟",["🧄","🥬","🌶️"]],
 grill:["Spin a grill!","Heating the grill…","pan","#7a3b1d","🥩",["🔥","🌶️","🍋"]],
 sandwich:["Spin a sandwich!","Stacking the filling…","board","#d9a45a","🥪",["🍅","🥬","🧀"]],
 salad:["Spin a salad!","Tossing the leaves…","bowl","#5fbf6a","🥗",["🥒","🍅","🫒"]],
 noodle:["Spin a noodle dish!","Tossing the wok…","bowl","#c0392b","🍜",["🥢","🌶️","🥬"]],
 spice:["Spin a spice blend!","Grinding the spices…","jar","#c9741a","🌶️",["🧄","🌿","🧂"]],
 frozen:["Spin a frozen treat!","Churning it up…","glass","#f4a6c0","🍨",["🍓","🍦","🍋"]],
 cure:["Spin a cure!","Rubbing in the salt…","board","#b5483a","🥓",["🧂","🌿","🧄"]],
 sausage:["Spin a sausage!","Stuffing the casings…","pan","#c9572f","🌭",["🌶️","🧅","🧂"]],
 rub:["Spin a rub!","Mixing the spices…","jar","#c9741a","🌶️",["🧄","🌿","🍋"]],
 bbq:["Spin a smoke!","Lighting the coals…","pan","#7a3b1d","🍖",["🔥","🌶️","🌽"]],
 cheese:["Spin a cheese!","Warming the milk…","board","#f1c24b","🧀",["🥛","🧂","🌿"]],
 starter:["Spin a starter!","Feeding the jar…","jar","#d9b26a","🍞",["🌾","🍯","🍋"]]};
const CRAFT_ARTS={burger:BURGER_ART,pasta:PASTA_ART};
Object.keys(SPIN).forEach(id=>{if(TOOLS[id])CRAFT_ARTS[id]=SCENES[id]?SCENES[id](SPIN[id][3]):emojiArt(SPIN[id][2],SPIN[id][3],SPIN[id][4],SPIN[id][5])});
window.__craftArts=CRAFT_ARTS;
const autoSpin=T=>s=>{T.ctl.forEach(c=>{if(c.tg)s[c.k]=c.tg[Math.floor(Math.random()*c.tg.length)][0]})}; // a random option for every choice; amounts and people stay as set
Object.keys(TOOLS).forEach(id=>{const T=TOOLS[id],sp=SPIN[id];
 if(!T.name){const kc=((window.KITCHEN&&window.KITCHEN.CRAFTS)||[]).find(c=>c.id===id);T.name=kc?kc.name:T.title} // the card name from kitchen.js, used in "Search ... recipes"
 T.art=CRAFT_ARTS[id];if(sp){T.spinLabel=T.spinLabel||sp[0];T.spinNote=T.spinNote||sp[1]}
 if(!T.spin)T.spin=autoSpin(T);
 if(!T.names)T.names=[...new Set(T.ctl.filter(c=>c.tg&&!c.only).flatMap(c=>c.tg.map(o=>o[1])))]});
TOOLS.grill.main="m"; // Doneness and Thickness depend on the meat (key m), not on key t

const LEARN=window.CRAFTLIB.LEARN; // the "Good to know" notes, filled in by the craft-*.js files
const cfg=id=>{const o=ST[id]=ST[id]||{};TOOLS[id].ctl.forEach(c=>{if(o[c.k]===undefined)o[c.k]=c.def});return o};
function draw(id){
 const T=TOOLS[id],s=cfg(id),root=document.getElementById("tab-"+id);if(!root)return;
 const nm=c=>esc(c.label.replace(/\s*\(.*$/,"").toLowerCase().replace(/^how many\s*/,"").replace(/^how much to make$/,"")||"amount"); // "Flour" -> "flour", "How many cookies" -> "cookies"
 const vis=T.ctl.filter(c=>!c.only||[].concat(c.only).includes(s[T.main||"t"]));
 const ctl=vis.map(c=>`<div class="lab"${c===vis[0]?"":' style="margin-top:16px"'}>${I(c.icon)}${esc(c.label)}</div>`+(c.tg?`<div class="tg">${c.tg.map(o=>`<button data-k="${c.k}" data-v="${esc(o[0])}" aria-pressed="${String(s[c.k])===String(o[0])}">${esc(o[1])}</button>`).join("")}</div>`
   :c.ms?`<div class="tg">${c.ms.map(o=>`<button data-k="${c.k}" data-m="${esc(o[0])}" aria-pressed="${(s[c.k]||[]).includes(o[0])}">${esc(o[1])}</button>`).join("")}</div>`
   :`<div class="step"><button data-k="${c.k}" data-d="-1" aria-label="Less ${nm(c)}">${I("minus")}</button><b>${s[c.k]||people}${c.step[3]?" "+c.step[3]:""}</b><button data-k="${c.k}" data-d="1" aria-label="More ${nm(c)}">${I("plus")}</button></div>`)).join("");
 const r=T.calc(s);if(!r.learn){const L=LEARN[id];r.learn=L&&L[s[T.main||"t"]]}
 root.querySelector("[data-ctl]").innerHTML=ctl;
 root.querySelector("[data-out]").innerHTML=`<article class="card"><div class="hero"><div class="ic">${I(T.icon)}</div><h2>${esc(r.title)}</h2></div><div class="body">
  <div class="meta">${r.meta.map(m=>`<span>${I(m[0])}${esc(m[1])}</span>`).join("")}</div>
  ${(r.note||[]).map(n=>`<div class="call" style="background:var(--soft)">${I("flame")}<span>${esc(n)}</span></div>`).join("")}
  ${r.learn?`<details class="learn" style="margin:12px 0;padding:10px 14px;border-radius:14px;background:var(--soft)"><summary style="cursor:pointer;font-weight:700">Good to know</summary>${r.learn.map(n=>`<p style="margin:8px 0 0">${esc(n)}</p>`).join("")}</details>`:""}
  ${r.more?`<p style="margin:0 0 12px;font-size:.92em">More: ${r.more.map(m=>`<a href="${esc(m[1])}" target="_blank" rel="noopener noreferrer">${esc(m[0])}</a>`).join(" · ")}</p>`:""}
  <div class="split"><div><h3>${I("list")}Ingredients <small style="text-transform:none;letter-spacing:0;color:var(--mute)">(tap to tick off)</small></h3><ul class="ing">${r.ing.map(i=>`<li><span>${esc(i[0])}</span><span class="q">${esc(i[1])}</span></li>`).join("")}</ul></div>
  <div><h3>${I("chef")}Method</h3><ol>${r.steps.map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol></div></div>
  <div class="row"><button class="go" data-a="start">${I("flame")}Start cooking</button><button class="pzsave">${I("heart")}Save</button><button data-a="copy" data-copy>${I("cart")}Copy list</button><button data-a="share">${I("share")}Share</button><button type="button" data-a="rand" data-spin>Spin again</button></div></div></article>`;
 root.querySelectorAll(".ing li").forEach(li=>li.onclick=()=>li.classList.toggle("done"));
 decorate(id,T,r,root,s);
 root.querySelector("[data-copy]").onclick=e=>{const b=e.currentTarget,txt=r.title+"\n"+r.ing.map(i=>"• "+i[0]+" – "+i[1]).join("\n");
  copyText(txt).then(ok=>flash(b,ok?"check":"cart",ok?"Copied":"Couldn't copy"))};
}
/* ---- card buttons: the same set and order as the Cook card: Start cooking · Spin again, then Save · Copy list · Share · Like · Not for me ---- */
const FK="mr-craftfav",favs=()=>{try{return JSON.parse(localStorage.getItem(FK)||"[]")||[]}catch(e){return[]}},setFavs=f=>{try{localStorage.setItem(FK,JSON.stringify(f.slice(0,60)))}catch(e){}};
function drawFavs(id){
 const root=document.getElementById("tab-"+id),el=root&&root.querySelector("[data-fav]");if(!el)return;
 const f=favs().filter(x=>x.id===id);
 el.innerHTML=f.length?`<h3>${I("heart")}Saved</h3>`+f.map((x,i)=>`<button data-fi="${i}">${I("heart")}${esc(x.title)}</button>`).join(""):"";
 el.onclick=e=>{const b=e.target.closest("button[data-fi]");if(!b)return;const x=f[+b.dataset.fi];if(!x)return;Object.assign(cfg(id),x.s);save();draw(id);const c=root.querySelector(".card");if(c)c.scrollIntoView({behavior:"smooth",block:"start"})};
}
function decorate(id,T,r,root,s){
 const row=root.querySelector("[data-out] .row");if(!row)return;
 const go=row.querySelector("[data-a=start]"),sv=row.querySelector(".pzsave"),sh=row.querySelector("[data-a=share]"),sig=JSON.stringify(s);
 go.onclick=()=>{if(window.__cook)window.__cook({title:r.title,steps:r.steps,list:r.ing})};
 const has=()=>favs().some(x=>x.id===id&&x.sig===sig),paint=()=>{sv.setAttribute("aria-pressed",String(has()));sv.innerHTML=I("heart")+(has()?"Saved":"Save")};
 sv.onclick=()=>{let f=favs();if(has())f=f.filter(x=>!(x.id===id&&x.sig===sig));else f.unshift({id,title:r.title,sig,s:JSON.parse(sig)});setFavs(f);paint();drawFavs(id);navigator.vibrate&&navigator.vibrate(15)};paint();
 sh.onclick=async()=>{const text=r.title+"\n\nIngredients\n"+r.ing.map(i=>"• "+i[0]+" – "+i[1]).join("\n")+"\n\nMethod\n"+r.steps.map((x,k)=>(k+1)+". "+x).join("\n")+"\n\nMade with Meal Roulette";
  try{if(navigator.share)await navigator.share({title:r.title,text});else{flash(sh,"share",await copyText(text)?"Copied":"Couldn't copy")}}catch(e){}};
 try{const m=root.querySelector("[data-out] .meta");if(m&&window.__noteBlock)m.after(window.__noteBlock(r.title))}catch(e){}
 if(window.__thumbs)window.__thumbs(row,r.title,{craft:id},()=>spinTool(id));
 if(window.__tidyRow)window.__tidyRow(row,T.icon);
}

/* spin a random build: full-screen spinner with the tool's own art and a name ticker, then the card (same rhythm as Cook, Pizza and Ferment) */
const SPINNING={};
function spinTool(id,instant){
 const T=TOOLS[id],root=document.getElementById("tab-"+id);if(!T||!T.spin||!root||SPINNING[id])return;
 const done=()=>{T.spin(cfg(id));save();draw(id);const c=root.querySelector(".card");if(c)c.scrollIntoView({behavior:"smooth",block:"start"})};
 if(instant||matchMedia("(prefers-reduced-motion:reduce)").matches||(window.mrNoSpin&&mrNoSpin())||!window.mrSpinNames||!T.art)return done();
 SPINNING[id]=1;const bs=[...root.querySelectorAll("[data-spin]")];bs.forEach(b=>b.disabled=true);
 const rl=document.createElement("div");rl.className="reel on";rl.setAttribute("aria-hidden","true");
 rl.innerHTML=`<div class="stage"><div class="art on">${T.art}</div></div><div class="rtx"><span class="rt"></span><small>${esc(T.spinNote||"Picking something tasty…")}</small></div>`;
 document.body.appendChild(rl);
 mrSpinNames(rl.querySelector(".rt"),T.names||[T.title],()=>{rl.remove();bs.forEach(b=>b.disabled=false);SPINNING[id]=0;done()});
}
Object.keys(TOOLS).forEach(id=>{
 const T=TOOLS[id],root=document.getElementById("tab-"+id);if(!root)return;
 T.icon=T.icon||({bread:"bread",grain:"rice",bake:"cupcake",drinks:"drinks",pasta:"pasta",soup:"soup",sauce:"sauce",eggs:"egg",jam:"jam",dairy:"dairy",dumpling:"dumpling",burger:"burger",grill:"grill",sandwich:"sandwich",salad:"salad",noodle:"noodle",spice:"spice",frozen:"icecream"})[id]||"chef";
 root.innerHTML=`<h1 class="hl">${esc(T.title)}</h1><p>${esc(T.sub)}</p><div class="cols"><aside class="side"><section class="panel" data-ctl></section>${T.spin?`<button type="button" class="fmspin" data-spin>${I(T.icon)}${esc(T.spinLabel||"Spin!")}</button>`:""}<div class="fav" data-fav></div></aside><section class="res"><div data-out></div></section></div>
  <section class="panel"><div class="lab">${I(T.icon)}Recipes</div><input class="bksearch rsearch" type="search" placeholder="Search ${esc(T.name)} recipes…" aria-label="Search ${esc(T.name)} recipes" autocomplete="off"><p class="hint" data-n></p><ul class="bklist" data-l></ul><button type="button" class="stubmore" hidden></button></section>`;
 root.querySelector("[data-ctl]").addEventListener("click",e=>{
  const b=e.target.closest("button[data-k]");if(!b)return;const box=e.currentTarget,at=[...box.querySelectorAll("button")].indexOf(b),s=cfg(id),c=T.ctl.find(x=>x.k===b.dataset.k);
  if(b.dataset.m!==undefined){const a=Array.isArray(s[c.k])?s[c.k]:[];s[c.k]=a.includes(b.dataset.m)?a.filter(x=>x!==b.dataset.m):[...a,b.dataset.m]}
  else if(b.dataset.d){const[lo,hi,by]=c.step,v=(s[c.k]||people)+(+b.dataset.d)*by;s[c.k]=Math.min(hi,Math.max(lo,v))}
  else{const o=c.tg.find(x=>String(x[0])===b.dataset.v);s[c.k]=o?o[0]:b.dataset.v}
  save();draw(id);const nb=box.querySelectorAll("button")[at];if(nb)nb.focus()});
 root.addEventListener("click",e=>{const b=e.target.closest("[data-spin]");if(b&&!b.disabled)spinTool(id)});
 draw(id);drawFavs(id);
});

window.CRAFT={tools:TOOLS,cfg,spin:spinTool,redraw:()=>Object.keys(TOOLS).forEach(id=>{if(document.getElementById("tab-"+id)){draw(id);drawFavs(id)}})};
})();
