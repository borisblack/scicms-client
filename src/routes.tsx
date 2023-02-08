import App from './App'
import Analysis from './Analysis'
import Login from './features/auth/Login'
import {RouteObject} from 'react-router-dom'
import ErrorFallback from './ErrorFallback'

const routes: RouteObject[] = [{
    path: '/',
    element: <App/>,
    errorElement: <ErrorFallback/>
}, {
    path: '/analysis',
    element: <Analysis/>,
    errorElement: <ErrorFallback/>
}, {
    path: '/login',
    element: <Login/>,
    errorElement: <ErrorFallback/>
}]

export default routes