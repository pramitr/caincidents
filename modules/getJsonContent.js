let getJsonContent = (url, path, shouldUseIp, userIp) => {
  //path is null when shouldUseIp is false
	return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    let requestOption;
    if (shouldUseIp) {
      requestOption = {
        hostname: url,
        path: path,
        headers: {
          'X-Forwarded-For': userIp
        }
      };
    } else {
      requestOption = url;
    }
    const request = lib.get(requestOption, (response) => {
      let body = "";
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      response.on('data', (chunk) => body += chunk);
      response.on('end', () => {
        resolve(parseJson(body));
      });
    }).on('error', (err) => {
      console.error(err.message);
      reject(err);
    })
    })
}

let parseJson = (body) => {
  try {
    let jsonBody = JSON.parse(body);
    return jsonBody;
  } catch (error) {
    console.error(error.message);
    return "";
  };
}



module.exports = getJsonContent;