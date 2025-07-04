// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 开始执行顺序点击操作...");

/**
 * 创建一个延时函数，用于在两次点击之间等待。
 * @param {number} ms - 等待的毫秒数。
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 按顺序查找并点击三个历史项目按钮。
 */
async function clickButtonsSequentially() {
    // 我们要点击的按钮数量。
    const numberOfButtons = 3;
    
    // 使用 for 循环来按顺序处理每个按钮。
    for (let i = 0; i < numberOfButtons; i++) {
        // 构建我们精确的 'data-testid' 选择器。
        const selector = `[data-testid="history-item-${i}-options"]`;
        
        console.log(`正在查找按钮 #${i + 1}，使用选择器: ${selector}`);
        
        // 使用 document.querySelector 查找按钮。
        const button = document.querySelector(selector);
        
        // 检查按钮是否存在，以确保程序的健壮性。
        if (button) {
            console.log(`✅ 成功找到按钮 #${i + 1}，正在模拟点击...`);
            button.click(); // 模拟点击。
            
            // 在点击后等待一小段时间，给页面反应时间。
            await delay(500); // 等待 500 毫秒。
        } else {
            console.warn(`⚠️ 未能找到按钮 #${i + 1}。可能是页面结构已改变或该按钮不存在。`);
        }
    }
    
    console.log("✅ 所有点击操作已执行完毕。");
}

// 运行主函数。
clickButtonsSequentially(); 