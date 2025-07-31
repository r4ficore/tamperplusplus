// js/background.js (Wersja Kompletna)

const MAX_LOG_ENTRIES = 1000;

// --- MODUŁ PARSERA METADANYCH ---
/**
 * Parsuje blok metadanych z kodu skryptu użytkownika.
 * @param {string} code - Kod źródłowy skryptu.
 * @returns {object|null} Obiekt z metadanymi lub null, jeśli blok nie został znaleziony.
 */
function parseMeta(code) {
    const meta = {};
    const metaBlock = code.match(/\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/);
    if (!metaBlock) return null;

    const lines = metaBlock[1].match(/@\S+\s+.*/g) || [];
    lines.forEach(line => {
        const [key, ...valueParts] = line.trim().substring(1).split(/\s+/);
        const value = valueParts.join(' ').trim();
        if (meta[key]) {
            if (!Array.isArray(meta[key])) meta[key] = [meta[key]];
            meta[key].push(value);
        } else {
            meta[key] = value;
        }
    });
    return meta;
}

// --- MODUŁ PRZECHOWYWANIA DANYCH ---
const storage = {
    async getScripts() { return (await chrome.storage.local.get('scripts')).scripts || {}; },
    async getScript(id) { return (await this.getScripts())[id]; },
    async saveScript(script) {
        const scripts = await this.getScripts();
        if (!script.id) script.id = `script_${Date.now()}`;
        scripts[script.id] = script;
        await chrome.storage.local.set({ scripts });
        return script;
    },
    async deleteScript(id) {
        const scripts = await this.getScripts();
        delete scripts[id];
        await chrome.storage.local.set({ scripts });
    },
    async getSettings() { return (await chrome.storage.local.get('settings')).settings || { theme: 'light' }; },
    async saveSettings(settings) { await chrome.storage.local.set({ settings }); }
};

// --- MODUŁ LOGOWANIA ---
const logStorage = {
    async getLogs() { return (await chrome.storage.local.get('tamper_logs')).tamper_logs || []; },
    async addLog(logEntry) {
        let logs = await this.getLogs();
        logs.unshift({ ...logEntry, timestamp: new Date().toISOString() });
        if (logs.length > MAX_LOG_ENTRIES) logs = logs.slice(0, MAX_LOG_ENTRIES);
        await chrome.storage.local.set({ tamper_logs: logs });
    },
    async clearLogs() { await chrome.storage.local.set({ tamper_logs: [] }); }
};

// --- MODUŁ OBSŁUGI @require ---
async function fetchAndCacheRequires(meta) {
    if (!meta || !meta.require) return '';
    const requireUrls = Array.isArray(meta.require) ? meta.require : [meta.require];
    let combinedCode = '';
    for (const url of requireUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) combinedCode += await response.text() + '\n;\n';
            else console.error(`Tamper++: Nie udało się pobrać @require z ${url}. Status: ${response.status}`);
        } catch (error) {
            console.error(`Tamper++: Błąd sieci podczas pobierania @require z ${url}:`, error);
        }
    }
    return combinedCode;
}

// --- MODUŁ AKTUALIZACJI ---
function compareVersions(v1, v2) {
    const parts1 = String(v1).split('.').map(Number);
    const parts2 = String(v2).split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
    }
    return 0;
}

async function checkForUpdates() {
    console.log('Tamper++: Sprawdzanie aktualizacji skryptów...');
    const scripts = await storage.getScripts();
    let pendingUpdates = (await chrome.storage.local.get('pendingUpdates')).pendingUpdates || {};
    for (const script of Object.values(scripts)) {
        if (!script.meta || !script.meta.updateURL) continue;
        try {
            const response = await fetch(script.meta.updateURL);
            if (!response.ok) continue;
            const newMeta = parseMeta(await response.text());
            if (newMeta && newMeta.version && compareVersions(script.meta.version, newMeta.version) < 0) {
                pendingUpdates[script.id] = { newVersion: newMeta.version, downloadUrl: newMeta.downloadURL || script.meta.updateURL };
            }
        } catch (error) {
            console.error(`Błąd podczas sprawdzania aktualizacji dla "${script.meta.name}":`, error);
        }
    }
    await chrome.storage.local.set({ pendingUpdates });
    const count = Object.keys(pendingUpdates).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
}

async function performUpdate(scriptId, downloadUrl) {
    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newCode = await response.text();
        const oldScript = await storage.getScript(scriptId);
        const updatedScript = { ...oldScript, code: newCode, meta: parseMeta(newCode) };
        updatedScript.cachedRequires = await fetchAndCacheRequires(updatedScript.meta);
        await storage.saveScript(updatedScript);
        let pendingUpdates = (await chrome.storage.local.get('pendingUpdates')).pendingUpdates || {};
        delete pendingUpdates[scriptId];
        await chrome.storage.local.set({ pendingUpdates });
        const count = Object.keys(pendingUpdates).length;
        chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
        return { success: true, script: updatedScript };
    } catch (error) {
        console.error(`Błąd podczas aktualizacji skryptu ${scriptId}:`, error);
        return { success: false, error: error.message };
    }
}

// --- MODUŁ WSTRZYKIWANIA SKRYPTÓW ---
function matches(url, meta) {
    const { include = [], match = [], exclude = [] } = meta;
    const testPatterns = [].concat(include, match);
    const toRegex = pattern => new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    if (exclude.some(pattern => toRegex(pattern).test(url))) return false;
    if (testPatterns.length === 0 && (include.length > 0 || match.length > 0)) return false;
    return testPatterns.length > 0 ? testPatterns.some(pattern => toRegex(pattern).test(url)) : true;
}

async function injectScripts(tabId, url, frameId) {
    const scripts = await storage.getScripts();
    const scriptsToInject = Object.values(scripts).filter(script => script.enabled && script.meta && matches(url, script.meta));
    if (scriptsToInject.length === 0) return;

    chrome.scripting.executeScript({
        target: { tabId: tabId, frameIds: [frameId] },
        func: (scripts) => {
            window.tamperplusplus_scriptsToInject = (window.tamperplusplus_scriptsToInject || []).concat(scripts);
        },
        args: [scriptsToInject],
        world: 'MAIN',
    }).then(() => {
        chrome.scripting.executeScript({
            target: { tabId: tabId, frameIds: [frameId] },
            files: ['js/injector.js'],
            world: 'MAIN'
        });
    }).catch(err => console.error(`Tamper++: Błąd wstrzykiwania do ramki ${frameId}:`, err));
}

// --- MODUŁ IMPORTU ---
async function processImport(text) {
    let importCount = 0;
    try {
        const data = JSON.parse(text);
        const scriptsToImport = Object.values(data);
        if (Array.isArray(scriptsToImport) && scriptsToImport.every(s => s.code && s.meta)) {
            for (const script of scriptsToImport) {
                delete script.id;
                script.cachedRequires = await fetchAndCacheRequires(script.meta);
                await storage.saveScript(script);
                importCount++;
            }
            return { success: true, count: importCount };
        }
    } catch (e) {
        const meta = parseMeta(text);
        if (meta && meta.name) {
            const cachedRequires = await fetchAndCacheRequires(meta);
            await storage.saveScript({ code: text, meta, enabled: true, cachedRequires });
            return { success: true, count: 1 };
        }
    }
    throw new Error("Nie udało się zinterpretować pliku. Upewnij się, że to plik .user.js lub kopia zapasowa .json z Tamper++.");
}

// --- GŁÓWNE NASŁUCHIWACZE ---
chrome.runtime.onInstalled.addListener(() => {
    console.log('Tamper++ zainstalowany/zaktualizowany.');
    storage.saveSettings({ theme: 'light' });
    chrome.alarms.create('script-update-checker', { delayInMinutes: 1, periodInMinutes: 60 });
    checkForUpdates();
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'script-update-checker') checkForUpdates();
});

chrome.webNavigation.onCommitted.addListener(details => {
    if (!details.url.startsWith('chrome://') && !details.url.startsWith('about:')) {
        injectScripts(details.tabId, details.url, details.frameId);
    }
});

// --- ROUTER WIADOMOŚCI & API ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type.startsWith('GM_')) {
        logStorage.addLog({ scriptId: request.scriptId, scriptName: request.scriptName, type: 'api_call', message: `Wywołano ${request.type}` });
        handleGmApi(request, sender, sendResponse);
        return true;
    }

    switch (request.type) {
        case 'GET_SCRIPTS': storage.getScripts().then(sendResponse); return true;
        case 'SAVE_SCRIPT':
            (async () => {
                const scriptData = request.script;
                scriptData.meta = parseMeta(scriptData.code);
                scriptData.cachedRequires = await fetchAndCacheRequires(scriptData.meta);
                sendResponse(await storage.saveScript(scriptData));
            })();
            return true;
        case 'DELETE_SCRIPT': storage.deleteScript(request.id).then(sendResponse); return true;
        case 'GET_SETTINGS': storage.getSettings().then(sendResponse); return true;
        case 'SAVE_SETTINGS': storage.saveSettings(request.settings).then(sendResponse); return true;
        case 'GET_MATCHING_SCRIPTS':
            storage.getScripts().then(scripts => sendResponse(Object.values(scripts).filter(s => s.enabled && s.meta && matches(request.url, s.meta))));
            return true;
        case 'GET_PENDING_UPDATES': chrome.storage.local.get('pendingUpdates').then(data => sendResponse(data.pendingUpdates || {})); return true;
        case 'PERFORM_UPDATE': performUpdate(request.scriptId, request.downloadUrl).then(sendResponse); return true;
        case 'EXPORT_ALL_SCRIPTS': storage.getScripts().then(scripts => sendResponse({ success: true, data: scripts })); return true;
        case 'IMPORT_FROM_URL':
            fetch(request.url).then(response => response.text()).then(text => processImport(text)).then(sendResponse).catch(err => sendResponse({ success: false, error: err.message }));
            return true;
        case 'IMPORT_FROM_TEXT': processImport(request.text).then(sendResponse).catch(err => sendResponse({ success: false, error: err.message })); return true;
        case 'LOG_EVENT': logStorage.addLog(request.payload).then(() => sendResponse({ success: true })); return true;
        case 'GET_LOGS': logStorage.getLogs().then(sendResponse); return true;
        case 'CLEAR_LOGS': logStorage.clearLogs().then(() => sendResponse({ success: true })); return true;
    }
});

async function handleGmApi(request, sender, sendResponse) {
    const scriptId = request.scriptId;
    switch (request.type) {
        case 'GM_getValue':
            chrome.storage.local.get(`gm_values_${scriptId}`).then(data => {
                const values = data[`gm_values_${scriptId}`] || {};
                sendResponse({ value: values[request.key] ?? request.defaultValue });
            });
            break;
        case 'GM_setValue':
            chrome.storage.local.get(`gm_values_${scriptId}`).then(data => {
                const values = data[`gm_values_${scriptId}`] || {};
                values[request.key] = request.value;
                chrome.storage.local.set({ [`gm_values_${scriptId}`]: values }).then(() => sendResponse({ success: true }));
            });
            break;
        case 'GM_xmlhttpRequest':
            try {
                const response = await fetch(request.details.url, {
                    method: request.details.method || 'GET',
                    headers: request.details.headers,
                    body: request.details.data
                });
                const responseText = await response.text();
                sendResponse({
                    response: responseText,
                    readyState: 4,
                    status: response.status,
                    statusText: response.statusText,
                    responseHeaders: Object.fromEntries(response.headers.entries())
                });
            } catch (error) {
                sendResponse({ error: error.message });
            }
            break;
        case 'GM_log':
        case 'GM_injectPrompt': // Te funkcje są obsługiwane przez logikę wyżej lub w injector.js
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ error: 'Nieznana funkcja GM' });
    }
}
