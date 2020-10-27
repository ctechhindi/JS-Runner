import './popup.css'
import * as monaco from 'monaco-editor'
const { version } = require('./manifest.json');
import { keys, UIkitNotification, getExtensionKeyData, setExtensionKeyData } from './components/_root'
import './components/insert_action'

export const store = {
  // Tab Information
  tab: getTabInformation(),
  // Filter Name
  scriptFilters: ["Custom", "System"],
  systemScript: {
    "system-script-1": {
      "name": "Welcome to JS Runner",
      "description": "Pre-define javascript script in chrome extension.",
      "code": "alert('Welcome to CTH - JS Runner')",
      "filter": "System",
      "lastUpdate": "2020-8-13",
    }
  },
  // Script Data
  scriptData: {},
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
  isUpdateKey: document.getElementById("isUpdate_Key"),
  scriptName: document.getElementById("scriptName"),
  scriptDes: document.getElementById("scriptDescription"),
  // Script List
  scripFilters: document.getElementById("script_filters_li"),
  scriptList: document.getElementById("script_list_li"),
  // About Tab
  currentYear: document.getElementById("currentYear"),
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
      allHTML += renderScriptList_Template(scriptData, keyName)
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
 * @param {string} key 
 */
export function renderScriptList_Template(data, key) {
  var template = '<li class="tag-' + data.filter.toLocaleLowerCase() + '" data-date="' + data.lastUpdate + '"> \
    <div class="uk-card uk-card-secondary uk-card-hover uk-card-body uk-card-small uk-light"> \
      <div class="uk-card-badge uk-label" style="'+ ((data.filter !== "System") ? "background-color: deepskyblue; color: white;" : "") + '">' + data.filter + '</div> \
      <h3 class="uk-card-title" title="'+ data.name + '">' + ((data.name.length > 20) ? data.name.substring(0, 20) : data.name) + '</h3> \
      <p>'+ data.description + '</p>';


  if (data.filter === "System") {
    template += '<hr class="uk-divider-small"> \
      <ul class="uk-iconnav"> \
        <li title="Last Update">'+ data.lastUpdate + '</li> \
      </ul>';
  } else {
    template += '<hr class="uk-divider-small"> \
      <ul class="uk-iconnav"> \
        <li><a uk-icon="icon: file-edit" data-name="'+ key + '" class="script_list_edit"></a></li> \
        <li><a uk-icon="icon: trash"  data-name="'+ key + '" class="script_list_delete"></a></li> \
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

  if (!el.isUpdateKey.value) {
    // Save New Script
    // var key = el.scriptName.value.replace(/\s/g,'').toLocaleLowerCase()
    var key = "custom_script_" + Date.now()

    el.isUpdate.value = 1
    el.isUpdateKey.value = key

    // Update Script
    store.scriptData[key] = sData
    UIkitNotification("Your script has been saved.", "success")

  } else {
    // Check `isUpdateKey` Key Exists in the Script Object
    if (store.scriptData[el.isUpdateKey.value] !== undefined) {
      // Update New Script
      if (!el.isUpdate.value) {
        // Show Confirm Box
        var is = confirm("Your script already exists, do you want to update it?");
        if (is) {

          UIkit.notification.closeAll()

          store.scriptData[el.isUpdateKey.value] = sData
          UIkitNotification("Your script has been updated.", "success", { pos: "bottom-right" })

          // Set Update Value in the Input
          el.isUpdate.value = 1
        }
      } else {
        UIkit.notification.closeAll()

        //  Update Script Without Show Confirm Box
        store.scriptData[el.isUpdateKey.value] = sData
        UIkitNotification("Your script has been updated.", "success", { pos: "bottom-right" })
      }
    } else {
      return UIkitNotification("Error Invalid Script Key.", "danger")
    }
  }

  // Store Script Data
  setScriptData()
}

/**
 * Get Script Data in the Chrome Local Storage
 */
export async function getScriptData() {
  var out = await getExtensionKeyData(keys.script)
  if (out === "No Data Found!") {
    let merged = { ...store.scriptData, ...store.systemScript };
    store.scriptData = merged
  } else {
    let merged = { ...store.systemScript, ...out };
    store.scriptData = merged
  }

  // Render Script List HTML
  renderScriptFiltersList()
  renderScriptList()
}

/**
 * Store Action Data in Local Storage
 */
async function setScriptData() {
  await setExtensionKeyData(keys.script, store.scriptData)
}

/**
 * Clear Script Data
 */
export function clearScriptData() {
  el.scriptName.value = ""
  el.scriptDes.value = ""
  el.isUpdate.value = null
  el.isUpdateKey.value = ""
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
  el.isUpdateKey.value = index
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

    setScriptData()
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

// Get Script and Render
getScriptData()

// App Version
el.appVersion.innerHTML = "V." + version
el.currentYear.innerHTML = new Date().getFullYear()

// Add Click Event 
document.getElementById("saveScript").addEventListener("click", saveScriptData);
document.getElementById("resetScript").addEventListener("click", resetScriptForm);
document.getElementById("refresh_script_list").addEventListener("click", refreshScriptList);

// Add Custom Suggestion: JavaScript Language
monaco.languages.registerCompletionItemProvider('javascript', {
  provideCompletionItems: function () {
    return {
      suggestions: [
        {
          label: "alert",
          insertText: "alert()"
        },
        {
          label: "log",
          insertText: "console.log()"
        },
        {
          label: "for",
          insertText: "for (let index = 0; index < array.length; index++) {\n  const element = array[index];\n}"
        },
        {
          label: "foreach",
          insertText: "array.forEach(function (element) {\n});"
        },
        {
          label: "if",
          insertText: "if (condition) {\n\n}"
        }
      ]
    };
  }
});

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

// ON/OFF wordWrap
editor.obj.addAction({
  id: 'word-wrap',
  label: 'On/Off Word Wrap',
  // https://microsoft.github.io/monaco-editor/api/classes/monaco.keymod.html
  keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KEY_Z], // KEY_C, F10
  precondition: null,
  keybindingContext: null,
  contextMenuGroupId: 'navigation',
  contextMenuOrder: 1.5,
  run: function (ed) {
    // Check WordWrap Option Value
    if (ed.getRawOptions().wordWrap === "off") {
      ed.updateOptions({ wordWrap: "on" })
    } else {
      ed.updateOptions({ wordWrap: "off" })
    }
  }
});

// Save
editor.obj.addAction({
  id: 'save-file',
  label: 'Save File',
  // https://microsoft.github.io/monaco-editor/api/classes/monaco.keymod.html
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

// Change Editor Theme: https://editor.bitwiser.in/
editor.obj.addAction({
  id: 'change-theme',
  label: 'Themes',
  precondition: null,
  keybindingContext: null,
  contextMenuGroupId: 'navigation',
  contextMenuOrder: 1.5,
  run: function (ed) {
    var value = prompt("Enter Theme Name: (vs, vs-dark, hc-black)", "vs");
    if (value !== "" && ["vs", "vs-dark", "hc-black"].indexOf(value) !== -1) {
      // Change Editor Theme: vs, vs-dark
      monaco.editor.setTheme(value)
    }
  }
});

// Ctrl + Alt + l = console.log();
editor.obj.addAction({
  id: 'console-log',
  label: 'Console Log',
  precondition: null,
  keybindingContext: null,
  contextMenuGroupId: 'navigation',
  contextMenuOrder: 1.5,
  // https://microsoft.github.io/monaco-editor/api/classes/monaco.keymod.html
  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_L], // KEY_C, F10
  run: function (ed) {
    var selectedText = ed.getModel().getValueInRange(ed.getSelection());
    if (selectedText.trim().length !== 0) {
      var selection = ed.getSelection();
      var range = new monaco.Range(selection.startLineNumber + 1, 0, selection.endLineNumber + 1, 0);
      var text = "";
      for (let index = 1; index < selection.selectionStartColumn; index++) {
        text += " ";
      }
      text += 'console.log("CTH: ' + selectedText + '", ' + selectedText + ')';
      ed.executeEdits("", [{ range: range, text: text + "\n", forceMoveMarkers: true }]);
    }
    return null;
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