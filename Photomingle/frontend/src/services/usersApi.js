import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/users/',
        credentials: 'include', // важно, чтобы cookie сессии шли на сервер
    }),
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (body) => ({
                url: 'register/',
                method: 'POST',
                body,
            }),
        }),
        login: builder.mutation({
            query: (body) => ({
                url: 'login/',
                method: 'POST',
                body,
            }),
        }),
        twoFactorAuth: builder.mutation({
            query: (body: { email: string; code: string }) => ({
                url: '2fa/',
                method: 'POST',
                body,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'logout/',
                method: 'POST',
            }),
        }),
        myInfo: builder.query({
            query: () => ({
                url: 'myinfo/',
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useTwoFactorAuthMutation,
    useLogoutMutation,
    useMyInfoQuery,
} = usersApi;
