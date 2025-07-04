(async () => {
    // Wrap the entire script in a storage call to get the necessary parameters
    chrome.storage.local.get(['deleteCount', 'startHref'], async ({ deleteCount, startHref }) => {

        const count = deleteCount || 1;
        console.log(`🚀Starting deletion script. Will attempt to delete ${count} items.`);
        if (startHref) {
            console.log(`📍 Starting from selected item: ${startHref}`);
        } else {
            console.log(`🏁 No item selected. Starting from the top.`);
        }

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. Reconnaissance phase: Find the exact conversations to delete
        const allLinks = Array.from(document.querySelectorAll('nav[aria-label="Chat history"] a[href^="/c/"]'));
        const allHrefs = allLinks.map(link => link.getAttribute('href'));
        
        let startIndex = 0;
        // If a starting point was selected, find its index
        if (startHref) {
            const foundIndex = allHrefs.indexOf(startHref);
            if (foundIndex !== -1) {
                startIndex = foundIndex;
            } else {
                console.warn(`⚠️ Selected start href "${startHref}" was not found. Defaulting to the top.`);
            }
        }
        
        // Slice the array to get the actual list of hrefs to delete
        const hrefsToDelete = allHrefs.slice(startIndex, startIndex + count);
        
        if (hrefsToDelete.length === 0) {
            console.log("✅ No conversations to delete. The list might be empty or the selection is out of bounds.");
            return;
        }

        console.log(`🎯 Identified ${hrefsToDelete.length} conversations to delete.`);
        console.log(hrefsToDelete);

        // 2. Engagement phase: Loop through the identified targets and delete them
        for (const href of hrefsToDelete) {
            console.log(`---`);
            console.log(`🔥 Deleting: ${href}`);

            const conversationLink = document.querySelector(`a[href="${href}"]`);
            if (!conversationLink) {
                console.warn(`Could not find link for ${href}. It might have been deleted already or the list updated.`);
                continue;
            }

            // Find the '...' button related to this specific link
            const optionsButton = conversationLink.querySelector('button[aria-label="More options"]');
            if (!optionsButton) {
                console.warn(`Could not find the '...' button for ${href}.`);
                // Sometimes the button isn't visible until hover. Let's try to trigger it.
                conversationLink.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
                await delay(200); // Wait a bit for the UI to react
                const buttonAfterHover = conversationLink.querySelector('button[aria-label="More options"]');
                if (!buttonAfterHover) {
                    console.error(`❌ Failed to find the '...' button for ${href} even after hover.`);
                    continue; // Skip to the next one
                }
            }
            
            // Step 1: Hover over the conversation to ensure buttons are visible
            conversationLink.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window, buttons: 1 }));
            await delay(250);

            // Step 2: Use pointerdown on the '...' button to open the menu
            const menuButton = conversationLink.querySelector('button[aria-label="More options"]');
            if(menuButton) {
                menuButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                await delay(250);
            } else {
                console.error(`❌ Could not find menu button for ${href} after hover.`);
                continue;
            }

            // Step 3: Find and click the "Delete" option in the dropdown menu
            const deleteMenuItem = Array.from(document.querySelectorAll('[role="menuitem"]'))
                                       .find(el => el.textContent.trim() === 'Delete');
            if (deleteMenuItem) {
                deleteMenuItem.click();
                await delay(250);
            } else {
                console.error(`❌ Could not find the first "Delete" menu item.`);
                continue;
            }
            
            // Step 4: Find and click the final "Delete" confirmation button
            const confirmationDialog = document.querySelector('[role="dialog"]');
            if (confirmationDialog) {
                const confirmButton = Array.from(confirmationDialog.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Delete');
                if (confirmButton) {
                    console.log('✅ Found confirmation button. Clicking...');
                    confirmButton.click();
                    await delay(1000); // Wait for the deletion to process
                } else {
                    console.error(`❌ Could not find the final confirmation "Delete" button.`);
                }
            } else {
                 console.error(`❌ Could not find the confirmation dialog.`);
            }
        }

        console.log(`🎉 --- Deletion process finished. ---`);
    });
})(); 