import axios, { AxiosError, AxiosResponse } from 'axios';

export class ServerStartingError extends Error {
  constructor() {
    super('Server is starting up. Please wait...');
    this.name = 'ServerStartingError';
  }
}

const isStartingServerHtml = (data: any) => {
  if (typeof data !== 'string') return false;
  return data.includes('Please wait while your application starts...') || 
         data.includes('<title>Starting Server...</title>');
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async <T>(
  url: string, 
  retries = 5, 
  delay = 2000
): Promise<T> => {
  try {
    const response: AxiosResponse = await axios.get(url);
    
    // Check if the response is the "Starting Server" HTML
    if (isStartingServerHtml(response.data)) {
      if (retries > 0) {
        console.log(`Server is starting, retrying in ${delay}ms... (${retries} retries left)`);
        await sleep(delay);
        return fetchWithRetry(url, retries - 1, delay * 1.5);
      }
      throw new ServerStartingError();
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // If we got HTML back even on an error, it might still be the starting page
      if (isStartingServerHtml(axiosError.response?.data)) {
        if (retries > 0) {
          await sleep(delay);
          return fetchWithRetry(url, retries - 1, delay * 1.5);
        }
        throw new ServerStartingError();
      }
    }
    throw error;
  }
};
