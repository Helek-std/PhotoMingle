import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift() || null;
    }
    return null;
}

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
            query: (body: { all?: boolean } = { all: false }) => {
                const csrfToken = getCookie('csrftoken')
                return {
                    url: 'logout/',
                    method: 'POST',
                    body,
                    headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
                }
            },
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
