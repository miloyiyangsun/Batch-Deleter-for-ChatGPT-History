// This script runs in the context of the popup window.

document.getElementById('searchButton').addEventListener('click', async () => {
    // Get the current active tab that the user is looking at.
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Programmatically inject the content.js script into the active tab.
    // The "scripting" permission in manifest.json is required for this.
    // The "host_permissions" in manifest.json ensure this only works on chatgpt.com.
    // If you try this on another site, the console will show an error, which is expected.
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });

    // Optional: Close the popup window after the button is clicked.
    window.close();
}); 