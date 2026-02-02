import './Navbar.css'
import { Button, IconButton, Menu, MenuItem, Divider, useMediaQuery } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CheckIcon from '@mui/icons-material/Check'
import { Home } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'

export default function Navbar() {
	const navigate = useNavigate()
	const location = useLocation()
	const [anchorEl, setAnchorEl] = useState(null)
	const menuOpen = Boolean(anchorEl)

	// Detect if the viewport is in portrait orientation
	const isPortrait = useMediaQuery('(orientation: portrait)')

	const handleMenuClick = event => {
		setAnchorEl(event.currentTarget)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	const handleHomeClick = () => {
		navigate('/')
		handleMenuClose()
	}

	const handleStudentsAndClassesClick = () => {
		navigate('/students')
		handleMenuClose()
	}

	const handleSettingsClick = () => {
		navigate('/settings')
		handleMenuClose()
	}

	const handleSignOut = async () => {
		const auth = getAuth()
		try {
			await signOut(auth)
		} catch (error) {
			console.error('Error signing out: ', error)
		}
		handleMenuClose()
	}


	return (
		<div className='navbar-container'>
			{isPortrait ? (
				// Portrait view: menu icon aligned to the right
				<div
					className='page-layout portrait-layout'>
					<IconButton onClick={handleMenuClick} aria-label='menu'>
						<MoreVertIcon />
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						dir='rtl'
						open={menuOpen}
						onClose={handleMenuClose}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
						<MenuItem onClick={handleHomeClick} disabled={location.pathname === '/'}>
							<Home /> &nbsp;
							יומן
							{location.pathname === '/' && (
								<CheckIcon fontSize='small' style={{ marginLeft: 'auto' }} />
							)}
						</MenuItem>
						<MenuItem
							onClick={handleStudentsAndClassesClick}
							disabled={location.pathname === '/students'}>
							תלמידים
							{location.pathname === '/students' && (
								<CheckIcon fontSize='small' style={{ marginLeft: 'auto' }} />
							)}
						</MenuItem>
						<MenuItem onClick={handleSettingsClick} disabled={location.pathname === '/settings'}>
							הגדרות
							{location.pathname === '/settings' && (
								<CheckIcon fontSize='small' style={{ marginLeft: 'auto' }} />
							)}
						</MenuItem>
						<Divider />
						<MenuItem onClick={handleSignOut}>התנתקי</MenuItem>
					</Menu>
				</div>
			) : (
				// Landscape view: inline text buttons with dividers
				<div className='page-layout landscape-layout'>
					<ul>
						<li
							className={`nav-item ${location.pathname === '/' ? 'nav-disabled' : ''}`}
							onClick={location.pathname !== '/' ? handleHomeClick : undefined}>
							יומן
						</li>

						<li
							className={`nav-item ${location.pathname === '/students' ? 'nav-disabled' : ''}`}
							onClick={
								location.pathname !== '/students' ? handleStudentsAndClassesClick : undefined
							}>
							תלמידים
						</li>

						<li
							className={`nav-item ${location.pathname === '/settings' ? 'nav-disabled' : ''}`}
							onClick={location.pathname !== '/settings' ? handleSettingsClick : undefined}>
							הגדרות
						</li>

						<li className='nav-item' onClick={handleSignOut}>
							התנתקי
						</li>
					</ul>
				</div>
			)}

            
		</div>
	)
}
