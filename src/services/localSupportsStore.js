// ========================= LOCAL SUPPORT STORE ========================= //
// 🧠 LocalStorage üzerinde link tıklama sayısını yönetir (geçici backend)

const STORAGE_KEY = "celo_support_counts_v1";

function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 🔹 Destek sayısını getir
export function getSupportCount(link) {
  const data = loadData();
  return data[link] || 0;
}

// 🔹 Destek sayısını artır
export function addSupport(link) {
  const data = loadData();
  data[link] = (data[link] || 0) + 1;
  saveData(data);
  return data[link];
}

// 🔹 Tamamlanan linkleri getir (5 destek)
export function getCompletedLinks() {
  const data = loadData();
  return Object.keys(data).filter((link) => data[link] >= 5);
}

// 🔹 Tüm veriyi sıfırla (isteğe bağlı)
export function resetAllSupports() {
  localStorage.removeItem(STORAGE_KEY);
}
