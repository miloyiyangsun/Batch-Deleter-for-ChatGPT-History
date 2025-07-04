// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 开始执行最终的悬停、点击、等待、再点击的操作...");

/**
 * 创建一个延时函数。
 * @param {number} ms - 等待的毫秒数。
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 轮询查找一个元素，直到找到它或超时。
 * @param {string} selector - 要查找的元素的CSS选择器。
 * @param {number} timeout - 超时时间（毫秒）。
 * @returns {Promise<Element|null>} - 找到的元素或 null。
 */
function waitForElement(selector, timeout = 2000) {
    return new Promise(resolve => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                resolve(null); // 超时，未找到元素。
            }
        }, 100); // 每 100 毫秒检查一次。
    });
}


/**
 * 完整的主流程：悬停、点击选项、等待菜单、记录删除按钮信息。
 */
async function mainFlow() {
    const numberOfItems = 3;
    
    for (let i = 0; i < numberOfItems; i++) {
        console.log(`--- 开始处理第 ${i + 1} 个项目 ---`);
        
        // --- 步骤 1: 悬停并点击 "..." 选项按钮 ---
        const optionsButtonSelector = `[data-testid="history-item-${i}-options"]`;
        const optionsButton = document.querySelector(optionsButtonSelector);
        
        if (!optionsButton) {
            console.warn(`⚠️ 第 ${i + 1} 个项目的选项按钮未找到。`);
            continue;
        }

        const hoverTarget = optionsButton.closest('a');
        if (!hoverTarget) {
            console.warn(`⚠️ 未能找到第 ${i + 1} 个项目的悬停目标。`);
            continue;
        }

        console.log(`[步骤1/3] 正在悬停在第 ${i + 1} 个项目上...`);
        hoverTarget.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
        await delay(500);

        console.log(`[步骤1/3] 正在点击第 ${i + 1} 个项目的选项按钮...`);
        optionsButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        
        // --- 步骤 2: 等待并定位 "Delete" 按钮 ---
        // 我们需要找到一个足够精确的选择器来定位删除按钮。
        // 通过检查元素，我们发现它是一个包含 "Delete" 文本的 <button>。
        // 为了更精确，我们寻找那个红色的垃圾桶图标 <Trash2Icon> 的父按钮。
        // 一个更通用的方法是找到所有菜单项，然后遍历它们找到包含 "Delete" 文本的那个。
        // 这里我们用一个假设的选择器，实际可能需要微调。
        const deleteMenuItemSelector = 'button[class*="danger"]'; // 假设删除按钮有一个含 "danger" 的类
        
        console.log(`[步骤2/3] 正在等待第 ${i + 1} 个项目的删除菜单项出现...`);
        const deleteButton = await waitForElement(deleteMenuItemSelector);
        
        // --- 步骤 3: 记录删除按钮信息 ---
        if (deleteButton) {
            console.log(`[步骤3/3] ✅ 成功找到删除按钮！正在记录其信息:`);
            console.log("  Element:", deleteButton);
            console.log("  Tag Name:", deleteButton.tagName);
            console.log("  Text Content:", deleteButton.innerText.trim() || "No visible text");
            console.log("  ID:", deleteButton.id || "No ID");
            console.log("  Classes:", deleteButton.className || "No classes");
        } else {
            console.warn(`[步骤3/3] ⚠️ 未能找到第 ${i + 1} 个项目的删除按钮（已超时）。`);
        }
        
        console.log(`--- 第 ${i + 1} 个项目处理完毕 ---\n`);
        await delay(500); // 在处理下一个项目前稍作停顿。
    }
    
    console.log("✅ 所有操作已执行完毕。");
}

// 运行主函数。
mainFlow(); 