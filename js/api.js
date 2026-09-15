// js/api.js
export const api = {
    async load() {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Не удалось загрузить данные');
        return res.json();
    },
    async save(data) {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data, null, 2),
        });
        return res.json();
    },
};
