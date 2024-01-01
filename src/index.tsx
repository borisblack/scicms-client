/*-
 SciCMS Client
 Copyright 2022 Boris Chernysh
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 */
import React from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {I18nextProvider} from 'react-i18next'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {ConfigProvider} from 'antd'
import {ApolloProvider} from '@apollo/client/react'
import {store} from './store'
import reportWebVitals from './reportWebVitals'
import {apolloClient} from './services'
import i18n from './i18n'
import config from './config'
import routes from './routes'
import 'antd/dist/reset.css'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container as HTMLElement)
const router = createBrowserRouter(routes)
root.render(
    <Provider store={store}>
        <ApolloProvider client={apolloClient}>
            <I18nextProvider i18n={i18n}>
                <DndProvider backend={HTML5Backend}>
                    <ConfigProvider locale={config.antdLocale}>
                        <RouterProvider router={router}/>
                    </ConfigProvider>
                </DndProvider>
            </I18nextProvider>
        </ApolloProvider>
    </Provider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
