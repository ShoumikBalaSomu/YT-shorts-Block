document.addEventListener('DOMContentLoaded', async function() {
  var tbtn=document.getElementById('tbtn'),sd=document.getElementById('sd'),slbl=document.getElementById('slbl'),sc=document.getElementById('sc');
  var sr=document.getElementById('sr'),srd=document.getElementById('srd'),stime=document.getElementById('stime');
  var data=await chrome.storage.local.get({enabled:true,removed:0,redirects:0});
  var enabled=data.enabled;
  function updateUI(){
    if(enabled){tbtn.classList.remove('off');sd.classList.add('active');slbl.textContent='Protection Active';sc.classList.remove('inactive');}
    else{tbtn.classList.add('off');sd.classList.remove('active');slbl.textContent='Protection Disabled';sc.classList.add('inactive');}
    sr.textContent=data.removed.toLocaleString();
    srd.textContent=data.redirects.toLocaleString();
    var mins=Math.round((data.removed*30)/60);
    stime.textContent=mins<60?mins+'m':Math.round(mins/60)+'h '+(mins%60)+'m';
  }
  updateUI();
  tbtn.addEventListener('click',async function(){
    enabled=!enabled;
    await chrome.storage.local.set({enabled:enabled});
    try{if(enabled){await chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds:['shorts_block_rules']});}else{await chrome.declarativeNetRequest.updateEnabledRulesets({disableRulesetIds:['shorts_block_rules']});}}catch(e){}
    updateUI();
  });
  document.getElementById('fbtn').addEventListener('click',function(){chrome.tabs.create({url:'https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues/new'});});
  document.getElementById('gbtn').addEventListener('click',function(){chrome.tabs.create({url:'https://github.com/ShoumikBalaSomu/YT-shorts-Block'});});
  setInterval(async function(){var d=await chrome.storage.local.get({removed:0,redirects:0});data.removed=d.removed;data.redirects=d.redirects;updateUI();},3000);
});
