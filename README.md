Tamper++
Tamper++ to nowoczesne, bezpieczne i potężne rozszerzenie do przeglądarek oparte na Chromium, stworzone jako następca legendarnego Tampermonkey. Zapewnia pełną kompatybilność z istniejącymi skryptami użytkownika (userscripts), oferując jednocześnie unowocześniony interfejs, lepszą wydajność i zaawansowane API dla deweloperów.
Główne Funkcje
🚀 Pełne Zarządzanie Skryptami: Instaluj, edytuj, usuwaj i zarządzaj wszystkimi swoimi skryptami w jednym, intuicyjnym panelu.
💻 Nowoczesny Edytor Kodu: Wbudowany edytor Monaco (silnik VS Code) z podświetlaniem składni i podpowiedziami.
🌗 Jasny i Ciemny Motyw: Interfejs, który dopasowuje się do Twoich preferencji i dba o Twój wzrok.
🔗 Obsługa @require: Pełna kompatybilność ze skryptami wykorzystującymi zewnętrzne biblioteki, takie jak jQuery.
🤖 Zaawansowane API GM_*:
Obsługa Shadow DOM: Funkcje GM_findElement i GM_findAllElements pozwalają na interakcję z elementami na nowoczesnych, dynamicznych stronach (np. ChatGPT, YouTube).
Inteligentne Wstrzykiwanie: Dedykowana funkcja GM_injectPrompt do niezawodnej automatyzacji na stronach typu chatbot.
🔄 Automatyczne Aktualizacje: Rozszerzenie samo sprawdza i powiadamia o nowych wersjach Twoich skryptów.
📊 Analityka i Logowanie: Śledź wydajność, czas wykonania i błędy swoich skryptów w dedykowanym panelu logów.
📤 Import i Eksport: Z łatwością twórz kopie zapasowe i przenoś swoje skrypty między urządzeniami.
Instalacja
Ponieważ rozszerzenie jest w fazie aktywnego rozwoju, najprostszą metodą instalacji jest załadowanie go bezpośrednio ze źródeł.
Pobierz lub sklonuj repozytorium:
git clone https://github.com/TWOJA_NAZWA_UŻYTKOWNIKA/tamperplusplus.git


Otwórz przeglądarkę (Google Chrome, Edge, Opera, etc.).
Wejdź na stronę rozszerzeń, wpisując w pasku adresu chrome://extensions.
Włącz "Tryb dewelopera" ("Developer mode") w prawym górnym rogu.
Kliknij przycisk "Załaduj rozpakowane" ("Load unpacked").
Wybierz folder, do którego sklonowałeś repozytorium (tamperplusplus).
Gotowe! Ikona Tamper++ pojawi się na pasku narzędzi.
Jak Zacząć?
Otwórz Panel: Kliknij ikonę Tamper++ na pasku narzędzi, a następnie ikonę zębatki, aby otworzyć główny panel zarządzania.
Zainstaluj Skrypt:
Kliknij "Zainstaluj nowy skrypt", aby otworzyć edytor i stworzyć własny skrypt.
Użyj opcji "Importuj z URL", aby zainstalować istniejący skrypt (np. z Greasy Fork).
Napisz Potężny Skrypt: Wykorzystaj zaawansowane API, aby zautomatyzować złożone zadania.
Przykład skryptu dla ChatGPT:
// ==UserScript==
// @name         ChatGPT - Szybkie Polecenia
// @match        https://chat.openai.com/*
// @grant        GM_injectPrompt
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';
    // Ta funkcja wstrzyknie i wyśle prompt po 3 sekundach od załadowania strony.
    setTimeout(async () => {
        try {
            GM.log('Wysyłam automatyczne zapytanie...');
            await GM.injectPrompt("Napisz krótki wiersz o kodowaniu w JavaScript.");
            GM.log('Zapytanie wysłane!');
        } catch(e) {
            GM.log('Błąd:', e.message);
        }
    }, 3000);
})();


Stos Technologiczny
Manifest V3
JavaScript (ES6+)
TailwindCSS - do stylizacji interfejsu
Monaco Editor - do edycji kodu
Wkład w Projekt (Contributing)
Jesteśmy otwarci na wszelkie sugestie i wkład w rozwój projektu! Jeśli chcesz pomóc, prosimy o:
Stworzenie forka repozytorium.
Wprowadzenie zmian w nowej gałęzi (git checkout -b feature/nazwa-twojej-funkcji).
Zacommitowanie zmian (git commit -m 'Dodaję nową funkcję').
Wysłanie zmian na swoje repozytorium (git push origin feature/nazwa-twojej-funkcji).
Stworzenie Pull Requesta.
Licencja
Projekt jest udostępniany na licencji MIT.
