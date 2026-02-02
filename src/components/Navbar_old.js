// styles
import './Navbar.css'
// mui
import { IconButton, Autocomplete, TextField, Button } from '@mui/material'
import { Home } from '@mui/icons-material'
// hooks
import { useCollection } from '../hooks/useCollection'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
// firebase
import { getAuth, signOut } from 'firebase/auth'

export default function Navbar() {
	const { documents } = useCollection('students')
	const [students, setStudents] = useState([])
	const [selectedStudent, setSelectedStudent] = useState(null)
	const inputRef = useRef(null) // Create a reference to the input field
	const navigate = useNavigate()

	useEffect(() => {
		if (documents) {
			setStudents(documents)
		}
	}, [documents])

	const handleHomeClick = () => {
		navigate('/')
		setSelectedStudent(null)
	}

	const handleStudentSelect = (event, student) => {
		if (student) {
			navigate(`/students/${student.id}`)
			setSelectedStudent(student)

			// Remove focus from the Autocomplete input
			if (inputRef.current) {
				inputRef.current.blur() // Ensure blur is called on the input field
			}
		} else {
			setSelectedStudent(null)
		}
	}

	const handleSignOut = async () => {
		const auth = getAuth()
		try {
			await signOut(auth)
		} catch (error) {
			console.error('Error signing out: ', error)
		}
	}

	return (
		<div className='navbar-container'>
			<div className='page-layout'>
				{/* Home Button */}
				<IconButton className='navbar-home-button' onClick={handleHomeClick} aria-label='home'>
					<Home />
				</IconButton>

				<Autocomplete
					size='small'
					className='navbar-select'
					dir='rtl'
					clearOnBlur
					disableClearable // Prevent the "x" for deleting the selection
					sx={{
						color: 'red',
						textAlign: 'right', // Align text
						direction: 'rtl', // Ensure RTL direction is applied properly
					}}
					value={selectedStudent || null} // Make sure it's not undefined, use null if no selection
					options={students.map(s => ({
						label: `${s.name} ${s.familyName}`,
						id: s.id,
					}))}
					isOptionEqualToValue={(option, value) => option.id === value?.id} // Compare by ID
					getOptionLabel={option => option.label}
					getOptionDisabled={option => option.id === selectedStudent?.id} // Disable the selected student
					onChange={handleStudentSelect}
                    renderInput={params => (
						<TextField
							{...params}
							className='student-picker-input'
							label='בחרי תלמיד'
							inputRef={inputRef} // Attach the ref to the input field
							variant='standard'
							InputLabelProps={{
								style: {
									direction: 'rtl', // RTL direction for the label
                                    color: '#1976d2', // Set the label color

                                },
							}}

							sx={{
								'direction': 'rtl', // RTL for the entire field
								'& .MuiInputLabel-root': {
									right: 30, // Move the label a bit to the right (default, non-shrunk state)
									left: 'unset', // Avoid left alignment
								},
								'& .MuiInputLabel-shrink': {
									right: 0, // Reset the position when shrunk
									left: 'unset', // Ensure shrunk label stays correctly positioned
								},
							}}
						/>
					)}
					renderOption={(props, option) => (
						<li
							{...props}
							key={option.id}
							dir='rtl'
							sx={{
								opacity: option.id === selectedStudent?.id ? 0.5 : 1,
							}}>
							{option.label}
						</li>
					)}
				/>

				{/* Sign Out Button */}
				<Button className='logout-btn' onClick={handleSignOut}>
					התנתקי
				</Button>
			</div>
		</div>
	)
}
