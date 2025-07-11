import https from 'https';

export function fetchStories(url) {
  return new Promise((resolve, reject) => { 
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) { // if not a successful response
        reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
        return;
      }
      res.on('data', chunk => data += chunk); // adding data var with each chunk
      res.on('end', () => {
        console.log("Fetched Stories length:", data.length);
        resolve(data); 
      });
    }).on('error', err => reject(err));
  });
}
