import axios from 'axios';
import { API_URL } from '../lib/constant';

const GET_CACHE_TTL_MS = 60 * 1000;
const getResponseCache = new Map();
const pendingGetRequests = new Map();

const getTokenFromStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('BHARAT_TOKEN');
  const rawToken = adminToken || userToken;

  if (!rawToken || rawToken === 'undefined' || rawToken === 'null') {
    return null;
  }

  const normalizedToken = String(rawToken).trim().replace(/^"|"$/g, '');
  if (!normalizedToken) {
    return null;
  }

  return normalizedToken.startsWith('Bearer ')
    ? normalizedToken.slice(7).trim()
    : normalizedToken;
};

async function apiServiceHandler(method, endpoint, payload) {
  const token = getTokenFromStorage();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const normalizedMethod = String(method || '').toUpperCase();
  const requestUrl = `${API_URL}/${endpoint}`;
  const cacheKey = `${token || 'anonymous'}::${requestUrl}`;

  try {
    let response;
    if (normalizedMethod === 'GET') {
      const cachedEntry = getResponseCache.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < GET_CACHE_TTL_MS) {
        return cachedEntry.data;
      }

      const pendingRequest = pendingGetRequests.get(cacheKey);
      if (pendingRequest) {
        return pendingRequest;
      }

      const requestPromise = axios({
        method: 'get',
        url: requestUrl,
        headers
      })
        .then((axiosResponse) => {
          const responseData = axiosResponse.data;
          getResponseCache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
          });
          return responseData;
        })
        .finally(() => {
          pendingGetRequests.delete(cacheKey);
        });

      pendingGetRequests.set(cacheKey, requestPromise);
      return requestPromise;

    } else if (normalizedMethod === 'POST') {

      response = await axios({
        method: 'post',
        url: requestUrl,
        headers,
        data: payload
      });
      getResponseCache.clear();

    } else if (normalizedMethod === 'PUT') {
      
      response = await axios({
        method: 'put',
        url: requestUrl,
        headers,
        data: payload
      });
      getResponseCache.clear();

    }
    else if (normalizedMethod === 'DELETE') {

      response = await axios({
        method: 'delete',
        url: requestUrl,
        headers,
        data: payload
      });
      getResponseCache.clear();

    }
    else {
      throw new Error('Unsupported HTTP method');
    }

    return response.data;
  } catch (error) {
    // Extract and throw a proper error message
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An error occurred');
    }
  }
}

export default apiServiceHandler;
