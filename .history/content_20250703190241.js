// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 开始执行精细的悬停与点击操作...");

/**
 * 创建一个延时函数，用于在两次点击之间等待。
 * @param {number} ms - 等待的毫秒数。
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 按顺序悬停在项目上，点击出现的按钮，然后查找并记录"删除"按钮的信息。
 */
async function hoverAndClickButtonsSequentially() {
    // 我们要操作的按钮数量。
    const numberOfButtons = 3;
    
    // 使用 for 循环来按顺序处理每个按钮。
    for (let i = 0; i < numberOfButtons; i++) {
        // --- 阶段1：悬停并打开菜单 ---
        const optionsButtonSelector = `[data-testid="history-item-${i}-options"]`;
        const optionsButton = document.querySelector(optionsButtonSelector);
        
        if (!optionsButton) {
            console.warn(`⚠️ 第 ${i + 1} 个"选项"按钮未找到，选择器: ${optionsButtonSelector}`);
            continue; // 如果按钮不存在，则跳过此次循环。
        }

        const hoverTarget = optionsButton.closest('a');
        if (!hoverTarget) {
            console.warn(`⚠️ 未能找到第 ${i + 1} 个按钮的悬停目标。`);
            continue;
        }

        console.log(`[步骤 1/4] 正在悬停在第 ${i + 1} 个项目上...`);
        const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
        hoverTarget.dispatchEvent(hoverEvent);
        await delay(500); // 等待UI更新

        console.log(`[步骤 2/4] 正在对第 ${i + 1} 个"选项"按钮执行 pointerdown 操作以打开菜单...`);
        const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
        optionsButton.dispatchEvent(pointerDownEvent);
        
        // --- 阶段2：查找并记录"删除"按钮 ---
        await delay(500); // 等待菜单出现

        console.log(`[步骤 3/4] 正在查找第 ${i + 1} 项对应的"删除"按钮...`);
        const deleteButtonSelector = '[data-testid="delete-chat-menu-item"]';
        const deleteButton = document.querySelector(deleteButtonSelector);

        if (deleteButton) {
            console.log("  └─ ✅ 成功找到"删除"按钮！正在记录信息并准备点击...");
            console.log("    ├─ Element:", deleteButton);
            console.log("    ├─ Tag Name:", deleteButton.tagName);
            console.log("    ├─ Text Content:", deleteButton.innerText.trim() || "No visible text");
            console.log("    ├─ ID:", deleteButton.id || "No ID");
            console.log("    ├─ Classes:", deleteButton.className || "No classes");
            console.log("    └─ All Attributes:", deleteButton.attributes);

            console.log(`[步骤 4/4] 正在对"删除"按钮执行 pointerdown 操作...`);
            const deletePointerDownEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            deleteButton.dispatchEvent(deletePointerDownEvent);
        } else {
            console.warn('  └─ ⚠️ 未能找到"删除"按钮。');
        }
        
        // 在处理完一个项目后，等待一下，让后续的对话框(如果有)有时间出现。
        await delay(1000);
    }
    
    console.log("✅ 所有操作已执行完毕。");
}

// 运行主函数。
hoverAndClickButtonsSequentially(); 