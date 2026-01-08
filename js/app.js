// ==================== 專案初始化 ====================
// 除錯用：確認 JS 檔案已成功載入
console.log("Hygge 專案啟動成功！");
console.log("📅 載入時間:", new Date().toLocaleString("zh-TW"));

// Day 4: Dock 點擊互動
window.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM 載入完成，開始初始化功能...");
  // 選取所有 Dock 工具
  const dockItems = document.querySelectorAll(".dock-item");

  // 選取卡片系統相關元素
  // 因為我們改用 專屬的待辦清單卡片 (#todo-widget)，所以 Day 4 的程式碼需要調整。
  // Day 5: html 已刪 id="overlay", id="widget", id=... ⚠️ 這邊會找不到元素，所以是 null
  //const overlay = document.getElementById("overlay");
  //const widgetCard = document.getElementById("widgetCard");
  //const cardTitle = document.getElementById("cardTitle");
  //const cardBody = document.getElementById("cardBody");
  //const closeBtn = document.getElementById("closeBtn");

  //選取待辦清單卡片
  const todoWidget = document.querySelector("#todo-widget");
  const closeBtn = document.querySelector('[data-close="todo"]');

  // 檢查必要元素是否存在（方便偵錯）
  if (dockItems.length === 0) {
    console.warn("找不到任何 .dock-item");
  }
  //if (!overlay || !widgetCard || !cardTitle || !cardBody || !closeBtn) {
  //console.warn(
  //"Modal 或其子元素未正確命名或不存在 (overlay, widgetCard, cardTitle, cardBody, closeBtn)"

  if (!todoWidget) {
    console.warn("找不到 #todo-widget");
  }

  // 為每個工具加上點擊事件
  dockItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      // 防止點擊冒泡影響（如需要）
      e.stopPropagation();
      // 取得工具的類型
      const widgetType = this.dataset.widget || "未知";

      //openWidget(widgetType);
      // 目前只處理待辦清單
      if (widgetType === "todo") {
        openTodoWidget();
      } else {
        alert(`${widgetType} 功能開發中，敬請期待！`);
      }
    });
  });

  // 開啟卡片的函數
  //function openWidget(type) {
  //if (!overlay || !widgetCard || !cardTitle || !cardBody) return;
  // 設計卡片標題
  //cardTitle.textContent = getWidgetTitle(type);

  // 設定卡片內容
  //cardBody.innerHTML = getWidgetContent(type);

  // 顯示遮罩和卡片 （加上 active class)
  //overlay.classList.add("active");
  //widgetCard.classList.add("active");
  //}

  // 關閉卡片的函數
  //function closeWidget() {
  //if (!overlay || !widgetCard) return;
  // 移除 active class 來隱藏
  //overlay.classList.remove("active");
  //widgetCard.classList.remove("active");
  //}

  // 關閉按鈕的點擊事件
  //if (closeBtn) closeBtn.addEventListener("click", closeWidget);

  // 點擊遮罩也可以關閉卡片
  //if (overlay) overlay.addEventListener("click", closeWidget);

  // 支援按 Esc 關閉
  //document.addEventListener("keydown", function (e) {
  //if (e.key === "Escape") closeWidget();
  //});

  // 取得卡片標題的函數
  // function getWidgetTitle(type) {
  //   const titles = {
  //     todo: "📝 待辦清單",
  //     pomodoro: "🍅 番茄鐘",
  //     water: "💧 喝水提醒",
  //     weather: "🌤️ 天氣",
  //     note: "📒 筆記",
  //   };
  //   return titles[type] || "❓ 未知工具";
  // }

  // 取得卡片內容的函數
  // function getWidgetContent(type) {
  //   const contents = {
  //    todo: "<p>這是待辦清單的內容</p><p>（Day 5 會開發的實際功能）</p>",
  //     pomodoro: "<p>這是番茄鐘的內容</p><p>（Day 6 會開發的實際功能）</p>",
  //     water: "<p>這是喝水提醒的內容</p><p>（未來會開發）</p>",
  //     weather: "<p>這是天氣的內容</p><p>（未來會開發）</p>",
  //     note: "<p>這是筆記的內容</p><p>（未來會開發）</p>",
  //   };
  //   return contents[type] || "<p>❌ 找不到對應的內容</p>";
  // }

  // 開啟待辦清單卡片
  function openTodoWidget() {
    if (todoWidget) {
      todoWidget.style.display = "block";
      // 可選：加入淡入動畫
      todoWidget.style.animation = "fadeIn 0.3s ease";
    }
  }

  // 關閉待辦清單卡片
  function closeTodoWidget() {
    if (todoWidget) {
      todoWidget.style.display = "none";
    }
  }

  // 關閉按鈕事件
  if (closeBtn) {
    closeBtn.addEventListener("click", closeTodoWidget);
  }

  // 按 Esc 鍵關閉
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeTodoWidget();
    }
  });

  console.log("Dock 點擊事件已載入！");
});

// ==================== Day 5: 待辦清單功能 ====================

class TodoApp {
  constructor() {
    console.log("📝 TodoApp 初始化中...");
    this.todos = this.loadTodos();
    this.init();
  }

  // 初始化
  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    console.log("✅ TodoApp 初始化完成！");
  }

  // 快取 DOM 元素
  cacheDom() {
    this.todoInput = document.querySelector("#todo-input");
    this.addBtn = document.querySelector("#add-todo-btn");
    this.todoList = document.querySelector("#todo-list");
    this.emptyState = document.querySelector("#todo-empty");
    this.todoCount = document.querySelector("#todo-count");
    this.clearBtn = document.querySelector("#clear-completed-btn");
  }

  // 綁定事件
  bindEvents() {
    // 檢查元素是否存在
    if (!this.addBtn || !this.todoInput || !this.clearBtn) {
      console.warn("⚠️ 待辦清單元素未找到，跳過事件綁定");
      return;
    }

    // 新增待辦
    this.addBtn.addEventListener("click", () => this.addTodo());

    // Enter 鍵新增
    this.todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTodo();
    });

    // 清除已完成
    this.clearBtn.addEventListener("click", () => this.clearCompleted());
  }

  // 新增待辦
  addTodo() {
    const text = this.todoInput.value.trim();

    if (!text) {
      alert("請輸入待辦事項！");
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toLocaleDateString("zh-TW"),
    };

    this.todos.push(newTodo);
    this.saveTodos();
    this.render();

    // 清空輸入框
    this.todoInput.value = "";
    this.todoInput.focus();

    console.log("✅ 新增待辦:", text);
  }

  // 切換完成狀態
  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
      console.log(
        `✅ 切換待辦狀態: ${todo.text} → ${
          todo.completed ? "已完成" : "未完成"
        }`
      );
    }
  }

  // 刪除待辦
  deleteTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (confirm("確定要刪除這個待辦事項嗎？")) {
      this.todos = this.todos.filter((t) => t.id !== id);
      this.saveTodos();
      this.render();
      console.log("✅ 刪除待辦:", todo?.text);
    }
  }

  // 清除已完成
  clearCompleted() {
    const completedCount = this.todos.filter((t) => t.completed).length;

    if (completedCount === 0) {
      alert("沒有已完成的待辦事項！");
      return;
    }

    if (confirm(`確定要清除 ${completedCount} 個已完成的項目嗎？`)) {
      this.todos = this.todos.filter((t) => !t.completed);
      this.saveTodos();
      this.render();
      console.log(`✅ 清除 ${completedCount} 個已完成項目`);
    }
  }

  // 渲染畫面
  render() {
    if (!this.todoList || !this.emptyState || !this.todoCount) {
      console.warn("⚠️ 待辦清單 DOM 元素未找到");
      return;
    }

    // 清空列表
    this.todoList.innerHTML = "";

    // 顯示/隱藏空狀態
    if (this.todos.length === 0) {
      this.emptyState.style.display = "block";
      this.todoList.style.display = "none";
    } else {
      this.emptyState.style.display = "none";
      this.todoList.style.display = "block";

      // 渲染每個待辦
      this.todos.forEach((todo) => {
        const li = this.createTodoElement(todo);
        this.todoList.appendChild(li);
      });
    }

    // 更新計數
    const activeCount = this.todos.filter((t) => !t.completed).length;
    this.todoCount.textContent = `共 ${this.todos.length} 項 (${activeCount} 項未完成)`;
  }

  // 建立待辦元素
  createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? "checked" : ""}
      >
      <span class="todo-text">${this.escapeHtml(todo.text)}</span>
      <button class="todo-delete-btn">刪除</button>
    `;

    // 綁定事件
    const checkbox = li.querySelector(".todo-checkbox");
    const deleteBtn = li.querySelector(".todo-delete-btn");

    checkbox.addEventListener("change", () => this.toggleTodo(todo.id));
    deleteBtn.addEventListener("click", () => this.deleteTodo(todo.id));

    return li;
  }

  // 防止 XSS 攻擊
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // 儲存到 localStorage
  saveTodos() {
    localStorage.setItem("hygge-todos", JSON.stringify(this.todos));
  }

  // 從 localStorage 載入
  loadTodos() {
    const saved = localStorage.getItem("hygge-todos");
    return saved ? JSON.parse(saved) : [];
  }
}

// ==================== TodoApp 初始化 ====================
// 當待辦清單卡片開啟時，初始化 TodoApp
document.addEventListener("DOMContentLoaded", () => {
  // 確保 Day 4 的程式碼已經執行
  // 在使用者第一次點擊待辦清單時才初始化
  let todoApp = null;

  const todoWidget = document.querySelector("#todo-widget");

  // 檢查元素是否存在
  if (!todoWidget) {
    console.warn("⚠️ 找不到 #todo-widget，待辦清單功能無法初始化");
    return;
  }

  // 監聽卡片的顯示狀態
  const observer = new MutationObserver(() => {
    if (todoWidget.style.display !== "none" && !todoApp) {
      todoApp = new TodoApp();
    }
  });

  observer.observe(todoWidget, {
    attributes: true,
    attributeFilter: ["style"],
  });
});

console.log("✅ 待辦清單功能已載入！");
