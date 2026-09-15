// js/schemas.js
export const SCHEMAS = {
    tasks: {
        title: 'задачу',
        fields: [
            { key: 'title', label: 'Название', type: 'text', required: true },
            { key: 'description', label: 'Описание', type: 'textarea' },
            { key: 'executor_id', label: 'Исполнитель', type: 'select', source: 'executors' },
            { key: 'regulation_id', label: 'Регламент', type: 'select', source: 'regulations' },
            { key: 'due_date', label: 'Срок выполнения', type: 'date' },
            { key: 'created_date', label: 'Дата постановки', type: 'date' },
            {
                key: 'status', label: 'Статус', type: 'select', options: [
                    { value: 'active', label: 'Активно' },
                    { value: 'in_progress', label: 'В работе' },
                    { value: 'done', label: 'Выполнено' },
                    { value: 'cancelled', label: 'Отменено' },
                ]
            },
            { key: 'archived', label: 'В архиве', type: 'checkbox' },
        ],
        columns: [
            { key: 'title', label: 'Название' },
            { key: 'executor_id', label: 'Исполнитель', resolve: 'executors' },
            { key: 'regulation_id', label: 'Регламент', resolve: 'regulations' },
            { key: 'due_date', label: 'Срок выполнения', type: 'date' },
            { key: 'created_date', label: 'Дата постановки', type: 'date' },
            { key: 'status', label: 'Статус', type: 'badge' },
        ],
    },
    executors: {
        title: 'исполнителя',
        fields: [
            { key: 'name', label: 'Имя', type: 'text', required: true },
            { key: 'position', label: 'Должность', type: 'text' },
            { key: 'contacts', label: 'Контакты', type: 'text' },
        ],
        columns: [
            { key: 'name', label: 'Имя' },
            { key: 'position', label: 'Должность' },
            { key: 'contacts', label: 'Контакты' },
            { key: '_tasks_count', label: 'Задач', type: 'count', countFrom: 'tasks', countBy: 'executor_id' },
        ],
    },
    regulations: {
        title: 'регламент',
        fields: [
            { key: 'name', label: 'Название', type: 'text', required: true },
            { key: 'description', label: 'Описание', type: 'textarea' },
        ],
        columns: [
            { key: 'name', label: 'Название' },
            { key: 'description', label: 'Описание' },
            { key: '_tasks_count', label: 'Задач', type: 'count', countFrom: 'tasks', countBy: 'regulation_id' },
        ],
    },
};

export const STATUS_LABELS = {
    active: 'Активно',
    in_progress: 'В работе',
    done: 'Выполнено',
    cancelled: 'Отменено',
};
