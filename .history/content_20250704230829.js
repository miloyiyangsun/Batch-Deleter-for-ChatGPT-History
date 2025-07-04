// 这是一个立即执行的匿名函数，用于创建一个独立的作用域
(async () => {
    const TIME_TO_WAIT_FOR_UI_TRANSITION = 20;
    const TIME_TO_WAIT_FOR_PAGE_REFRESH = 300;

    const { deleteCount } = await chrome.storage.local.get('deleteCount');
    const NUMBER_OF_ITEMS_TO_DELETE = deleteCount || 1;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // 此函数是删除逻辑的核心，负责定位、选择并执行一系列用户界面操作来删除聊天记录
    async function deleteByTextAnchors() {
        const historyContainer = document.querySelector('nav[aria-label="Chat history"]');
        if (!historyContainer) {
            return;
        }

        const allLinksNodeList = historyContainer.querySelectorAll('a[href^="/c/"]');
        if (allLinksNodeList.length === 0) {
            return;
        }
        const allLinks = Array.from(allLinksNodeList);

        let startIndex = 0;
        const selectedItem = document.querySelector('.chat-item-selected');
        
        if (selectedItem) {
            const selectedHref = selectedItem.closest('a[href^="/c/"]')?.getAttribute('href');
            if (selectedHref) {
                const foundIndex = allLinks.findIndex(link => link.getAttribute('href') === selectedHref);
                if (foundIndex !== -1) {
                    startIndex = foundIndex;
                }
            }
        }

        const linksToDelete = allLinks.slice(startIndex, startIndex + NUMBER_OF_ITEMS_TO_DELETE);
        const targetHrefs = linksToDelete.map(link => link.getAttribute('href')).filter(href => href);

        if (targetHrefs.length === 0) {
            return;
        }

        const targetsForLog = linksToDelete.map(link => ({ 
            title: link.querySelector('div')?.textContent.trim() || 'Untitled Chat', 
            href: link.getAttribute('href')
        })).filter(item => item.href);

        console.log(`🎯 侦查到 ${targetHrefs.length} 个目标锚点 (从索引 ${startIndex} 开始):`);
        console.table(targetsForLog);

        // 遍历所有待删除目标的href链接，并对每一个目标执行完整的删除操作序列
        for (const href of targetHrefs) {
            const selector = `a[href="${href}"]`;
            const targetLinkElement = document.querySelector(selector);

            if (!targetLinkElement) {
                continue;
            }

            const hoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
            targetLinkElement.dispatchEvent(hoverEvent);
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            const optionsButton = targetLinkElement.querySelector('button[class*="radix-state-closed"]');
            if (!optionsButton) {
                continue;
            }

            const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window });
            optionsButton.dispatchEvent(pointerDownEvent);
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            const deleteButton = Array.from(document.querySelectorAll('div[role="menuitem"]')).find(el => el.textContent.trim() === 'Delete chat');
            if (!deleteButton) {
                document.body.click(); 
                continue;
            }
            
            deleteButton.click();
            await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

            const finalDeleteButton = document.querySelector('a.btn.btn-danger');
            if (!finalDeleteButton) {
                continue;
            }
            
            finalDeleteButton.click();
            await delay(TIME_TO_WAIT_FOR_PAGE_REFRESH);
        }
    }

    await deleteByTextAnchors();
})(); 