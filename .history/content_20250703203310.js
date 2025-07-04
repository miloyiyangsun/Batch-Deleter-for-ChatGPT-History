// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

(async () => {
    // 脚本的"独立小黑屋"，防止重复声明错误。

    console.log("🚀 开始执行基于文本锚点的删除操作...");

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // --- 阶段1：侦查与记录 ---
    const historyContainer = document.getElementById('history');
    if (!historyContainer) {
        console.error("❌ 未能找到历史记录容器 #history。");
        return;
    }

    const allLinks = historyContainer.querySelectorAll('a');
    const targets = [];
    // 只记录前3个，或者所有链接中较少的那个。
    const itemsToLog = Math.min(3, allLinks.length); 

    for (let i = 0; i < itemsToLog; i++) {
        const link = allLinks[i];
        const titleElement = link.querySelector('span.truncate');
        if (titleElement) {
            targets.push(titleElement.innerText.trim());
        }
    }

    if (targets.length === 0) {
        console.log("🟡 未在 #history 中找到任何可作为目标的聊天记录。");
        return;
    }

    console.log(`📋 侦查到 ${targets.length} 个目标:`, targets);

    // --- 阶段2：循环打击 ---
    for (const title of targets) {
        console.log(`\n--- 开始处理目标: "${title}" ---`);
        
        // 动态定位单元：在当前 DOM 中重新查找所有链接。
        const currentLinks = document.querySelectorAll('#history a');
        let targetLink = null;
        for (const link of currentLinks) {
            const span = link.querySelector('span.truncate');
            if (span && span.innerText.trim() === title) {
                targetLink = link;
                break;
            }
        }

        if (!targetLink) {
            console.warn(`  └─ ⚠️ 在当前页面上未能重新定位到目标: "${title}"，可能已被删除。`);
            continue; // 跳到下一个目标
        }

        console.log(`  [1/6] ✅ 成功定位到目标链接。`);

        // 在单元内部定位操作按钮
        const optionsButton = targetLink.querySelector('.__menu-item-trailing-btn');
        if (!optionsButton) {
            console.warn(`  └─ ⚠️ 在目标链接内未找到"选项"按钮。`);
            continue;
        }

        console.log(`  [2/6] 正在悬停在目标上...`);
        const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
        targetLink.dispatchEvent(hoverEvent);
        await delay(500);

        console.log(`  [3/6] 正在按下"选项"按钮以打开菜单...`);
        const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
        optionsButton.dispatchEvent(pointerDownEvent);
        await delay(500);

        console.log(`  [4/6] 正在查找并点击菜单中的"删除"按钮...`);
        const deleteButton = document.querySelector('[data-testid="delete-chat-menu-item"]');
        if (deleteButton) {
            deleteButton.click();
            await delay(500);

            console.log(`  [5/6] 正在查找并点击最终的"确认删除"按钮...`);
            const finalDeleteButton = document.querySelector('button.btn-danger');
            if (finalDeleteButton) {
                finalDeleteButton.click();
                console.log(`  [6/6] ✅ 目标 "${title}" 已成功删除。`);
            } else {
                console.warn('    └─ ⚠️ 未能找到最终确认删除按钮。');
            }
        } else {
            console.warn('    └─ ⚠️ 未能找到菜单中的删除按钮。');
        }

        // 等待页面稳定
        await delay(1500);
    }
    
    console.log("\n✅ 所有操作已执行完毕。");

})(); 