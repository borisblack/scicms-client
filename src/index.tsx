import React from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import {ApolloProvider} from '@apollo/client/react'

import 'antd/dist/reset.css'
import './index.css'

import {store} from './store'
import App from './App'
import reportWebVitals from './reportWebVitals'
import {apolloClient} from './services'
import ErrorFallback from './ErrorFallback'
import {ErrorBoundary} from 'react-error-boundary'

const container = document.getElementById('root')
const root = createRoot(container as HTMLElement)
root.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
          <ApolloProvider client={apolloClient}>
              <App />
          </ApolloProvider>
        </Provider>
    </ErrorBoundary>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
