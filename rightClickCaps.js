// the current text area used for the selection and insertion of text
var textArea = null;

// whether or not the selection should be kept after altering text
var keepSelection;

// attempt to load the stored value for keepSelection
chrome.storage.sync.get({
    selectContent: true
}, function (items) {
    keepSelection = items.selectContent;
});

// updates the active textArea when the right mouse button is pressed
document.addEventListener("mousedown", function (event) {
    if (event.button === 2) {
        textArea = event.target;
    }
}, true);

// inserts the given string into the active element
function insertAtCaret(text) {
    // for HTML elements with a value attribute
    if (textArea.value !== undefined) {
        var scrollPos = textArea.scrollTop;
        var strPos = textArea.selectionStart;
        var textLen = textArea.selectionEnd - textArea.selectionStart;

        var front = (textArea.value).substring(0, strPos);
        var back = (textArea.value).substring(strPos + textLen, textArea.value.length);
        textArea.value = front + text + back;
        strPos = strPos + text.length;

        if (keepSelection)
            textArea.selectionStart = strPos - textLen;
        else
            textArea.selectionStart = strPos;
        textArea.selectionEnd = strPos;
        textArea.focus();
        textArea.scrollTop = scrollPos;
    }
    // for HTML elements without a value attribute
    else {
        var sel, range;

        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            var el = document.createElement("div");
            el.innerHTML = text;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            var firstNode = frag.firstChild;
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                if (keepSelection) {
                    range.setStartBefore(firstNode);
                } else {
                    range.collapse(true);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
}

// converts the given string to lowercase and returns it
function convertToUppercase(text) {
    text = text.toUpperCase();

    return text;
}

// converts the given string to lowercase and returns it
function convertToLowercase(text) {
    text = text.toLowerCase();

    return text;
}

// attempts capitalize the given string as if it were a sentence, then returns it
function convertToSentenceCase(text) {
    text = text.toLowerCase();

    var textWords = cleanSplit(text.split(/(\W)/));
    var result = "";

    // always capitalize the first word of a sentence
    result += capitalizeWord(textWords[0]);

    for (var i = 1; i < textWords.length; i++) {
        var word = textWords[i];
        var lastWord = prevNonSpace(textWords, i);

        if (lastWord && isPunctuation(lastWord)) {
            word = capitalizeWord(word);
        }

        result += word;
    }

    return result;
}

// attempts capitalize the given string as if it were a title, then returns it
function convertToTitleCase(text) {
    text = text.toLowerCase();

    var textWords = cleanSplit(text.split(/(\W)/));
    var result = "";

    // always capitalize the first word of a title
    result += capitalizeWord(textWords[0]);

    for (var i = 1; i < textWords.length; i++) {
        var word = textWords[i];

        if (word.length >= 4) {
            word = capitalizeWord(word);
        }

        result += word;
    }

    return result;
}

// removes empty strings from an array of strings - used to clean string.split
function cleanSplit(words) {
    var result = [];

    for (var i = 0; i < words.length; i++) {
        if (words[i] !== "") {
            result.push(words[i]);
        }
    }

    return result;
}

// returns whether the given string ends with a form of punctuation
function isPunctuation(word) {
    var char = word.substring(word.length - 1);

    return char === "." || char === "?" || char === "!";
}

// returns whether the given string is a word
function isWord(word) {
    return /\w/.test(word);
}

// returns the first non empty string in the given array words starting at index idx and moving backwards.
// returns null if no such value is found.
function prevNonSpace(words, idx) {
    for (var i = idx - 1; i >= 0; i--) {
        if (words[i] !== " ") {
            return words[i];
        }
    }

    return null;
}

// returns the given string with its first letter capitalized
function capitalizeWord(word) {
    if (word.length > 1)
        return word.substr(0, 1).toUpperCase() + word.substr(1);
    else
        return word.toUpperCase();
}

// fixes the trimming that Chrome's context menu 'info.selectionText' automatically performs
function fixTextSelection(text) {
    if (!textArea)
        return text;

    var rawSelection;

    if (textArea.value !== undefined) {
        rawSelection = (textArea.value).substring(textArea.selectionStart, textArea.selectionEnd);
    }
    else {
        rawSelection = window.getSelection().toString();
    }

    if (text !== rawSelection)
        return rawSelection;
    else
        return text;
}

// receives messages from the context menu and performs the correct text operation before inserting
chrome.extension.onMessage.addListener(function (message, sender, callback) {
    var text = fixTextSelection(message.selectedText);

    // stop if no text has been selected
    if (!text)
        return;

    if (message.operationToPerform === "convertToUppercase") {
        text = convertToUppercase(text);
    }
    else if (message.operationToPerform === "convertToLowercase") {
        text = convertToLowercase(text);
    }
    else if (message.operationToPerform === "convertToSentenceCase") {
        text = convertToSentenceCase(text);
    }
    else if (message.operationToPerform === "convertToTitleCase") {
        text = convertToTitleCase(text);
    }
    // stop if unknown operation
    else {
        return;
    }

    insertAtCaret(text);
});