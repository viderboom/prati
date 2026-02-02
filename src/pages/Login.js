import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
	TextField,
	Button,
	Box,
	Typography,
	Alert,
	InputAdornment,
	IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import './Login.css'
// import { useNavigate } from 'react-router-dom'

const LoginForm = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')

    // const navigate = useNavigate()

	const handleLogin = async e => {
		e.preventDefault()

		const auth = getAuth()
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password)
			const user = userCredential.user

			// Get custom claims after the user logs in
			const idTokenResult = await user.getIdTokenResult()

			if (idTokenResult.claims.admin) {
				console.log('Admin logged in')
                // navigate('/')
			}
		} catch (err) {
			setError('יש טעות בפרטים, בדקי ונסי שוב')
			console.error(err)
		}
	}

	return (
		<Box
			className='login-container'
			sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
			<Typography variant='h5' component='h2' align='center' gutterBottom>
				היי אתי, הכניסי פרטים
			</Typography>
			<form onSubmit={handleLogin}>
				<Box sx={{ mb: 2 }}>
					<TextField
						label='דוא"ל'
						type='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						fullWidth
						required
						variant='outlined'
					/>
				</Box>
				<Box sx={{ mb: 2 }}>
					<TextField
						label='סיסמה'
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={e => setPassword(e.target.value)}
						fullWidth
						required
						variant='outlined'
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton
										aria-label='toggle password visibility'
										onClick={() => setShowPassword(!showPassword)}
										edge='end'>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</Box>
				<Button type='submit' variant='contained' color='primary' fullWidth>
					כניסה
				</Button>
			</form>
			{error && (
				<Box sx={{ mt: 2 }}>
					<Alert severity='error'>{error}</Alert>
				</Box>
			)}
		</Box>
	)
}

export default LoginForm
