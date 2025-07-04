(async () => {
    // -------------------------------------------------------------------------
    // 新功能：聊天记录选择模式 (New Feature: Chat History Selection Mode)
    // 这个新版本将脚本的功能从"立即删除"改为"允许用户选择一个起始点"。
    // -------------------------------------------------------------------------

    console.log("🚀 启动聊天记录选择模式... (Selection mode starting...)");

    // 1. 注入自定义 CSS 样式，用于实现悬浮高亮和勾选框的显示/隐藏
    const customCSS = `
        /* 为聊天记录链接开启相对定位，以便容纳勾选框 */
        nav[aria-label="Chat history"] a[href^="/c/"] {
            position: relative;
            /* 增加右侧内边距，为勾选框留出空间 */
            padding-right: 36px;
        }

        /* 勾选框的默认样式 */
        .chat-item-selector-checkbox {
            position: absolute;
            right: 8px; /* 定位到右侧 */
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background-color: transparent;
            border: 2px solid rgba(255, 255, 255, 0.5); /* 默认边框 */
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
            opacity: 0; /* 默认完全隐藏 */
            transition: all 0.2s ease-in-out; /* 平滑过渡效果 */
        }
        
        /* 鼠标悬浮在聊天记录上时的效果 */
        nav[aria-label="Chat history"] a[href^="/c/"]:hover {
            background-color: rgba(255, 255, 255, 0.1); /* "加长的框"高亮效果 */
        }
        
        /* 悬浮时，让勾选框浮现 */
        nav[aria-label="Chat history"] a[href^="/c/"]:hover .chat-item-selector-checkbox {
            opacity: 1;
        }

        /* 当聊天项被"选中"时的样式 */
        .chat-item-selected {
            background-color: rgba(255, 255, 255, 0.1) !important; /* 保持高亮 */
        }

        /* 让"选中"项的勾选框一直可见，并改变样式 */
        .chat-item-selected .chat-item-selector-checkbox {
            opacity: 1 !important;
            border-color: #A5D6A7; /* 边框变色 */
            background-color: #4CAF50; /* 背景变色 */
        }
        
        /* 勾选框内的"对勾"图标默认隐藏 */
        .chat-item-selector-checkbox::after {
            content: '✓';
            color: white;
            display: none; /* 默认不显示对勾 */
        }

        /* "选中"时显示对勾 */
        .chat-item-selected .chat-item-selector-checkbox::after {
            display: block;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = customCSS;
    document.head.appendChild(styleElement);

    // 2. 找到历史记录的容器
    const historyContainer = document.querySelector('nav[aria-label="Chat history"]');
    if (!historyContainer) {
        console.warn("⚠️ 未找到聊天历史容器 (Could not find chat history container).");
        return;
    }

    // 3. 为每个聊天记录注入勾选框元素
    const allLinks = historyContainer.querySelectorAll('a[href^="/c/"]');
    allLinks.forEach(link => {
        // 防止重复注入
        if (link.querySelector('.chat-item-selector-checkbox')) return;

        const checkbox = document.createElement('div');
        checkbox.className = 'chat-item-selector-checkbox';
        checkbox.setAttribute('data-href', link.getAttribute('href'));
        link.appendChild(checkbox);
    });

    // 4. 使用事件委托来处理勾选操作
    historyContainer.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.chat-item-selector-checkbox');

        // 如果点击的不是我们的勾选框，则不执行任何操作
        if (!checkbox) {
            return;
        }

        // 阻止点击链接导致页面跳转
        e.preventDefault();
        e.stopPropagation();

        const parentLink = checkbox.closest('a[href^="/c/"]');
        const href = checkbox.dataset.href;
        // 获取标题时，移除可能存在的"..."等非文本内容
        const title = parentLink.querySelector('div').textContent.trim();

        const isAlreadySelected = parentLink.classList.contains('chat-item-selected');

        // 在做任何操作前，先清除掉当前所有的"已选择"状态
        const currentlySelected = historyContainer.querySelector('.chat-item-selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('chat-item-selected');
        }

        // 如果当前点击的项没有被选中，那么就选中它
        // 这实现了单选效果，并且再次点击已选项可以取消选择
        if (!isAlreadySelected) {
            parentLink.classList.add('chat-item-selected');
            console.log('✅ 已选择起始点 (Selected as starting point):', {
                title: title,
                href: href
            });
        } else {
            console.log('⚪️ 已取消选择 (Selection removed)');
        }
    });

    console.log("🚀 选择模式已激活。请悬浮并勾选一个聊天记录作为删除的起始点。");
    console.log("   (Selection mode activated. Please hover and check an item to mark it as the starting point for deletion.)");

})();

/*
 * -------------------------------------------------------------------------
 *  旧的批量删除逻辑 (Old Bulk Deletion Logic)
 *  以下代码是之前版本的核心删除逻辑，在此次更新中已被新的"选择模式"替代。
 *  我们暂时将其注释掉，以便未来在实现"确认删除"步骤时可以参考。
 * -------------------------------------------------------------------------
 *
    const getStorageData = (key) => new Promise((resolve) => chrome.storage.local.get(key, (result) => resolve(result[key])));

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    (async () => {
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
            while(attempt < 3 && !success) {
                attempt++;
                console.log(`  [尝试 ${attempt}/3] 查找目标...`);

                const targetLink = document.querySelector(`a[href="${href}"]`);
                if (!targetLink) {
                    console.warn(`  ⚠️ 尝试 ${attempt} - 未在 DOM 中找到锚点为 ${href} 的链接。可能是因为列表刷新过快。`);
                    await delay(1000); // 等待DOM刷新
                    continue;
                }
                
                const parentLi = targetLink.parentElement;

                // 1. 模拟鼠标悬浮以显示"..."按钮
                console.log("  🖱️ 步骤 1: 模拟悬浮 (Simulating mouseover)...");
                parentLi.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
                await delay(200);

                // 2. 查找并点击"..."选项按钮
                const optionsButton = parentLi.querySelector('button[aria-label="More options"]');
                if (!optionsButton) {
                    console.warn("  ⚠️ 步骤 2 失败: 未找到选项按钮。");
                    await delay(500);
                    continue;
                }
                console.log("  🖱️ 步骤 2: 点击选项按钮 (Clicking options button)...");
                optionsButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                await delay(500);

                // 3. 在弹出的菜单中找到并点击"Delete"按钮
                // 注意：这个选择器非常依赖于网站结构，可能需要更新
                const deleteMenuItem = Array.from(document.querySelectorAll('[role="menuitem"]')).find(el => el.textContent.trim() === 'Delete chat');
                if (!deleteMenuItem) {
                    console.warn("  ⚠️ 步骤 3 失败: 未找到'Delete chat'菜单项。");
                    await delay(500);
                    continue; 
                }
                console.log("  🖱️ 步骤 3: 点击'Delete chat'菜单项 (Clicking 'Delete chat' menu item)...");
                deleteMenuItem.click();
                await delay(500);

                // 4. 在确认对话框中找到并点击最终的"Delete"按钮
                const confirmButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Delete' && btn.className.includes('btn-danger'));
                if (!confirmButton) {
                    console.warn("  ⚠️ 步骤 4 失败: 未找到确认删除按钮。");
                    await delay(500);
                    continue;
                }
                console.log("  🖱️ 步骤 4: 点击确认删除按钮 (Clicking confirm delete button)...");
                confirmButton.click();
                
                console.log(`  ✅ 成功为 ${href} 触发了删除操作。`);
                success = true;

                // 等待DOM更新完成
                await delay(1500); 
            }

            if (!success) {
                console.error(`❌ 经过 3 次尝试后，删除 ${href} 失败。可能需要检查选择器或网站结构变化。`);
            }
        }
        console.log("🎉 所有选定操作已完成。");
    })();
*/ 