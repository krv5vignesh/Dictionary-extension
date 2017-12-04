$(document).dblclick(function(){
    console.log("double clicked");
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
    chrome.runtime.sendMessage({"term": selectedText.toString()}, handleResponse);
}
function handleResponse(message){
    console.log("Response received ");
}
function handleError(error){
    console.log("Error: "+error);
}

chrome.runtime.onMessage.addListener(function(msg){
    oRange = selectedText.getRangeAt(0);
    oRect = oRange.getBoundingClientRect();
    if(document.getElementById("tooltipDictBox"))
        $("#tooltipDictBox").remove();
    var div = document.createElement('p');  
    div.innerHTML = msg.response;
    div.setAttribute("id", "tooltipDictBox")
    div.style.boxShadow = "5px 5px 5px #888888";
    div.style.position = 'absolute';  
    div.style.top = oRect.top-div.style.height+window.scrollY + 'px'; 
    div.style.left = oRect.left+oRect.width+window.scrollX+1 + 'px';
    div.style.backgroundColor = "#feffce";
    div.style.padding = "10px";
    div.style.fontSize = "13px";
    div.style.borderRadius = "0px 5px 5px 5px";
    document.body.appendChild(div);
});

$(document).click(function(event){
    if(document.getElementById("tooltipDictBox"))
        if(!document.getElementById("tooltipDictBox").contains(event.target)){
            $("#tooltipDictBox").remove();
        }
});
// $(document).click(function(event){
//     console.log(event);
//     $('#tooltipDictBox').remove();
// });
