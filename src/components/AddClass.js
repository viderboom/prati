import './AddClass.css'
import { TextField, Checkbox, InputAdornment, Box, CircularProgress } from '@mui/material'
import { LocalizationProvider, DatePicker, MobileTimePicker } from '@mui/x-date-pickers'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { DateTime } from 'luxon'
import AddStudentDialog from './AddStudentDialog'
import StudentAutocomplete from './StudentAutocomplete'
// firebase
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import 'dayjs/locale/he'
dayjs.locale('he')

export default function AddClass({ setMessage, selectedDateStr, handleClose }) {
	const selectedDateObj = dayjs(selectedDateStr, 'DD/MM/YYYY HH:mm').toDate()

	const [selectedStudent, setSelectedStudent] = useState(null)
	const [isNewStudent, setIsNewStudent] = useState(false)
	const [newStudentName, setNewStudentName] = useState('')

	const [selectedDate, setSelectedDate] = useState(selectedDateObj)
	const [selectedTime, setSelectedTime] = useState(selectedDateObj)

	const [scheduleWeekly, setScheduleWeekly] = useState(false)
	const [price, setPrice] = useState('')
	// Track if teacher manually edited the price input
	const [priceEdited, setPriceEdited] = useState(false)

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	const dayOfWeek = dayjs(selectedDateStr).locale('en').format('dd').toUpperCase()

	// States to hold defaults fetched from Firestore
	const [defaultPrivatePrice, setDefaultPrivatePrice] = useState('')
	const [defaultGroupPrice, setDefaultGroupPrice] = useState('')

	// Fetch defaults from Firestore on mount
	useEffect(() => {
		const fetchDefaults = async () => {
			try {
				const defaultsRef = doc(db, 'settings', 'defaults')
				const defaultsSnap = await getDoc(defaultsRef)
				if (defaultsSnap.exists()) {
					const data = defaultsSnap.data()
					if (data.privatePrice !== undefined) {
						setDefaultPrivatePrice(String(data.privatePrice))
					}
					if (data.groupPrice !== undefined) {
						setDefaultGroupPrice(String(data.groupPrice))
					}
				}
			} catch (err) {
				console.error('Error fetching default prices:', err)
			}
		}
		fetchDefaults()
	}, [])

	// Auto-update price if teacher hasn't manually edited it
	useEffect(() => {
		if (!priceEdited) {
			 if (selectedStudent && defaultPrivatePrice) {
				setPrice(defaultPrivatePrice)
			} else {
				setPrice('')
			}
		}
	}, [selectedStudent, defaultPrivatePrice, defaultGroupPrice, priceEdited])

	const handleAddClass = async () => {
		// Front-end validation: Check that all required fields are filled
		if (!selectedDate || !selectedTime || selectedStudent.length === 0 || price.trim() === '') {
			setError('אנא מלאי את כל שדות החובה')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const classesRef = collection(db, 'classes')
			// const startISO = DateTime.fromJSDate(selectedDate, { zone: 'Asia/Jerusalem' }).toISO({
			// 	suppressMilliseconds: true,
			// })
			const startStr = DateTime.fromJSDate(selectedDate, { zone: 'Asia/Jerusalem' }).toFormat(
				"yyyy-MM-dd'T'HH:mm:ss"
			)

			const classData = {
				student: selectedStudent,
				duration: '60',
				type: scheduleWeekly ? 'recurring' : 'one-time',
				pricePerStudent: price,
				start: startStr,
				title: 'שיעור פרטי',
				...(scheduleWeekly && {
					rrule: {
						freq: 'WEEKLY',
						interval: 1,
						byweekday: [dayOfWeek],
						// dtstart: startISO,
						dtstart: startStr,
					},
				}),
			}
			// Add the new class to Firestore
			await addDoc(classesRef, classData)

			setMessage('השיעור נוסף בהצלחה')
			handleClose()
		} catch (error) {
			console.error(error)
			setError('היתה בעיה, נסי להוסיף את השיעור שוב')
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddNewStudent = newStudent => {
		if (newStudent && newStudent.fullName) {
			setSelectedStudent(newStudent)
		}
	}

	return (
		<div className='add-class-container'>
			{isLoading ? (
				<Box display='flex' justifyContent='center' alignItems='center' height='100%'>
					<CircularProgress />
				</Box>
			) : (
				<form className='new-class-form' autoComplete='off'>
					<LocalizationProvider dateAdapter={AdapterDateFns} dir='rtl'>
						<DatePicker
							label='לשינוי תאריך'
							value={selectedDate}
							onChange={setSelectedDate}
							inputFormat='dd/MM/yyyy'
							renderInput={params => <TextField {...params} fullWidth />}
						/>
						<MobileTimePicker
							label='לשינוי שעה'
							value={selectedTime}
							ampm={false}
							onChange={setSelectedTime}
							renderInput={params => (
								<TextField
									{...params}
									fullWidth
									InputProps={{
										...params.InputProps,
										startAdornment: (
											<InputAdornment position='start'>
												<AccessTimeIcon />
											</InputAdornment>
										),
									}}
								/>
							)}
						/>
					</LocalizationProvider>
					{/* Student Selection */}
					<StudentAutocomplete
						selectedStudent={selectedStudent}
						setSelectedStudent={setSelectedStudent}
						onNewStudentDialogOpen={() => setIsNewStudent(true)}
						setNewStudentName={setNewStudentName}
						required
					/>

					{isNewStudent && (
						<AddStudentDialog
							studentName={newStudentName}
							onClose={newStudent => {
								handleAddNewStudent(newStudent)
								setIsNewStudent(false)
							}}
						/>
					)}

					<TextField
						id='price'
						type='number'
						label='מחיר השיעור לתלמיד בודד'
						fullWidth
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<span style={{ fontSize: '1.5rem' }}>₪</span>
								</InputAdornment>
							),
						}}
						value={price}
						onChange={e => {
							setPrice(e.target.value)
							setPriceEdited(true)
						}}
						required
					/>

					<label htmlFor='schedule-weekly' className='custom-checkbox'>
						<Checkbox id='schedule-weekly' onChange={e => setScheduleWeekly(e.target.checked)} />
						שיעור שבועי
					</label>

					<div className='modal-buttons'>
						<button className='btn-small dismiss-btn' onClick={handleClose}>
							חזרה
						</button>
						<button className='btn-small approve-btn' onClick={handleAddClass}>
							הוסיפי שיעור
						</button>
					</div>
				</form>
			)}
			{error && <p className='error'>{error}</p>}
		</div>
	)
}
