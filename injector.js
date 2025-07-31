// js/injector.js (v5)

(function() {
    'use strict';

    if (!window.tamperplusplus_scriptsToInject || window.tamperplusplus_scriptsToInject.length === 0) {
        return;
    }
    
    const scripts = window.tamperplusplus_scriptsToInject;
    window.tamperplusplus_scriptsToInject = [];

    const createGmApi = (scriptId, scriptName) => {
        // ... (funkcja findInNode oraz poprzednie funkcje API bez zmian) ...
        const findInNode = (node, selector, findAll) => { /* ... */ };

        const gmApi = {
            // ... (getValue, setValue, findElement, etc.) ...
            
            /**
             * Niezawodnie wstrzykuje tekst do pola promptu na stronach takich jak ChatGPT i opcjonalnie go wysyła.
             * Ta funkcja jest odporna na dynamiczne zmiany klas i symuluje interakcję użytkownika.
             * @param {string} promptText - Tekst do wstrzyknięcia.
             * @param {object} [options] - Opcje.
             * @param {boolean} [options.submit=true] - Czy automatycznie wysłać prompt po wstrzyknięciu.
             * @returns {Promise<void>}
             */
            injectPrompt: (promptText, options = {}) => {
                return new Promise(async (resolve, reject) => {
                    const { submit = true } = options;

                    // Używamy stabilnych selektorów, które rzadziej się zmieniają niż klasy CSS.
                    const textArea = document.querySelector('textarea[data-testid="text-input"], textarea[id="prompt-textarea"]');
                    if (!textArea) {
                        return reject(new Error("Nie znaleziono pola tekstowego (textarea) dla promptu."));
                    }

                    // Znajdź przycisk wysyłania, który jest zazwyczaj obok pola tekstowego.
                    const sendButton = textArea.parentElement?.querySelector('button[data-testid="send-button"], button:has(svg)');

                    // 1. Ustaw wartość pola tekstowego.
                    textArea.value = promptText;

                    // 2. Wywołaj zdarzenie 'input', aby framework (np. React) "zauważył" zmianę.
                    // To jest kluczowy krok, którego brakuje w prostych implementacjach.
                    textArea.dispatchEvent(new Event('input', { bubbles: true }));

                    if (!submit) {
                        return resolve();
                    }

                    if (!sendButton) {
                        return reject(new Error("Nie znaleziono przycisku wysyłania."));
                    }

                    // 3. Poczekaj, aż przycisk wysyłania stanie się aktywny.
                    // Przycisk jest często wyłączony, dopóki nie ma tekstu w polu.
                    const checkButtonState = setInterval(() => {
                        if (!sendButton.disabled) {
                            clearInterval(checkButtonState);
                            // 4. Kliknij przycisk, aby wysłać prompt.
                            sendButton.click();
                            resolve();
                        }
                    }, 100); // Sprawdzaj co 100ms

                    // Zabezpieczenie na wypadek, gdyby przycisk nigdy nie stał się aktywny.
                    setTimeout(() => {
                        clearInterval(checkButtonState);
                        reject(new Error("Przycisk wysyłania nie stał się aktywny w ciągu 2 sekund."));
                    }, 2000);
                });
            },

            log: (...args) => { /* ... */ }
        };

        // ... (logika aliasów GM_* bez zmian) ...
        return gmApi;
    };

    // ... (logika wykonania skryptu bez zmian) ...
})();
