(async () => {
    // 封装所有操作，避免污染全局作用域
    // Wrap all operations in an IIFE to avoid polluting the global scope.

    // --- 工具函数 (Utility Functions) ---
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const hoverOver = (element) => element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const clickElement = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const pointerDown = (element) => element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    console.log("🚀 ChatGPT 批量删除脚本已启动... (Batch Deleter script started...)");

    try {
        // 1. 从 Chrome 的存储中获取要删除的数量
        //    Get the number of items to delete from Chrome's storage.
        const { deleteCount = 1 } = await chrome.storage.local.get("deleteCount");
        console.log(`设定数量 (Number to delete): ${deleteCount}`);

        // 2. 侦察阶段：获取页面上所有聊天记录的链接
        //    Reconnaissance Phase: Get all chat history links on the page.
        const allChatLinks = Array.from(document.querySelectorAll('nav[aria-label="Chat history"] a[href^="/c/"]'));
        const allHrefs = allChatLinks.map(link => link.getAttribute('href'));

        if (allHrefs.length === 0) {
            console.log("🤷‍♂️ 未在页面上找到任何聊天记录。(No chat history found on the page.)");
            return;
        }

        // 3. 确定删除的起始索引 (Determine the starting index for deletion)
        let startIndex = 0; // 默认从第一个开始 (Default to the first item)
        const selectedItem = document.querySelector('.chat-item-selected');

        if (selectedItem) {
            // 如果用户选择了起始点 (If the user selected a starting point)
            const startHref = selectedItem.closest('a[href^="/c/"]').getAttribute('href');
            const foundIndex = allHrefs.indexOf(startHref);

            if (foundIndex !== -1) {
                startIndex = foundIndex;
                const title = selectedItem.closest('a').textContent.trim() || "Untitled Chat";
                console.log(`✅ 已指定起始点 (Starting point specified): "${title}".`);
            } else {
                console.warn(`⚠️ 无法在列表中找到指定的起始点，将从顶部开始。(Could not find the specified start point, will start from the top.)`);
            }
        } else {
            // 如果用户未选择 (If the user did not make a selection)
            console.log("ℹ️ 未指定起始点，将从顶部第一个聊天开始。(No starting point specified, starting from the top.)");
        }

        // 4. 根据起始索引和数量，创建最终要删除的列表
        //    Create the final list of items to delete based on the start index and count.
        const hrefsToDelete = allHrefs.slice(startIndex, startIndex + deleteCount);

        if (hrefsToDelete.length === 0) {
            console.log("🏁 根据您的选择，没有需要删除的对话。脚本执行完毕。(Based on your selection, no conversations to delete. Script finished.)");
            return;
        }

        console.log(`准备删除 ${hrefsToDelete.length} 个对话... (Preparing to delete ${hrefsToDelete.length} conversations...)`);

        // 5. 执行阶段：循环删除列表中的每一项
        //    Engagement Phase: Loop through and delete each item in the list.
        for (let i = 0; i < hrefsToDelete.length; i++) {
            const href = hrefsToDelete[i];
            console.log(`--- [${i + 1}/${hrefsToDelete.length}] 正在删除 (Deleting): ${href} ---`);

            const chatLink = document.querySelector(`a[href="${href}"]`);
            if (!chatLink) {
                console.error("   ❌ 错误：在DOM中找不到要删除的项。可能是界面已刷新。跳过此项。");
                console.error("      (Error: Could not find the item to delete in the DOM. The UI might have refreshed. Skipping.)");
                continue;
            }

            // 稳定的五步删除法 (The Stable 5-Step Deletion Process)
            // 步骤 1: 悬浮以显示 "..." 按钮
            hoverOver(chatLink);
            await delay(200);

            // 步骤 2: 点击 "..." 按钮 (显示菜单)
            const optionsButton = chatLink.querySelector('button[class*="radix-state-closed"]');
            if (!optionsButton) {
                console.error("   ❌ 错误：找不到 '...' 选项按钮。(Error: Could not find the '...' options button.)");
                continue;
            }
            pointerDown(optionsButton);
            await delay(300);

            // 步骤 3: 点击菜单中的 "Delete" 按钮
            const deleteMenuItem = Array.from(document.querySelectorAll('[role="menuitem"]')).find(el => el.textContent.trim() === "Delete");
            if (!deleteMenuItem) {
                console.error("   ❌ 错误：找不到'Delete'菜单项。(Error: Could not find the 'Delete' menu item.)");
                continue;
            }
            clickElement(deleteMenuItem);
            await delay(300);

            // 步骤 4 & 5: 在确认对话框中，点击红色的最终 "Delete" 按钮
            const confirmDialog = document.querySelector('[role="dialog"]');
            if (!confirmDialog) {
                console.error("   ❌ 错误：找不到确认对话框。(Error: Could not find the confirmation dialog.)");
                continue;
            }
            const confirmButton = confirmDialog.querySelector('button.btn-danger');
            if (!confirmButton) {
                console.error("   ❌ 错误：找不到最终的确认删除按钮。(Error: Could not find the final confirm delete button.)");
                continue;
            }
            clickElement(confirmButton);
            console.log("   ✅ 已成功发送删除指令。(Deletion command sent successfully.)");

            // 等待界面刷新 (Wait for the UI to refresh)
            await delay(1000);
        }

        console.log("✅✅✅ 批量删除任务完成！(Batch deletion task complete!) ✅✅✅");

    } catch (error) {
        console.error("❌❌❌ 在执行批量删除过程中发生意外错误。(An unexpected error occurred during batch deletion.) ❌❌❌", error);
    }
})(); 