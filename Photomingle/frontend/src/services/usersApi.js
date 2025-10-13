import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/users/',
        credentials: 'include',
        prepareHeaders: (headers) => {
            const csrfToken = getCookie("csrftoken");
            if (csrfToken) {
                headers.set("X-CSRFToken", csrfToken);
            }
            return headers;
        },
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
            invalidatesTags: ['Myinfo']
        }),
        myInfo: builder.query({
            query: () => ({
                url: 'myinfo/',
                method: 'GET',
            }),
            providesTags: ['Myinfo']
        }),
        getUsers: builder.query({
            query: (search = "") =>
                search ? `/?search=${encodeURIComponent(search)}` : "/",
            transformResponse: (response: any[]) =>
                response.map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar || null,
                })),
            providesTags: ["User"],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `delete/${userId}/`,
                method: "DELETE",
            }),
            invalidatesTags:["User", "Myinfo"],
        }),
        createUser: builder.mutation({
            query: (formData) => ({
                url: "add/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["User"],
        }),

        editUser: builder.mutation({
            query: (formData) => ({
                url: `edit/${formData.get("id")}/`,
                method: "PATCH",
                body: formData,
            }),
            invalidatesTags: ["User", "Myinfo"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
    useMyInfoQuery,
    useGetUsersQuery,
    useDeleteUserMutation,
    useCreateUserMutation,
    useEditUserMutation
} = usersApi;
