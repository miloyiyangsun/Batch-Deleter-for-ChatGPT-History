// 当用户点击插件弹出窗口的按钮时，这个脚本会被注入到当前页面。

console.log("🚀 ChatGPT 聊天选项查找并点击脚本正在运行...");

/**
 * 根据聊天标题查找对应的聊天记录，并点击它的"选项"按钮。
 * @param {string} chatTitle - 你想要操作的聊天的确切标题。
 */
function findAndClickChatOptionButton(chatTitle) {
    console.log(`正在尝试查找标题为 "${chatTitle}" 的聊天...`);

    // 1. 找到所有可能的聊天链接元素。在 ChatGPT 界面中，它们是 <a> 标签。
    const allChatLinks = document.querySelectorAll('a');

    // 2. 遍历所有链接，找到那个文本内容完全匹配 chatTitle 的链接。
    //    `Array.from()` 将 NodeList 转换为数组，这样我们就可以使用 `.find()` 方法。
    const targetLink = Array.from(allChatLinks).find(link => link.innerText.trim() === chatTitle);

    // 3. 如果没有找到对应的链接，就打印一条消息并停止执行。
    if (!targetLink) {
        console.log(`❌ 未能找到标题为 "${chatTitle}" 的聊天链接。`);
        return;
    }

    console.log('✅ 成功找到目标聊天链接:', targetLink);

    // 4. 找到了链接后，我们把它当作一个"路标"。我们现在需要找到它所在的"房间"，
    //    也就是包含这个链接和选项按钮的共同父容器。
    //    通常，这个容器就是链接元素的直接父元素 `parentElement`。
    const chatItemContainer = targetLink.parentElement;

    if (!chatItemContainer) {
        console.log('❌ 无法找到聊天链接的父容器。');
        return;
    }

    console.log('✅ 找到了父容器:', chatItemContainer);

    // 5. 现在，我们在这个"房间"（父容器）里寻找"选项"按钮。
    //    根据你的截图，这个按钮有一个非常独特的 aria-label 属性，我们可以用它来精确定位。
    const optionsButton = chatItemContainer.querySelector('button[aria-label="Open conversation options"]');

    // 6. 如果没有找到按钮，就打印消息并停止。
    if (!optionsButton) {
        console.log(`❌ 在聊天 "${chatTitle}" 的容器中未能找到选项按钮。`);
        return;
    }

    console.log('✅ 成功在父容器中找到选项按钮:', optionsButton);
    console.log('🖱️ 正在尝试点击该按钮...');

    // 7. 点击按钮！
    optionsButton.click();

    console.log('✅ 成功点击选项按钮！');
}

// 运行主函数，并传入我们想要操作的那个聊天的标题。
// 你可以把 "Graduate Thesis Inquiry Email" 换成任何你想操作的聊天标题。
findAndClickChatOptionButton("Graduate Thesis Inquiry Email"); 