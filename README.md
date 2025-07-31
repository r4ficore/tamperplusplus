# **Tamper++**

**Tamper++ to nowoczesne, bezpieczne i potężne rozszerzenie do przeglądarek oparte na Chromium, stworzone jako następca legendarnego Tampermonkey. Zapewnia pełną kompatybilność z istniejącymi skryptami użytkownika (userscripts), oferując jednocześnie unowocześniony interfejs, lepszą wydajność i zaawansowane API dla deweloperów.**

## **Główne Funkcje**

* **🚀 Pełne Zarządzanie Skryptami**: Instaluj, edytuj, usuwaj i zarządzaj wszystkimi swoimi skryptami w jednym, intuicyjnym panelu.  
* **💻 Nowoczesny Edytor Kodu**: Wbudowany edytor **Monaco** (silnik VS Code) z podświetlaniem składni i podpowiedziami.  
* **🌗 Jasny i Ciemny Motyw**: Interfejs, który dopasowuje się do Twoich preferencji i dba o Twój wzrok.  
* **🔗 Obsługa @require**: Pełna kompatybilność ze skryptami wykorzystującymi zewnętrzne biblioteki, takie jak jQuery.  
* **🤖 Zaawansowane API GM\_\***:  
  * **Obsługa Shadow DOM**: Funkcje GM\_findElement i GM\_findAllElements pozwalają na interakcję z elementami na nowoczesnych, dynamicznych stronach (np. ChatGPT, YouTube).  
  * **Inteligentne Wstrzykiwanie**: Dedykowana funkcja GM\_injectPrompt do niezawodnej automatyzacji na stronach typu chatbot.  
* **🔄 Automatyczne Aktualizacje**: Rozszerzenie samo sprawdza i powiadamia o nowych wersjach Twoich skryptów.  
* **📊 Analityka i Logowanie**: Śledź wydajność, czas wykonania i błędy swoich skryptów w dedykowanym panelu logów.  
* **📤 Import i Eksport**: Z łatwością twórz kopie zapasowe i przenoś swoje skrypty między urządzeniami.

## **Instalacja**

Ponieważ rozszerzenie jest w fazie aktywnego rozwoju, najprostszą metodą instalacji jest załadowanie go bezpośrednio ze źródeł.

1. **Pobierz lub sklonuj repozytorium**:  
   git clone https://github.com/TWOJA\_NAZWA\_UŻYTKOWNIKA/tamperplusplus.git

2. **Otwórz przeglądarkę** (Google Chrome, Edge, Opera, etc.).  
3. Wejdź na stronę rozszerzeń, wpisując w pasku adresu chrome://extensions.  
4. Włącz **"Tryb dewelopera"** ("Developer mode") w prawym górnym rogu.  
5. Kliknij przycisk **"Załaduj rozpakowane"** ("Load unpacked").  
6. Wybierz folder, do którego sklonowałeś repozytorium (tamperplusplus).  
7. Gotowe\! Ikona Tamper++ pojawi się na pasku narzędzi.

## **Jak Zacząć?**

1. **Otwórz Panel**: Kliknij ikonę Tamper++ na pasku narzędzi, a następnie ikonę zębatki, aby otworzyć główny panel zarządzania.  
2. **Zainstaluj Skrypt**:  
   * Kliknij **"Zainstaluj nowy skrypt"**, aby otworzyć edytor i stworzyć własny skrypt.  
   * Użyj opcji **"Importuj z URL"**, aby zainstalować istniejący skrypt (np. z [Greasy Fork](https://greasyfork.org/)).  
3. **Napisz Potężny Skrypt**: Wykorzystaj zaawansowane API, aby zautomatyzować złożone zadania.

**Przykład skryptu dla ChatGPT:**

// \==UserScript==  
// @name         ChatGPT \- Szybkie Polecenia  
// @match        https://chat.openai.com/\*  
// @grant        GM\_injectPrompt  
// @grant        GM\_log  
// \==/UserScript==

(function() {  
    'use strict';  
    // Ta funkcja wstrzyknie i wyśle prompt po 3 sekundach od załadowania strony.  
    setTimeout(async () \=\> {  
        try {  
            GM.log('Wysyłam automatyczne zapytanie...');  
            await GM.injectPrompt("Napisz krótki wiersz o kodowaniu w JavaScript.");  
            GM.log('Zapytanie wysłane\!');  
        } catch(e) {  
            GM.log('Błąd:', e.message);  
        }  
    }, 3000);  
})();

## **Stos Technologiczny**

* **Manifest V3**  
* **JavaScript (ES6+)**  
* **TailwindCSS** \- do stylizacji interfejsu  
* **Monaco Editor** \- do edycji kodu

## **Wkład w Projekt (Contributing)**

Jesteśmy otwarci na wszelkie sugestie i wkład w rozwój projektu\! Jeśli chcesz pomóc, prosimy o:

1. Stworzenie forka repozytorium.  
2. Wprowadzenie zmian w nowej gałęzi (git checkout \-b feature/nazwa-twojej-funkcji).  
3. Zacommitowanie zmian (git commit \-m 'Dodaję nową funkcję').  
4. Wysłanie zmian na swoje repozytorium (git push origin feature/nazwa-twojej-funkcji).  
5. Stworzenie Pull Requesta.

## **Licencja**

Projekt jest udostępniany na licencji **MIT**.