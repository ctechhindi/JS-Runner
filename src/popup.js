import './popup.css'
import * as monaco from 'monaco-editor'
const { version } = require('./manifest.json');

export const localKey = {
  script: "js-runner-script-data"
}

export const store = {
  // Tab Information
  tab: getTabInformation(),
  // Filter Name
  scriptFilters: ["Custom", "System"],
  // Script Data
  scriptData: {
    "system-script-1": {
      "name": "System JS Script",
      "description": "Pre-define javascript script in chrome extension.",
      "code": "// Pre-Define Javascript Code",
      "filter": "System",
      "lastUpdate": "2020-8-13",
    }
  },
};

export const editor = {
  obj: false
}

// HTML Element
export const el = {
  appVersion: document.getElementById("app_version"),
  homeSwitch: document.getElementById("home_switcher"),
  // New Script Tab
  isUpdate: document.getElementById("isUpdate"),
  scriptName: document.getElementById("scriptName"),
  scriptDes: document.getElementById("scriptDescription"),
  // Script List
  scripFilters: document.getElementById("script_filters_li"),
  scriptList: document.getElementById("script_list_li"),
  // About Tab
  currentYear: document.getElementById("currentYear"),
}

// UIkit Notification
export function UIkitNotification(message = "Title", type = "danger", settings = {}) {
  settings['status'] = type
  if (!settings['isIcon']) { settings['isIcon'] = true }

  if (!settings['isIcon']) {
    return UIkit.notification(message, settings);
  } else {
    var icon = ""
    if (type === "danger") { icon = "close" }
    else if (type === "success") { icon = "check" }
    else if (type === "warning") { icon = "warning" }

    return UIkit.notification("<span uk-icon='icon: " + icon + "'></span> " + message, settings);
  }
}

/**
 * Execute Script in the Active Tab Page
 * @param {string} code 
 */
export function tabExecuteScript(code) {
  chrome.tabs.executeScript(parseInt(store.tab.tabID), {
    code: code
  }, (callback) => {
    if (chrome.runtime.lastError) {
      console.error("inspect -> chrome.runtime.lastError", chrome.runtime.lastError.message);
      UIkitNotification("Reload Active Tab", "danger", { pos: "bottom-right" })
    } else {
    }
  });
}

/**
 * Get Tab Information [tabID, tabURL]
 */
export function getTabInformation() {
  var pageURL = window.location.search.substring(1);
  var pageURLArray = pageURL.split("&");

  if (pageURLArray.length <= 0) { return false; }

  var tabParam = []
  pageURLArray.forEach(param => {
    var par = param.split("=");
    tabParam[par[0]] = par[1]
  });

  return tabParam
}

/**
 * Render HTML Script Filter List
 */
export function renderScriptFiltersList() {
  if (typeof (store.scriptFilters) !== "object") {
    return UIkitNotification("Invalid Script Filters Data", "danger")
  } else if (store.scriptFilters.length <= 0) {
    return UIkitNotification("Script Filters Data not Found.", "warning")
  }

  var allHTML = '<li class="uk-active" uk-filter-control><a href="#">All</a></li>'
  for (let index = 0; index < store.scriptFilters.length; index++) {
    const name = store.scriptFilters[index];
    const html = '\
      <li uk-filter-control=".tag-'+ name.toLocaleLowerCase() + '"><a href="#">' + name + '</a></li> \
    ';
    allHTML += html
  }

  allHTML += '<li uk-filter-control="sort: data-date"><a href="#">Ascending</a></li> <li uk-filter-control="sort: data-date; order: desc"><a href="#">Descending</a></li>'
  if (allHTML !== "") {
    el.scripFilters.innerHTML = allHTML
  }
}

/**
 * Render HTML Script List
 */
export function renderScriptList() {
  if (typeof (store.scriptData) !== "object") {
    return UIkitNotification("Invalid Script Data", "danger")
  } else if (Object.keys(store.scriptData).length <= 0) {
    return UIkitNotification("Script Data not Found.", "warning")
  }

  var allHTML = ""
  for (let index = 0; index < Object.keys(store.scriptData).length; index++) {
    const keyName = Object.keys(store.scriptData)[index];
    if (store.scriptData[keyName] !== undefined) {
      var scriptData = store.scriptData[keyName]
      allHTML += renderScriptList_Template(scriptData)
    }
  }

  if (allHTML !== "") {
    el.scriptList.innerHTML = allHTML
  }

  // Add Event: Edit Button
  var editElm = document.getElementsByClassName("script_list_edit");
  if (editElm.length > 0) {
    for (let i = 0; i < editElm.length; i++) {
      const element = editElm[i];
      element.addEventListener('click', scriptEdit);
    }
  }

  // Add Event: Delete Button
  var delElm = document.getElementsByClassName("script_list_delete");
  if (delElm.length > 0) {
    for (let ii = 0; ii < delElm.length; ii++) {
      const element = delElm[ii];
      element.addEventListener('click', scriptDelete);
    }
  }
}

/**
 * Return HTML Template
 * @param {object} data 
 */
export function renderScriptList_Template(data) {
  var template = '<li class="tag-' + data.filter.toLocaleLowerCase() + '" data-date="' + data.lastUpdate + '"> \
    <div class="uk-card uk-card-secondary uk-card-hover uk-card-body uk-card-small uk-light"> \
      <div class="uk-card-badge uk-label" style="'+ ((data.filter !== "System") ? "background-color: deepskyblue; color: white;" : "") + '">' + data.filter + '</div> \
      <h3 class="uk-card-title">'+ data.name + '</h3> \
      <p>'+ data.description + '</p>';


  if (data.filter === "System") {
    template += '<hr class="uk-divider-small"> \
      <ul class="uk-iconnav"> \
        <li title="Last Update">'+ data.lastUpdate + '</li> \
      </ul>';
  } else {
    template += '<hr class="uk-divider-small"> \
      <ul class="uk-iconnav"> \
        <li><a uk-icon="icon: file-edit" data-name="'+ data.name + '" class="script_list_edit"></a></li> \
        <li><a uk-icon="icon: trash"  data-name="'+ data.name + '" class="script_list_delete"></a></li> \
      </ul>';
  }

  template += '</div></li>';

  return template
}

/**
 * Save Script Data
 */
export function saveScriptData() {
  if (!el.scriptName.value) {
    return UIkitNotification("Enter Script Name", "warning")
  } else if (editor.obj === undefined || editor.obj === false) {
    return UIkitNotification("Error: Editor not Implement", "warning")
  } else if (!editor.obj.getId()) {
    return UIkitNotification("Error: Editor not Implement", "warning")
  } else if (!editor.obj.getValue()) {
    return UIkitNotification("Enter Script in the Editor", "warning")
  }

  var sData = {
    "name": el.scriptName.value,
    "description": el.scriptDes.value,
    "code": editor.obj.getValue(),
    "filter": "Custom",
    "lastUpdate": todayDate(), // Date Format: 2016-12-13
  }

  if (store.scriptData[el.scriptName.value] === undefined) {

    // Save New Script
    store.scriptData[el.scriptName.value] = sData
    UIkitNotification("Your script has been saved.", "success")

  } else {
    // Update New Script
    if (!el.isUpdate.value) {
      // Show Confirm Box
      var is = confirm("Your script already exists, do you want to update it?");
      if (is) {

        UIkit.notification.closeAll()

        store.scriptData[el.scriptName.value] = sData
        UIkitNotification("Your script has been updated.", "success", { pos: "bottom-right" })

        // Set Update Value in the Input
        el.isUpdate.value = 1
      }
    } else {
      UIkit.notification.closeAll()
      
      //  Update Script Without Show Confirm Box
      store.scriptData[el.scriptName.value] = sData
      UIkitNotification("Your script has been updated.", "success", { pos: "bottom-right" })
    }
  }

  // Store Script Data
  storeScriptData()
}

/**
 * Store Script Data in the Browser Local Storage
 */
export function storeScriptData() {
  localStorage.setItem(localKey.script, JSON.stringify(store.scriptData))
}

/**
 * Restore Script Data in the Browser Local Storage
 */
export function restoreScriptData() {
  var data = localStorage.getItem(localKey.script)
  if (!data) { return false }
  data = JSON.parse(data)
  if (!data) { return false }

  // Set data
  store.scriptData = data
}

restoreScriptData()

/**
 * Clear Script Data
 */
export function clearScriptData() {
  el.scriptName.value = ""
  el.scriptDes.value = ""
  el.isUpdate.value = null
  editor.obj.setValue("")
}

/**
 * Reset Script Data
 */
export function resetScriptForm() {
  if (!el.isUpdate.value && editor.obj.getValue()) {
    var is = confirm("Your script not saved, do you want to save it?");
    if (is) {
      saveScriptData();
    } else {
      clearScriptData();
    }
  } else {
    clearScriptData();
  }
}

/**
 * Re-render/Refresh Script List
 */
export function refreshScriptList() {
  renderScriptFiltersList()
  renderScriptList()
}

/**
 * Script Edit
 * @param {*} e 
 */
export function scriptEdit(e) {
  e.preventDefault();
  if (!this.getAttribute("data-name")) { return false }
  var index = this.getAttribute("data-name")
  if (store.scriptData[index] === undefined) { return false }
  var data = store.scriptData[index]

  el.isUpdate.value = "1"
  el.scriptName.value = data.name
  el.scriptDes.value = data.description
  editor.obj.setValue(data.code)

  // Go to First Switcher
  UIkit.switcher(el.homeSwitch).show(0);
}

/**
 * TODO: Script Delete
 * @param {*} e 
 */
export function scriptDelete(e) {
  e.preventDefault();
  if (!this.getAttribute("data-name")) { return false }
  var index = this.getAttribute("data-name")
  if (store.scriptData[index] === undefined) { return false }

  var is = confirm("Are you sure delete this script.")
  if (is) {
    delete store.scriptData[index];

    storeScriptData()
    refreshScriptList()
  }
}

/**
 * Return Today Date [2016-12-13]
 */
export function todayDate() {
  var today = new Date();
  var dd = String(today.getDate()) // .padStart(2, '0');
  var mm = String(today.getMonth() + 1) // .padStart(2, '0');
  var yyyy = today.getFullYear();
  return yyyy + '-' + mm + '-' + dd;
}

// Render Script List HTML
renderScriptFiltersList()
renderScriptList()

// App Version
el.appVersion.innerHTML = "V." + version
el.currentYear.innerHTML = new Date().getFullYear()

// Add Click Event 
document.getElementById("saveScript").addEventListener("click", saveScriptData);
document.getElementById("resetScript").addEventListener("click", resetScriptForm);
document.getElementById("refresh_script_list").addEventListener("click", refreshScriptList);

// Editor
editor.obj = monaco.editor.create(document.getElementById('jsEditor'), {
  value: ['// Javascript Code'].join('\n'),
  language: 'javascript',
  automaticLayout: true,
  mouseWheelZoom: true,
  tabSize: 2,
  theme: "vs-dark", // 'vs' | 'vs-dark' | 'hc-black'
  // fontSize: 23,
  wordWrap: "on",
});

// Save
editor.obj.addAction({
  id: 'save-file',
  label: 'Save File',
  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S], // KEY_C, F10
  precondition: null,
  keybindingContext: null,
  contextMenuGroupId: 'navigation',
  contextMenuOrder: 1.5,
  run: function (ed) {
    if (ed !== undefined && ed.getValue() !== undefined && ed._domElement.id !== undefined) {
      // {@call}: Save file
      saveScriptData()
      tabExecuteScript(ed.getValue())
    } else {
      console.error("Editor Model Not Found.");
    }
  }
});

// Tab Space
editor.obj.addAction({
  id: 'tab-space',
  label: 'Tab Space',
  precondition: null,
  keybindingContext: null,
  contextMenuGroupId: 'navigation',
  contextMenuOrder: 1.5,
  run: function (ed) {
    var value = prompt("Enter Tab Space Value: ", 2);
    if (value !== "") {
      ed.getModel().updateOptions({ tabSize: value })
    }
  }
});

// Press F11
editor.obj.addCommand(monaco.KeyCode.F11, function () {
  var el = document.getElementById('jsEditor')
  if (el.className === "editorNormal") {
    el.className = "editorFullScreen"
  } else {
    el.className = "editorNormal"
  }
});

window.onresize = function () {
  // editor.obj.layout();
};
