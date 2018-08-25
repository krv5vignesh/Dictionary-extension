(function() {
    /* global $, browser, DOMPurify */

    // show definition for only the latest selection
    var recentSelection = {
        text: "",
        region: {},
    };

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

        googleQuery =
            "https://www.google.com/search?q=define+" + result.searchText;
        searchMore =
            "<br/><a href='" +
            googleQuery +
            "'style='float:left; color:#1a0dab' target='_blank'>More</a>";
        resultHtml += definitions + searchMore;

        return resultHtml;
    }

    $(document).dblclick(function() {
        var selectedObj;

        if (window.getSelection) {
            selectedObj = window.getSelection();
        } else if (document.getSelection) {
            selectedObj = document.getSelection();
        } else if (document.selection) {
            selectedObj = document.selection.createRange().text;
        }

        requestDefinition(selectedObj);
    });

    function requestDefinition(selectedObj) {
        var searchText = selectedObj.toString().trim();
        // skip search on nothing/multi words select
        if (searchText.length === 0 || /\s+/.test(searchText)) {
            return;
        }
        // save regions for later use
        recentSelection.region = selectedObj;
        recentSelection.text = searchText;
        browser.runtime.sendMessage({ searchText: searchText });
    }

    browser.runtime.onMessage.addListener(function(msg) {
        if (
            msg.searchText !== recentSelection.text ||
            msg.status !== "success"
        ) {
            return;
        }

        var textRegion = recentSelection.region;
        var oRect = textRegion.getRangeAt(0).getBoundingClientRect();
        var dictBoxPadding = 10;
        var dictMinHeight = 200;
        var dictBoxMaxWidth = 350;
        var tooltipDictBox;
        var dictBoxLeftOffset;
        var pageWidth;

        tooltipDictBox = document.getElementById("tooltipDictBox");

        if (!tooltipDictBox) {
            tooltipDictBox = document.createElement("p");
            tooltipDictBox.id = "tooltipDictBox";
            document.body.appendChild(tooltipDictBox);

            tooltipDictBox.style.boxShadow = "5px 5px 5px #888888";
            tooltipDictBox.style.position = "absolute";
            tooltipDictBox.style.zIndex = "999999";
            tooltipDictBox.style.top =
                oRect.top - tooltipDictBox.style.height + window.scrollY + "px";
            tooltipDictBox.style.backgroundColor = "#feffce";
            tooltipDictBox.style.padding = dictBoxPadding + "px";
            tooltipDictBox.style.fontFamily = "Arial";
            tooltipDictBox.style.fontSize = "13px";
            tooltipDictBox.style.borderRadius = "0px 5px 5px 5px";
            tooltipDictBox.style.maxWidth = dictBoxMaxWidth + "px";
            tooltipDictBox.style.minHeight = dictMinHeight + "px";

            dictBoxLeftOffset = oRect.left + oRect.width + window.scrollX + 1;
            pageWidth = $(window).width();
            if (
                dictBoxMaxWidth + dictBoxLeftOffset >
                pageWidth - dictBoxPadding
            ) {
                dictBoxLeftOffset =
                    pageWidth - dictBoxMaxWidth - dictBoxPadding;
            }

            tooltipDictBox.style.left = dictBoxLeftOffset + "px";
        }

        var content = DOMPurify.sanitize(formatResponse(msg), {
            SAFE_FOR_JQUERY: true,
            ADD_ATTR: ["target"],
        });

        $(tooltipDictBox).html(content);
    });

    $(document).click(function(event) {
        var tooltipDictBox = document.getElementById("tooltipDictBox");
        var closeBtn = document.getElementById("closeBtnEPD");

        if (!tooltipDictBox) {
            // tooltip not available, just ignore
        } else if (!tooltipDictBox.contains(event.target)) {
            $("#tooltipDictBox").remove();
        } else if (closeBtn.contains(event.target)) {
            $("#tooltipDictBox").remove();
        }
    });
})();
