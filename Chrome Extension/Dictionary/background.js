console.log("Background");
chrome.runtime.onMessage.addListener(search);
console.log("Should have searched");
function search(message){
    console.log("Searching... "+message);
    var query = message.term;
    localStorage.setItem("test", query);
    query = query.replace(" ", "");
    query = query.toLowerCase();
    callAPI(getData, query)
}
function getData(result){
    console.log("Called back "+result);
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs){
        chrome.tabs.sendMessage(
            tabs[0].id,
            {response: result},
            function(response) {
                console.log(response.farewell);
              }
        );
    })
}

function callAPI(callback, query){
    console.log("API called");
    var definition="";
    $.getJSON("https://glosbe.com/gapi/translate?from=eng&dest=eng&format=json&phrase="+query+"&callback=?", function( data ) {
        if(data.tuc && data.tuc[0] && data.tuc[0].meanings){
            var count = 0;
            data.tuc[0].meanings.forEach((i, index)=> {
                if(index>=0 && count<3){
                    definition += ++index+". "+i.text+"<br />"
                    count++;
                }
            });
        }else{
            definition = "No result found";
        }
            callback(definition);
        }).fail(function(error, a, b) {
            callback(JSON.stringify(error));
        }
    );
}