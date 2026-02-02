import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
//components
import Dashboard from './pages/Dashboard'
import StudentPage from './pages/StudentPage'
import StudentsPage from './pages/StudentsPage'
import SettingsPage from './pages/SettingsPage'
import Navbar from './components/Navbar'
import Login from './pages/Login'
//hooks
import { useAuthContext } from './hooks/useAuthContext'

function App() {
	const { user, authIsReady } = useAuthContext()

	if (!authIsReady) return <div>Loading...</div> // Wait for auth state to initialize

	const isAdmin = user?.claims?.admin

	return (
		<div className='App'>
			<Router>
				{/* Conditionally render the Navbar */}
				{isAdmin && <Navbar />}

				<Routes>
					{/* Dashboard - Restricted to admin */}
					<Route path='/' element={isAdmin ? <Dashboard /> : <Navigate to='/login' />} />

					{/* Students Page - Restricted to admin */}
					<Route path='/students' element={isAdmin ? <StudentsPage /> : <Navigate to='/login' />} />

					{/* Student Page - Restricted to admin */}
					<Route
						path='/students/:studentId'
						element={isAdmin ? <StudentPage /> : <Navigate to='/login' />}
					/>

					{/* settings Page - Restricted to admin */}
					<Route path='/settings' element={isAdmin ? <SettingsPage /> : <Navigate to='/login' />} />

					{/* Login Page - Accessible only for non-authenticated or non-admin users */}
					<Route path='/login' element={!isAdmin ? <Login /> : <Navigate to='/' />} />
				</Routes>
			</Router>
		</div>
	)
}

export default App
