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
        getOrderById: builder.query({
            query: (orderId) => ({
                url: `/orders/${orderId}/`,
                method: "GET",
            }),
            providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
        }),

        deleteOrderImage: builder.mutation({
            query: ({ orderId, imageId }) => ({
                url: `/orders/${orderId}/`,
                method: "DELETE",
                body: { image_id: imageId },
            }),
            invalidatesTags: (result, error, { orderId }) => [{ type: "Order", id: orderId }],
        }),

        completeOrder: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/`,
                method: "POST",
            }),
            invalidatesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
        }),
        getPrintFormats: builder.query({
            query: () => 'formats/',
        }),
    }),
})

export const {
    useGetOrdersQuery,
    useCreateOrderMutation,
    useGetOrderByIdQuery,
    useDeleteOrderImageMutation,
    useCompleteOrderMutation,
    useGetPrintFormatsQuery
} = ordersApi;
