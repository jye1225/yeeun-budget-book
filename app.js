const STORAGE_KEY = "yeeun-budget-book-state-v3";
const todayISO = "2026-09-26";
const REPORT_CATEGORY_LIMIT = 10;

const colorPalette = ["#3a91ff", "#ff8b18", "#12bd82", "#d8dde3", "#8e7dff", "#ff6776", "#2bb6c4"];

const seedState = {
  hideBalance: false,
  selectedView: "home",
  reportMonth: "2026-09",
  reportFilter: "all",
  categoryTab: "expense",
  accounts: [
    { id: "woori", name: "우리은행", balance: -169870 },
    { id: "kakao", name: "카카오뱅크", balance: 93616 },
    { id: "cash", name: "현금", balance: 304000 }
  ],
  categories: {
    expense: [
      { id: "food", name: "식비", color: "#3a91ff" },
      { id: "snack", name: "카페·간식", color: "#ff8b18" },
      { id: "shopping", name: "쇼핑", color: "#12bd82" },
      { id: "transport", name: "교통", color: "#8e7dff" },
      { id: "life", name: "생활비", color: "#2bb6c4" },
      { id: "etc-expense", name: "기타", color: "#d8dde3" }
    ],
    income: [
      { id: "allowance", name: "용돈", color: "#84d9ee" },
      { id: "part-time", name: "알바", color: "#9a97ff" },
      { id: "gift", name: "선물", color: "#8be49e" },
      { id: "interest", name: "이자", color: "#c9c9c9" },
      { id: "etc-income", name: "기타", color: "#d8dde3" }
    ]
  },
  transactions: [
    { id: "t-0901-i", type: "income", date: "2026-09-01", accountId: "cash", categoryId: "allowance", amount: 153000, memo: "용돈" },
    { id: "t-0901-e", type: "expense", date: "2026-09-01", accountId: "cash", categoryId: "snack", amount: 9690, memo: "간식" },
    { id: "t-0902", type: "expense", date: "2026-09-02", accountId: "woori", categoryId: "food", amount: 38300, memo: "점심" },
    { id: "t-0903", type: "expense", date: "2026-09-03", accountId: "kakao", categoryId: "shopping", amount: 46500, memo: "쇼핑" },
    { id: "t-0904", type: "expense", date: "2026-09-04", accountId: "kakao", categoryId: "food", amount: 45200, memo: "식비" },
    { id: "t-0905", type: "expense", date: "2026-09-05", accountId: "cash", categoryId: "etc-expense", amount: 10980, memo: "기타" },
    { id: "t-0907", type: "expense", date: "2026-09-07", accountId: "cash", categoryId: "snack", amount: 3300, memo: "커피" },
    { id: "t-0908", type: "expense", date: "2026-09-08", accountId: "woori", categoryId: "food", amount: 27000, memo: "저녁" },
    { id: "t-0909", type: "expense", date: "2026-09-09", accountId: "kakao", categoryId: "food", amount: 18500, memo: "식비" },
    { id: "t-0910-i", type: "income", date: "2026-09-10", accountId: "woori", categoryId: "allowance", amount: 26050, memo: "입금" },
    { id: "t-0910-e", type: "expense", date: "2026-09-10", accountId: "cash", categoryId: "snack", amount: 2900, memo: "음료" },
    { id: "t-0911", type: "expense", date: "2026-09-11", accountId: "kakao", categoryId: "transport", amount: 19480, memo: "교통" },
    { id: "t-0912", type: "expense", date: "2026-09-12", accountId: "cash", categoryId: "snack", amount: 1800, memo: "간식" },
    { id: "t-0914", type: "expense", date: "2026-09-14", accountId: "woori", categoryId: "food", amount: 38500, memo: "식비" },
    { id: "t-0915", type: "expense", date: "2026-09-15", accountId: "kakao", categoryId: "life", amount: 40905, memo: "생활용품" },
    { id: "t-0916", type: "expense", date: "2026-09-16", accountId: "cash", categoryId: "snack", amount: 9950, memo: "카페" },
    { id: "t-0917", type: "expense", date: "2026-09-17", accountId: "kakao", categoryId: "etc-expense", amount: 9700, memo: "기타" },
    { id: "t-0918", type: "expense", date: "2026-09-18", accountId: "cash", categoryId: "snack", amount: 5500, memo: "간식" },
    { id: "t-0919-i", type: "income", date: "2026-09-19", accountId: "woori", categoryId: "part-time", amount: 270003, memo: "알바비" },
    { id: "t-0919-e", type: "expense", date: "2026-09-19", accountId: "woori", categoryId: "etc-expense", amount: 33100, memo: "기타" },
    { id: "t-0921", type: "expense", date: "2026-09-21", accountId: "cash", categoryId: "snack", amount: 12290, memo: "디저트" },
    { id: "t-0922", type: "expense", date: "2026-09-22", accountId: "kakao", categoryId: "food", amount: 67000, memo: "식비" },
    { id: "t-0923", type: "expense", date: "2026-09-23", accountId: "woori", categoryId: "transport", amount: 12390, memo: "교통" },
    { id: "t-0924", type: "income", date: "2026-09-24", accountId: "kakao", categoryId: "etc-income", amount: 18501, memo: "정산" },
    { id: "t-0925-i", type: "income", date: "2026-09-25", accountId: "cash", categoryId: "gift", amount: 60000, memo: "선물" },
    { id: "t-0925-e", type: "expense", date: "2026-09-25", accountId: "cash", categoryId: "transport", amount: 11300, memo: "택시" },
    { id: "t-0926", type: "income", date: "2026-09-26", accountId: "woori", categoryId: "interest", amount: 116, memo: "이자" },
    { id: "t-0801", type: "expense", date: "2026-08-01", accountId: "woori", categoryId: "food", amount: 48000, memo: "식비" },
    { id: "t-0803", type: "expense", date: "2026-08-03", accountId: "cash", categoryId: "snack", amount: 23500, memo: "카페" },
    { id: "t-0805", type: "expense", date: "2026-08-05", accountId: "kakao", categoryId: "shopping", amount: 82000, memo: "쇼핑" },
    { id: "t-0808", type: "expense", date: "2026-08-08", accountId: "woori", categoryId: "food", amount: 64000, memo: "외식" },
    { id: "t-0810", type: "income", date: "2026-08-10", accountId: "woori", categoryId: "part-time", amount: 310000, memo: "알바비" },
    { id: "t-0812", type: "expense", date: "2026-08-12", accountId: "cash", categoryId: "transport", amount: 24600, memo: "교통" },
    { id: "t-0815", type: "expense", date: "2026-08-15", accountId: "kakao", categoryId: "life", amount: 71700, memo: "생활비" },
    { id: "t-0818", type: "expense", date: "2026-08-18", accountId: "woori", categoryId: "food", amount: 93000, memo: "식비" },
    { id: "t-0821", type: "expense", date: "2026-08-21", accountId: "kakao", categoryId: "shopping", amount: 120500, memo: "쇼핑" },
    { id: "t-0824", type: "expense", date: "2026-08-24", accountId: "cash", categoryId: "snack", amount: 38600, memo: "간식" },
    { id: "t-0827", type: "expense", date: "2026-08-27", accountId: "woori", categoryId: "etc-expense", amount: 74200, memo: "기타" },
    { id: "t-0830", type: "expense", date: "2026-08-30", accountId: "kakao", categoryId: "food", amount: 53685, memo: "식비" }
  ]
};

let state = loadState();
const expandedReportCategories = new Set();
let entry = {
  id: null,
  type: "expense",
  amount: "",
  date: todayISO,
  accountId: state.accounts[0]?.id ?? "",
  categoryId: state.categories.expense[0]?.id ?? "",
  memo: ""
};

let balanceAdjustment = {
  accountId: "",
  amount: "",
  date: todayISO
};

const hiddenBalanceMessages = ["잔고 비밀 유지 중", "내 잔고는 비밀", "통장 지키는 중"];

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);
  try {
    return mergeState(structuredClone(seedState), JSON.parse(saved));
  } catch {
    return structuredClone(seedState);
  }
}

function mergeState(base, saved) {
  return {
    ...base,
    ...saved,
    categories: {
      income: saved.categories?.income?.length ? saved.categories.income : base.categories.income,
      expense: saved.categories?.expense?.length ? saved.categories.expense : base.categories.expense
    },
    accounts: saved.accounts?.length ? saved.accounts : base.accounts,
    transactions: saved.transactions?.length ? saved.transactions : base.transactions
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value, signed = false) {
  const abs = Math.abs(value).toLocaleString("ko-KR");
  if (!signed) return `${abs}원`;
  if (value > 0) return `+${abs}원`;
  if (value < 0) return `-${abs}원`;
  return "0원";
}

function compactMoney(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${sign}${Math.round(abs / 100000000)}억`;
  if (abs >= 10000) return `${sign}${Math.round(abs / 10000)}만원`;
  return `${sign}${abs.toLocaleString("ko-KR")}`;
}

function calendarMoney(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${sign}${(abs / 100000000).toFixed(1).replace(/\.0$/, "")}억`;
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1).replace(/\.0$/, "")}만`;
  return `${sign}${abs.toLocaleString("ko-KR")}`;
}

function plainCompactMoney(value) {
  return compactMoney(Math.abs(value)).replace(/^\+/, "");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function byId(id) {
  return document.getElementById(id);
}

function monthOf(date) {
  return date.slice(0, 7);
}

function previousMonth(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function transactionsForMonth(month, type = "all") {
  return state.transactions.filter((transaction) => {
    const matchesMonth = monthOf(transaction.date) === month;
    const matchesType = type === "all" || transaction.type === type;
    return matchesMonth && matchesType;
  });
}

function sumTransactions(transactions, type) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function getCategory(type, categoryId) {
  return state.categories[type].find((category) => category.id === categoryId) ?? {
    id: categoryId,
    name: "기타",
    color: "#d8dde3"
  };
}

function getAccount(accountId) {
  return state.accounts.find((account) => account.id === accountId);
}

function render() {
  renderNavigation();
  renderHome();
  renderReport();
  renderSettings();
  renderEntrySheet();
  renderBalanceSheet();
  saveState();
}

function renderNavigation() {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("is-active"));
  byId(`${state.selectedView}-view`)?.classList.add("is-active");
  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.selectedView);
  });
  document.querySelector(".floating-add")?.classList.toggle("is-hidden", state.selectedView === "home");
}

function renderHome() {
  const total = state.accounts.reduce((sum, account) => sum + account.balance, 0);
  byId("total-balance").textContent = state.hideBalance ? "억만장자 준비 중" : money(total);
  byId("hide-balance-toggle").checked = state.hideBalance;
  document.querySelector(".balance-card").classList.toggle("is-hidden-balance", state.hideBalance);

  byId("account-list").innerHTML = state.accounts
    .map((account, index) => `
      <article class="account-card${state.hideBalance ? " is-hidden-balance" : ""}">
        <header>
          <h2>${escapeHTML(account.name)}</h2>
          <span class="menu-dot">•••</span>
        </header>
        <strong class="account-balance">${state.hideBalance ? hiddenBalanceMessages[index % hiddenBalanceMessages.length] : money(account.balance, account.balance < 0)}</strong>
        <div class="divider"></div>
        <div class="account-actions">
          <button class="pill-button secondary" type="button" data-action="adjust-account" data-account-id="${account.id}">잔액 맞추기</button>
          <button class="pill-button" type="button" data-action="open-transaction" data-account-id="${account.id}">추가</button>
        </div>
      </article>
    `)
    .join("");
}

function renderReport() {
  const month = state.reportMonth;
  const allMonthTransactions = transactionsForMonth(month);
  const income = sumTransactions(allMonthTransactions, "income");
  const expense = sumTransactions(allMonthTransactions, "expense");
  const lastMonth = previousMonth(month);
  const lastIncome = sumTransactions(transactionsForMonth(lastMonth), "income");
  const lastExpense = sumTransactions(transactionsForMonth(lastMonth), "expense");
  const expenseDiff = expense - lastExpense;
  const incomeDiff = income - lastIncome;
  const isAllReport = state.reportFilter === "all";

  byId("report-month-label").textContent = month;
  byId("month-income").textContent = money(income, true);
  byId("month-expense").textContent = money(-expense, true);
  byId("month-expense-label").textContent = isAllReport ? "지출" : "이번 달 총지출";
  byId("month-income-label").textContent = isAllReport ? "수입" : "이번 달 총수입";
  byId("expense-summary").hidden = state.reportFilter === "income";
  byId("income-summary").hidden = state.reportFilter === "expense";
  byId("report-summary").classList.toggle("is-single", !isAllReport);

  if (state.reportFilter === "expense") {
    byId("month-compare-copy").innerHTML = filteredCompareCopy(expenseDiff, lastExpense, "expense");
  } else if (state.reportFilter === "income") {
    byId("month-compare-copy").innerHTML = filteredCompareCopy(incomeDiff, lastIncome, "income");
  } else {
    byId("month-compare-copy").innerHTML = compareCopy(expenseDiff, lastExpense);
  }

  document.querySelector(".calendar-panel").hidden = !isAllReport;
  byId("analysis-panel").hidden = !isAllReport;
  byId("income-analysis-panel").hidden = !isAllReport;
  byId("report-detail-panel").hidden = isAllReport;

  if (isAllReport) {
    renderCalendar(month, allMonthTransactions);
    renderCategoryAnalysis(month, "expense");
    renderCategoryAnalysis(month, "income");
  } else {
    renderDetailedReport(month, state.reportFilter);
  }

  document.querySelectorAll(".report-tabs button").forEach((button) => {
    const isActive = button.dataset.filter === state.reportFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function compareCopy(diff, lastExpense) {
  if (!lastExpense) return "지난달과 비교할 기록이 필요해요";
  if (diff === 0) return "지난달과 <em>비슷하게</em> 쓰는 중";
  if (diff < 0) return `지난달보다 <em>${plainCompactMoney(diff)}</em> 덜 쓰는 중`;
  return `지난달보다 <em>${plainCompactMoney(diff)}</em> 더 쓰는 중`;
}

function filteredCompareCopy(diff, previousTotal, type) {
  const label = type === "expense" ? "지출" : "수입";
  if (!previousTotal) return `지난달 ${label} 기록이 없어요`;
  if (diff === 0) return `지난달과 ${label} 금액이 같아요`;
  if (type === "expense") {
    return diff < 0
      ? `지난달보다 <em>${plainCompactMoney(diff)}</em> 덜 썼어요`
      : `지난달보다 <em>${plainCompactMoney(diff)}</em> 더 썼어요`;
  }
  return diff < 0
    ? `지난달보다 <em>${plainCompactMoney(diff)}</em> 수입이 줄었어요`
    : `지난달보다 <em>${plainCompactMoney(diff)}</em> 수입이 늘었어요`;
}

function renderCalendar(month, transactions) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1).getDay();
  const days = new Date(year, monthIndex, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(`<button class="calendar-day is-muted" type="button" disabled><strong></strong></button>`);
  }

  for (let day = 1; day <= days; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const dayTransactions = transactions.filter((transaction) => transaction.date === date);
    const income = sumTransactions(dayTransactions, "income");
    const expense = sumTransactions(dayTransactions, "expense");
    const todayClass = date === todayISO ? " is-today" : "";
    const disabled = dayTransactions.length ? "" : " disabled";
    const amountLabel = [
      `${day}일`,
      income ? `수입 ${money(income)}` : "",
      expense ? `지출 ${money(expense)}` : ""
    ].filter(Boolean).join(", ");
    cells.push(`
      <button class="calendar-day${todayClass}" type="button" data-action="open-day" data-date="${date}" aria-label="${amountLabel}"${disabled}>
        <strong>${day}</strong>
        <span class="calendar-income income">
          <span class="calendar-amount-full">${income ? `+${income.toLocaleString("ko-KR")}` : ""}</span>
          <span class="calendar-amount-compact" aria-hidden="true">${income ? calendarMoney(income) : ""}</span>
        </span>
        <span class="calendar-expense expense">
          <span class="calendar-amount-full">${expense ? `-${expense.toLocaleString("ko-KR")}` : ""}</span>
          <span class="calendar-amount-compact" aria-hidden="true">${expense ? calendarMoney(-expense) : ""}</span>
        </span>
      </button>
    `);
  }

  byId("calendar-grid").innerHTML = cells.join("");
}

function renderCategoryAnalysis(month, type) {
  const totals = categoryTotals(month, type);
  const total = totals.reduce((sum, item) => sum + item.amount, 0);
  const top = totals[0];
  const copyId = type === "expense" ? "top-category-copy" : "top-income-copy";
  const stackId = type === "expense" ? "expense-stack" : "income-stack";
  const listId = type === "expense" ? "expense-breakdown" : "income-breakdown";

  if (!total || !top) {
    byId(copyId).textContent = type === "expense" ? "아직 지출 기록이 없어요" : "아직 수입 기록이 없어요";
    byId(stackId).innerHTML = "";
    byId(listId).innerHTML = `<p class="empty-text">기록을 추가하면 카테고리별 비율이 보여요.</p>`;
    return;
  }

  byId(copyId).innerHTML = type === "expense"
    ? `<em>${escapeHTML(top.name)}</em>에 가장 많은 돈을 썼어요`
    : `<em>${escapeHTML(top.name)}</em> 수입이 가장 많아요`;

  byId(stackId).innerHTML = totals
    .map((item) => `<span style="width:${Math.max((item.amount / total) * 100, 2)}%; background:${item.color}"></span>`)
    .join("");

  byId(listId).innerHTML = totals
    .map((item) => {
      const percent = Math.round((item.amount / total) * 100);
      return `
        <div class="breakdown-row">
          <span class="breakdown-name"><i class="dot" style="background:${item.color}"></i>${escapeHTML(item.name)} <small>${percent}%</small></span>
          <strong>${money(item.amount)}</strong>
        </div>
      `;
    })
    .join("");
}

function categoryTotals(month, type) {
  const totals = new Map();
  transactionsForMonth(month, type).forEach((transaction) => {
    const category = getCategory(type, transaction.categoryId);
    const current = totals.get(category.id) ?? { ...category, amount: 0 };
    current.amount += transaction.amount;
    totals.set(category.id, current);
  });
  return [...totals.values()].sort((a, b) => b.amount - a.amount);
}

function renderDetailedReport(month, type) {
  const typeLabel = type === "expense" ? "지출" : "수입";
  const transactions = transactionsForMonth(month, type)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const totals = categoryTotals(month, type);

  byId("report-detail-eyebrow").textContent = `${typeLabel} 내역`;
  byId("report-detail-title").textContent = "카테고리별 상세 내역";
  byId("report-detail-count").textContent = `총 ${transactions.length}건`;

  if (!transactions.length) {
    byId("report-detail-list").innerHTML = `<p class="empty-text">이 달의 ${typeLabel} 내역이 없어요.</p>`;
    return;
  }

  byId("report-detail-list").innerHTML = totals
    .map((category) => {
      const categoryTransactions = transactions.filter((transaction) => transaction.categoryId === category.id);
      const categoryKey = `${month}:${type}:${category.id}`;
      const isExpanded = expandedReportCategories.has(categoryKey);
      const visibleTransactions = isExpanded
        ? categoryTransactions
        : categoryTransactions.slice(0, REPORT_CATEGORY_LIMIT);
      const remainingCount = categoryTransactions.length - REPORT_CATEGORY_LIMIT;

      return `
        <section class="category-history-group">
          <header class="category-history-header">
            <div class="history-category-title">
              <i class="dot" style="background:${category.color}"></i>
              <strong>${escapeHTML(category.name)}</strong>
              <span>${categoryTransactions.length}건</span>
            </div>
            <strong>${money(category.amount)}</strong>
          </header>
          <div class="category-history-list">
            ${visibleTransactions.map((transaction) => renderReportTransaction(transaction)).join("")}
          </div>
          ${remainingCount > 0 ? `
            <button class="report-more-button" type="button" data-action="toggle-category-history" data-category-key="${escapeHTML(categoryKey)}" aria-expanded="${isExpanded}">
              ${isExpanded ? "접기" : `${remainingCount}개 더 보기`}
            </button>
          ` : ""}
        </section>
      `;
    })
    .join("");
}

function renderReportTransaction(transaction) {
  const category = getCategory(transaction.type, transaction.categoryId);
  const account = getAccount(transaction.accountId);
  const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
  const [, month, day] = transaction.date.split("-");

  return `
    <div class="report-transaction">
      <time datetime="${transaction.date}">${Number(month)}.${Number(day)}</time>
      <div class="report-transaction-copy">
        <strong>${escapeHTML(transaction.memo || category.name)}</strong>
        <span>${escapeHTML(account?.name ?? "계좌")}</span>
      </div>
      <strong class="${transaction.type}">${money(signedAmount, true)}</strong>
      <button class="edit-transaction-button" type="button" data-action="edit-transaction" data-transaction-id="${escapeHTML(transaction.id)}" aria-label="${escapeHTML(category.name)} 내역 수정" title="내역 수정">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
      </button>
    </div>
  `;
}

function renderSettings() {
  byId("settings-account-list").innerHTML = state.accounts
    .map((account) => `
      <div class="item-row">
        <span>${escapeHTML(account.name)} · ${money(account.balance, account.balance < 0)}</span>
        <div class="item-actions">
          <button class="small-button danger" type="button" data-action="delete-account" data-account-id="${account.id}" aria-label="${escapeHTML(account.name)} 삭제">삭제</button>
        </div>
      </div>
    `)
    .join("");

  document.querySelectorAll("[data-category-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.categoryTab === state.categoryTab);
  });

  byId("category-list").innerHTML = state.categories[state.categoryTab]
    .map((category, index) => `
      <div class="item-row">
        <span><i class="dot" style="background:${category.color}"></i> ${escapeHTML(category.name)}</span>
        <div class="item-actions">
          <button class="small-button" type="button" data-action="move-category" data-direction="-1" data-category-id="${category.id}" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="small-button" type="button" data-action="move-category" data-direction="1" data-category-id="${category.id}" ${index === state.categories[state.categoryTab].length - 1 ? "disabled" : ""}>↓</button>
          <button class="small-button danger" type="button" data-action="delete-category" data-category-id="${category.id}">삭제</button>
        </div>
      </div>
    `)
    .join("");
}

function renderEntrySheet() {
  const isEditing = Boolean(entry.id);
  byId("entry-title").textContent = isEditing ? "내역 수정" : "추가";
  byId("save-transaction").textContent = isEditing ? "수정 완료" : "완료";
  byId("entry-date").value = entry.date;
  byId("entry-account").innerHTML = state.accounts
    .map((account) => `<option value="${account.id}" ${account.id === entry.accountId ? "selected" : ""}>${escapeHTML(account.name)}</option>`)
    .join("");
  byId("entry-memo").value = entry.memo;
  byId("entry-category-question").textContent = entry.type === "income" ? "어떤 수입인가요?" : "어떤 지출인가요?";
  document.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.entryType === entry.type);
  });
  byId("entry-category-chips").innerHTML = state.categories[entry.type]
    .map((category) => `
      <button class="category-chip${category.id === entry.categoryId ? " is-active" : ""}" style="background:${category.color}" type="button" data-action="select-entry-category" data-category-id="${category.id}">
        ${escapeHTML(category.name)}
      </button>
    `)
    .join("");
  const amountNumber = Number(entry.amount);
  const prefix = entry.type === "income" ? "+" : "-";
  byId("amount-display").textContent = amountNumber ? `${prefix} ${money(amountNumber)}` : `${prefix} 원`;
  byId("save-transaction").classList.toggle("is-ready", amountNumber > 0);
}

function renderBalanceSheet() {
  const account = getAccount(balanceAdjustment.accountId);
  if (!account) return;
  const hasAmount = balanceAdjustment.amount !== "";
  const currentBalance = Number(balanceAdjustment.amount || 0);
  const difference = currentBalance - account.balance;
  const differenceRow = document.querySelector(".balance-difference");

  byId("balance-date").value = balanceAdjustment.date;
  byId("balance-account-name").textContent = account.name;
  byId("balance-before").textContent = money(account.balance, true);
  byId("balance-current").textContent = money(currentBalance, currentBalance < 0);
  byId("balance-difference-label").textContent = !hasAmount ? "변동" : difference > 0 ? "수입" : difference < 0 ? "지출" : "변동 없음";
  byId("balance-difference-amount").textContent = !hasAmount ? "- 원" : money(difference, true);
  differenceRow.classList.toggle("is-income", hasAmount && difference > 0);
  differenceRow.classList.toggle("is-expense", hasAmount && difference < 0);
  byId("save-balance").classList.toggle("is-ready", hasAmount);
}

function openTransaction(accountId) {
  entry = {
    id: null,
    type: "expense",
    amount: "",
    date: todayISO,
    accountId: accountId ?? state.accounts[0]?.id ?? "",
    categoryId: state.categories.expense[0]?.id ?? "",
    memo: ""
  };
  byId("transaction-modal").classList.add("is-open");
  byId("transaction-modal").setAttribute("aria-hidden", "false");
  renderEntrySheet();
}

function openEditTransaction(transactionId) {
  const transaction = state.transactions.find((item) => item.id === transactionId);
  if (!transaction) return;
  entry = {
    id: transaction.id,
    type: transaction.type,
    amount: String(transaction.amount),
    date: transaction.date,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    memo: transaction.memo ?? ""
  };
  closeDay();
  byId("transaction-modal").classList.add("is-open");
  byId("transaction-modal").setAttribute("aria-hidden", "false");
  renderEntrySheet();
}

function closeTransaction() {
  byId("transaction-modal").classList.remove("is-open");
  byId("transaction-modal").setAttribute("aria-hidden", "true");
}

function saveTransaction() {
  const amount = Number(entry.amount);
  if (!amount) {
    toast("금액을 입력해 주세요.");
    return;
  }
  if (!entry.categoryId) {
    toast("카테고리를 선택해 주세요.");
    return;
  }
  const transaction = {
    id: entry.id ?? `t-${Date.now()}`,
    type: entry.type,
    date: entry.date,
    accountId: entry.accountId,
    categoryId: entry.categoryId,
    amount,
    memo: byId("entry-memo").value.trim()
  };
  const existingIndex = entry.id ? state.transactions.findIndex((item) => item.id === entry.id) : -1;
  const existingTransaction = existingIndex >= 0 ? state.transactions[existingIndex] : null;

  if (existingTransaction) {
    applyTransactionToAccount(existingTransaction, -1);
    state.transactions[existingIndex] = transaction;
  } else {
    state.transactions.push(transaction);
  }
  applyTransactionToAccount(transaction, 1);
  state.reportMonth = monthOf(entry.date);
  closeTransaction();
  toast(existingTransaction ? "내역을 수정했어요." : "기록을 추가했어요.");
  render();
}

function applyTransactionToAccount(transaction, direction) {
  const account = getAccount(transaction.accountId);
  if (!account) return;
  const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
  account.balance += signedAmount * direction;
}

function openDay(date) {
  const list = state.transactions
    .filter((transaction) => transaction.date === date)
    .sort((a, b) => a.type.localeCompare(b.type));
  byId("day-title").textContent = `${date} 내역`;
  byId("day-transactions").innerHTML = list.length
    ? list.map((transaction) => {
      const category = getCategory(transaction.type, transaction.categoryId);
      const account = getAccount(transaction.accountId);
      const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
      return `
        <div class="day-transaction">
          <div class="day-transaction-main">
            <strong>${escapeHTML(category.name)}</strong>
            <span>${escapeHTML(account?.name ?? "계좌")} · ${escapeHTML(transaction.memo || "메모 없음")}</span>
          </div>
          <div class="day-transaction-actions">
            <strong class="${transaction.type}">${money(signedAmount, true)}</strong>
            <button class="edit-transaction-button" type="button" data-action="edit-transaction" data-transaction-id="${escapeHTML(transaction.id)}" aria-label="${escapeHTML(category.name)} 내역 수정" title="내역 수정">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
          </div>
        </div>
      `;
    }).join("")
    : "<p>아직 내역이 없어요.</p>";
  byId("day-modal").classList.add("is-open");
  byId("day-modal").setAttribute("aria-hidden", "false");
}

function closeDay() {
  byId("day-modal").classList.remove("is-open");
  byId("day-modal").setAttribute("aria-hidden", "true");
}

function addAccount(event) {
  event.preventDefault();
  const nameInput = byId("account-name-input");
  const balanceInput = byId("account-balance-input");
  const name = nameInput.value.trim();
  const balance = Number(balanceInput.value || 0);
  if (!name) {
    toast("계좌 이름을 입력해 주세요.");
    return;
  }
  state.accounts.push({ id: `account-${Date.now()}`, name, balance });
  nameInput.value = "";
  balanceInput.value = "";
  toast("계좌를 추가했어요.");
  render();
}

function addCategory(event) {
  event.preventDefault();
  const input = byId("category-name-input");
  const name = input.value.trim();
  if (!name) {
    toast("카테고리 이름을 입력해 주세요.");
    return;
  }
  const list = state.categories[state.categoryTab];
  if (list.some((category) => category.name === name)) {
    toast("이미 있는 카테고리예요.");
    return;
  }
  const color = colorPalette[list.length % colorPalette.length];
  list.push({ id: `category-${Date.now()}`, name, color });
  input.value = "";
  toast("카테고리를 추가했어요.");
  render();
}

function deleteAccount(accountId) {
  if (state.accounts.length <= 1) {
    toast("계좌는 하나 이상 필요해요.");
    return;
  }
  if (state.transactions.some((transaction) => transaction.accountId === accountId)) {
    toast("내역이 있는 계좌는 삭제할 수 없어요.");
    return;
  }
  state.accounts = state.accounts.filter((account) => account.id !== accountId);
  render();
}

function deleteCategory(categoryId) {
  const type = state.categoryTab;
  if (state.categories[type].length <= 1) {
    toast("카테고리는 하나 이상 필요해요.");
    return;
  }
  if (state.transactions.some((transaction) => transaction.type === type && transaction.categoryId === categoryId)) {
    toast("내역이 있는 카테고리는 삭제할 수 없어요.");
    return;
  }
  state.categories[type] = state.categories[type].filter((category) => category.id !== categoryId);
  render();
}

function moveCategory(categoryId, direction) {
  const list = state.categories[state.categoryTab];
  const index = list.findIndex((category) => category.id === categoryId);
  const nextIndex = index + Number(direction);
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
  const [category] = list.splice(index, 1);
  list.splice(nextIndex, 0, category);
  render();
}

function openBalanceAdjustment(accountId) {
  const account = getAccount(accountId);
  if (!account) return;
  balanceAdjustment = { accountId, amount: "", date: todayISO };
  byId("balance-modal").classList.add("is-open");
  byId("balance-modal").setAttribute("aria-hidden", "false");
  renderBalanceSheet();
}

function closeBalanceAdjustment() {
  byId("balance-modal").classList.remove("is-open");
  byId("balance-modal").setAttribute("aria-hidden", "true");
}

function saveBalanceAdjustment() {
  const account = getAccount(balanceAdjustment.accountId);
  if (!account || balanceAdjustment.amount === "") {
    toast("현재 잔액을 입력해 주세요.");
    return;
  }
  const nextBalance = Number(balanceAdjustment.amount);
  const difference = nextBalance - account.balance;

  if (difference !== 0) {
    const type = difference > 0 ? "income" : "expense";
    const fallbackCategory = state.categories[type].find((category) => category.name === "기타") ?? state.categories[type][0];
    state.transactions.push({
      id: `balance-${Date.now()}`,
      type,
      date: balanceAdjustment.date,
      accountId: account.id,
      categoryId: fallbackCategory.id,
      amount: Math.abs(difference),
      memo: "잔액 맞추기"
    });
  }

  account.balance = nextBalance;
  state.reportMonth = monthOf(balanceAdjustment.date);
  closeBalanceAdjustment();
  toast("잔액을 맞췄어요.");
  render();
}

function toast(message) {
  const toastElement = byId("toast");
  toastElement.textContent = message;
  toastElement.classList.add("is-open");
  window.clearTimeout(toastElement.timer);
  toastElement.timer = window.setTimeout(() => toastElement.classList.remove("is-open"), 1800);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.view) {
    state.selectedView = button.dataset.view;
    render();
    return;
  }

  const action = button.dataset.action;
  if (!action) return;

  if (action === "open-transaction") openTransaction(button.dataset.accountId);
  if (action === "close-transaction") closeTransaction();
  if (action === "close-balance") closeBalanceAdjustment();
  if (action === "prev-month") state.reportMonth = previousMonth(state.reportMonth);
  if (action === "next-month") state.reportMonth = nextMonth(state.reportMonth);
  if (action === "open-day") openDay(button.dataset.date);
  if (action === "edit-transaction") openEditTransaction(button.dataset.transactionId);
  if (action === "toggle-category-history") {
    const categoryKey = button.dataset.categoryKey;
    if (expandedReportCategories.has(categoryKey)) expandedReportCategories.delete(categoryKey);
    else expandedReportCategories.add(categoryKey);
  }
  if (action === "close-day") closeDay();
  if (action === "open-account-manager") {
    state.selectedView = "settings";
    byId("account-manager").classList.add("is-open");
  }
  if (action === "open-add-account") {
    state.selectedView = "settings";
    byId("account-manager").classList.add("is-open");
    window.setTimeout(() => byId("account-name-input").focus(), 0);
  }
  if (action === "toggle-accounts") byId("account-manager").classList.toggle("is-open");
  if (action === "toggle-categories") byId("category-manager").classList.toggle("is-open");
  if (action === "delete-account") deleteAccount(button.dataset.accountId);
  if (action === "delete-category") deleteCategory(button.dataset.categoryId);
  if (action === "move-category") moveCategory(button.dataset.categoryId, button.dataset.direction);
  if (action === "adjust-account") openBalanceAdjustment(button.dataset.accountId);
  if (action === "select-entry-category") entry.categoryId = button.dataset.categoryId;
  if (action === "reset-demo") {
    state = structuredClone(seedState);
    toast("샘플 데이터를 다시 불러왔어요.");
  }
  render();
});

document.querySelectorAll(".report-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    state.reportFilter = button.dataset.filter;
    render();
  });
});

document.querySelectorAll("[data-category-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    state.categoryTab = button.dataset.categoryTab;
    render();
  });
});

document.querySelectorAll("[data-entry-type]").forEach((button) => {
  button.addEventListener("click", () => {
    entry.type = button.dataset.entryType;
    entry.categoryId = state.categories[entry.type][0]?.id ?? "";
    renderEntrySheet();
  });
});

byId("hide-balance-toggle").addEventListener("change", (event) => {
  state.hideBalance = event.target.checked;
  render();
});

byId("entry-date").addEventListener("change", (event) => {
  entry.date = event.target.value;
});

byId("entry-account").addEventListener("change", (event) => {
  entry.accountId = event.target.value;
});

byId("entry-memo").addEventListener("input", (event) => {
  entry.memo = event.target.value;
});

byId("balance-date").addEventListener("change", (event) => {
  balanceAdjustment.date = event.target.value;
});

byId("keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const key = button.dataset.key;
  if (key === "back") entry.amount = entry.amount.slice(0, -1);
  if (/^\d+$/.test(key)) entry.amount = `${entry.amount}${key}`.replace(/^0+(?=\d)/, "").slice(0, 9);
  renderEntrySheet();
});

byId("balance-keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const key = button.dataset.balanceKey;
  if (key === "back") balanceAdjustment.amount = balanceAdjustment.amount.slice(0, -1);
  if (/^\d+$/.test(key)) {
    balanceAdjustment.amount = `${balanceAdjustment.amount}${key}`.replace(/^0+(?=\d)/, "").slice(0, 10);
  }
  renderBalanceSheet();
});

byId("save-transaction").addEventListener("click", saveTransaction);
byId("save-balance").addEventListener("click", saveBalanceAdjustment);
byId("account-form").addEventListener("submit", addAccount);
byId("category-form").addEventListener("submit", addCategory);

byId("transaction-modal").addEventListener("click", (event) => {
  if (event.target.id === "transaction-modal") closeTransaction();
});

byId("day-modal").addEventListener("click", (event) => {
  if (event.target.id === "day-modal") closeDay();
});

byId("balance-modal").addEventListener("click", (event) => {
  if (event.target.id === "balance-modal") closeBalanceAdjustment();
});

render();
