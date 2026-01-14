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
let weeklyPlanner = null;
let ganttChart = null;

// ==================== 🆕 B階段：AppState 統一數據管理 ====================
class AppState {
  constructor() {
    this.todos = [];
    this.observers = []; // 訂閱者列表
    console.log("✅ AppState 初始化");
  }

  // 訂閱通知
  subscribe(observer) {
    this.observers.push(observer);
    console.log(`✅ ${observer.constructor.name} 已訂閱`);
  }

  // 更新單個 todo
  updateTodo(id, updates) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      // ✨ 特殊處理：重複任務的完成狀態
      if (todo.taskType === "recurring" && updates.completed !== undefined) {
        // 重複任務不直接設置 completed
        // 而是記錄具體日期的完成狀態
        if (updates.date) {
          // 初始化 completionRecords
          if (!todo.completionRecords) {
            todo.completionRecords = {};
          }
          // 記錄該日期的完成狀態
          todo.completionRecords[updates.date] = updates.completed;
          console.log(
            `✅ 重複任務完成記錄已更新: ${updates.date} = ${updates.completed}`
          );
        }
        // 刪除 updates 中的 completed，避免修改主狀態
        delete updates.completed;
        delete updates.date;
      }

      // 應用其他更新
      Object.assign(todo, updates);
      this.save();
      this.notifyAll();
      console.log("✅ Todo 已更新:", id);
    }
  }

  // 通知所有訂閱者
  notifyAll() {
    this.observers.forEach((observer) => {
      if (observer.update) {
        observer.update();
      }
    });
  }

  // 保存到 localStorage
  save() {
    localStorage.setItem("hygge-todos", JSON.stringify(this.todos));
  }

  // 從 localStorage 載入
  load() {
    const saved = localStorage.getItem("hygge-todos");
    this.todos = saved ? JSON.parse(saved) : [];
    window.todos = this.todos; // 同步到全域變數（向下兼容）
    return this.todos;
  }
}

// ==================== 卡片管理系統 ====================
class WidgetManager {
  constructor() {
    this.activeWidgets = new Set();
    this.init();
  }

  init() {
    this.bindDockEvents();
    this.bindCloseEvents();
    this.bindKeyboardEvents();
    console.log("✅ WidgetManager 初始化完成");
  }

  bindDockEvents() {
    const dockItems = document.querySelectorAll(".dock-item");
    dockItems.forEach((item) => {
      item.addEventListener("click", () => {
        const widgetType = item.dataset.widget;
        this.toggleWidget(widgetType, item);
      });
    });
  }

  toggleWidget(type, dockItem) {
    const widget = document.querySelector(`#${type}-widget`);
    const welcomeMsg = document.querySelector(".welcome-message");

    if (!widget) {
      alert(`${type} 功能開發中，敬請期待！`);
      return;
    }

    if (this.activeWidgets.has(type)) {
      this.closeWidget(type, dockItem);
    } else {
      this.openWidget(type, widget, dockItem, welcomeMsg);
    }
  }

  openWidget(type, widget, dockItem, welcomeMsg) {
    if (welcomeMsg) {
      welcomeMsg.style.display = "none";
    }
    widget.classList.add("active");
    widget.style.display = "block";
    if (dockItem) {
      dockItem.classList.add("active");
    }
    this.activeWidgets.add(type);
    this.initWidgetFunction(type);
    console.log(`✅ 開啟卡片: ${type}`);
  }

  closeWidget(type, dockItem) {
    const widget = document.querySelector(`#${type}-widget`);
    if (widget) {
      widget.classList.remove("active");
      widget.style.display = "none";
    }
    if (dockItem) {
      dockItem.classList.remove("active");
    } else {
      const dockItems = document.querySelectorAll(".dock-item");
      dockItems.forEach((item) => {
        if (item.dataset.widget === type) {
          item.classList.remove("active");
        }
      });
    }
    this.activeWidgets.delete(type);
    if (this.activeWidgets.size === 0) {
      const welcomeMsg = document.querySelector(".welcome-message");
      if (welcomeMsg) {
        welcomeMsg.style.display = "block";
      }
    }
    console.log(`✅ 關閉卡片: ${type}`);
  }

  initWidgetFunction(type) {
    switch (type) {
      case "todo":
        if (!todoApp) todoApp = new TodoApp(window.appState); // ✅ 加參數
        break;
      case "pomodoro":
        if (!pomodoroTimer) pomodoroTimer = new PomodoroTimer();
        break;
      case "water":
        if (!waterReminder) waterReminder = new WaterReminder();
        break;
      case "note":
        if (!noteManager) noteManager = new NoteManager();
        break;
      case "weather":
        if (!weatherManager) weatherManager = new WeatherManager();
        break;
      case "weekly":
        if (!weeklyPlanner) weeklyPlanner = new WeeklyPlanner(window.appState); // ✅ 加參數
        break;
      case "gantt":
        if (!ganttChart) ganttChart = new GanttChart(window.appState); // ✅ 加參數
        break;
    }
  }

  bindCloseEvents() {
    const closeButtons = document.querySelectorAll(".close-btn");
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const widgetType = btn.dataset.close;
        this.closeWidget(widgetType);
      });
    });
  }

  bindKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.activeWidgets.forEach((type) => {
          this.closeWidget(type);
        });
      }
    });
  }
}

// ==================== Day 5: 待辦清單功能 ====================
class TodoApp {
  constructor(appState) {
    // ✏️ 加一個參數
    console.log("📝 TodoApp 初始化中...");
    this.appState = appState; // ✏️ 新增這行
    this.appState.subscribe(this); // ✏️ 新增這行：訂閱數據變化
    this.todos = this.appState.load(); // ✏️ 改這行
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    console.log("✅ TodoApp 初始化完成！");
  }

  // ✏️ 新增：當數據變化時自動調用
  update() {
    this.todos = this.appState.todos;
    this.render();
  }

  cacheDom() {
    this.todoInput = document.querySelector("#todo-input");
    this.addBtn = document.querySelector("#add-todo-btn");
    this.todoList = document.querySelector("#todo-list");
    this.emptyState = document.querySelector("#todo-empty");
    this.todoCount = document.querySelector("#todo-count");
    this.clearBtn = document.querySelector("#clear-completed-btn");
    this.editModal = document.querySelector("#edit-modal-overlay");
    this.editTextInput = document.querySelector("#edit-todo-text");
    this.editProjectSelect = document.querySelector("#edit-todo-project");
    this.editWeekdaySelect = document.querySelector("#edit-todo-weekday");
    this.editProgressInput = document.querySelector("#edit-todo-progress");
    this.progressValue = document.querySelector("#progress-value");
    this.priorityBtns = document.querySelectorAll(".priority-btn");
    this.saveEditBtn = document.querySelector("#save-edit-btn");
    this.cancelEditBtn = document.querySelector("#cancel-edit-btn");
    this.closeEditModalBtn = document.querySelector("#close-edit-modal");

    // ✨ 新增：任務類型選擇
    this.taskTypeBtns = document.querySelectorAll(".task-type-btn");
    this.datePickerGroup = document.querySelector("#date-picker-group");
    this.weekdayPickerGroup = document.querySelector("#weekday-picker-group");
    this.editDateInput = document.querySelector("#edit-todo-date");
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
    if (this.saveEditBtn) {
      this.saveEditBtn.addEventListener("click", () => this.saveEdit());
    }
    if (this.cancelEditBtn) {
      this.cancelEditBtn.addEventListener("click", () => this.closeEditModal());
    }
    if (this.closeEditModalBtn) {
      this.closeEditModalBtn.addEventListener("click", () =>
        this.closeEditModal()
      );
    }
    if (this.editModal) {
      this.editModal.addEventListener("click", (e) => {
        if (e.target === this.editModal) {
          this.closeEditModal();
        }
      });
    }
    if (this.editProgressInput) {
      this.editProgressInput.addEventListener("input", (e) => {
        this.progressValue.textContent = `${e.target.value}%`;
      });
    }
    this.priorityBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.priorityBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // ✨ 新增：任務類型切換
    this.taskTypeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // 移除所有 active
        this.taskTypeBtns.forEach((b) => b.classList.remove("active"));
        // 設定當前為 active
        btn.classList.add("active");

        const type = btn.dataset.type;

        // 根據類型顯示/隱藏對應欄位
        if (type === "once") {
          // 單次任務：顯示日期選擇
          this.datePickerGroup.style.display = "block";
          this.weekdayPickerGroup.style.display = "none";

          // 設定預設日期為今天
          if (!this.editDateInput.value) {
            const today = new Date().toISOString().split("T")[0];
            this.editDateInput.value = today;
          }
        } else if (type === "recurring") {
          // 重複任務：顯示星期選擇
          this.datePickerGroup.style.display = "none";
          this.weekdayPickerGroup.style.display = "block";
        } else {
          // 無時間安排：隱藏所有
          this.datePickerGroup.style.display = "none";
          this.weekdayPickerGroup.style.display = "none";
        }
      });
    });
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
    const priorityIcon =
      todo.priority === "high"
        ? "🔴"
        : todo.priority === "medium"
        ? "🟡"
        : todo.priority === "low"
        ? "🟢"
        : "";
    li.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? "checked" : ""}
      >
      <span class="todo-text">
        ${priorityIcon} ${this.escapeHtml(todo.text)}
        ${
          todo.project
            ? `<span class="todo-project-tag">${todo.project}</span>`
            : ""
        }
      </span>
      <div class="todo-actions">
        <button class="todo-edit-btn" title="編輯">✏️</button>
        <button class="todo-delete-btn" title="刪除">🗑️</button>
      </div>
    `;
    const checkbox = li.querySelector(".todo-checkbox");
    const editBtn = li.querySelector(".todo-edit-btn");
    const deleteBtn = li.querySelector(".todo-delete-btn");
    checkbox.addEventListener("change", () => this.toggleTodo(todo.id));
    editBtn.addEventListener("click", () => this.openEditModal(todo.id));
    deleteBtn.addEventListener("click", () => this.deleteTodo(todo.id));
    return li;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveTodos() {
    this.appState.todos = this.todos; // ✏️ 改這行
    this.appState.save(); // ✏️ 改這行
    this.appState.notifyAll(); // ✏️ 新增這行：通知其他視圖
  }

  loadTodos() {
    return this.appState.load(); // ✏️ 改這行
  }

  openEditModal(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    this.currentEditId = id;
    this.editTextInput.value = todo.text;
    this.editProjectSelect.value = todo.project || "";
    this.editProgressInput.value = todo.progress || 0;
    this.progressValue.textContent = `${todo.progress || 0}%`;

    // ✨ 設定任務類型
    const taskType = todo.taskType || "none";
    this.taskTypeBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.type === taskType) {
        btn.classList.add("active");
      }
    });

    // ✨ 根據類型顯示對應欄位
    if (taskType === "once") {
      // 單次任務：顯示日期選擇
      this.datePickerGroup.style.display = "block";
      this.weekdayPickerGroup.style.display = "none";
      this.editDateInput.value =
        todo.date || new Date().toISOString().split("T")[0];
    } else if (taskType === "recurring") {
      // 重複任務：顯示星期選擇
      this.datePickerGroup.style.display = "none";
      this.weekdayPickerGroup.style.display = "block";
      this.editWeekdaySelect.value = todo.weekDay || "";
    } else {
      // 無時間安排：隱藏所有
      this.datePickerGroup.style.display = "none";
      this.weekdayPickerGroup.style.display = "none";
    }

    // 優先級設定
    this.priorityBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.priority === todo.priority) {
        btn.classList.add("active");
      }
    });

    this.editModal.classList.add("active");
    this.editTextInput.focus();
    console.log("✅ 開啟編輯對話框:", todo);
  }

  closeEditModal() {
    this.editModal.classList.remove("active");
    this.currentEditId = null;
    console.log("✅ 關閉編輯對話框");
  }

  saveEdit() {
    const text = this.editTextInput.value.trim();
    if (!text) {
      alert("請輸入任務標題！");
      this.editTextInput.focus();
      return;
    }

    const todo = this.todos.find((t) => t.id === this.currentEditId);
    if (!todo) return;

    // 基本資訊
    todo.text = text;
    todo.project = this.editProjectSelect.value || null;
    todo.progress = parseInt(this.editProgressInput.value) || 0;

    const activePriorityBtn = document.querySelector(".priority-btn.active");
    todo.priority = activePriorityBtn
      ? activePriorityBtn.dataset.priority
      : null;

    // ✨ 獲取任務類型
    const activeTypeBtn = document.querySelector(".task-type-btn.active");
    const taskType = activeTypeBtn ? activeTypeBtn.dataset.type : "none";

    todo.taskType = taskType;

    // ✨ 根據類型保存不同欄位
    if (taskType === "once") {
      // 單次任務：保存日期，清除星期
      todo.date = this.editDateInput.value || null;
      todo.weekDay = null;
    } else if (taskType === "recurring") {
      // 重複任務：保存星期，清除日期
      todo.weekDay = this.editWeekdaySelect.value || null;
      todo.date = null;
    } else {
      // 無時間安排：清除所有
      todo.date = null;
      todo.weekDay = null;
    }

    this.saveTodos();
    this.render();
    this.closeEditModal();

    console.log("✅ 任務已更新:", todo);
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

// ==================== 🆕 優化版喝水提醒功能 ====================
class WaterReminder {
  constructor() {
    console.log("💧 WaterReminder 優化版初始化中...");
    this.cupSize = this.loadCupSize() || 250;
    this.waterGoal = this.loadWaterGoal() || 2000;
    this.waterAmount = this.loadWaterAmount();
    this.reminderInterval = null;
    this.reminderEnabled = true;
    this.reminderTime = 60;
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    this.startReminder();
    console.log("✅ WaterReminder 優化版初始化完成！");
  }

  cacheDom() {
    this.waterAmountML = document.querySelector("#water-amount-ml");
    this.waterGoalML = document.querySelector("#water-goal-ml");
    this.waterPercentage = document.querySelector("#water-percentage");
    this.progressBar = document.querySelector("#water-progress-bar");
    this.progressText = document.querySelector("#progress-text");
    this.addBtn = document.querySelector("#add-water-btn");
    this.resetBtn = document.querySelector("#reset-water-btn");
    this.currentCupSizeSpan = document.querySelector("#current-cup-size");
    this.reminderToggle = document.querySelector("#reminder-toggle");
    this.reminderTimeInput = document.querySelector("#reminder-time");
    this.waterGoalInput = document.querySelector("#water-goal-input");
    this.cupSizeOptions = document.querySelector("#cup-size-options");
    this.cupButtons = document.querySelectorAll(".cup-btn");
  }

  bindEvents() {
    if (!this.addBtn || !this.resetBtn) {
      console.warn("⚠️ 喝水提醒元素未找到");
      return;
    }
    this.addBtn.addEventListener("click", () => this.addWater());
    this.resetBtn.addEventListener("click", () => this.resetWater());
    if (this.cupSizeOptions) {
      this.cupButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const size = parseInt(e.currentTarget.dataset.size);
          this.changeCupSize(size);
        });
      });
    }
    if (this.waterGoalInput) {
      this.waterGoalInput.addEventListener("change", (e) => {
        const newGoal = parseInt(e.target.value) || 2000;
        this.waterGoal = Math.max(500, Math.min(5000, newGoal));
        this.saveWaterGoal();
        this.render();
        console.log(`🎯 目標已更新為：${this.waterGoal}ml`);
      });
    }
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
        this.startReminder();
      });
    }
  }

  changeCupSize(size) {
    this.cupSize = size;
    this.saveCupSize();
    this.cupButtons.forEach((btn) => {
      if (parseInt(btn.dataset.size) === size) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    if (this.currentCupSizeSpan) {
      this.currentCupSizeSpan.textContent = `(${size}ml)`;
    }
    console.log(`🥤 水杯容量已更換為：${size}ml`);
  }

  addWater() {
    this.waterAmount += this.cupSize;
    this.saveWaterAmount();
    this.render();
    if (
      this.waterAmount >= this.waterGoal &&
      this.waterAmount - this.cupSize < this.waterGoal
    ) {
      this.showGoalAchieved();
    }
    console.log(`💧 喝水 +${this.cupSize}ml，目前：${this.waterAmount}ml`);
  }

  showGoalAchieved() {
    alert("🎉 太棒了！你已經完成今天的喝水目標！");
    if (this.waterPercentage) {
      this.waterPercentage.classList.add("goal-achieved");
      setTimeout(() => {
        this.waterPercentage.classList.remove("goal-achieved");
      }, 600);
    }
    if (this.progressBar) {
      this.progressBar.classList.add("goal-achieved");
    }
  }

  resetWater() {
    if (confirm("確定要重置今日喝水記錄嗎？")) {
      this.waterAmount = 0;
      this.saveWaterAmount();
      this.render();
      console.log("↻ 喝水記錄已重置");
    }
  }

  render() {
    if (this.waterAmountML) {
      this.waterAmountML.textContent = `${this.waterAmount} ml`;
    }
    if (this.waterGoalML) {
      this.waterGoalML.textContent = `${this.waterGoal} ml`;
    }
    const percentage = Math.min(
      Math.round((this.waterAmount / this.waterGoal) * 100),
      100
    );
    if (this.waterPercentage) {
      this.waterPercentage.textContent = `${percentage}%`;
    }
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`;
      if (this.progressText) {
        this.progressText.textContent = `${this.waterAmount} ml`;
      }
    }
    if (this.waterGoalInput) {
      this.waterGoalInput.value = this.waterGoal;
    }
    this.cupButtons.forEach((btn) => {
      if (parseInt(btn.dataset.size) === this.cupSize) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    if (this.currentCupSizeSpan) {
      this.currentCupSizeSpan.textContent = `(${this.cupSize}ml)`;
    }
  }

  startReminder() {
    this.stopReminder();
    if (!this.reminderEnabled) return;
    const intervalMs = this.reminderTime * 60 * 1000;
    this.reminderInterval = setInterval(() => {
      this.showReminder();
    }, intervalMs);
    console.log(`⏰ 喝水提醒已啟動（每 ${this.reminderTime} 分鐘）`);
  }

  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log("⏰ 喝水提醒已停止");
    }
  }

  showReminder() {
    if (this.waterAmount < this.waterGoal) {
      const remaining = this.waterGoal - this.waterAmount;
      alert(`💧 該喝水囉！\n\n還差 ${remaining}ml 就達成今日目標了！`);
      console.log("💧 顯示喝水提醒");
    }
  }

  saveCupSize() {
    localStorage.setItem("hygge-cup-size", this.cupSize.toString());
  }

  loadCupSize() {
    const saved = localStorage.getItem("hygge-cup-size");
    return saved ? parseInt(saved) : null;
  }

  saveWaterGoal() {
    localStorage.setItem("hygge-water-goal", this.waterGoal.toString());
  }

  loadWaterGoal() {
    const saved = localStorage.getItem("hygge-water-goal");
    return saved ? parseInt(saved) : null;
  }

  saveWaterAmount() {
    localStorage.setItem("hygge-water-amount", this.waterAmount.toString());
    localStorage.setItem("hygge-water-date", new Date().toDateString());
  }

  loadWaterAmount() {
    const savedDate = localStorage.getItem("hygge-water-date");
    const today = new Date().toDateString();
    if (savedDate !== today) {
      localStorage.setItem("hygge-water-amount", "0");
      localStorage.setItem("hygge-water-date", today);
      return 0;
    }
    const saved = localStorage.getItem("hygge-water-amount");
    return saved ? parseInt(saved) : 0;
  }
}

console.log("✅ WaterReminder 優化版已載入！");

// ==================== 程式啟動 ====================
// ==================== 程式啟動 ====================
// ==================== 程式啟動 ====================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Hygge 升級版啟動中...");

  // ✏️ 新增：創建全域 AppState
  window.appState = new AppState();

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
// ==================== 🌤️ Day 7: 天氣功能 ====================
class WeatherManager {
  constructor() {
    console.log("🌤️ WeatherManager 初始化中...");

    // ✅ 從 AppConfig 讀取
    if (window.AppConfig && window.AppConfig.weather) {
      this.apiUrl = window.AppConfig.weather.apiUrl;
      this.city = this.loadCity() || window.AppConfig.weather.defaultCity;
    } else {
      console.error("❌ AppConfig 未載入！");
      alert("配置文件載入失敗，請重新整理頁面");
      return;
    }

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

  async fetchWeather() {
    try {
      this.showLoading();
      // ✅ 使用後端 API
      const url = `${this.apiUrl}?city=${this.city}`;
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

  showLoading() {
    if (this.weatherDescription) {
      this.weatherDescription.textContent = "載入中...";
    }
    if (this.weatherTemp) {
      this.weatherTemp.textContent = "--°C";
    }
  }

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

  render() {
    if (!this.weatherData) return;
    const data = this.weatherData;
    if (this.weatherIcon) {
      this.weatherIcon.textContent = this.getWeatherIcon(data.weather[0].main);
    }
    if (this.weatherDescription) {
      this.weatherDescription.textContent = data.weather[0].description;
      this.weatherDescription.style.color = "#666";
    }
    if (this.weatherTemp) {
      const temp = Math.round(data.main.temp);
      this.weatherTemp.textContent = `${temp}°C`;
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
    if (this.weatherLocation) {
      this.weatherLocation.textContent = `📍 ${data.name}`;
    }
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
    if (this.updateTime) {
      const now = new Date().toLocaleString("zh-TW");
      this.updateTime.textContent = `更新時間：${now}`;
    }
  }

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

  saveCity() {
    localStorage.setItem("hygge-weather-city", this.city);
  }

  loadCity() {
    return localStorage.getItem("hygge-weather-city");
  }
}

// ========== 先建立資料容器 ===========
window.todos = [];

console.log("✅ 所有功能已載入！");

// ===== 周計劃 - 完整版 (含週次切換功能) =====

class WeeklyPlanner {
  // ✏️ 加一個參數
  constructor(appState) {
    this.appState = appState; // ✏️ 新增這行
    this.appState.subscribe(this); // ✏️ 新增這行：訂閱數據變化
    this.currentWeekOffset = 0;
    this.container = document.querySelector("#weekly-planner");
    this.weekRangeSpan = null;
    this.weekNumberSpan = null;
    this.dayColumns = {};
    this.initializeUI();
    this.setupEventListeners();
    this.render();
  }

  // ✏️ 新增：當數據變化時自動調用
  update() {
    this.render();
  }

  initializeUI() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="weekly-header">
        <h3>🗓 周計劃</h3>
        <div class="week-navigation">
          <button class="week-nav-btn" id="prev-week">◀ 上週</button>
          <span id="week-info">
            <span id="week-number">第 1 週</span>
            <span id="week-range">(1/1-1/7)</span>
          </span>
          <button class="week-nav-btn" id="next-week">下週 ▶</button>
          <button class="week-nav-btn today-btn" id="back-to-today">回到本週</button>
        </div>
      </div>
      <div class="weekly-grid">
        <div class="day-column" data-day="mon">
          <div class="day-header">一</div>
          <div class="day-tasks"></div>
        </div>
        <div class="day-column" data-day="tue">
          <div class="day-header">二</div>
          <div class="day-tasks"></div>
        </div>
        <div class="day-column" data-day="wed">
          <div class="day-header">三</div>
          <div class="day-tasks"></div>
        </div>
        <div class="day-column" data-day="thu">
          <div class="day-header">四</div>
          <div class="day-tasks"></div>
        </div>
        <div class="day-column" data-day="fri">
          <div class="day-header">五</div>
          <div class="day-tasks"></div>
        </div>
        <div class="day-column" data-day="sat">
          <div class="day-header">六</div>
          <div class="day-tasks"></div>
        </div>
        <div class="day-column" data-day="sun">
          <div class="day-header">日</div>
          <div class="day-tasks"></div>
        </div>
      </div>
    `;
    this.weekRangeSpan = document.querySelector("#week-range");
    this.weekNumberSpan = document.querySelector("#week-number");
    this.dayColumns = {
      mon: this.container.querySelector('[data-day="mon"] .day-tasks'),
      tue: this.container.querySelector('[data-day="tue"] .day-tasks'),
      wed: this.container.querySelector('[data-day="wed"] .day-tasks'),
      thu: this.container.querySelector('[data-day="thu"] .day-tasks'),
      fri: this.container.querySelector('[data-day="fri"] .day-tasks'),
      sat: this.container.querySelector('[data-day="sat"] .day-tasks'),
      sun: this.container.querySelector('[data-day="sun"] .day-tasks'),
    };
  }

  setupEventListeners() {
    const prevBtn = document.querySelector("#prev-week");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentWeekOffset--;
        this.render();
      });
    }
    const nextBtn = document.querySelector("#next-week");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentWeekOffset++;
        this.render();
      });
    }
    const todayBtn = document.querySelector("#back-to-today");
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        this.currentWeekOffset = 0;
        this.render();
      });
    }
  }

  getCurrentWeekDates() {
    const today = new Date();
    const currentDay = today.getDay();
    const thisMonday = new Date(today);
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    thisMonday.setDate(today.getDate() - daysFromMonday);
    const targetMonday = new Date(thisMonday);
    targetMonday.setDate(thisMonday.getDate() + this.currentWeekOffset * 7);
    const targetSunday = new Date(targetMonday);
    targetSunday.setDate(targetMonday.getDate() + 6);
    const startOfYear = new Date(targetMonday.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor(
      (targetMonday - startOfYear) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil(
      (daysSinceStart + startOfYear.getDay() + 1) / 7
    );
    return {
      monday: targetMonday,
      sunday: targetSunday,
      weekNumber: weekNumber,
      dates: this.generateWeekDates(targetMonday),
    };
  }

  generateWeekDates(monday) {
    const dates = {};
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    days.forEach((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      dates[day] = date;
    });
    return dates;
  }

  formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // ✨ 新增：格式化日期用於完成記錄（YYYY-MM-DD）
  formatDateForRecord(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  updateWeekInfo() {
    const weekData = this.getCurrentWeekDates();
    if (this.weekNumberSpan) {
      this.weekNumberSpan.textContent = `第 ${weekData.weekNumber} 週`;
    }
    if (this.weekRangeSpan) {
      const startDate = this.formatDate(weekData.monday);
      const endDate = this.formatDate(weekData.sunday);
      this.weekRangeSpan.textContent = `(${startDate}-${endDate})`;
    }
    const todayBtn = document.querySelector("#back-to-today");
    if (todayBtn) {
      if (this.currentWeekOffset === 0) {
        todayBtn.style.opacity = "0.5";
        todayBtn.disabled = true;
      } else {
        todayBtn.style.opacity = "1";
        todayBtn.disabled = false;
      }
    }
  }

  render() {
    this.updateWeekInfo();
    this.updateDayHeaders();

    // 清空所有欄位
    Object.values(this.dayColumns).forEach((column) => {
      if (column) column.innerHTML = "";
    });

    if (!window.todos || !Array.isArray(window.todos)) return;

    const weekData = this.getCurrentWeekDates();

    window.todos.forEach((todo) => {
      // ✨ 處理單次任務（只在特定日期顯示）
      if (todo.taskType === "once" && todo.date) {
        const taskDate = new Date(todo.date + "T00:00:00"); // 加上時間避免時區問題

        // 檢查日期是否在當前週
        const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        days.forEach((day) => {
          const dayDate = weekData.dates[day];

          // 比較年月日（忽略時分秒）
          if (
            taskDate.getFullYear() === dayDate.getFullYear() &&
            taskDate.getMonth() === dayDate.getMonth() &&
            taskDate.getDate() === dayDate.getDate()
          ) {
            const column = this.dayColumns[day];
            if (column) {
              const taskElement = this.createTaskElement(todo);
              column.appendChild(taskElement);
            }
          }
        });
      }
      // ✨ 處理重複任務（每週同一天顯示）
      else if (todo.taskType === "recurring" && todo.weekDay) {
        const column = this.dayColumns[todo.weekDay];
        if (column) {
          const taskElement = this.createTaskElement(todo);
          column.appendChild(taskElement);
        }
      }
      // 🔧 向下兼容舊數據（沒有 taskType 但有 weekDay 的任務）
      else if (!todo.taskType && todo.weekDay) {
        const column = this.dayColumns[todo.weekDay];
        if (column) {
          const taskElement = this.createTaskElement(todo);
          column.appendChild(taskElement);
        }
      }
      // 注意：taskType === "none" 的任務不會顯示在周計劃
    });

    this.highlightToday();
  }

  // 🆕 更新每個星期欄位的標題（顯示日期）
  updateDayHeaders() {
    const weekData = this.getCurrentWeekDates();
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayNames = ["一", "二", "三", "四", "五", "六", "日"];

    days.forEach((day, index) => {
      const dayColumn = this.container.querySelector(`[data-day="${day}"]`);
      if (dayColumn) {
        const dayHeader = dayColumn.querySelector(".day-header");
        const date = weekData.dates[day];
        const dateStr = this.formatDate(date);

        if (dayHeader) {
          // 顯示「星期 (日期)」，例如「一 (1/13)」
          dayHeader.textContent = `${dayNames[index]} (${dateStr})`;
        }
      }
    });
  }

  createTaskElement(todo) {
    const li = document.createElement("li");
    li.className = "week-task-item";
    li.dataset.id = todo.id;

    // ✨ 判斷是否已完成（支持重複任務的分日期完成）
    let isCompleted = false;

    if (todo.taskType === "recurring") {
      // 重複任務：檢查當前日期是否已完成
      const weekData = this.getCurrentWeekDates();
      const targetDate = weekData.dates[todo.weekDay];

      if (targetDate && todo.completionRecords) {
        const dateStr = this.formatDateForRecord(targetDate);
        isCompleted = todo.completionRecords[dateStr] === true;
      }
    } else {
      // 單次任務或無時間任務：使用 completed 欄位
      isCompleted = todo.completed === true;
    }

    if (isCompleted) {
      li.classList.add("completed");
    }

    // 🆕 添加點擊編輯功能
    li.style.cursor = "pointer";
    li.title = "點擊編輯任務";

    const progress = todo.progress || 0;
    const progressBar = `
    <div class="task-progress-bar">
      <div class="task-progress-fill" style="width: ${progress}%"></div>
    </div>
  `;
    li.innerHTML = `
    <div class="task-header">
      <span class="task-text">${this.escapeHtml(todo.text || todo.title)}</span>
      <button class="task-complete-btn" title="標記完成">✓</button>
    </div>
    ${progress > 0 ? progressBar : ""}
    ${
      todo.project
        ? `<div class="task-project" style="color: ${this.getProjectColor(
            todo.project
          )}">${todo.project}</div>`
        : ""
    }
  `;

    // 🆕 點擊任務區域編輯
    li.addEventListener("click", (e) => {
      // 如果點擊的是完成按鈕，不觸發編輯
      if (e.target.classList.contains("task-complete-btn")) {
        return;
      }
      e.stopPropagation();
      // 觸發待辦清單的編輯功能
      if (window.todoApp && window.todoApp.openEditModal) {
        window.todoApp.openEditModal(todo.id);
      }
    });

    const completeBtn = li.querySelector(".task-complete-btn");
    completeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.completeTodo(todo.id);
    });
    return li;
  }

  completeTodo(id) {
    const todo = window.todos.find((t) => t.id === id);
    if (!todo) return;

    // ✨ 重複任務：需要知道是哪一天完成的
    if (todo.taskType === "recurring") {
      // 找出這個任務在哪一天（根據當前顯示的週）
      const weekData = this.getCurrentWeekDates();
      const targetDate = weekData.dates[todo.weekDay];

      if (targetDate) {
        const dateStr = this.formatDateForRecord(targetDate);

        // 更新該日期的完成狀態
        this.appState.updateTodo(id, {
          completed: true,
          date: dateStr, // 傳遞日期給 updateTodo
        });

        console.log(`✅ 重複任務標記完成: ${todo.text} (${dateStr})`);
      }
    }
    // ✨ 單次任務：直接標記為完成
    else {
      this.appState.updateTodo(id, { completed: true });
    }
  }

  highlightToday() {
    if (this.currentWeekOffset !== 0) {
      this.container.querySelectorAll(".day-column").forEach((col) => {
        col.classList.remove("today");
      });
      return;
    }
    const today = new Date().getDay();
    const dayMap = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    const todayDay = dayMap[today];
    this.container.querySelectorAll(".day-column").forEach((col) => {
      col.classList.remove("today");
    });
    const todayColumn = this.container.querySelector(
      `[data-day="${todayDay}"]`
    );
    if (todayColumn) {
      todayColumn.classList.add("today");
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  getProjectColor(project) {
    const colors = {
      Hygge: "#8b5cf6",
      作品集: "#06b6d4",
      學習: "#10b981",
      運動: "#f59e0b",
      生活: "#ef4444",
    };
    return colors[project] || "#999";
  }
}

// ==================== 📊 甘特圖功能 ====================
class GanttChart {
  constructor(appState) {
    // ✏️ 加一個參數
    console.log("📊 GanttChart 初始化中...");
    this.appState = appState; // ✏️ 新增這行
    this.appState.subscribe(this); // ✏️ 新增這行：訂閱數據變化
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
    console.log("✅ GanttChart 初始化完成！");
  }

  // ✏️ 新增：當數據變化時自動調用
  update() {
    this.render();
  }

  cacheDom() {
    this.ganttList = document.querySelector("#gantt-list");
    this.emptyState = document.querySelector(".gantt-empty");
  }

  bindEvents() {}

  getProjectTodos() {
    return this.appState.todos.filter(
      (todo) => todo.project && !todo.completed
    );
  }

  groupByProject() {
    const projects = {};
    this.getProjectTodos().forEach((todo) => {
      if (!projects[todo.project]) {
        projects[todo.project] = [];
      }
      projects[todo.project].push(todo);
    });
    return projects;
  }

  calculateProjectProgress(todos) {
    if (todos.length === 0) return 0;
    const total = todos.reduce((sum, todo) => sum + (todo.progress || 0), 0);
    return Math.round(total / todos.length);
  }

  render() {
    if (!this.ganttList) return;
    const projects = this.groupByProject();
    const projectKeys = Object.keys(projects);
    if (projectKeys.length === 0) {
      this.ganttList.style.display = "none";
      this.emptyState.style.display = "block";
      return;
    }
    this.ganttList.style.display = "flex";
    this.emptyState.style.display = "none";
    this.ganttList.innerHTML = "";
    projectKeys.forEach((projectName) => {
      const projectTodos = projects[projectName];
      const avgProgress = this.calculateProjectProgress(projectTodos);
      const ganttItem = this.createGanttItem(
        projectName,
        avgProgress,
        projectTodos
      );
      this.ganttList.appendChild(ganttItem);
    });
    console.log("✅ 甘特圖已更新");
  }

  createGanttItem(projectName, progress, todos) {
    const div = document.createElement("div");
    div.className = "gantt-item";
    const projectColor = this.getProjectColor(projectName);
    div.innerHTML = `
      <div class="gantt-title">
        <span class="project-name">${projectName}</span>
        <span class="task-count">${todos.length} 項</span>
      </div>
      <div class="gantt-bar">
        <div class="gantt-progress" style="width: ${progress}%; background: ${projectColor}">
          <span class="progress-text">${progress}%</span>
        </div>
      </div>
      <div class="gantt-actions">
        <button class="gantt-view-btn" data-project="${projectName}">查看任務</button>
      </div>
    `;
    const viewBtn = div.querySelector(".gantt-view-btn");
    viewBtn.addEventListener("click", () => {
      this.showProjectTasks(projectName, todos);
    });
    return div;
  }

  showProjectTasks(projectName, todos) {
    const taskList = todos
      .map((todo) => `• ${todo.title} (${todo.progress || 0}%)`)
      .join("\n");
    alert(`📊 ${projectName} 任務清單：\n\n${taskList}`);
  }

  getProjectColor(project) {
    const colors = {
      Hygge: "#8b5cf6",
      作品集: "#06b6d4",
      學習: "#10b981",
      運動: "#f59e0b",
      生活: "#ef4444",
    };
    return colors[project] || "#999";
  }
}

// ==================== 🔗 待辦清單增強版 ====================
// ⚠️ B階段重構：以下代碼已被 AppState 取代，暫時註解
/*
const originalAddTodo = TodoApp.prototype.addTodo;
TodoApp.prototype.addTodo = function () {
  const text = this.todoInput.value.trim();
  if (!text) {
    alert("請輸入待辦事項！");
    return;
  }
  const action = confirm(
    "是否要將此任務加入周計劃或專案？\n\n" +
      "按「確定」開啟設定\n" +
      "按「取消」只建立一般待辦"
  );
  if (action) {
    this.showTaskSettings(text);
  } else {
    originalAddTodo.call(this);
  }
};

TodoApp.prototype.showTaskSettings = function (text) {
  const weekDay = prompt(
    "📅 分配到星期幾？\n\n" +
      "輸入: mon, tue, wed, thu, fri, sat, sun\n" +
      "(留空 = 不加入周計劃)"
  );
  const project = prompt(
    "📊 專案名稱？\n\n" +
      "建議: Hygge, 作品集, 學習, 運動, 生活\n" +
      "(留空 = 不加入專案)"
  );
  let progress = 0;
  if (project) {
    const progressInput = prompt("進度 (0-100):", "0");
    progress = Math.max(0, Math.min(100, parseInt(progressInput) || 0));
  }
  const newTodo = {
    id: "todo-" + Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toLocaleDateString("zh-TW"),
    weekDay: weekDay || null,
    project: project || null,
    progress: progress,
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
  };
  this.todos.push(newTodo);
  this.saveTodos();
  this.render();
  this.todoInput.value = "";
  this.todoInput.focus();
  if (weeklyPlanner) weeklyPlanner.render();
  if (ganttChart) ganttChart.render();
  console.log("✅ 新增增強版待辦:", newTodo);
};

const originalSaveTodos = TodoApp.prototype.saveTodos;
TodoApp.prototype.saveTodos = function () {
  window.todos = this.todos;
  originalSaveTodos.call(this);
  if (weeklyPlanner) weeklyPlanner.render();
  if (ganttChart) ganttChart.render();
};

const originalLoadTodos = TodoApp.prototype.loadTodos;
TodoApp.prototype.loadTodos = function () {
  const loaded = originalLoadTodos.call(this);
  window.todos = loaded;
  return loaded;
};
*/

console.log("✅ 周計劃和甘特圖功能已載入！");
