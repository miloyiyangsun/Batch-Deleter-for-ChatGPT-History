// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 开始执行精细的悬停与点击操作...");

/**
 * 创建一个延时函数，用于在两次点击之间等待。
 * @param {number} ms - 等待的毫秒数。
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 按顺序悬停在项目上，点击出现的按钮，然后查找并分析 "Delete" 按钮。
 */
async function complexInteractionSequentially() {
    // 我们要操作的按钮数量。
    const numberOfItems = 3;
    
    // 使用 for 循环来按顺序处理每个项目。
    for (let i = 0; i < numberOfItems; i++) {
        // 第一步：定位 "..." 按钮。
        const optionsButtonSelector = `[data-testid="history-item-${i}-options"]`;
        const optionsButton = document.querySelector(optionsButtonSelector);
        
        if (!optionsButton) {
            console.warn(`⚠️ 第 ${i + 1} 个 "..." 按钮未找到，选择器: ${optionsButtonSelector}`);
            continue; 
        }

        // 第二步：找到需要悬停的父级元素。
        const hoverTarget = optionsButton.closest('a');

        if (!hoverTarget) {
            console.warn(`⚠️ 未能找到第 ${i + 1} 个项目的悬停目标。`);
            continue;
        }

        // 第三步：模拟悬停以显示 "..." 按钮。
        console.log(`[项目 ${i + 1}] 正在悬停，以显示 "..." 按钮...`);
        const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
        hoverTarget.dispatchEvent(hoverEvent);
        await delay(500);

        // 第四步：按下 "..." 按钮以打开菜单。
        console.log(`[项目 ${i + 1}] 正在按下 "..." 按钮以打开菜单...`);
        const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
        optionsButton.dispatchEvent(pointerDownEvent);
        
        // 第五步：等待菜单出现。这是关键！
        await delay(500);

        // 第六步：在整个文档中查找包含 "Delete" 文本的按钮。
        // 我们使用 XPath 来查找文本内容，因为它比 CSS 选择器更强大。
        console.log(`[项目 ${i + 1}] 正在查找 "Delete" 按钮...`);
        const deleteButtonXPath = "//button[contains(., 'Delete')]";
        const deleteButton = document.evaluate(deleteButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // 第七步：如果找到 "Delete" 按钮，就打印它的信息。
        if (deleteButton) {
            console.log(`✅ [项目 ${i + 1}] 成功找到 "Delete" 按钮！详细信息如下:`);
            console.log("  Element:", deleteButton);
            console.log("  Tag Name:", deleteButton.tagName);
            console.log("  Text Content:", deleteButton.innerText.trim());
            console.log("  ID:", deleteButton.id || "无 ID");
            console.log("  Classes:", deleteButton.className || "无 Class");
            console.log("  All Attributes:", deleteButton.attributes);
        } else {
            console.warn(`⚠️ [项目 ${i + 1}] 未能找到 "Delete" 按钮。`);
        }

        // 在处理完一个项目后，可能需要一个动作来关闭当前菜单，以防干扰下一个循环。
        // 一个简单的方法是模拟点击页面的其他地方，或者按 'Escape' 键。
        // 这里我们先假定菜单会自动关闭或不影响后续操作。
        await delay(500);
    }
    
    console.log("✅ 所有操作已执行完毕。");
}

// 运行主函数。
complexInteractionSequentially(); 