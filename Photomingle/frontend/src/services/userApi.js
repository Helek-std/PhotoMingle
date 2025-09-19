import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/users/',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('access_token')
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include', // важно для refresh_token в cookies
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
            query: (body) => ({
                url: '2fa/',
                method: 'POST',
                body,
            }),
            transformResponse: (response) => {
                if (response.access_token) {
                    localStorage.setItem('access_token', response.access_token)
                    localStorage.setItem('refresh_token', response.refresh_token)
                }
                return response
            }
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'logout/',
                method: 'GET',
            }),
            transformResponse: () => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
            },
        }),
    }),
})

export const {
    useRegisterMutation,
    useLoginMutation,
    useTwoFactorAuthMutation,
    useLogoutMutation,
} = userApi
