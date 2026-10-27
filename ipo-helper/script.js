(() => {
'use strict';
const TRACKER_KEY='ipo-helper.trackers.v2',LEGACY_TRACKER_KEY='ipo-helper.tracker.v1',CHECKLIST_KEY='ipo-helper.checklist.v1';
const form=document.querySelector('#trackerForm'),trackerStatus=document.querySelector('#trackerStatus'),checklistStatus=document.querySelector('#checklistStatus'),results=document.querySelector('#trackerResults'),issueInput=document.querySelector('#issueName'),closeInput=document.querySelector('#closeDate'),allotmentInput=document.querySelector('#allotmentDate');
document.querySelector('#year').textContent=new Date().getFullYear();
function readStorage(key){try{const value=localStorage.getItem(key);return value?JSON.parse(value):null}catch{return null}}
function writeStorage(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function removeStorage(key){try{localStorage.removeItem(key);return true}catch{return false}}
function makeId(){try{if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID()}catch{}return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}
function normalizeTrackers(value){
 const entries=Array.isArray(value)?value:value&&typeof value.name==='string'?[value]:[];
 return entries.filter(item=>item&&typeof item.name==='string'&&item.name.trim()).map(item=>({id:typeof item.id==='string'?item.id:makeId(),name:item.name.trim(),close:typeof item.close==='string'?item.close:'',allotment:typeof item.allotment==='string'?item.allotment:''}));
}
function dateParts(value){
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');if(!match)return null;
 const parts=match.slice(1).map(Number),date=new Date(parts[0],parts[1]-1,parts[2]);
 return date.getFullYear()===parts[0]&&date.getMonth()===parts[1]-1&&date.getDate()===parts[2]?parts:null;
}
function formatDate(value){const parts=dateParts(value);return parts?new Intl.DateTimeFormat(undefined,{year:'numeric',month:'long',day:'numeric'}).format(new Date(parts[0],parts[1]-1,parts[2])):'Not entered'}
function daysFromToday(value){const parts=dateParts(value);if(!parts)return null;const target=new Date(parts[0],parts[1]-1,parts[2]),now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((target-today)/86400000)}
function dateHint(value){
 const count=daysFromToday(value);
 if(count===null)return'Enter an expected allotment date if you want a reminder.';
 if(count>0)return'Expected date is in '+count+(count===1?' day':' days')+', based on your device date.';
 if(count===0)return'Expected date is today, based on your device date.';
 return'Expected date was '+Math.abs(count)+(count===-1?' day':' days')+' ago, based on your device date.';
}
let trackers=normalizeTrackers(readStorage(TRACKER_KEY));
if(!trackers.length){trackers=normalizeTrackers(readStorage(LEGACY_TRACKER_KEY));if(trackers.length)writeStorage(TRACKER_KEY,trackers)}
function addDateRow(list,label,value){
 const wrap=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');
 term.textContent=label;
 const parts=dateParts(value);
 if(parts){const time=document.createElement('time');time.dateTime=value;time.textContent=formatDate(value);detail.append(time)}
 else detail.textContent='Not entered';
 wrap.append(term,detail);list.append(wrap);
}
function renderTrackers(){
 results.replaceChildren();results.hidden=trackers.length===0;
 trackers.forEach(item=>{
  const card=document.createElement('article'),header=document.createElement('div'),heading=document.createElement('h3'),remove=document.createElement('button'),dates=document.createElement('dl'),hint=document.createElement('p');
  card.className='tracker-result';header.className='tracker-top';heading.textContent=item.name;
  remove.type='button';remove.className='tracker-remove';remove.textContent='Remove';remove.dataset.remove=item.id;remove.setAttribute('aria-label','Remove '+item.name+' from tracker');
  header.append(heading,remove);addDateRow(dates,'Issue closes',item.close);addDateRow(dates,'Expected allotment',item.allotment);
  hint.className='muted';hint.textContent=dateHint(item.allotment)+' Confirm all dates with the latest official announcement.';
  card.append(header,dates,hint);results.append(card);
 });
}
renderTrackers();
form.addEventListener('submit',event=>{
 event.preventDefault();
 const data={name:issueInput.value.trim(),close:closeInput.value,allotment:allotmentInput.value};
 if(!data.name){trackerStatus.textContent='Enter an issue name to save dates.';issueInput.focus();return}
 const existing=trackers.findIndex(item=>item.name.toLocaleLowerCase()===data.name.toLocaleLowerCase());
 if(existing>=0)data.id=trackers[existing].id;else data.id=makeId();
 if(existing>=0)trackers[existing]=data;else trackers.push(data);
 const stored=writeStorage(TRACKER_KEY,trackers);renderTrackers();
 trackerStatus.textContent=stored?(existing>=0?'Issue updated in this browser.':'Issue saved in this browser.')+' Verify its dates against the latest official announcement.':'Issue shown for this page only because browser storage is unavailable.';
 form.reset();issueInput.focus();
});
results.addEventListener('click',event=>{
 const button=event.target.closest('[data-remove]');if(!button)return;
 const item=trackers.find(entry=>entry.id===button.dataset.remove);trackers=trackers.filter(entry=>entry.id!==button.dataset.remove);
 const stored=writeStorage(TRACKER_KEY,trackers);renderTrackers();
 trackerStatus.textContent=stored?'Removed '+(item?item.name:'issue')+' from this browser.':'Issue removed for this page only; browser storage could not be changed.';
 const nextButton=results.querySelector('.tracker-remove');if(nextButton)nextButton.focus();else issueInput.focus();
});
document.querySelector('#clearTracker').addEventListener('click',()=>{
 trackers=[];form.reset();renderTrackers();
 const currentCleared=removeStorage(TRACKER_KEY),legacyCleared=removeStorage(LEGACY_TRACKER_KEY),cleared=currentCleared&&legacyCleared;
 trackerStatus.textContent=cleared?'All saved issues cleared from this browser.':'Tracker cleared for this page. Browser storage could not be fully changed.';
 issueInput.focus();
});
const boxes=Array.from(document.querySelectorAll('[data-check]')),savedChecks=readStorage(CHECKLIST_KEY);
if(savedChecks&&typeof savedChecks==='object')boxes.forEach(box=>{box.checked=savedChecks[box.dataset.check]===true});
boxes.forEach(box=>box.addEventListener('change',()=>{
 const state={};boxes.forEach(item=>{state[item.dataset.check]=item.checked});
 checklistStatus.textContent=writeStorage(CHECKLIST_KEY,state)?'Checklist saved in this browser.':'Checklist is available for this page only because browser storage is unavailable.';
}));
})();