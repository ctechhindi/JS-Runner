// Background JS

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.windows.getCurrent(function (tab) {
      parentWindowId = tab.id
    });
    // Open Popup.html Page
    // window.open(chrome.extension.getURL("popup/popup.html?tabID=" + encodeURIComponent(tab.id) + "&tabURL=" + encodeURIComponent(tab.url)),"Table Scraper","toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=720,height=650")
    window.open(chrome.extension.getURL("popup.html?tabID=" + encodeURIComponent(tab.id) + "&tabURL=" + encodeURIComponent(tab.url)))
  });