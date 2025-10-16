// ========================= LOCAL SUPPORT STORE =========================
const STORAGE_KEY = "celo_support_counts_v1";

function loadData(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch{ return {}; } }
function saveData(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

export function getSupportCount(link){
  const d = loadData(); return d[link]?.count || 0;
}

export function addSupport(link){
  const d = loadData();
  const prev = d[link]?.count || 0;
  const next = Math.min(prev + 1, 5);
  d[link] = { count: next, ts: Date.now() };
  saveData(d);
  return next;
}

export function getCompletedLinks(){
  const d = loadData();
  return Object.keys(d).filter(k => (d[k]?.count || 0) >= 5);
}

export function resetAllSupports(){ localStorage.removeItem(STORAGE_KEY); }
