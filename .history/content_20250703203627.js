// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

(async () => {
    // 这是一个 IIFE (立即调用函数表达式)，以避免在多次执行时发生变量声明冲突。

    /**
     * 创建一个延时函数，用于在操作之间等待。
     * @param {number} ms - 等待的毫秒数。
     */
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * 最终版的自动化删除函数。
     * V4: 先记录前3个聊天标题作为锚点，然后根据锚点逐个定位并执行完整的删除流程。
     */
    async function deleteByTextAnchors() {
        console.log("🚀 V4: 开始执行基于文本锚点的删除流程...");

        // --- 阶段一：侦查与记录锚点 ---
        const historyContainer = document.getElementById('history');
        if (!historyContainer) {
            console.warn("⚠️ 未能找到 'history' 容器，脚本无法继续。");
            return;
        }

        const allLinks = historyContainer.querySelectorAll('a');
        const targetTitles = [];
        
        // 提取前3个有效标题作为我们的目标锚点
        for (let i = 0; i < Math.min(allLinks.length, 3); i++) {
            const titleSpan = allLinks[i].querySelector('div.truncate');
            if (titleSpan && titleSpan.innerText) {
                targetTitles.push(titleSpan.innerText);
            }
        }

        if (targetTitles.length === 0) {
            console.log("✅ 在 'history' 中未找到任何可删除的聊天记录。");
            return;
        }

        console.log(`🎯 侦查到 ${targetTitles.length} 个目标锚点:`, targetTitles);

        // --- 阶段二：基于锚点循环打击 ---
        for (const title of targetTitles) {
            console.log(`--- 开始处理锚点: "${title}" ---`);

            let targetLinkElement = null;
            // 每次循环都重新搜索，以应对DOM刷新
            const currentLinks = document.getElementById('history')?.querySelectorAll('a');
            if (currentLinks) {
                for (const link of currentLinks) {
                    const span = link.querySelector('div.truncate');
                    if (span && span.innerText === title) {
                        targetLinkElement = link;
                        break;
                    }
                }
            }

            if (!targetLinkElement) {
                console.warn(`  └─ ⚠️ 在当前页面上未能重新定位到锚点: "${title}"，可能已被删除或页面变化。`);
                continue; // 跳到下一个锚点
            }

            console.log(`  [1/5] 已定位目标，准备悬停...`);
            const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
            targetLinkElement.dispatchEvent(hoverEvent);
            await delay(500);

            const optionsButton = targetLinkElement.querySelector('button.__menu-item-trailing-btn');
            if (!optionsButton) {
                console.warn('  └─ ⚠️ 未能在目标内找到"选项"按钮。');
                continue;
            }

            console.log('  [2/5] 找到"选项"按钮，准备打开菜单...');
            const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
            optionsButton.dispatchEvent(pointerDownEvent);
            await delay(500);

            console.log('  [3/5] 正在查找菜单中的"删除"按钮...');
            const deleteButton = document.querySelector('[data-testid="delete-chat-menu-item"]');
            if (!deleteButton) {
                console.warn('  └─ ⚠️ 未能找到菜单中的"删除"按钮。');
                // 在这里我们可能需要模拟一次点击页面空白处来关闭菜单，以避免影响下一次悬停
                document.body.click(); 
                continue;
            }
            
            console.log('  [4/5] 找到初级"删除"按钮，准备点击...');
            deleteButton.click();
            await delay(500);

            console.log('  [5/5] 正在查找最终确认"删除"按钮...');
            const finalDeleteButton = document.querySelector('button.btn-danger');
            if (!finalDeleteButton) {
                console.warn('  └─ ⚠️ 未能找到最终确认"删除"按钮。');
                continue;
            }
            
            finalDeleteButton.click();
            console.log(`  └─ ✅ 成功完成对锚点 "${title}" 的所有删除操作。`);
            await delay(1500); // 等待更长时间，让删除后的刷新完成
        }

        console.log("✅ 所有操作已执行完毕。");
    }

    await deleteByTextAnchors();
})(); 