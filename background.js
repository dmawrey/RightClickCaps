chrome.contextMenus.create({
    "id": "convertToUppercase",
    "title": chrome.i18n.getMessage("prompt_for_caps"),
    "contexts": ["editable"]
});

chrome.contextMenus.create({
    "id": "convertToLowercase",
    "title": chrome.i18n.getMessage("prompt_for_lowercase"),
    "contexts": ["editable"]
});

chrome.contextMenus.create({
    "type": "separator",
    "contexts": ["editable"]
});

chrome.contextMenus.create({
    "id": "convertToSentenceCase",
    "title": chrome.i18n.getMessage("prompt_for_sentence_case"),
    "contexts": ["editable"]
});

chrome.contextMenus.create({
    "id": "convertToTitleCase",
    "title": chrome.i18n.getMessage("prompt_for_title_case"),
    "contexts": ["editable"]
});

// sends messages to the content script
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var itemId = info.menuItemId;
    var selectionText = info.selectionText;

    chrome.tabs.sendMessage(tab.id, {
        "operationToPerform": itemId,
        "selectedText": selectionText
    });
});