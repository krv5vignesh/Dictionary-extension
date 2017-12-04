var test = localStorage.getItem("test");
console.log(test);
if(test){
    search(test);
    localStorage.removeItem("test");
}
var selectedText = "";
var flag=1;
document.getElementById("query").focus();
document.getElementById("query").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        flag = 1;
        document.getElementById("submitButton").click();
    }
});
document.getElementById("submitButton").addEventListener("click", function(event) {
    console.log("Button clicked");
    flag = 1;
    search("");
  });
$(document).dblclick(function(){
    setTimeout(() => {dblclickSlection();}, 300);
});
function dblclickSlection(){
    flag = 0;
    if (window.getSelection) {
        selectedText = window.getSelection();
    } else if (document.getSelection) {
        selectedText = document.getSelection();
    } else if (document.selection) {
        selectedText = document.selection.createRange().text;
    }
    console.log("Selected text is "+typeof(selectedText));
    search(selectedText.toString());
}
function search(selectedText){
    var str = selectedText;
    console.log("Selected text inside is "+selectedText);
    //
    if(flag){
        console.log("Normal search");
        var query = $('#query').val();
    }
    else{
        console.log("Double click search");
        var query = selectedText;
        $('#query').val(query);
    }
    console.log("invoked "+query+" "+typeof(query));
    query = query.replace(" ", "");
    query = query.toLowerCase();
    $( "#result" ).html("Searching...");
    //$("#dictionary").load("https://www.google.com/search?q=define+"+query+" #dictionary-modules");
    //window.open("https://www.google.com/search?q=define+"+query+" #dictionary-modules", "", "location=no, scrollbars=no resizable=no,width=620,height=400");
    //var APIkey = "dict.1.1.20171128T091000Z.5f4042af6f211f39.9640ec2af29124a49fd0526659affdb8bf29dea7";
    //$.get("https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key="+APIkey+"&lang=en-en&text="+query, function( data ) {
       $.getJSON("https://glosbe.com/gapi/translate?from=eng&dest=eng&format=json&phrase="+query+"&callback=?", function( data ) {
        var definition = "";
        if(data.tuc && data.tuc[0] && data.tuc[0].meanings){
            var count = 0;
            data.tuc[0].meanings.forEach((i, index)=> {
                console.log(index);
                if(index>=0 && count<5){
                    definition += ++index+". "+i.text+"<br />"
                    count++;
                }
            });
        }else{
            definition = "No result found"
        }
        $( "#result" ).html(definition);

        // if(!flag){
        //     $('#popover').attr("title", definition);
        //     $('[data-toggle="tooltip"]').tooltip("show");
        // }
        
        console.log(data);
    }).fail(function(error, a, b) {
        console.log("Error retrieving data. Check your connection."+error+" "+a+" "+b);
        $( "#result" ).html("Error retrieving data. Check your connection.");
  });
}

