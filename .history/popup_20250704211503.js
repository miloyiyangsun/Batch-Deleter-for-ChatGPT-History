// 当弹出窗口加载完成后，立即执行此函数以恢复上次的数值
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-delete-button');
    const countInput = document.getElementById('delete-count');
    const statusDiv = document.getElementById('status');

    // Load the saved count from storage and set it to the input field
    chrome.storage.local.get(['deleteCount'], (result) => {
        if (result.deleteCount) {
            countInput.value = result.deleteCount;
        }
    });

    // Save the count to storage whenever it changes
    countInput.addEventListener('change', () => {
        const count = parseInt(countInput.value, 10);
        if (count > 0) {
            chrome.storage.local.set({ deleteCount: count });
        }
    });

    startButton.addEventListener('click', async () => {
        statusDiv.textContent = 'Triggering deletion...';
        
        // 在未来的步骤中，我们将在这里发送消息给 content.js 来启动删除
        // For now, this button's old script injection logic is removed.
        console.log(" 'Start Deleting' button clicked. Deletion logic will be implemented in the next step.");
        
        statusDiv.textContent = 'Deletion command sent. Check the console on the ChatGPT page.';
    });
}); 