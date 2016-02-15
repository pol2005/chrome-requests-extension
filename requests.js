var urlFilters = {urls: [ "<all_urls>" ]};
function requestStart(){
    chrome.webRequest.onSendHeaders.addListener(appendEventData, urlFilters, ['requestHeaders']);
    chrome.webRequest.onBeforeRequest.addListener(appendEventData, urlFilters, ['requestBody']);
    chrome.webRequest.onBeforeRedirect.addListener(appendEventData, urlFilters, ['responseHeaders']);
    chrome.webRequest.onCompleted.addListener(appendEventData, urlFilters, ['responseHeaders']);
    //chrome.webRequest.onHeadersReceived.addListener(appendEventData, urlFilters, ['responseHeaders']);
    chrome.webRequest.onErrorOccurred.addListener(appendEventData, urlFilters);
    //chrome.webRequest.onAuthRequired.addListener(appendEventData);
}

function appendEventData(details){
   var t = $('#table').DataTable();
    var response = "";
    var request = "";
    var redirect = "";
    var body = "";
    var method = details.method;
    var url = details.url;
    var id = details.requestId;
    if(!details.requestHeaders && !details.responseHeaders && !details.redirectUrl && !details.requestBody){
        return;
    }
    if(url.startsWith("chrome-extension")){
        return;
    }
    if(details.requestHeaders){
        for(var i = 0;i<details.requestHeaders.length;++i){
            request += details.requestHeaders[i].name + " : " + details.requestHeaders[i].value + "<br>";
        }

    }
    if(details.responseHeaders){
        response = details.statusLine + "<br>";
        for(var i = 0;i<details.responseHeaders.length;++i){
            response += details.responseHeaders[i].name + " : " + details.responseHeaders[i].value + "<br>";
        }
    }
    if(details.redirectUrl){
        redirect = details.statusLine + " Redirection to: " + details.redirectUrl + "<br>";
        for(var i = 0;i<details.responseHeaders.length;++i){
            redirect += details.responseHeaders[i].name + " : " + details.responseHeaders[i].value + "<br>";
        }
    }
    if(details.requestBody){
        for(var values in details.requestBody.formData){
            body += values + " : " + details.requestBody.formData[values] + "<br>";
        }

    }

    var bodyText = "<b>" + "Body" + "</b>" + "<br>";
    var requestText = "<b>" + "Request" + "</b>" +"<br>";
    var responseText = "<b>" + "Response" + "</b>" +"<br>";
    var redirectText = "<b>" + "Redirect" + "</b>" +"<br>";
    if(body == ""){
        bodyText = "";
    }
    if(request == ""){
        requestText = "";
    }
    if(response == ""){
        responseText = "";
    }
    if(redirect == ""){
        redirectText = "";
    }
    var combinedHeader = "<b>" + "Id:" + id + " , " + "Method:" + method + " , " + "Url:" + url + "</b>";
    var combinedBody =  bodyText + body + "<br><br>"  + requestText + request +"<br><br>"  + responseText +  response + "<br><br>" +  redirectText+ redirect;

    if(combinedBody == "<br><br><br><br><br><br>"){
        combinedBody = "";
    }
   t.row.add([
           combinedHeader,
           combinedBody
       ]
   ).draw();



}



$(document).ready( function () {
   var t = $('#table').DataTable({
       "columnDefs": [
           { "visible": false, "targets": 0 }
       ],
       "order": [[ 0, 'asc' ]],
       "displayLength": 25,
       "drawCallback": function ( settings ) {
           var api = this.api();
           var rows = api.rows( {page:'current'} ).nodes();
           var last=null;

           api.column(0, {page:'current'} ).data().each( function ( group, i ) {
               if (last !== group) {
                   $(rows).eq(i).before(
                       '<tr class="group"><td colspan="1">' + group + '</td></tr>'
                   );

                   last = group;
               }
           });
       }
   });
    //order by header
    $('#table tbody').on( 'click', 'tr.group', function () {
        var currentOrder = t.order()[0];
        if ( currentOrder[0] === 0 && currentOrder[1] === 'asc' ) {
            t.order( [ 0, 'desc' ] ).draw();
        }
        else {
            t.order( [ 0, 'asc' ] ).draw();
        }
    } );
   requestStart();
} );