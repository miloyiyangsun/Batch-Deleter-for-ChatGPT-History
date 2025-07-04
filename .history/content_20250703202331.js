// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

(async () => {
    // 这是一个IIFE（立即调用函数表达式），用于创建私有作用域，避免变量冲突。
    console.log("🚀 启动自动化删除脚本 (V3.1 - 修复点击)...");

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * 主函数：执行所有自动化操作。
     */
    async function runAutomation() {
        // 阶段 1：限定范围并收集处理单元
        const historyContainer = document.getElementById('history');
        if (!historyContainer) {
            console.error("❌ 未能找到ID为 'history' 的容器，脚本无法继续。");
            return;
        }

        const chatItems = Array.from(historyContainer.querySelectorAll('a'));
        const itemsToDelete = chatItems.slice(0, 3); // 我们只处理前3个

        if (itemsToDelete.length === 0) {
            console.log("✅ 在 'history' 容器中没有找到任何聊天项目可删除。");
            return;
        }
        
        console.log(`[侦查阶段] 发现 ${itemsToDelete.length} 个项目待处理。`);

        // 阶段 2：单元化处理
        for (let i = 0; i < itemsToDelete.length; i++) {
            const item = itemsToDelete[i];
            const itemNumber = i + 1;

            const titleElement = item.querySelector('.truncate');
            const optionsButton = item.querySelector('button[data-testid^="history-item-"]');

            if (!titleElement || !optionsButton) {
                console.warn(`[警告] 第 ${itemNumber} 个项目结构不完整，已跳过。`);
                continue;
            }

            console.log(`--- 开始处理第 ${itemNumber} 项: "${titleElement.innerText}" ---`);

            console.log(`[步骤 1/5] 悬停以显示"选项"按钮...`);
            const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
            item.dispatchEvent(hoverEvent);
            await delay(100); // 悬停后短暂等待
            const buttonStyle = window.getComputedStyle(optionsButton);
            console.log(`    - 悬停后按钮可见性: ${buttonStyle.visibility}, 透明度: ${buttonStyle.opacity}`);

            console.log(`[步骤 2/5] 对"选项"按钮派发 pointerdown 事件以打开菜单...`);
            const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
            optionsButton.dispatchEvent(pointerDownEvent);
            await delay(500);

            console.log(`[步骤 3/5] 查找菜单中的"删除"按钮...`);
            const deleteButton = document.querySelector('[data-testid="delete-chat-menu-item"]');
            if (deleteButton) {
                console.log(`[步骤 4/5] 点击菜单中的"删除"按钮...`);
                deleteButton.click();
                await delay(500);

                console.log(`[步骤 5/5] 点击最终的"删除"确认按钮...`);
                const finalDeleteButton = document.querySelector('button.btn-danger');
                if (finalDeleteButton) {
                    finalDeleteButton.click();
                } else {
                    console.warn('    └─ ⚠️ 未找到最终确认删除按钮。');
                }
            } else {
                console.warn('    └─ ⚠️ 未找到菜单中的删除按钮。');
            }

            console.log(`--- 第 ${itemNumber} 项处理完毕 ---`);
            await delay(1000); // 等待页面刷新稳定
        }
        
        console.log("✅ 所有自动化操作已成功执行完毕。");
    }

    await runAutomation();
})(); 