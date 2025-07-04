(async () => {
    const getStorageData = (key) => new Promise((resolve) => chrome.storage.local.get(key, (result) => resolve(result[key])));
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const TIME_TO_WAIT_FOR_UI_TRANSITION = 500;
    const TIME_TO_WAIT_FOR_PAGE_REFRESH = 1500;

    async function startDeletionProcess() {
        console.log("Deletion process started by popup.");
        const NUMBER_OF_ITEMS_TO_DELETE = await getStorageData('numberOfItems') || 5;
        console.log(`准备删除 ${NUMBER_OF_ITEMS_TO_DELETE} 个项目...`);

        const historyContainer = document.querySelector('nav[aria-label="Chat history"]');
        if (!historyContainer) {
            console.warn("⚠️ 未能找到聊天历史容器，脚本无法继续。");
            return;
        }
        
        const getAllVisibleChatLinks = () => Array.from(historyContainer.querySelectorAll('a[href^="/c/"]'));
        
        let allLinks = getAllVisibleChatLinks();
        if(allLinks.length === 0) {
            console.log("✅ 在历史记录中未找到任何可删除的聊天记录。");
            return;
        }

        console.log(`🎯 侦查到 ${allLinks.length} 个可见的聊天记录。`);
        
        const targetHrefs = allLinks.slice(0, NUMBER_OF_ITEMS_TO_DELETE).map(link => link.getAttribute('href')).filter(Boolean);

        if (targetHrefs.length === 0) {
            console.log("✅ 没有目标可供删除。");
            return;
        }

        console.log(`📋 将要处理的目标锚点:`, targetHrefs);

        for (let i = 0; i < targetHrefs.length; i++) {
            const href = targetHrefs[i];
            console.log(`--- [${i + 1}/${targetHrefs.length}] 开始处理: ${href} ---`);

            let attempt = 0;
            let success = false;
            const MAX_ATTEMPTS = 3;

            while(attempt < MAX_ATTEMPTS && !success) {
                attempt++;
                console.log(`  [尝试 ${attempt}/${MAX_ATTEMPTS}] 查找目标...`);

                const targetLink = document.querySelector(`a[href="${href}"]`);
                if (!targetLink) {
                    console.warn(`  ⚠️ 尝试 ${attempt} - 未在 DOM 中找到锚点为 ${href} 的链接。可能是因为列表刷新过快。`);
                    await delay(1000); // Wait for potential DOM refresh
                    continue;
                }
                
                const parentLi = targetLink.parentElement;

                console.log("  🖱️ 步骤 1: 模拟悬浮 (Simulating mouseover)...");
                parentLi.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
                await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

                const optionsButton = parentLi.querySelector('button[aria-label="More options"]');
                if (!optionsButton) {
                    console.warn("  ⚠️ 步骤 2 失败: 未找到选项按钮。");
                    await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);
                    continue;
                }
                console.log("  🖱️ 步骤 2: 点击选项按钮 (Clicking options button)...");
                optionsButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

                const deleteMenuItem = Array.from(document.querySelectorAll('[role="menuitem"]')).find(el => el.textContent.trim() === 'Delete chat');
                if (!deleteMenuItem) {
                    console.warn("  ⚠️ 步骤 3 失败: 未找到'Delete chat'菜单项。");
                    await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);
                    continue; 
                }
                console.log("  🖱️ 步骤 3: 点击'Delete chat'菜单项 (Clicking 'Delete chat' menu item)...");
                deleteMenuItem.click();
                await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);

                const confirmButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Delete' && btn.className.includes('btn-danger'));
                if (!confirmButton) {
                    console.warn("  ⚠️ 步骤 4 失败: 未找到确认删除按钮。");
                    await delay(TIME_TO_WAIT_FOR_UI_TRANSITION);
                    continue;
                }
                console.log("  🖱️ 步骤 4: 点击确认删除按钮 (Clicking confirm delete button)...");
                confirmButton.click();
                
                console.log(`  ✅ 成功为 ${href} 触发了删除操作。`);
                success = true;

                await delay(TIME_TO_WAIT_FOR_PAGE_REFRESH); 
            }

            if (!success) {
                console.error(`❌ 经过 ${MAX_ATTEMPTS} 次尝试后，删除 ${href} 失败。可能需要检查选择器或网站结构变化。`);
            }
        }
        console.log("🎉 所有选定操作已完成。");
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "startDeleting") {
            startDeletionProcess().then(() => sendResponse({status: "completed"}));
            return true; // Indicates that the response is sent asynchronously
        }
    });

})(); 