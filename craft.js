/* craft.js — calculators for the Craft hub. Load order: after ferment.js, before engine.js.
   Each tool fills <div id="tab-ID"> and keeps its settings in localStorage ("mr-craft").
   To add a tool: add an entry to TOOLS (controls + calc), add <div id="tab-ID" class="tab" role="tabpanel" hidden></div>
   to index.html, and set ready:1, rec:1 for ID in the UI table. Every amount is worked out in grams. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const I=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
const KEY="mr-craft";let ST={};try{ST=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}};
/* copy to the clipboard; falls back to a hidden textarea + execCommand where the Clipboard API is missing or refused (older browsers, non-secure pages). Resolves true/false. */
const copyText=async t=>{
 try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(t);return true}}catch(e){}
 try{const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.cssText="position:fixed;top:0;left:0;opacity:0";document.body.appendChild(a);a.select();a.setSelectionRange(0,t.length);const ok=document.execCommand("copy");a.remove();return !!ok}catch(e){return false}};
/* flash a button label ("Copied" / "Couldn't copy"), then put the original back after 2 s; a second press restarts the timer */
const flash=(b,icon,txt)=>{if(b._t)clearTimeout(b._t);else b._o=b.innerHTML;b.innerHTML=I(icon)+txt;b._t=setTimeout(()=>{b.innerHTML=b._o;b._t=b._o=null},2000)};
let people=2;try{people=Math.min(10,Math.max(1,+(JSON.parse(localStorage.getItem("mr-state")||"{}").n)||2))}catch(e){}
const rg=a=>a<10?Math.round(a*2)/2:a<100?Math.round(a):a<500?Math.round(a/5)*5:Math.round(a/10)*10;
const G=a=>rg(a)+" g",ML=a=>rg(a)+" g",P1=a=>Math.max(.5,Math.round(a*2)/2);
const eggs=gr=>{const n=Math.max(.5,Math.round(gr/50*2)/2);return n+(n===1?" egg":" eggs")+" ("+rg(gr)+" g)"};
const hm=m=>m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+m%60+" min":"");

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
const TOOLS={
bread:{title:"What are we baking?",sub:"Baker's percentages: pick a bread and your flour, and every amount follows.",
 ctl:[{k:"t",label:"Bread",icon:"bread",def:"lean",tg:[["lean","Everyday loaf"],["sour","Sourdough"],["focaccia","Focaccia"],["rolls","Soft rolls"],["pita","Flatbreads"]]},
      {k:"f",label:"Flour",icon:"ruler",def:500,step:[250,1500,50,"g"]}],
 calc(s){
  const F=s.f,B={
   lean:{n:"Everyday loaf",h:68,y:.7,sl:2,mins:[["Mix and rest",30],["Three folds, 30 min apart",90],["Shape and proof",45],["Bake",30]],
    st:["Mix everything into a shaggy dough and rest 30 minutes, covered.","Fold the dough over itself 3 times, 30 minutes apart (wet your hand so it does not stick).","Leave to rise until about 1½ times bigger, 1–1½ hours.","Shape into a tight loaf and proof 45 minutes. Heat the oven to 230 °C with a tray of water at the bottom.","Slash the top and bake 25–30 minutes until deep golden and hollow when tapped. Cool 30 minutes before slicing."]},
   sour:{n:"Sourdough",h:75,y:0,sl:2,starter:20,
    st:["Mix the flour, water and starter and rest 30 minutes. Then add the salt.","Fold the dough 4 times over 2 hours.","Let it rise at room temperature (about 24 °C) 4–6 hours, until about 50% bigger and jiggly.","Shape into a tight round and chill in a floured bowl 8–14 hours.","Heat a lidded pot in the oven at 245 °C. Bake the loaf 20 minutes with the lid on, then 20–25 minutes with it off, until dark golden. Cool 1 hour."]},
   focaccia:{n:"Focaccia",h:80,y:.8,sl:2,oil:6,
    st:["Stir everything except the topping oil into a very wet dough. Rest 30 minutes.","Fold 2–3 times, 30 minutes apart, then rise 1–2 hours (or overnight in the fridge).","Pour half the topping oil into the tray, tip the dough in and stretch it to the corners. Rest 30 minutes.","Heat the oven to 220 °C. Dimple the dough with oiled fingers, drizzle with the rest of the oil and flaky salt.","Bake 22–25 minutes until golden underneath and on top."]},
   rolls:{n:"Soft rolls",h:56,y:1,sl:1.8,sugar:8,butter:8,egg:10,milk:1,
    st:["Mix the flour, sugar, salt and yeast. Add the warm milk and egg, then knead 8–10 minutes until smooth.","Work in the soft butter and knead 3 minutes more.","Rise about 1 hour until doubled.","Divide into 70 g balls, shape and place them close together on a tray. Proof 40 minutes.","Brush with milk and bake at 190 °C for 15–18 minutes until golden."]},
   pita:{n:"Flatbreads",h:62,y:1,sl:2,oil:3,
    st:["Mix everything and knead 8 minutes until smooth. Rise about 1 hour.","Divide into 90 g balls and roll each into a 3 mm disc.","Heat a dry pan until very hot. Cook 1–2 minutes per side until puffed with brown spots.","Stack and wrap in a cloth so they stay soft."]}}[s.t];
  const st=B.starter?F*B.starter/100:0,fl=F-st/2,wt=F*B.h/100-st/2-(B.milk?0:0),ing=[],sub=B.milk?"warm milk":"water";
  ing.push(["Flour",G(fl)],[B.milk?"Warm milk":"Water (about 25 °C)",G(wt)]);
  if(st)ing.push(["Active sourdough starter (100% hydration)",G(st)]);
  ing.push(["Salt",(Math.round(F*B.sl/100*2)/2)+" g"]);
  if(B.y)ing.push(["Instant yeast",(Math.max(1,Math.round(F*B.y/100*2)/2))+" g"]);
  if(B.sugar)ing.push(["Sugar",G(F*B.sugar/100)]);
  if(B.butter)ing.push(["Soft butter",G(F*B.butter/100)]);
  if(B.egg)ing.push(["Egg",eggs(F*B.egg/100)]);
  if(B.oil)ing.push([s.t==="focaccia"?"Olive oil (dough 6%, plus tray and top)":"Oil",G(s.t==="focaccia"?F*.14:F*B.oil/100)]);
  const tot=F+wt-0+(B.sugar||0)*F/100+(B.butter||0)*F/100+(B.egg||0)*F/100+(B.oil||0)*F/100,
   made=s.t==="rolls"?Math.round(tot/70)+" rolls":s.t==="pita"?Math.round(tot/90)+" flatbreads":s.t==="focaccia"?"one tray about "+(F<=500?"25 × 35":"30 × 40")+" cm":"about "+Math.max(1,Math.round(tot/800*10)/10)+" loaf"+(tot>1200?"s":"");
  return{title:B.n,meta:[["clock",s.t==="sour"?"About 1 day":s.t==="pita"?"About 2 hours":"About 4 hours"],["bread","Dough "+G(tot)],["check","Makes "+made]],
   note:["Hydration "+B.h+"%. Salt "+B.sl+"% of the flour weight."],ing,steps:B.st}}},
grain:{title:"What are we cooking?",sub:"Rice and grains with exactly the right water.",
 ctl:[{k:"t",label:"Grain",icon:"rice",def:"white",tg:[["white","White rice"],["basmati","Basmati"],["brown","Brown rice"],["quinoa","Quinoa"],["couscous","Couscous"],["bulgur","Bulgur"],["barley","Pearl barley"],["polenta","Polenta"],["risotto","Risotto"]]},
      {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,T={
   white:{n:"White rice",pp:75,w:1.5,m:12,r:10,tip:"Rinse until the water runs nearly clear."},basmati:{n:"Basmati rice",pp:75,w:1.5,m:10,r:5,tip:"Rinse well and soak 20 minutes if you have time."},
   brown:{n:"Brown rice",pp:75,w:2.25,m:40,r:10,tip:"Rinse first. It takes longer because of the bran."},quinoa:{n:"Quinoa",pp:60,w:2,m:15,r:5,tip:"Rinse in a sieve to wash off the bitter coating."},
   couscous:{n:"Couscous",pp:70,w:1,m:0,r:5,tip:"No cooking: pour boiling water over it."},bulgur:{n:"Bulgur (medium)",pp:70,w:1.5,m:12,r:10,tip:"Coarse bulgur needs about 5 minutes more."},
   barley:{n:"Pearl barley",pp:70,w:3,m:30,r:5,tip:"Drain any water left at the end."},polenta:{n:"Polenta (coarse)",pp:70,w:4.5,m:40,r:0,tip:"Stir often. Instant polenta takes only 5 minutes."},
   risotto:{n:"Risotto",pp:75,w:3.3,m:18,r:2,tip:"Keep the stock hot in a second pan."}}[s.t],
  d=T.pp*n,w=d*T.w,salt=Math.max(.5,Math.round(w*(s.t==="risotto"?.004:.007)*2)/2),ing=[];let steps=[];
  if(s.t==="risotto"){
   ing.push(["Risotto rice (arborio or carnaroli)",G(d)],["Hot stock",ML(w)],["Onion, finely chopped",G(40*n)],["Butter",G(15*n)],["White wine (optional)",ML(30*n)],["Parmesan, grated",G(20*n)],["Salt (taste first, stock is salty)","about "+salt+" g"]);
   steps=["Soften the onion in half the butter 5 minutes. Add the rice and stir 2 minutes until the grains look glassy.","Add the wine and stir until it is gone.","Add the hot stock one ladle at a time, stirring, letting each be absorbed before the next. This takes about 18 minutes.","Take off the heat when the rice is creamy but still has a little bite. Stir in the rest of the butter and the parmesan, cover and rest 2 minutes."]}
  else if(s.t==="couscous"){
   ing.push(["Couscous",G(d)],["Boiling water or stock",ML(w)],["Olive oil",ML(5*n)],["Salt",salt+" g"]);
   steps=["Stir the salt and oil into the couscous in a bowl.","Pour over the boiling water, cover tightly and leave 5 minutes.","Fluff with a fork."]}
  else if(s.t==="polenta"){
   ing.push(["Coarse polenta",G(d)],["Water or stock",ML(w)],["Salt",salt+" g"],["Butter (optional)",G(10*n)]);
   steps=["Bring the salted water to a boil. Pour in the polenta in a thin stream while whisking.","Turn the heat to low and cook "+T.m+" minutes, stirring often, until thick and no longer gritty.","Stir in the butter and serve soft, or pour into a tin to set and slice."]}
  else{
   ing.push([T.n+" (dry)",G(d)],["Water",ML(w)],["Salt",salt+" g"]);
   steps=[T.tip,"Put the grain, water and salt in a pot with a lid and bring to a boil.","Turn the heat to the lowest setting, cover and cook "+T.m+" minutes. Do not lift the lid.","Turn off the heat and rest, covered, "+T.r+" minutes. Fluff with a fork."]}
  const vol=(d+w)/1000*1.6;
  return{title:T.n+" for "+n,meta:[["clock",T.m?T.m+" min"+(T.r?" + "+T.r+" rest":""):"5 min"],["rice","Dry "+G(d)],["jar","Pot of at least "+(Math.ceil(vol*4)/4).toFixed(2).replace(/\.?0+$/,"")+" L"]],
   note:["Ratio: "+T.w+" g water per 1 g dry grain. "+(s.t==="risotto"?"":T.tip)],ing,steps}}},
bake:{title:"What are we baking?",sub:"Sponge scaled to any tin, or cookies by the count.",
 ctl:[{k:"t",label:"Bake",icon:"cupcake",def:"cake",tg:[["cake","Sponge cake"],["cookie","Cookies"]]},
      {k:"sh",label:"Tin shape",icon:"ruler",def:"round",tg:[["round","Round"],["square","Square"],["loaf","Loaf"]],only:"cake"},
      {k:"c",label:"Tin size (cm across, or length)",icon:"ruler",def:20,step:[12,32,1,"cm"],only:"cake"},
      {k:"k",label:"How many cookies",icon:"cookie",def:24,step:[6,60,6,""],only:"cookie"}],
 calc(s){
  if(s.t==="cookie"){
   const k=s.k*30/755;
   return{title:s.k+" cookies",meta:[["clock","About 30 min"],["cookie","30 g of dough each"],["flame","180 °C"]],note:["Chilling the dough 30 minutes makes thicker, chewier cookies."],
    ing:[["Flour",G(300*k)],["Soft butter",G(150*k)],["Sugar (half brown, half white)",G(150*k)],["Egg",eggs(50*k)],["Bicarbonate of soda",P1(3*k)+" g"],["Salt",P1(2*k)+" g"],["Chocolate, chopped",G(100*k)]],
    steps:["Heat the oven to 180 °C and line a tray.","Beat the butter and both sugars until pale and fluffy.","Beat in the egg, then stir in the flour, soda and salt just until combined. Fold in the chocolate.","Roll into 30 g balls and place 5 cm apart.","Bake 10–12 minutes until the edges are golden and the middle still looks soft. Cool on the tray 5 minutes."]}}
  const c=s.c,area=s.sh==="round"?Math.PI*c*c/4:s.sh==="square"?c*c:c*12,f=area/314.16,ne=200*f,
   t=Math.round((30+12*(f-1)+(s.sh==="loaf"?8:0))/5)*5,temp=f>1.6?"170 °C":"180 °C";
  return{title:"Sponge for a "+c+" cm "+s.sh+" tin",meta:[["clock",Math.max(20,t)+" min bake"],["flame",temp],["cupcake","Tin: "+c+" cm "+s.sh+(s.sh==="loaf"?" × 12 cm":"")]],
   note:["Based on a 20 cm round tin (4 × 200 g). Scaled by the tin's area. Bigger tins bake longer at a slightly lower heat."],
   ing:[["Soft butter",G(200*f)],["Sugar",G(200*f)],["Eggs",eggs(ne)],["Flour (self-raising, or plain plus baking powder)",G(200*f)],["Baking powder (skip if self-raising)",P1(8*f)+" g"],["Milk",ML(15*f)],["Vanilla",ML(5*f)],["Salt","a pinch"]],
   steps:["Heat the oven to "+temp+". Grease and line the tin.","Beat the butter and sugar until pale and fluffy, 3–4 minutes.","Beat in the eggs a little at a time. Add a spoon of flour if it starts to curdle.","Fold in the flour, baking powder and salt, then the milk and vanilla until just smooth.","Spread in the tin and bake about "+Math.max(20,t)+" minutes, until a skewer comes out clean.","Cool 10 minutes in the tin, then on a rack."]}}},
drinks:{title:"What are we drinking?",sub:"Cold brew, lemonade and syrup by the jug.",
 ctl:[{k:"t",label:"Drink",icon:"drinks",def:"coffee",tg:[["coffee","Cold brew coffee"],["tea","Cold brew tea"],["lemonade","Lemonade"],["syrup","Simple syrup"]]},
      {k:"a",label:"How much to make",icon:"ruler",def:1000,step:[250,3000,250,"g"]},
      {k:"x",label:"Strength",icon:"flame",def:"rtd",tg:[["rtd","Ready to drink"],["conc","Concentrate"]],only:"coffee"},
      {k:"sw",label:"Sweetness",icon:"flame",def:1,tg:[[0,"Tart"],[1,"Balanced"],[2,"Sweet"]],only:"lemonade"},
      {k:"r",label:"Syrup",icon:"flame",def:"1",tg:[["1","1 : 1 everyday"],["2","2 : 1 rich"]],only:"syrup"}],
 calc(s){
  const a=s.a;
  if(s.t==="coffee"){const conc=s.x==="conc",r=conc?5:10,cf=a/r;
   return{title:"Cold brew "+(conc?"concentrate":"coffee"),meta:[["clock","12–18 hours"],["fridge","Keeps 1 week"],["drinks",ML(a)+" water"]],note:[conc?"Dilute 1 : 1 with water, milk or ice to serve.":"Ready to pour over ice."],
    ing:[["Coffee, coarsely ground",G(cf)],["Cold water",ML(a)]],steps:["Stir the coffee and cold water together in a jar. Make sure all the grounds are wet.","Cover and leave in the fridge 12–18 hours.","Strain through a paper filter or fine sieve, twice if it looks cloudy.","Keep in the fridge up to 1 week."]}}
  if(s.t==="tea")return{title:"Cold brew tea",meta:[["clock","6–8 hours"],["fridge","Keeps 3 days"],["drinks",ML(a)]],note:["No bitterness, no cooling down. Add lemon, mint or honey at the end."],
   ing:[["Loose tea (black, green or fruit)",P1(a/1000*8)+" g"],["Cold water",ML(a)]],steps:["Put the tea and cold water in a jar and stir.","Leave in the fridge 6–8 hours (green tea 4–6).","Strain and serve over ice."]};
  if(s.t==="lemonade"){const sug=[60,90,120][s.sw]*a/1000,juice=150*a/1000,w=a-juice-sug;
   return{title:"Lemonade",meta:[["drinks",ML(a)],["fridge","Keeps 3 days"],["leaf","About "+Math.ceil(juice/45)+" lemons"]],note:["The sugar is dissolved in hot water first so the lemonade is smooth."],
    ing:[["Lemon juice",ML(juice)],["Sugar",G(sug)],["Hot water (to dissolve the sugar)",ML(sug)],["Cold water",ML(Math.max(0,w-sug))]],
    steps:["Stir the sugar into the hot water until clear. Cool 10 minutes.","Add the lemon juice and cold water. Taste and add more water or sugar if you like.","Chill and serve over ice with lemon slices."]}}
  const rich=s.r==="2",wt=a/(rich?2.05:1.6)*1,sg=wt*(rich?2:1);
  return{title:(rich?"Rich":"Simple")+" syrup",meta:[["drinks","About "+ML(a)],["fridge",rich?"Keeps 6 months":"Keeps 1 month"]],note:["Ratio by weight: "+(rich?"2 parts sugar to 1 part water":"equal sugar and water")+"."],
   ing:[["Water",ML(wt)],["Sugar",G(sg)]],steps:["Warm the water and sugar in a pot, stirring, until the sugar dissolves. Do not boil hard.","Cool, pour into a clean bottle and keep in the fridge."]}}},
pasta:{title:"What pasta are we rolling?",sub:"Pick a dough, shape and sauce, or spin for a surprise.",
 spinLabel:"Spin a pasta!",spinNote:"Rolling out your pasta…",
 names:["Tagliatelle ragù","Cacio e pepe","Orecchiette with pesto","Pappardelle with mushrooms","Spaghetti-style aglio e olio","Tomato and basil","Trofie with pesto","Carbonara","Cavatelli with tomato","Tagliolini with garlic and chilli","Creamy mushroom"],
 spin(s){const pk=a=>a[Math.floor(Math.random()*a.length)];
  s.t=pk(["egg","egg","egg","semo"]);s.h=pk(["tagliatelle","pappardelle","tagliolini"]);s.m=pk(["orecchiette","cavatelli","trofie"]);s.a=pk(["tomato","cacio","pesto","ragu","aglio","carbonara","mushroom"])},
 ctl:[{k:"t",label:"Dough",icon:"pasta",def:"egg",tg:[["egg","Egg pasta"],["semo","Eggless semolina"]]},
  {k:"h",label:"Shape",icon:"pasta",def:"tagliatelle",tg:[["tagliatelle","Tagliatelle"],["pappardelle","Pappardelle"],["tagliolini","Tagliolini"]],only:"egg"},
  {k:"m",label:"Shape",icon:"pasta",def:"orecchiette",tg:[["orecchiette","Orecchiette"],["cavatelli","Cavatelli"],["trofie","Trofie"]],only:"semo"},
  {k:"a",label:"Sauce",icon:"sauce",def:"tomato",tg:[["tomato","Tomato and basil"],["cacio","Cacio e pepe"],["pesto","Pesto"],["ragu","Ragù"],["aglio","Garlic and chilli"],["carbonara","Carbonara"],["mushroom","Creamy mushroom"]]},
  {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,egg=s.t!=="semo",w=Math.max(2000,100*n*10),salt=Math.round(w/100),Gm=x=>x<10?P1(x)+" g":G(x);
  const SH=(egg?{tagliatelle:["Tagliatelle",["Roll out thin (you should see your hand through it), dust with semolina, roll up loosely and cut into ribbons about 6 mm wide. Shake them out into loose nests."],"2–3"],
    pappardelle:["Pappardelle",["Roll out thin (you should see your hand through it), dust with semolina and cut into ribbons about 2 cm wide, with a knife or a fluted wheel."],"2–3"],
    tagliolini:["Tagliolini",["Roll out very thin, dust with semolina, roll up loosely and cut into thin ribbons about 2 mm wide. Shake them out into loose nests."],"1–2"]}[s.h||"tagliatelle"]
   :{orecchiette:["Orecchiette",["Roll the dough into ropes 1 cm thick and cut into small pieces. Drag each piece against the board with a butter knife so it curls, then flip it over your thumb into a little dome."],"4–5"],
    cavatelli:["Cavatelli",["Roll the dough into ropes as thick as a finger and cut into 2 cm pieces. Press two fingers on each piece and drag it toward you so it curls into a little shell."],"4–5"],
    trofie:["Trofie",["Cut the dough into small 2 cm pieces and roll each one under your palm on the board into a thin twist about 4 cm long."],"3–4"]}[s.m||"orecchiette"]);
  const SA={
   tomato:{n:"tomato and basil",t:20,ing:[["Sauce: passata or canned tomatoes",130],["Sauce: olive oil",8],["Sauce: garlic, sliced",4],["Sauce: fresh basil",3],["Parmesan, to serve",10]],
    pre:["Warm the oil and garlic gently for 1 minute, without letting the garlic brown. Add the tomatoes and a pinch of salt and simmer 15 minutes until thick."],fin:"Toss the drained pasta in the sauce with a splash of the pasta water. Tear in the basil and serve with parmesan."},
   cacio:{n:"cacio e pepe",t:10,ing:[["Sauce: pecorino romano, finely grated",35],["Sauce: black pepper, freshly ground",1.5]],
    pre:["Toast the pepper in a wide dry pan for 1 minute. Stir the pecorino with a few spoonfuls of cooled pasta water into a thick paste."],fin:"Move the drained pasta to the pepper pan with a splash of pasta water. Off the heat, stir in the cheese paste, adding more water until the sauce is creamy and clings to the pasta."},
   pesto:{n:"pesto",t:10,ing:[["Sauce: fresh basil",25],["Sauce: pine nuts",6],["Sauce: parmesan, grated",12],["Sauce: olive oil",18],["Sauce: garlic",1.5]],
    pre:["Pound or blitz the basil, pine nuts, garlic and a pinch of salt, then stir in the parmesan and the oil."],fin:"Toss the drained pasta with the pesto and a splash of pasta water, off the heat (heat turns basil dark and bitter)."},
   ragu:{n:"ragù",t:130,first:1,note:"The ragù is the long part (about 1½ hours), so start it before the pasta.",ing:[["Sauce: beef mince",70],["Sauce: onion, finely chopped",30],["Sauce: carrot, finely chopped",15],["Sauce: celery, finely chopped",15],["Sauce: canned tomatoes",100],["Sauce: red wine (or stock)",30],["Sauce: olive oil",8],["Parmesan, to serve",10]],
    pre:["Ragù: soften the onion, carrot and celery in the oil for 8 minutes. Add the mince and brown it well, about 8 minutes.","Add the wine and let it bubble away, then the tomatoes and a pinch of salt. Simmer on low heat 1½ hours, stirring now and then, with a splash of water if it gets dry."],fin:"Toss the drained pasta with the ragù and a splash of pasta water. Serve with parmesan."},
   aglio:{n:"garlic and chilli",t:10,ing:[["Sauce: olive oil",20],["Sauce: garlic, thinly sliced",6],["Sauce: chilli flakes",.3],["Sauce: parsley, chopped",5],["Parmesan, to serve (optional)",8]],
    pre:["Warm the oil with the garlic and chilli on low heat 3–4 minutes, until the garlic is pale gold (not brown)."],fin:"Toss the drained pasta in the pan with a ladle of pasta water for 1 minute until glossy. Stir in the parsley."},
   carbonara:{n:"carbonara",t:15,ing:[["Sauce: pancetta or guanciale, diced",40],["Sauce: egg yolks",n+(n>1?" yolks":" yolk")],["Sauce: pecorino or parmesan, grated",25],["Sauce: black pepper",1.5]],
    pre:["Fry the pancetta in a dry pan over medium heat 6–8 minutes until crisp. Whisk the yolks with the cheese and plenty of pepper."],fin:"Off the heat, toss the hot drained pasta with the pancetta, then the egg mix, adding pasta water a splash at a time until creamy. Do not put it back on the heat or the eggs scramble."},
   mushroom:{n:"creamy mushroom",t:20,ing:[["Sauce: mushrooms, sliced",100],["Sauce: cream",40],["Sauce: butter",8],["Sauce: garlic",3],["Sauce: fresh thyme",1],["Parmesan, to serve",10]],
    pre:["Fry the mushrooms in the butter on high heat 6 minutes until golden. Add the garlic and thyme for 30 seconds, then the cream, and simmer 3 minutes."],fin:"Toss the drained pasta in the sauce with a splash of pasta water. Serve with parmesan."}}[s.a||"tomato"];
  const dough=egg?["Mound the flour, make a well and add the eggs and salt. Whisk with a fork, slowly pulling in flour.","Knead 8–10 minutes until smooth and elastic. Wrap and rest 30 minutes."]:["Mix the semolina and salt, add the warm water and knead 8 minutes until smooth.","Wrap and rest 30 minutes."];
  const cook="Boil the pasta in "+(w/1000)+" L of water with "+salt+" g salt (10 g per litre) for "+SH[2]+" minutes. Drain, keeping a cup of the water for the sauce.";
  return{title:SH[0]+" with "+SA.n+" for "+n,meta:[["clock","About "+hm(60+SA.t)],["pasta","Dough "+G(egg?100*n*1.55:100*n*1.5)],["jar","Pot of "+Math.ceil(w/1000)+" L water"]],
   note:[egg?"Rest the dough 30 minutes: it makes rolling much easier. Cook fresh egg pasta only 2–3 minutes.":"Semolina pasta is firmer than egg pasta and suits robust sauces. Shape it while the dough is still smooth.",SA.note].filter(Boolean),
   ing:(egg?[["Pasta: plain or 00 flour",G(100*n)],["Pasta: eggs",eggs(55*n)],["Pasta: salt",P1(n)+" g"],["Pasta: semolina, for dusting",G(20*n)]]:[["Pasta: semolina flour",G(100*n)],["Pasta: warm water",G(50*n)],["Pasta: salt",P1(n)+" g"]]).concat([["Salt, for the pasta water",salt+" g"]],SA.ing.map(x=>[x[0],typeof x[1]==="number"?Gm(x[1]*n):x[1]])),
   steps:[].concat(SA.first?SA.pre:[],dough,SH[1],SA.first?[]:SA.pre,[cook,SA.fin])}}},
soup:{title:"What are we simmering?",sub:"Stock from bones and scraps, or soup for your table.",
 ctl:[{k:"t",label:"Make",icon:"soup",def:"soup",tg:[["soup","Soup"],["stock","Stock"]]},
  {k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""],only:"soup"},{k:"y",label:"Style",icon:"soup",def:"brothy",tg:[["brothy","Brothy"],["creamy","Creamy"]],only:"soup"},
  {k:"k",label:"Type",icon:"soup",def:"chicken",tg:[["chicken","Chicken"],["beef","Beef"],["veg","Vegetable"],["fish","Fish"]],only:"stock"},{k:"b",label:"Bones or scraps",icon:"ruler",def:1000,step:[500,3000,250,"g"],only:"stock"}],
 calc(s){
  if(s.t==="stock"){const b=s.b,T={chicken:{n:"Chicken",w:2,h:"3 hours",r:""},beef:{n:"Beef",w:2,h:"6 hours",r:"Roast the bones at 220 °C for 30 minutes first for a deeper flavour. "},veg:{n:"Vegetable",w:1.5,h:"45 minutes",r:""},fish:{n:"Fish",w:1.5,h:"30 minutes",r:"Use bones from white fish only. "}}[s.k],wt=b*T.w;
   return{title:T.n+" stock",meta:[["clock",T.h],["jar","Makes about "+G(wt*.85)],["fridge","Fridge 4 days · freezer 3 months"]],note:["Do not add salt now. Season the dish you cook with it."],
    ing:[[s.k==="veg"?"Vegetable scraps":"Bones",G(b)],["Cold water",G(wt)],["Onion",G(b*.15)],["Carrot",G(b*.1)],["Celery",G(b*.08)],["Bay leaves",Math.max(1,Math.round(b/1000))+""],["Black peppercorns",P1(b/1000*3)+" g"]],
    steps:[T.r+"Put everything in a big pot and cover with the cold water.","Bring slowly to a gentle simmer. Skim off the foam. Do not boil hard or the stock turns cloudy.","Simmer uncovered for "+T.h+".","Strain, cool quickly (within 2 hours) and chill. Remove the fat from the top before using."]}}
  const n=s.p||people,cr=s.y==="creamy",liq=350*n+(cr?0:0),salt=Math.round(liq*.008*2)/2;
  return{title:(cr?"Creamy":"Brothy")+" soup for "+n,meta:[["clock","About 40 min"],["soup","Serves "+n],["fridge","Fridge 4 days · freezer 3 months"]],note:["Freeze in portions and leave 2 cm of space at the top of the container."],
   ing:[["Vegetables, chopped",G(250*n)],["Onion",G(50*n)],["Oil or butter",G(10*n)],["Stock",G(liq)]].concat(cr?[["Potato (makes it creamy)",G(80*n)],["Cream (optional)",G(20*n)]]:[["Small pasta, rice or beans (optional)",G(25*n)]]).concat([["Salt","about "+salt+" g"]]),
   steps:["Soften the onion in the oil 5 minutes.","Add the vegetables"+(cr?" and potato":"")+" and stir 3 minutes.","Add the stock, bring to a boil, then simmer 20–25 minutes until everything is tender.",cr?"Blend until smooth, stir in the cream and heat through.":"Add the pasta, rice or beans for the last 10 minutes.","Season with salt and pepper at the end."]}}},
sauce:{title:"What are we dressing?",sub:"Dressings, pesto and pan sauce with the right balance.",
 ctl:[{k:"t",label:"Sauce",icon:"sauce",def:"vin",tg:[["vin","Vinaigrette"],["yog","Yogurt dressing"],["pesto","Pesto"],["pan","Pan sauce"]]},{k:"p",label:"Servings",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,R={
   vin:{n:"Vinaigrette",m:"5 min",note:"The rule is 3 parts oil to 1 part acid. A little mustard keeps it from separating.",ing:[["Olive oil",G(22*n)],["Vinegar or lemon juice",G(7.5*n)],["Dijon mustard",P1(3*n)+" g"],["Honey (optional)",P1(2*n)+" g"],["Salt",P1(.5*n)+" g"]],st:["Put the vinegar, mustard, honey and salt in a jar.","Add the oil, close the lid and shake hard for 15 seconds.","Taste on a leaf and adjust with salt or acid."]},
   yog:{n:"Yogurt dressing",m:"5 min",note:"Good on salads, grilled veg and roast chicken.",ing:[["Plain yogurt",G(60*n)],["Lemon juice",P1(8*n)+" g"],["Olive oil",P1(5*n)+" g"],["Garlic",P1(.25*n)+" clove"],["Fresh herbs, chopped",G(3*n)],["Salt",P1(.7*n)+" g"]],st:["Grate the garlic into the yogurt.","Stir in the lemon, oil, herbs and salt.","Thin with a splash of water if it is too thick."]},
   pesto:{n:"Pesto",m:"10 min",note:"Enough for about 100 g of dry pasta per person.",ing:[["Fresh basil",G(25*n)],["Pine nuts",G(8*n)],["Parmesan, grated",G(12*n)],["Garlic",P1(.5*n)+" clove"],["Olive oil",G(30*n)],["Salt",P1(.3*n)+" g"]],st:["Toast the pine nuts in a dry pan until golden. Cool.","Blend or pound the basil, nuts, garlic and salt.","Stir in the parmesan and oil. Toss with hot pasta and a splash of the pasta water."]},
   pan:{n:"Pan sauce",m:"8 min",note:"Make it right after cooking meat, in the same pan, without washing it.",ing:[["Shallot, finely chopped",G(20*n)],["Stock",G(80*n)],["White wine or extra stock",G(40*n)],["Cold butter",G(8*n)],["Salt and pepper","to taste"]],st:["Pour off most of the fat. Soften the shallot in the pan 1 minute.","Add the wine and scrape up the browned bits. Boil until almost gone.","Add the stock and boil until it has reduced by half.","Take off the heat and swirl in the cold butter. Season and pour over the meat."]}}[s.t];
  return{title:R.n+" for "+n,meta:[["clock",R.m],["sauce","Serves "+n]],note:[R.note],ing:R.ing,steps:R.st}}},
eggs:{title:"What are we cracking?",sub:"Batters, omelettes and boiled eggs without guessing.",
 ctl:[{k:"t",label:"Make",icon:"egg",def:"pan",tg:[["pan","Pancakes"],["crepe","Crepes"],["omelette","Omelette"],["boiled","Boiled eggs"]]},
  {k:"c",label:"How many",icon:"ruler",def:8,step:[4,24,4,""],only:["pan","crepe"]},{k:"d",label:"Pan size (cm)",icon:"ruler",def:24,step:[18,30,2,"cm"],only:"omelette"},
  {k:"e",label:"Eggs",icon:"egg",def:4,step:[1,12,1,""],only:"boiled"},{k:"o",label:"Doneness",icon:"clock",def:"jam",tg:[["soft","Soft"],["jam","Jammy"],["med","Medium"],["hard","Hard"]],only:"boiled"}],
 calc(s){
  if(s.t==="pan"){const k=s.c/4;return{title:s.c+" fluffy pancakes",meta:[["clock","20 min"],["flame","Medium heat"]],note:["Do not overmix. Lumps are fine."],ing:[["Flour",G(125*k)],["Milk",G(150*k)],["Egg",eggs(50*k)],["Baking powder",P1(5*k)+" g"],["Sugar",G(12*k)],["Melted butter",G(15*k)],["Salt","a pinch"]],steps:["Whisk the dry ingredients. In another bowl whisk the milk, egg and butter.","Pour the wet into the dry and stir until just combined. Rest 5 minutes.","Cook spoonfuls in a lightly buttered pan on medium heat about 2 minutes per side, until bubbles form and the edges look set. Flip once."]}}
  if(s.t==="crepe"){const k=s.c/8;return{title:s.c+" thin crepes",meta:[["clock","30 min"],["flame","Medium-high heat"]],note:["Resting the batter 30 minutes gives tender crepes that do not tear."],ing:[["Flour",G(125*k)],["Milk",G(250*k)],["Eggs",eggs(100*k)],["Melted butter",G(20*k)],["Salt",P1(k)+" g"]],steps:["Whisk the flour and salt, then the milk and eggs, until smooth. Stir in the butter.","Rest 30 minutes.","Pour a thin layer into a hot buttered pan, swirl to coat and cook 1 minute. Flip and cook 30 seconds."]}}
  if(s.t==="omelette"){const d=s.d,n=d<=20?2:d<=24?3:d<=28?4:5;return{title:n+"-egg omelette",meta:[["clock","5 min"],["egg","For a "+d+" cm pan"]],note:["For more people, make one omelette at a time, or bake a frittata in the oven at 180 °C."],ing:[["Eggs",n+" eggs"],["Butter",G(5+n*2)],["Salt","a pinch"],["Filling (cheese, herbs, veg)",G(15*n)]],steps:["Beat the eggs with the salt.","Melt the butter in the pan until foaming. Pour in the eggs.","Stir gently for 20 seconds, then let it set for 1 minute.","Add the filling on one half, fold over and slide onto a plate while the middle is still a little soft."]}}
  const T={soft:[6,"runny yolk, set white"],jam:[7,"jammy yolk"],med:[9,"creamy, just set yolk"],hard:[11,"fully set yolk"]}[s.o];
  return{title:s.e+" boiled egg"+(s.e>1?"s":""),meta:[["clock",T[0]+" min"],["egg",T[1]]],note:["Timed from the moment the water boils, for fridge-cold eggs."],ing:[["Eggs",s.e+""],["Water","enough to cover"],["Ice and cold water","for the bath"]],steps:["Bring a pot of water to a rolling boil.","Lower in the eggs and set a timer for "+T[0]+" minutes.","Move the eggs straight into ice water for 5 minutes. This stops the cooking and makes them easy to peel."]}}},
jam:{title:"What are we preserving?",sub:"Fruit and sugar ratios with the lemon and the set point.",
 ctl:[{k:"u",label:"Fruit",icon:"jam",def:"strawberry",tg:[["strawberry","Strawberries"],["raspberry","Raspberries"],["apricot","Apricots"],["plum","Plums"],["blueberry","Blueberries"],["cherry","Cherries"],["apple","Apples"],["blackcurrant","Blackcurrants"]]},
  {k:"w",label:"Prepared fruit",icon:"ruler",def:1000,step:[500,3000,250,"g"]},{k:"l",label:"Sugar",icon:"flame",def:1,tg:[[0,"Light (fridge)"],[1,"Balanced"],[2,"Classic (shelf)"]]}],
 calc(s){
  const P={strawberry:[60,"Low in pectin"],raspberry:[30,"Medium pectin"],apricot:[30,"Medium pectin"],plum:[30,"Medium pectin"],blueberry:[60,"Low in pectin"],cherry:[60,"Low in pectin"],apple:[15,"High in pectin"],blackcurrant:[15,"High in pectin"]}[s.u],
   pc=[50,65,100][s.l],f=s.w,sug=f*pc/100,lem=P[0]*f/1000,out=(f+sug)*.78,jars=Math.ceil(out/300),keep=["2–3 weeks in the fridge","1–2 months in the fridge, or freeze","1 year in sterilised sealed jars"][s.l];
  return{title:s.u[0].toUpperCase()+s.u.slice(1)+" jam",meta:[["clock","About 30 min"],["jam","Makes about "+G(out)],["jar",jars+" jar"+(jars>1?"s":"")+" of 250 ml"],["fridge",keep]],note:[P[1]+", so "+G(lem)+" of lemon juice is added to help it set.",s.l<2?"Less sugar means a softer set and a shorter life. Keep it cold.":"Only a full 1 : 1 jam is safe in sealed jars on the shelf."],
   ing:[["Prepared fruit (hulled, stoned, chopped)",G(f)],["Sugar",G(sug)],["Lemon juice",G(lem)]],
   steps:["Put a few small plates in the freezer for the set test. Sterilise the jars in a 120 °C oven for 15 minutes.","Mix the fruit, sugar and lemon juice and leave 30 minutes until the sugar is wet.","Heat gently, stirring, until the sugar has dissolved. Then boil hard 10–20 minutes.","Test: it is ready at 105 °C, or when a drop on a cold plate wrinkles when you push it. Skim off the foam.","Cool 10 minutes, pour into the hot jars and seal. Label with the date."]}}},
dairy:{title:"What are we culturing?",sub:"Yogurt, labneh and fresh cheese from milk.",
 ctl:[{k:"t",label:"Make",icon:"dairy",def:"yogurt",tg:[["yogurt","Yogurt"],["labneh","Labneh"],["paneer","Paneer"],["kefir","Milk kefir"],["cottage","Cottage cheese"],["cream","Cream cheese"],["kajmak","Kajmak (clotted cream)"],["butter","Cultured butter"]]},{k:"a",label:"Milk or yogurt",icon:"ruler",def:1000,step:[500,4000,500,"g"]}],
 calc(s){
  const a=s.a;
  if(s.t==="kefir")return{title:"Milk kefir",meta:[["clock","12–24 hours"],["dairy","Makes "+G(a)],["fridge","Keeps 1 week"]],note:["You need live kefir grains (from a friend or a shop). They are a living culture you keep and reuse. Do not heat the milk."],ing:[["Milk kefir grains",G(a*.015)],["Whole milk",G(a)]],
   steps:["Put the grains in a clean glass jar and pour in the milk, leaving a third of the jar empty.","Cover with a cloth and leave at 20–24 °C for 12–24 hours, until it thickens and smells pleasantly sour.","Strain through a plastic sieve, pressing gently. Put the grains straight into fresh milk for the next batch.","Drink it cold. For a second ferment, leave the strained kefir with a piece of fruit 6–12 hours, then chill.","Need a break? Put the jar in the fridge: the grains rest happily for 1–2 weeks."]};
  if(s.t==="cottage")return{title:"Cottage cheese",meta:[["clock","1 hour"],["dairy","Makes about "+G(a*.12)],["fridge","Keeps 5 days"]],note:["Use pasteurised milk, not UHT. Rinsing the curds is what stops it tasting of vinegar."],ing:[["Milk",G(a)],["White vinegar",G(a*.04)],["Salt",P1(a/1000*2)+" g"],["Cream or milk, to finish",G(a*.03)]],
   steps:["Heat the milk to 45 °C, stirring now and then.","Take off the heat, stir in the vinegar for 1 minute, then leave 20 minutes until the curds split from the clear whey.","Pour into a cloth-lined sieve and drain 5 minutes.","Rinse the curds gently under cold water and squeeze out the excess.","Break them up, stir in the salt and cream and chill."]};
  if(s.t==="cream")return{title:"Cream cheese",meta:[["clock","12–18 hours"],["dairy","Makes about "+G(a*.6)],["fridge","Keeps 2 weeks"]],note:["The easy way: strain full-fat yogurt with a little cream. More cream gives a richer, softer cheese."],ing:[["Full-fat plain yogurt",G(a)],["Cream (30% fat or more)",G(a*.25)],["Salt",P1(a/1000*8)+" g"]],
   steps:["Stir the yogurt, cream and salt together until smooth.","Line a sieve with a clean cloth, tip it in and set over a bowl.","Cover and leave in the fridge 12–18 hours. Longer gives a firmer cheese.","Scrape into a jar. Thin it with a spoon of the whey if it is too stiff."]};
  if(s.t==="kajmak")return{title:"Kajmak",meta:[["clock","2 days"],["dairy","Makes about "+G(a*.05)],["fridge","Keeps 2 weeks"]],note:["The creamy layer from the Balkans, spread on bread or served with grilled meat. It is slow work: a little each day. Whole milk that has not been homogenised gives the most."],ing:[["Whole milk",G(a)],["Salt",P1(a/1000*2.5)+" g"]],
   steps:["Bring the milk to a simmer and hold it at 90 °C for 20 minutes, never boiling over.","Pour into a wide, shallow dish and leave to cool at room temperature, then 12 hours in the fridge.","Lift off the thick skin that formed on top and put it in a clean jar.","Warm the milk again, cool and repeat once more to collect a second skin.","Stir the skins with the salt, press down flat and chill 24 hours before eating."]};
  if(s.t==="butter")return{title:"Cultured butter",meta:[["clock","1 day"],["dairy","Makes about "+G(a*.4)+" butter"],["fridge","Keeps 2 weeks"]],note:["You also get about "+G(a*.5)+" of real buttermilk to drink or bake with. Cold cream whips to butter much faster."],ing:[["Cream (35% fat or more)",G(a)],["Plain yogurt or live buttermilk, as starter",G(a*.05)],["Salt (optional)",P1(a/1000*6)+" g"]],
   steps:["Stir the starter into the cream, cover and leave at 20–22 °C for 12–18 hours until slightly thick and tangy.","Chill the cream well, then whisk or beat it in a mixer until it goes stiff, then grainy, then splits into butter and watery buttermilk.","Strain off the buttermilk and keep it.","Knead the butter under ice-cold water, changing the water until it runs clear. This helps it keep.","Press out the water, work in the salt and shape. Wrap and chill."]};
  if(s.t==="yogurt")return{title:"Yogurt",meta:[["clock","6–10 hours"],["dairy","Makes "+G(a)],["fridge","Keeps 1 week"]],note:["Use a plain yogurt with live cultures as the starter. Longer incubation means tangier yogurt."],ing:[["Whole milk",G(a)],["Plain yogurt, as starter",G(a*.03)]],
   steps:["Heat the milk to 82 °C and hold 5 minutes for a thicker yogurt. Cool to 43 °C.","Whisk a spoon of the milk into the starter, then stir it back into the milk.","Keep at 40–43 °C for 6–10 hours (oven with just the light on, or a warm spot in a flask).","Chill at least 4 hours before eating."]};
  if(s.t==="labneh")return{title:"Labneh",meta:[["clock","12–24 hours"],["dairy","Makes about "+G(a*.45)],["fridge","Keeps 2 weeks"]],note:["Strain 6 hours for a thick spread, 24 hours for a firm ball you can roll in herbs."],ing:[["Thick plain yogurt",G(a)],["Salt",P1(a/1000*5)+" g"]],
   steps:["Stir the salt into the yogurt.","Line a sieve with a clean cloth, tip in the yogurt and set it over a bowl.","Cover and leave in the fridge 12–24 hours.","Spoon into a jar and cover with olive oil."]};
  return{title:"Paneer",meta:[["clock","1 hour"],["dairy","Makes about "+G(a*.17)],["fridge","Keeps 4 days"]],note:["Use whole milk (not UHT) for the best yield."],ing:[["Whole milk",G(a)],["Lemon juice",G(a*.04)]],
   steps:["Bring the milk to a near boil, stirring.","Turn off the heat and stir in the lemon juice slowly until the curds split from the clear whey.","Rest 5 minutes. Drain through a cloth-lined sieve and rinse briefly under cold water.","Twist the cloth, press under a heavy weight for 20–30 minutes, then cut into cubes."]}}},
dumpling:{title:"What are we folding?",sub:"Wrappers, filling and cooking time for any number of dumplings.",
 ctl:[{k:"t",label:"Style",icon:"dumpling",def:"gyoza",tg:[["gyoza","Pan-fried gyoza"],["jiaozi","Boiled jiaozi"],["momo","Steamed momo"]]},{k:"c",label:"How many",icon:"ruler",def:24,step:[12,72,12,""]}],
 calc(s){
  const c=s.c,fl=c*(s.t==="gyoza"?12:15),how={
   gyoza:["Heat 1 tablespoon of oil in a non-stick pan with a lid. Place the dumplings flat side down and fry 2 minutes until golden.","Add "+G(c*5)+" of water, cover and steam 5–6 minutes. Uncover and cook until the water has gone and the bottoms are crisp."],
   jiaozi:["Boil in plenty of water. When they float, cook 2–3 minutes more, until the wrappers look slightly see-through."],
   momo:["Steam over boiling water on an oiled rack 10–12 minutes, until the wrappers are glossy and firm."]}[s.t];
  return{title:c+" "+({gyoza:"gyoza",jiaozi:"jiaozi",momo:"momo"})[s.t],meta:[["clock","About 1 hour"],["dumpling","Filling "+G(fl)+" in total"],["flame",s.t==="gyoza"?"Fry then steam":s.t==="jiaozi"?"Boil 5–8 min":"Steam 10–12 min"]],
   note:["Per dumpling: 10 g of dough and "+(s.t==="gyoza"?12:15)+" g of filling. Freeze uncooked on a tray, then bag them. Cook from frozen, 2 minutes longer."],
   ing:[["Wrapper: flour",G(c*10)],["Wrapper: warm water",G(c*5)],["Wrapper: salt",P1(c*.1)+" g"],["Pork mince (or chicken, or crumbled tofu)",G(fl*.55)],["Cabbage, finely chopped",G(fl*.35)],["Salt, for the cabbage",P1(fl*.35*.01)+" g"],["Spring onion",G(fl*.05)],["Ginger, grated",G(fl*.02)],["Soy sauce",G(fl*.03)],["Sesame oil",P1(fl*.015)+" g"]],
   steps:["Mix the flour and salt, stir in the warm water and knead 8 minutes until smooth. Rest 30 minutes under a cloth.","Toss the cabbage with its salt, wait 10 minutes and squeeze out the water. Mix with all the other filling ingredients.","Roll the dough into 8 cm discs ("+c+" of them, 10 g each).","Put a spoonful of filling in the middle, wet the edge, fold in half and pleat to seal."].concat(how,["Dip in soy sauce mixed with a little rice vinegar."])}}},
burger:{title:"What are we flipping?",sub:"Pick your patty, cheese, sauce and toppings, or spin for a surprise.",
 spinLabel:"Spin a burger!",spinNote:"Stacking your burger…",
 names:["Cheddar beef","Swiss and caramelised onion","Blue cheese lamb","Smoky BBQ bacon","Chipotle chicken","Black bean and avocado","Fried egg and bacon","Jalapeño cheddar","Garlic aioli chicken","Classic with pickles","Lamb and tomato","Beef, egg and avocado"],
 spin(s){ // a random burger that still makes sense: toppings are shuffled, bacon stays off the veggie one
  const pk=a=>a[Math.floor(Math.random()*a.length)],sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  s.t=pk(["beef","beef","lamb","chicken","bean"]);s.c=pk(["none","cheddar","cheddar","swiss","blue"]);s.s=pk(["classic","bbq","chipotle","aioli"]);
  s.o=sh(["lettuce","tomato","onion","pickles","bacon","egg","avocado","jalapeno","caramel"].filter(x=>!(x==="bacon"&&s.t==="bean"))).slice(0,2+Math.floor(Math.random()*3))},
 ctl:[{k:"p",label:"Burgers",icon:"burger",def:null,step:[1,12,1,""]},{k:"z",label:"Patty size",icon:"ruler",def:150,tg:[[100,"Small 100 g"],[150,"Classic 150 g"],[200,"Big 200 g"]]},
  {k:"t",label:"Patty",icon:"burger",def:"beef",tg:[["beef","Beef"],["lamb","Lamb"],["chicken","Chicken"],["bean","Black bean (veggie)"]]},
  {k:"c",label:"Cheese",icon:"dairy",def:"none",tg:[["none","No cheese"],["cheddar","Cheddar"],["swiss","Swiss"],["blue","Blue cheese"]]},
  {k:"s",label:"Sauce",icon:"sauce",def:"classic",tg:[["classic","Classic"],["bbq","Smoky BBQ"],["chipotle","Chipotle mayo"],["aioli","Garlic aioli"]]},
  {k:"o",label:"Toppings (pick any)",icon:"salad",def:["pickles"],ms:[["lettuce","Lettuce"],["tomato","Tomato"],["onion","Red onion"],["pickles","Pickles"],["bacon","Bacon"],["egg","Fried egg"],["avocado","Avocado"],["jalapeno","Jalapeños"],["caramel","Caramelised onions"]]}],
 calc(s){
  const n=s.p||people,z=+s.z,meat=n*z,top=Array.isArray(s.o)?s.o:[],has=k=>top.includes(k),pt=s.t||"beef",ch=s.c||"none",sc=s.s||"classic";
  const PT={
   beef:{w:"beef",flame:"71 °C inside",note:"Use beef mince with about 20% fat. Keep it cold and handle it as little as you can.",
    ing:[["Patty: beef mince (20% fat)",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: black pepper",P1(meat*.004)+" g"]],
    shape:"Patties: gently shape "+n+" patties of "+z+" g, a little wider than the bun. Press a dimple in the middle. Salt only just before cooking.",
    cook:"Cook on a very hot pan or grill 3–4 minutes per side, until 71 °C inside.",rest:" Rest 3 minutes."},
   lamb:{w:"lamb",flame:"71 °C inside",note:"Use lamb mince with about 20% fat. Keep it cold and handle it as little as you can.",
    ing:[["Patty: lamb mince (20% fat)",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: black pepper",P1(meat*.004)+" g"],["Patty: ground cumin",P1(meat*.004)+" g"],["Patty: fresh mint, chopped",G(meat*.03)]],
    shape:"Patties: mix the mince lightly with the cumin, mint and pepper, then shape "+n+" patties of "+z+" g, a little wider than the bun. Press a dimple in the middle. Salt only just before cooking.",
    cook:"Cook on a very hot pan or grill 3–4 minutes per side, until 71 °C inside.",rest:" Rest 3 minutes."},
   chicken:{w:"chicken",flame:"75 °C inside",note:"Use thigh mince (or mince skinless thighs yourself). Breast mince turns dry. Chicken must cook all the way through.",
    ing:[["Patty: chicken thigh mince",G(meat)],["Patty: salt",P1(meat*.01)+" g"],["Patty: smoked paprika",P1(meat*.006)+" g"],["Patty: garlic powder",P1(meat*.004)+" g"]],
    shape:"Patties: mix the mince with the salt, paprika and garlic powder, then shape "+n+" patties of "+z+" g, a little wider than the bun. Chill 15 minutes.",
    cook:"Cook in a hot pan or on a grill over medium-high heat 4–5 minutes per side, until 75 °C inside.",rest:" Rest 3 minutes."},
   bean:{w:"black bean",flame:"Crisp and hot through",note:"Mash only half the beans so the patties keep some bite. Chilling 20 minutes helps them hold together.",
    ing:[["Patty: canned black beans, drained",G(meat*.5)],["Patty: breadcrumbs or rolled oats",G(meat*.2)],["Patty: onion, grated",G(meat*.15)],["Patty: egg, beaten",G(meat*.12)],["Patty: smoked paprika",P1(meat*.008)+" g"],["Patty: ground cumin",P1(meat*.008)+" g"],["Patty: salt",P1(meat*.01)+" g"]],
    shape:"Patties: mash half the beans roughly with a fork, mix in everything else for the patties, and shape "+n+" patties of "+z+" g. Chill 20 minutes.",
    cook:"Cook in a pan with a little oil over medium heat 4 minutes per side, until crisp outside and hot through. Do not press on them.",rest:""}}[pt]||null;
  const CH={cheddar:["Cheddar, sliced",20,"cheddar"],swiss:["Swiss cheese (Emmental or Gruyère), sliced",20,"Swiss"],blue:["Blue cheese, crumbled",15,"blue cheese"]}[ch];
  const SC={classic:[["Sauce: mayonnaise",20],["Sauce: ketchup",10],["Sauce: mustard",4]],bbq:[["Sauce: BBQ sauce",25],["Sauce: mayonnaise",10]],chipotle:[["Sauce: mayonnaise",25],["Sauce: chipotle paste (or chipotles in adobo)",5],["Sauce: lime juice",4]],aioli:[["Sauce: mayonnaise",25],["Sauce: garlic, crushed",3],["Sauce: lemon juice",4]]}[sc]||[];
  const TP={lettuce:["Lettuce leaves",15],tomato:["Tomato, sliced",30],onion:["Red onion, thinly sliced",15],pickles:["Chopped pickles",15],bacon:["Streaky bacon",30],egg:["Eggs, for frying",n+(n>1?" eggs":" egg")],avocado:["Ripe avocado, sliced",40],jalapeno:["Pickled jalapeños",8],caramel:["Onions, for caramelising",60]};
  const tops=Object.keys(TP).filter(has).map(k=>[TP[k][0],typeof TP[k][1]==="number"?G(TP[k][1]*n):TP[k][1]]);
  if(has("caramel"))tops.push(["Butter, for the onions",P1(5*n)+" g"]);
  const stack=[has("lettuce")&&"lettuce",PT.w+" patty"+(CH?" with "+CH[2]:""),has("bacon")&&"bacon",has("egg")&&"fried egg",has("avocado")&&"avocado",has("caramel")&&"caramelised onions",has("tomato")&&"tomato",has("onion")&&"red onion",has("pickles")&&"pickles",has("jalapeno")&&"jalapeños"].filter(Boolean);
  const st=["Buns: knead the flour, milk, egg, sugar, yeast and salt 8 minutes. Work in the butter. Rise 1 hour.","Divide into "+n+" balls, shape, proof 40 minutes and bake at 190 °C for 15 minutes. Cool."];
  if(has("caramel"))st.push("Onions: slice them thinly and cook slowly in the butter with a pinch of salt for 25 minutes, stirring now and then, until soft and golden.");
  st.push(PT.shape);
  if(has("bacon"))st.push("Fry the bacon in a dry pan until crisp, then drain it on paper.");
  st.push(PT.cook+(CH?" Lay the cheese on the patties for the last minute and cover with a lid so it melts.":"")+PT.rest);
  if(has("egg"))st.push("Fry the eggs in a little oil 2–3 minutes, until the whites are set and the yolk is still soft.");
  st.push("Stir the sauce ingredients together and toast the buns.","Build from the bottom: sauce on the bottom bun, then "+stack.join(", ")+". Add the top bun and press down gently.");
  return{title:n+" "+(CH?CH[2]+" ":"")+PT.w+" burger"+(n>1?"s":""),meta:[["clock","About 3 hours (buns)"],["burger","Patties "+G(meat)],["flame",PT.flame]],note:[PT.note],
   ing:PT.ing.concat([["Bun: flour",G(70*n)],["Bun: warm milk",G(40*n)],["Bun: egg",eggs(12*n)],["Bun: butter",G(8*n)],["Bun: sugar",P1(7*n)+" g"],["Bun: instant yeast",P1(Math.max(2,n)*.7)+" g"],["Bun: salt",P1(1.2*n)+" g"]],CH?[[CH[0],G(CH[1]*n)]]:[],SC.map(x=>[x[0],G(x[1]*n)]),tops),
   steps:st}}},
grill:{title:"What are we grilling?",sub:"Marinade amounts and cooking times by thickness.",
 ctl:[{k:"m",label:"Meat or fish",icon:"grill",def:"beef",tg:[["beef","Beef steak"],["pork","Pork chop"],["chicken","Chicken breast"],["lamb","Lamb chop"],["salmon","Salmon"],["prawn","Prawns"]]},
  {k:"d",label:"Doneness",icon:"flame",def:"mr",tg:[["rare","Rare"],["mr","Medium-rare"],["med","Medium"],["well","Well done"]],only:"beef"},
  {k:"h",label:"Thickness",icon:"ruler",def:2.5,step:[1,5,.5,"cm"],only:["beef","pork","chicken","lamb","salmon"]},{k:"w",label:"Weight",icon:"ruler",def:1000,step:[250,2000,250,"g"]}],
 calc(s){
  const D={rare:[1.2,"50 °C"],mr:[1.6,"55 °C"],med:[2,"60 °C"],well:[2.6,"71 °C"]}[s.d]||[1.6,"55 °C"],
   M={beef:{n:"Beef steak",k:D[0],t:D[1],m:"2–8 hours"},pork:{n:"Pork chop",k:2.2,t:"63 °C",m:"2–6 hours"},chicken:{n:"Chicken breast",k:3.2,t:"74 °C",m:"2–6 hours"},lamb:{n:"Lamb chop",k:1.8,t:"57 °C",m:"2–8 hours"},salmon:{n:"Salmon",k:1.8,t:"55 °C",m:"30 minutes"},prawn:{n:"Prawns",k:null,t:"pink and curled",m:"30 minutes"}}[s.m],
   mins=M.k?Math.round(M.k*s.h*2)/2:2,w=s.w;
  return{title:M.n+(M.k?", "+s.h+" cm":""),meta:[["clock",mins+" min per side"],["flame","Inside: "+M.t],["grill","Rest 5 min"]],note:["Times are for a hot grill or pan and are a guide. A thermometer is the sure way."+(s.m==="chicken"&&s.h>3?" Butterfly thick breasts so they cook evenly.":"")],
   ing:[["Oil",G(w*.05)],["Acid (lemon juice or vinegar)",G(w*.02)],["Salt",P1(w*.01)+" g"],["Honey or sugar",G(w*.01)],["Garlic",Math.max(1,Math.round(w/500))+" cloves"],["Herbs or spices",G(w*.005)]],
   steps:["Whisk the marinade ingredients and coat the meat. Marinate in the fridge "+M.m+" (no longer, the acid turns it mushy).","Take it out 20 minutes before cooking and pat dry so it browns instead of steaming.","Cook "+mins+" minutes per side on a very hot grill or pan, turning once.","Check the inside reaches "+M.t+", then rest 5 minutes before cutting."]}}},
sandwich:{title:"What are we stacking?",sub:"A filling that balances crunch, creamy and sharp.",
 ctl:[{k:"b",label:"Bread",icon:"sandwich",def:"bread",tg:[["bread","Sandwich"],["wrap","Wrap"],["toastie","Toastie"]]},{k:"f",label:"Filling",icon:"sandwich",def:"deli",tg:[["deli","Deli"],["chicken","Chicken"],["veg","Veggie"],["egg","Egg"]]},{k:"p",label:"How many",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,F={deli:[["Sliced ham or turkey",60],["Cheese",25],["Tomato",30],["Lettuce",15],["Mustard",5],["Pickles",15]],chicken:[["Cooked chicken, shredded",80],["Mayonnaise",20],["Celery, chopped",15],["Lettuce",15],["Lemon juice",3],["Spring onion",5]],
   veg:[["Hummus",40],["Cucumber",30],["Tomato",30],["Rocket",10],["Feta",25],["Olive oil",3]],egg:[["Eggs, boiled (2 per sandwich)",100],["Mayonnaise",15],["Mustard",3],["Lettuce or cress",10],["Salt",.5]]}[s.f],
   base=s.b==="wrap"?["Tortilla wraps",60]:["Bread (2 slices)",70],ing=[[base[0],G(base[1]*n)]].concat(F.map(x=>[x[0],x[1]<1?"a pinch":G(x[1]*n)]));
  if(s.b==="toastie"){ing.push(["Butter, for the outside",G(10*n)],["Extra cheese",G(30*n)])}
  return{title:({bread:"Sandwiches",wrap:"Wraps",toastie:"Toasties"})[s.b]+" with "+({deli:"deli meat",chicken:"chicken",veg:"hummus and veg",egg:"egg"})[s.f],meta:[["clock","10 min"],["sandwich","Makes "+n]],note:["Balance: something creamy, something crunchy and something sharp (pickles, mustard or lemon)."],ing,
   steps:s.b==="toastie"?["Butter the outside of the bread. Layer the filling and extra cheese inside.","Cook in a pan over medium heat 3 minutes per side under a weight, until golden and melted."]:s.b==="wrap"?["Warm the wraps for 10 seconds so they fold without cracking.","Spread the creamy part down the middle, add the rest, fold in the sides and roll tightly. Cut in half."]:["Spread the creamy part on both slices so the bread stays dry.","Layer the filling, putting the lettuce next to the bread. Press and cut."]}}},
salad:{title:"What are we tossing?",sub:"Bowls with a base, a protein, some crunch and a dressing.",
 ctl:[{k:"t",label:"Bowl",icon:"salad",def:"greek",tg:[["greek","Greek"],["asian","Asian slaw"],["mex","Mexican bowl"],["grain","Grain bowl"]]},{k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,B={greek:{n:"Greek salad",i:[["Tomatoes",120],["Cucumber",100],["Red onion",20],["Olives",25],["Feta",40]],d:[["Olive oil",15],["Lemon juice or red wine vinegar",7],["Dried oregano",.5]]},
   asian:{n:"Asian slaw",i:[["Cabbage, shredded",120],["Carrot, grated",50],["Cucumber",40],["Spring onion",10],["Peanuts",15],["Coriander",5]],d:[["Lime juice",15],["Soy sauce",8],["Sesame oil",4],["Honey",4]]},
   mex:{n:"Mexican bowl",i:[["Cooked rice",120],["Canned black beans, drained",80],["Sweetcorn",50],["Tomatoes",60],["Avocado",50],["Lettuce",30]],d:[["Lime juice",10],["Oil",8],["Ground cumin",.5]]},
   grain:{n:"Grain bowl",i:[["Cooked grain (quinoa, bulgur, rice)",120],["Roasted vegetables",150],["Canned chickpeas, drained",80],["Leaves",30]],d:[["Tahini",15],["Lemon juice",10],["Water",15]]}}[s.t],
   f=x=>[x[0],x[1]<1?"a pinch":G(x[1]*n)];
  return{title:B.n+" for "+n,meta:[["clock","15 min"],["salad","Serves "+n],["fridge","Dressing keeps 3 days"]],note:["Keep the dressing separate until you eat. It stays crisp for tomorrow."],ing:B.i.map(f).concat(B.d.map(x=>["Dressing: "+x[0],f(x)[1]])).concat([["Salt","to taste"]]),
   steps:["Chop everything into bite-size pieces.","Whisk the dressing ingredients with a pinch of salt.","Toss the salad with the dressing just before serving. Taste and adjust."]}}},
noodle:{title:"What are we slurping?",sub:"Noodles and a stir-fry sauce from pantry staples.",
 ctl:[{k:"n",label:"Noodles",icon:"noodle",def:"egg",tg:[["egg","Egg noodles"],["ramen","Ramen"],["udon","Udon (fresh)"],["soba","Soba"],["rice","Rice noodles"]]},{k:"s",label:"Sauce",icon:"sauce",def:"soy",tg:[["soy","Savoury soy"],["sweet","Sticky sweet"],["peanut","Peanut"]]},{k:"p",label:"People",icon:"users",def:null,step:[1,12,1,""]}],
 calc(s){
  const n=s.p||people,N={egg:["Egg noodles (dry)",80,4],ramen:["Ramen noodles (dry)",80,3],udon:["Udon noodles (fresh)",150,2],soba:["Soba noodles (dry)",80,5],rice:["Rice noodles (dry)",70,0]}[s.n],
   S={soy:[["Soy sauce",15],["Rice vinegar",5],["Sugar",3],["Sesame oil",3],["Cornflour",3],["Water",20]],sweet:[["Soy sauce",15],["Honey",10],["Rice vinegar",5],["Garlic, grated",3],["Water",20]],peanut:[["Peanut butter",20],["Soy sauce",10],["Lime juice",8],["Chilli flakes",.5],["Water",20]]}[s.s];
  return{title:"Stir-fried noodles for "+n,meta:[["clock","20 min"],["noodle",N[0].split(" (")[0]+" "+G(N[1]*n)]],note:[s.n==="rice"?"Soak rice noodles in hot (not boiling) water 10–20 minutes until flexible, then drain.":"Cook the noodles "+N[2]+" minutes, then rinse in cold water so they do not stick."],
   ing:[[N[0],G(N[1]*n)],["Vegetables, sliced",G(150*n)],["Chicken, tofu or prawns",G(100*n)],["Garlic",Math.max(1,n)+" cloves"],["Ginger",G(5*n)],["Oil",G(10*n)]].concat(S.map(x=>["Sauce: "+x[0],x[1]<1?"a pinch":G(x[1]*n)])),
   steps:["Whisk the sauce ingredients in a bowl.","Heat the oil in a wok on high heat. Cook the protein 3–4 minutes, then take it out.","Stir-fry the garlic and ginger 20 seconds, then the vegetables 3–4 minutes.","Add the noodles, protein and sauce. Toss 1–2 minutes until glossy and hot."]}}},
spice:{title:"What are we grinding?",sub:"Blends you make once and use all month.",
 ctl:[{k:"b",label:"Blend",icon:"spice",def:"garam",tg:[["garam","Garam masala"],["taco","Taco seasoning"],["ras","Ras el hanout"],["zaatar","Za'atar"],["cajun","Cajun"],["curry","Curry powder"]]},{k:"c",label:"Batch (tablespoons)",icon:"ruler",def:4,step:[2,16,2,""]}],
 calc(s){
  const B={garam:["Garam masala",[["Ground cumin",4],["Ground coriander",4],["Black pepper",2],["Ground cardamom",2],["Cinnamon",2],["Ground cloves",.5],["Nutmeg",1]],"Add at the end of cooking. Use 1–2 teaspoons per 500 g."],
   taco:["Taco seasoning",[["Chilli powder",4],["Ground cumin",3],["Smoked paprika",3],["Garlic powder",2],["Onion powder",2],["Dried oregano",1],["Salt",2]],"Use 2 tablespoons per 500 g of meat or beans, with a splash of water."],
   ras:["Ras el hanout",[["Ground cumin",3],["Ground coriander",3],["Ground ginger",2],["Cinnamon",2],["Turmeric",2],["Sweet paprika",2],["Black pepper",1],["Ground cardamom",1],["Allspice",1],["Cayenne",.5]],"Rub it on lamb or chicken, or stir 1 tablespoon into a tagine."],
   zaatar:["Za'atar",[["Dried thyme",4],["Sumac",3],["Toasted sesame seeds",3],["Salt",1]],"Mix with olive oil and spread on flatbread, or sprinkle on eggs and yogurt."],
   cajun:["Cajun seasoning",[["Sweet paprika",4],["Garlic powder",2],["Onion powder",2],["Dried oregano",1.5],["Dried thyme",1.5],["Cayenne",1],["Black pepper",1.5],["Salt",3]],"Great on chicken, prawns and potatoes. Cut the cayenne for a milder mix."],
   curry:["Curry powder",[["Ground coriander",4],["Ground cumin",3],["Turmeric",3],["Ground fenugreek",1],["Ground ginger",1],["Black pepper",1],["Chilli powder",1]],"Fry in oil for 30 seconds first to wake it up."]}[s.b],
   tot=B[1].reduce((a,x)=>a+x[1],0),g=s.c*7;
  return{title:B[0],meta:[["spice","About "+G(g)+" ("+s.c+" tbsp)"],["jar","Keeps 6 months"]],note:[B[2]],ing:B[1].map(x=>[x[0],P1(g*x[1]/tot)+" g"]),
   steps:["If you have whole spices, toast them in a dry pan for 1–2 minutes until fragrant, cool and grind.","Mix everything well in a bowl.","Store in a clean airtight jar, away from light and heat. Label it with the date."]}}},
frozen:{title:"What are we freezing?",sub:"Sorbet, ice cream and lollies with a soft scoop.",
 ctl:[{k:"t",label:"Make",icon:"icecream",def:"sorbet",tg:[["sorbet","Fruit sorbet"],["custard","Ice cream"],["nochurn","No-churn ice cream"],["lolly","Ice lollies"]]},{k:"a",label:"Batch",icon:"ruler",def:1000,step:[500,2000,250,"g"]}],
 calc(s){
  const a=s.a,k=a/1000,pt=(a*.9/250)|0;
  if(s.t==="sorbet")return{title:"Fruit sorbet",meta:[["clock","30 min + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["The sugar is what keeps it scoopable. Very sweet fruit (mango, ripe peach) needs a little less."],ing:[["Fruit purée",G(a*.75)],["Sugar",G(a*.18)],["Lemon juice",G(a*.02)],["Water",G(a*.05)]],steps:["Warm the sugar and water until dissolved. Cool.","Blend with the fruit purée and lemon juice. Chill until very cold.","Churn in an ice cream machine 20–25 minutes. Or freeze in a tray and whisk every 45 minutes, 4 times.","Freeze until firm, and take out 10 minutes before scooping."]};
  if(s.t==="custard")return{title:"Vanilla ice cream",meta:[["clock","1 hour + freezing"],["icecream","Makes about "+G(a)],["fridge","Best within 2 weeks"]],note:["Cook the custard to 82 °C. No higher, or it scrambles."],ing:[["Whole milk",G(a*.5)],["Cream",G(a*.25)],["Egg yolks",Math.max(2,Math.round(a*.1/18))+" yolks"],["Sugar",G(a*.13)],["Vanilla",P1(5*k)+" g"]],steps:["Heat the milk, half the cream and the vanilla until steaming.","Whisk the yolks with the sugar until pale. Pour in the hot milk slowly, whisking.","Cook on low heat, stirring, until it coats the back of a spoon (82 °C). Strain into the cold cream.","Chill overnight, then churn and freeze."]};
  if(s.t==="nochurn")return{title:"No-churn ice cream",meta:[["clock","15 min + 6 h freezing"],["icecream","Makes about "+G(a*1.5)],["fridge","Best within 2 weeks"]],note:["The air whipped into the cream is what makes it soft."],ing:[["Cold whipping cream",G(a*.6)],["Sweetened condensed milk",G(a*.4)],["Vanilla",P1(5*k)+" g"]],steps:["Whip the cream to stiff peaks.","Fold in the condensed milk and vanilla.","Spoon into a container, cover and freeze at least 6 hours."]};
  return{title:"Ice lollies",meta:[["clock","10 min + 6 h freezing"],["icecream","About "+Math.max(4,Math.round(a/70))+" lollies"]],note:["A little sugar keeps them from freezing rock hard."],ing:[["Blended fruit or juice",G(a*.85)],["Sugar or honey",G(a*.08)],["Water",G(a*.07)]],steps:["Blend everything until smooth. Taste: it should be a bit too sweet, as freezing dulls sweetness.","Pour into moulds, add sticks after 1 hour and freeze 6 hours.","Run the mould under warm water for 10 seconds to release."]}}},
cure:{title:"What are we curing?",sub:"Whole cuts and sausages, salt only the traditional way or with curing salt. Weigh everything.",
 ctl:[{k:"t",label:"Cure",icon:"fridge",def:"pancetta",tg:[["pancetta","Pancetta (belly)"],["guanciale","Guanciale (jowl)"],["lonza","Lonza (pork loin)"],["coppa","Coppa (pork neck)"],["bresaola","Bresaola (beef)"],["duck","Duck breast"],["gravlax","Gravlax (salmon)"],["kulen","Kulen (paprika sausage)"],["kobasica","Kobasica (dry sausage)"],["italian","Italian fresh sausage"],["brat","Bratwurst"],["cevapi","Ćevapi"],["jerky","Beef jerky"],["salami","Salami (dry, Italian-style)"],["snack","Snack sticks (smoked)"],["bacon","Bacon (home-cured belly)"]]},
  {k:"m",label:"Salt",icon:"ruler",def:"plain",tg:[["plain","Salt only (traditional)"],["us","Curing salt, US #2"],["eu","Curing salt, EU (0.5% nitrite)"]],only:["pancetta","guanciale","lonza","coppa","bresaola","duck","kulen","kobasica","salami"]},
  {k:"w",label:"Meat weight",icon:"ruler",def:1000,step:[500,3000,250,"g"]}],
 calc(s){
  const w=s.w,g=s.t==="gravlax",m=s.m||"plain",P=x=>P1(w*x/100)+" g";
  if(s.t==="salami"){const tot=w*.028,plain=m==="plain"?tot:m==="us"?tot-w*.0025:0,cs=m==="us"?w*.0025:m==="eu"?tot:0,ing=[["Pork shoulder, lean, cubed",G(w*.75)],["Pork back fat, very cold, cubed",G(w*.25)]];
   if(plain)ing.push(["Fine salt, not iodised",P1(plain)+" g"]);
   if(cs)ing.push([m==="us"?"Curing salt #2 (weigh to 0.1 g)":"Nitrite curing salt (replaces all the salt)",(Math.round(cs*10)/10)+" g"]);
   ing.push(["Dextrose or sugar",P(.3)],["Black pepper, coarsely cracked",P(.3)],["Garlic, crushed",P(.3)],["Dry red wine, cold",P(2)],["Starter culture (optional)","as the packet says"],["Casings, 50 mm, soaked","natural or collagen"]);
   return{title:"Salami, "+G(w),meta:[["clock","Dry 4–8 weeks"],["fridge","Ready at "+G(w*.65)],["check","Loses about 35%"]],
    note:[m==="plain"?"Salt only is the traditional way: weigh exactly 2.8% of the meat, never by eye.":m==="us"?"Curing salt is poisonous in quantity. Weigh it to 0.1 g, label the tub and keep it away from children and the table salt. This amount is for US Cure #2 (6.25% nitrite).":"European nitrite curing salt replaces all the ordinary salt. Keep it labelled and away from children and the table salt.","Salami dries slowly, so it rewards patience and a cool, airy place. Keep everything cold while you work and use clean tools."],ing,
    steps:["Chill the meat, fat and grinder until the meat is almost frozen at the edges.","Grind the lean meat through a 6 mm plate, and dice the fat by hand into 4–5 mm cubes.","Mix the meat with the salt, spices, wine and culture. Add the fat last and mix just until it is evenly spread and sticky.","Fry a small patty to check the seasoning.","Stuff tightly into the casings, prick any air pockets with a needle and tie. Weigh each one and write it down.","If you used a culture, hang 24–48 hours at 20–24 °C and 85% humidity. Without one, go straight to the next step.","Hang at 12–15 °C and 75–80% humidity, with air moving gently. A little white mould is welcome.","Weigh weekly. It is ready at "+G(w*.65)+", after 4–8 weeks, when it feels firm all through."]}}
  if(s.t==="snack")return{title:"Snack sticks, "+G(w),meta:[["clock","About 6 hours"],["fridge","Makes about "+G(w*.8)],["check","Cook to 71 °C inside"]],
   note:["Snack sticks are smoked at a low temperature and then cooked. For that kind of sausage the standard is Cure #1 (6.25% nitrite), at 2.5 g per kg of meat. Weigh it to 0.1 g, label it and keep it away from children and the table salt.","If you prefer salt only, cook them to 71 °C, keep them in the fridge and eat them within 3–4 days."],
   ing:[["Beef and pork, about 80% lean and 20% fat, ground fine",G(w)],["Fine salt, not iodised",P(1.8)],["Curing salt #1 (weigh to 0.1 g)",(Math.round(w*.0025*10)/10)+" g"],["Dextrose or sugar",P(.5)],["Black pepper",P(.4)],["Garlic powder",P(.4)],["Mustard seed",P(.4)],["Smoked paprika",P(.6)],["Ice-cold water",G(w*.1)],["Sheep casings, 19–21 mm, soaked","about "+G(w*.03)]],
   steps:["Mix the meat with the salt, curing salt, spices and ice water and knead 3–5 minutes until sticky and it holds together.","Cover and rest in the fridge overnight so the flavours settle.","Stuff into the soaked casings, twist into 15 cm lengths and prick any air pockets.","Hang or lay on racks at room temperature for 1 hour so the casings dry.","In a smoker or oven: 55 °C for 1 hour, 65 °C for 1 hour with smoke, then 75–80 °C until the middle reaches 71 °C.","Dunk in ice water for a few minutes to stop the cooking, then leave at room temperature for 30 minutes so they darken.","Pat dry. Keep in the fridge for 2 weeks, or freeze for 3 months."]};
  if(s.t==="bacon")return{title:"Bacon, "+G(w),meta:[["clock","Cure 7 days, then smoke or bake 3 h"],["fridge","Makes about "+G(w*.8)],["check","Cook to 65 °C inside"]],
   note:["Bacon is cooked through before you eat it. A dry cure of salt and sugar, with Cure #1 at 2.5 g per kg for the pink colour and the bacon taste, is the usual way. Weigh it to 0.1 g, label it and keep it away from children and the table salt.","Without curing salt it is closer to cured pork belly: grey-brown, but still very good if you cook it through."],
   ing:[["Pork belly, skin off, in one piece",G(w)],["Fine salt, not iodised",P(2.5)],["Sugar or maple sugar",P(1.2)],["Curing salt #1 (weigh to 0.1 g)",(Math.round(w*.0025*10)/10)+" g"],["Black pepper, cracked",P(.4)],["Maple syrup (optional)",P(2)]],
   steps:["Mix the salt, sugar, curing salt and pepper. Rub it all over the belly, pressing into every corner.","Put in a zip bag, press out the air and keep in the fridge for 7 days, turning it daily. Use 1 day per 15 mm of thickness as a rule.","Rinse, pat dry and leave uncovered in the fridge overnight so a tacky skin forms.","Smoke at 90–100 °C, or bake in a 100 °C oven on a rack, until the middle reaches 65 °C (about 3 hours). Brush with maple syrup near the end if you like.","Cool, wrap and chill for a day. It slices far better when cold.","Slice and fry slowly until crisp. Keep in the fridge for a week or freeze in slices."]};
  if(["italian","brat","cevapi"].includes(s.t)){
   const F={italian:{n:"Italian fresh sausage",m:"Pork shoulder, with its fat (about 75% lean, 25% fat), cubed",sp:[["Fennel seeds, crushed",.8],["Black pepper, cracked",.4],["Garlic, crushed",.6],["Sweet paprika",.6],["Chilli flakes (optional)",.2]],l:["Red wine, cold",5],c:true},
    brat:{n:"Bratwurst",m:"Pork shoulder, with its fat (about 75% lean, 25% fat), cubed",sp:[["White pepper",.3],["Marjoram, dried",.3],["Nutmeg or mace",.1],["Ground ginger",.1],["Lemon zest",.2]],l:["Ice-cold milk",10],c:true},
    cevapi:{n:"Ćevapi",m:"Beef and lamb or pork, 70% beef, minced twice",sp:[["Garlic, crushed very fine",1],["Black pepper",.4],["Baking soda",.3],["Sweet paprika (optional)",.4]],l:["Sparkling water, cold",8],c:false}}[s.t];
   const ing=[[F.m,G(w)],["Fine salt, not iodised",P1(w*.018)+" g"]];F.sp.forEach(x=>ing.push([x[0],P(x[1])]));ing.push([F.l[0],G(w*F.l[1]/100)]);
   if(F.c)ing.push(["Pork casings, 32 mm, soaked","about "+G(w*.04)]);
   return{title:F.n+", "+G(w),meta:[["clock",F.c?"About 2 hours":"1 hour + 8 h rest"],["fridge",F.c?"Fridge 2 days, freezer 3 months":"Fridge 2 days, freezer 3 months"],["check","Cook to 71 °C inside"]],
    note:["Fresh sausage is never cured: it is salt and spices, kept cold, and it must be cooked through. Fresh means it does not keep, so cook it within 2 days or freeze it.","Keep the meat, fat and grinder very cold, and work with clean hands and tools."],ing,
    steps:F.c?["Chill the meat, fat and grinder until the edges of the meat are almost frozen.","Grind through an 8 mm plate into a cold bowl.","Add the salt, spices and "+F.l[0].toLowerCase()+" and mix with a hand for 1–2 minutes until sticky and it clings to your hand.","Fry a small patty to taste and adjust the salt and spices.","Stuff into the soaked casings without trapping air, twist into links and prick any air pockets with a needle.","Rest 1 hour in the fridge. Cook gently in a pan or on a grill over medium heat until 71 °C in the middle and no pink is left."]
     :["Mix the beef and lamb or pork, then put through the finest plate of the grinder, or ask the butcher to mince it twice.","Dissolve the baking soda in the cold sparkling water and knead it into the meat with the salt, garlic and pepper for 5 minutes until it looks tacky.","Cover and rest 8–24 hours in the fridge. This is what gives ćevapi their springy bite.","With wet hands, shape into fingers about 7 cm long and 2 cm wide.","Grill or pan-fry on medium-high heat 3–4 minutes a side, until browned and 71 °C inside.","Serve in warm somun or lepinja bread with chopped raw onion, kajmak and ajvar."]}}
  if(s.t==="jerky")return{title:"Beef jerky, "+G(w),meta:[["clock","12 h marinade + 4–6 h dry"],["fridge","Makes about "+G(w*.38)],["check","Keeps 2 weeks cool, 2 months in the fridge"]],
   note:["Use very lean beef (top round, silverside or topside) and trim every bit of fat: fat goes rancid.","Jerky is dried at a low temperature, so one extra step makes it safe: heat the strips to 71 °C before or after drying, as in step 4."],
   ing:[["Lean beef, trimmed and sliced 4–5 mm thick",G(w)],["Soy sauce",G(w*.1)],["Worcestershire sauce",G(w*.04)],["Brown sugar",P(2)],["Black pepper",P(.4)],["Garlic powder",P(.5)],["Smoked paprika",P(.5)],["Salt",P(.5)]],
   steps:["Freeze the beef for 1–2 hours so it is firm, then slice it 4–5 mm thick with the grain for chewy jerky, against the grain for tender.","Mix the marinade, add the beef and turn well. Cover and leave in the fridge 12–24 hours.","Pat the strips dry with a towel and lay them in a single layer, not touching, on dehydrator trays or oven racks.","Heat the strips in a 160 °C oven for 10 minutes first, so they reach 71 °C, then dry them at 70 °C for 3–5 hours with the oven door propped open.","It is done when a cooled strip bends and cracks but does not snap. Blot off any fat.","Cool, then store in a jar or bag in a cool, dry place for 2 weeks, or in the fridge for 2 months."]};
  if(g)return{title:"Gravlax, "+G(w)+" salmon",meta:[["clock","1–2 days"],["fridge","Keeps 5 days"],["check","Makes about "+G(w*.9)]],
   note:["Raw fish: use salmon sold for eating raw, or freeze it first at −20 °C for at least 7 days. Pregnant, elderly and immune-weak people should skip it.","No nitrite needed: salt and sugar do the work, and it stays in the fridge the whole time."],
   ing:[["Salmon fillet, skin on",G(w)],["Coarse salt",P(5)],["Sugar",P(5)],["Fresh dill, chopped",P(4)],["White or black pepper, crushed",P(.3)],["Lemon zest or a splash of gin (optional)","to taste"]],
   steps:["Check the fillet for bones and pull them out with tweezers. Rinse and pat dry.","Mix the salt, sugar, pepper and dill. Spread half in a dish, lay the salmon skin side down on it, and cover the flesh with the rest.","Wrap tightly, put a small board and a weight (a couple of cans) on top and keep in the fridge 24 hours for thin fillets, 48 hours for thick ones.","Turn it over every 12 hours and spoon the liquid over it.","Scrape off the cure, rinse quickly, pat dry and slice thinly on a slant. Keep wrapped in the fridge up to 5 days."]};
  if(s.t==="kulen"||s.t==="kobasica"){const k=s.t==="kulen",fat=k?.1:.25,tot=w*.025,plain=m==="plain"?tot:m==="us"?tot-w*.0025:0,cs=m==="us"?w*.0025:m==="eu"?tot:0,L=k?38:32,dry=k?"3–4 months":"3–5 weeks",ing=[["Pork, lean (ham or shoulder), "+(k?"coarsely ground or chopped by hand":"ground 8 mm"),G(w*(1-fat))],["Pork back fat, cold, "+(k?"diced small":"ground"),G(w*fat)]];
   if(plain)ing.push(["Fine salt, not iodised",P1(plain)+" g"]);
   if(cs)ing.push([m==="us"?"Curing salt #2 (weigh to 0.1 g)":"Nitrite curing salt (replaces all the salt)",(Math.round(cs*10)/10)+" g"]);
   ing.push(["Sweet paprika",P(k?3:1.8)],["Hot paprika",P(k?.6:.4)],["Garlic, crushed",P(k?1.2:.8)],["Black pepper",P(.3)],["Caraway or fennel seeds (optional)",P(.2)],["Sugar or dextrose (optional)",P(.3)],["Casings",k?"large natural casing, 80–100 mm, soaked":"pork casings, 32–36 mm, soaked"]);
   return{title:(k?"Kulen":"Kobasica")+", "+G(w),meta:[["clock","Dry "+dry],["fridge","Ready at "+G(w*(1-L/100))],["check","Loses about "+L+"%"]],
    note:["A winter tradition in Vojvodina, Slavonia and across the Balkans. The traditional way is salt only: about 2.5% of the weight of the meat, weighed, then cold, dry and airy. Curing salt is optional for a redder colour and extra margin. Check which kind you have: US Cure #2 has 6.25% nitrite, European nitrite salt about 0.5%.",
     m==="plain"?"Salt only: weigh the salt, do not go by eye, and do not make the mix less salty than shown.":m==="us"?"Curing salt is poisonous in quantity: weigh it to 0.1 g and keep it labelled and away from children and the table salt.":"European nitrite curing salt replaces all the ordinary salt. Keep it labelled and away from children and the table salt.",
     "Keep the meat and fat very cold while you work, use clean tools, and have home-slaughtered pork checked for Trichinella, as is usual here."],ing,
    steps:["Chill the meat, fat and grinder well, until the meat is almost frozen at the edges.","Grind or chop the lean meat and the fat separately.","Mix everything with the salt and spices and knead 5–10 minutes until the mix turns sticky and holds together.","Pack it tight in a bowl, pressing out any air, and rest it in the fridge 24 hours so the flavours settle.","Stuff the casings tightly, prick any air pockets with a needle and tie the ends. Weigh and write the weight down.","Hang for 2–3 days in a cool, airy room to dry the surface, then cold smoke it (beech wood, below 20 °C) for a few days, or just keep drying it.","Hang at 10–15 °C and about 75% humidity with air moving, away from light. A little white mould on the casing is normal.","Weigh it weekly. It is ready after about "+dry+", when it has lost "+L+"% of its weight, so at "+G(w*(1-L/100))+". It should feel firm all through.","Keep it in a cool, dry place, or in the fridge once cut."]}}
  const C={pancetta:{n:"Pancetta",c:4,l:30,h:"3–4 weeks",sp:[["Black pepper, cracked",.8],["Juniper berries, crushed",.3],["Garlic, crushed",.5],["Fresh thyme",.3]],x:"2 bay leaves, crumbled"},
   guanciale:{n:"Guanciale",c:4,l:30,h:"3–4 weeks",sp:[["Black pepper, cracked",.8],["Garlic, crushed",.5],["Fresh thyme",.3]],x:"a pinch of chilli flakes (optional)"},
   lonza:{n:"Lonza (cured pork loin)",c:6,l:32,h:"4–5 weeks",sp:[["Fennel seeds, crushed",.4],["Black pepper, cracked",.6],["Garlic, crushed",.5],["Fresh rosemary",.3]],x:"a little red wine to wipe the surface (optional)"},
   coppa:{n:"Coppa (cured pork neck)",c:7,l:30,h:"5–6 weeks",sp:[["Sweet paprika",.6],["Black pepper, cracked",.6],["Garlic, crushed",.5]],x:"a pinch each of nutmeg and ground cloves"},
   bresaola:{n:"Bresaola (cured beef)",c:6,l:33,h:"4–5 weeks",sp:[["Juniper berries, crushed",.3],["Black pepper, cracked",.6],["Fresh rosemary",.3],["Fresh thyme",.3]],x:"2 bay leaves and a pinch of cinnamon"},
   duck:{n:"Duck breast prosciutto",c:3,l:30,h:"1–2 weeks",sp:[["Black pepper, cracked",.6],["Juniper berries, crushed",.3],["Fresh thyme",.3]],x:"orange zest and a bay leaf"}}[s.t];
  const days=Math.max(5,Math.round(C.c*2)),plain=m==="plain"?w*.03:m==="us"?w*.0275:0,cs=m==="us"?w*.0025:m==="eu"?w*.03:0;
  const ing=[[C.n.split(" (")[0]+" (one whole piece)",G(w)]];
  if(plain)ing.push(["Fine salt, not iodised",P1(plain)+" g"]);
  if(cs)ing.push([m==="us"?"Curing salt #2 (weigh to 0.1 g)":"Nitrite curing salt (replaces all the salt)",(Math.round(cs*10)/10)+" g"]);
  ing.push(["Sugar",P(.5)]);C.sp.forEach(x=>ing.push([x[0],P(x[1])]));ing.push(["To finish",C.x]);
  const notes=[m==="plain"?"Salt only is how it was done for centuries. Use exactly 3% salt of the meat weight, never 'by eye'. The meat stays brown-grey instead of pink and tastes more rustic. Hang it cool and dry, and only dry it until it has lost "+C.l+"% of its weight.":
   m==="us"?"Curing salt is poisonous in quantity. Weigh it to 0.1 g, never use more than 2.5 g per kg of meat, label the tub and keep it away from children, pets and the table salt. This amount is for US Prague powder / Cure #2 (6.25% nitrite).":
   "European nitrite curing salt (about 0.5% nitrite) replaces ALL the ordinary salt, at 3% of the meat weight. Do not mix it with Cure #2 amounts. Keep it labelled and away from children and the table salt.",
   "Keep the cure at 2–4 °C and hang at 12–15 °C and 70–80% humidity, out of the light. Pregnant, elderly and immune-weak people should not eat raw cured meat. Wild boar and bear can carry Trichinella: cook those."];
  return{title:C.n+", "+G(w),meta:[["clock","Cure "+days+" days, dry "+C.h],["fridge","Ready at "+G(w*(1-C.l/100))],["check","Loses "+C.l+"%"]],note:notes,ing,
   steps:["Weigh the meat exactly and write the weight down. Trim off loose bits and pat it dry.","Mix the salt, sugar and spices. Rub them in all over, pressing into every crease.","Put it in a zip bag or vacuum bag, press out the air and keep it in the fridge "+days+" days (about 1 day per 5 mm of thickness), turning and massaging it once a day.","Rinse, pat dry and tie with string so it keeps its shape. Wrap in muslin if you like, and weigh it again. This is your starting weight.","Hang at 12–15 °C and 70–80% humidity (a cellar, cool pantry or a wine fridge), with air moving gently around it.","Weigh it once a week. It is ready when it has lost "+C.l+"% of its weight, so at "+G(w*(1-C.l/100))+". This usually takes "+C.h+".","White powdery mould is harmless. Green, black or fuzzy mould: wipe with vinegar. Slime or a rotten smell: throw it away.","Wrap it and rest it in the fridge 1–2 weeks so the moisture evens out, then slice very thinly."]}}},
rub:{title:"What are we seasoning?",sub:"A rub, marinade or brine from the weight of your meat. Swap spices freely.",
 ctl:[{k:"t",label:"Style",icon:"spice",def:"rub",tg:[["rub","Dry rub"],["wet","Marinade"],["brine","Brine"]]},
  {k:"f",label:"Flavour",icon:"flame",def:"bbq",tg:[["bbq","Smoky BBQ"],["med","Mediterranean"],["jerk","Jerk"],["tand","Tandoori"],["asian","Ginger-soy"],["mex","Mexican"]]},
  {k:"m",label:"For",icon:"grill",def:"chicken",tg:[["chicken","Chicken"],["pork","Pork"],["beef","Beef"],["lamb","Lamb"],["fish","Fish"],["veg","Vegetables"]]},
  {k:"h",label:"Heat",icon:"flame",def:1,tg:[[0,"Mild"],[1,"Medium"],[2,"Hot"]]},
  {k:"w",label:"Weight",icon:"ruler",def:1000,step:[250,3000,250,"g"]}],
 calc(s){
  const w=s.w,fish=s.m==="fish",F={bbq:{n:"Smoky BBQ",sp:[["Smoked paprika",4],["Garlic powder",2],["Onion powder",2],["Black pepper",1.5],["Mustard powder",1]],sg:.8,wet:[["Cider vinegar",3],["Worcestershire or soy sauce",2],["Honey",2],["Oil",4]]},
   med:{n:"Mediterranean",sp:[["Dried oregano",3],["Dried thyme",2],["Dried rosemary",1.5],["Garlic powder",2],["Sweet paprika",1],["Black pepper",1]],sg:0,wet:[["Lemon juice",3],["Olive oil",6],["Honey",1]]},
   jerk:{n:"Jerk",sp:[["Ground allspice",3],["Dried thyme",2],["Black pepper",1.5],["Ground ginger",1.5],["Garlic powder",2],["Onion powder",2],["Cinnamon",.5]],sg:.8,wet:[["Lime juice",3],["Soy sauce",3],["Oil",4]]},
   tand:{n:"Tandoori-style",sp:[["Garam masala",3],["Ground cumin",2],["Ground coriander",2],["Paprika",3],["Turmeric",1],["Ground ginger",1.5],["Garlic powder",1.5]],sg:0,wet:[["Plain yogurt",15],["Lemon juice",2],["Oil",2]]},
   asian:{n:"Ginger-soy",sp:[["Five-spice",1],["White pepper",1],["Ground ginger",2],["Garlic powder",2]],sg:.8,wet:[["Soy sauce",6],["Rice vinegar",2],["Honey",2],["Sesame oil",1.5],["Fresh ginger, grated",2],["Garlic, crushed",1]]},
   mex:{n:"Mexican",sp:[["Mild chilli powder",4],["Ground cumin",3],["Dried oregano",2],["Garlic powder",2],["Smoked paprika",2]],sg:.5,wet:[["Lime or orange juice",4],["Oil",4],["Garlic, crushed",1.5]]}}[s.f];
  const M={chicken:{n:"chicken",r:"1–12 hours",w:"2–8 hours (acid longer than 4 hours turns it soft)",b:"1–2 hours for pieces, 8–12 hours for a whole bird",c:"Chicken must reach 74 °C inside."},
   pork:{n:"pork",r:"1–12 hours",w:"4–12 hours",b:"2–6 hours",c:"Pork chops are best at 63 °C inside, then rested 5 minutes."},
   beef:{n:"beef",r:"1–12 hours",w:"2–12 hours",b:"not needed: a dry rub or marinade suits beef better",c:"Take it out of the fridge 30 minutes before cooking."},
   lamb:{n:"lamb",r:"1–12 hours",w:"4–12 hours",b:"not needed: a dry rub or marinade suits lamb better",c:"Lamb is lovely pink at 57 °C inside."},
   fish:{n:"fish",r:"15–30 minutes",w:"15–30 minutes (the acid cooks it quickly)",b:"15–20 minutes",c:"Fish is done at 55 °C inside, or when it flakes."},
   veg:{n:"vegetables",r:"15–60 minutes",w:"30 minutes–2 hours",b:"not needed: use a rub or marinade",c:"Roast or grill until tender and browned at the edges."}}[s.m];
  const tot=w*(s.t==="rub"?(fish||s.m==="veg"?.015:.025):s.t==="wet"?(fish?.008:.015):.005),pt=F.sp.reduce((a,x)=>a+x[1],0),hot=w*[0,.002,.005][s.h],
   spc=F.sp.map(x=>[x[0],P1(tot*x[1]/pt)+" g"]),heat=hot?[["Chilli flakes or cayenne",P1(hot)+" g"]]:[],nm=F.n+" "+(s.t==="rub"?"rub":s.t==="wet"?"marinade":"brine")+" for "+M.n,
   keep="Cook on moderate heat: sugar in a rub burns over a roaring flame. Brush or sprinkle more near the end for a good crust.";
  if(s.t==="brine"){const wt=w*.9,sa=wt*(fish?.03:.05);return{title:nm,meta:[["clock",M.b.split(" (")[0]],["flame","Water "+G(wt)],["check","Salt "+G(sa)]],note:["Brine in the fridge, never on the counter. Stay inside the time: too long and the meat turns salty and spongy.",M.c],
   ing:[["Water",G(wt)],["Salt (not iodised)",G(sa)],["Sugar",G(wt*.025)],["Peppercorns",P1(2)+" g"],["Bay leaves","2"],["Garlic cloves, smashed",Math.max(2,Math.round(w/400))+""],...spc.slice(0,3).map(x=>[x[0],P1(parseFloat(x[1])/3)+" g"])],
   steps:["Warm half of the water with the salt, sugar and spices until dissolved. Add the rest of the water cold so it is fully chilled.","Put the meat in a bowl or bag and pour the brine over it so it is fully covered.","Keep in the fridge: "+M.b+".","Lift out, rinse briefly, pat very dry and leave uncovered in the fridge 30 minutes for crisp skin.","Do not add extra salt. "+M.c]}}
  const ing=s.t==="rub"?[["Salt",P1(w*.01)+" g"]].concat(F.sg?[["Brown sugar",P1(w*F.sg/100)+" g"]]:[],spc,heat,[["Oil, to bind",P1(w*.01)+" g"]]):
   F.wet.map(x=>[x[0],G(w*x[1]/100)]).concat(s.f==="asian"?[]:[["Salt",P1(w*.01)+" g"]],spc,heat);
  return{title:nm,meta:[["clock",s.t==="rub"?M.r:M.w.split(" (")[0]],["flame",M.n[0].toUpperCase()+M.n.slice(1)+" "+G(w)],["fridge","Keeps 3 days in the fridge"]],
   note:s.t==="rub"?["Swap any spice for another in the same amount, for example smoked paprika for sweet paprika. "+keep,M.c]:["Marinate in the fridge only. Never reuse raw marinade as a sauce unless you boil it for 2 minutes first.",M.c],
   ing,steps:s.t==="rub"?["Mix the spices"+(F.sg?", sugar":"")+" and salt in a bowl.","Pat the "+M.n+" dry and rub with the oil.","Press the rub on all over. Cover and keep in the fridge: "+M.r+".",M.c+" "+keep]:
   ["Whisk the liquids together, then stir in the spices"+(s.f==="asian"?"":" and salt")+".","Put the "+M.n+" in a bag or dish and coat it well.","Keep in the fridge: "+M.w+".","Lift out, let the extra drip off and pat the surface fairly dry so it browns.",M.c+" "+keep]}}},
bbq:{title:"What are we smoking?",sub:"Low and slow: the temperature, the time, the wood and the rub.",
 ctl:[{k:"t",label:"Cut",icon:"flame",def:"shoulder",tg:[["shoulder","Pulled pork shoulder"],["ribs","Spare ribs"],["brisket","Brisket"],["chicken","Whole chicken"],["lamb","Lamb shoulder"],["baby","Baby back ribs"],["short","Beef short ribs"],["turkey","Turkey breast"]]},
  {k:"m",label:"Cooker",icon:"grill",def:"smoker",tg:[["smoker","Smoker or charcoal kettle"],["oven","Oven (no smoke)"]]},
  {k:"w",label:"Weight",icon:"ruler",def:2000,step:[1000,6000,500,"g"]}],
 calc(s){
  const w=s.w,k=w/1000,C={shoulder:{n:"Pulled pork shoulder",t:115,a:2.2,b:3,i:"93–96 °C: the probe slides in like soft butter",r:60,wd:"apple, cherry or beech",sp:1,wr:1},
   ribs:{n:"Spare ribs",t:120,a:2.2,b:2.8,i:"the meat has pulled back about 6 mm from the bone ends and the rack bends in the middle",r:15,wd:"apple or hickory",sp:1,wr:0},
   brisket:{n:"Brisket",t:120,a:2,b:2.8,i:"93–96 °C: the probe slides in like soft butter",r:90,wd:"oak or beech",sp:0,wr:1},
   chicken:{n:"Whole chicken",t:150,a:1,b:1.3,i:"74 °C in the breast and 82 °C in the thigh",r:15,wd:"apple or cherry (mild)",sp:0,wr:0},
   lamb:{n:"Lamb shoulder",t:120,a:2.2,b:3,i:"90–93 °C: the meat pulls apart with a fork",r:45,wd:"oak or plum",sp:1,wr:1},
   baby:{n:"Baby back ribs",t:120,a:2,b:2.6,i:"the meat has pulled back about 6 mm from the bone ends and the rack bends in the middle",r:15,wd:"apple or cherry",sp:1,wr:0},
   short:{n:"Beef short ribs",t:125,a:2.5,b:3.2,i:"93–96 °C: the probe slides in like soft butter",r:45,wd:"oak or hickory",sp:0,wr:1},
   turkey:{n:"Turkey breast (bone-in)",t:135,a:1.4,b:1.9,i:"74 °C in the thickest part",r:20,wd:"apple or cherry (mild)",sp:0,wr:0}}[s.t],
   lo=Math.round(k*C.a*60),hi=Math.round(k*C.b*60),P=x=>P1(w*x/100)+" g",oven=s.m==="oven";
  return{title:C.n+", "+G(w),meta:[["clock",hm(lo)+" to "+hm(hi)],["flame","Cooker "+C.t+" °C"],["check","Inside: "+C.i.split(":")[0]]],
   note:["Start about "+hm(hi+C.r+30)+" before you want to eat: cooking, then "+hm(C.r)+" resting. Times are a guide, the thermometer decides.",oven?"Oven: use a tray with a rack and a pan of hot water on the shelf below, and add 1 teaspoon of smoked paprika to the rub for a smoky note.":"Wood: "+C.wd+". Two or three chunks are plenty. You want thin blue smoke, not thick white smoke, which tastes bitter.","Charcoal gives off carbon monoxide: only ever cook outdoors, never in a garage, tent or on a balcony with a roof. Use a probe thermometer and check chicken and turkey reach 74 °C."],
   ing:[[C.n.split(" (")[0],G(w)],["Salt",P(1.2)],["Black pepper",P(1)],["Smoked paprika",P(1.2)],["Brown sugar",P(.8)],["Garlic powder",P(.5)],["Onion powder",P(.5)],[s.t==="chicken"||s.t==="turkey"?"Oil":"Yellow mustard or oil, as a binder",P(1.5)]].concat(C.sp?[["Spritz: apple juice",G(k*40)],["Spritz: cider vinegar",G(k*40)]]:[]),
   steps:["The night before, pat the meat dry, rub it with the binder and press the mixed rub on all over. Leave uncovered in the fridge at least 4 hours or overnight.","Heat the cooker to "+C.t+" °C and let it settle for 30 minutes. "+(oven?"Put the meat on a rack over a tray.":"Add the wood to the coals when the smoke runs clean."),"Put the meat in and push a probe thermometer into the thickest part. Keep the lid closed: every peek costs 10–15 minutes.",C.sp?"After 2 hours, spritz with the apple juice and vinegar mixed, then again every hour.":"Leave it alone: no spritzing needed.",C.wr?"At about 70 °C the temperature stalls for an hour or two. Wrap tightly in foil or butcher paper to push through it.":"No wrapping needed. Keep going.","Cook until it reaches: "+C.i+". Plan "+hm(lo)+" to "+hm(hi)+".","Rest "+hm(C.r)+(C.wr?" wrapped in a towel inside a cool box or a warm oven.":" loosely covered."),s.t==="shoulder"||s.t==="lamb"?"Pull it apart with two forks, mixing in the juices.":s.t==="ribs"||s.t==="baby"?"Cut between the bones and serve.":"Slice across the grain."]}}},
cheese:{title:"What are we making?",sub:"Home cheeses with the milk, acid, rennet and salt worked out.",
 ctl:[{k:"t",label:"Cheese",icon:"dairy",def:"mozz",tg:[["mozz","Mozzarella"],["halloumi","Halloumi"],["feta","Feta (brined)"],["ricotta","Milk ricotta"],["sir","Sir (farmer's cheese)"],["queso","Queso fresco"],["gouda","Gouda-style (pressed, aged)"]]},
  {k:"l",label:"Milk (litres)",icon:"ruler",def:4,step:[2,12,2,"L"]}],
 calc(s){
  const L=s.l,r=(x)=>P1(L*x)+" ml",mk=["Pasteurised whole milk, not UHT (UHT will not set)",G(L*1000)],
   N=["Use pasteurised milk, clean tools and non-chlorinated water. Pregnant people should skip unpasteurised cheese.","Rennet strengths differ: use "+r(.3)+" of double-strength liquid rennet and check your bottle's label."];
  if(s.t==="sir")return{title:"Sir (farmer's cheese), "+L+" L",meta:[["clock","1 day"],["dairy","Makes about "+G(L*150)],["fridge","Keeps 5 days"]],note:["A soft white cheese like the sir made on farms across Vojvodina. No rennet: the milk sets as it sours. Pasteurised milk, not UHT."],ing:[mk,["Plain live yogurt or buttermilk, as starter",G(L*30)],["Salt",P1(L*2.5)+" g"]],
   steps:["Warm the milk to 30 °C and stir in the starter.","Cover and leave at room temperature 12–24 hours until it sets like a thick yogurt.","Warm it very gently to 40 °C, without stirring, until the curd shrinks and clear whey shows around it.","Ladle into a cloth-lined sieve and drain 4–6 hours.","Mix in the salt, press into a bowl and chill."]};
  if(s.t==="queso")return{title:"Queso fresco, "+L+" L",meta:[["clock","2 hours"],["dairy","Makes about "+G(L*110)],["fridge","Keeps 5 days"]],note:N,ing:[mk,["Rennet, diluted in cool water",r(.3)],["Calcium chloride (optional)",r(.3)],["Salt",P1(L*6)+" g"]],
   steps:["Warm the milk to 32 °C, stir in the rennet for 30 seconds and leave 45 minutes until set.","Cut into 1.5 cm cubes and rest 5 minutes. Stir gently 10 minutes.","Drain the curds in a cloth, stir in the salt and pack into a mould or sieve.","Press lightly under a plate and a can for 1 hour.","Unmould and chill. It crumbles well over beans, eggs and tacos."]};
  if(s.t==="gouda")return{title:"Gouda-style cheese, "+L+" L",meta:[["clock","1 day + 4–8 weeks"],["dairy","Makes about "+G(L*100)],["fridge","Ages 4–8 weeks at 10–13 °C"]],note:N.concat(["This is the first cheese that needs a press (or a few heavy weights), a mould and a cool place to age. Start with 4 L or more."]),
   ing:[mk,["Mesophilic culture, or plain live yogurt",G(L*20)],["Rennet, diluted in cool water",r(.3)],["Calcium chloride (optional)",r(.3)],["Salt, for the brine (20%)","360 g per litre of water"]],
   steps:["Warm the milk to 32 °C, stir in the culture and rest 45 minutes.","Stir in the rennet for 30 seconds and leave 45 minutes until the curd breaks cleanly.","Cut into 1 cm cubes, rest 5 minutes, then stir gently 20 minutes.","Draw off a third of the whey and stir in the same amount of 60 °C water, so the curds warm up to about 36 °C. Stir 10 minutes.","Pack the curds into a cloth-lined mould. Press at about twice the cheese's weight for 30 minutes, turn it, then at five times its weight for 12 hours.","Float it in 20% brine for about 5 hours per kilo of cheese, turning once.","Dry on a rack at room temperature 2–3 days until the surface feels dry, then age at 10–13 °C and 80–85% humidity, turning it daily at first and then weekly.","Wipe off any mould with a cloth dipped in brine. It is ready from 4 weeks and gets sharper with time."]};
  if(s.t==="ricotta")return{title:"Milk ricotta, "+L+" L",meta:[["clock","45 min"],["dairy","Makes about "+G(L*120)],["fridge","Keeps 4 days"]],note:["Whole milk (not UHT) gives the best yield. No rennet needed: acid does the work."],ing:[mk,["Lemon juice or white vinegar",G(L*30)],["Salt",P1(L*4)+" g"]],
   steps:["Heat the milk with the salt to 85 °C, stirring now and then.","Turn off the heat, pour in the acid in a thin stream and stir once. Leave 10 minutes without stirring while the curds float up.","Lift the curds with a slotted spoon into a cloth-lined sieve and drain 10–20 minutes.","Eat warm or chill. Drain longer for a firmer cheese."]};
  if(s.t==="mozz")return{title:"Mozzarella, "+L+" L",meta:[["clock","1 hour"],["dairy","Makes about "+G(L*100)],["fridge","Best within 2 days"]],note:N,
   ing:[mk,["Citric acid",P1(L*1.5)+" g"],["Rennet, diluted in cool water",r(.3)],["Calcium chloride (if the curd is weak, optional)",r(.3)],["Salt, for the brine",P1(L*20)+" g"]],
   steps:["Dissolve the citric acid in "+G(L*60)+" of cool water and stir it into the cold milk.","Heat gently to 32 °C, stirring. Take off the heat, stir in the rennet for 30 seconds, then leave still 5–10 minutes until the curd breaks cleanly over a finger.","Cut the curd into 2 cm cubes. Warm to 40 °C, stirring very gently for 5 minutes.","Scoop the curd into a colander and press out the whey. Reserve some hot whey or water at 80 °C.","Dip the curd in the hot water and fold and stretch it with a spoon, then with gloved hands, until shiny and smooth.","Shape into balls, chill in ice water 10 minutes, then keep in a light brine."]};
  if(s.t==="halloumi")return{title:"Halloumi, "+L+" L",meta:[["clock","3 hours"],["dairy","Makes about "+G(L*110)],["fridge","Keeps 2 weeks in brine"]],note:N,
   ing:[mk,["Rennet, diluted in cool water",r(.3)],["Salt, for the brine (10%)",G(L*30)],["Dried mint (optional)",P1(L*.5)+" g"]],
   steps:["Warm the milk to 32 °C. Stir in the rennet for 30 seconds and leave 40 minutes until set.","Cut the curd into 1 cm cubes, then heat to 40 °C and hold 30 minutes, stirring gently.","Drain the curd into a cloth-lined mould, keep the whey, and press under a weight for 30 minutes.","Cut into blocks. Simmer in the hot whey (88 °C) 30 minutes, until they float.","Drain, sprinkle with salt and dried mint, and fold if you like. Chill. Keep in a 10% brine in the fridge.","Slice and fry or grill 1–2 minutes per side until golden."]};
  return{title:"Feta, "+L+" L",meta:[["clock","1 day + 2 weeks"],["dairy","Makes about "+G(L*140)],["fridge","Keeps 1 month in brine"]],note:N.concat(["Starter: a mesophilic culture is best. Plain live yogurt (about "+G(L*30)+") works too, with a slightly different flavour."]),
   ing:[mk,["Mesophilic culture, or plain live yogurt",G(L*30)],["Rennet, diluted in cool water",r(.3)],["Salt, for the curds",P1(L*14)+" g"],["Salt, for the brine (10%)",G(L*40)]],
   steps:["Warm the milk to 32 °C, stir in the starter and rest 30 minutes.","Stir in the rennet for 30 seconds and leave 1 hour until set.","Cut into 1.5 cm cubes, rest 10 minutes, then stir gently 15 minutes.","Drain in a cloth 4–6 hours, then cut into 3 cm cubes.","Sprinkle the cubes with the salt and leave covered at cool room temperature 24 hours.","Cover with a 10% brine and keep in the fridge. It is good after 2 weeks and better after 4."]}}},
starter:{title:"What are we growing?",sub:"A wild culture to start and keep, with a day-by-day plan.",
 ctl:[{k:"t",label:"Culture",icon:"jar",def:"sour",tg:[["sour","Sourdough starter"],["ginger","Ginger bug"],["wkefir","Water kefir"],["komb","Kombucha"],["kvass","Bread kvass"],["tepache","Tepache (pineapple)"],["blackgarlic","Black garlic"],["shio","Shio koji (salt koji)"]]},
  {k:"f",label:"Daily feed (flour)",icon:"ruler",def:50,step:[25,200,25,"g"],only:"sour"},
  {k:"a",label:"Water in the jar",icon:"ruler",def:1000,step:[500,3000,500,"g"],only:["ginger","wkefir","komb","kvass","tepache"]},
  {k:"b",label:"Garlic bulbs",icon:"ruler",def:6,step:[3,20,1,"bulbs"],only:"blackgarlic"},
  {k:"k",label:"Rice koji",icon:"ruler",def:200,step:[100,1000,100,"g"],only:"shio"}],
 calc(s){
  const f=s.f||50,a=s.a||1000,t=s.t;
  if(t==="blackgarlic"){const b=s.b||6;return{title:"Black garlic, "+b+" bulbs",meta:[["clock","3–5 weeks"],["jar","Makes about "+b+" bulbs"],["check","Soft, sweet and black"]],
   note:["No ferment at all, really: low, steady heat slowly turns the garlic soft, sweet and black. It tastes like balsamic, tamarind and caramel.","It runs for weeks on a rice cooker's keep-warm setting, so put it somewhere airy, on a hard surface, where it is safe to leave. The first days smell strongly, and that passes."],
   ing:[["Whole garlic bulbs, fresh, dry and unpeeled",b+" bulbs"],["Rice cooker with a keep-warm setting, or a dehydrator","1"],["Foil or a paper towel, to wrap (optional)","a little"]],
   steps:["Choose firm bulbs with dry skins and no sprouting. Do not peel or wash them.","Wrap each bulb in foil, or stand them on a paper towel in the cooker, so they are not touching the metal.","Put the lid on and switch to keep-warm (60–70 °C). Check once with a thermometer: below 55 °C they will not turn black, and above 80 °C they scorch.","Leave for 3–5 weeks. After the first 2 weeks, open the cooker briefly to check one bulb: the cloves should be dark, soft and sticky.","When it is soft all through, take the bulbs out and let them air-dry on a rack for a few days so the skins dry again.","Keep in a jar at room temperature for a month, or the fridge for 6 months. Peel and eat as a spread or slice thin over food."]}}
  if(t==="shio"){const k=s.k||200;return{title:"Shio koji, "+G(k)+" koji",meta:[["clock","7–10 days"],["jar","Makes about "+G(k*2.3)],["fridge","Keeps 6 months in the fridge"]],
   note:["Shio koji is rice koji, salt and water. The koji enzymes break down proteins and starch, so it tenderises meat and fish, and lifts vegetables and soups. You need rice koji (dry or fresh) from an Asian shop or online.","Use a clean glass jar and a clean spoon every time. It should smell sweet, like sake or fruit."],
   ing:[["Rice koji, crumbled",G(k)],["Fine salt, not iodised",P1(k*.3)+" g"],["Water, non-chlorinated, lukewarm",G(k*1.1)]],
   steps:["Crumble the koji into a clean bowl with your hands, breaking up any clumps.","Add the salt and rub it in for a minute, then pour in the water and stir until the salt has dissolved.","Spoon into a clean glass jar, leaving a third of the jar empty. Cover loosely: it gives off a little gas.","Keep at 25–30 °C (the warmest part of the kitchen). Stir once a day and top up with a little water if the rice sticks out.","After 7–10 days the grains are soft, the liquid is cloudy and it smells sweet and a little salty. Taste it: it should be salty and slightly sweet.","Keep it in the fridge. To use, rub about 10% of the meat's weight over meat or fish for 1 hour to overnight, and wipe it off before cooking."]}}
  if(t==="kvass")return{title:"Bread kvass",meta:[["clock","2–3 days"],["jar","Water "+G(a)],["check","Lightly fizzy"]],note:["A Slavic drink from rye bread, mildly sour and only slightly alcoholic. Use a plastic bottle for the second ferment and open it daily, so pressure never builds up."],
   ing:[["Dark rye bread, dried hard",G(a*.1)],["Water",G(a)],["Sugar",G(a*.05)],["Raisins",G(a*.01)],["Dried or fresh yeast",P1(a/1000*.5)+" g"]],
   steps:["Toast the bread slices in a 180 °C oven until dark brown and crisp.","Pour hot (not boiling) water over the bread, cover and steep 6 hours.","Strain through a cloth and stir in the sugar and yeast.","Cover with a cloth and leave 12–24 hours at room temperature until it foams and smells sweet and sour.","Bottle with a few raisins, leave 1 day, then chill. Drink within a week."]};
  if(t==="tepache")return{title:"Tepache",meta:[["clock","2–3 days"],["jar","Water "+G(a)],["check","Fizzy and fruity"]],note:["A Mexican drink from pineapple peel and core. Wash the pineapple well, because the wild yeast lives on the skin. Eat the flesh and use the scraps."],
   ing:[["Pineapple peel and core",G(a*.25)],["Brown sugar or piloncillo",G(a*.1)],["Water, non-chlorinated",G(a)],["Cinnamon stick and 2 cloves","1 each"]],
   steps:["Dissolve the sugar in a little warm water, then top up with cool water to "+G(a)+".","Add the pineapple scraps and spices to a clean glass jar and pour the sugar water over them.","Cover with a cloth and leave at 22–27 °C for 2–3 days. Skim off any foam.","Taste at 48 hours. When it is lightly fizzy and tangy, strain it.","Chill. For extra fizz, bottle for 1 day in plastic first. Drink within a week."]};
  if(t==="sour")return{title:"Sourdough starter",meta:[["clock","7–14 days"],["jar","Feed "+G(f)+" flour + "+G(f)+" water"],["check","Doubles in 4–8 hours"]],
   note:["Use wholemeal rye or wheat for the first week: it has the most wild yeast. Keep it at 24–28 °C.","A grey liquid on top is fine: stir it in. Pink or orange streaks, or fuzzy mould: throw it all away and start again."],
   ing:[["Wholemeal flour, week one",G(f*7)],["Lukewarm water (about 25 °C)",G(f*7)],["Glass jar, 1 litre, and a rubber band to mark the level","1"]],
   steps:["Day 1: stir "+G(f)+" flour and "+G(f)+" water in the jar. Cover loosely and leave 24 hours.","Day 2: stir it. You may see a few bubbles. Leave 24 hours.","Day 3: keep "+G(f)+" of the mix, throw the rest away, then stir in "+G(f)+" flour and "+G(f)+" water.","Days 4 to 7: repeat every day. Mark the level with a rubber band so you can see it rise.","When it doubles within 4–8 hours of feeding, smells pleasantly sour and is full of bubbles for 3 days in a row, it is ready (often day 7–14).","To keep it: store in the fridge and feed once a week with 1 part starter, 5 parts flour and 5 parts water. Take it out 1–2 days before baking and feed it twice."]};
  if(t==="ginger")return{title:"Ginger bug",meta:[["clock","5–7 days"],["jar","Water "+G(a)],["check","Fizzy and yeasty"]],
   note:["Use unpeeled organic ginger, because its skin carries the wild yeast. Non-organic can be treated and may not start.","Bottled sodas can build up pressure and burst. Use a plastic bottle so you can feel it getting firm, open the cap daily and refrigerate when it is hard."],
   ing:[["Ginger, grated, unpeeled: day 1",G(a*.12)],["Sugar: day 1",G(a*.1)],["Water, non-chlorinated",G(a)],["Ginger and sugar, each day after",G(a*.04)]],
   steps:["Day 1: put the ginger, sugar and water in a jar, stir well and cover with a cloth.","Days 2 to 5: every day stir in "+G(a*.04)+" of grated ginger and "+G(a*.04)+" of sugar.","When it fizzes and smells yeasty (day 3–7), it is ready.","To make soda: stir 50 g of strained bug into each litre of cool sweet tea or juice, bottle and leave at room temperature 1–2 days.","Keep the bug going: feed it a little ginger and sugar every day, or put it in the fridge and feed it weekly."]};
  if(t==="wkefir")return{title:"Water kefir",meta:[["clock","1–2 days"],["jar","Water "+G(a)],["check","Lightly fizzy"]],
   note:["You need water kefir grains (from a friend or a shop). Do not use metal for long contact: use glass, plastic or wood.","For a fizzy second ferment use a plastic bottle and open it daily: glass can burst."],
   ing:[["Water kefir grains, hydrated",G(Math.max(20,a*.03))],["Sugar",G(a*.06)],["Water, non-chlorinated",G(a)],["Dried fig or fruit, 1 slice of lemon","a little"]],
   steps:["Dissolve the sugar in a little warm water, then top up with cool water to "+G(a)+". It must be lukewarm or cooler.","Add the grains, the fig and the lemon. Cover with a cloth and leave 24–48 hours at room temperature.","Strain through a plastic sieve. Keep the grains for the next batch.","Optional second ferment: bottle the liquid with fruit or juice, leave 12–24 hours, then chill.","If you pause, keep the grains in sugar water in the fridge up to 2 weeks."]};
  return{title:"Kombucha",meta:[["clock","7–14 days"],["jar","Tea "+G(a)],["check","pH below 4.2"]],
   note:["You need a SCOBY and some starter kombucha (10% of the batch). Use glass, never a metal lid or lead-glazed ceramic.","Fuzzy, dry spots on top are mould: throw everything away. Brown stringy bits and a smooth jelly layer are normal."],
   ing:[["Water",G(a)],["Black or green tea",P1(a*.008)+" g"],["Sugar",G(a*.08)],["Starter kombucha",G(a*.1)],["SCOBY","1"]],
   steps:["Steep the tea in hot water 10 minutes, remove it, stir in the sugar and cool to room temperature.","Pour into a glass jar, add the starter kombucha, then lay the SCOBY on top.","Cover with a cloth and rubber band and leave at 22–27 °C out of the sun.","Taste from day 7. When it is pleasantly tart (pH below 4.2 if you have a test strip), pour off the kombucha and keep the SCOBY with some liquid for the next batch.","Optional second ferment: bottle with fruit 1–3 days, with the same bottle care as above, then chill."]}}}
};

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
 rub:["Spin a rub!","Mixing the spices…","jar","#c9741a","🌶️",["🧄","🌿","🍋"]],
 bbq:["Spin a smoke!","Lighting the coals…","pan","#7a3b1d","🍖",["🔥","🌶️","🌽"]],
 cheese:["Spin a cheese!","Warming the milk…","board","#f1c24b","🧀",["🥛","🧂","🌿"]],
 starter:["Spin a starter!","Feeding the jar…","jar","#d9b26a","🍞",["🌾","🍯","🍋"]]};
const CRAFT_ARTS={burger:BURGER_ART,pasta:PASTA_ART};
Object.keys(SPIN).forEach(id=>{if(TOOLS[id])CRAFT_ARTS[id]=SCENES[id]?SCENES[id](SPIN[id][3]):emojiArt(SPIN[id][2],SPIN[id][3],SPIN[id][4],SPIN[id][5])});
window.__craftArts=CRAFT_ARTS;
const autoSpin=T=>s=>{T.ctl.forEach(c=>{if(c.tg)s[c.k]=c.tg[Math.floor(Math.random()*c.tg.length)][0]})}; // a random option for every choice; amounts and people stay as set
Object.keys(TOOLS).forEach(id=>{const T=TOOLS[id],sp=SPIN[id];
 T.art=CRAFT_ARTS[id];if(sp){T.spinLabel=T.spinLabel||sp[0];T.spinNote=T.spinNote||sp[1]}
 if(!T.spin)T.spin=autoSpin(T);
 if(!T.names)T.names=[...new Set(T.ctl.filter(c=>c.tg&&!c.only).flatMap(c=>c.tg.map(o=>o[1])))]});
TOOLS.grill.main="m"; // Doneness and Thickness depend on the meat (key m), not on key t

/* ---- "Good to know": short notes for people who are learning, shown under the recipe. LEARN[tool][option] = lines ---- */
const LEARN={
bbq:{shoulder:["The stall: around 70 °C the meat sweats as fast as it heats, so the temperature sits still for an hour or two. Be patient, or wrap it.","Bark is the dark, flavourful crust. It forms when the surface dries in the smoke, so do not open the lid too often."],
 ribs:["Spare ribs have more fat and take longer than baby backs. Use the bend test, not the clock.","Remove the thin membrane on the bone side: slide a knife under it and pull it off with a paper towel."],
 brisket:["Brisket is two muscles with a seam of fat. Cook it fat side up if your heat comes from below.","Resting is half the job. Slice across the grain, and the meat is far more tender."],
 chicken:["Whole chicken is the easiest first smoke. Keep the cooker a little hotter, around 150 °C, so the skin crisps.","Always check the temperature in the thickest part of the thigh and the breast, and not by colour."],
 lamb:["Lamb shoulder is forgiving, with plenty of fat, and it likes rosemary, garlic and a little lemon.","When it pulls apart with a fork, it is done."],
 baby:["Baby backs are leaner and shorter than spare ribs, so they cook faster and dry out sooner.","Do not boil ribs first. Low heat and time is what makes them tender."],
 short:["Short ribs are rich and fatty, and they love salt, pepper and oak smoke.","They are done by feel: the probe should slide in with no resistance."],
 turkey:["A bone-in breast stays juicier than a boneless one. Brining it first helps too.","Pull it out the moment the thickest part reaches 74 °C. A few degrees more and it turns dry."]},
cure:{pancetta:["Salt draws water out of the meat so bad bacteria cannot grow, which is the whole idea of curing.","Curing salt (nitrite) is optional. It keeps the meat pink and adds a safety margin, and it works in tiny amounts, so weigh it exactly and keep it labelled and away from the table salt. Salt only is how it was done for centuries, so you can go either way.","Weigh the meat when it starts to hang. Losing the right share of its weight is the sign it is ready, not the calendar."],
 italian:["Fat makes sausage juicy. Too lean, and it will be dry and crumbly.","Keep everything cold. If the fat warms and smears, the sausage turns greasy and dull. Put the bowl in the freezer for 10 minutes if it warms up.","A tiny test patty before stuffing saves a whole batch."],
 brat:["The cold milk keeps the mix moist and helps it hold together.","Cook bratwurst gently. A hard sear on high heat splits the casing."],
 cevapi:["The baking soda and cold fizzy water make ćevapi light and springy, and the overnight rest lets the garlic and salt work through.","No casing needed, so you can start with a batch of 1 kg and shape them the same afternoon."],
 salami:["Salami is meat, fat and salt, dried slowly. The salt and the lost water keep it safe.","Weigh each salami and write the weight on a tag. It is ready when it has lost the right share of its weight, so scales matter more than a calendar.","Dry on the outside and wet on the inside is called case hardening. Keep the humidity up, so the surface does not dry first."],
 snack:["Snack sticks are thin, so they cook through and dry fast. The ice-cold water keeps the fat from smearing.","The wrinkled casings after the ice bath are normal. They plump up as they sit at room temperature."],
 bacon:["Bacon is a dry cure. Salt and sugar draw out water, and the belly firms up in the fridge.","A thicker belly needs longer in the cure, so go by thickness and not by the weight.","Slice it cold, and cook it slowly so the fat renders before it browns."],
 jerky:["Drying takes out the water so bacteria cannot grow. Thinner, leaner strips dry faster and keep better.","Jerky is not meant to be sticky or wet inside. If it is still soft in the middle, dry it for longer.","Eat it within a couple of weeks at room temperature, and refrigerate or freeze the rest."]},
dairy:{yogurt:["Heating the milk to 82 °C changes its whey proteins, so the yogurt sets thicker and smoother.","The milk must be warm, not hot, when you add the starter: above 45 °C it kills the cultures.","Runny? It was probably too cool or too short. Keep it warm a few hours longer next time."],
 labneh:["Labneh is yogurt with the whey drained off, so it keeps longer and is thick enough to roll into balls.","The whey is good in bread dough, smoothies or soup."],
 paneer:["Acid makes the milk proteins clump. Add it slowly and stop when the whey turns clear.","Pressing longer gives a firmer paneer that holds its shape in curries and on the grill."],
 kefir:["Kefir grains are not grains of wheat. They are a gelatinous mix of bacteria and yeast that grows with every batch.","Too sour or thick? Strain sooner or use more milk. It gets fizzy and tangy the longer it ferments.","Clean jars and a sniff test are all you need: it should smell fresh and sour, never rotten."],
 cottage:["This is the fast acid method. Traditional cottage cheese is cultured and takes much longer.","Small, firm curds come from gentle heat. Boiling makes them rubbery."],
 cream:["Straining removes whey and leaves the fat and protein, which is what makes cream cheese thick.","Use it for cheesecake, bagels and frostings. It freezes poorly, so make what you will use in two weeks."],
 kajmak:["Kajmak is the skin that forms on hot milk, collected over time. It is related to clotted cream.","Keep it cold and covered, and eat it within two weeks."],
 butter:["Cream is an emulsion of fat in water. Beating it breaks the emulsion and the fat clumps into butter.","Washing out every bit of buttermilk is what makes butter keep. Squeeze and rinse until the water runs clear."]},
cheese:{mozz:["Stretching in hot water lines up the proteins into long threads, which is why mozzarella is chewy.","If the curd will not stretch, it is usually too acidic or too cool. Reheat the water."],
 halloumi:["Halloumi is simmered in whey, which is why it holds its shape on a grill.","Cooking it in dry heat until golden is the best way to eat it."],
 feta:["Brine does two jobs: it seasons the cheese and protects it while it ripens.","Too salty? Soak the cubes in plain water or milk for an hour."],
 ricotta:["Ricotta means 'recooked': it was once made from the whey left over from other cheeses.","Do not stir after adding the acid, or the curds break up too small."],
 sir:["This cheese sets from the acid that bacteria make as the milk sours, so there is no rennet.","Drain it longer for a drier, crumblier cheese, good for pita, burek and pogaca."],
 queso:["Queso fresco is eaten young and fresh. It softens but does not melt, so it is for crumbling.","Keep it cold and eat it within the week."],
 gouda:["Rennet makes the curd, the press squeezes out whey and the brine adds salt and a rind. Each step shapes the final cheese.","Keep the cheese cool, damp and clean while it ages. A little surface mould is normal; wipe it with salty water.","If it smells off, feels slimy or shows pink or black mould, do not eat it. Use common sense, and you will be fine."]},
starter:{blackgarlic:["Black garlic is made by the slow browning of sugars and amino acids, called the Maillard reaction, over weeks of gentle heat. It does not ferment.","If the bulbs are still pale and sharp after a month, the heat was too low. If they are dry and burnt, it was too high."],
 shio:["Koji is a mould, Aspergillus oryzae, that has been used for centuries to make miso, soy sauce and sake. It is safe, and it is not the same as mould that grows by accident.","Keep the jar clean. If you see fuzzy pink, green or black growth, or it smells rotten, throw it away. Good shio koji smells sweet.","Because it contains salt, you can use it in place of salt in marinades, soups and dressings."],
 sour:["A starter is flour and water with wild yeast and bacteria. Feeding it every day keeps them growing.","Do not panic if nothing happens for days 2–4. That is normal, and it often wakes up after that."],
 ginger:["The yeast on the ginger skin eats the sugar and makes the bubbles.","If it stops fizzing, feed it ginger and sugar every day and keep it warm."],
 wkefir:["Water kefir grains are a different culture from milk kefir. They like sugar water, not milk.","They multiply slowly, so share the extras with a friend."],
 komb:["A SCOBY is a mat of bacteria and yeast. The tea and sugar feed it and the acid it makes keeps the drink safe.","Warmer rooms ferment faster and get sour sooner, so taste often."],
 kvass:["Kvass is a lightly fermented bread drink with a long history across Eastern Europe.","Fizz comes from the sugar and yeast, so it can build up pressure in a closed bottle. Open it daily."],
 tepache:["The sweet water pulls wild yeast off the pineapple skin and they make the fizz.","If you see fuzzy mould or smell something rotten, throw it away and start again."]}};
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
