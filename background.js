/* global $, browser */
browser.runtime.onMessage.addListener(search);

function search(message) {
    var query = message.term;
    localStorage.setItem("test", query);
    query = query.replace(" ", "");
    query = query.toLowerCase();
    callAPI(getData, query);
}
function getData(result) {
    browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then(function(tabs) {
            browser.tabs.sendMessage(tabs[0].id, { response: result });
        });
}
function callAPI(callback, query) {
    var definition = "";
    var APIurl =
        "http://api.wordnik.com:80/v4/word.json/" +
        query +
        "/definitions?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";
    $.getJSON(APIurl, function(data) {
        var PrAPIurl =
            "http://api.wordnik.com:80/v4/word.json/" +
            query +
            "/pronunciations?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";
        $.getJSON(PrAPIurl, function(result) {
            var googleQuery;
            var pronunciation_str = result[0]["raw"];
            pronunciation_str =
                "(" +
                pronunciation_str.substr(1, pronunciation_str.length - 2) +
                ")";
            definition +=
                "<b>" +
                query +
                "</b> " +
                pronunciation_str +
                "<p id='closeBtnEPD' style='float:right;padding:2px 5px;'>X</p><br /><br />";

            // console.log(definition);
            if (typeof data != "undefined" && data.length > 0) {
                // console.log(data);
                var count = 0;
                data.forEach((i, index) => {
                    //console.log(index);
                    if (index >= 0 && count < 3) {
                        //console.log("Inside "+i.text.status);
                        definition += ++index + ". " + i.text + "<br />";
                        count++;
                    }
                });
                googleQuery = "https://www.google.com/search?q=define+" + query;
                definition +=
                    "<br /><a href='" +
                    googleQuery +
                    "'style='float:left; color:#1a0dab' target='_blank'>More</a>";
            } else {
                // console.log("No definition");
                definition =
                    "No definition found <a id='closeBtnEPD' style='float:right;padding:2px 5px;color:grey'>X</i></a><br/><br/>";
                googleQuery = "https://www.google.com/search?q=define+" + query;
                definition +=
                    "<a href='" +
                    googleQuery +
                    "'style='float:left; color:#1a0dab' target='_blank'>Search</a>";
            }
            callback(definition);
        }).fail(function() {
            // console.log("Invalid selection");
        });
    }).fail(function() {
        // console.log("Invalid selection");
    });
}
