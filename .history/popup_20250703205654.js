// 这个脚本在弹出窗口的上下文中运行。

document.getElementById('searchButton').addEventListener('click', async () => {
    // 获取用户输入的删除数量
    const deleteCount = document.getElementById('deleteCount').value;

    // 将数量存入 chrome.storage 中，以便 content.js 可以访问它。
    // 我们使用 parseInt 确保存入的是一个整数。
    await chrome.storage.local.set({ deleteCount: parseInt(deleteCount, 10) });

    // 获取用户当前正在查看的活动标签页。
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 以编程方式将 content.js 脚本注入到活动标签页中。
    // 这需要 manifest.json 文件中的 "scripting" 权限。
    // manifest.json 中的 "host_permissions" 确保这只在 chatgpt.com 上有效。
    // 如果在其他网站上尝试，控制台会显示错误，这是正常现象。
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });

    // 可选项：点击按钮后关闭弹出窗口。
    window.close();
}); 