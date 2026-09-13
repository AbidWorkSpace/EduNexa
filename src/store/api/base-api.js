import { createApi } from '@reduxjs/toolkit/query/react';

import axiosInstance from 'src/lib/axios';

import { getAccessToken } from 'src/auth/context/jwt/auth-storage';

// ----------------------------------------------------------------------

/**
 * Custom base query using existing axios instance
 * This ensures consistency with SWR implementations
 *
 * RTK Query uses 'body' in query objects, but axios uses 'data'
 * This function maps 'body' to 'data' for axios compatibility
 */
const axiosBaseQuery = async ({ url, method = 'GET', body, data, params, headers, responseType }) => {
  try {
    const token = typeof window !== 'undefined' ? getAccessToken() : null;

    const requestData = body !== undefined ? body : data;

    const isFormData = requestData instanceof FormData;

    const requestHeaders = { ...headers };
    if (isFormData) {
      delete requestHeaders['Content-Type'];
      delete requestHeaders['content-type'];
    } else {
      requestHeaders['Content-Type'] = 'application/json';
    }
    if (token) {
      requestHeaders.authorization = `Bearer ${token}`;
    }

    const result = await axiosInstance({
      url,
      method,
      data: requestData,
      params,
      headers: requestHeaders,
      responseType,
    });

    return { data: result.data, meta: { headers: result.headers } };
  } catch (axiosError) {
    const error = {
      status: axiosError?.status ?? axiosError?.response?.status,
      data: axiosError?.data ?? axiosError?.response?.data ?? axiosError?.message,
    };
    return { error };
  }
};

// ----------------------------------------------------------------------

const baseQuery = axiosBaseQuery;

// ----------------------------------------------------------------------

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['SchoolConfig'],
  endpoints: () => ({}),
});
