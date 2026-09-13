import { endpoints } from 'src/lib/axios';

import { baseApi } from './base-api';

// ----------------------------------------------------------------------
// First real injectEndpoints usage in this repo — the base API + axiosBaseQuery
// were already wired up (see src/store/RTK_QUERY_GUIDE.md) but had zero
// endpoints in use anywhere. This is the pattern future feature slices
// (students, teachers, classes, ...) should follow: one small api file per
// resource, injected into the same baseApi/store.
// ----------------------------------------------------------------------

export const schoolConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchoolConfig: builder.query({
      query: (schoolId) => ({ url: endpoints.school.config(schoolId), method: 'GET' }),
      providesTags: (_result, _error, schoolId) => [{ type: 'SchoolConfig', id: schoolId }],
    }),
    updateSchoolConfig: builder.mutation({
      query: ({ schoolId, patch }) => ({
        url: endpoints.school.config(schoolId),
        method: 'PUT',
        data: patch,
      }),
      invalidatesTags: (_result, _error, { schoolId }) => [{ type: 'SchoolConfig', id: schoolId }],
    }),
    resetSchoolConfig: builder.mutation({
      query: (schoolId) => ({ url: endpoints.school.resetConfig(schoolId), method: 'POST' }),
      invalidatesTags: (_result, _error, schoolId) => [{ type: 'SchoolConfig', id: schoolId }],
    }),
  }),
});

export const { useGetSchoolConfigQuery, useUpdateSchoolConfigMutation, useResetSchoolConfigMutation } =
  schoolConfigApi;
