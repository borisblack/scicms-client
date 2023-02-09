import App from './pages/App'
import Bi from './pages/Bi'
import Login from './features/auth/Login'
import {RouteObject} from 'react-router-dom'
import ErrorFallback from './pages/ErrorFallback'

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
}]

export default routes