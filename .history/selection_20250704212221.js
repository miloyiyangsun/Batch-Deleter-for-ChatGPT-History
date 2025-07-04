(function() {
    'use strict';

    let selectedCheckbox = null;
    const PROCESSED_MARKER = 'selection-processed';

    function injectCustomCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* When hovering over a chat item, show our custom checkbox */
            [data-testid^="history-item-"]:hover .chat-item-checkbox {
                display: block;
                opacity: 0.6;
            }

            /* Style for our custom checkbox */
            .chat-item-checkbox {
                display: none; /* Hidden by default */
                position: absolute;
                left: -28px; /* Position it to the left of the item */
                top: 50%;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                cursor: pointer;
                border: 1px solid #ccc;
                background-color: #fff;
                border-radius: 3px;
            }

            /* Style for the checkbox when it is checked */
            .chat-item-checkbox.checked {
                background-color: #007bff;
                border-color: #007bff;
                opacity: 1;
                display: block; /* Ensure it stays visible when checked */
            }
            
            /* Simple checkmark icon */
            .chat-item-checkbox.checked::after {
                content: '';
                display: block;
                width: 4px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg) translate(-1px, -2px);
                position: absolute;
                left: 5px;
                top: 2px;
            }

            /* Highlight effect for the chat item when checkbox is hovered or item is selected */
            [data-testid^="history-item-"]:has(.chat-item-checkbox:hover),
            [data-testid^="history-item-"]:has(.chat-item-checkbox.checked) {
                background-color: rgba(0, 123, 255, 0.1); /* Light blue highlight */
            }
            
            /* Make sure the parent has a relative position for absolute positioning of checkbox */
            [data-testid^="history-item-"] > div:first-child {
                position: relative;
            }
        `;
        document.head.appendChild(style);
        console.log('Custom CSS for selection injected.');
    }

    function addCheckboxToChatItem(item) {
        if (item.classList.contains(PROCESSED_MARKER)) {
            return;
        }
        item.classList.add(PROCESSED_MARKER);

        const relativeContainer = item.querySelector('div:first-child');
        if (!relativeContainer) return;
        
        const checkbox = document.createElement('div');
        checkbox.className = 'chat-item-checkbox';

        checkbox.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (selectedCheckbox === checkbox) {
                // User clicked the same checkbox again, deselect it
                checkbox.classList.remove('checked');
                selectedCheckbox = null;
                console.log('Selection cleared.');
                // TODO: Clear selection from chrome.storage
            } else {
                // Deselect the previously selected one
                if (selectedCheckbox) {
                    selectedCheckbox.classList.remove('checked');
                }
                // Select the new one
                checkbox.classList.add('checked');
                selectedCheckbox = checkbox;

                const linkElement = item.querySelector('a');
                if (linkElement) {
                    const title = linkElement.textContent;
                    const href = linkElement.getAttribute('href');
                    console.log('Selected item for deletion:', { title, href });
                    // TODO: Save selection to chrome.storage
                }
            }
        });
        
        relativeContainer.appendChild(checkbox);
    }

    function processChatHistory() {
        const chatItems = document.querySelectorAll('[data-testid^="history-item-"]');
        chatItems.forEach(addCheckboxToChatItem);
    }

    // --- Main Execution ---

    console.log('ChatGPT Selection Script Loaded.');
    injectCustomCSS();

    // Initial run to process items already on the page
    processChatHistory();

    // Use MutationObserver to detect when new chat items are loaded (e.g., by scrolling)
    const observer = new MutationObserver((mutations) => {
        let needsProcessing = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                 for (const node of mutation.addedNodes) {
                    // Check if the added node is an element and might contain history items
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('[data-testid^="history-item-"]')) {
                        needsProcessing = true;
                        break;
                    }
                }
            }
             if (needsProcessing) break;
        }
        if (needsProcessing) {
            console.log('DOM changed, re-processing chat history for checkboxes.');
            processChatHistory();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})(); 