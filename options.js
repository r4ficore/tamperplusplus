// js/options.js (v4)

document.addEventListener('DOMContentLoaded', () => {
    // --- Selektory (ZAKTUALIZOWANE) ---
    const editorView = document.getElementById('editor-view');
    const welcomeView = document.getElementById('welcome-view');
    const logsView = document.getElementById('logs-view');
    const showLogsBtn = document.getElementById('show-logs-btn');
    const closeLogsBtn = document.getElementById('close-logs-btn');
    const clearLogsBtn = document.getElementById('clear-logs-btn');
    const logsTableBody = document.getElementById('logs-table-body');
    const noLogsMessage = document.getElementById('no-logs-message');
    const logRowTemplate = document.getElementById('log-row-template');
    // ... (reszta selektorów z v3)

    // --- Inicjalizacja Edytora i Motywu (bez zmian) ---
    // ...

    // --- Ładowanie i Wyświetlanie Skryptów (bez zmian) ---
    const loadScripts = async () => { /* ... */ };

    // --- Zarządzanie Widokami (ZAKTUALIZOWANE) ---
    const showView = (viewToShow) => {
        [welcomeView, editorView, logsView].forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');
        viewToShow.classList.add('flex');
    };
    
    // --- NOWA LOGIKA: LOGI ---
    const loadLogs = async () => {
        const [logs, scripts] = await Promise.all([
            new Promise(resolve => chrome.runtime.sendMessage({ type: 'GET_LOGS' }, resolve)),
            new Promise(resolve => chrome.runtime.sendMessage({ type: 'GET_SCRIPTS' }, resolve))
        ]);

        logsTableBody.innerHTML = '';
        if (logs && logs.length > 0) {
            noLogsMessage.classList.add('hidden');
            logs.forEach(log => {
                const row = logRowTemplate.content.cloneNode(true);
                const scriptName = log.scriptName || scripts[log.scriptId]?.meta?.name || 'Nieznany Skrypt';
                
                row.querySelector('.log-timestamp').textContent = new Date(log.timestamp).toLocaleString();
                row.querySelector('.log-script-name').textContent = scriptName;
                
                const typeCell = row.querySelector('.log-type');
                if (log.type === 'execution_success') {
                    typeCell.innerHTML = `<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Sukces</span>`;
                } else if (log.type === 'execution_error') {
                    typeCell.innerHTML = `<span class="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Błąd</span>`;
                } else {
                    typeCell.innerHTML = `<span class="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">API</span>`;
                }
                
                row.querySelector('.log-message').textContent = log.message;
                logsTableBody.appendChild(row);
            });
        } else {
            noLogsMessage.classList.remove('hidden');
        }
    };

    showLogsBtn.addEventListener('click', () => {
        loadLogs();
        showView(logsView);
    });

    closeLogsBtn.addEventListener('click', () => {
        showView(welcomeView);
    });

    clearLogsBtn.addEventListener('click', () => {
        if (confirm('Czy na pewno chcesz trwale usunąć wszystkie logi?')) {
            chrome.runtime.sendMessage({ type: 'CLEAR_LOGS' }, () => {
                loadLogs();
            });
        }
    });

    // --- Reszta kodu (obsługa skryptów, import/export) bez zmian ---
    // ...

    // --- Inicjalizacja ---
    loadScripts();
    showView(welcomeView); // Pokaż widok powitalny na starcie
    // ...
});
