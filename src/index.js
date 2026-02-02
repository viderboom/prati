import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { NotificationProvider } from './context/NotificationContext'
import { AuthContextProvider } from './context/AuthContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<NotificationProvider>
		{/* <React.StrictMode> */}
			<AuthContextProvider>
				<App />
			</AuthContextProvider>
		{/* </React.StrictMode> */}
	</NotificationProvider>
)
