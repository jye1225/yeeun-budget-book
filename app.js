const STORAGE_KEY = "yeeun-budget-book-state-v1";
const todayISO = "2026-09-26";

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
let entry = {
  type: "expense",
  amount: "",
  date: todayISO,
  accountId: state.accounts[0]?.id ?? "",
  categoryId: state.categories.expense[0]?.id ?? "",
  memo: ""
};

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
  byId("total-balance").textContent = state.hideBalance ? "••••••원" : money(total);
  byId("hide-balance-toggle").checked = state.hideBalance;

  byId("account-list").innerHTML = state.accounts
    .map((account) => `
      <article class="account-card">
        <header>
          <h2>${escapeHTML(account.name)}</h2>
          <span class="menu-dot">•••</span>
        </header>
        <strong class="account-balance">${state.hideBalance ? "••••••원" : money(account.balance, account.balance < 0)}</strong>
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
  const transactions = transactionsForMonth(month, state.reportFilter);
  const allMonthTransactions = transactionsForMonth(month);
  const income = sumTransactions(allMonthTransactions, "income");
  const expense = sumTransactions(allMonthTransactions, "expense");
  const lastMonth = previousMonth(month);
  const lastExpense = sumTransactions(transactionsForMonth(lastMonth), "expense");
  const diff = expense - lastExpense;

  byId("report-month-label").textContent = month;
  byId("month-income").textContent = money(income, true);
  byId("month-expense").textContent = money(-expense, true);
  byId("month-compare-copy").innerHTML = compareCopy(diff, lastExpense);
  renderSparkline(month, lastMonth);
  renderCalendar(month, transactions);
  renderCategoryAnalysis(month, "expense");
  renderCategoryAnalysis(month, "income");

  document.querySelectorAll(".report-tabs button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.reportFilter);
  });
}

function compareCopy(diff, lastExpense) {
  if (!lastExpense) return "지난달과 비교할 기록이 필요해요";
  if (diff === 0) return "지난달과 <em>비슷하게</em> 쓰는 중";
  if (diff < 0) return `지난달보다 <em>${plainCompactMoney(diff)}</em> 덜 쓰는 중`;
  return `지난달보다 <em>${plainCompactMoney(diff)}</em> 더 쓰는 중`;
}

function renderSparkline(month, lastMonth) {
  const current = cumulativeExpenses(month);
  const previous = cumulativeExpenses(lastMonth);
  const maxValue = Math.max(...current, ...previous, 1);
  const width = 180;
  const height = 92;
  const toPoints = (values) =>
    values.map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - (value / maxValue) * (height - 14) - 7;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  byId("spend-sparkline").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polyline points="${toPoints(previous)}" stroke="#d9dde2" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <polyline points="${toPoints(current)}" stroke="#3a91ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${width - 2}" cy="${height - (current.at(-1) / maxValue) * (height - 14) - 7}" r="7" fill="#3a91ff" />
    </svg>
  `;
}

function cumulativeExpenses(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const days = new Date(year, monthIndex, 0).getDate();
  const values = Array.from({ length: days }, () => 0);
  transactionsForMonth(month, "expense").forEach((transaction) => {
    const day = Number(transaction.date.slice(8, 10));
    values[day - 1] += transaction.amount;
  });
  let total = 0;
  return values.map((value) => {
    total += value;
    return total;
  });
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
    cells.push(`
      <button class="calendar-day${todayClass}" type="button" data-action="open-day" data-date="${date}"${disabled}>
        <strong>${day}</strong>
        ${income ? `<span class="income">+${income.toLocaleString("ko-KR")}</span>` : ""}
        ${expense ? `<span class="expense">-${expense.toLocaleString("ko-KR")}</span>` : ""}
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

function openTransaction(accountId) {
  entry = {
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
    id: `t-${Date.now()}`,
    type: entry.type,
    date: entry.date,
    accountId: entry.accountId,
    categoryId: entry.categoryId,
    amount,
    memo: byId("entry-memo").value.trim()
  };
  state.transactions.push(transaction);
  const account = getAccount(entry.accountId);
  if (account) account.balance += entry.type === "income" ? amount : -amount;
  state.reportMonth = monthOf(entry.date);
  closeTransaction();
  toast("기록을 추가했어요.");
  render();
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
          <div>
            <strong>${escapeHTML(category.name)}</strong>
            <span>${escapeHTML(account?.name ?? "계좌")} · ${escapeHTML(transaction.memo || "메모 없음")}</span>
          </div>
          <strong class="${transaction.type}">${money(signedAmount, true)}</strong>
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

function adjustAccount(accountId) {
  const account = getAccount(accountId);
  if (!account) return;
  const value = prompt(`${account.name}의 현재 잔액을 입력해 주세요.`, String(account.balance));
  if (value === null) return;
  const nextBalance = Number(value.replaceAll(",", ""));
  if (Number.isNaN(nextBalance)) {
    toast("숫자로 입력해 주세요.");
    return;
  }
  account.balance = nextBalance;
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
  if (action === "prev-month") state.reportMonth = previousMonth(state.reportMonth);
  if (action === "next-month") state.reportMonth = nextMonth(state.reportMonth);
  if (action === "show-analysis") byId("analysis-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  if (action === "open-day") openDay(button.dataset.date);
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
  if (action === "adjust-account") adjustAccount(button.dataset.accountId);
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

byId("keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const key = button.dataset.key;
  if (key === "back") entry.amount = entry.amount.slice(0, -1);
  if (/^\d+$/.test(key)) entry.amount = `${entry.amount}${key}`.replace(/^0+(?=\d)/, "").slice(0, 9);
  renderEntrySheet();
});

byId("save-transaction").addEventListener("click", saveTransaction);
byId("account-form").addEventListener("submit", addAccount);
byId("category-form").addEventListener("submit", addCategory);

byId("transaction-modal").addEventListener("click", (event) => {
  if (event.target.id === "transaction-modal") closeTransaction();
});

byId("day-modal").addEventListener("click", (event) => {
  if (event.target.id === "day-modal") closeDay();
});

render();
