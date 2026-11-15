
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
  let currentUser = null;

  let transactions = [];
  let paychecks = [];
  let editingPayMonth = null;
  let budgetItems = [];
  let savingsGoal = 1000;

  const EXPENSE_CATEGORIES = [
    "Food",
    "Mobile",
    "Wife",
    "Health & Gym",
    "Financial Goals / Debt"
  ];

  const INCOME_CATEGORIES = [
    "Salary", "Tips", "Service charge", "Freelance",
    "Business", "Investment", "Other"
  ];

  const BUDGET_FIXED_AMOUNTS = [
    { category: "Food", amount: 300 },
    { category: "Mobile", amount: 10 },
    { category: "Health & Gym", amount: 100 }
  ];
  const WIFE_BUDGET_PERCENT = 10;
  const FINANCIAL_GOALS_PERCENT = 65;
  const FINANCIAL_GOALS_MINIMUM = 1100;

  const BASIC_SALARY = 1450;

  const $ = id => document.getElementById(id);

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
    logoutBtn: $("logoutBtn"),

    payslipFile: $("payslipFile"),
    readPayslipBtn: $("readPayslipBtn"),
    payslipStatus: $("payslipStatus"),
    payslipText: $("payslipText"),
    payslipTextSection: $("payslipTextSection"),
    payslipForm: $("payslipForm"),
    payMonth: $("payMonth"),
    payDate: $("payDate"),
    serviceCharge: $("serviceCharge"),
    tips: $("tips"),
    totalSalary: $("totalSalary"),
    payNotes: $("payNotes"),
    savePayslipBtn: $("savePayslipBtn"),
    cancelPayslipEditBtn: $("cancelPayslipEditBtn"),
    payslipFormMessage: $("payslipFormMessage"),
    payslipHistory: $("payslipHistory"),

    budgetMonth: $("budgetMonth"),
    generateBudgetBtn: $("generateBudgetBtn"),
    budgetIncome: $("budgetIncome"),
    budgetPlanned: $("budgetPlanned"),
    budgetProgress: $("budgetProgress"),
    budgetProgressMessage: $("budgetProgressMessage"),
    budgetList: $("budgetList"),
    saveBudgetBtn: $("saveBudgetBtn"),
    budgetMessage: $("budgetMessage")
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

  function monthStart(month) {
    return `${month}-01`;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2
    }).format(Number(amount) || 0);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function setMessage(element, message, type = "success") {
    if (!element) return;

    element.textContent = message;
    element.dataset.type = type;
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

  function getSelectedBudgetMonth() {
    return elements.budgetMonth.value || currentMonthString();
  }

  // =========================================
  // 3. CATEGORY SELECTORS
  // =========================================

  function populateCategories() {
    const categories =
      elements.typeInput.value === "income"
        ? INCOME_CATEGORIES
        : EXPENSE_CATEGORIES;

    const previous = elements.categoryInput.value;

    elements.categoryInput.innerHTML = categories.map(category => `
      <option value="${escapeHTML(category)}">
        ${escapeHTML(category)}
      </option>
    `).join("");

    if (categories.includes(previous)) {
      elements.categoryInput.value = previous;
    }
  }

  function populateCategoryFilter() {
    const previous = elements.categoryFilter.value || "all";

    const categories = [
      ...new Set([
        ...EXPENSE_CATEGORIES,
        ...INCOME_CATEGORIES
      ])
    ];

    elements.categoryFilter.innerHTML =
      '<option value="all">All categories</option>' +
      categories.map(category => `
        <option value="${escapeHTML(category)}">
          ${escapeHTML(category)}
        </option>
      `).join("");

    elements.categoryFilter.value =
      categories.includes(previous) ? previous : "all";
  }

  // =========================================
  // 4. TRANSACTIONS — LOAD FROM SUPABASE
  // =========================================

  async function loadTransactions() {
    const { data, error } = await supabaseClient
      .from("moneta_transactions")
      .select("id, title, type, category, amount, transaction_date, note")
      .order("transaction_date", { ascending: false });

    if (error) throw error;

    transactions = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      category: item.category,
      amount: Number(item.amount),
      date: item.transaction_date,
      note: item.note || ""
    }));

    renderDashboard();
  }

  // =========================================
  // 5. SAVINGS GOAL
  // =========================================

  async function loadSavingsGoal() {
    const { data, error } = await supabaseClient
      .from("moneta_settings")
      .select("savings_goal")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) throw error;

    savingsGoal = data
      ? Number(data.savings_goal)
      : 1000;


  }

  // =========================================
  // 6. DASHBOARD
  // =========================================

  function getMonthTransactions() {
    const month = getSelectedMonth();

    return transactions.filter(item =>
      item.date.startsWith(month)
    );
  }

  function getMonthTotals() {
    const items = getMonthTransactions();
    const selectedMonth = getSelectedMonth();
    const paycheck = paychecks.find(item =>
      item.pay_month === monthStart(selectedMonth)
    );

    const salaryIncome = paycheck
      ? Number(paycheck.net_pay) || 0
      : 0;

    // Payslip total already includes salary, tips and service charge.
    // Exclude those transaction categories to avoid counting them twice.
    const otherIncome = items
      .filter(item =>
        item.type === "income" &&
        !["Salary", "Tips", "Service charge"].includes(item.category)
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const income = salaryIncome + otherIncome;

    const expenses = items
      .filter(item => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }


  function updateCompactDashboard(totals) {
    const spendPct = totals.income > 0 ? Math.min(totals.expenses / totals.income * 100, 100) : 0;
    if ($("heroSpendBar")) $("heroSpendBar").style.width = spendPct + "%";
    if ($("heroSpendPct")) $("heroSpendPct").textContent = Math.round(spendPct) + "%";
    const planned = budgetItems.reduce((sum, item) => sum + Number(item.planned || 0), 0);
    const budgetPct = totals.income > 0 ? Math.min(planned / totals.income * 100, 100) : 0;
    if ($("quickBudgetValue")) $("quickBudgetValue").textContent = formatCurrency(planned) + " / " + formatCurrency(totals.income);
    if ($("quickBudgetBar")) $("quickBudgetBar").style.width = budgetPct + "%";
    if ($("quickBudgetPct")) $("quickBudgetPct").textContent = Math.round(budgetPct) + "%";
    const saved = Math.max(0, Number(budgetItems.find(item => item.category === "Savings")?.planned || 0));
    const savingsPct = totals.income > 0 ? Math.min(saved / totals.income * 100, 100) : 0;
    if ($("quickSavingsValue")) $("quickSavingsValue").textContent = formatCurrency(saved);
    if ($("quickSavingsBar")) $("quickSavingsBar").style.width = savingsPct + "%";
    if ($("quickSavingsPct")) $("quickSavingsPct").textContent = Math.round(savingsPct) + "%";
  }

  function renderDashboard() {
    const totals = getMonthTotals();

    elements.balanceValue.textContent =
      formatCurrency(totals.balance);

    elements.incomeValue.textContent =
      formatCurrency(totals.income);

    elements.expenseValue.textContent =
      formatCurrency(totals.expenses);

    updateCompactDashboard(totals);
    renderComparisonChart(totals);
    renderCategoryChart();
    renderTransactions();
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
      `${totals.income / max * 100}%`;

    elements.expenseBar.style.width =
      `${totals.expenses / max * 100}%`;
  }

  function renderCategoryChart() {
    const totals = {};

    getMonthTransactions()
      .filter(item => item.type === "expense")
      .forEach(item => {
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

    const max = Math.max(...categories.map(item => item[1]));

    elements.categoryChart.innerHTML =
      categories.map(([category, amount]) => `
        <div class="category-row">
          <div class="category-row-top">
            <span>${escapeHTML(category)}</span>
            <strong>${formatCurrency(amount)}</strong>
          </div>
          <div class="category-track">
            <div
              class="category-fill"
              style="width:${amount / max * 100}%"
            ></div>
          </div>
        </div>
      `).join("");
  }

  // =========================================
  // 7. TRANSACTION LIST AND FILTERS
  // =========================================

  function getFilteredTransactions() {
    const search =
      elements.searchInput.value.trim().toLowerCase();

    const type = elements.typeFilter.value;
    const category = elements.categoryFilter.value;
    const month = getSelectedMonth();

    return transactions.filter(item => {
      const matchesMonth = item.date.startsWith(month);
      const matchesType = type === "all" || item.type === type;
      const matchesCategory =
        category === "all" || item.category === category;

      const matchesSearch =
        item.title.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      return (
        matchesMonth &&
        matchesType &&
        matchesCategory &&
        matchesSearch
      );
    }).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }

  function renderTransactions() {
    const filtered = getFilteredTransactions();
    const recent = $("recentActivityList");
    if (recent) {
      const latest = filtered.slice(0, 3);
      recent.innerHTML = latest.length ? latest.map(item => {
        const isIncome = item.type === "income";
        return `<article class="transaction-item"><div class="transaction-info"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.category)} · ${escapeHTML(item.date)}</span></div><div class="transaction-amount ${isIncome ? "income-text" : "expense-text"}">${isIncome ? "+" : "−"}${formatCurrency(item.amount)}</div></article>`;
      }).join("") : '<p class="empty-message">No transactions yet. Start tracking your finances.</p>';
    }

    if (!filtered.length) {
      elements.transactionList.innerHTML =
        '<p class="empty-message">No matching transactions found.</p>';

    } else {
      elements.transactionList.innerHTML =
        filtered.map(item => {
          const isIncome = item.type === "income";

          return `
            <article class="transaction-item">
              <div class="transaction-info">
                <strong>${escapeHTML(item.title)}</strong>
                <span>
                  ${escapeHTML(item.category)}
                  · ${escapeHTML(item.date)}
                </span>
              </div>

              <div class="transaction-amount ${
                isIncome ? "income-text" : "expense-text"
              }">
                ${isIncome ? "+" : "−"}${formatCurrency(item.amount)}
              </div>

              <div class="transaction-actions">
                <button
                  type="button"
                  class="edit-btn"
                  data-action="edit"
                  data-id="${escapeHTML(item.id)}"
                >Edit</button>

                <button
                  type="button"
                  class="delete-btn"
                  data-action="delete"
                  data-id="${escapeHTML(item.id)}"
                >Delete</button>
              </div>
            </article>
          `;
        }).join("");
    }

    elements.transactionCount.textContent =
      `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;

    const total = filtered.reduce((sum, item) => {
      return sum + (
        item.type === "income"
          ? Number(item.amount)
          : -Number(item.amount)
      );
    }, 0);

    elements.filteredTotal.textContent =
      formatCurrency(total);
  }

  // =========================================
  // 8. ADD AND EDIT TRANSACTIONS
  // =========================================

  async function addTransaction(event) {
    event.preventDefault();

    const title = elements.titleInput.value.trim();
    const type = elements.typeInput.value;
    const category = elements.categoryInput.value;
    const amount = Number(elements.amountInput.value);
    const date = elements.dateInput.value;
    const editId = elements.editId.value;

    if (
      !title ||
      !category ||
      (type === "expense" && category === "Savings") ||
      !date ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setMessage(
        elements.formMessage,
        "Please complete all fields correctly.",
        "error"
      );
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

    const normalText = editId
      ? "Update transaction"
      : "Add transaction";

    setBusy(
      elements.submitBtn,
      true,
      "Saving...",
      normalText
    );

    try {
      let result;

      if (editId) {
        result = await supabaseClient
          .from("moneta_transactions")
          .update(payload)
          .eq("id", editId)
          .select()
          .single();

      } else {
        result = await supabaseClient
          .from("moneta_transactions")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      resetTransactionForm();
      await loadTransactions();

      setMessage(
        elements.formMessage,
        editId
          ? "Transaction updated successfully."
          : "Transaction saved successfully."
      );

    } catch (error) {
      setMessage(
        elements.formMessage,
        "Could not save: " + error.message,
        "error"
      );

    } finally {
      setBusy(
        elements.submitBtn,
        false,
        "Saving...",
        elements.editId.value
          ? "Update transaction"
          : "Add transaction"
      );
    }
  }

  function editTransaction(id) {
    const item = transactions.find(entry =>
      String(entry.id) === String(id)
    );

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
  }

  async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

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

  function resetTransactionForm() {
    elements.transactionForm.reset();

    elements.editId.value = "";
    elements.dateInput.value = localDateString();

    elements.formHeading.textContent = "Add a transaction";
    elements.submitBtn.textContent = "Add transaction";
    elements.cancelEditBtn.hidden = true;

    populateCategories();
  }

  // =========================================
  // 9. MANUAL PAYSLIP ENTRY
  // =========================================

  function hidePayslipOCRControls() {
    // Disable the old PNG upload control.
    if (elements.payslipFile) {
      elements.payslipFile.hidden = true;
      elements.payslipFile.disabled = true;
      elements.payslipFile.required = false;
    }

    // Hide its associated label, if present.
    document.querySelectorAll('label[for="payslipFile"]')
      .forEach(label => {
        label.hidden = true;
      });

    // Hide the old OCR button.
    if (elements.readPayslipBtn) {
      elements.readPayslipBtn.hidden = true;
      elements.readPayslipBtn.disabled = true;
    }

    // Hide OCR status and extracted text.
    if (elements.payslipStatus) {
      elements.payslipStatus.hidden = true;
    }

    if (elements.payslipTextSection) {
      elements.payslipTextSection.hidden = true;
    }
  }

  // =========================================
  // 10. PAYSLIP HISTORY — SUPABASE
  // =========================================

  async function loadPaychecks() {
    const { data, error } = await supabaseClient
      .from("moneta_payslips")
      .select("*")
      .order("pay_month", { ascending: false });

    if (error) throw error;

    paychecks = (data || []).map(item => ({
      ...item,
      basic_salary: BASIC_SALARY,
      service_charge: Number(item.service_charge) || 0,
      tips: Number(item.tips) || 0,
      gross_salary: BASIC_SALARY + (Number(item.service_charge) || 0) + (Number(item.tips) || 0),
      net_pay: BASIC_SALARY + (Number(item.service_charge) || 0) + (Number(item.tips) || 0)
    }));

    renderPaycheckHistory();
  }

  function renderPaycheckHistory() {
    if (!paychecks.length) {
      elements.payslipHistory.innerHTML =
        '<p class="empty-message">No payslips saved yet.</p>';
      return;
    }

    elements.payslipHistory.innerHTML =
      paychecks.map(paycheck => `
        <article class="transaction-item">
          <div class="transaction-info">
            <strong>
              ${escapeHTML(paycheck.pay_month.slice(0, 7))}
            </strong>

            <span>
              Basic salary: ${formatCurrency(BASIC_SALARY)}
            </span>

            <span>
              Service charge: ${formatCurrency(paycheck.service_charge)}
            </span>

            <span>
              Tips: ${formatCurrency(paycheck.tips)}
            </span>
          </div>

          <div class="payslip-history-right">
            <div class="transaction-amount income-text">
              Total: ${formatCurrency(BASIC_SALARY + paycheck.service_charge + paycheck.tips)}
            </div>
            <div class="payslip-history-actions">
              <button class="button payslip-edit-btn" type="button" data-action="edit" data-month="${escapeHTML(paycheck.pay_month)}">Edit</button>
              <button class="button payslip-delete-btn" type="button" data-action="delete" data-month="${escapeHTML(paycheck.pay_month)}">Delete</button>
            </div>
          </div>
        </article>
      `).join("");
  }

  function updateTotalSalary() {
    const serviceCharge = Number(elements.serviceCharge.value) || 0;
    const tipsAmount = Number(elements.tips.value) || 0;
    const total = BASIC_SALARY + serviceCharge + tipsAmount;
    elements.totalSalary.value = formatCurrency(total);
    return total;
  }

  function resetPayslipEdit() {
    editingPayMonth = null;
    elements.payMonth.disabled = false;
    elements.payslipForm.reset();
    elements.payMonth.value = currentMonthString();
    elements.serviceCharge.value = "0";
    elements.tips.value = "0";
    elements.payDate.value = "";
    elements.payNotes.value = "";
    elements.cancelPayslipEditBtn.hidden = true;
    elements.savePayslipBtn.textContent = "Save confirmed payslip";
    updateTotalSalary();
  }

  function startPayslipEdit(month) {
    const paycheck = paychecks.find(item => item.pay_month === month);
    if (!paycheck) return;

    editingPayMonth = paycheck.pay_month;
    elements.payMonth.value = paycheck.pay_month.slice(0, 7);
    elements.payMonth.disabled = true;
    elements.payDate.value = paycheck.pay_date
      ? String(paycheck.pay_date).slice(0, 10)
      : "";
    elements.serviceCharge.value = String(paycheck.service_charge);
    elements.tips.value = String(paycheck.tips);
    elements.payNotes.value = paycheck.notes || "";
    elements.cancelPayslipEditBtn.hidden = false;
    elements.savePayslipBtn.textContent = "Update payslip";
    updateTotalSalary();
    setMessage(elements.payslipFormMessage,
      "Editing " + paycheck.pay_month.slice(0, 7) + ". Update the figures and save.");
    elements.payslipForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deletePayslip(month) {
    const paycheck = paychecks.find(item => item.pay_month === month);
    if (!paycheck) return;

    if (!confirm("Delete the salary record for " + month.slice(0, 7) +
      "? This will also remove that month's salary from its budget calculation.")) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from("moneta_payslips")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("pay_month", month);

      if (error) throw error;

      if (editingPayMonth === month) resetPayslipEdit();
      await loadPaychecks();
      await loadBudget();
      setCloudStatus("Salary record deleted", "success");
    } catch (error) {
      console.error("Payslip delete error:", error);
      setMessage(elements.payslipFormMessage,
        "Could not delete salary record: " + error.message, "error");
    }
  }

  async function savePayslip(event) {
    event.preventDefault();

    const month = editingPayMonth
      ? editingPayMonth.slice(0, 7)
      : elements.payMonth.value;
    const payDate = elements.payDate.value || null;
    const serviceRaw = elements.serviceCharge.value.trim();
    const tipsRaw = elements.tips.value.trim();

    if (serviceRaw === "" || tipsRaw === "") {
      setMessage(elements.payslipFormMessage,
        "Please enter the service charge and tips.", "error");
      return;
    }

    const serviceCharge = Number(serviceRaw);
    const tipsAmount = Number(tipsRaw);
    const total = BASIC_SALARY + serviceCharge + tipsAmount;

    if (
      !month || !/^\d{4}-\d{2}$/.test(month) ||
      !Number.isFinite(serviceCharge) || serviceCharge < 0 ||
      !Number.isFinite(tipsAmount) || tipsAmount < 0
    ) {
      setMessage(elements.payslipFormMessage,
        "Please check the month, service charge and tips.", "error");
      return;
    }

    const confirmationMessage = [
      "Please confirm your salary:",
      "",
      `Basic salary: ${formatCurrency(BASIC_SALARY)}`,
      `Service charge: ${formatCurrency(serviceCharge)}`,
      `Tips: ${formatCurrency(tipsAmount)}`,
      `Total salary: ${formatCurrency(total)}`,
      "",
      "Save this payslip?"
    ].join("\n");

    if (!confirm(confirmationMessage)) {
      setMessage(elements.payslipFormMessage,
        "Not saved. Check the figures, then try again.", "error");
      return;
    }

    setBusy(elements.savePayslipBtn, true, "Saving...", "Save confirmed payslip");

    try {
      const payload = {
        user_id: currentUser.id,
        pay_month: monthStart(month),
        pay_date: payDate,
        currency: "AED",
        basic_salary: BASIC_SALARY,
        service_charge: serviceCharge,
        tips: tipsAmount,
        gross_salary: total,
        net_salary: total,
        allowances: 0,
        overtime: 0,
        other_income: 0,
        deductions: 0,
        file_name: "",
        notes: elements.payNotes.value.trim(),
        updated_at: new Date().toISOString()
      };

      let saveQuery = supabaseClient.from("moneta_payslips");

      if (editingPayMonth) {
        const { error } = await saveQuery
          .update(payload)
          .eq("user_id", currentUser.id)
          .eq("pay_month", editingPayMonth);
        if (error) throw error;
      } else {
        const { error } = await saveQuery
          .upsert(payload, { onConflict: "user_id,pay_month" });
        if (error) throw error;
      }

      const wasEditing = Boolean(editingPayMonth);
      await loadPaychecks();
      await loadBudget();

      if (wasEditing) resetPayslipEdit();

      setMessage(elements.payslipFormMessage,
        wasEditing
          ? "Your salary record has been updated successfully."
          : "Your total salary has been saved successfully.");
      setCloudStatus("Payslip saved to your cloud account", "success");

    } catch (error) {
      console.error("Payslip save error:", error);
      setMessage(elements.payslipFormMessage,
        "Could not save payslip: " + error.message, "error");

    } finally {
      setBusy(elements.savePayslipBtn, false, "Saving...", "Save confirmed payslip");
    }
  }

  // =========================================
  // 11. MONTHLY BUDGET
  // =========================================

  function getPaycheckForMonth(month) {
    return paychecks.find(item =>
      item.pay_month === monthStart(month)
    );
  }

  function roundBudgetAmount(amount) {
    return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
  }

  function createBudgetForIncome(income) {
    const wifeAmount = roundBudgetAmount(income * WIFE_BUDGET_PERCENT / 100);
    const financialGoalsAmount = Math.max(
      roundBudgetAmount(income * FINANCIAL_GOALS_PERCENT / 100),
      FINANCIAL_GOALS_MINIMUM
    );

    const fixedTotal = BUDGET_FIXED_AMOUNTS.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const savingsAmount = Math.max(
      0,
      roundBudgetAmount(income - fixedTotal - wifeAmount - financialGoalsAmount)
    );

    return [
      ...BUDGET_FIXED_AMOUNTS.map(item => ({
        category: item.category,
        planned: item.amount
      })),
      { category: "Wife", planned: wifeAmount },
      { category: "Financial Goals / Debt", planned: financialGoalsAmount },
      { category: "Savings", planned: savingsAmount }
    ];
  }

  function applyDynamicBudgetRules(items, income) {
    const hasDynamicCategories = ["Wife", "Financial Goals / Debt", "Savings"]
      .every(category => items.some(item => item.category === category));

    if (!hasDynamicCategories) return items;

    const wifeAmount = roundBudgetAmount(income * WIFE_BUDGET_PERCENT / 100);
    const financialGoalsAmount = Math.max(
      roundBudgetAmount(income * FINANCIAL_GOALS_PERCENT / 100),
      FINANCIAL_GOALS_MINIMUM
    );
    const otherPlanned = items
      .filter(item => !["Wife", "Financial Goals / Debt", "Savings"].includes(item.category))
      .reduce((sum, item) => sum + Number(item.planned || 0), 0);
    const savingsAmount = Math.max(
      0,
      roundBudgetAmount(income - otherPlanned - wifeAmount - financialGoalsAmount)
    );

    return items.map(item => {
      if (item.category === "Wife") return { ...item, planned: wifeAmount };
      if (item.category === "Financial Goals / Debt") {
        return { ...item, planned: financialGoalsAmount };
      }
      if (item.category === "Savings") return { ...item, planned: savingsAmount };
      return item;
    });
  }

  function generateBudget() {
    const month = getSelectedBudgetMonth();
    const paycheck = getPaycheckForMonth(month);

    if (!paycheck) {
      setMessage(
        elements.budgetMessage,
        "Save a confirmed payslip for this month before generating a budget.",
        "error"
      );
      return;
    }

    budgetItems = createBudgetForIncome(Number(paycheck.net_pay));
    renderBudget();

    setMessage(
      elements.budgetMessage,
      "Budget created: Wife receives 10%, Financial Goals / Debt receives at least AED 1,100, and Savings gets the remainder."
    );
  }

  async function loadBudget() {
    const month = getSelectedBudgetMonth();

    const { data, error } = await supabaseClient
      .from("moneta_budgets")
      .select("category, planned_amount")
      .eq("budget_month", monthStart(month))
      .order("category");

    if (error) throw error;

    budgetItems = (data || []).map(item => ({
      category: item.category,
      planned: Number(item.planned_amount)
    }));

    const paycheck = getPaycheckForMonth(month);
    if (paycheck) {
      if (budgetItems.length) {
        budgetItems = applyDynamicBudgetRules(
          budgetItems,
          Number(paycheck.net_pay)
        );
      } else {
        // Build a first-time monthly budget from the saved payslip.
        // This stays in memory until the user chooses to save it.
        budgetItems = createBudgetForIncome(Number(paycheck.net_pay));
      }
    }

    renderBudget();
  }

  function getActualExpensesForCategory(category, month) {
    return transactions
      .filter(item =>
        item.type === "expense" &&
        item.category === category &&
        item.date.startsWith(month)
      )
      .reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );
  }

  function renderBudget() {
    const month = getSelectedBudgetMonth();
    const paycheck = getPaycheckForMonth(month);

    const income = paycheck
      ? Number(paycheck.net_pay)
      : 0;

    const planned = budgetItems.reduce(
      (sum, item) => sum + Number(item.planned),
      0
    );

    const remaining = income - planned;

    elements.budgetIncome.textContent =
      formatCurrency(income);

    elements.budgetPlanned.textContent =
      formatCurrency(planned);

    const progress = income > 0
      ? Math.min(planned / income * 100, 100)
      : 0;

    elements.budgetProgress.style.width =
      `${progress}%`;

    elements.budgetProgressMessage.textContent = !income
      ? "Save a payslip to calculate your monthly budget."
      : remaining < 0
        ? `Budget exceeds income by ${formatCurrency(Math.abs(remaining))}; your AED 1,100 financial-goals minimum is protected.`
        : `${Math.round(progress)}% of your take-home pay has been allocated.`;

    updateCompactDashboard(getMonthTotals());

    if (!budgetItems.length) {
      elements.budgetList.innerHTML =
        '<p class="empty-message">Generate a budget or load a saved budget.</p>';
      return;
    }

    elements.budgetList.innerHTML =
      budgetItems.map((item, index) => {
        const actual = getActualExpensesForCategory(
          item.category,
          month
        );

        const left = Number(item.planned) - actual;

        const spentProgress = Number(item.planned) > 0
          ? Math.min(actual / Number(item.planned) * 100, 100)
          : 0;

        return `
          <div class="budget-row">
            <div class="budget-row-heading">
              <strong>${escapeHTML(item.category)}</strong>
              <span>
                Spent: ${formatCurrency(actual)}
                · Left: ${formatCurrency(left)}
              </span>
            </div>

            <label>
              ${item.category === "Savings" ? "Calculated automatically" : "Planned amount (AED)"}
              ${item.category === "Savings"
                ? `<output class="budget-calculated-amount">${formatCurrency(item.planned)}</output>`
                : `<input
                    type="number"
                    class="budget-amount-input"
                    data-budget-index="${index}"
                    min="0"
                    step="0.01"
                    value="${Number(item.planned).toFixed(2)}"
                  >`}
            </label>

            <div class="progress-track">
              <div
                class="progress-fill"
                style="width:${spentProgress}%"
              ></div>
            </div>
          </div>
        `;
      }).join("");
  }

  function updateBudgetInput(event) {
    const input = event.target.closest(".budget-amount-input");

    if (!input) return;

    const index = Number(input.dataset.budgetIndex);
    const amount = Number(input.value);

    if (
      !Number.isInteger(index) ||
      !budgetItems[index] ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return;
    }

    if (budgetItems[index].category === "Savings") {
      renderBudget();
      return;
    }

    budgetItems[index].planned = amount;

    const month = getSelectedBudgetMonth();
    const paycheck = getPaycheckForMonth(month);
    const income = paycheck ? Number(paycheck.net_pay) : 0;

    if (income > 0) {
      budgetItems = applyDynamicBudgetRules(budgetItems, income);
    }

    renderBudget();
  }

  async function saveBudget() {
    const month = getSelectedBudgetMonth();

    if (!budgetItems.length) {
      setMessage(
        elements.budgetMessage,
        "Generate or load a budget first.",
        "error"
      );
      return;
    }

    if (!getPaycheckForMonth(month)) {
      setMessage(
        elements.budgetMessage,
        "A confirmed payslip is needed for this month.",
        "error"
      );
      return;
    }

    const invalid = budgetItems.some(item =>
      !item.category ||
      !Number.isFinite(Number(item.planned)) ||
      Number(item.planned) < 0
    );

    if (invalid) {
      setMessage(
        elements.budgetMessage,
        "Please check the budget amounts.",
        "error"
      );
      return;
    }

    setBusy(
      elements.saveBudgetBtn,
      true,
      "Saving...",
      "Save monthly budget"
    );

    try {
      const rows = budgetItems.map(item => ({
        user_id: currentUser.id,
        budget_month: monthStart(month),
        category: item.category,
        planned_amount: Number(item.planned),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabaseClient
        .from("moneta_budgets")
        .upsert(rows, {
          onConflict: "user_id,budget_month,category"
        });

      if (error) throw error;

      await loadBudget();

      setMessage(
        elements.budgetMessage,
        "Your monthly budget has been saved to the cloud."
      );

      setCloudStatus("Monthly budget saved", "success");

    } catch (error) {
      setMessage(
        elements.budgetMessage,
        "Could not save budget: " + error.message,
        "error"
      );

    } finally {
      setBusy(
        elements.saveBudgetBtn,
        false,
        "Saving...",
        "Save monthly budget"
      );
    }
  }

  // =========================================
  // 12. CSV EXPORT
  // =========================================

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

  function exportCSV() {
    const filtered = getFilteredTransactions();

    if (!filtered.length) {
      alert("There are no transactions to export.");
      return;
    }

    const rows = [
      ["Date", "Description", "Type", "Category", "Amount (AED)"],

      ...filtered.map(item => [
        item.date,
        item.title,
        item.type,
        item.category,
        Number(item.amount).toFixed(2)
      ])
    ];

    const csv = rows.map(row =>
      row.map(value =>
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
  

  // =========================================
  // 13. JSON BACKUP AND RESTORE
  // =========================================

  function backupData() {
    const backup = {
      app: "MONETA",
      version: 5,
      exportedAt: new Date().toISOString(),
      savingsGoal,
      transactions: transactions.map(item => ({
        title: item.title,
        type: item.type,
        category: item.category,
        amount: item.amount,
        date: item.date
      })),
      paychecks: paychecks.map(item => ({
        pay_month: item.pay_month,
        pay_date: item.pay_date || null,
        currency: item.currency || "AED",
        basic_salary: BASIC_SALARY,
        service_charge: Number(item.service_charge) || 0,
        tips: Number(item.tips) || 0,
        gross_salary: BASIC_SALARY + (Number(item.service_charge) || 0) + (Number(item.tips) || 0),
        net_salary: BASIC_SALARY + (Number(item.service_charge) || 0) + (Number(item.tips) || 0),
        allowances: Number(item.allowances) || 0,
        overtime: Number(item.overtime) || 0,
        other_income: Number(item.other_income) || 0,
        deductions: Number(item.deductions) || 0,
        file_name: item.file_name || "",
        notes: item.notes || ""
      })),
      budget_month: getSelectedBudgetMonth(),
      budgets: budgetItems.map(item => ({
        category: item.category,
        planned: Number(item.planned)
      }))
    };

    downloadFile(
      JSON.stringify(backup, null, 2),
      "moneta-backup.json",
      "application/json"
    );
  }

  async function importBackup(file) {
    if (!file) return;

    let restoreCommitted = false;

    try {
      const backup = JSON.parse(await file.text());

      if (
        !backup ||
        backup.app !== "MONETA" ||
        ![4, 5].includes(Number(backup.version)) ||
        !Array.isArray(backup.transactions)
      ) {
        throw new Error("Invalid MONETA backup file.");
      }

      const paychecks = Array.isArray(backup.paychecks)
        ? backup.paychecks.length
        : 0;

      const budgets = Array.isArray(backup.budgets)
        ? backup.budgets.length
        : 0;

      const budgetMonth = backup.budget_month ||
        getSelectedBudgetMonth();

      if (!/^\d{4}-\d{2}$/.test(budgetMonth)) {
        throw new Error("Backup contains an invalid budget month.");
      }

      const goal = backup.savingsGoal === undefined
        ? null
        : Number(backup.savingsGoal);

      if (
        backup.savingsGoal !== undefined &&
        (!Number.isFinite(goal) || goal < 0)
      ) {
        throw new Error("Backup contains an invalid savings goal.");
      }

      const summary = [
        "Restore this MONETA backup?",
        "",
        `Transactions: ${backup.transactions.length}`,
        `Payslips: ${paychecks}`,
        `Budget categories: ${budgets}`,
        `Savings goal: ${goal === null ? "Not included" : formatCurrency(goal)}`,
        "",
        "Restore will only proceed if all MONETA cloud tables are empty.",
        "All sections will be saved together or none will be saved."
      ].join("\n");

      if (!confirm(summary)) return;

      elements.importMessage.textContent = "Restoring backup...";

      const normalizedBackup = {
        ...backup,
        paychecks: (backup.paychecks || []).map(item => {
          const total = BASIC_SALARY +
            (Number(item.service_charge) || 0) +
            (Number(item.tips) || 0);
          return {
            ...item,
            basic_salary: BASIC_SALARY,
            gross_salary: total,
            net_salary: total
          };
        })
      };

      const { data, error } = await supabaseClient.rpc(
        "restore_moneta_backup",
        { p_backup: normalizedBackup }
      );

      if (error) throw error;

      restoreCommitted = true;
      elements.budgetMonth.value = budgetMonth;

      await Promise.all([
        loadTransactions(),
        loadSavingsGoal(),
        loadPaychecks(),
        loadBudget()
      ]);

      renderDashboard();
      renderBudget();

      elements.importMessage.textContent =
        `Backup restored successfully. ${data.transactions} transactions, ${data.payslips} payslips and ${data.budgets} budget categories restored.`;

      setCloudStatus("Backup restored successfully", "success");

    } catch (error) {
      console.error("MONETA restore error:", error);

      elements.importMessage.textContent = restoreCommitted
        ? "Backup was restored, but the dashboard could not refresh: " + error.message
        : "Restore failed: " + error.message +
          " No partial restore was saved.";

    } finally {
      elements.importFile.value = "";
    }
  }

  // =========================================
  // 14. LOGOUT
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
  // 15. EVENT LISTENERS
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
    resetTransactionForm
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

  const seeAllActivity = $("seeAllActivity");
  if (seeAllActivity) {
    seeAllActivity.addEventListener("click", event => {
      event.preventDefault();
      const moreTools = $("moreTools");
      if (moreTools) moreTools.open = true;
      const transactionsSection = $("transactionsSection");
      if (transactionsSection) {
        transactionsSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }

  $("quickAddExpense").addEventListener("click", () => {
    elements.typeInput.value = "expense"; populateCategories(); $("moreTools").open = true;
    $("transactionSection").scrollIntoView({behavior:"smooth",block:"start"});
  });

  elements.addTransactionBtn.addEventListener("click", () => {
    $("transactionSection").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    elements.titleInput.focus({ preventScroll: true });
  });

  elements.transactionList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
      editTransaction(id);
    }

    if (button.dataset.action === "delete") {
      deleteTransaction(id);
    }
  });

  elements.exportBtn.addEventListener(
    "click",
    exportCSV
  );

  elements.backupBtn.addEventListener(
    "click",
    backupData
  );

  elements.logoutBtn.addEventListener(
    "click",
    logout
  );

  elements.importFile.addEventListener("change", event => {
    importBackup(event.target.files[0]);
  });

  // No OCR or image-reading event listener.
  // Payslips are entered manually.

  elements.serviceCharge.addEventListener("input", updateTotalSalary);
  elements.tips.addEventListener("input", updateTotalSalary);

  elements.payslipForm.addEventListener(
    "submit",
    savePayslip
  );

  elements.cancelPayslipEditBtn.addEventListener(
    "click",
    resetPayslipEdit
  );

  elements.payslipHistory.addEventListener("click", event => {
    const actionButton = event.target.closest("button[data-action][data-month]");
    if (!actionButton) return;

    const { action, month } = actionButton.dataset;
    if (action === "edit") startPayslipEdit(month);
    if (action === "delete") deletePayslip(month);
  });

  elements.generateBudgetBtn.addEventListener(
    "click",
    generateBudget
  );

  elements.saveBudgetBtn.addEventListener(
    "click",
    saveBudget
  );

  elements.budgetList.addEventListener(
    "change",
    updateBudgetInput
  );

  elements.budgetMonth.addEventListener("change", async () => {
    try {
      await loadBudget();
      renderBudget();

    } catch (error) {
      setMessage(
        elements.budgetMessage,
        "Could not load budget: " + error.message,
        "error"
      );
    }
  });

  // =========================================
  // 16. START MONETA
  // =========================================

  async function startMoneta() {
    if (!window.supabase) {
      throw new Error(
        "Supabase library could not be loaded."
      );
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    // Remove the old OCR controls from the interface.
    hidePayslipOCRControls();

    elements.todayLabel.textContent =
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });

    elements.year.textContent =
      new Date().getFullYear();

    elements.monthFilter.value =
      currentMonthString();

    elements.dateInput.value =
      localDateString();

    elements.payMonth.value =
      currentMonthString();

    updateTotalSalary();

    elements.budgetMonth.value =
      currentMonthString();

    populateCategories();
    populateCategoryFilter();

    const { data, error } =
      await supabaseClient.auth.getUser();

    if (error || !data.user) {
      window.location.replace("login.html");
      return;
    }

    currentUser = data.user;

    await Promise.all([
      loadTransactions(),
      loadSavingsGoal(),
      loadPaychecks()
    ]);

    await loadBudget();

    renderDashboard();
    renderBudget();

    setCloudStatus(
      "Connected · Your data is synced",
      "success"
    );
  }

  startMoneta().catch(error => {
    console.error("MONETA startup error:", error);

    setCloudStatus(
      "Could not connect: " + error.message,
      "error"
    );
  });

});
