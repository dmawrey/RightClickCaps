// saves options to chrome.storage.sync
function save_options() {
    var selectContent = document.getElementById('selectContent').checked;

    chrome.storage.sync.set({
        selectContent: selectContent,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 2000);
    });
}

// restores values stored in chrome.storage
function restore_options() {
    chrome.storage.sync.get({
        selectContent: true
    }, function (items) {
        document.getElementById('selectContent').checked = items.selectContent;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);