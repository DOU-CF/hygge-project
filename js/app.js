console.log("Hygge 專案啟動成功！");

// Day 4: Dock 點擊互動
window.addEventListener('DOMContentLoaded', function() {
   // 選取所有 Dock 工具
   const dockItems = document.querySelectorAll('.dock-item');

   // 為每個工具加上點擊事件
   dockItems.forEach(item => {
       item.addEventListener('click', function() {
           // 取得工具的類型
           const widgetType = this.dataset.widget || '未知類型';
           // 測試
           alert('你點擊了：' + widgetType);
       });
   });

   console.log('Dock 點擊事件已載入！');
});