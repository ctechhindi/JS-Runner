import { keys, getExtensionKeyData, generateScriptDataUrl } from '../components/_root'

// Script Data
var scriptData = {}
// Actions
var actionData = []

/**
 * Get Script Data in the Chrome Local Storage
 */
async function getScriptData() {
  var out = await getExtensionKeyData(keys.script)
  if (out === "No Data Found!") {
    return false
  } else {
    scriptData = out
    var action = await getActionData()
    actionData = action
  }
}

/**
 * Get Action Data in the Chrome Local Storage
 */
async function getActionData() {
  var out = await getExtensionKeyData(keys.actions)
  return new Promise((resolve, reject) => {
    if (out === "No Data Found!") {
      reject(false)
    } else {
      resolve(out)
    }
  })
}

/**
 * Check Tab is Match Active Action Data
 * @param {object} action 
 * @param {number} tabId 
 */
async function checkTabIsMatch(action, tab) {
  return new Promise(async (resolve, reject) => {
    console.log("URL Checking....");
    if (!action.siteType) { return "Action Site Type" } // url, host, path
    else if (!action.siteMatchType) { return "Action Site Match Type" }
    else if (!action.scripts) { return "Action Script" }
    else if (!action.triggerType) { return "Action Trigger Type" } // "beforePage", onPage

    // Check Action Script and Script Code is Exists
    if (!scriptData[action.scripts]) { return "Script Not Found." }
    if (!scriptData[action.scripts].code) { return "Script Code Not Found." }

    // Tab URL
    var tabURL = new URL(tab.url) // host, pathname

    // Generate: On Page Script and Before Page Script
    if (action.triggerType === "onPage") {
      var scriptCode = generateScriptDataUrl(scriptData[action.scripts].code)
      var injectScript = `
        function injectScript(src, where) {
          var elm = document.createElement('script');
          elm.src = src;
          document[where || 'head'].appendChild(elm);
        }
        setTimeout(function () {
          injectScript("`+ scriptCode + `", 'body');
        }, 120);
      `;
    } else {
      var injectScript = scriptData[action.scripts].code
    }

    // Run Script Every Page
    console.log("Ready For: Script Running..");

    if (action.siteMatchType === "all" && action.siteUrl === "") {
      await runScript(tab.id, injectScript)
    } else if (["all", "equal"].indexOf(action.siteMatchType) !== -1 && action.siteUrl !== "") {
      if (action.siteType === "url" && action.siteUrl.toLocaleLowerCase() == tab.url.toLocaleLowerCase()) {
        await runScript(tab.id, injectScript)
      } else if (action.siteType === "host" && action.siteUrl.toLocaleLowerCase() == tabURL.host.toLocaleLowerCase()) {
        await runScript(tab.id, injectScript)
      } else if (action.siteType === "path" && action.siteUrl.toLocaleLowerCase() == tabURL.pathname.toLocaleLowerCase()) {
        await runScript(tab.id, injectScript)
      } else {
        console.error("Site Not Match.", { action: action, open_site: tabURL, })
        return false
      }
    } else {
      console.error("Site Not Match.", { action: action, open_site: tabURL, })
      return false
    }
  })
}

/**
 * RUN Script in the Tab
 * @param {*} tabId 
 * @param {*} code 
 */
async function runScript(tabId, code) {
  return new Promise((resolve, reject) => {
    console.log('%c SCRIPT RUNNING...', 'background: green; color: white; display: block;');
    chrome.tabs.executeScript(tabId, {
      code: code,
      allFrames: true,
      runAt: "document_idle", // document_start, document_end, document_idle
      // file: '',
    }, async function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message)
      } else {
        resolve(true)
      }
    });
  });
}

// Chrome Tab Update Event
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status == "complete") {
    await getScriptData();
    if (actionData.length > 0) {
      for (let index = 0; index < actionData.length; index++) {
        const action = actionData[index];
        // Check Action is Active
        if (action.isActive === true) {
          await checkTabIsMatch(action, tab)
        } else {
          continue
        }
      }
    }
  }
});