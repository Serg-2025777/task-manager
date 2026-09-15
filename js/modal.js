// js/modal.js
import { SCHEMAS } from './schemas.js';
import { todayStr, nextId, escapeHtml } from './utils.js';

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');

let editing = null;

export const openModal = (db, type, id = null) => {
    editing = { type, id };
    const schema = SCHEMAS[type];
    const isEdit = id !== null;
    modalTitle.textContent = isEdit ? `Редактировать ${schema.title}` : `Добавить ${schema.title}`;

    let item;
    if (isEdit) {
        item = { ...db[type].find(x => x.id === id) };
    } else {
        item = {};
        schema.fields.forEach(f => {
            if (f.key === 'created_date' && type === 'tasks') item[f.key] = todayStr();
            else if (f.key === 'status') item[f.key] = 'active';
            else if (f.key === 'archived') item[f.key] = false;
            else if (f.type === 'checkbox') item[f.key] = false;
            else item[f.key] = '';
        });
    }

    modalBody.innerHTML = '';
    schema.fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'form-group';

        if (f.type === 'checkbox') {
            const wrap = document.createElement('label');
            wrap.className = 'form-check';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = !!item[f.key];
            input.dataset.key = f.key;
            wrap.appendChild(input);
            wrap.appendChild(document.createTextNode(' ' + f.label));
            group.appendChild(wrap);
            modalBody.appendChild(group);
            return;
        }

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = f.label + (f.required ? ' *' : '');
        group.appendChild(label);

        let input;
        if (f.type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-input';
            input.value = item[f.key] || '';
        } else if (f.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-input';
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = '— не выбрано —';
            input.appendChild(emptyOpt);
            if (f.options) {
                f.options.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o.value;
                    opt.textContent = o.label;
                    if (String(item[f.key]) === String(o.value)) opt.selected = true;
                    input.appendChild(opt);
                });
            } else if (f.source) {
                db[f.source].forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.id;
                    opt.textContent = s.name;
                    if (Number(item[f.key]) === s.id) opt.selected = true;
                    input.appendChild(opt);
                });
            }
        } else {
            input = document.createElement('input');
            input.type = f.type === 'date' ? 'date' : 'text';
            input.className = 'form-input';
            input.value = item[f.key] || '';
        }
        input.dataset.key = f.key;
        if (f.required) input.required = true;
        group.appendChild(input);
        modalBody.appendChild(group);
    });

    document.getElementById('modalDelete').style.display = isEdit ? '' : 'none';
    modal.classList.add('open');
};

export const closeModal = () => {
    modal.classList.remove('open');
    editing = null;
};

export const getEditing = () => editing;

export const saveModal = (db) => {
    if (!editing) return;
    const { type, id } = editing;
    const schema = SCHEMAS[type];

    // Валидация
    for (const f of schema.fields) {
        if (f.required) {
            const el = modalBody.querySelector(`[data-key="${f.key}"]`);
            if (el && !el.value.trim()) {
                el.focus();
                return false;
            }
        }
    }

    const data = {};
    schema.fields.forEach(f => {
        const el = modalBody.querySelector(`[data-key="${f.key}"]`);
        if (!el) return;
        if (f.type === 'checkbox') {
            data[f.key] = el.checked;
        } else if (f.type === 'select' && f.source) {
            data[f.key] = el.value ? Number(el.value) : null;
        } else if (f.type === 'select' && f.options) {
            data[f.key] = el.value;
        } else {
            data[f.key] = el.value.trim();
        }
    });

    if (id !== null) {
        const idx = db[type].findIndex(x => x.id === id);
        if (idx !== -1) db[type][idx] = { ...db[type][idx], ...data };
    } else {
        data.id = nextId(db[type]);
        db[type].push(data);
    }

    closeModal();
    return true;
};

export const initModalHandlers = (db, callbacks) => {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('modalSave').addEventListener('click', () => {
        if (saveModal(db)) callbacks.onSave();
    });
    document.getElementById('modalDelete').addEventListener('click', () => {
        if (editing && editing.id !== null && confirm('Удалить безвозвратно?')) {
            callbacks.onDelete(editing.type, editing.id);
            closeModal();
        }
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
};
