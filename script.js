const tapSound = new Audio("sounds/tap.mp3");
tapSound.preload = "auto";

function playTapSound() {
  tapSound.currentTime = 0;
  tapSound.play().catch(() => {});
}

let data = {
  classic: { count: Number(localStorage.getItem("classicCount")) || 0, price: 6 },
  flavor: { count: Number(localStorage.getItem("flavorCount")) || 0, price: 7 },
  speciality: { count: Number(localStorage.getItem("specialityCount")) || 0, price: 8 },
  redbull: { count: Number(localStorage.getItem("redbullCount")) || 0, price: 9 },
  classic64: { count: Number(localStorage.getItem("classic64Count")) || 0, price: 10 },
  speciality64: { count: Number(localStorage.getItem("speciality64Count")) || 0, price: 15 }
};

let history = JSON.parse(localStorage.getItem("lemonadeSalesHistory")) || [];

const ids = ["classic", "flavor", "speciality", "redbull", "classic64", "speciality64"];

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function getTodayLabel() {
  return new Date().toLocaleDateString();
}

function saveCurrentData() {
  ids.forEach((id) => {
    localStorage.setItem(`${id}Count`, data[id].count);
  });
  localStorage.setItem("lemonadeSalesHistory", JSON.stringify(history));
}

function getGrandTotal() {
  return ids.reduce((sum, id) => sum + data[id].count * data[id].price, 0);
}

function getTotalItems() {
  return ids.reduce((sum, id) => sum + data[id].count, 0);
}

function updateScreen() {
  ids.forEach((id) => {
    document.getElementById(`${id}Count`).textContent = data[id].count;
  });

  document.getElementById("grandTotal").textContent = formatMoney(getGrandTotal());
  document.getElementById("totalItems").textContent = getTotalItems();
  document.getElementById("todayDate").textContent = getTodayLabel();
}

function renderHistory() {
  const historyListEl = document.getElementById("historyList");

  if (history.length === 0) {
    historyListEl.innerHTML = "<p>No saved days yet.</p>";
    return;
  }

  historyListEl.innerHTML = "";

  const newestFirst = [...history].reverse();

  newestFirst.forEach((day) => {
    const entry = document.createElement("div");
    entry.className = "history-entry";

    entry.innerHTML = `
      <h3>${day.date}</h3>
      <p>Classic Lemonade: ${day.classicCount} (${formatMoney(day.classicSales)})</p>
      <p>Flavor Lemonade: ${day.flavorCount} (${formatMoney(day.flavorSales)})</p>
      <p>Speciality Lemonade: ${day.specialityCount} (${formatMoney(day.specialitySales)})</p>
      <p>Red Bull Lemonade: ${day.redbullCount} (${formatMoney(day.redbullSales)})</p>
      <p>64oz Classic: ${day.classic64Count} (${formatMoney(day.classic64Sales)})</p>
      <p>64oz Speciality: ${day.speciality64Count} (${formatMoney(day.speciality64Sales)})</p>
      <p><strong>Total Drinks:</strong> ${day.totalItems}</p>
      <p><strong>Total Sales:</strong> ${formatMoney(day.grandTotal)}</p>
    `;

    historyListEl.appendChild(entry);
  });
}

function changeCount(item, amount) {
  data[item].count += amount;

  if (data[item].count < 0) {
    data[item].count = 0;
  }

  playTapSound();
  saveCurrentData();
  updateScreen();
}

function resetDay() {
  const confirmReset = confirm("Are you sure you want to reset today's counts without saving?");
  if (!confirmReset) return;

  ids.forEach((id) => {
    data[id].count = 0;
  });

  saveCurrentData();
  updateScreen();
}

function saveDay() {
  const totalItems = getTotalItems();

  if (totalItems === 0) {
    alert("You have nothing to save yet for today.");
    return;
  }

  const today = getTodayLabel();

  const alreadySaved = history.find((entry) => entry.date === today);
  if (alreadySaved) {
    const overwrite = confirm("Today's numbers were already saved. Do you want to replace them?");
    if (!overwrite) return;

    history = history.filter((entry) => entry.date !== today);
  }

  const daySummary = {
    date: today,
    classicCount: data.classic.count,
    classicSales: data.classic.count * data.classic.price,
    flavorCount: data.flavor.count,
    flavorSales: data.flavor.count * data.flavor.price,
    specialityCount: data.speciality.count,
    specialitySales: data.speciality.count * data.speciality.price,
    redbullCount: data.redbull.count,
    redbullSales: data.redbull.count * data.redbull.price,
    classic64Count: data.classic64.count,
    classic64Sales: data.classic64.count * data.classic64.price,
    speciality64Count: data.speciality64.count,
    speciality64Sales: data.speciality64.count * data.speciality64.price,
    totalItems: totalItems,
    grandTotal: getGrandTotal()
  };

  history.push(daySummary);

  ids.forEach((id) => {
    data[id].count = 0;
  });

  saveCurrentData();
  updateScreen();
  renderHistory();

  alert("Day saved and reset for tomorrow.");
}

updateScreen();
renderHistory();
