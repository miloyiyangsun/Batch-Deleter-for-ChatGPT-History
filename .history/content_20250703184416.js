// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 开始执行精细的悬停与点击操作...");

/**
 * 创建一个延时函数，用于在两次点击之间等待。
 * @param {number} ms - 等待的毫秒数。
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 按顺序悬停在项目上，然后点击出现的按钮。
 */
async function hoverAndClickButtonsSequentially() {
    // 我们要操作的按钮数量。
    const numberOfButtons = 3;
    
    // 使用 for 循环来按顺序处理每个按钮。
    for (let i = 0; i < numberOfButtons; i++) {
        // 第一步：定位按钮，即使它当前可能不可见。
        const selector = `[data-testid="history-item-${i}-options"]`;
        const button = document.querySelector(selector);
        
        if (!button) {
            console.warn(`⚠️ 第 ${i + 1} 个按钮未找到，选择器: ${selector}`);
            continue; // 如果按钮不存在，则跳过此次循环。
        }

        // 第二步：从按钮向上查找，找到需要悬停的父级元素（整个列表项）。
        // 我们假设这个父级元素是一个 <a> 标签，这是常见的模式。
        const hoverTarget = button.closest('a');

        if (!hoverTarget) {
            console.warn(`⚠️ 未能找到第 ${i + 1} 个按钮的悬停目标。`);
            continue;
        }

        // 第三步：模拟悬停事件，让按钮显示出来。
        console.log(`正在悬停在第 ${i + 1} 个项目上，以显示按钮...`);
        const hoverEvent = new MouseEvent('mouseover', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        hoverTarget.dispatchEvent(hoverEvent);

        // 等待一小段时间，给UI更新留出时间。
        await delay(500);

        // 第四步：创建并派发一个 pointerdown 事件来"按下"按钮。
        console.log(`✅ 正在对第 ${i + 1} 个按钮执行 pointerdown 操作...`);
        const pointerDownEvent = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        button.dispatchEvent(pointerDownEvent);
        
        // 在处理完一个项目后，等待一下再进入下一个。
        await delay(500);
    }
    
    console.log("✅ 所有操作已执行完毕。");
}

// 运行主函数。
hoverAndClickButtonsSequentially(); 