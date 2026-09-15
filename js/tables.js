// js/tables.js
import { SCHEMAS, STATUS_LABELS } from './schemas.js';
import { escapeHtml, formatDate, resolveName } from './utils.js';
import { openModal } from './modal.js';
import { deleteEntity } from './app.js';

export const populateFilterExecutors = (db) => {
    const sel = document.getElementById('taskFilterExecutor');
    const current = sel.value;
    sel.innerHTML = '<option value="">Все исполнители</option>';
    db.executors.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.name;
        sel.appendChild(opt);
    });
    sel.value = current;
};

export const renderTable = (db, type) => {
    const schema = SCHEMAS[type];
    const table = document.getElementById(`table-${type}`);
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    const cols = schema.columns;
    thead.innerHTML = '<tr>' + cols.map(c => `<th>${c.label}</th>`).join('') + '<th style="width:40px"></th></tr>';

    // Фильтрация
    let rows = [...db[type]];
    const searchEl = document.getElementById(`${type}Search`);
    if (searchEl) {
        const q = searchEl.value.toLowerCase().trim();
        if (q) rows = rows.filter(r => cols.some(c => {
            const v = r[c.key];
            return v != null && String(v).toLowerCase().includes(q);
        }));
    }

    // Доп. фильтры для задач
    if (type === 'tasks') {
        const execFilter = document.getElementById('taskFilterExecutor')?.value;
        const statusFilter = document.getElementById('taskFilterStatus')?.value;
        const showArchived = document.getElementById('taskShowArchived')?.checked;
        if (execFilter) rows = rows.filter(r => r.executor_id === Number(execFilter));
        if (statusFilter) rows = rows.filter(r => r.status === statusFilter);
        if (!showArchived) rows = rows.filter(r => !r.archived);
    }

    // Тело
    tbody.innerHTML = '';
    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="empty-state">Ничего не найдено</td></tr>`;
        return;
    }

    rows.forEach(item => {
        const tr = document.createElement('tr');
        if (item.archived) tr.classList.add('archived-row');
        tr.dataset.id = item.id;
        tr.addEventListener('click', () => openModal(db, type, item.id));

        cols.forEach(col => {
            const td = document.createElement('td');
            let val = item[col.key];

            if (col.type === 'count') {
                val = db[col.countFrom].filter(t => t[col.countBy] === item.id).length;
                td.textContent = val;
            } else if (col.resolve) {
                td.textContent = resolveName(db, col.resolve, val);
            } else if (col.type === 'date') {
                td.textContent = formatDate(val);
            } else if (col.type === 'badge') {
                td.innerHTML = `<span class="badge badge-${val}">${STATUS_LABELS[val] || val || '—'}</span>`;
            } else {
                td.innerHTML = escapeHtml(val ?? '—');
            }
            tr.appendChild(td);
        });

        const tdDel = document.createElement('td');
        tdDel.innerHTML = '<button class="btn-icon" title="Удалить">✕</button>';
        tdDel.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Удалить "${item.name || item.title}"?`)) {
                deleteEntity(type, item.id);
            }
        });
        tr.appendChild(tdDel);

        tbody.appendChild(tr);
    });
};

export const renderAll = (db) => {
    renderTable(db, 'tasks');
    renderTable(db, 'executors');
    renderTable(db, 'regulations');
    populateFilterExecutors(db);
};
