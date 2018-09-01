(function() {
    /* global $, browser */

    // Default settings
    var dictionarySettings = {
        theme: {
            value: "auto", //light/dark/auto
        },
    };

    function getDefinition(searchText, callback) {
        var definitionApi =
            "http://api.wordnik.com:80/v4/word.json/" +
            searchText +
            "/definitions?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";
        var pronounciationApi =
            "http://api.wordnik.com:80/v4/word.json/" +
            searchText +
            "/pronunciations?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";

        var result = {
            searchText: searchText,
            definitions: [],
            pronounciation: "",
            status: "",
        };

        $.when($.getJSON(definitionApi), $.getJSON(pronounciationApi))
            .then(function(result1, result2) {
                result1 = result1[0];
                result2 = result2[0];
                result.status = "success";
                result.definitions = result1.map(function(ele) {
                    return ele.text;
                });
                if (Array.isArray(result2) && typeof result2[0] === "object") {
                    result.pronounciation = result2.shift().raw;
                }
                // atleast one def should be present
                if (result.definitions.length === 0) {
                    result.status = "fail";
                }
            })
            .fail(function() {
                result.status = "fail";
            })
            .always(function() {
                callback(result);
            });
    }

    browser.runtime.onMessage.addListener(function(msg) {
        localStorage.setItem("recentSearchText", msg.searchText);
        getDefinition(msg.searchText, sendResponse);
    });

    function sendResponse(result) {
        var response = {
            db: dictionarySettings,
            search: result,
        };
        browser.tabs
            .query({
                currentWindow: true,
                active: true,
            })
            .then(function(tabs) {
                browser.tabs.sendMessage(tabs[0].id, response);
            });
    }

    function logError(err) {
        console.error(err);
    }

    function updateSettings(dbData) {
        dbData = dbData || {};
        dictionarySettings = $.extend(dictionarySettings, dbData);
    }

    browser.storage.onChanged.addListener(function(changes, area) {
        if (area === "sync") {
            browser.storage.sync.get().then(updateSettings, logError);
        }
    });
    browser.storage.sync.get().then(updateSettings, logError);
})();
