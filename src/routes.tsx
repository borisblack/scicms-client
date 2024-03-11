import App from './pages/app/App'
import Bi from './pages/bi/Bi'
import Login from './features/auth/Login'
import {RouteObject} from 'react-router-dom'
import ErrorFallback from './pages/error/ErrorFallback'

const routes: RouteObject[] = [{
    path: '/',
    element: <App/>,
    errorElement: <ErrorFallback/>
}, {
    path: '/bi',
    element: <Bi/>,
    errorElement: <ErrorFallback/>
}, {
    path: '/login',
    element: <Login/>,
    errorElement: <ErrorFallback/>
}, {
    path: '/auth/oauth2/:provider',
    element: <Login/>,
    errorElement: <ErrorFallback/>
}]

export default routes