$(document).dblclick(function(){
    dblclickSlection();
});

var selectedText;
function dblclickSlection(){
    flag = 0;
    if (window.getSelection) {
        selectedText = window.getSelection();
    } else if (document.getSelection) {
        selectedText = document.getSelection();
    } else if (document.selection) {
        selectedText = document.selection.createRange().text;
    }
    browser.runtime.sendMessage({"term": selectedText.toString()}).then(handleResponse, handleError);
}
function handleResponse(message){
    console.log("Response received ");
}
function handleError(error){
    console.log("Error: "+error);
}

browser.runtime.onMessage.addListener(function(msg){
    var oRange = selectedText.getRangeAt(0);
    var oRect = oRange.getBoundingClientRect();
    var dictBoxPadding = 10;
    var dictBoxMaxWidth = 350;
    var tooltipDictBox;
    var dictBoxLeftOffset;
    var pageWidth;

    tooltipDictBox = document.getElementById("tooltipDictBox");
    
    if (msg.response == '{"readyState":4,"responseText":"","status":404,"statusText":"Not Found"}') {
        if (tooltipDictBox) {
        tooltipDictBox.remove();
        }
        return;
    }
    
    if(!tooltipDictBox) {
        tooltipDictBox = document.createElement('p');
        tooltipDictBox.id = "tooltipDictBox";
        document.body.appendChild(tooltipDictBox);

        tooltipDictBox.style.boxShadow = "5px 5px 5px #888888";
        tooltipDictBox.style.position = 'absolute'; 
        tooltipDictBox.style.zIndex = "1000"; 
        tooltipDictBox.style.top = oRect.top - tooltipDictBox.style.height+window.scrollY + 'px';
        tooltipDictBox.style.backgroundColor = "#feffce";
        tooltipDictBox.style.padding = dictBoxPadding + "px";
        tooltipDictBox.style.fontFamily = "Arial";
        tooltipDictBox.style.fontSize = "13px";
        tooltipDictBox.style.borderRadius = "0px 5px 5px 5px";
        tooltipDictBox.style.maxWidth = dictBoxMaxWidth + "px";
    }
    dictBoxLeftOffset = oRect.left + oRect.width + window.scrollX + 1;
    pageWidth = $(window).width();

    if ( (dictBoxMaxWidth + dictBoxLeftOffset ) > (pageWidth - dictBoxPadding)) {
      dictBoxLeftOffset = pageWidth - dictBoxMaxWidth - dictBoxPadding;
    }

    tooltipDictBox.style.left = dictBoxLeftOffset + 'px';
    var content = DOMPurify.sanitize(msg.response);
    $(tooltipDictBox).html(content);
});

$(document).click(function(event){
    if(!document.getElementById("tooltipDictBox").contains(event.target)){
        $("#tooltipDictBox").remove();
    }else{
        if(document.getElementById("closeBtnEPD").contains(event.target)){
            $("#tooltipDictBox").remove();
        }
    }
});

