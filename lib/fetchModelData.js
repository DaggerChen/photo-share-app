var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  
  let string;
  return new Promise(function (resolve, reject) {

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = xhrHandler;
    function xhrHandler() {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status !== 200) {
        console.log(this.statusText);
        return;
      }
      string = JSON.parse(this.responseText);
      resolve({ data: string });
    }
    xhr.open("GET", url);
    xhr.send();

    setTimeout(() => reject({ status: 501, statusText: "Not Implemented" }), 2000);

  });
}

export default fetchModel;
