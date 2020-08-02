(function() {
    /* global $, browser */

    // Default settings
    var dictionarySettings = {
        theme: {
            value: "auto", //light/dark/auto
        },
    };

    function getDefinition(searchText, callback) {
        //var definitionApi = "https://mydictionaryapi.appspot.com/?define=" + searchText;
        var definitionApi = "https://api.dictionaryapi.dev/api/v2/entries/en/" + searchText;

        var result = {
            searchText: searchText,
            definitions: "",
            pronounciation: "",
            status: "",
        };

        $.when($.getJSON(definitionApi))
            .then(function(data) {
                result.pronounciation = data[0].phonetics[0].text;
                var definition = "";
                if(data[0] && data[0].meanings){
                    var meanings = data[0].meanings;
                    var index = 1;
                    for(var meaning in meanings){
                        if(meanings.hasOwnProperty(meaning)){
                            definition += index+ ". (" + meanings[meaning].partOfSpeech + ") "+meanings[meaning].definitions[0].definition;
                            if(index != Object.keys(meanings).length){
                                definition += "<br />";
                            }
                        }
                        index++;
                    }
                    result.status = "success";
                    result.definitions = definition;

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
