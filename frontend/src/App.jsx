import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider 
} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Post from './pages/Post'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import ErrorPage from './components/ErrorPage'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import PublicRoute from './utils/PublicRoute'
import ProtectedRoute from './utils/ProtectedRoute'
import Logout from './components/Logout'
import Chat from './pages/Chat'
import { ChatProvider } from './context/ChatContext'
import Success from './pages/StripeSuccess'
import StripeOnboardingSuccess from './pages/StripeOnboardingSuccess'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />} errorElement={<ErrorPage />} >
      <Route index element={<Home />} />
      <Route element={<PublicRoute />}>
        <Route path='/login' element={<Login />}/>
        <Route path='/signup' element={<Signup />}/>
      </Route>
        <Route path='/logout' element={<Logout />}/>
      <Route element={<ProtectedRoute />}>
        <Route path='/feed' element={<Feed />}/>
        <Route path='/post/:id' element={<Post />}/>
        <Route path='/profile/:id' element={<Profile />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/stripe-success' element={<Success />} />
        <Route path='/stripe-onboarding-success' element={<StripeOnboardingSuccess />} />
      </Route>
      {/* {isAuthenticated ? <Route path='/feed' element={<Feed />}/> : <Route path='/login' element={<Login />}/> } */}
    </Route>
  )
)

const App = () => {

  return (
    <AuthProvider>
      <AppProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
