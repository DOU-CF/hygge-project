// ==================== 專案初始化 ====================
console.log("Hygge 專案啟動成功！");
console.log("📅 載入時間:", new Date().toLocaleString("zh-TW"));
console.log("🆕 升級版：支援多卡片並排顯示 + 響應式設計 + 喝水提醒");

// ==================== 全域變數 ====================
let todoApp = null;
let pomodoroTimer = null;
let waterReminder = null;
let noteManager = null;
let weatherManager = null;

// ==================== 卡片管理系統 ====================
class WidgetManager {
  constructor() {
    this.activeWidgets = new Set(); // 記錄已開啟的卡片
    this.init();
  }

  init() {
    this.bindDockEvents();
    this.bindCloseEvents();
    this.bindKeyboardEvents();
    console.log("✅ WidgetManager 初始化完成");
  }

  // 綁定 Dock 點擊事件
  bindDockEvents() {
    const dockItems = document.querySelectorAll(".dock-item");

    dockItems.forEach((item) => {
      item.addEventListener("click", () => {
        const widgetType = item.dataset.widget;
        this.toggleWidget(widgetType, item);
      });
    });
  }

  // 🆕 切換卡片（開啟/關閉）
  toggleWidget(type, dockItem) {
    const widget = document.querySelector(`#${type}-widget`);
    const welcomeMsg = document.querySelector(".welcome-message");

    if (!widget) {
      alert(`${type} 功能開發中，敬請期待！`);
      return;
    }

    // 如果卡片已開啟，則關閉
    if (this.activeWidgets.has(type)) {
      this.closeWidget(type, dockItem);
    } else {
      this.openWidget(type, widget, dockItem, welcomeMsg);
    }
  }

  // 🆕 開啟卡片
  openWidget(type, widget, dockItem, welcomeMsg) {
    // 隱藏歡迎訊息
    if (welcomeMsg) {
      welcomeMsg.style.display = "none";
    }

    // 顯示卡片
    widget.classList.add("active");
    widget.style.display = "block";

    // 標記 Dock 項目為啟用
    if (dockItem) {
      dockItem.classList.add("active");
    }

    // 記錄到已開啟集合
    this.activeWidgets.add(type);

    // 初始化對應的功能
    this.initWidgetFunction(type);

    console.log(`✅ 開啟卡片: ${type}`);
  }

  // 🆕 關閉卡片
  closeWidget(type, dockItem) {
    const widget = document.querySelector(`#${type}-widget`);

    if (widget) {
      widget.classList.remove("active");
      widget.style.display = "none";
    }

    // 移除 Dock 項目的啟用狀態
    if (dockItem) {
      dockItem.classList.remove("active");
    } else {
      // 如果沒有傳入 dockItem，手動查找
      const dockItems = document.querySelectorAll(".dock-item");
      dockItems.forEach((item) => {
        if (item.dataset.widget === type) {
          item.classList.remove("active");
        }
      });
    }

    // 從已開啟集合中移除
    this.activeWidgets.delete(type);

    // 如果沒有任何卡片開啟，顯示歡迎訊息
    if (this.activeWidgets.size === 0) {
      const welcomeMsg = document.querySelector(".welcome-message");
      if (welcomeMsg) {
        welcomeMsg.style.display = "block";
      }
    }

    console.log(`✅ 關閉卡片: ${type}`);
  }

  // 初始化對應功能
  initWidgetFunction(type) {
    switch (type) {
      case "todo":
        if (!todoApp) {
          todoApp = new TodoApp();
        }
        break;
      case "pomodoro":
        if (!pomodoroTimer) {
          pomodoroTimer = new PomodoroTimer();
        }
        break;
      case "water":
        if (!waterReminder) {
          waterReminder = new WaterReminder();
        }
        break;
      case "note":
        if (!noteManager) {
          noteManager = new NoteManager();
        }
        break;

      case "weather": // 👈 加入這整段
        if (!weatherManager) {
          weatherManager = new WeatherManager();
        }
        break;
    }
  }

  // 綁定關閉按鈕事件
  bindCloseEvents() {
    const closeButtons = document.querySelectorAll(".close-btn");

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const widgetType = btn.dataset.close;
        this.closeWidget(widgetType);
      });
    });
  }

  // 綁定鍵盤事件（Esc 關閉所有卡片）
  bindKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // 關閉所有卡片
        this.activeWidgets.forEach((type) => {
          this.closeWidget(type);
        });
      }
    });
  }
}

// ==================== Day 5: 待辦清單功能 ====================
class TodoApp {
  constructor() {
    console.log("📝 TodoApp 初始化中...");
    this.todos = this.loadTodos();
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    console.log("✅ TodoApp 初始化完成！");
  }

  cacheDom() {
    this.todoInput = document.querySelector("#todo-input");
    this.addBtn = document.querySelector("#add-todo-btn");
    this.todoList = document.querySelector("#todo-list");
    this.emptyState = document.querySelector("#todo-empty");
    this.todoCount = document.querySelector("#todo-count");
    this.clearBtn = document.querySelector("#clear-completed-btn");
  }

  bindEvents() {
    if (!this.addBtn || !this.todoInput || !this.clearBtn) {
      console.warn("⚠️ 待辦清單元素未找到");
      return;
    }

    this.addBtn.addEventListener("click", () => this.addTodo());
    this.todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTodo();
    });
    this.clearBtn.addEventListener("click", () => this.clearCompleted());
  }

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

    this.todoInput.value = "";
    this.todoInput.focus();

    console.log("✅ 新增待辦:", text);
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    if (confirm("確定要刪除這個待辦事項嗎？")) {
      this.todos = this.todos.filter((t) => t.id !== id);
      this.saveTodos();
      this.render();
    }
  }

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
    }
  }

  render() {
    if (!this.todoList || !this.emptyState || !this.todoCount) {
      return;
    }

    this.todoList.innerHTML = "";

    if (this.todos.length === 0) {
      this.emptyState.style.display = "block";
      this.todoList.style.display = "none";
    } else {
      this.emptyState.style.display = "none";
      this.todoList.style.display = "block";

      this.todos.forEach((todo) => {
        const li = this.createTodoElement(todo);
        this.todoList.appendChild(li);
      });
    }

    const activeCount = this.todos.filter((t) => !t.completed).length;
    this.todoCount.textContent = `共 ${this.todos.length} 項 (${activeCount} 項未完成)`;
  }

  createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;

    li.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? "checked" : ""}
      >
      <span class="todo-text">${this.escapeHtml(todo.text)}</span>
      <button class="todo-delete-btn">刪除</button>
    `;

    const checkbox = li.querySelector(".todo-checkbox");
    const deleteBtn = li.querySelector(".todo-delete-btn");

    checkbox.addEventListener("change", () => this.toggleTodo(todo.id));
    deleteBtn.addEventListener("click", () => this.deleteTodo(todo.id));

    return li;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveTodos() {
    localStorage.setItem("hygge-todos", JSON.stringify(this.todos));
  }

  loadTodos() {
    const saved = localStorage.getItem("hygge-todos");
    return saved ? JSON.parse(saved) : [];
  }
}

// ==================== Day 6: 番茄鐘功能 ====================
class PomodoroTimer {
  constructor() {
    console.log("🍅 PomodoroTimer 初始化中...");

    this.workTime = 25 * 60;
    this.breakTime = 5 * 60;
    this.timeLeft = this.workTime;
    this.totalTime = this.workTime;

    this.isRunning = false;
    this.isWorkTime = true;
    this.intervalId = null;

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.updateDisplay();
    console.log("✅ PomodoroTimer 初始化完成！");
  }

  cacheDom() {
    this.timerDisplay = document.querySelector("#timer-display");
    this.minutesDisplay = document.querySelector("#timer-minutes");
    this.secondsDisplay = document.querySelector("#timer-seconds");
    this.startBtn = document.querySelector("#start-btn");
    this.pauseBtn = document.querySelector("#pause-btn");
    this.resetBtn = document.querySelector("#reset-btn");
    this.statusText = document.querySelector("#timer-status");
    this.progressBar = document.querySelector("#progress-bar");
    this.workTimeInput = document.querySelector("#work-time-input");
    this.breakTimeInput = document.querySelector("#break-time-input");
  }

  bindEvents() {
    if (!this.startBtn || !this.pauseBtn || !this.resetBtn) {
      console.warn("⚠️ 番茄鐘按鈕元素未找到");
      return;
    }

    this.startBtn.addEventListener("click", () => this.start());
    this.pauseBtn.addEventListener("click", () => this.pause());
    this.resetBtn.addEventListener("click", () => this.reset());

    if (this.workTimeInput) {
      this.workTimeInput.addEventListener("change", () =>
        this.updateSettings()
      );
    }
    if (this.breakTimeInput) {
      this.breakTimeInput.addEventListener("change", () =>
        this.updateSettings()
      );
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;

    if (this.isWorkTime) {
      this.statusText.textContent = "🎯 專注中...保持專注！";
      this.timerDisplay.classList.add("running");
      this.timerDisplay.classList.remove("paused", "break");
    } else {
      this.statusText.textContent = "☕ 休息中...放鬆一下！";
      this.timerDisplay.classList.add("break");
      this.timerDisplay.classList.remove("running", "paused");
    }

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);

    console.log("▶️ 計時器已開始");
  }

  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.statusText.textContent = "⏸️ 已暫停";

    this.timerDisplay.classList.add("paused");
    this.timerDisplay.classList.remove("running", "break");

    clearInterval(this.intervalId);
    console.log("⏸️ 計時器已暫停");
  }

  reset() {
    this.pause();
    this.timeLeft = this.isWorkTime ? this.workTime : this.breakTime;
    this.totalTime = this.timeLeft;
    this.updateDisplay();
    this.updateProgress();

    this.statusText.textContent = this.isWorkTime
      ? "準備開始專注 25 分鐘"
      : "準備休息 5 分鐘";

    this.timerDisplay.classList.remove("running", "paused", "break");

    console.log("↻ 計時器已重置");
  }

  tick() {
    this.timeLeft--;
    this.updateDisplay();
    this.updateProgress();

    if (this.timeLeft <= 0) {
      this.complete();
    }
  }

  complete() {
    this.pause();

    if (this.isWorkTime) {
      alert("🎉 專注時間結束！休息一下吧！");
      this.isWorkTime = false;
      this.timeLeft = this.breakTime;
      this.totalTime = this.breakTime;
      this.statusText.textContent = "準備休息 5 分鐘";
    } else {
      alert("✨ 休息結束！準備繼續加油！");
      this.isWorkTime = true;
      this.timeLeft = this.workTime;
      this.totalTime = this.workTime;
      this.statusText.textContent = "準備開始專注 25 分鐘";
    }

    this.updateDisplay();
    this.updateProgress();
    this.timerDisplay.classList.remove("running", "paused", "break");
  }

  updateDisplay() {
    if (!this.minutesDisplay || !this.secondsDisplay) return;

    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;

    this.minutesDisplay.textContent = String(minutes).padStart(2, "0");
    this.secondsDisplay.textContent = String(seconds).padStart(2, "0");
  }

  updateProgress() {
    if (!this.progressBar) return;

    const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
    this.progressBar.style.width = `${progress}%`;
  }

  updateSettings() {
    if (!this.workTimeInput || !this.breakTimeInput) return;

    const newWorkTime = parseInt(this.workTimeInput.value) || 25;
    const newBreakTime = parseInt(this.breakTimeInput.value) || 5;

    this.workTime = newWorkTime * 60;
    this.breakTime = newBreakTime * 60;

    if (!this.isRunning) {
      this.timeLeft = this.isWorkTime ? this.workTime : this.breakTime;
      this.totalTime = this.timeLeft;
      this.updateDisplay();
      this.updateProgress();
    }
  }
}

// ==================== 🆕 Day 7: 喝水提醒功能 ====================
class WaterReminder {
  constructor() {
    console.log("💧 WaterReminder 初始化中...");

    // 喝水記錄
    this.waterCount = this.loadWaterCount();
    this.waterGoal = 8; // 目標 8 杯
    this.reminderInterval = null;
    this.reminderEnabled = true;
    this.reminderTime = 60; // 預設 60 分鐘提醒一次

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    this.startReminder();
    console.log("✅ WaterReminder 初始化完成！");
  }

  cacheDom() {
    this.waterAmount = document.querySelector("#water-amount");
    this.waterGoalText = document.querySelector("#water-goal");
    this.progressBar = document.querySelector("#water-progress-bar");
    this.addBtn = document.querySelector("#add-water-btn");
    this.resetBtn = document.querySelector("#reset-water-btn");
    this.reminderToggle = document.querySelector("#reminder-toggle");
    this.reminderTimeInput = document.querySelector("#reminder-time");
  }

  bindEvents() {
    if (!this.addBtn || !this.resetBtn) {
      console.warn("⚠️ 喝水提醒元素未找到");
      return;
    }

    this.addBtn.addEventListener("click", () => this.addWater());
    this.resetBtn.addEventListener("click", () => this.resetWater());

    if (this.reminderToggle) {
      this.reminderToggle.addEventListener("change", (e) => {
        this.reminderEnabled = e.target.checked;
        if (this.reminderEnabled) {
          this.startReminder();
        } else {
          this.stopReminder();
        }
      });
    }

    if (this.reminderTimeInput) {
      this.reminderTimeInput.addEventListener("change", (e) => {
        this.reminderTime = parseInt(e.target.value) || 60;
        this.startReminder(); // 重新啟動提醒
      });
    }
  }

  addWater() {
    this.waterCount++;
    this.saveWaterCount();
    this.render();

    // 達成目標時的提示
    if (this.waterCount === this.waterGoal) {
      alert("🎉 太棒了！你已經完成今天的喝水目標！");
    }

    console.log(`💧 喝水 +1，目前：${this.waterCount} 杯`);
  }

  resetWater() {
    if (confirm("確定要重置喝水記錄嗎？")) {
      this.waterCount = 0;
      this.saveWaterCount();
      this.render();
      console.log("↻ 喝水記錄已重置");
    }
  }

  render() {
    if (!this.waterAmount || !this.progressBar) return;

    // 更新數字顯示
    this.waterAmount.textContent = this.waterCount;

    // 更新進度條
    const progress = Math.min((this.waterCount / this.waterGoal) * 100, 100);
    this.progressBar.style.width = `${progress}%`;

    // 更新目標顯示
    if (this.waterGoalText) {
      this.waterGoalText.textContent = `目標：${this.waterGoal} 杯 / 2000ml`;
    }
  }

  // 開始提醒
  startReminder() {
    // 先停止現有的提醒
    this.stopReminder();

    if (!this.reminderEnabled) return;

    // 設定新的提醒
    const intervalMs = this.reminderTime * 60 * 1000; // 轉換成毫秒

    this.reminderInterval = setInterval(() => {
      this.showReminder();
    }, intervalMs);

    console.log(`⏰ 喝水提醒已啟動（每 ${this.reminderTime} 分鐘）`);
  }

  // 停止提醒
  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log("⏰ 喝水提醒已停止");
    }
  }

  // 顯示提醒
  showReminder() {
    if (this.waterCount < this.waterGoal) {
      alert("💧 該喝水囉！補充水分保持健康！");
      console.log("💧 顯示喝水提醒");
    }
  }

  // 儲存到 localStorage
  saveWaterCount() {
    localStorage.setItem("hygge-water-count", this.waterCount.toString());
    localStorage.setItem("hygge-water-date", new Date().toDateString());
  }

  // 從 localStorage 載入
  loadWaterCount() {
    const savedDate = localStorage.getItem("hygge-water-date");
    const today = new Date().toDateString();

    // 如果是新的一天，重置計數
    if (savedDate !== today) {
      localStorage.setItem("hygge-water-count", "0");
      localStorage.setItem("hygge-water-date", today);
      return 0;
    }

    const saved = localStorage.getItem("hygge-water-count");
    return saved ? parseInt(saved) : 0;
  }
}

// ==================== 程式啟動 ====================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Hygge 升級版啟動中...");

  // 初始化卡片管理系統
  const widgetManager = new WidgetManager();

  console.log("✅ Hygge 升級版啟動完成！");
  console.log("📝 功能列表：");
  console.log("  - 待辦清單");
  console.log("  - 番茄鐘");
  console.log("  - 💧 喝水提醒（新增）");
  console.log("  - 🆕 多卡片並排顯示");
  console.log("  - 🆕 響應式設計");
});

// ==================== 📒 Day 7: 筆記功能 ====================
class NoteManager {
  constructor() {
    console.log("📒 NoteManager 初始化中...");
    this.notes = this.loadNotes();
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    console.log("✅ NoteManager 初始化完成！");
  }

  cacheDom() {
    this.titleInput = document.querySelector("#note-title-input");
    this.contentInput = document.querySelector("#note-content-input");
    this.saveBtn = document.querySelector("#save-note-btn");
    this.notesList = document.querySelector("#notes-list");
    this.emptyState = document.querySelector("#notes-empty");
  }

  bindEvents() {
    if (!this.saveBtn || !this.titleInput || !this.contentInput) {
      console.warn("⚠️ 筆記元素未找到");
      return;
    }

    this.saveBtn.addEventListener("click", () => this.saveNote());

    this.contentInput.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.saveNote();
      }
    });
  }

  saveNote() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();

    if (!title) {
      alert("請輸入筆記標題！");
      this.titleInput.focus();
      return;
    }

    if (!content) {
      alert("請輸入筆記內容！");
      this.contentInput.focus();
      return;
    }

    const newNote = {
      id: Date.now(),
      title: title,
      content: content,
      createdAt: new Date().toLocaleString("zh-TW"),
      timestamp: Date.now(),
    };

    this.notes.unshift(newNote);
    this.saveToStorage();
    this.render();

    this.titleInput.value = "";
    this.contentInput.value = "";
    this.titleInput.focus();

    console.log("✅ 筆記已儲存:", title);
  }

  toggleNoteContent(id) {
    const noteElement = document.querySelector(`[data-note-id="${id}"]`);
    if (noteElement) {
      const contentElement = noteElement.querySelector(".note-item-content");
      const viewBtn = noteElement.querySelector(".note-view-btn");

      if (contentElement.classList.contains("expanded")) {
        contentElement.classList.remove("expanded");
        viewBtn.textContent = "👁️ 查看";
      } else {
        contentElement.classList.add("expanded");
        viewBtn.textContent = "👁️ 收起";
      }
    }
  }

  deleteNote(id) {
    const note = this.notes.find((n) => n.id === id);

    if (confirm(`確定要刪除「${note.title}」嗎？`)) {
      this.notes = this.notes.filter((n) => n.id !== id);
      this.saveToStorage();
      this.render();
      console.log("✅ 筆記已刪除:", note.title);
    }
  }

  render() {
    if (!this.notesList || !this.emptyState) {
      return;
    }

    this.notesList.innerHTML = "";

    if (this.notes.length === 0) {
      this.emptyState.style.display = "block";
      this.notesList.style.display = "none";
    } else {
      this.emptyState.style.display = "none";
      this.notesList.style.display = "block";

      this.notes.forEach((note) => {
        const noteElement = this.createNoteElement(note);
        this.notesList.appendChild(noteElement);
      });
    }
  }

  createNoteElement(note) {
    const div = document.createElement("div");
    div.className = "note-item";
    div.dataset.noteId = note.id;

    div.innerHTML = `
      <div class="note-item-header" onclick="noteManager.toggleNoteContent(${
        note.id
      })">
        <div class="note-item-title">${this.escapeHtml(note.title)}</div>
        <div class="note-item-date">${note.createdAt}</div>
      </div>
      <div class="note-item-content">${this.escapeHtml(note.content)}</div>
      <div class="note-item-actions">
        <button class="note-action-btn note-view-btn" onclick="noteManager.toggleNoteContent(${
          note.id
        })">
          👁️ 查看
        </button>
        <button class="note-action-btn note-delete-btn" onclick="noteManager.deleteNote(${
          note.id
        })">
          🗑️ 刪除
        </button>
      </div>
    `;

    return div;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveToStorage() {
    localStorage.setItem("hygge-notes", JSON.stringify(this.notes));
  }

  loadNotes() {
    const saved = localStorage.getItem("hygge-notes");
    return saved ? JSON.parse(saved) : [];
  }
}

// ==================== 🌤️ Day 7: 天氣功能 ====================
class WeatherManager {
  constructor() {
    console.log("🌤️ WeatherManager 初始化中...");

    // ⚠️ API Key！
    this.apiKey = "6ff75519f2f400207595592ab3ff4f45";
    this.city = this.loadCity() || "Kaohsiung";
    this.weatherData = null;

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.fetchWeather();
    console.log("✅ WeatherManager 初始化完成！");
  }

  cacheDom() {
    this.weatherIcon = document.querySelector("#weather-icon");
    this.weatherDescription = document.querySelector("#weather-description");
    this.weatherTemp = document.querySelector("#weather-temp");
    this.weatherLocation = document.querySelector("#weather-location");
    this.feelsLike = document.querySelector("#feels-like");
    this.humidity = document.querySelector("#humidity");
    this.windSpeed = document.querySelector("#wind-speed");
    this.pressure = document.querySelector("#pressure");
    this.updateTime = document.querySelector("#update-time");
    this.refreshBtn = document.querySelector("#refresh-weather-btn");
    this.cityInput = document.querySelector("#city-input");
    this.changeCityBtn = document.querySelector("#change-city-btn");
  }

  bindEvents() {
    if (!this.refreshBtn || !this.changeCityBtn) {
      console.warn("⚠️ 天氣元素未找到");
      return;
    }

    this.refreshBtn.addEventListener("click", () => this.fetchWeather());
    this.changeCityBtn.addEventListener("click", () => this.changeCity());
    this.cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.changeCity();
    });
  }

  // 獲取天氣資料
  async fetchWeather() {
    try {
      this.showLoading();

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}&units=metric&lang=zh_tw`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.weatherData = data;
      this.render();

      console.log("✅ 天氣資料獲取成功:", data);
    } catch (error) {
      console.error("❌ 獲取天氣失敗:", error);
      this.showError(error.message);
    }
  }

  // 顯示載入中
  showLoading() {
    if (this.weatherDescription) {
      this.weatherDescription.textContent = "載入中...";
    }
    if (this.weatherTemp) {
      this.weatherTemp.textContent = "--°C";
    }
  }

  // 顯示錯誤
  showError(message) {
    if (this.weatherDescription) {
      this.weatherDescription.textContent = "載入失敗";
      this.weatherDescription.style.color = "#ef4444";
    }
    if (this.weatherTemp) {
      this.weatherTemp.textContent = "😞";
    }

    alert(
      `無法獲取天氣資料：${message}\n\n請檢查：\n1. 城市名稱是否正確\n2. API Key 是否有效\n3. 網路連線是否正常`
    );
  }

  // 渲染畫面
  render() {
    if (!this.weatherData) return;

    const data = this.weatherData;

    // 天氣圖示
    if (this.weatherIcon) {
      this.weatherIcon.textContent = this.getWeatherIcon(data.weather[0].main);
    }

    // 天氣描述
    if (this.weatherDescription) {
      this.weatherDescription.textContent = data.weather[0].description;
      this.weatherDescription.style.color = "#666";
    }

    // 溫度
    if (this.weatherTemp) {
      const temp = Math.round(data.main.temp);
      this.weatherTemp.textContent = `${temp}°C`;

      // 根據溫度改變顏色
      this.weatherTemp.className = "weather-temp";
      if (temp >= 30) {
        this.weatherTemp.classList.add("hot");
      } else if (temp >= 20) {
        this.weatherTemp.classList.add("warm");
      } else if (temp >= 10) {
        this.weatherTemp.classList.add("cool");
      } else {
        this.weatherTemp.classList.add("cold");
      }
    }

    // 城市名稱
    if (this.weatherLocation) {
      this.weatherLocation.textContent = `📍 ${data.name}`;
    }

    // 詳細資訊
    if (this.feelsLike) {
      this.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    }
    if (this.humidity) {
      this.humidity.textContent = `${data.main.humidity}%`;
    }
    if (this.windSpeed) {
      this.windSpeed.textContent = `${data.wind.speed} m/s`;
    }
    if (this.pressure) {
      this.pressure.textContent = `${data.main.pressure} hPa`;
    }

    // 更新時間
    if (this.updateTime) {
      const now = new Date().toLocaleString("zh-TW");
      this.updateTime.textContent = `更新時間：${now}`;
    }
  }

  // 根據天氣狀況返回對應的 Emoji
  getWeatherIcon(weather) {
    const icons = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Smoke: "🌫️",
      Haze: "🌫️",
      Dust: "🌫️",
      Fog: "🌫️",
      Sand: "🌫️",
      Ash: "🌋",
      Squall: "💨",
      Tornado: "🌪️",
    };

    return icons[weather] || "🌤️";
  }

  // 更換城市
  changeCity() {
    const newCity = this.cityInput.value.trim();

    if (!newCity) {
      alert("請輸入城市名稱！");
      return;
    }

    this.city = newCity;
    this.saveCity();
    this.fetchWeather();

    console.log("✅ 城市已更換為:", newCity);
  }

  // 儲存城市到 localStorage
  saveCity() {
    localStorage.setItem("hygge-weather-city", this.city);
  }

  // 從 localStorage 載入城市
  loadCity() {
    return localStorage.getItem("hygge-weather-city");
  }
}

console.log("✅ 所有功能已載入！");
