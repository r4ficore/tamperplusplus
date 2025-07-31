// js/injector.js (Wersja Kompletna)

(function() {
    'use strict';

    // Sprawdź, czy są skrypty do wstrzyknięcia. Jeśli nie, zakończ działanie.
    if (!window.tamperplusplus_scriptsToInject || window.tamperplusplus_scriptsToInject.length === 0) {
        return;
    }
    
    const scripts = window.tamperplusplus_scriptsToInject;
    // Wyczyść globalną tablicę, aby uniknąć ponownego wykonania tych samych skryptów.
    window.tamperplusplus_scriptsToInject = [];

    /**
     * Tworzy i zwraca obiekt API (GM_*) dla danego skryptu.
     * @param {string} scriptId - Unikalne ID skryptu.
     * @param {string} scriptName - Nazwa skryptu do celów logowania.
     * @returns {object} Obiekt z funkcjami API.
     */
    const createGmApi = (scriptId, scriptName) => {
        /**
         * Rekursywnie przeszukuje węzeł i jego potomne Shadow Roots w poszukiwaniu elementów pasujących do selektora.
         * @param {Node} node - Węzeł startowy (np. document.documentElement).
         * @param {string} selector - Selektor CSS.
         * @param {boolean} findAll - Czy zwrócić wszystkie znalezione elementy, czy tylko pierwszy.
         * @returns {HTMLElement[]} Tablica znalezionych elementów.
         */
        const findInNode = (node, selector, findAll) => {
            const results = [];
            
            const found = findAll ? node.querySelectorAll(selector) : [node.querySelector(selector)];
            if (found.length > 0 && found[0] !== null) {
                results.push(...Array.from(found).filter(Boolean));
            }

            const allElements = node.querySelectorAll('*');
            for (const element of allElements) {
                if (element.shadowRoot) {
                    results.push(...findInNode(element.shadowRoot, selector, findAll));
                }
            }
            return results;
        };

        const gmApi = {
            // --- Podstawowe API ---
            getValue: (key, defaultValue) => new Promise(resolve => {
                chrome.runtime.sendMessage({ type: 'GM_getValue', scriptId, scriptName, key, defaultValue }, response => resolve(response.value));
            }),
            setValue: (key, value) => new Promise(resolve => {
                chrome.runtime.sendMessage({ type: 'GM_setValue', scriptId, scriptName, key, value }, () => resolve());
            }),
            xmlhttpRequest: (details) => {
                chrome.runtime.sendMessage({ type: 'GM_xmlhttpRequest', scriptId, scriptName, details }, response => {
                    if (response.error && typeof details.onerror === 'function') details.onerror(response);
                    else if (typeof details.onload === 'function') details.onload(response);
                });
            },
            addStyle: (css) => {
                const style = document.createElement('style');
                style.textContent = css;
                (document.head || document.documentElement).appendChild(style);
                return style;
            },
            log: (...args) => {
                const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
                console.log(`[Tamper++: ${scriptName}]`, ...args);
                chrome.runtime.sendMessage({
                    type: 'LOG_EVENT',
                    payload: { scriptId, scriptName, type: 'script_log', message }
                });
            },

            // --- Zaawansowane API do interakcji z DOM ---
            findElement: (selector) => findInNode(document.documentElement, selector, false)[0] || null,
            findAllElements: (selector) => findInNode(document.documentElement, selector, true),
            
            // --- Wyspecjalizowane API dla aplikacji typu Chat ---
            injectPrompt: (promptText, options = {}) => {
                return new Promise(async (resolve, reject) => {
                    const { submit = true } = options;
                    const textArea = document.querySelector('textarea[data-testid="text-input"], textarea[id="prompt-textarea"]');
                    if (!textArea) return reject(new Error("Nie znaleziono pola tekstowego (textarea) dla promptu."));

                    const sendButton = textArea.parentElement?.querySelector('button[data-testid="send-button"], button:has(svg)');
                    textArea.value = promptText;
                    textArea.dispatchEvent(new Event('input', { bubbles: true }));

                    if (!submit) return resolve();
                    if (!sendButton) return reject(new Error("Nie znaleziono przycisku wysyłania."));

                    const checkButtonState = setInterval(() => {
                        if (!sendButton.disabled) {
                            clearInterval(checkButtonState);
                            sendButton.click();
                            resolve();
                        }
                    }, 100);

                    setTimeout(() => {
                        clearInterval(checkButtonState);
                        reject(new Error("Przycisk wysyłania nie stał się aktywny w ciągu 2 sekund."));
                    }, 2000);
                });
            }
        };

        // Tworzenie aliasów (np. GM.log -> GM_log) dla pełnej kompatybilności.
        Object.keys(gmApi).forEach(key => {
            const capitalizedKey = `GM_${key.charAt(0).toUpperCase() + key.slice(1)}`;
            gmApi[capitalizedKey] = gmApi[key];
        });

        return gmApi;
    };

    // Pętla wykonująca każdy skrypt przeznaczony dla bieżącej strony.
    scripts.forEach(script => {
        const startTime = performance.now();
        
        try {
            const GM = createGmApi(script.id, script.meta?.name);
            // Połącz zbuforowane biblioteki (@require) z głównym kodem skryptu.
            const fullCode = (script.cachedRequires || '') + '\n' + script.code;
            
            // Stwórz i wykonaj skrypt w izolowanym środowisku.
            const sandboxedFunction = new Function('GM', 'unsafeWindow', fullCode);
            sandboxedFunction(GM, window);
            
            const duration = (performance.now() - startTime).toFixed(2);
            
            // Wyślij log o pomyślnym wykonaniu.
            chrome.runtime.sendMessage({
                type: 'LOG_EVENT',
                payload: {
                    scriptId: script.id,
                    scriptName: script.meta?.name || 'Bezimienny',
                    type: 'execution_success',
                    message: `Wykonano pomyślnie w ${duration} ms.`,
                    details: { duration: parseFloat(duration) }
                }
            });

        } catch (e) {
            const duration = (performance.now() - startTime).toFixed(2);
            console.error(`Tamper++: Błąd w skrypcie "${script.meta?.name}":`, e);
            
            // Wyślij log o błędzie.
            chrome.runtime.sendMessage({
                type: 'LOG_EVENT',
                payload: {
                    scriptId: script.id,
                    scriptName: script.meta?.name || 'Bezimienny',
                    type: 'execution_error',
                    message: e.message,
                    details: { stack: e.stack, duration: parseFloat(duration) }
                }
            });
        }
    });

})();
