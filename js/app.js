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

  // 檢查必要元素是否存在（方便偵錯）
  if (dockItems.length === 0) {
    console.warn('找不到任何 .dock-item');
  }
  if (!overlay || !widgetCard || !cardTitle || !cardBody || !closeBtn) {
    console.warn('Modal 或其子元素未正確命名或不存在 (overlay, widgetCard, cardTitle, cardBody, closeBtn)');
  }

  // 為每個工具加上點擊事件
  dockItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // 防止點擊冒泡影響（如需要）
      e.stopPropagation();
      // 取得工具的類型
      const widgetType = this.dataset.widget || '未知';
      openWidget(widgetType);
    });
  });

  // 開啟卡片的函數
  function openWidget(type) {
    if (!overlay || !widgetCard || !cardTitle || !cardBody) return;
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
    if (!overlay || !widgetCard) return;
    // 移除 active class 來隱藏
    overlay.classList.remove('active');
    widgetCard.classList.remove('active');
  }

  // 關閉按鈕的點擊事件
  if (closeBtn) closeBtn.addEventListener('click', closeWidget);

  // 點擊遮罩也可以關閉卡片
  if (overlay) overlay.addEventListener('click', closeWidget);

  // 支援按 Esc 關閉
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeWidget();
  });

  // 取得卡片標題的函數
  function getWidgetTitle(type) {
    const titles = {
      'todo': '📝 待辦清單',
      'pomodoro': '🍅 番茄鐘',
      'water': '💧 喝水提醒',
      'weather': '🌤️ 天氣',
      'note': '📒 筆記'
    };
    return titles[type] || '❓ 未知工具';
  }

  // 取得卡片內容的函數
  function getWidgetContent(type) {
    const contents = {
      'todo': '<p>這是待辦清單的內容</p><p>（Day 5 會開發的實際功能）</p>',
      'pomodoro': '<p>這是番茄鐘的內容</p><p>（Day 6 會開發的實際功能）</p>',
      'water': '<p>這是喝水提醒的內容</p><p>（未來會開發）</p>',
      'weather': '<p>這是天氣的內容</p><p>（未來會開發）</p>',
      'note': '<p>這是筆記的內容</p><p>（未來會開發）</p>'
    };
    return contents[type] || '<p>❌ 找不到對應的內容</p>';
  }

  console.log('Dock 點擊事件已載入！');
});
