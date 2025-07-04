// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 ChatGPT Button Finder is searching now...");

/**
 * 查找页面上所有可交互的元素，并在控制台中打印出它们的详细信息。
 */
function findAndLogElements() {
    // 这是一个强大的选择器，用于查找所有类似按钮和可交互的元素。
    const selector = 'button, [role="button"], a[href], input, select, textarea, details, [tabindex]:not([tabindex="-1"])';
    const elements = document.querySelectorAll(selector);

    // 过滤掉用户看不见的元素。
    const visibleElements = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });

    console.log(`✅ Found ${visibleElements.length} visible interactive elements on the page. Details below:`);

    // 遍历每个可见的元素并打印其详细信息。
    visibleElements.forEach((element, index) => {
        console.log(`--- Element #${index + 1} ---`);
        console.log("Element:", element); // 打印可交互的 HTML 元素对象本身。
        console.log("Tag Name:", element.tagName);
        console.log("Text Content:", element.innerText.trim() || "No visible text");
        console.log("ID:", element.id || "No ID");
        console.log("Classes:", element.className || "No classes");
        console.log("All Attributes:", element.attributes);
        console.log("---------------------\n");
    });
}

// 运行主函数。
findAndLogElements(); 