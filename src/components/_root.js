/**
 * Root Variables
 */

// Chrome Local Storage Keys
export const keys = {
  script: "js_runner__script_data",
  actions: "js_runner__actions_data"
}

/**
 * UIkit Notification
 * @param {string} message 
 * @param {string} type 
 * @param {object} settings 
 */
export function UIkitNotification(message = "Title", type = "danger", settings = {}) {
  settings['status'] = type
  if (!settings['isIcon']) { settings['isIcon'] = true }

  if (!settings['isIcon']) {
    return UIkit.notification(message, settings);
  } else {
    var icon = ""
    if (type === "danger") { icon = "ban" }
    else if (type === "success") { icon = "check" }
    else if (type === "warning") { icon = "warning" }

    return UIkit.notification("<span uk-icon='icon: " + icon + "'></span> " + message, settings);
  }
}

/**
 * [Promise]: Get Extension Data
 * @param {string} key
 */
export function getExtensionKeyData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (budget) {
      if (budget[key] != undefined && budget[key] !== "") {
        resolve(budget[key]);
      } else {
        resolve("No Data Found!");
      }
    });
  });
}

/**
 * [Promise]: Set Data in the Extension Local Storage
 * @param {string} key
 * @param {*} key
 */
export function setExtensionKeyData(key, value) {
  return new Promise((resolve, reject) => {
    try {
      var obj = {};
      obj[key] = value;
      chrome.storage.local.set(obj, function () {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve("Data Saved Successfully.");
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert JS Script to Data URL
 * @param {string} jScript 
 */
export function generateScriptDataUrl(jScript) {
  var b64 = 'data:text/javascript';
  try {
    b64 += (';base64,' + btoa(jScript));
  }
  catch (e) {
    b64 += (';charset=utf-8,' + encodeURIComponent(jScript));
  }
  return b64;
}