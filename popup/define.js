var test = localStorage.getItem("test");
//console.log(test);
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
    //console.log("Button clicked");
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
    //console.log("Selected text is "+typeof(selectedText));
    search(selectedText.toString());
}
function search(selectedText){
    var str = selectedText;
    //console.log("Selected text inside is "+selectedText);
    //
    if(flag){
        //console.log("Normal search");
        var query = $('#query').val();
    }
    else{
        //console.log("Double click search");
        var query = selectedText;
        $('#query').val(query);
    }
    //console.log("invoked "+query+" "+typeof(query));
    query = query.replace(" ", "");
    query = query.toLowerCase();
    $( "#result" ).html("Searching...");
        //console.log("Loading API");
        var APIurl = "http://api.wordnik.com:80/v4/word.json/"+query+"/definitions?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";
		$.getJSON(APIurl, function( data ) {
			var PrAPIurl = "http://api.wordnik.com:80/v4/word.json/"+query+"/pronunciations?limit=5&includeRelated=true&useCanonical=true&includeTags=false&api_key=bcd982311d2626ed980040462970e1996105e37a799092b7c";
			$.getJSON(PrAPIurl, function( result ) {
				var definition = "";
				definition += "<b>"+query+"</b>&nbsp;";
				pronunciation_str = result[0]["raw"];
				definition += pronunciation_str.substr(1, pronunciation_str.length-2)+"<br />";
				if( data ){
					var count = 0;
					data.forEach((i, index)=> {
						//console.log(index);
						if(index>=0 && count<5){
							definition += ++index+". "+i.text+"<br />"
							count++;
						}
					});
					
					
				}else{
					definition = "No definition found"
				}
				var googleQuery = "https://www.google.com/search?q=define+"+query;
				definition += "<br /><a href='"+googleQuery+"'style='float:left' target='_blank'>More</a>"
				$( "#result" ).html(definition);

				// if(!flag){
				//     $('#popover').attr("title", definition);
				//     $('[data-toggle="tooltip"]').tooltip("show");
				// }
				
			}).fail(function(error, a, b) {
				console.log("Error retrieving data. Check your connection."+error+" "+a+" "+b);
				$( "#result" ).html("Error retrieving data. Check your connection.");
		  });
	});
}

