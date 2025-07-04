(async () => {
    // 定义UI过渡和页面刷新的等待时间
    const TIME_TO_WAIT_FOR_UI_TRANSITION = 20;
    const TIME_TO_WAIT_FOR_PAGE_REFRESH = 300;

    // 从Chrome存储中获取要删除的数量
    const { deleteCount } = await chrome.storage.local.get('deleteCount');
    const NUMBER_OF_ITEMS_TO_DELETE = deleteCount || 1;

    // 定义一个延迟函数
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // 定义核心的删除函数
    async function deleteByTextAnchors() {
        console.log("🚀 V6: 开始执行基于【选择或默认】锚点的删除流程...");

        // 查找所有聊天记录链接
        const historyContainer = document.querySelector('nav[aria-label="Chat history"]');
        // 如果找不到历史记录容器，则终止脚本
        if (!historyContainer) {
            console.warn("⚠️ 未找到聊天历史容器 (Could not find chat history container).");
            return;
        }

        const allLinksNodeList = historyContainer.querySelectorAll('a[href^="/c/"]');
        // 如果找不到任何链接，则终止脚本
        if (allLinksNodeList.length === 0) {
            console.log("✅ 在 'history' 中未找到任何可删除的聊天记录。");
            return;
        }
        const allLinks = Array.from(allLinksNodeList);

        // 确定删除的起始索引
        let startIndex = 0; // 默认为0
        const selectedItem = document.querySelector('.chat-item-selected');
        
        // 如果用户选择了起始点，则计算其索引
        if (selectedItem) {
            const selectedHref = selectedItem.closest('a[href^="/c/"]')?.getAttribute('href');
            if (selectedHref) {
                const foundIndex = allLinks.findIndex(link => link.getAttribute('href') === selectedHref);
                if (foundIndex !== -1) {
                    startIndex = foundIndex;
                    console.log(`✅ 检测到用户已选择起始点: ${selectedHref}，将从索引 ${startIndex} 开始。`);
                } else {
                    console.warn(`⚠️ 找到已选择的项，但在链接列表中找不到其 href。将从头开始。`);
                }
            }
        } else {
            console.log("ℹ️ 用户未选择任何起始点，将从头开始删除。");
        }

        // 根据起始索引和数量，筛选出目标链接
        const linksToDelete = allLinks.slice(startIndex, startIndex + NUMBER_OF_ITEMS_TO_DELETE);
        const targetHrefs = linksToDelete.map(link => link.getAttribute('href')).filter(href => href);


        // 如果没有要删除的目标，则终止脚本
        if (targetHrefs.length === 0) {
            console.log("✅ 根据您的选择，没有需要删除的聊天记录。");
            return;
        }

        // 为日志准备带有标题的目标信息
        const targetsForLog = linksToDelete.map(link => ({ 
            title: link.querySelector('div')?.textContent.trim() || 'Untitled Chat', 
            href: link.getAttribute('href')
        })).filter(item => item.href);

        console.log(`🎯 侦查到 ${targetHrefs.length} 个目标锚点 (从索引 ${startIndex} 开始):`);
        console.table(targetsForLog);

        // 遍历并删除每一个目标链接
        for (const href of targetHrefs) {
            console.log(`--- 开始处理锚点: "${href}" ---`);

            const selector = `a[href="${href}"]`;
            const targetLinkElement = document.querySelector(selector);

            // 如果在页面上找不到当前目标，则跳过
            if (!targetLinkElement) {
                console.warn(`  └─ ⚠️ 在当前页面上未能重新定位到锚点: "${href}"，可能已被删除或页面变化。`);
                continue;
            }

            console.log(`  [1/5] 已定位目标，准备悬停...`);
            const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
            targetLinkElement.dispatchEvent(hoverEvent);
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            const optionsButton = targetLinkElement.querySelector('button.__menu-item-trailing-btn');
            // 如果找不到选项按钮，则跳过
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
            // 如果找不到删除按钮，则跳过
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
            // 如果找不到最终确认删除按钮，则跳过
            if (!finalDeleteButton) {
                console.warn('  └─ ⚠️ 未能找到最终确认"删除"按钮。');
                continue;
            }
            
            finalDeleteButton.click();
            console.log(`  └─ ✅ 成功完成对锚点 "${href}" 的所有删除操作。`);
            await delay(TIME_TO_WAIT_FOR_PAGE_REFRESH);
        }

        console.log("✅ 所有操作已执行完毕。");
    }

    // 执行删除函数
    await deleteByTextAnchors();
})(); 