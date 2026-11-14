
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // =========================================
  // 1. CONFIGURATION
  // =========================================

  const SUPABASE_URL =
    "https://fqbcfuduinjdumozfbja.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

  let supabaseClient;

  const STORAGE_KEY = "moneta_transactions";
  const GOAL_KEY = "moneta_savings_goal";

  const EXPENSE_CATEGORIES = [
    "Food", "Groceries", "Transport", "Shopping",
    "Bills", "Housing", "Health", "Entertainment",
    "Gym", "Education", "Other"
  ];

  const INCOME_CATEGORIES = [
    "Salary", "Tips", "Freelance", "Business",
    "Investment", "Other"
  ];

  let transactions = [];
  let currentUser = null;
  let savingsGoal = 1000;

  const $ = (id) => document.getElementById(id);

  const elements = {
    todayLabel: $("todayLabel"),
    year: $("year"),
    monthFilter: $("monthFilter"),
    balanceValue: $("balanceValue"),
    incomeValue: $("incomeValue"),
    expenseValue: $("expenseValue"),
    goalInput: $("goalInput"),
    saveGoalBtn: $("saveGoalBtn"),
    goalPercent: $("goalPercent"),
    goalProgress: $("goalProgress"),
    goalMessage: $("goalMessage"),
    categoryChart: $("categoryChart"),
    chartIncome: $("chartIncome"),
    chartExpense: $("chartExpense"),
    incomeBar: $("incomeBar"),
    expenseBar: $("expenseBar"),
    transactionForm: $("transactionForm"),
    formHeading: $("formHeading"),
    editId: $("editId"),
    typeInput: $("typeInput"),
    titleInput: $("titleInput"),
    categoryInput: $("categoryInput"),
    amountInput: $("amountInput"),
    dateInput: $("dateInput"),
    submitBtn: $("submitBtn"),
    cancelEditBtn: $("cancelEditBtn"),
    formMessage: $("formMessage"),
    searchInput: $("searchInput"),
    typeFilter: $("typeFilter"),
    categoryFilter: $("categoryFilter"),
    transactionList: $("transactionList"),
    transactionCount: $("transactionCount"),
    filteredTotal: $("filteredTotal"),
    addTransactionBtn: $("addTransactionBtn"),
    exportBtn: $("exportBtn"),
    backupBtn: $("backupBtn"),
    importFile: $("importFile"),
    importMessage: $("importMessage"),
    cloudStatus: $("cloudStatus"),
    logoutBtn: $("logoutBtn")
  };

  // =========================================
  // 2. HELPERS
  // =========================================

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function currentMonthString() {
    return localDateString().slice(0, 7);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2
    }).format(Number(amount) || 0);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function showMessage(message, type = "success") {
    elements.formMessage.textContent = message;
    elements.formMessage.dataset.type = type;
  }

  function setCloudStatus(message, type = "") {
    elements.cloudStatus.textContent = message;
    elements.cloudStatus.dataset.status = type;
  }

  function setBusy(button, busy, busyText, normalText) {
    button.disabled = busy;
    button.textContent = busy ? busyText : normalText;
  }

  function getSelectedMonth() {
    return elements.monthFilter.value || currentMonthString();
  }

  function getMonthTransactions() {
    const month = getSelectedMonth();

    return transactions.filter((item) =>
      item.date.startsWith(month)
    );
  }

  function getMonthTotals() {
    const monthItems = getMonthTransactions();

    const income = monthItems
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = monthItems
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }

  // =========================================
  // 3. CATEGORY SELECTORS
  // =========================================

  function populateCategories() {
    const type = elements.typeInput.value;

    const categories = type === "income"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

    const previous = elements.categoryInput.value;

    elements.categoryInput.innerHTML = categories
      .map((category) =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      )
      .join("");

    if (categories.includes(previous)) {
      elements.categoryInput.value = previous;
    }
  }

  function populateCategoryFilter() {
    const selected = elements.categoryFilter.value || "all";

    const categories = [
      ...new Set([
        ...EXPENSE_CATEGORIES,
        ...INCOME_CATEGORIES
      ])
    ];

    elements.categoryFilter.innerHTML =
      '<option value="all">All categories</option>' +
      categories.map((category) =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      ).join("");

    elements.categoryFilter.value =
      categories.includes(selected) ? selected : "all";
  }

  // =========================================
  // 4. LOAD CLOUD TRANSACTIONS
  // =========================================

  async function loadTransactions() {
    setCloudStatus("Loading your transactions...");

    const { data, error } = await supabaseClient
      .from("moneta_transactions")
      .select("id, title, type, category, amount, transaction_date, note")
      .order("transaction_date", { ascending: false });

    if (error) {
      throw error;
    }

    transactions = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      category: item.category,
      amount: Number(item.amount),
      date: item.transaction_date,
      note: item.note || ""
    }));

    renderDashboard();

    setCloudStatus("Connected · Your data is synced", "success");
  }

  // =========================================
  // 5. LOAD AND SAVE SAVINGS GOAL
  // =========================================

  async function loadSavingsGoal() {
    const { data, error } = await supabaseClient
      .from("moneta_settings")
      .select("savings_goal")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    savingsGoal = data
      ? Number(data.savings_goal)
      : 1000;

    elements.goalInput.value = savingsGoal;

    renderDashboard();
  }

  async function saveSavingsGoal() {
    const goal = Number(elements.goalInput.value);

    if (!Number.isFinite(goal) || goal < 0) {
      alert("Please enter a valid savings goal.");
      return;
    }

    setBusy(
      elements.saveGoalBtn,
      true,
      "Saving...",
      "Save goal"
    );

    const { error } = await supabaseClient
      .from("moneta_settings")
      .upsert({
        user_id: currentUser.id,
        savings_goal: goal,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id"
      });

    if (error) {
      console.error(error);
      alert("Could not save your goal: " + error.message);
    } else {
      savingsGoal = goal;
      renderDashboard();
      setCloudStatus("Savings goal saved to cloud", "success");
    }

    setBusy(
      elements.saveGoalBtn,
      false,
      "Saving...",
      "Save goal"
    );
  }

  // =========================================
  // 6. DASHBOARD
  // =========================================

  function renderDashboard() {
    const totals = getMonthTotals();

    elements.balanceValue.textContent =
      formatCurrency(totals.balance);

    elements.incomeValue.textContent =
      formatCurrency(totals.income);

    elements.expenseValue.textContent =
      formatCurrency(totals.expenses);

    renderSavingsGoal(totals.balance);
    renderComparisonChart(totals);
    renderCategoryChart();
    renderTransactions();
  }

  function renderSavingsGoal(balance) {
    const progress = savingsGoal > 0
      ? Math.max(0, (balance / savingsGoal) * 100)
      : 0;

    const percentage = Math.min(progress, 100);

    elements.goalPercent.textContent =
      `${Math.round(progress)}%`;

    elements.goalProgress.style.width =
      `${percentage}%`;

    if (savingsGoal === 0) {
      elements.goalMessage.textContent =
        "Set a savings target above zero to track your progress.";
    } else if (balance < 0) {
      elements.goalMessage.textContent =
        "Your expenses are higher than your income this month.";
    } else if (balance >= savingsGoal) {
      elements.goalMessage.textContent =
        "Congratulations! You've reached your savings goal.";
    } else {
      elements.goalMessage.textContent =
        `${formatCurrency(savingsGoal - balance)} left to reach your goal.`;
    }
  }

  function renderComparisonChart(totals) {
    elements.chartIncome.textContent =
      formatCurrency(totals.income);

    elements.chartExpense.textContent =
      formatCurrency(totals.expenses);

    const max = Math.max(
      totals.income,
      totals.expenses,
      1
    );

    elements.incomeBar.style.width =
      `${(totals.income / max) * 100}%`;

    elements.expenseBar.style.width =
      `${(totals.expenses / max) * 100}%`;
  }

  // =========================================
  // 7. CATEGORY CHART
  // =========================================

  function renderCategoryChart() {
    const expenses = getMonthTransactions()
      .filter((item) => item.type === "expense");

    const totals = {};

    expenses.forEach((item) => {
      totals[item.category] =
        (totals[item.category] || 0) + Number(item.amount);
    });

    const categories = Object.entries(totals)
      .sort((a, b) => b[1] - a[1]);

    if (!categories.length) {
      elements.categoryChart.innerHTML =
        '<p class="empty-message">No expenses to display yet.</p>';
      return;
    }

    const max = Math.max(...categories.map((item) => item[1]));

    elements.categoryChart.innerHTML = categories.map(
      ([category, amount]) => {
        const width = (amount / max) * 100;

        return `
          <div class="category-row">
            <div class="category-row-top">
              <span>${escapeHTML(category)}</span>
              <strong>${formatCurrency(amount)}</strong>
            </div>
            <div class="category-track">
              <div class="category-fill" style="width:${width}%"></div>
            </div>
          </div>
        `;
      }
    ).join("");
  }

  // =========================================
  // 8. TRANSACTION LIST
  // =========================================

  function getFilteredTransactions() {
    const search = elements.searchInput.value
      .trim()
      .toLowerCase();

    const type = elements.typeFilter.value;
    const category = elements.categoryFilter.value;
    const month = getSelectedMonth();

    return transactions
      .filter((item) => {
        const matchesMonth = item.date.startsWith(month);

        const matchesType =
          type === "all" || item.type === type;

        const matchesCategory =
          category === "all" || item.category === category;

        const matchesSearch =
          item.title.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search);

        return matchesMonth &&
          matchesType &&
          matchesCategory &&
          matchesSearch;
      })
      .sort((a, b) => {
        return b.date.localeCompare(a.date) ||
          b.id.localeCompare(a.id);
      });
  }

  function renderTransactions() {
    const filtered = getFilteredTransactions();

    if (!filtered.length) {
      elements.transactionList.innerHTML =
        '<p class="empty-message">No matching transactions found.</p>';
    } else {
      elements.transactionList.innerHTML = filtered.map((item) => {
        const isIncome = item.type === "income";
        const sign = isIncome ? "+" : "−";

        return `
          <article class="transaction-item" data-id="${escapeHTML(item.id)}">
            <div class="transaction-info">
              <strong>${escapeHTML(item.title)}</strong>
              <span>${escapeHTML(item.category)} · ${escapeHTML(item.date)}</span>
            </div>

            <div class="transaction-amount ${isIncome ? "income-text" : "expense-text"}">
              ${sign}${formatCurrency(item.amount)}
            </div>

            <div class="transaction-actions">
              <button type="button" class="edit-btn" data-action="edit" data-id="${escapeHTML(item.id)}">
                Edit
              </button>
              <button type="button" class="delete-btn" data-action="delete" data-id="${escapeHTML(item.id)}">
                Delete
              </button>
            </div>
          </article>
        `;
      }).join("");
    }

    elements.transactionCount.textContent =
      `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;

    const total = filtered.reduce((sum, item) => {
      return sum + (item.type === "income"
        ? Number(item.amount)
        : -Number(item.amount));
    }, 0);

    elements.filteredTotal.textContent =
      formatCurrency(total);
  }

  // =========================================
  // 9. ADD TRANSACTION
  // =========================================

  async function addTransaction(event) {
    event.preventDefault();

    const title = elements.titleInput.value.trim();
    const type = elements.typeInput.value;
    const category = elements.categoryInput.value;
    const amount = Number(elements.amountInput.value);
    const date = elements.dateInput.value;

    if (!title || !category || !date ||
        !Number.isFinite(amount) || amount <= 0) {
      showMessage("Please complete all fields correctly.", "error");
      return;
    }

    const payload = {
      title,
      type,
      category,
      amount,
      transaction_date: date,
      note: ""
    };

    const editId = elements.editId.value;

    setBusy(
      elements.submitBtn,
      true,
      "Saving...",
      editId ? "Update transaction" : "Add transaction"
    );

    let error;

    if (editId) {
      const result = await supabaseClient
        .from("moneta_transactions")
        .update(payload)
        .eq("id", editId)
        .select()
        .single();

      error = result.error;
    } else {
      const result = await supabaseClient
        .from("moneta_transactions")
        .insert(payload)
        .select()
        .single();

      error = result.error;
    }

    if (error) {
      console.error(error);
      showMessage("Could not save: " + error.message, "error");
    } else {
      resetForm();
      await loadTransactions();
      showMessage(
        editId ? "Transaction updated successfully." : "Transaction saved to cloud.",
        "success"
      );
    }

    setBusy(
      elements.submitBtn,
      false,
      "Saving...",
      elements.editId.value ? "Update transaction" : "Add transaction"
    );
  }

  // =========================================
  // 10. EDIT TRANSACTION
  // =========================================

  function editTransaction(id) {
    const item = transactions.find((entry) => entry.id === id);

    if (!item) return;

    elements.editId.value = item.id;
    elements.typeInput.value = item.type;

    populateCategories();

    elements.titleInput.value = item.title;
    elements.categoryInput.value = item.category;
    elements.amountInput.value = item.amount;
    elements.dateInput.value = item.date;

    elements.formHeading.textContent = "Edit transaction";
    elements.submitBtn.textContent = "Update transaction";
    elements.cancelEditBtn.hidden = false;

    $("transactionSection").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    elements.titleInput.focus({ preventScroll: true });
  }

  // =========================================
  // 11. DELETE TRANSACTION
  // =========================================

  async function deleteTransaction(id) {
    const confirmed = confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    const { error } = await supabaseClient
      .from("moneta_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Could not delete transaction: " + error.message);
      return;
    }

    await loadTransactions();
    setCloudStatus("Transaction deleted", "success");
  }

  // =========================================
  // 12. RESET FORM
  // =========================================

  function resetForm() {
    elements.transactionForm.reset();

    elements.editId.value = "";
    elements.dateInput.value = localDateString();

    elements.formHeading.textContent = "Add a transaction";
    elements.submitBtn.textContent = "Add transaction";
    elements.cancelEditBtn.hidden = true;

    populateCategories();
  }

  // =========================================
  // 13. CSV EXPORT
  // =========================================

  function exportCSV() {
    const filtered = getFilteredTransactions();

    if (!filtered.length) {
      alert("There are no transactions to export.");
      return;
    }

    const rows = [
      ["Date", "Description", "Type", "Category", "Amount (AED)"],
      ...filtered.map((item) => [
        item.date,
        item.title,
        item.type,
        item.category,
        Number(item.amount).toFixed(2)
      ])
    ];

    const csv = rows.map((row) =>
      row.map((value) =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(",")
    ).join("\n");

    downloadFile(
      csv,
      "moneta-transactions.csv",
      "text/csv;charset=utf-8"
    );
  }

  // =========================================
  // 14. JSON BACKUP
  // =========================================

  function backupData() {
    const backup = {
      app: "MONETA",
      version: 1,
      exportedAt: new Date().toISOString(),
      savingsGoal,
      transactions: transactions.map((item) => ({
        title: item.title,
        type: item.type,
        category: item.category,
        amount: item.amount,
        date: item.date
      }))
    };

    downloadFile(
      JSON.stringify(backup, null, 2),
      "moneta-backup.json",
      "application/json"
    );
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // =========================================
  // 15. IMPORT OLD MONETA BACKUP
  // =========================================

  async function importBackup(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup || !Array.isArray(backup.transactions)) {
        throw new Error("This is not a valid MONETA backup.");
      }

      if (transactions.length > 0) {
        throw new Error(
          "Import is only allowed when your cloud transaction list is empty. This prevents accidental duplicates."
        );
      }

      const imported = backup.transactions.map((item) => {
        const amount = Number(item.amount);

        if (
          !item.title ||
          !["income", "expense"].includes(item.type) ||
          !item.category ||
          !Number.isFinite(amount) ||
          amount <= 0 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(item.date)
        ) {
          throw new Error("The backup contains an invalid transaction.");
        }

        return {
          title: String(item.title).trim().slice(0, 60),
          type: item.type,
          category: String(item.category),
          amount,
          transaction_date: item.date,
          note: ""
        };
      });

      if (!imported.length) {
        throw new Error("The backup contains no transactions.");
      }

      if (!confirm(
        `Import ${imported.length} transactions into your cloud account?`
      )) {
        return;
      }

      elements.importMessage.textContent =
        "Importing your transactions...";

      const { error } = await supabaseClient
        .from("moneta_transactions")
        .insert(imported);

      if (error) throw error;

      const goal = Number(backup.savingsGoal);

      if (Number.isFinite(goal) && goal >= 0) {
        const { error: goalError } = await supabaseClient
          .from("moneta_settings")
          .upsert({
            user_id: currentUser.id,
            savings_goal: goal,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "user_id"
          });

        if (goalError) throw goalError;
      }

      await loadTransactions();
      await loadSavingsGoal();

      elements.importMessage.textContent =
        `Successfully imported ${imported.length} transactions.`;

      setCloudStatus("Backup imported successfully", "success");

    } catch (error) {
      console.error(error);

      elements.importMessage.textContent =
        error.message || "Import failed.";
    } finally {
      elements.importFile.value = "";
    }
  }

  // =========================================
  // 16. LOG OUT
  // =========================================

  async function logout() {
    elements.logoutBtn.disabled = true;
    elements.logoutBtn.textContent = "Logging out...";

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      elements.logoutBtn.disabled = false;
      elements.logoutBtn.textContent = "Log out";
      return;
    }

    window.location.replace("login.html");
  }

  // =========================================
  // 17. EVENT LISTENERS
  // =========================================

  elements.typeInput.addEventListener(
    "change",
    populateCategories
  );

  elements.transactionForm.addEventListener(
    "submit",
    addTransaction
  );

  elements.cancelEditBtn.addEventListener(
    "click",
    resetForm
  );

  elements.saveGoalBtn.addEventListener(
    "click",
    saveSavingsGoal
  );

  elements.monthFilter.addEventListener(
    "change",
    renderDashboard
  );

  elements.searchInput.addEventListener(
    "input",
    renderTransactions
  );

  elements.typeFilter.addEventListener(
    "change",
    renderTransactions
  );

  elements.categoryFilter.addEventListener(
    "change",
    renderTransactions
  );

  elements.addTransactionBtn.addEventListener(
    "click",
    () => {
      $("transactionSection").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      elements.titleInput.focus({ preventScroll: true });
    }
  );

  elements.transactionList.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("button[data-action]");

      if (!button) return;

      const id = button.dataset.id;

      if (button.dataset.action === "edit") {
        editTransaction(id);
      }

      if (button.dataset.action === "delete") {
        deleteTransaction(id);
      }
    }
  );

  elements.exportBtn.addEventListener("click", exportCSV);
  elements.backupBtn.addEventListener("click", backupData);
  elements.logoutBtn.addEventListener("click", logout);

  elements.importFile.addEventListener("change", (event) => {
    importBackup(event.target.files[0]);
  });

  // =========================================
  // 18. START MONETA
  // =========================================

  async function startMoneta() {
    if (!window.supabase) {
      throw new Error("Supabase library could not be loaded.");
    }

    elements.todayLabel.textContent =
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });

    elements.year.textContent = new Date().getFullYear();

    elements.monthFilter.value = currentMonthString();
    elements.dateInput.value = localDateString();

    populateCategories();
    populateCategoryFilter();

    // Verify the signed-in user with Supabase Auth.
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
      window.location.replace("login.html");
      return;
    }

    currentUser = data.user;

    console.log("MONETA authenticated.");

    await loadTransactions();
    await loadSavingsGoal();

    console.log("MONETA cloud data loaded.");
  }

  startMoneta().catch((error) => {
    console.error("MONETA error:", error);

    setCloudStatus(
      "Could not connect: " + error.message,
      "error"
    );
  });

});
