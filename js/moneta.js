
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // =========================================
  // 1. CONFIGURATION
  // =========================================

  const SUPABASE_URL = "https://fqbcfuduinjdumozfbja.supabase.co";
  const SUPABASE_KEY = "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

  let supabaseClient;
  let currentUser = null;
  let transactions = [];
  let paychecks = [];
  let budgetItems = [];
  let savingsGoal = 1000;

  const EXPENSE_CATEGORIES = [
    "Food", "Groceries", "Transport", "Shopping",
    "Bills", "Housing", "Health", "Entertainment",
    "Gym", "Education", "Other"
  ];

  const INCOME_CATEGORIES = [
    "Salary", "Tips", "Freelance", "Business",
    "Investment", "Other"
  ];

  // Suggested budget categories and percentages.
  // You can edit every amount after generation.
  const BUDGET_DEFAULTS = [
    { category: "Housing", percent: 8 },
    { category: "Food", percent: 18 },
    { category: "Groceries", percent: 10 },
    { category: "Transport", percent: 5 },
    { category: "Bills", percent: 5 },
    { category: "Health", percent: 3 },
    { category: "Gym", percent: 3 },
    { category: "Personal", percent: 8 },
    { category: "Entertainment", percent: 3 },
    { category: "Education", percent: 2 },
    { category: "Debt repayment", percent: 15 },
    { category: "Savings", percent: 15 },
    { category: "Emergency fund", percent: 5 }
  ];

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
    logoutBtn: $("logoutBtn"),

    payslipFile: $("payslipFile"),
    readPayslipBtn: $("readPayslipBtn"),
    payslipStatus: $("payslipStatus"),
    payslipText: $("payslipText"),
    payslipTextSection: $("payslipTextSection"),
    payslipForm: $("payslipForm"),
    payMonth: $("payMonth"),
    payDate: $("payDate"),
    basicSalary: $("basicSalary"),
    allowances: $("allowances"),
    overtime: $("overtime"),
    otherIncome: $("otherIncome"),
    deductions: $("deductions"),
    netPay: $("netPay"),
    payNotes: $("payNotes"),
    savePayslipBtn: $("savePayslipBtn"),
    payslipFormMessage: $("payslipFormMessage"),
    payslipHistory: $("payslipHistory"),

    budgetMonth: $("budgetMonth"),
    generateBudgetBtn: $("generateBudgetBtn"),
    budgetIncome: $("budgetIncome"),
    budgetPlanned: $("budgetPlanned"),
    budgetRemaining: $("budgetRemaining"),
    budgetProgress: $("budgetProgress"),
    budgetProgressMessage: $("budgetProgressMessage"),
    budgetList: $("budgetList"),
    saveBudgetBtn: $("saveBudgetBtn"),
    budgetMessage: $("budgetMessage")
  };

  // =========================================
  // 2. GENERAL HELPERS
  // =========================================

  function localDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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
    return String(value).replace(/[&<>"']/g, (char) => ({
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

  function getMonthTransactions() {
    const month = getSelectedMonth();
    return transactions.filter(item => item.date.startsWith(month));
  }

  function getMonthTotals() {
    const items = getMonthTransactions();

    const income = items
      .filter(item => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = items
      .filter(item => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return { income, expenses, balance: income - expenses };
  }

  // =========================================
  // 3. TRANSACTION CATEGORIES
  // =========================================

  function populateCategories() {
    const categories = elements.typeInput.value === "income"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

    const previous = elements.categoryInput.value;

    elements.categoryInput.innerHTML = categories.map(category =>
      `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    ).join("");

    if (categories.includes(previous)) {
      elements.categoryInput.value = previous;
    }
  }

  function populateCategoryFilter() {
    const selected = elements.categoryFilter.value || "all";

    const categories = [
      ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
    ];

    elements.categoryFilter.innerHTML =
      '<option value="all">All categories</option>' +
      categories.map(category =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      ).join("");

    elements.categoryFilter.value =
      categories.includes(selected) ? selected : "all";
  }

  // =========================================
  // 4. TRANSACTIONS: CLOUD
  // =========================================

  async function loadTransactions() {
    setCloudStatus("Loading your transactions...");

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
    setCloudStatus("Connected · Your data is synced", "success");
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

    savingsGoal = data ? Number(data.savings_goal) : 1000;
    elements.goalInput.value = savingsGoal;
    renderDashboard();
  }

  async function saveSavingsGoal() {
    const goal = Number(elements.goalInput.value);

    if (!Number.isFinite(goal) || goal < 0) {
      alert("Please enter a valid savings goal.");
      return;
    }

    setBusy(elements.saveGoalBtn, true, "Saving...", "Save goal");

    try {
      const { error } = await supabaseClient
        .from("moneta_settings")
        .upsert({
          user_id: currentUser.id,
          savings_goal: goal,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

      if (error) throw error;

      savingsGoal = goal;
      renderDashboard();
      setCloudStatus("Savings goal saved to cloud", "success");
    } catch (error) {
      alert("Could not save your goal: " + error.message);
    } finally {
      setBusy(elements.saveGoalBtn, false, "Saving...", "Save goal");
    }
  }

  // =========================================
  // 6. DASHBOARD
  // =========================================

  function renderDashboard() {
    const totals = getMonthTotals();

    elements.balanceValue.textContent = formatCurrency(totals.balance);
    elements.incomeValue.textContent = formatCurrency(totals.income);
    elements.expenseValue.textContent = formatCurrency(totals.expenses);

    renderSavingsGoal(totals.balance);
    renderComparisonChart(totals);
    renderCategoryChart();
    renderTransactions();
  }

  function renderSavingsGoal(balance) {
    const progress = savingsGoal > 0
      ? Math.max(0, (balance / savingsGoal) * 100)
      : 0;

    elements.goalPercent.textContent = `${Math.round(progress)}%`;
    elements.goalProgress.style.width = `${Math.min(progress, 100)}%`;

    if (savingsGoal === 0) {
      elements.goalMessage.textContent = "Set a savings target above zero.";
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
    elements.chartIncome.textContent = formatCurrency(totals.income);
    elements.chartExpense.textContent = formatCurrency(totals.expenses);

    const max = Math.max(totals.income, totals.expenses, 1);

    elements.incomeBar.style.width = `${totals.income / max * 100}%`;
    elements.expenseBar.style.width = `${totals.expenses / max * 100}%`;
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

    elements.categoryChart.innerHTML = categories.map(([category, amount]) => `
      <div class="category-row">
        <div class="category-row-top">
          <span>${escapeHTML(category)}</span>
          <strong>${formatCurrency(amount)}</strong>
        </div>
        <div class="category-track">
          <div class="category-fill" style="width:${amount / max * 100}%"></div>
        </div>
      </div>
    `).join("");
  }

  // =========================================
  // 7. TRANSACTION LIST
  // =========================================

  function getFilteredTransactions() {
    const search = elements.searchInput.value.trim().toLowerCase();
    const type = elements.typeFilter.value;
    const category = elements.categoryFilter.value;
    const month = getSelectedMonth();

    return transactions.filter(item => {
      const matchesMonth = item.date.startsWith(month);
      const matchesType = type === "all" || item.type === type;
      const matchesCategory = category === "all" || item.category === category;

      const matchesSearch =
        item.title.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      return matchesMonth && matchesType && matchesCategory && matchesSearch;
    }).sort((a, b) =>
      b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
  }

  function renderTransactions() {
    const filtered = getFilteredTransactions();

    if (!filtered.length) {
      elements.transactionList.innerHTML =
        '<p class="empty-message">No matching transactions found.</p>';
    } else {
      elements.transactionList.innerHTML = filtered.map(item => {
        const income = item.type === "income";

        return `
          <article class="transaction-item">
            <div class="transaction-info">
              <strong>${escapeHTML(item.title)}</strong>
              <span>${escapeHTML(item.category)} · ${escapeHTML(item.date)}</span>
            </div>

            <div class="transaction-amount ${income ? "income-text" : "expense-text"}">
              ${income ? "+" : "−"}${formatCurrency(item.amount)}
            </div>

            <div class="transaction-actions">
              <button type="button" class="edit-btn" data-action="edit" data-id="${escapeHTML(item.id)}">Edit</button>
              <button type="button" class="delete-btn" data-action="delete" data-id="${escapeHTML(item.id)}">Delete</button>
            </div>
          </article>
        `;
      }).join("");
    }

    elements.transactionCount.textContent =
      `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;

    const total = filtered.reduce((sum, item) =>
      sum + (item.type === "income" ? Number(item.amount) : -Number(item.amount)), 0
    );

    elements.filteredTotal.textContent = formatCurrency(total);
  }

  // =========================================
  // 8. ADD / EDIT TRANSACTION
  // =========================================

  async function addTransaction(event) {
    event.preventDefault();

    const title = elements.titleInput.value.trim();
    const type = elements.typeInput.value;
    const category = elements.categoryInput.value;
    const amount = Number(elements.amountInput.value);
    const date = elements.dateInput.value;
    const editId = elements.editId.value;

    if (!title || !category || !date || !Number.isFinite(amount) || amount <= 0) {
      setMessage(elements.formMessage, "Please complete all fields correctly.", "error");
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

    setBusy(elements.submitBtn, true, "Saving...", editId ? "Update transaction" : "Add transaction");

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

      resetForm();
      await loadTransactions();

      setMessage(
        elements.formMessage,
        editId ? "Transaction updated successfully." : "Transaction saved to cloud."
      );
    } catch (error) {
      setMessage(elements.formMessage, "Could not save: " + error.message, "error");
    } finally {
      setBusy(
        elements.submitBtn,
        false,
        "Saving...",
        elements.editId.value ? "Update transaction" : "Add transaction"
      );
    }
  }

  function editTransaction(id) {
    const item = transactions.find(entry => entry.id === id);
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

  async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

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
  // 9. PAYSLIP READER
  // =========================================

  async function readPayslip() {
    const file = elements.payslipFile.files[0];

    if (!file) {
      setMessage(elements.payslipStatus, "Choose a payslip first.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage(elements.payslipStatus, "Please choose a file smaller than 10 MB.", "error");
      return;
    }

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    if (!isPDF && !isImage) {
      setMessage(elements.payslipStatus, "Please upload a PDF or image.", "error");
      return;
    }

    setBusy(elements.readPayslipBtn, true, "Reading payslip...", "Read payslip");

    try {
      let extractedText = "";

      if (isPDF) {
        if (!window.pdfjsLib) {
          throw new Error("PDF reader could not load. Refresh and try again.");
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js";

        const buffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;

        const pageCount = Math.min(pdf.numPages, 5);

        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();

          extractedText += content.items
            .map(item => item.str)
            .join(" ") + "\n";
        }

        if (!extractedText.trim()) {
          throw new Error("No selectable text found in this PDF. Try uploading a clear image of the payslip instead.");
        }
      } else {
        if (!window.Tesseract) {
          throw new Error("Image reader could not load. Refresh and try again.");
        }

        const result = await window.Tesseract.recognize(file, "eng");
        extractedText = result.data.text || "";
      }

      if (!extractedText.trim()) {
        throw new Error("No readable text found. Try a clearer image.");
      }

      elements.payslipText.value = extractedText;
      elements.payslipTextSection.hidden = false;

      suggestPayslipFields(extractedText);

      setMessage(
        elements.payslipStatus,
        "Reading complete. Check the recognised text and verify every figure manually."
      );
    } catch (error) {
      console.error(error);
      setMessage(elements.payslipStatus, error.message || "Could not read the payslip.", "error");
    } finally {
      setBusy(elements.readPayslipBtn, false, "Reading payslip...", "Read payslip");
    }
  }

  function findMoneyAfterLabel(text, labels) {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        escaped + "\\s*[:\\-]?\\s*(?:AED|د\\.إ)?\\s*([\\d,]+(?:\\.\\d{1,2})?)",
        "i"
      );

      const match = text.match(regex);

      if (match) {
        const value = Number(match[1].replace(/,/g, ""));
        if (Number.isFinite(value)) return value;
      }
    }

    return null;
  }

  function suggestPayslipFields(text) {
    const normalised = text.replace(/\s+/g, " ");

    const basic = findMoneyAfterLabel(normalised, [
      "Basic Salary", "Basic Pay"
    ]);

    const allowances = findMoneyAfterLabel(normalised, [
      "Allowances", "Total Allowances"
    ]);

    const overtime = findMoneyAfterLabel(normalised, [
      "Overtime", "OT Amount"
    ]);

    const deductions = findMoneyAfterLabel(normalised, [
      "Total Deductions", "Deductions"
    ]);

    const net = findMoneyAfterLabel(normalised, [
      "Net Pay", "Net Salary", "Take Home Pay", "Take-home Pay", "Net Amount"
    ]);

    if (basic !== null) elements.basicSalary.value = basic;
    if (allowances !== null) elements.allowances.value = allowances;
    if (overtime !== null) elements.overtime.value = overtime;
    if (deductions !== null) elements.deductions.value = deductions;
    if (net !== null) elements.netPay.value = net;

    const month = currentMonthString();
    if (!elements.payMonth.value) elements.payMonth.value = month;

    setMessage(
      elements.payslipStatus,
      "Possible figures filled in where recognised. OCR can make mistakes; compare each number with your original payslip."
    );
  }

  // =========================================
  // 10. SAVE PAYSLIP
  // =========================================

  async function loadPaychecks() {
    const { data, error } = await supabaseClient
      .from("moneta_paychecks")
      .select("*")
      .order("pay_month", { ascending: false });

    if (error) throw error;

    paychecks = data || [];
    renderPaycheckHistory();
  }

  function renderPaycheckHistory() {
    if (!paychecks.length) {
      elements.payslipHistory.innerHTML =
        '<p class="empty-message">No payslips saved yet.</p>';
      return;
    }

    elements.payslipHistory.innerHTML = paychecks.map(paycheck => `
      <article class="transaction-item">
        <div class="transaction-info">
          <strong>${escapeHTML(paycheck.pay_month.slice(0, 7))}</strong>
          <span>Basic ${formatCurrency(paycheck.basic_salary)} · Deductions ${formatCurrency(paycheck.deductions)}</span>
        </div>
        <div class="transaction-amount income-text">
          ${formatCurrency(paycheck.net_pay)}
        </div>
      </article>
    `).join("");
  }

  async function savePayslip(event) {
    event.preventDefault();

    const month = elements.payMonth.value;
    const payDate = elements.payDate.value || null;

    const basic = Number(elements.basicSalary.value);
    const allowances = Number(elements.allowances.value || 0);
    const overtime = Number(elements.overtime.value || 0);
    const otherIncome = Number(elements.otherIncome.value || 0);
    const deductions = Number(elements.deductions.value || 0);
    const netPay = Number(elements.netPay.value);

    const figures = [basic, allowances, overtime, otherIncome, deductions, netPay];

    if (!month || figures.some(value => !Number.isFinite(value) || value < 0)) {
      setMessage(elements.payslipFormMessage, "Check the payslip month and all amounts.", "error");
      return;
    }

    if (netPay <= 0) {
      setMessage(elements.payslipFormMessage, "Take-home pay must be greater than zero.", "error");
      return;
    }

    const gross = basic + allowances + overtime + otherIncome;

    if (netPay > gross && gross > 0) {
      if (!confirm("Your take-home pay is higher than the combined salary figures. Are you sure these numbers are correct?")) {
        return;
      }
    }

    setBusy(elements.savePayslipBtn, true, "Saving...", "Save confirmed payslip");

    try {
      const payload = {
        user_id: currentUser.id,
        pay_month: monthStart(month),
        pay_date: payDate,
        currency: "AED",
        basic_salary: basic,
        allowances,
        overtime,
        other_income: otherIncome,
        deductions,
        net_pay: netPay,
        notes: elements.payNotes.value.trim(),
        updated_at: new Date().toISOString()
      };

      // Update an existing payslip for this month, otherwise insert.
      const existing = paychecks.find(item => item.pay_month === monthStart(month));

      let result;

      if (existing) {
        result = await supabaseClient
          .from("moneta_paychecks")
          .update(payload)
          .eq("id", existing.id);
      } else {
        result = await supabaseClient
          .from("moneta_paychecks")
          .insert(payload);
      }

      if (result.error) throw result.error;

      await loadPaychecks();

      setMessage(elements.payslipFormMessage, "Payslip figures saved successfully.");
      setCloudStatus("Payslip saved to your cloud account", "success");
    } catch (error) {
      console.error(error);
      setMessage(elements.payslipFormMessage, "Could not save payslip: " + error.message, "error");
    } finally {
      setBusy(elements.savePayslipBtn, false, "Saving...", "Save confirmed payslip");
    }
  }

  // =========================================
  // 11. BUDGET GENERATOR
  // =========================================

  function getPaycheckForMonth(month) {
    return paychecks.find(item => item.pay_month === monthStart(month));
  }

  async function generateBudget() {
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

    const income = Number(paycheck.net_pay);

    budgetItems = BUDGET_DEFAULTS.map(item => ({
      category: item.category,
      planned: Math.round(income * item.percent) / 100
    }));

    // Adjust rounding so the suggested allocations total exactly to income.
    const allocated = budgetItems.reduce((sum, item) => sum + item.planned, 0);
    const difference = Math.round((income - allocated) * 100) / 100;

    if (budgetItems.length) {
      budgetItems[budgetItems.length - 1].planned =
        Math.max(0, budgetItems[budgetItems.length - 1].planned + difference);
    }

    renderBudget();
    setMessage(elements.budgetMessage, "Suggested budget created. Adjust the amounts before saving.");
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

    renderBudget();
  }

  function getActualExpensesForCategory(category, month) {
    return transactions
      .filter(item =>
        item.type === "expense" &&
        item.category === category &&
        item.date.startsWith(month)
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }

  function renderBudget() {
    const month = getSelectedBudgetMonth();
    const paycheck = getPaycheckForMonth(month);
    const income = paycheck ? Number(paycheck.net_pay) : 0;

    const planned = budgetItems.reduce((sum, item) => sum + Number(item.planned), 0);
    const remaining = income - planned;

    elements.budgetIncome.textContent = formatCurrency(income);
    elements.budgetPlanned.textContent = formatCurrency(planned);
    elements.budgetRemaining.textContent = formatCurrency(remaining);

    const progress = income > 0 ? Math.min((planned / income) * 100, 100) : 0;
    elements.budgetProgress.style.width = `${progress}%`;

    elements.budgetProgressMessage.textContent = income
      ? `${Math.round(progress)}% of your take-home pay has been allocated.`
      : "Save a payslip to calculate your monthly budget.";

    if (!budgetItems.length) {
      elements.budgetList.innerHTML =
        '<p class="empty-message">Generate a budget or load a saved budget.</p>';
      return;
    }

    elements.budgetList.innerHTML = budgetItems.map((item, index) => {
      const actual = getActualExpensesForCategory(item.category, month);
      const left = Number(item.planned) - actual;

      return `
        <div class="budget-row">
          <div class="budget-row-heading">
            <strong>${escapeHTML(item.category)}</strong>
            <span>Spent: ${formatCurrency(actual)} · Left: ${formatCurrency(left)}</span>
          </div>

          <label>
            Planned amount (AED)
            <input
              type="number"
              class="budget-amount-input"
              data-budget-index="${index}"
              min="0"
              step="0.01"
              value="${Number(item.planned).toFixed(2)}"
            >
          </label>

          <div class="progress-track">
            <div class="progress-fill" style="width:${item.planned > 0 ? Math.min(actual / item.planned * 100, 100) : 0}%"></div>
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

    if (!Number.isInteger(index) || !budgetItems[index] ||
        !Number.isFinite(amount) || amount < 0) {
      return;
    }

    budgetItems[index].planned = amount;

    // Update totals without replacing the active input.
    const month = getSelectedBudgetMonth();
    const paycheck = getPaycheckForMonth(month);
    const income = paycheck ? Number(paycheck.net_pay) : 0;
    const planned = budgetItems.reduce((sum, item) => sum + Number(item.planned), 0);

    elements.budgetIncome.textContent = formatCurrency(income);
    elements.budgetPlanned.textContent = formatCurrency(planned);
    elements.budgetRemaining.textContent = formatCurrency(income - planned);

    const progress = income > 0 ? Math.min(planned / income * 100, 100) : 0;
    elements.budgetProgress.style.width = `${progress}%`;
    elements.budgetProgressMessage.textContent =
      `${Math.round(progress)}% of your take-home pay has been allocated.`;
  }

  async function saveBudget() {
    const month = getSelectedBudgetMonth();

    if (!budgetItems.length) {
      setMessage(elements.budgetMessage, "Generate or load a budget first.", "error");
      return;
    }

    const paycheck = getPaycheckForMonth(month);

    if (!paycheck) {
      setMessage(elements.budgetMessage, "A confirmed payslip is needed for this month.", "error");
      return;
    }

    const invalid = budgetItems.some(item =>
      !item.category ||
      !Number.isFinite(Number(item.planned)) ||
      Number(item.planned) < 0
    );

    if (invalid) {
      setMessage(elements.budgetMessage, "Check the budget amounts.", "error");
      return;
    }

    setBusy(elements.saveBudgetBtn, true, "Saving...", "Save monthly budget");

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
      setMessage(elements.budgetMessage, "Your monthly budget has been saved to the cloud.");
      setCloudStatus("Monthly budget saved", "success");
    } catch (error) {
      console.error(error);
      setMessage(elements.budgetMessage, "Could not save budget: " + error.message, "error");
    } finally {
      setBusy(elements.saveBudgetBtn, false, "Saving...", "Save monthly budget");
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
        item.date, item.title, item.type, item.category,
        Number(item.amount).toFixed(2)
      ])
    ];

    const csv = rows.map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    downloadFile(csv, "moneta-transactions.csv", "text/csv;charset=utf-8");
  }

  // =========================================
  // 13. JSON BACKUP AND RESTORE
  // =========================================

  function backupData() {
    const backup = {
      app: "MONETA",
      version: 2,
      exportedAt: new Date().toISOString(),
      savingsGoal,
      transactions: transactions.map(item => ({
        title: item.title,
        type: item.type,
        category: item.category,
        amount: item.amount,
        date: item.date
      })),
      paychecks,
      budgets: budgetItems
    };

    downloadFile(
      JSON.stringify(backup, null, 2),
      "moneta-backup.json",
      "application/json"
    );
  }

  async function importBackup(file) {
    if (!file) return;

    try {
      const backup = JSON.parse(await file.text());

      if (!backup || !Array.isArray(backup.transactions)) {
        throw new Error("This is not a valid MONETA backup.");
      }

      if (transactions.length > 0) {
        throw new Error("Import is only allowed when your cloud transaction list is empty.");
      }

      const imported = backup.transactions.map(item => {
        const amount = Number(item.amount);

        if (!item.title ||
            !["income", "expense"].includes(item.type) ||
            !item.category ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
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

      if (!imported.length) throw new Error("The backup contains no transactions.");

      if (!confirm(`Import ${imported.length} transactions into your cloud account?`)) return;

      elements.importMessage.textContent = "Importing...";

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
          }, { onConflict: "user_id" });

        if (goalError) throw goalError;
      }

      await loadTransactions();
      await loadSavingsGoal();

      elements.importMessage.textContent =
        `Successfully imported ${imported.length} transactions.`;
    } catch (error) {
      console.error(error);
      elements.importMessage.textContent = error.message || "Import failed.";
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

  elements.typeInput.addEventListener("change", populateCategories);
  elements.transactionForm.addEventListener("submit", addTransaction);
  elements.cancelEditBtn.addEventListener("click", resetForm);
  elements.saveGoalBtn.addEventListener("click", saveSavingsGoal);
  elements.monthFilter.addEventListener("change", renderDashboard);
  elements.searchInput.addEventListener("input", renderTransactions);
  elements.typeFilter.addEventListener("change", renderTransactions);
  elements.categoryFilter.addEventListener("change", renderTransactions);

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

    if (button.dataset.action === "edit") {
      editTransaction(button.dataset.id);
    }

    if (button.dataset.action === "delete") {
      deleteTransaction(button.dataset.id);
    }
  });

  elements.exportBtn.addEventListener("click", exportCSV);
  elements.backupBtn.addEventListener("click", backupData);
  elements.logoutBtn.addEventListener("click", logout);

  elements.importFile.addEventListener("change", event => {
    importBackup(event.target.files[0]);
  });

  elements.readPayslipBtn.addEventListener("click", readPayslip);
  elements.payslipForm.addEventListener("submit", savePayslip);

  elements.generateBudgetBtn.addEventListener("click", generateBudget);
  elements.saveBudgetBtn.addEventListener("click", saveBudget);
  elements.budgetList.addEventListener("change", updateBudgetInput);

  elements.budgetMonth.addEventListener("change", async () => {
    try {
      await loadBudget();
      renderBudget();
    } catch (error) {
      setMessage(elements.budgetMessage, "Could not load budget: " + error.message, "error");
    }
  });

  // =========================================
  // 16. START MONETA
  // =========================================

  async function startMoneta() {
    if (!window.supabase) {
      throw new Error("Supabase library could not be loaded.");
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

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
    elements.payMonth.value = currentMonthString();
    elements.budgetMonth.value = currentMonthString();

    populateCategories();
    populateCategoryFilter();

    const { data, error } = await supabaseClient.auth.getUser();

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

    setCloudStatus("Connected · Your data is synced", "success");
  }

  startMoneta().catch(error => {
    console.error("MONETA error:", error);
    setCloudStatus("Could not connect: " + error.message, "error");
  });

});
