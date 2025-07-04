// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

(async () => {
    // 使用 IIFE 避免全局作用域污染和重复声明错误。

    /**
     * 创建一个延时函数，用于在操作之间等待。
     * @param {number} ms - 等待的毫秒数。
     */
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // --- 阶段一：侦查与记录 ---
    console.log("[阶段 1/2] 正在侦查并记录前3个聊天标题...");
    
    const historyContainer = document.getElementById('history');
    if (!historyContainer) {
        console.error("错误：未能找到 id='history' 的容器。脚本无法继续。");
        return;
    }

    // 获取所有聊天链接 <a>，并只取前3个
    const allLinks = Array.from(historyContainer.querySelectorAll('a')).slice(0, 3);
    
    // 从这3个链接中提取标题文本
    const targetTexts = allLinks.map(link => {
        const span = link.querySelector('span.truncate');
        return span ? span.innerText.trim() : null;
    }).filter(text => text); // 过滤掉可能存在的 null 或空字符串

    if (targetTexts.length === 0) {
        console.warn("警告：未能记录任何聊天标题。脚本已停止。");
        return;
    }

    console.log(`  └─ ✅ 侦查完毕。打击名单: [${targetTexts.join(', ')}]`);

    // --- 阶段二：循环打击 ---
    console.log("[阶段 2/2] 开始根据打击名单执行循环删除操作...");

    for (const text of targetTexts) {
        console.log(`--- 正在处理目标: "${text}" ---`);

        // 步骤A: 重新定位锚点 (在当前 DOM 中)
        const allSpans = Array.from(document.querySelectorAll('#history span.truncate'));
        const targetSpan = allSpans.find(span => span.innerText.trim() === text);

        if (!targetSpan) {
            console.warn(`  └─ ⚠️ 未能重新定位标题为 "${text}" 的聊天。可能已被删除或改变。正在跳过...`);
            await delay(1000); // 等待一下，以防页面正在刷新
            continue;
        }

        // 步骤B: 锁定作战单元 <a>
        const targetLink = targetSpan.closest('a');
        if (!targetLink) {
            console.warn(`  └─ ⚠️ 找到了标题，但未能找到其父级 <a> 容器。正在跳过...`);
            continue;
        }

        // 步骤C: 在单元内锁定"..."按钮
        const optionsButton = targetLink.querySelector('button.__menu-item-trailing-btn');
        if (!optionsButton) {
            console.warn(`  └─ ⚠️ 找到了 <a> 容器，但未能找到其内部的"选项"按钮。正在跳过...`);
            continue;
        }

        // 步骤D: 执行完整的操作链
        console.log('  ├─ [1/5] 悬停以显示按钮...');
        targetLink.dispatchEvent(new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true }));
        await delay(500);

        console.log('  ├─ [2/5] 点击"选项"按钮打开菜单...');
        optionsButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
        await delay(500);

        console.log('  ├─ [3/5] 查找菜单中的"删除"按钮...');
        const deleteButton = document.querySelector('[data-testid="delete-chat-menu-item"]');
        if (!deleteButton) {
            console.warn('    └─ ⚠️ 未能找到菜单中的"删除"按钮。');
            continue;
        }
        
        console.log('  ├─ [4/5] 点击菜单中的"删除"按钮...');
        deleteButton.click();
        await delay(500);

        console.log('  └─ [5/5] 查找并点击最终确认"删除"按钮...');
        const finalDeleteButton = document.querySelector('button.btn-danger');
        if (finalDeleteButton) {
            finalDeleteButton.click();
            console.log(`    └─ ✅ 目标 "${text}" 已成功删除。`);
        } else {
            console.warn('    └─ ⚠️ 未能找到最终确认"删除"按钮。');
        }

        // 等待页面刷新稳定
        await delay(1500);
    }

    console.log("✅✅✅ 所有打击任务已执行完毕。 ✅✅✅");

})(); 