// js/app.js
import { api } from './api.js';
import { debounce } from './utils.js';
import { renderAll, renderTable } from './tables.js';
import { initModalHandlers } from './modal.js';
import { importFile, exportJSON } from './import-export.js';

const db = { executors: [], tasks: [], regulations: [] };

// Автосохранение (debounce)
const scheduleSave = () => debounce(async () => {
    try {
        await api.save(db);
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}, 400);

// CRUD
const deleteEntity = (type, id) => {
    db[type] = db[type].filter(x => x.id !== id);
    scheduleSave();
    renderAll(db);
};

export { deleteEntity };

// Обработчик для кнопок "Добавить"
const initAddButtons = () => {
    document.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
            import('./modal.js').then(({ openModal }) => openModal(db, btn.dataset.add));
        });
    });
};

// Вкладки
const initTabs = () => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
};

// Поиск и фильтры
const initFilters = () => {
    ['tasks', 'executors', 'regulations'].forEach(type => {
        const el = document.getElementById(`${type}Search`);
        if (el) el.addEventListener('input', () => renderTable(db, type));
    });
    document.getElementById('taskFilterExecutor')?.addEventListener('change', () => renderTable(db, 'tasks'));
    document.getElementById('taskFilterStatus')?.addEventListener('change', () => renderTable(db, 'tasks'));
    document.getElementById('taskShowArchived')?.addEventListener('change', () => renderTable(db, 'tasks'));
};

// Импорт/экспорт
const initImportExport = () => {
    document.getElementById('importBtn').addEventListener('click', () =>
        document.getElementById('importFile').click()
    );
    document.getElementById('importFile').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importFile(db, e.target.files[0], () => {
                scheduleSave();
                renderAll(db);
            });
        }
        e.target.value = '';
    });
    document.getElementById('exportBtn').addEventListener('click', () => exportJSON(db));
};

// === Запуск ===
(async () => {
    try {
        const loaded = await api.load();
        Object.assign(db, loaded);
    } catch (e) {
        console.error('Не удалось загрузить data.json:', e);
        alert('Не удалось загрузить data.json. Убедитесь, что сервер запущен.');
    }

    initTabs();
    initAddButtons();
    initFilters();
    initImportExport();
    initModalHandlers(db, {
        onSave: () => { scheduleSave(); renderAll(db); },
        onDelete: (type, id) => deleteEntity(type, id),
    });

    renderAll(db);
})();
