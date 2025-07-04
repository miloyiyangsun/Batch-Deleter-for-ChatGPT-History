// 当弹出窗口加载完成后，立即执行此函数以恢复上次的数值
document.addEventListener('DOMContentLoaded', async () => {
    const { deleteCount } = await chrome.storage.local.get('deleteCount');
    if (deleteCount) {
        document.getElementById('deleteCount').value = deleteCount;
    }
});

// 用户点击按钮时的行为保持不变
document.getElementById('searchButton').addEventListener('click', async () => {
    const deleteCount = document.getElementById('deleteCount').value;

    await chrome.storage.local.set({ deleteCount: parseInt(deleteCount, 10) });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });

    window.close();
}); 