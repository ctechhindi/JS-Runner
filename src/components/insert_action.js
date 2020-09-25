/**
 * Insert New Action
 */
import { keys, UIkitNotification, getExtensionKeyData, setExtensionKeyData } from './_root'

// HTML Element
const el = {
  addBtn: document.getElementById("add_new_action_btn"),
  // Add New Actions
  siteType: document.getElementById("site_type"),
  siteMatchType: document.getElementById("site_match_type"),
  siteUrl: document.getElementById("site_url"),
  trigger: document.getElementById("trigger"),
  triggerType: document.getElementById("trigger_type"),
  scripts: document.getElementById("scripts"),
  updateKey: document.getElementById("action_update_key"),
  // Save Button
  saveBtn: document.getElementById("save_action_btn"),
  // Action List
  actionNF: document.getElementById("action_not_found"),
  actionTable: document.getElementById("action_table"),
  actionTableTr: document.getElementById("action_table_tr"),
}

// All Action Data
var actionData = []

/**
 * Action: onChange
 */
function changeTriggerElm() {
  // automatically, manually
  if (this.value === "automatically") {
    el.triggerType.style.display = "block"
  } else {
    el.triggerType.style.display = "none"
  }
}

/**
 * Action: onClick
 */
async function crateAllScriptOptionList() {
  var out = await getExtensionKeyData(keys.script)
  return new Promise((resolve, reject) => {
    if (out === "No Data Found!") {
      // Hide Table
      el.actionTable.style.display = 'none'
      console.error("Script Data not Found.");
      reject("Script Data not Found.");
    } else {
      var optionsHTML = '<option value="">Which script will you run?</option>'
      for (let index = 0; index < Object.keys(out).length; index++) {
        const scriptKey = Object.keys(out)[index];
        const scriptName = out[scriptKey].name
        optionsHTML += '<option value="' + scriptKey + '">' + scriptName + '</option>'
      }

      el.scripts.innerHTML = optionsHTML
      setTimeout(() => { resolve() }, 200);
    }
  })
}

/**
 * Save Action
 */
function saveAction() {
  if (!el.scripts.value) {
    return UIkitNotification("Select Script Name", "warning", { pos: "bottom-center" })
  } else if (el.siteMatchType.value === "equal" && !el.siteUrl.value) {
    return UIkitNotification("Enter " + el.siteType.value.toUpperCase() + " Value", "warning", { pos: "bottom-center" })
  } else if (el.siteMatchType.value === "regex" && !el.siteUrl.value) {
    return UIkitNotification("Enter " + el.siteType.value.toUpperCase() + " Value", "warning", { pos: "bottom-center" })
  }

  // Action Data
  var action_data = {
    siteType: el.siteType.value,
    siteMatchType: el.siteMatchType.value,
    siteUrl: el.siteUrl.value,
    trigger: el.trigger.value,
    triggerType: el.triggerType.value,
    scripts: el.scripts.value,
    isActive: true, // ON/OFF
  }

  if (el.updateKey.value !== undefined && el.updateKey.value !== null && el.updateKey.value !== "") {
    // Update Action
    if (actionData[parseInt(el.updateKey.value)] !== undefined) {
      actionData[parseInt(el.updateKey.value)] = action_data
      UIkitNotification("Your action has been updated.", "success", { pos: "bottom-right" })
    }
  } else {
    // New Action
    // Push Data into Action Data
    actionData.push(action_data)
    UIkitNotification("Your action has been saved.", "success", { pos: "bottom-right" })
  }

  renderAllActions()
  setActionData()

  // Hide
  el.actionNF.style.display = 'none'

  UIkit.modal(document.getElementById("add-new-action")).hide();
}

/**
 * Active and De-active Action Data
 * @param {*} e 
 */
async function actionActive(e) {
  e.preventDefault();
  if (!this.getAttribute("data-key")) { return false }
  var index = this.getAttribute("data-key")
  if (actionData[index] === undefined) { return false }

  if (this.checked === false) {
    // Update Action Data
    actionData[index].isActive = false
    this.checked = false
  } else {
    // Update Action Data
    actionData[index].isActive = true
    this.checked = true
  }

  // Save New Action Data
  setActionData()
}

/**
 * Edit Action Data
 * @param {*} e 
 */
async function actionEdit(e) {
  e.preventDefault();
  if (!this.getAttribute("data-key")) { return false }
  var index = this.getAttribute("data-key")
  if (actionData[index] === undefined) { return false }
  var data = actionData[index]

  // Create Script HTML Select Options
  await crateAllScriptOptionList()

  // Action Data
  el.updateKey.value = index
  el.siteType.value = data.siteType
  el.siteMatchType.value = data.siteMatchType
  el.siteUrl.value = data.siteUrl
  el.trigger.value = data.trigger
  el.triggerType.value = data.triggerType
  el.scripts.value = data.scripts

  var event = new Event('change');
  el.trigger.dispatchEvent(event);

  UIkit.modal(document.getElementById("add-new-action")).show();
}

/**
 * Delete Action Data
 * @param {*} e 
 */
function actionDelete(e) {
  e.preventDefault();
  if (!this.getAttribute("data-key")) { return false }
  var index = this.getAttribute("data-key")
  if (actionData[index] === undefined) { return false }

  var is = confirm("Are you sure delete this action.")
  if (is) {
    delete actionData.splice(index, 1);

    setActionData()
    renderAllActions()
  }
}

/**
 * Render HTML: Action Table
 */
function renderAllActions() {
  if (actionData.length > 0) {
    el.actionTable.style.display = 'table'
    var table_tr = ""
    for (let index = 0; index < actionData.length; index++) {
      const action = actionData[index];
      table_tr += '<tr> \
        <td>'+ (index + 1) + '</td>\
        <td>'+ action.siteType.toUpperCase() + '</td>\
        <td>'+ action.siteMatchType.toUpperCase() + '</td>\
        <td>'+ action.siteUrl + '</td>\
        <td><label><input class="uk-checkbox action_table_is_active" type="checkbox" data-key="'+ index + '" '+ ((!action.isActive)? "":"checked") + '></label></td>\
        <td> \
          <ul class="uk-iconnav"> \
            <li><a uk-icon="icon: file-edit" data-key="'+ index + '" class="action_table_edit"></a></li> \
            <li><a uk-icon="icon: trash"  data-key="'+ index + '" class="action_table_delete"></a></li> \
          </ul> \
        </td>\
      </tr>'
    }

    el.actionTableTr.innerHTML = table_tr

    // Add Event: Active Checkbox Button
    var editElm = document.getElementsByClassName("action_table_is_active");
    if (editElm.length > 0) {
      for (let i = 0; i < editElm.length; i++) {
        const element = editElm[i];
        element.addEventListener('change', actionActive);
      }
    }

    // Add Event: Edit Button
    var editElm = document.getElementsByClassName("action_table_edit");
    if (editElm.length > 0) {
      for (let i = 0; i < editElm.length; i++) {
        const element = editElm[i];
        element.addEventListener('click', actionEdit);
      }
    }

    // Add Event: Delete Button
    var delElm = document.getElementsByClassName("action_table_delete");
    if (delElm.length > 0) {
      for (let ii = 0; ii < delElm.length; ii++) {
        const element = delElm[ii];
        element.addEventListener('click', actionDelete);
      }
    }

  } else {
    el.actionTable.style.display = 'none'
    // Show
    el.actionNF.style.display = 'block'
  }
}

/**
 * Get Action Data in the Chrome Local Storage
 */
async function getActionData() {
  var out = await getExtensionKeyData(keys.actions)
  if (out === "No Data Found!") {
    // Hide Table
    el.actionTable.style.display = 'none'
    // Show
    el.actionNF.style.display = 'block'
  } else {
    actionData = out
    renderAllActions()
  }
}

/**
 * Store Action Data in Local Storage
 */
async function setActionData() {
  await setExtensionKeyData(keys.actions, actionData)
}

/**
 * [EVENT]: Click Add New Action Button
 */
function createNewAction() {
  // Reset Update Key
  el.updateKey.value = null
  el.siteUrl.value = ""
  el.trigger.value = "automatically"
  el.scripts.value = ""

  var event = new Event('change');
  el.trigger.dispatchEvent(event);

  // First of all create script options
  crateAllScriptOptionList()
}

// Get Action Data in the Chrome Local Storage
getActionData();

// Event on Action Trigger HTML Element
el.saveBtn.addEventListener("click", saveAction);
el.addBtn.addEventListener("click", createNewAction);
el.trigger.addEventListener("change", changeTriggerElm);