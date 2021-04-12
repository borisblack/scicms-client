import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import { ApolloProvider } from '@apollo/client/react'

import 'antd/dist/antd.css'
import './index.css'

import store from './store'
import App from './App'
import reportWebVitals from './reportWebVitals'
import {apolloClient} from './services'

ReactDOM.render(
  <Provider store={store}>
      <ApolloProvider client={apolloClient}>
          <App />
      </ApolloProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
