// 当弹窗的HTML内容加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    const deleteCountInput = document.getElementById('deleteCount');

    // 从存储中读取上次保存的值并设置到输入框中
    const { deleteCount: storedCount } = await chrome.storage.local.get('deleteCount');
    if (deleteCountInput && storedCount) {
        deleteCountInput.value = storedCount;
    }
});

// 为"开始删除"按钮添加点击事件监听器
document.getElementById('deleteButton').addEventListener('click', async () => {
    const deleteCountInput = document.getElementById('deleteCount');
    const deleteCount = parseInt(deleteCountInput.value, 10);

    // 将用户输入的数量保存到存储中
    await chrome.storage.local.set({ deleteCount: deleteCount });

    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 如果获取到了活动标签页，则在其中执行删除脚本
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    }
    window.close(); // 执行后关闭弹窗
}); 