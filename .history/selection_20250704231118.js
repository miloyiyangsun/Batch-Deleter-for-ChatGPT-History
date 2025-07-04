(async () => {
    console.log("🚀 启动聊天记录选择模式... (Selection mode starting...)");

    // 注入自定义CSS样式
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
            background-color: rgba(255, 255, 255, 0.1); /* 高亮效果 */
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
    styleElement.id = 'chatgpt-batch-deleter-style'; // Give it an ID to prevent duplicates
    // 如果样式未被注入，则注入
    if (!document.getElementById(styleElement.id)) {
        styleElement.textContent = customCSS;
        document.head.appendChild(styleElement);
    }


    // 找到历史记录的容器
    const historyContainer = document.querySelector('nav[aria-label="Chat history"]');
    // 如果找不到容器，则终止脚本
    if (!historyContainer) {
        console.warn("⚠️ 未找到聊天历史容器 (Could not find chat history container).");
        return;
    }

    // 定义注入勾选框的函数
    const injectCheckboxes = () => {
        const allLinks = historyContainer.querySelectorAll('a[href^="/c/"]');
        // 遍历所有聊天链接并注入勾选框
        allLinks.forEach(link => {
            // 防止重复注入
            if (link.querySelector('.chat-item-selector-checkbox')) return;

            const checkbox = document.createElement('div');
            checkbox.className = 'chat-item-selector-checkbox';
            checkbox.setAttribute('data-href', link.getAttribute('href'));
            link.appendChild(checkbox);
        });
    }

    // 首次执行注入
    injectCheckboxes();

    // 使用MutationObserver监视列表变化，为动态加载的项注入勾选框
    const observer = new MutationObserver((mutations) => {
        // 当列表变化时，重新运行注入逻辑
        injectCheckboxes();
    });
    observer.observe(historyContainer, { childList: true, subtree: true });


    // 使用事件委托处理勾选操作
    historyContainer.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.chat-item-selector-checkbox');

        // 如果点击的不是勾选框，则不处理
        if (!checkbox) {
            return;
        }

        // 阻止默认行为和事件冒泡
        e.preventDefault();
        e.stopPropagation();

        const parentLink = checkbox.closest('a[href^="/c/"]');
        const href = checkbox.dataset.href;
        const titleElement = parentLink.querySelector('div');
        const title = titleElement ? titleElement.textContent.trim() : 'Untitled Chat';

        const isAlreadySelected = parentLink.classList.contains('chat-item-selected');

        // 清除任何已有的选中状态，实现单选
        const currentlySelected = historyContainer.querySelector('.chat-item-selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('chat-item-selected');
        }

        // 如果当前项未被选中，则选中它
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