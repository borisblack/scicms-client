import App from './pages/App'
import Analysis from './pages/Analysis'
import Login from './features/auth/Login'
import {RouteObject} from 'react-router-dom'
import ErrorFallback from './pages/ErrorFallback'

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