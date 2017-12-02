browser.runtime.onMessage.addListener(search);

function search(message){
    var query = message.term;
    localStorage.setItem("test", query);
    query = query.replace(" ", "");
    query = query.toLowerCase();
    callAPI(getData, query)
}
function getData(result){
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(function(tabs){
        browser.tabs.sendMessage(
            tabs[0].id,
            {response: result}
        );
    })
}

function callAPI(callback, query){
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