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
        
        googleQuery = queryPrefix + result.searchText;
        searchMore =
            "<br/><a href='" +
            googleQuery +
            "'style='float:left; color:#1a0dab' target='_blank'>More</a>";

        resultHtml += "<b>" + result.searchText + "</b>&nbsp";

        if(result.status === "fail")
            return resultHtml + "<br /><br />No definition found.<br />" + searchMore;
        
        if (result.pronounciation) {
            resultHtml += result.pronounciation;
        }
        resultHtml +=
            '<a id="closeBtnEPD" style="float:right;padding:2px 5px;color:grey">X</i></a><br/><br/>';

        definitions = result.definitions + "<br />";

        
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
        var definitionApi = "https://api.dictionaryapi.dev/api/v2/entries/en/" + searchText;
        //var definitionApi = "https://googledictionaryapi.eu-gb.mybluemix.net/?define=" + searchText;

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
    // recentSearch = localStorage.getItem("recentSearchText");
    // if (recentSearch) {
    //     requestDefinition(recentSearch);
    // }
    document.getElementById("query").focus();
})();
