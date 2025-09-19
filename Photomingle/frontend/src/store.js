import { configureStore } from '@reduxjs/toolkit'
import { ordersApi } from './services/ordersApi'
import {userApi} from "./services/userApi";

export const store = configureStore({
    reducer: {
        [ordersApi.reducerPath]: ordersApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(ordersApi.middleware)
            .concat(userApi.middleware),
})