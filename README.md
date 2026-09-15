# Task Manager

Локальное веб-приложение для управления задачами, исполнителями и регламентами.
Данные хранятся в `data.json`. Сервер — на PowerShell (без установки).

## Запуск

1. Открой PowerShell в папке проекта
2. Запусти сервер:
   ```powershell
   powershell -ExecutionPolicy Bypass -File server.ps1


task-manager/
├── .gitignore
├── README.md
├── server.ps1
├── data.json
├── index.html
├── style.css
└── js/
    ├── app.js            — точка входа, инициализация
    ├── api.js            — работа с сервером (load/save)
    ├── schemas.js        — схемы таблиц и константы
    ├── utils.js          — утилиты (escapeHtml, formatDate, nextId…)
    ├── tables.js         — рендеринг таблиц
    ├── modal.js          — модальное окно (форма)
    └── import-export.js  — импорт CSV/JSON, экспорт JSON
