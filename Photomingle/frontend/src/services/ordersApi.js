import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

export const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/',
        prepareHeaders: (headers) => {
            const csrfToken = getCookie("csrftoken");
            if (csrfToken) {
                headers.set("X-CSRFToken", csrfToken);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: ({ search = '', admin_request = false } = {}) => {
                let url = 'orders/';

                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (admin_request) params.append('admin_request', 'true');

                return `${url}?${params.toString()}`;
            },
            transformResponse: (response) => {
                return response.order_ids.map((id, idx) => ({
                    id,
                    name: response.order_names[idx],
                    user: response.order_users[idx],
                    status: response.order_status[idx],
                }));
            },
            providesTags: ['Orders'],
        }),
        createOrder: builder.mutation({
            query: (newOrder) => ({
                url: 'orders/create/',
                method: 'POST',
                body: newOrder,
            }),
            invalidatesTags: ['Orders'],
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
                url: `/orders/${orderId}/delete-image/`,
                method: "DELETE",
                body: { image_id: imageId },
            }),
            invalidatesTags: ['Orders'],
        }),
        deleteOrder: builder.mutation({
            query: (orderId) => ({
                url: `/orders/delete/${orderId}/`,
                method: "DELETE",
            }),
            invalidatesTags: ['Orders'],
        }),
        completeOrder: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/`,
                method: "POST",
            }),
            invalidatesTags: ["Orders"],
        }),
        getPrintFormats: builder.query({
            query: () => 'formats/',
            providesTags: ["PrintFormat"],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderId, status }) => ({
                url: `/orders/update_status/${orderId}/`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Orders'],
        }),
        addFormat: builder.mutation({
            query: (newFormat) => ({
                url: "/formats/add/",
                method: "POST",
                body: newFormat,
            }),
            invalidatesTags: ["PrintFormat"],
        }),

        editFormat: builder.mutation({
            query: ({ id, ...updatedData }) => ({
                url: `/formats/edit/${id}/`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["PrintFormat"],
        }),
        deleteFormat: builder.mutation({
            query: (id) => ({
                url: `/formats/delete/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["PrintFormat"],
        }),
        getMonitorStats: builder.query({
            query: () => "status/",
            transformResponse: (response) => ({
                cpu: response.cpu,
                ram: response.ram,
                disk: response.disk,
                processes: response.processes,
            }),
            providesTags: ["Monitor"],
        }),
        joinOrderByInvite: builder.mutation({
            query: (shortcut_url) => ({
                url: `orders/invite/${shortcut_url}/`,
                method: "GET",
            }),
        }),
    }),
})

export const {
    useGetOrdersQuery,
    useCreateOrderMutation,
    useGetOrderByIdQuery,
    useDeleteOrderImageMutation,
    useCompleteOrderMutation,
    useGetPrintFormatsQuery,
    useDeleteOrderMutation,
    useUpdateOrderStatusMutation,
    useAddFormatMutation,
    useEditFormatMutation,
    useDeleteFormatMutation,
    useGetMonitorStatsQuery,
    useJoinOrderByInviteMutation
} = ordersApi;
