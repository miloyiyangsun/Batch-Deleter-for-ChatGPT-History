// This script is injected when the user clicks the extension's popup button.

console.log("🚀 ChatGPT Button Finder is searching now...");

/**
 * Finds all interactive elements on the page and logs their details to the console.
 */
function findAndLogElements() {
    // A powerful selector to find all button-like and interactive elements.
    const selector = 'button, [role="button"], a[href], input, select, textarea, details, [tabindex]:not([tabindex="-1"])';
    const elements = document.querySelectorAll(selector);

    // Filter out elements that are not visible to the user.
    const visibleElements = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });

    console.log(`✅ Found ${visibleElements.length} visible interactive elements on the page. Details below:`);

    // Loop through each visible element and log its details.
    visibleElements.forEach((element, index) => {
        console.log(`--- Element #${index + 1} ---`);
        console.log("Element:", element); // Logs the interactive HTML element itself.
        console.log("Tag Name:", element.tagName);
        console.log("Text Content:", element.innerText.trim() || "No visible text");
        console.log("ID:", element.id || "No ID");
        console.log("Classes:", element.className || "No classes");
        console.log("All Attributes:", element.attributes);
        console.log("---------------------\n");
    });
}

// Run the main function.
findAndLogElements(); 