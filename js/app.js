console.log("Hygge 專案啟動成功！");

// Day 4: Dock 點擊互動
window.addEventListener('DOMContentLoaded', function() {
   // 選取所有 Dock 工具
   const dockItems = document.querySelectorAll('.dock-item');

   // 選取卡片系統相關元素
   const overlay = document.getElementById('overlay');
   const widgetCard = document.getElementById('widgetCard');
   const cardTitle = document.getElementById('cardTitle');
   const cardBody = document.getElementById('cardBody');
   const closeBtn = document.getElementById('closeBtn');

   // 為每個工具加上點擊事件
   dockItems.forEach(item => {
       item.addEventListener('click', function() {
           // 取得工具的類型
           const widgetType = this.dataset.widget || '未知類型';
           // 測試版：使用 alert 測試點擊事件是否正常觸發  （已停用）
           // alert('你點擊了：' + widgetType);

           // 正式版：使用卡片視窗
           openWidget(widgetType);
       });
   });

   // 開啟卡片的函數
   function openWidget(type) {
      // 設計卡片標題
      cardTitle.textContent = getWidgetTitle(type);

      // 設定卡片內容
      cardBody.innerHTML = getWidgetContent(type);

      // 顯示遮罩和卡片 （加上 active class)
      overlay.classList.add('active');
      widgetCard.classList.add('active');
   }

   // 關閉卡片的函數
   function closeWidget() {
      // 移除 active class 來隱藏
      overlay.classList.remove('active');
   }

   // 關閉按鈕的點擊事件
   closeBtn.addEventListener('click', closeWidget);

   // 點擊遮罩也可以關閉卡片
   overlay.addEventListener('click', closeWidget);

   // 取得卡片標題的函數
   function getWidgetTitle(type) {
      const title = {
         'todo': '📝 待辦清單',
         'pomodoro': '🍅 番茄鐘',
         'water': '💧 喝水提醒',
         'weather': '🌤️ 天氣',
         'note': '📒 筆記'
      };
      return titles[type] || ' ❓ 未知工具 ';
   }
   
   // 取得卡片內容的函數
   function getWidgetContent(type) {
      const content = {
         'todo'= '<p>這是待辦清單的內容</p><p>（Day 5 會開發的實際功能）</p>',
         'pomodoro'= '<p>這是番茄鐘的內容</p><p>（Day 6 會開發的實際功能）</p>',
         'water'= '<p>這是喝水提醒的內容</p><p>（未來會開發）</p>',
         'weather' = '<p>這是天氣的內容</p><p>（未來會開發）</p>',
         'note' = '<p>這是筆記的內容</p><p>（未來會開發）</p>',
      };
      return contents[type] || '<p>❌ 找不到對應的內容</P>
   }
   console.log('Dock 點擊事件已載入！');
});
