
(async () => {
    const TIME_TO_WAIT_FOR_UI_TRANSITION = 20;
    const TIME_TO_WAIT_FOR_PAGE_REFRESH = 300;

    const { deleteCount } = await chrome.storage.local.get('deleteCount');
    const NUMBER_OF_ITEMS_TO_DELETE = deleteCount || 1;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function deleteByTextAnchors() {
        console.log("🚀 V4: 开始执行基于文本锚点的删除流程...");

        const historyContainer = document.getElementById('history');
        if (!historyContainer) {
            console.warn("⚠️ 未能找到 'history' 容器，脚本无法继续。");
            return;
        }

        const allLinks = historyContainer.querySelectorAll('a');
        const targetTitles = [];
        
        for (let i = 0; i < Math.min(allLinks.length, NUMBER_OF_ITEMS_TO_DELETE); i++) {
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

        for (const title of targetTitles) {
            console.log(`--- 开始处理锚点: "${title}" ---`);

            let targetLinkElement = null;
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
                continue;
            }

            console.log(`  [1/5] 已定位目标，准备悬停...`);
            const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
            targetLinkElement.dispatchEvent(hoverEvent);
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            const optionsButton = targetLinkElement.querySelector('button.__menu-item-trailing-btn');
            if (!optionsButton) {
                console.warn('  └─ ⚠️ 未能在目标内找到"选项"按钮。');
                continue;
            }

            console.log('  [2/5] 找到"选项"按钮，准备打开菜单...');
            const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
            optionsButton.dispatchEvent(pointerDownEvent);
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            console.log('  [3/5] 正在查找菜单中的"删除"按钮...');
            const deleteButton = document.querySelector('[data-testid="delete-chat-menu-item"]');
            if (!deleteButton) {
                console.warn('  └─ ⚠️ 未能找到菜单中的"删除"按钮。');
                document.body.click(); 
                continue;
            }
            
            console.log('  [4/5] 找到初级"删除"按钮，准备点击...');
            deleteButton.click();
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            console.log('  [5/5] 正在查找最终确认"删除"按钮...');
            const finalDeleteButton = document.querySelector('button.btn-danger');
            if (!finalDeleteButton) {
                console.warn('  └─ ⚠️ 未能找到最终确认"删除"按钮。');
                continue;
            }
            
            finalDeleteButton.click();
            console.log(`  └─ ✅ 成功完成对锚点 "${title}" 的所有删除操作。`);
            await delay(TIME_TO_WAIT_FOR_PAGE_REFRESH);
        }

        console.log("✅ 所有操作已执行完毕。");
    }

    await deleteByTextAnchors();
})(); 