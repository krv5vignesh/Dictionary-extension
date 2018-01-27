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
    var APIurl = "http://api.wordnik.com:80/v4/word.json/"+query+"/definitions?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";
    $.getJSON(APIurl, function( data ) {
        if(typeof data != 'undefined' && data.length > 0){
            console.log(data);
            var count = 0;
            definition += "<b>"+query+"</b><a id='closeBtnEPD' style='float:right;padding:2px 5px;color:grey'>X</a><br /><br />";
            data.forEach((i, index)=> {
                //console.log(index);
                if(index>=0 && count<3){
                    //console.log("Inside "+i.text.status);
                    definition += ++index+". "+i.text+"<br />";
                    count++;
                }
            });
            var googleQuery = "https://www.google.com/search?q=define+"+query;
            definition += "<br /><a href='"+googleQuery+"'style='float:left; color:#1a0dab' target='_blank'>More</a>"
        }else{
            console.log("No definition")
            definition = "No definition found <a id='closeBtnEPD' style='float:right;padding:2px 5px;color:grey'>X</a><br/><br/>";
            var googleQuery = "https://www.google.com/search?q=define+"+query;
            definition += "<a href='"+googleQuery+"'style='float:left; color:#1a0dab' target='_blank'>Search</a>"
        }
        callback(definition);
        }).fail(function(error, a, b) {
            console.log("Invalid selection");
        }
    );
}