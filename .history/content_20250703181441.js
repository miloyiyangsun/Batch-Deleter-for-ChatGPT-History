// This script runs on the page and has access to the DOM.
console.log("🚀 ChatGPT Button Finder is now running on this page!");

// Use a function to make sure the DOM is fully loaded.
// Sometimes scripts can run before the page is fully built.
window.onload = () => {
    // A more powerful selector to find all button-like and interactive elements.
    const selector = 'button, [role="button"], a[href], input, select, textarea, details, [tabindex]:not([tabindex="-1"])';
    const elements = document.querySelectorAll(selector);

    console.log(`✅ Found ${elements.length} interactive elements on the page. Details below:`);

    // Loop through each element and log its details.
    elements.forEach((element, index) => {
        console.log(`--- Element #${index + 1} ---`);
        console.log("Element:", element); // Logs the interactive HTML element itself.
        console.log("Tag Name:", element.tagName);
        console.log("Text Content:", element.innerText || "No visible text");
        console.log("ID:", element.id || "No ID");
        console.log("Classes:", element.className || "No classes");
        console.log("All Attributes:", element.attributes);
        console.log("---------------------\n");
    });
}; 