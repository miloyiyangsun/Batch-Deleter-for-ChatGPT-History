// 这是一个立即执行的匿名函数，用于创建一个独立的作用域，避免污染全局命名空间
(async () => {
    console.log("🚀 启动聊天记录选择模式... (Selection mode starting...)");

    // 定义并注入自定义CSS样式，用于实现勾选框的显示、隐藏和高亮效果
    const customCSS = `
        /* 为聊天记录链接开启相对定位，以便容纳勾选框 */
        /* Enable relative positioning for chat links to accommodate checkboxes */
        nav[aria-label="Chat history"] a[href^="/c/"] {
            position: relative;
            /* 增加右侧内边距，为勾选框留出空间 */
            /* Add right padding to make space for the checkbox */
            padding-right: 36px;
        }

        /* 勾选框的默认样式 */
        /* Default style for the checkbox */
        .chat-item-selector-checkbox {
            position: absolute;
            right: 8px; /* 定位到右侧 (Position to the right) */
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background-color: transparent;
            border: 2px solid rgba(255, 255, 255, 0.5); /* 默认边框 (Default border) */
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
            opacity: 0; /* 默认完全隐藏 (Hidden by default) */
            transition: all 0.2s ease-in-out; /* 平滑过渡效果 (Smooth transition) */
        }
        
        /* 鼠标悬浮在聊天记录上时的效果 */
        /* Effect on hover */
        nav[aria-label="Chat history"] a[href^="/c/"]:hover {
            background-color: rgba(255, 255, 255, 0.1); /* 高亮效果 (Highlight effect) */
        }
        
        /* 悬浮时，让勾选框浮现 */
        /* Show checkbox on hover */
        nav[aria-label="Chat history"] a[href^="/c/"]:hover .chat-item-selector-checkbox {
            opacity: 1;
        }

        /* 当聊天项被"选中"时的样式 */
        /* Style for a "selected" item */
        .chat-item-selected {
            background-color: rgba(255, 255, 255, 0.1) !important; /* 保持高亮 (Keep highlighted) */
        }

        /* 让"选中"项的勾选框一直可见，并改变样式 */
        /* Make the checkbox for a selected item always visible and change its style */
        .chat-item-selected .chat-item-selector-checkbox {
            opacity: 1 !important;
            border-color: #A5D6A7; /* 边框变色 (Change border color) */
            background-color: #4CAF50; /* 背景变色 (Change background color) */
        }
        
        /* 勾选框内的"对勾"图标默认隐藏 */
        /* The "check" icon inside the checkbox is hidden by default */
        .chat-item-selector-checkbox::after {
            content: '✓';
            color: white;
            display: none; /* 默认不显示对勾 (Do not display by default) */
        }

        /* "选中"时显示对勾 */
        /* Show the check icon when selected */
        .chat-item-selected .chat-item-selector-checkbox::after {
            display: block;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'chatgpt-batch-deleter-style'; // Give it an ID to prevent duplicates
    if (!document.getElementById(styleElement.id)) {
        styleElement.textContent = customCSS;
        document.head.appendChild(styleElement);
    }


    // 2. 找到历史记录的容器 (Find the history container)
    const historyContainer = document.querySelector('nav[aria-label="Chat history"]');
    if (!historyContainer) {
        console.warn("⚠️ 未找到聊天历史容器 (Could not find chat history container).");
        return;
    }

    // 3. 定义一个函数来为每个聊天记录注入勾选框元素
    //    Define a function to inject checkbox elements into each chat item.
    const injectCheckboxes = () => {
        const allLinks = historyContainer.querySelectorAll('a[href^="/c/"]');
        // 遍历所有找到的链接元素
        allLinks.forEach(link => {
            // 防止重复注入 (Prevent duplicate injection)
            if (link.querySelector('.chat-item-selector-checkbox')) return;

            const checkbox = document.createElement('div');
            checkbox.className = 'chat-item-selector-checkbox';
            checkbox.setAttribute('data-href', link.getAttribute('href'));
            link.appendChild(checkbox);
        });
    }

    // 首次注入 (Initial injection)
    injectCheckboxes();

    // 4. 使用 MutationObserver 监视列表变化，以便为动态加载的项也注入勾选框
    //    Use MutationObserver to watch for list changes and inject checkboxes for dynamically loaded items.
    const observer = new MutationObserver((mutations) => {
        // 为简化起见，我们只在检测到变化时重新运行注入逻辑
        // For simplicity, we just re-run the injection logic on any change.
        injectCheckboxes();
    });
    observer.observe(historyContainer, { childList: true, subtree: true });


    // 5. 使用事件委托来处理勾选操作 (Use event delegation to handle clicks)
    historyContainer.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.chat-item-selector-checkbox');

        // 如果点击的不是我们的勾选框，则不执行任何操作
        // If the click is not on our checkbox, do nothing.
        if (!checkbox) {
            return;
        }

        // 阻止点击链接导致页面跳转，并停止事件冒泡
        // Prevent default link navigation and stop event propagation.
        e.preventDefault();
        e.stopPropagation();

        const parentLink = checkbox.closest('a[href^="/c/"]');
        const href = checkbox.dataset.href;
        const titleElement = parentLink.querySelector('div');
        const title = titleElement ? titleElement.textContent.trim() : 'Untitled Chat';

        const isAlreadySelected = parentLink.classList.contains('chat-item-selected');

        // 在做任何操作前，先清除掉当前所有的"已选择"状态
        // Before doing anything, clear any currently selected item.
        const currentlySelected = historyContainer.querySelector('.chat-item-selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('chat-item-selected');
        }

        // 如果当前点击的项之前未被选中，则选中它
        // This creates a "single-select" behavior. Clicking an already selected item will deselect it.
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