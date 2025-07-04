// 当弹窗加载完成时，此函数自动执行
document.addEventListener('DOMContentLoaded', function () {
    const numberInput = document.getElementById('numberToDelete');
    // 从Chrome存储中读取并恢复上次输入的删除数量
    chrome.storage.local.get('deleteCount', function (data) {
        if (data.deleteCount) {
            numberInput.value = data.deleteCount;
        }
    });
});

// 当用户点击"Start Deleting"按钮提交表单时，此函数被调用
document.getElementById('deleteForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const numberToDelete = document.getElementById('numberToDelete').value;
    const count = parseInt(numberToDelete, 10);

    if (isNaN(count) || count < 1) {
        alert('Please enter a valid number greater than 0.');
        return;
    }

    // 将用户输入的有效数值保存到Chrome存储中，以备下次使用
    chrome.storage.local.set({ deleteCount: count }, function () {
        console.log('删除数量已保存: ', count);
    });

    // 查询当前活动的标签页，以确保只在ChatGPT页面上执行脚本
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        if (activeTab.url.startsWith("https://chat.openai.com/")) {
            // 在目标页面上执行核心的删除脚本
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            });
            window.close();
        } else {
            alert('This extension only works on chat.openai.com');
        }
    });
}); 