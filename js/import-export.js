// js/import-export.js
import { nextId, todayStr, debounce } from './utils.js';

const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const vals = [];
        let cur = '', inQ = false;
        for (const ch of lines[i]) {
            if (ch === '"') { inQ = !inQ; continue; }
            if (ch === ',' && !inQ) { vals.push(cur); cur = ''; continue; }
            cur += ch;
        }
        vals.push(cur);
        const obj = {};
        headers.forEach((h, j) => obj[h] = vals[j] || '');
        rows.push(obj);
    }
    return rows;
};

export const importFile = (db, file, onDone) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        if (file.name.endsWith('.json')) {
            try {
                const data = JSON.parse(text);
                if (data.executors) db.executors = data.executors;
                if (data.tasks) db.tasks = data.tasks;
                if (data.regulations) db.regulations = data.regulations;
                onDone();
                alert('Импорт JSON выполнен');
            } catch (err) {
                alert('Ошибка чтения JSON: ' + err.message);
            }
        } else if (file.name.endsWith('.csv')) {
            const rows = parseCSV(text);
            if (rows.length === 0) { alert('CSV пуст или некорректен'); return; }
            let added = 0;
            rows.forEach(r => {
                if (r.title) {
                    db.tasks.push({
                        id: nextId(db.tasks),
                        title: r.title,
                        description: r.description || '',
                        executor_id: r.executor_id ? Number(r.executor_id) : null,
                        regulation_id: r.regulation_id ? Number(r.regulation_id) : null,
                        due_date: r.due_date || '',
                        created_date: r.created_date || todayStr(),
                        status: r.status || 'active',
                        archived: false,
                    });
                    added++;
                }
            });
            onDone();
            alert(`Импортировано задач: ${added}`);
        }
    };
    reader.readAsText(file, 'UTF-8');
};

export const exportJSON = (db) => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
