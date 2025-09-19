import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('access_token')
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: (search = '') =>
                search ? `orders/?search=${encodeURIComponent(search)}` : 'orders/',
            transformResponse: (response) => {
                return response.order_ids.map((id, idx) => ({
                    id,
                    name: response.order_names[idx]
                }))
            }
        }),
        createOrder: builder.mutation({
            query: (newOrder) => ({
                url: 'orders/create/',
                method: 'POST',
                body: newOrder,
            }),
        }),
    }),
})

export const { useGetOrdersQuery, useLazyGetOrdersQuery, useCreateOrderMutation } = ordersApi
