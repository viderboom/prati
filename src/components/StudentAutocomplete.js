import { Autocomplete, TextField, Button } from '@mui/material'
import './AddClass.css'
import { useCollection } from '../hooks/useCollection'
import { useMemo, useState } from 'react'
import './StudentAutocomplete.css'

export default function StudentAutocomplete({
	selectedStudent,
	setSelectedStudent,
	// onAddNewStudent,
	onNewStudentDialogOpen,
	setNewStudentName,
}) {
	// console.log('selectedStudent: ', selectedStudent)

	const { documents } = useCollection('students')
	// Memoize studentsFullName to avoid unnecessary recalculations
	const studentOptions = useMemo(() => {
		if (!documents) return [] // If documents is null or undefined, return an empty array
		return documents.map(s => ({
			fullName: `${s.name} ${s.familyName}`, // Combine name and familyName to form fullName
			id: s.id, // Keep track of the student's ID
		}))
	}, [documents]) // Re-run this when 'documents' changes

	const [inputValue, setInputValue] = useState('')
	const addNewStudentLabel = 'הוסיפי את '

	const options = useMemo(() => {
		return [...studentOptions, addNewStudentLabel]
	}, [studentOptions])

	const filterOptions = (options, { inputValue }) => {
		// Filter only student names (fullName)
		const filteredStudents = options.filter(option => {
			// Check if option is an object (student) and filter by fullName
			if (typeof option === 'object' && option.fullName) {
				return option.fullName.toLowerCase().includes(inputValue.toLowerCase())
			}

			return false
		})

		// Ensure "Add New Student" is always appended at the end
		return [...filteredStudents, addNewStudentLabel]
	}

	const handleSelectionChange = (event, selectedValue) => {
		if (selectedValue === addNewStudentLabel) {
			setNewStudentName(inputValue)
			onNewStudentDialogOpen()
			return
		}

		setSelectedStudent(selectedValue)
	}

	// Check if the inputValue is a substring of any existing fullName
	const isInputExistingStudent = useMemo(() => {
		return studentOptions.some(student =>
			student.fullName.toLowerCase().includes(inputValue.toLowerCase())
		)
	}, [inputValue, studentOptions])

	if (!documents) {
		return <p>Loading students...</p>
	}

	return (
		<Autocomplete
			fullWidth
			dir='rtl'
			value={selectedStudent}
			onChange={handleSelectionChange}
			onInputChange={(e, inputValue) => setInputValue(inputValue)}
			inputValue={inputValue}
			// renderInput={params => <TextField {...params} label='שם התלמיד' fullWidth />}
			options={options}
			filterOptions={filterOptions}
			getOptionLabel={option => (typeof option === 'string' ? option : option.fullName || '')}
			renderInput={params => <TextField {...params} label='שם התלמיד' fullWidth />}
			renderOption={(props, option) => {
				if (option === addNewStudentLabel) {
					return (
						<Button
							key={option}
							color='primary'
							onClick={() => {
								setNewStudentName(inputValue) // Set the new student name here as well
								onNewStudentDialogOpen()
							}}
							disabled={!inputValue || isInputExistingStudent}
							sx={{
								width: 'fill-content',
								backgroundColor: !inputValue || isInputExistingStudent ? 'transparent' : '', // No background when disabled
								color: !inputValue || isInputExistingStudent ? 'lightgray' : '#1976d2', // Light gray when disabled
								margin: '5px',
								cursor: !inputValue || isInputExistingStudent ? 'not-allowed' : 'pointer',
								textAlign: 'right', // Align text
								justifyContent: 'end', // Flexbox alignment for right-aligning text
								direction: 'rtl', // Ensure RTL direction is applied properly
							}}>
							{option}
							{inputValue}
						</Button>
					)
				}
				return (
					<span {...props} key={option.id} dir='rtl'>
						{option.fullName}
					</span>
				)
			}}
		/>
	)
}
