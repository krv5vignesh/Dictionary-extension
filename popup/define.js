(function() {
    /* global $ */

    var recentSearch;
    var queryPrefix = "https://www.google.com/search?q=define+";
    /* FIXME: this file has duplicate functions:
    * e.g. formatResponse, getDefinition
    * This should be improved.
    */
    function formatResponse(result) {
        var resultHtml = "",
            definitions;
        var googleQuery, searchMore;

        resultHtml += "<b>" + result.searchText + "</b>&nbsp";
        if (result.pronounciation) {
            resultHtml += result.pronounciation;
        }
        resultHtml +=
            '<a id="closeBtnEPD" style="float:right;padding:2px 5px;color:grey">X</i></a><br/><br/>';

        definitions = result.definitions.reduce(function(defHtml, def, id) {
            return defHtml + (id + 1) + "." + def + "<br/>";
        }, "");

        googleQuery = queryPrefix + result.searchText;
        searchMore =
            "<br/><a href='" +
            googleQuery +
            "'style='float:left; color:#1a0dab' target='_blank'>More</a>";
        resultHtml += definitions + searchMore;

        return resultHtml;
    }

    function updateDom(result) {
        if (result.status !== "success") {
            $("result").html("Error while fetching definitions");
        }

        $("#result").html(formatResponse(result));
    }

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

    function requestDefinition(searchText) {
        searchText = (searchText || "").toString().trim();

        // skip search on multi words select
        if (/\s+/.test(searchText)) {
            return;
        }

        localStorage.setItem("recentSearchText", searchText);
        getDefinition(searchText, updateDom);
    }

    //Get search engine url
    browser.storage.sync.get().then((data) => {
        queryPrefix = data.searchEngineUrl;
    });

    // enter-key listener
    document.getElementById("query").addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            requestDefinition($("#query").val());
        }
    });

    // click listener
    document
        .getElementById("submitButton")
        .addEventListener("click", function() {
            requestDefinition($("#query").val());
        });

    // double click listener for recursive search
    $(document).dblclick(function() {
        var selectedText;

        if (window.getSelection) {
            selectedText = window.getSelection();
        } else if (document.getSelection) {
            selectedText = document.getSelection();
        } else if (document.selection) {
            selectedText = document.selection.createRange().text;
        }

        requestDefinition(selectedText);
    });

    // load recent search in init
    recentSearch = localStorage.getItem("recentSearchText");
    if (recentSearch) {
        requestDefinition(recentSearch);
    }
    document.getElementById("query").focus();
})();
