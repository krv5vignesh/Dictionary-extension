(function() {
    /* global browser, $*/

    // Default settings
    var dictionarySettings = {
        theme: {
            value: "auto", //light/dark/auto
        },
        searchEngineUrl : "https://www.google.com/search?q=define+"
    };

    $("#success-message").hide();

    function logError(err) {
        console.error(err);
    }

    function updateUi(data) {
        dictionarySettings = $.extend(true, dictionarySettings, data);
        var theme = dictionarySettings.theme.value;
        $("input[name=dictionaryTheme][value=" + theme + "]").prop(
            "checked",
            true
        );
    }

    function saveOptions(event) {
        event.preventDefault;
        var settings = $.extend(true, {}, dictionarySettings);
        settings.theme.value = $("input[name=dictionaryTheme]:checked").val();
        settings.searchEngineUrl = $("#search-engine").val();
        browser.storage.sync.set(settings).catch(logError);
        $("#success-message").show();
    }

    $("#dictionary-settings-save-btn").click(saveOptions);
    browser.storage.sync.get().then(updateUi, logError);
})();
