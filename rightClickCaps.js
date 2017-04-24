// the current text area used for the selection and insertion of text
var textArea = null;

// updates the active textArea when the right mouse button is pressed
document.addEventListener("mousedown", function(event) {
    if(event.button === 2) {
        textArea = event.target;
    }
}, true);

// inserts the given string into the active element
function insertAtCaret(text) {
    //var textArea = document.activeElement;
    var scrollPos = textArea.scrollTop;
    var strPos = textArea.selectionStart;
    var textLen = textArea.selectionEnd - textArea.selectionStart;

    var front = (textArea.value).substring(0, strPos);
    var back = (textArea.value).substring(strPos + textLen, textArea.value.length);
    textArea.value = front + text + back;
    strPos = strPos + text.length;

    textArea.selectionStart = strPos;
    textArea.selectionEnd = strPos;
    textArea.focus();
    textArea.scrollTop = scrollPos;
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

// attempts to intelligently capitalize the given text, then returns it
function autoCapitalize(text) {
    text = fixTextSelection(text);
    text = text.toLowerCase();

    var textWords = text.split(" ");
    var result = "";

    for (var i = 0; i < textWords.length; i++) {
        var word = textWords[i];
        var lastWord = prevWord(textWords, i);

        if (lastWord && isPunctuation(lastWord)) {
            word = capitalizeWord(word);
        }

        result += word;
        if (i < textWords.length - 1)
            result += " ";
    }

    return result;
}

// returns whether the given string ends with a form of punctuation
function isPunctuation(word) {
    var char = word.substring(word.length - 1);

    return char === "." || char === "?" || char === "!";
}

// returns the first non empty string in the given array words starting at index idx and moving backwards.
// returns null if no such value is found.
function prevWord(words, idx) {
    for (var i = idx - 1; i >= 0; i--) {
        if (words[i] !== "") {
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

    var rawSelection = (textArea.value).substring(textArea.selectionStart, textArea.selectionEnd);

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
    else if (message.operationToPerform === "autoCapitalize") {
        text = autoCapitalize(text);
    }
    else {
        // stop if unknown operation
        return;
    }

    insertAtCaret(text);
});