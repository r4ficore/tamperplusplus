// js/popup.js

document.addEventListener('DOMContentLoaded', () => {
    const scriptsList = document.getElementById('scripts-list');
    const noScriptsMessage = document.getElementById('no-scripts-message');
    const scriptItemTemplate = document.getElementById('script-item-template');
    const openDashboardBtn = document.getElementById('open-dashboard');
    const addNewScriptBtn = document.getElementById('add-new-script');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Zarządzanie Motywem ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            themeToggle.innerHTML = '<i class="fas fa-moon text-gray-700 dark:text-gray-300"></i>';
        } else {
            document.body.classList.remove('dark');
            themeToggle.innerHTML = '<i class="fas fa-sun text-gray-700 dark:text-gray-300"></i>';
        }
    };

    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
        if (settings) applyTheme(settings.theme);
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', settings: { theme: newTheme } });
    });

    // --- Ładowanie skryptów dla bieżącej karty ---
    const loadScriptsForCurrentTab = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
            noScriptsMessage.textContent = 'Nie można uruchomić skryptów na tej stronie.';
            noScriptsMessage.style.display = 'block';
            return;
        }

        chrome.runtime.sendMessage({ type: 'GET_MATCHING_SCRIPTS', url: tab.url }, (matchingScripts) => {
            scriptsList.innerHTML = ''; // Wyczyść listę
            if (matchingScripts && matchingScripts.length > 0) {
                noScriptsMessage.style.display = 'none';
                matchingScripts.forEach(script => {
                    const scriptItem = scriptItemTemplate.content.cloneNode(true);
                    scriptItem.querySelector('.script-name').textContent = script.meta.name || 'Bezimienny Skrypt';
                    scriptItem.querySelector('.script-version').textContent = `wersja ${script.meta.version || 'b/d'}`;
                    const toggle = scriptItem.querySelector('.toggle-switch');
                    toggle.checked = script.enabled;
                    toggle.dataset.scriptId = script.id;
                    
                    toggle.addEventListener('change', (e) => {
                        const scriptId = e.target.dataset.scriptId;
                        const isEnabled = e.target.checked;
                        // Zapisz cały obiekt skryptu z nowym stanem 'enabled'
                        chrome.runtime.sendMessage({ type: 'GET_SCRIPTS' }, (allScripts) => {
                            const scriptToUpdate = allScripts[scriptId];
                            if (scriptToUpdate) {
                                scriptToUpdate.enabled = isEnabled;
                                chrome.runtime.sendMessage({ type: 'SAVE_SCRIPT', script: scriptToUpdate });
                            }
                        });
                    });

                    scriptsList.appendChild(scriptItem);
                });
            } else {
                scriptsList.appendChild(noScriptsMessage);
                noScriptsMessage.style.display = 'block';
            }
        });
    };

    // --- Nawigacja ---
    openDashboardBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    addNewScriptBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        // Można by wysłać wiadomość do strony opcji, aby od razu otworzyła edytor nowego skryptu
    });

    // --- Inicjalizacja ---
    loadScriptsForCurrentTab();
});
