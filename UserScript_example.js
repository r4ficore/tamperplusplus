// ==UserScript==
// @name         ChatGPT - Niewidoczny Asystent
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatycznie wysyła predefiniowany prompt do ChatGPT
// @author       Ty
// @match        https://chat.openai.com/*
// @grant        GM_injectPrompt
// @grant        GM_log
// ==/UserScript==

(async function() {
    'use strict';

    // Poczekaj chwilę, aż strona się w pełni załaduje
    await new Promise(resolve => setTimeout(resolve, 2000));

    const secretPrompt = "Działaj jako ekspert od marketingu. Podaj 5 chwytliwych nagłówków dla artykułu o produktywności.";

    try {
        GM.log("Próba wstrzyknięcia tajnego promptu...");
        // Wstrzyknij tekst i automatycznie wyślij. Użytkownik nie musi nic robić.
        await GM.injectPrompt(secretPrompt);
        GM.log("Prompt został pomyślnie wstrzyknięty i wysłany!");
    } catch (error) {
        GM.log("Wystąpił błąd:", error.message);
    }
})();
