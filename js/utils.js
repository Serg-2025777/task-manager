// js/utils.js
export const escapeHtml = (t) => String(t ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString('ru-RU');
};

export const todayStr = () => new Date().toISOString().split('T')[0];

export const nextId = (arr) => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;

export const resolveName = (db, sourceTable, id) => {
    if (id === null || id === undefined || id === '') return '—';
    const item = db[sourceTable].find(x => x.id === Number(id));
    return item ? item.name : '—';
};

// Debounce-сохранение
let saveTimer = null;
export const debounce = (fn, ms = 400) => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(fn, ms);
};
