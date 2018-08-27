(function() {
    /* global $, browser, DOMPurify*/

    // show definition for only the latest selection
    var recentSelection = {
        text: "",
        region: {},
    };
    var reusePopup = false;

    function formatResponse(result) {
        var queryPrefix = "https://www.google.com/search?q=define+";

        result.googleQuery = queryPrefix + result.searchText;

        if (result.status === "fail") {
            result.definitions = "No definition found";
            result.pronounciation = "";
            return result;
        }

        result.definitions = result.definitions
            .map(function(def, i) {
                var id = i + 1;
                return id + ". " + def;
            })
            .join("<br/>");

        return result;
    }

    $(document).dblclick(function(event) {
        var selectedObj;
        var tooltipDictBox;

        if (window.getSelection) {
            selectedObj = window.getSelection();
        } else if (document.getSelection) {
            selectedObj = document.getSelection();
        } else if (document.selection) {
            selectedObj = document.selection.createRange().text;
        }

        tooltipDictBox = document.getElementById("tooltipDictBox");
        if (tooltipDictBox && tooltipDictBox.contains(event.target)) {
            reusePopup = true;
        } else {
            reusePopup = false;
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

    var tooltipDictBoxHtml =
        '<div id="tooltipDictBox">\
            <div id="tooltipTitleHolder">\
                <p id="searchTextTitle"></p>\
                <span id="searchPronounciation"></span>\
                <button id="closeBtnEPD">x</button><br/>\
            </div>\
            <p id="searchDefinitions"></p>\
            <div id="tooltipDictBoxFooter">\
                <a href="" id="searchMoreLink" target="_blank">More</a>\
            </div>\
        </div>';

    var dictBoxPadding = 10;
    var maxWidth = 350;

    var tooltipDictBoxCss = {
        boxShadow: "5px 5px 5px #888888",
        position: "absolute",
        zIndex: "999999",
        backgroundColor: "#feffce",
        padding: dictBoxPadding + "px",
        fontFamily: "Arial",
        fontSize: "14px",
        borderRadius: "0px 5px 5px 5px",
        maxWidth: maxWidth + "px",
        minWidth: "200px",
        minHeight: "60px",
    };

    var tooltipTitleHolderCss = {
        paddingBottom: "12px",
    };

    var searchTextTitleCss = {
        fontFamily: "Open Sans",
        fontWeight: 600,
        display: "inline",
        fontSize: "13px",
    };

    var closeBtnEPDCss = {
        color: "grey",
        cursor: "pointer",
        float: "right",
        borderRadius: "12px",
        height: "24px",
        fontSize: "14px",
        border: "none",
    };

    var searchMoreLinkCss = {
        float: "left",
        color: "#1a0dab",
    };

    function purify(html) {
        return DOMPurify.sanitize(html, {
            SAFE_FOR_JQUERY: true,
            ADD_ATTR: ["target"],
        });
    }

    browser.runtime.onMessage.addListener(function(msg) {
        if (msg.searchText !== recentSelection.text) {
            return;
        }

        var textRegion = recentSelection.region;
        var oRect = textRegion.getRangeAt(0).getBoundingClientRect();

        var tooltipDictBox, tooltipDictBoxHeight;
        var leftOffset, topOffset;
        var pageWidth, pageHeight;

        tooltipDictBox = $("#tooltipDictBox");

        if (!tooltipDictBox.length) {
            // create
            tooltipDictBox = $(purify(tooltipDictBoxHtml));
            $("body").append(tooltipDictBox);
            // insert css
            $("#tooltipDictBox").css(tooltipDictBoxCss);
            $("#tooltipTitleHolder").css(tooltipTitleHolderCss);
            $("#searchTextTitle").css(searchTextTitleCss);
            $("#searchMoreLink").css(searchMoreLinkCss);
            $("#closeBtnEPD").css(closeBtnEPDCss);
        }

        // update html
        $("#tooltipDictBox").show();
        msg = formatResponse(msg);
        $("#searchTextTitle").html(msg.searchText);
        $("#searchPronounciation").html(msg.pronounciation || "");
        $("#searchDefinitions").html(msg.definitions);
        $("#searchMoreLink").prop("href", msg.googleQuery);

        // do not alter position for recursive click in popups
        if (!reusePopup) {
            pageWidth = $(window).width();
            pageHeight = $(window).height();
            tooltipDictBoxHeight = tooltipDictBox.height();
            // adjust top/left position
            leftOffset = oRect.left + oRect.width + 1 + dictBoxPadding;
            if (maxWidth + leftOffset > pageWidth - dictBoxPadding) {
                leftOffset = pageWidth - maxWidth - dictBoxPadding;
            }
            topOffset = oRect.top;
            if (topOffset + tooltipDictBoxHeight > pageHeight) {
                topOffset -= tooltipDictBoxHeight;
            }
            leftOffset += window.scrollX;
            topOffset += window.scrollY;
            $("#tooltipDictBox").css({ top: topOffset, left: leftOffset });
        }
    });

    $(document).click(function(event) {
        var tooltipDictBox = document.getElementById("tooltipDictBox");
        var closeBtn = document.getElementById("closeBtnEPD");

        if (!tooltipDictBox) {
            // tooltip not available, just ignore
        } else if (!tooltipDictBox.contains(event.target)) {
            $("#tooltipDictBox").hide();
        } else if (closeBtn.contains(event.target)) {
            $("#tooltipDictBox").hide();
        }
    });
})();
