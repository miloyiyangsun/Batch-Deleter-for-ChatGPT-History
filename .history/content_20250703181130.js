// This script runs on the page and has access to the DOM.
console.log("🚀 ChatGPT Button Finder is now running on this page!");

// Use a function to make sure the DOM is fully loaded.
// Sometimes scripts can run before the page is fully built.
window.onload = () => {
    // Select all <button> elements on the page.
    // document.querySelectorAll is a powerful method to find elements using CSS selectors.
    const buttons = document.querySelectorAll('button');

    console.log(`✅ Found ${buttons.length} buttons on the page. Details below:`);

    // Loop through each button and log its details.
    buttons.forEach((button, index) => {
        console.log(`--- Button #${index + 1} ---`);
        console.log("Element:", button); // Logs the interactive HTML element itself.
        console.log("Text Content:", button.innerText || "No visible text");
        console.log("ID:", button.id || "No ID");
        console.log("Classes:", button.className || "No classes");
        console.log("All Attributes:", button.attributes);
        console.log("---------------------\n");
    });
}; 