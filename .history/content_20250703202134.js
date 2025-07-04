// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

(async () => {
    // 这是一个IIFE，用于创建私有作用域，避免变量冲突。
    console.log("🚀 启动自动化删除脚本 (V4 - 文本锚点)...");

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * 主函数：执行所有自动化操作。
     */
    async function runAutomation() {
        // --- 阶段 1: 侦查并记录目标标题 ---
        const historyContainer = document.getElementById('history');
        if (!historyContainer) {
            console.error("❌ 未能找到ID为 'history' 的容器，脚本无法继续。");
            return;
        }

        const chatLinks = Array.from(historyContainer.querySelectorAll('a'));
        const titlesToFind = chatLinks.slice(0, 3).map(link => {
            const titleElement = link.querySelector('.truncate');
            return titleElement ? titleElement.innerText.trim() : null;
        }).filter(Boolean); // 使用 filter(Boolean) 过滤掉所有 null 或空字符串

        if (titlesToFind.length === 0) {
            console.log("✅ 没有找到任何聊天项目可删除。");
            return;
        }
        
        console.log(`[侦查阶段] 锁定 ${titlesToFind.length} 个目标:`, titlesToFind);

        // --- 阶段 2: 根据标题动态循环打击 ---
        for (const title of titlesToFind) {
            console.log(`--- 开始处理目标: "${title}" ---`);

            // 每次循环都重新搜索，以应对DOM刷新
            const allSpans = Array.from(document.querySelectorAll('#history .truncate'));
            const targetSpan = allSpans.find(span => span.innerText.trim() === title);

            if (!targetSpan) {
                console.warn(`[警告] 未能再找到标题为 "${title}" 的项目，可能已被删除或改变。已跳过。`);
                continue;
            }

            const item = targetSpan.closest('a');
            const optionsButton = item ? item.querySelector('button[data-testid^="history-item-"]') : null;

            if (!item || !optionsButton) {
                console.warn(`[警告] 标题为 "${title}" 的项目结构不完整，已跳过。`);
                continue;
            }

            // --- 复用并优化我们的操作链 ---
            console.log(`[步骤 1/5] 悬停以显示"选项"按钮...`);
            item.dispatchEvent(new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true }));
            await delay(500);

            console.log(`[步骤 2/5] 使用 pointerdown 点击"选项"按钮以打开菜单...`);
            optionsButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
            await delay(500);

            console.log(`[步骤 3/5] 查找菜单中的"删除"按钮...`);
            const deleteButton = document.querySelector('[data-testid="delete-chat-menu-item"]');
            if (!deleteButton) {
                console.warn('    └─ ⚠️ 未找到菜单中的删除按钮，跳过此项目。');
                // 点击页面其他地方，尝试关闭可能意外打开的菜单
                document.body.click();
                await delay(500);
                continue;
            }
            deleteButton.click();
            await delay(500);

            console.log(`[步骤 4/5] 查找最终的"删除"确认按钮...`);
            const finalDeleteButton = document.querySelector('button.btn-danger');
            if (!finalDeleteButton) {
                console.warn('    └─ ⚠️ 未找到最终确认删除按钮。');
                continue;
            }
            console.log(`[步骤 5/5] 点击最终确认按钮...`);
            finalDeleteButton.click();

            console.log(`--- 目标 "${title}" 处理完毕 ---`);
            await delay(1500); // 删除后等待更长时间，确保页面完全刷新稳定
        }
        
        console.log("✅ 所有自动化操作已成功执行完毕。");
    }

    await runAutomation();
})(); 