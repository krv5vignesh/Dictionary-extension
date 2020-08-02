(function() {
    /* global $, browser, DOMPurify*/

    // show definition for only the latest selection
    var recentSelection = {
        text: "",
        region: {},
    };
    var reusePopup = false;
    var queryPrefix = "https://www.google.com/search?q=define+";
    
    function formatResponse(result) {
        result.googleQuery = queryPrefix + result.searchText;

        if (result.status === "fail") {
            result.definitions = "No definition found.";
            result.pronounciation = "";
            return result;
        }
        
        return result;
    }

    // Default settings
    var dictionarySettings = {
        theme: {
            value: "auto", //light/dark/auto
        },
    };

    //Get Theme
    function logError(err) {
        console.error(err);
    }

    function updateSettings(dbData) {
        dbData = dbData || {};
        dictionarySettings = $.extend(dictionarySettings, dbData);
    }

    browser.storage.sync.get().then(updateSettings, logError);

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

        browser.storage.sync.get().then(updateSettings, logError);

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

        //Draw popup and then send request
        if (true) {
            var textRegion = recentSelection.region;
            var oRect = textRegion.getRangeAt(0).getBoundingClientRect();

            var tooltipDictBox, tooltipDictBoxHeight;
            var leftOffset, topOffset;
            var pageWidth, pageHeight;

            // create
            tooltipDictBox = $(purify(tooltipDictBoxHtml));
            $("body").append(tooltipDictBox);
            // insert css
            $("#tooltipDictBox").css(tooltipDictBoxCss);
            $("#tooltipTitleHolder").css(tooltipTitleHolderCss);
            $("#searchTextTitle").css(searchTextTitleCss);
            $("#searchMoreLink").css(searchMoreLinkCss);
            $("#searchDefinitions").css(searchDefinitionsCss);
            $("#closeBtnEPD").css(closeBtnEPDCss);
            
            $("#searchPronounciation").css("display", "none");
            $("#tooltipTitleHolder").css("display", "none");
            $("#searchMoreLink").css("display", "none");
            $("#searchTextTitle").css("display", "none");
            $("#searchDefinitions").html("Searching...");

            if(dictionarySettings.theme){
                var theme = getTheme(dictionarySettings.theme);
                $("#tooltipDictBox").css(textThemes[theme]);
                $("#searchDefinitions").css(textThemes[theme]);
                $("#searchTextTitle").css(textThemes[theme]);
                $("#searchPronounciation").css(textThemes[theme]);
                $("#searchMoreLink").css(searchMoreLinkThemes[theme]);
            }

            $("#tooltipDictBox").show();

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
        }

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
        font: "normal 14px/28px Arial",
        borderRadius: "0px 5px 5px 5px",
        maxWidth: maxWidth + "px",
        minWidth: "200px",
        minHeight: "60px",
    };

    var textThemes = {
        dark: {
            backgroundColor: "#343a40",
            color: "white",
        },
        light: {
            backgroundColor: "#feffce",
            color: "black",
        },
    };

    var tooltipTitleHolderCss = {
        paddingBottom: "12px",
    };

    var searchTextTitleCss = {
        font: "bold 14px/28px Arial",
        display: "inline",
    };

    var searchDefinitionsCss = {
        font: "normal 14px/26px Arial",
    };

    var closeBtnEPDCss = {
        color: "grey",
        cursor: "pointer",
        float: "right",
        borderRadius: "12px",
        height: "30px",
        width: "30px",
        font: "normal 13px/17px Arial",
        border: "none",
        margin: 0,
        padding: "6px 12px",
        backgroundColor: "whitesmoke",
        textTransform: "lowercase",
    };

    var searchMoreLinkCss = {
        float: "left",
        color: "#1a0dab",
        font: "normal 14px/28px Arial",
    };

    var searchMoreLinkThemes = {
        dark: {
            color: "lightblue",
        },
        light: {
            color: "#1a0dab",
        },
    };

    function purify(html) {
        return DOMPurify.sanitize(html, {
            SAFE_FOR_JQUERY: true,
            ADD_ATTR: ["target"],
        });
    }

    function getTheme(theme) {
        var hours;

        if (theme.value !== "auto") {
            return theme.value;
        }

        hours = new Date().getHours();
        if (hours < 6 || hours > 20) {
            return "dark";
        }
        return "light";
    }

    browser.runtime.onMessage.addListener(function(response) {
        if (response.search.searchText !== recentSelection.text) {
            $("#tooltipDictBox").hide();
            return;
        }

        var searchData;
        var textRegion = recentSelection.region;
        var oRect = textRegion.getRangeAt(0).getBoundingClientRect();

        var tooltipDictBox, tooltipDictBoxHeight;
        var leftOffset, topOffset;
        var pageWidth, pageHeight;

        tooltipDictBox = $("#tooltipDictBox");

        // update theme
        if (response.db && response.db.theme) {
            var theme = getTheme(response.db.theme);
            $("#tooltipDictBox").css(textThemes[theme]);
            $("#searchDefinitions").css(textThemes[theme]);
            $("#searchTextTitle").css(textThemes[theme]);
            $("#searchPronounciation").css(textThemes[theme]);
            $("#searchMoreLink").css(searchMoreLinkThemes[theme]);
        }
        // update searchQuery
        if (response.db && response.db.searchEngineUrl) {
            queryPrefix = response.db.searchEngineUrl;
        }

        // update html
        $("#tooltipTitleHolder").css("display", "");
        $("#searchPronounciation").css("display", "");
        $("#searchMoreLink").css("display", "");
        $("#searchTextTitle").css("display", "inline");
        $("#tooltipDictBox").show();
        searchData = formatResponse(response.search);
        $("#searchTextTitle").html(searchData.searchText);
        $("#searchPronounciation").html(searchData.pronounciation || "");
        $("#searchDefinitions").html(searchData.definitions);
        $("#searchMoreLink").prop("href", searchData.googleQuery);

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