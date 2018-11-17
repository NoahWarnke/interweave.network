
export default {
  
  getAjax: function(url, timeout) {
    return new Promise((resolve, reject) => {
      
      let xhr = new XMLHttpRequest();
      
      let interval = setInterval(() => {
        xhr.abort();
      }, timeout);
      
      xhr.addEventListener("load", function() {
        if (xhr.status !== 200) {
          cancelInterval(interval);
          reject(url + " replied " + xhr.status);
        }
        resolve(xhr.responseText);
      });
      xhr.addEventListener("error", function(err) {
        cancelInterval(interval);
        reject(err);
      });
      xhr.addEventListener("abort", function(progresEvent) {
        clearInterval(interval);
        reject(timeout + "ms timeout was reached.");
      });
      xhr.open("GET", url);
      xhr.send();
    });
  }
  
}
