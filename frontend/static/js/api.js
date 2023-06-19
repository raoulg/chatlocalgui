export async function fetchData(url, method = 'GET', body = null, headers = {}) {
    console.log(url);
    console.log(method);
    console.log(body);

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : null,
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Request to ${url} failed`);
      } else {
        console.log(`Request to ${url} succeeded`);
      }

      return response.json();
    } catch (error) {
      console.error(error);
      throw new Error(`Request to ${url} failed: ${error.message}`);
    }
  }