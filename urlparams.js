/**
 * http://stackoverflow.com/a/10997390/11236
 */
function updateUrlParameter(param, paramVal, onlySingleParam) {
  let otherParams = "";
  let urlParts = window.location.href.split("?");
  let baseString = urlParts[0];
  let paramString = urlParts[1];
  let separator = "";
  if (!onlySingleParam && paramString) {
      params = paramString.split("&");
      for (var i = 0; i < params.length; i++){
          if(params[i].split('=')[0] != param){
              otherParams += separator + params[i];
              separator = "&";
          }
      }
  }

  let changedParam = separator.concat(param, "=", paramVal);
  window.history.replaceState(
    '', 
    '', 
    baseString.concat("?", otherParams, changedParam)
  );
}

function getUrlParameter(param) {
  let urlParts = window.location.href.split("?");
  let baseString = urlParts[0];
  let paramString = urlParts[1];
  if (paramString) {
      params = paramString.split("&");
      for (var i = 0; i < params.length; i++){
          let paramParts = params[i].split('=');
          if(paramParts[0] == param && paramParts.length > 1){
              // might have '=' in the value itself.
              return paramParts.slice(1).join('=');
          }
      }
  }
  return null;
}
