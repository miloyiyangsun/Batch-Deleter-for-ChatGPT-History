// 当弹出窗口加载完成后，立即执行此函数以恢复上次的数值
document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('number-to-delete');
    const startButton = document.getElementById('start-delete');

    // Load the saved value when the popup opens
    chrome.storage.local.get(['deleteCount'], (result) => {
        if (result.deleteCount) {
            numberInput.value = result.deleteCount;
        }
    });

    startButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab.url.startsWith("https://chat.openai.com")) {
                 // Optional: Add some user feedback here
                console.warn("This extension only works on chat.openai.com");
                return;
            }

            const deleteCount = parseInt(numberInput.value, 10) || 1;

            // Step 1: Find out which item is selected on the page.
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const selectedLink = document.querySelector('a.chat-item-selected[href^="/c/"]');
                    return selectedLink ? selectedLink.getAttribute('href') : null;
                }
            }, (injectionResults) => {
                // The result from the injected script is in injectionResults.
                const startHref = injectionResults[0].result;

                console.log('Popup script:', { deleteCount, startHref });

                // Step 2: Save the count AND the starting href to storage.
                chrome.storage.local.set({ 
                    deleteCount: deleteCount, 
                    startHref: startHref 
                }, () => {
                    // Step 3: Now that the settings are saved, run the content script.
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    window.close(); // Close the popup
                });
            });
        });
    });
}); 