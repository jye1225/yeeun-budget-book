const STORAGE_KEY = "yeeun-budget-book-state-v4";
const SYNC_META_KEY = "yeeun-budget-book-sync-meta-v1";
const CLIENT_ID_KEY = "yeeun-budget-book-client-id-v1";
const LEGACY_OWNER_KEY = "yeeun-budget-book-legacy-owner-v1";
const todayISO = localDateISO();
const REPORT_CATEGORY_LIMIT = 10;
const CLOUD_SAVE_DELAY = 700;
const cloudConfig = window.YEEUN_SUPABASE_CONFIG;

const colorPalette = ["#3a91ff", "#ff8b18", "#12bd82", "#d8dde3", "#8e7dff", "#ff6776", "#2bb6c4"];

const seedState = {
  hideBalance: false,
  selectedView: "home",
  reportMonth: todayISO.slice(0, 7),
  reportFilter: "all",
  categoryTab: "expense",
  accounts: [],
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
  transactions: []
};

let activeStorageKey = STORAGE_KEY;
let state = loadState(activeStorageKey);
if (["account", "transaction-detail"].includes(state.selectedView)) state.selectedView = "home";
const clientId = getClientId();
const expandedReportCategories = new Set();
let cloudClient = null;
let authUser = null;
let authProfile = null;
let authMode = "login";
let checkedUsername = "";
let pendingLegacyMigration = false;
let realtimeChannel = null;
let cloudSaveTimer = null;
let applyingCloudState = false;
let activeSyncUserId = null;
let syncStatus = {
  kind: "checking",
  title: "연결 확인 중",
  copy: "클라우드 상태를 확인하고 있어요."
};
let lastCloudPayloadJSON = JSON.stringify(buildCloudPayload());
let entry = {
  id: null,
  type: "expense",
  amount: "",
  date: todayISO,
  accountId: state.accounts[0]?.id ?? "",
  categoryId: state.categories.expense[0]?.id ?? "",
  memo: ""
};

let accountDetail = {
  accountId: "",
  month: todayISO.slice(0, 7),
  filter: "all"
};

let transactionDetail = {
  transactionId: "",
  returnView: "home"
};

let balanceAdjustment = {
  accountId: "",
  amount: "",
  date: todayISO
};

const hiddenBalanceMessages = ["잔고 비밀 유지 중", "내 잔고는 비밀", "통장 지키는 중"];

function loadState(storageKey = activeStorageKey) {
  const saved = localStorage.getItem(storageKey);
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
  localStorage.setItem(activeStorageKey, JSON.stringify(state));
  const nextCloudPayloadJSON = JSON.stringify(buildCloudPayload());
  if (!applyingCloudState && nextCloudPayloadJSON !== lastCloudPayloadJSON) {
    lastCloudPayloadJSON = nextCloudPayloadJSON;
    writeSyncMeta({
      pending: true,
      localUpdatedAt: new Date().toISOString()
    });
    scheduleCloudSave();
  }
}

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClientId() {
  const saved = localStorage.getItem(CLIENT_ID_KEY);
  if (saved) return saved;
  const id = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

function buildCloudPayload() {
  return {
    version: 1,
    hideBalance: state.hideBalance,
    accounts: state.accounts,
    categories: state.categories,
    transactions: state.transactions
  };
}

function readSyncMeta() {
  try {
    return JSON.parse(localStorage.getItem(syncMetaKey())) ?? {};
  } catch {
    return {};
  }
}

function writeSyncMeta(patch) {
  localStorage.setItem(syncMetaKey(), JSON.stringify({ ...readSyncMeta(), ...patch }));
}

function userStorageKey(userId) {
  return `${STORAGE_KEY}:${userId}`;
}

function syncMetaKey() {
  return activeSyncUserId ? `${SYNC_META_KEY}:${activeSyncUserId}` : SYNC_META_KEY;
}

function loadUserState(userId) {
  const nextStorageKey = userStorageKey(userId);
  const hasUserState = Boolean(localStorage.getItem(nextStorageKey));
  const legacyOwner = localStorage.getItem(LEGACY_OWNER_KEY);
  const canClaimLegacy = !hasUserState && (!legacyOwner || legacyOwner === userId);

  activeStorageKey = nextStorageKey;
  if (hasUserState) {
    state = loadState(nextStorageKey);
  } else if (canClaimLegacy && localStorage.getItem(STORAGE_KEY)) {
    state = loadState(STORAGE_KEY);
    localStorage.setItem(LEGACY_OWNER_KEY, userId);
    localStorage.setItem(nextStorageKey, JSON.stringify(state));
  } else {
    state = structuredClone(seedState);
  }

  if (["account", "transaction-detail"].includes(state.selectedView)) state.selectedView = "home";
  lastCloudPayloadJSON = JSON.stringify(buildCloudPayload());
  entry = {
    id: null,
    type: "expense",
    amount: "",
    date: todayISO,
    accountId: state.accounts[0]?.id ?? "",
    categoryId: state.categories.expense[0]?.id ?? "",
    memo: ""
  };
  accountDetail = {
    accountId: "",
    month: state.reportMonth || todayISO.slice(0, 7),
    filter: "all"
  };
  transactionDetail = {
    transactionId: "",
    returnView: "home"
  };
}

function setSyncStatus(kind, title, copy) {
  syncStatus = { kind, title, copy };
  renderCloudSettings();
}

function formatSyncTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
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

function transactionsForMonth(month, type = "all", { includeExcluded = false } = {}) {
  return state.transactions.filter((transaction) => {
    const matchesMonth = monthOf(transaction.date) === month;
    const matchesType = type === "all" || transaction.type === type;
    const matchesInclusion = includeExcluded || !transaction.excludedFromTotals;
    return matchesMonth && matchesType && matchesInclusion;
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
  renderAccountDetail();
  renderTransactionDetail();
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
    let activeView = state.selectedView;
    if (activeView === "account") activeView = "home";
    if (activeView === "transaction-detail") {
      activeView = transactionDetail.returnView === "report" ? "report" : "home";
    }
    button.classList.toggle("is-active", button.dataset.view === activeView);
  });
  document.querySelector(".floating-add")?.classList.toggle(
    "is-hidden",
    ["home", "transaction-detail"].includes(state.selectedView) || !state.accounts.length
  );
}

function renderHome() {
  const total = state.accounts.reduce((sum, account) => sum + account.balance, 0);
  byId("total-balance").textContent = state.hideBalance ? "억만장자 준비 중" : money(total);
  byId("hide-balance-toggle").checked = state.hideBalance;
  document.querySelector(".balance-card").classList.toggle("is-hidden-balance", state.hideBalance);

  byId("account-list").innerHTML = state.accounts.length
    ? state.accounts.map((account, index) => `
      <article class="account-card${state.hideBalance ? " is-hidden-balance" : ""}">
        <button class="account-summary-button" type="button" data-action="open-account-detail" data-account-id="${account.id}" aria-label="${escapeHTML(account.name)} 상세 내역 보기">
          <span class="account-card-heading">
            <h2>${escapeHTML(account.name)}</h2>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </span>
          <strong class="account-balance">${state.hideBalance ? hiddenBalanceMessages[index % hiddenBalanceMessages.length] : money(account.balance, account.balance < 0)}</strong>
        </button>
        <div class="divider"></div>
        <div class="account-actions">
          <button class="pill-button secondary" type="button" data-action="adjust-account" data-account-id="${account.id}">잔액 맞추기</button>
          <button class="pill-button" type="button" data-action="open-transaction" data-account-id="${account.id}">추가</button>
        </div>
      </article>
    `).join("")
    : `
      <div class="account-empty-state">
        <strong>등록된 계좌가 없어요</strong>
        <span>첫 계좌를 추가하고 가계부를 시작해 보세요.</span>
      </div>
    `;
}

function renderAccountDetail() {
  const account = getAccount(accountDetail.accountId);
  if (!account) {
    byId("account-detail-title").textContent = "계좌";
    byId("account-detail-balance").textContent = "0원";
    byId("account-month-income").textContent = "+0원";
    byId("account-month-expense").textContent = "-0원";
    byId("account-transaction-count").textContent = "총 0건";
    byId("account-history-list").innerHTML = `<p class="empty-text">계좌를 선택하면 내역이 보여요.</p>`;
    return;
  }

  const monthTransactions = state.transactions
    .filter((transaction) => transaction.accountId === account.id && monthOf(transaction.date) === accountDetail.month)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const visibleTransactions = accountDetail.filter === "all"
    ? monthTransactions
    : monthTransactions.filter((transaction) => transaction.type === accountDetail.filter);
  const includedMonthTransactions = monthTransactions.filter((transaction) => !transaction.excludedFromTotals);
  const income = sumTransactions(includedMonthTransactions, "income");
  const expense = sumTransactions(includedMonthTransactions, "expense");

  byId("account-month-label").textContent = accountDetail.month;
  byId("account-detail-title").textContent = account.name;
  byId("account-detail-balance").textContent = state.hideBalance ? "잔액 숨김" : money(account.balance, account.balance < 0);
  byId("account-month-income").textContent = money(income, true);
  byId("account-month-expense").textContent = money(-expense, true);
  byId("account-transaction-count").textContent = `총 ${visibleTransactions.length}건`;

  document.querySelectorAll("[data-account-filter]").forEach((button) => {
    const isActive = button.dataset.accountFilter === accountDetail.filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  byId("account-history-list").innerHTML = visibleTransactions.length
    ? visibleTransactions.map((transaction) => renderAccountTransaction(transaction)).join("")
    : `<p class="empty-text">이 달의 ${accountDetail.filter === "all" ? "거래" : accountDetail.filter === "income" ? "수입" : "지출"} 내역이 없어요.</p>`;
}

function renderAccountTransaction(transaction) {
  const category = getCategory(transaction.type, transaction.categoryId);
  const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
  const dateLabel = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(`${transaction.date}T00:00:00`));
  return `
    <button class="account-transaction-row" type="button" data-action="open-transaction-detail" data-transaction-id="${escapeHTML(transaction.id)}">
      <i class="category-mark" style="background:${category.color}" aria-hidden="true"></i>
      <span class="account-transaction-copy">
        <strong>${escapeHTML(transaction.memo || category.name)}</strong>
        <span>${dateLabel} · ${escapeHTML(category.name)}${transaction.excludedFromTotals ? " · 합계 제외" : ""}</span>
      </span>
      <strong class="account-transaction-amount ${transaction.type}">${money(signedAmount, true)}</strong>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    </button>
  `;
}

function openAccountDetail(accountId) {
  if (!getAccount(accountId)) return;
  accountDetail.accountId = accountId;
  accountDetail.month = todayISO.slice(0, 7);
  accountDetail.filter = "all";
  state.selectedView = "account";
  render();
}

function openTransactionDetail(transactionId) {
  if (!state.transactions.some((transaction) => transaction.id === transactionId)) return;
  transactionDetail = {
    transactionId,
    returnView: state.selectedView === "transaction-detail" ? transactionDetail.returnView : state.selectedView
  };
  closeDay();
  state.selectedView = "transaction-detail";
}

function closeTransactionDetail() {
  state.selectedView = transactionDetail.returnView || "home";
}

function renderTransactionDetail() {
  const transaction = state.transactions.find((item) => item.id === transactionDetail.transactionId);
  if (!transaction) return;

  const category = getCategory(transaction.type, transaction.categoryId);
  const account = getAccount(transaction.accountId);
  const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
  const typeLabel = transaction.type === "income" ? "수입" : "지출";
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${transaction.date}T00:00:00`));

  byId("transaction-detail-type").textContent = typeLabel;
  byId("transaction-detail-amount").textContent = money(signedAmount, true);
  byId("transaction-detail-amount").className = transaction.type;
  byId("transaction-detail-mark").style.background = category.color;
  byId("transaction-detail-category").textContent = category.name;
  byId("transaction-detail-memo").textContent = transaction.memo || "메모 없음";
  byId("transaction-detail-account").textContent = account?.name ?? "삭제된 계좌";
  byId("transaction-detail-date").textContent = dateLabel;
  byId("transaction-total-toggle-label").textContent = `${typeLabel} 합계에 포함`;
  byId("transaction-total-toggle").checked = !transaction.excludedFromTotals;
  byId("transaction-detail-excluded").hidden = !transaction.excludedFromTotals;
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
    const hasRecordedTransactions = state.transactions.some((transaction) => transaction.date === date);
    const income = sumTransactions(dayTransactions, "income");
    const expense = sumTransactions(dayTransactions, "expense");
    const todayClass = date === todayISO ? " is-today" : "";
    const disabled = hasRecordedTransactions ? "" : " disabled";
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
  const transactions = transactionsForMonth(month, type, { includeExcluded: true })
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const categoryGroups = new Map();
  transactions.forEach((transaction) => {
    const category = getCategory(type, transaction.categoryId);
    const group = categoryGroups.get(category.id) ?? { ...category, amount: 0, transactions: [] };
    group.transactions.push(transaction);
    if (!transaction.excludedFromTotals) group.amount += transaction.amount;
    categoryGroups.set(category.id, group);
  });
  const groups = [...categoryGroups.values()].sort((a, b) => b.amount - a.amount);

  byId("report-detail-eyebrow").textContent = `${typeLabel} 내역`;
  byId("report-detail-title").textContent = "카테고리별 상세 내역";
  byId("report-detail-count").textContent = `총 ${transactions.length}건`;

  if (!transactions.length) {
    byId("report-detail-list").innerHTML = `<p class="empty-text">이 달의 ${typeLabel} 내역이 없어요.</p>`;
    return;
  }

  byId("report-detail-list").innerHTML = groups
    .map((category) => {
      const categoryTransactions = category.transactions;
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
      <button class="report-transaction-copy" type="button" data-action="open-transaction-detail" data-transaction-id="${escapeHTML(transaction.id)}">
        <strong>${escapeHTML(transaction.memo || category.name)}</strong>
        <span>${escapeHTML(account?.name ?? "계좌")}${transaction.excludedFromTotals ? " · 합계 제외" : ""}</span>
      </button>
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

  renderCloudSettings();
}

function renderCloudSettings() {
  if (!byId("cloud-account")) return;
  const username = authProfile?.username ?? authUser?.user_metadata?.username ?? "";
  const displayName = authProfile?.display_name ?? authUser?.user_metadata?.display_name ?? username ?? "사용자";
  byId("cloud-account-name").textContent = displayName || "사용자";
  byId("cloud-account-username").textContent = username ? `@${username}` : "";
  byId("sync-status-title").textContent = syncStatus.title;
  byId("sync-status-copy").textContent = syncStatus.copy;
  byId("sync-status-dot").className = `sync-status-dot is-${syncStatus.kind}`;

  const lastSyncedAt = readSyncMeta().lastSyncedAt;
  byId("cloud-backup-copy").textContent = lastSyncedAt
    ? `${formatSyncTime(lastSyncedAt)} 동기화 · 오늘 자동 백업 완료`
    : "변경할 때마다 동기화하고 하루 한 번 자동 백업해요.";
}

function renderEntrySheet() {
  const isEditing = Boolean(entry.id);
  byId("entry-title").textContent = isEditing ? "내역 수정" : "추가";
  byId("save-transaction").textContent = isEditing ? "수정 완료" : "완료";
  byId("delete-transaction").hidden = !isEditing;
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
  if (!state.accounts.length) {
    state.selectedView = "settings";
    byId("account-manager").classList.add("is-open");
    toast("먼저 계좌를 추가해 주세요.");
    render();
    return;
  }
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
  if (!getAccount(entry.accountId)) {
    toast("계좌를 선택해 주세요.");
    return;
  }
  if (!amount) {
    toast("금액을 입력해 주세요.");
    return;
  }
  if (!entry.categoryId) {
    toast("카테고리를 선택해 주세요.");
    return;
  }
  const existingIndex = entry.id ? state.transactions.findIndex((item) => item.id === entry.id) : -1;
  const existingTransaction = existingIndex >= 0 ? state.transactions[existingIndex] : null;
  const transaction = {
    id: entry.id ?? `t-${Date.now()}`,
    type: entry.type,
    date: entry.date,
    accountId: entry.accountId,
    categoryId: entry.categoryId,
    amount,
    memo: byId("entry-memo").value.trim(),
    excludedFromTotals: existingTransaction?.excludedFromTotals ?? false
  };

  if (existingTransaction) {
    applyTransactionToAccount(existingTransaction, -1);
    state.transactions[existingIndex] = transaction;
  } else {
    state.transactions.push(transaction);
  }
  applyTransactionToAccount(transaction, 1);
  const transactionMonth = monthOf(transaction.date);
  state.reportMonth = transactionMonth;
  if (state.selectedView === "account") {
    accountDetail.accountId = transaction.accountId;
    accountDetail.month = transactionMonth;
    accountDetail.filter = "all";
  }
  closeTransaction();
  toast(existingTransaction ? "내역을 수정했어요." : "기록을 추가했어요.");
  render();
}

function deleteTransaction() {
  const transaction = entry.id
    ? state.transactions.find((item) => item.id === entry.id)
    : null;
  if (!transaction) return;

  if (!window.confirm("이 내역을 삭제할까요?")) return;
  applyTransactionToAccount(transaction, -1);
  state.transactions = state.transactions.filter((item) => item.id !== transaction.id);
  state.reportMonth = monthOf(transaction.date);
  if (state.selectedView === "transaction-detail") {
    state.selectedView = transactionDetail.returnView || "home";
    transactionDetail.transactionId = "";
  } else if (state.selectedView === "account") {
    accountDetail.accountId = transaction.accountId;
    accountDetail.month = state.reportMonth;
  }
  closeTransaction();
  toast("내역을 삭제했어요.");
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
          <button class="day-transaction-main" type="button" data-action="open-transaction-detail" data-transaction-id="${escapeHTML(transaction.id)}">
            <strong>${escapeHTML(category.name)}</strong>
            <span>${escapeHTML(account?.name ?? "계좌")} · ${escapeHTML(transaction.memo || "메모 없음")}${transaction.excludedFromTotals ? " · 합계 제외" : ""}</span>
          </button>
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

function applyCloudPayload(payload, updatedAt) {
  if (!payload || !Array.isArray(payload.accounts) || !Array.isArray(payload.transactions)) return;
  const localUIState = {
    selectedView: state.selectedView,
    reportMonth: state.reportMonth,
    reportFilter: state.reportFilter,
    categoryTab: state.categoryTab
  };

  applyingCloudState = true;
  try {
    state = mergeState(structuredClone(seedState), { ...payload, ...localUIState });
    lastCloudPayloadJSON = JSON.stringify(buildCloudPayload());
    writeSyncMeta({
      pending: false,
      lastSyncedAt: updatedAt ?? new Date().toISOString()
    });
    render();
  } finally {
    applyingCloudState = false;
  }
}

function scheduleCloudSave() {
  if (!authUser || !cloudClient) return;
  if (!navigator.onLine) {
    setSyncStatus("offline", "오프라인 상태", "연결되면 변경사항을 자동으로 올려요.");
    return;
  }
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => saveCloudState(), CLOUD_SAVE_DELAY);
}

async function saveCloudState(force = false) {
  if (!authUser || !cloudClient) return;
  if (!navigator.onLine) {
    setSyncStatus("offline", "오프라인 상태", "연결되면 변경사항을 자동으로 올려요.");
    return;
  }
  if (!force && !readSyncMeta().pending) return;

  setSyncStatus("syncing", "동기화 중", "변경사항을 안전하게 저장하고 있어요.");
  const payload = buildCloudPayload();
  const updatedAt = new Date().toISOString();
  const { error } = await cloudClient.from("budget_books").upsert({
    user_id: authUser.id,
    data: payload,
    updated_at: updatedAt,
    updated_by: clientId
  }, { onConflict: "user_id" });

  if (error) {
    handleCloudError(error);
    return;
  }

  const { error: backupError } = await cloudClient.from("budget_book_backups").upsert({
    user_id: authUser.id,
    backup_date: localDateISO(),
    data: payload,
    updated_at: updatedAt
  }, { onConflict: "user_id,backup_date" });

  if (backupError) {
    handleCloudError(backupError);
    return;
  }

  lastCloudPayloadJSON = JSON.stringify(payload);
  writeSyncMeta({ pending: false, lastSyncedAt: updatedAt });
  setSyncStatus("synced", "동기화 완료", `${formatSyncTime(updatedAt)} · 오늘 자동 백업 완료`);
}

async function syncFromCloud() {
  if (!authUser || !cloudClient) return;
  if (!navigator.onLine) {
    setSyncStatus("offline", "오프라인 상태", "연결되면 변경사항을 자동으로 올려요.");
    return;
  }

  setSyncStatus("syncing", "동기화 중", "클라우드의 최신 기록을 확인하고 있어요.");
  const { data, error } = await cloudClient
    .from("budget_books")
    .select("data, updated_at, updated_by")
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (error) {
    handleCloudError(error);
    return;
  }

  if (!data || readSyncMeta().pending) {
    await saveCloudState(true);
    return;
  }

  applyCloudPayload(data.data, data.updated_at);
  setSyncStatus("synced", "동기화 완료", `${formatSyncTime(data.updated_at)} · 모든 기기가 같은 상태예요.`);
}

function handleCloudError(error) {
  const needsSchema = error?.code === "42P01" || String(error?.message).includes("schema cache");
  setSyncStatus(
    "error",
    needsSchema ? "데이터베이스 설정 필요" : "동기화 실패",
    needsSchema ? "Supabase 테이블을 만든 뒤 다시 시도해 주세요." : "잠시 후 다시 동기화해 주세요."
  );
  console.error("Cloud sync error", error);
}

function subscribeToCloudChanges() {
  if (!cloudClient || !authUser) return;
  if (realtimeChannel) cloudClient.removeChannel(realtimeChannel);
  realtimeChannel = cloudClient
    .channel(`budget-book-${authUser.id}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "budget_books",
      filter: `user_id=eq.${authUser.id}`
    }, (change) => {
      if (!change.new?.data || change.new.updated_by === clientId) return;
      if (readSyncMeta().pending) {
        scheduleCloudSave();
        return;
      }
      applyCloudPayload(change.new.data, change.new.updated_at);
      setSyncStatus("synced", "다른 기기와 동기화됨", `${formatSyncTime(change.new.updated_at)} 최신 기록을 받았어요.`);
    })
    .subscribe();
}

async function handleCloudSession(session) {
  if (!session?.user) {
    const migratedFromEmailLogin = pendingLegacyMigration;
    pendingLegacyMigration = false;
    authUser = null;
    authProfile = null;
    activeSyncUserId = null;
    activeStorageKey = STORAGE_KEY;
    if (realtimeChannel && cloudClient) cloudClient.removeChannel(realtimeChannel);
    realtimeChannel = null;
    setSyncStatus("idle", "로그인 필요", "로그인하면 여러 기기에서 같은 가계부를 볼 수 있어요.");
    showAuthScreen();
    if (migratedFromEmailLogin) {
      setAuthMode("signup");
      setAuthMessage("새 아이디를 만들면 기존 가계부가 그대로 연결돼요.", "success");
    }
    return;
  }

  const sessionUsername = session.user.user_metadata?.username;
  const isUsernameAccount = sessionUsername
    && session.user.email === usernameToAuthEmail(sessionUsername);
  if (!isUsernameAccount) {
    await prepareLegacyLoginMigration(session.user);
    return;
  }

  authUser = session.user;
  if (activeSyncUserId === authUser.id) {
    showAppScreen();
    return;
  }
  activeSyncUserId = authUser.id;
  loadUserState(authUser.id);
  await ensureProfile();
  await syncFromCloud();
  subscribeToCloudChanges();
  render();
  showAppScreen();
}

async function prepareLegacyLoginMigration(user) {
  let migrationState = state;
  const { data, error } = await cloudClient
    .from("budget_books")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && data?.data) {
    migrationState = mergeState(structuredClone(seedState), {
      ...data.data,
      selectedView: "home",
      reportMonth: state.reportMonth,
      reportFilter: state.reportFilter,
      categoryTab: state.categoryTab
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(migrationState));
  localStorage.removeItem(LEGACY_OWNER_KEY);
  activeStorageKey = STORAGE_KEY;
  activeSyncUserId = null;
  pendingLegacyMigration = true;
  await cloudClient.auth.signOut({ scope: "local" });
  await handleCloudSession(null);
}

async function initializeCloudSync() {
  if (!cloudConfig?.url || !cloudConfig?.publishableKey || !window.supabase?.createClient) {
    setSyncStatus("error", "클라우드 연결 불가", "인터넷 연결을 확인한 뒤 앱을 다시 열어 주세요.");
    return;
  }

  try {
    cloudClient = window.supabase.createClient(cloudConfig.url, cloudConfig.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    const { data, error } = await cloudClient.auth.getSession();
    if (error) throw error;
    await handleCloudSession(data.session);
    cloudClient.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => handleCloudSession(session), 0);
    });
  } catch (error) {
    handleCloudError(error);
    showAuthScreen("클라우드에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function usernameToAuthEmail(username) {
  return `${normalizeUsername(username)}@yeeun-budget-user.example.com`;
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function setAuthMessage(message, kind = "") {
  const element = byId("auth-error");
  element.textContent = message;
  element.classList.toggle("is-success", kind === "success");
}

function setPasswordMessage(message, kind = "") {
  const element = byId("auth-password-message");
  element.textContent = message;
  element.classList.toggle("is-success", kind === "success");
}

function setAuthMode(mode) {
  authMode = mode;
  checkedUsername = "";
  const isSignup = mode === "signup";
  document.body.classList.toggle("is-signup", isSignup);
  document.querySelectorAll(".signup-only").forEach((element) => {
    element.hidden = !isSignup;
  });
  document.querySelectorAll(".login-only").forEach((element) => {
    element.hidden = isSignup;
  });
  byId("auth-display-name").required = isSignup;
  byId("auth-password-confirm").required = isSignup;
  byId("auth-password").autocomplete = isSignup ? "new-password" : "current-password";
  byId("auth-title").textContent = isSignup ? "회원가입" : "로그인";
  byId("auth-copy").textContent = isSignup ? "아이디와 비밀번호로 새 가계부를 만들어요." : "내 가계부를 이어서 기록해요.";
  byId("auth-submit").textContent = isSignup ? "회원가입" : "로그인";
  setAuthMessage("");
  setPasswordMessage("");
}

function showAuthScreen(message = "") {
  document.body.classList.remove("is-auth-loading", "is-authenticated");
  setAuthMode("login");
  setAuthMessage(message);
  byId("auth-password").value = "";
  byId("auth-password-confirm").value = "";
}

function showAppScreen() {
  document.body.classList.remove("is-auth-loading", "is-signup");
  document.body.classList.add("is-authenticated");
}

function authErrorMessage(error, fallback) {
  const message = error?.message ?? "";
  if (message.includes("Failed to fetch") || message.includes("fetch")) {
    return "서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.";
  }
  return fallback || message || "잠시 후 다시 시도해 주세요.";
}

async function ensureProfile() {
  if (!cloudClient || !authUser) return;
  const { data, error } = await cloudClient
    .from("profiles")
    .select("username, display_name, created_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) {
    console.error("Profile load error", error);
    authProfile = null;
    return;
  }

  if (data) {
    authProfile = data;
    return;
  }

  const username = authUser.user_metadata?.username;
  if (!username) return;
  const displayName = authUser.user_metadata?.display_name || username;
  const { error: saveError } = await cloudClient.from("profiles").upsert({
    id: authUser.id,
    username,
    auth_email: authUser.email,
    display_name: displayName,
    updated_at: new Date().toISOString()
  });
  if (!saveError) authProfile = { username, display_name: displayName };
}

async function checkUsernameAvailability() {
  if (!cloudClient) return false;
  const username = normalizeUsername(byId("auth-username").value);
  checkedUsername = "";
  if (!isValidUsername(username)) {
    setAuthMessage("아이디는 영문 소문자, 숫자, 밑줄 3~20자로 입력해 주세요.");
    return false;
  }

  const { data, error } = await cloudClient.rpc("is_username_available", { requested_username: username });
  if (error) {
    setAuthMessage(authErrorMessage(error, "아이디를 확인하지 못했어요."));
    return false;
  }
  if (!data) {
    setAuthMessage("이미 사용 중인 아이디예요.");
    return false;
  }
  checkedUsername = username;
  setAuthMessage("사용 가능한 아이디예요.", "success");
  return true;
}

function checkPasswordMatch() {
  const password = byId("auth-password").value;
  const confirmation = byId("auth-password-confirm").value;
  if (password.length < 6) {
    setPasswordMessage("비밀번호는 6자 이상 입력해 주세요.");
    return false;
  }
  if (password !== confirmation) {
    setPasswordMessage("비밀번호가 일치하지 않아요.");
    return false;
  }
  setPasswordMessage("비밀번호가 일치해요.", "success");
  return true;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!cloudClient) {
    setAuthMessage("클라우드 연결을 확인해 주세요.");
    return;
  }

  const username = normalizeUsername(byId("auth-username").value);
  const password = byId("auth-password").value;
  const submitButton = byId("auth-submit");
  submitButton.disabled = true;
  setAuthMessage(authMode === "signup" ? "계정을 만들고 있어요." : "로그인하고 있어요.");

  try {
    if (authMode === "login") {
      const { data, error } = await cloudClient.auth.signInWithPassword({
        email: usernameToAuthEmail(username),
        password
      });
      if (error) {
        setAuthMessage("아이디 또는 비밀번호가 올바르지 않아요.");
        return;
      }
      await handleCloudSession(data.session);
      return;
    }

    const displayName = byId("auth-display-name").value.trim();
    if (!isValidUsername(username)) {
      setAuthMessage("아이디는 영문 소문자, 숫자, 밑줄 3~20자로 입력해 주세요.");
      return;
    }
    if (checkedUsername !== username) {
      setAuthMessage("아이디 중복확인을 먼저 해주세요.");
      return;
    }
    if (!displayName) {
      setAuthMessage("이름을 입력해 주세요.");
      return;
    }
    if (!checkPasswordMatch()) return;

    const { data, error } = await cloudClient.auth.signUp({
      email: usernameToAuthEmail(username),
      password,
      options: { data: { username, display_name: displayName } }
    });
    if (error) {
      setAuthMessage(error.message.includes("already registered") ? "이미 사용 중인 아이디예요." : authErrorMessage(error));
      return;
    }
    if (!data.session) {
      showAuthScreen("회원가입은 완료됐지만 로그인이 필요해요. 같은 정보로 로그인해 주세요.");
      return;
    }
    await handleCloudSession(data.session);
  } catch (error) {
    setAuthMessage(authErrorMessage(error));
  } finally {
    submitButton.disabled = false;
  }
}

async function signOutCloud() {
  if (!cloudClient) return;
  await cloudClient.auth.signOut();
  showAuthScreen("로그아웃했어요.");
}

function exportBackup() {
  const backup = {
    app: "yeeun-budget-book",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: buildCloudPayload()
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `yeeun-budget-${localDateISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast("백업 파일을 만들었어요.");
}

async function importBackup(event) {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const payload = parsed.data ?? parsed;
    if (!Array.isArray(payload.accounts) || !Array.isArray(payload.transactions) || !payload.categories) {
      throw new Error("Invalid backup");
    }
    if (!window.confirm("현재 가계부를 백업 파일 내용으로 바꿀까요?")) return;
    const localUIState = {
      selectedView: state.selectedView,
      reportMonth: state.reportMonth,
      reportFilter: state.reportFilter,
      categoryTab: state.categoryTab
    };
    state = mergeState(structuredClone(seedState), { ...payload, ...localUIState });
    render();
    toast("백업을 복원했어요.");
  } catch {
    toast("올바른 가계부 백업 파일이 아니에요.");
  }
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

  if (action === "open-account-detail") openAccountDetail(button.dataset.accountId);
  if (action === "close-account-detail") state.selectedView = "home";
  if (action === "open-transaction-detail") openTransactionDetail(button.dataset.transactionId);
  if (action === "close-transaction-detail") closeTransactionDetail();
  if (action === "edit-detail-transaction") openEditTransaction(transactionDetail.transactionId);
  if (action === "prev-account-month") accountDetail.month = previousMonth(accountDetail.month);
  if (action === "next-account-month") accountDetail.month = nextMonth(accountDetail.month);
  if (action === "open-account-transaction") openTransaction(accountDetail.accountId);
  if (action === "open-account-report") {
    state.reportMonth = accountDetail.month;
    state.reportFilter = accountDetail.filter;
    state.selectedView = "report";
  }
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
  if (action === "toggle-cloud-sync") byId("cloud-sync-manager").classList.toggle("is-open");
  if (action === "delete-account") deleteAccount(button.dataset.accountId);
  if (action === "delete-category") deleteCategory(button.dataset.categoryId);
  if (action === "move-category") moveCategory(button.dataset.categoryId, button.dataset.direction);
  if (action === "adjust-account") openBalanceAdjustment(button.dataset.accountId);
  if (action === "select-entry-category") entry.categoryId = button.dataset.categoryId;
  if (action === "sync-now") syncFromCloud();
  if (action === "cloud-sign-out") signOutCloud();
  if (action === "export-backup") exportBackup();
  if (action === "choose-backup-file") byId("backup-file-input").click();
  render();
});

document.querySelectorAll(".report-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    state.reportFilter = button.dataset.filter;
    render();
  });
});

document.querySelectorAll("[data-account-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    accountDetail.filter = button.dataset.accountFilter;
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

byId("transaction-total-toggle").addEventListener("change", (event) => {
  const transaction = state.transactions.find((item) => item.id === transactionDetail.transactionId);
  if (!transaction) return;
  transaction.excludedFromTotals = !event.target.checked;
  toast(event.target.checked ? "합계에 포함했어요." : "합계에서 제외했어요.");
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
byId("delete-transaction").addEventListener("click", deleteTransaction);
document.querySelector('[data-action="close-transaction"]').addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeTransaction();
});
byId("save-balance").addEventListener("click", saveBalanceAdjustment);
byId("account-form").addEventListener("submit", addAccount);
byId("category-form").addEventListener("submit", addCategory);
byId("auth-form").addEventListener("submit", handleAuthSubmit);
byId("show-signup-button").addEventListener("click", () => setAuthMode("signup"));
byId("show-login-button").addEventListener("click", () => setAuthMode("login"));
byId("check-username-button").addEventListener("click", checkUsernameAvailability);
byId("check-password-button").addEventListener("click", checkPasswordMatch);
byId("auth-username").addEventListener("input", () => {
  checkedUsername = "";
  setAuthMessage("");
});
byId("auth-password").addEventListener("input", () => setPasswordMessage(""));
byId("auth-password-confirm").addEventListener("input", () => setPasswordMessage(""));
byId("backup-file-input").addEventListener("change", importBackup);

window.addEventListener("online", () => syncFromCloud());
window.addEventListener("offline", () => {
  if (authUser) setSyncStatus("offline", "오프라인 상태", "연결되면 변경사항을 자동으로 올려요.");
});

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
initializeCloudSync();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => document.documentElement.setAttribute("data-pwa-ready", "true"))
      .catch(() => document.documentElement.setAttribute("data-pwa-ready", "false"));
  });
}
