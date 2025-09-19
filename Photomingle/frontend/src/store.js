import { configureStore } from '@reduxjs/toolkit'
import { ordersApi } from './services/ordersApi'
import {usersApi} from "./services/usersApi";

export const store = configureStore({
    reducer: {
        [ordersApi.reducerPath]: ordersApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(ordersApi.middleware)
            .concat(usersApi.middleware),
})