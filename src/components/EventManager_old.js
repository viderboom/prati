//styles
import './EventManager.css'
// components
import TimeVisual from './TimeVisual'
import Loader from './Loader'
//firebase
import { deleteDoc, doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
// import { getFunctions, httpsCallable } from 'firebase/functions'
//mui
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
//hooks
import { useNotification } from '../hooks/useNotification'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
//utills
import { DateTime } from 'luxon'

export default function EventManager({ event, handleClose }) {
	const navigate = useNavigate()
	const { showNotification } = useNotification()
	const [isLoading, setIsLoading] = useState(true)
	const [studentsStatus, setStudentsStatus] = useState({})

	// !IMPORTANT: IF SESSION ID changes somewhere - MUST ALSO CHANGE here!!!
	const sessionId = `${event.id}_${event.startStr.split('+')[0]}`

	useEffect(() => {
		const students = event?.extendedProps.students || []
		const checkAllPayments = async () => {
			if (!students.length) {
				setIsLoading(false)
				return
			}

			const status = {}
			try {
				for (const student of students) {
					const sessionRef = doc(db, 'students', student.id, 'sessions', sessionId)
					const sessionDoc = await getDoc(sessionRef)
					if (sessionDoc.exists()) {
						status[student.id] = {
							paid: sessionDoc.data()?.paid || false,
							canceled: sessionDoc.data()?.canceled || false,
						}
					} else {
						status[student.id] = { paid: false, canceled: false }
					}
				}
			} catch (error) {
				console.error('Error checking status:', error)
			} finally {
				setStudentsStatus(status)
				setIsLoading(false) // Set loading state after all checks
			}
		}

		checkAllPayments()
	}, [event, sessionId])

	const saveSession = async sessionData => {
		// Reference the session document under the student's sessions subcollection
		const sessionRef = doc(db, 'students', sessionData.studentId, 'sessions', sessionId)

		try {
			// !IMPORTANT: IF CHANGING SESSION PROPERTIES - MUST ALSO CHANGE IN DailySummary cloud function
			await setDoc(sessionRef, {
				start: DateTime.fromISO(event.startStr, { zone: 'Asia/Jerusalem' }).toISO({
					suppressMilliseconds: true,
				}),
				price: event.extendedProps.pricePerStudent,
				paid: sessionData.paid || false,
				canceled: sessionData.canceled || false,
				studentId: sessionData.studentId,
				updatedBy: 'Eti',
				isGroup: event.extendedProps.students ? event.extendedProps.students.length > 1 : false,
				updatedAt: Timestamp.now(),
			})

			console.log('Session saved successfully')
			return true // ✅ Return true on success
		} catch (error) {
			console.error('Error saving session :', error)
			showNotification('אירעה שגיאה בעת עדכון השיעור.')
			return false // ❌ Return false on failure
		}
	}

	const handleCancelClass = async () => {
		// Build confirmation message; include extra text if group session.
		const isGroup = event.extendedProps.students ? event.extendedProps.students.length > 1 : false
		const cancelMsg = `האם אתה בטוח שברצונך לבטל את השיעור?${isGroup ? ' (זהו שיעור קבוצתי)' : ''}`
		if (!window.confirm(cancelMsg)) return

		setIsLoading(true)

		try {
			const results = await Promise.all(
				event.extendedProps.students.map(student =>
					saveSession({ studentId: student.id, canceled: true, paid: false })
				)
			)

			if (results.every(success => success)) {
				// ✅ Proceed only if all sessions were updated
				const classRef = doc(db, 'classes', event.id)

				if (event.rrule) {
					const updatedExdates = new Set([...(event.exdate || []), event.start])
					await updateDoc(classRef, { exdate: Array.from(updatedExdates) })
				} else {
					await deleteDoc(classRef)
				}

				showNotification('השיעור בוטל בהצלחה')
				handleClose()
			} else {
				showNotification('אירעה שגיאה בעת ביטול השיעור.') // Handle partial failure
			}
		} catch (error) {
			console.error('Error canceling class:', error)
			showNotification('אירעה שגיאה בעת ביטול השיעור.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleClassPaid = async studentId => {
        const isGroup = event.extendedProps.students
      ? event.extendedProps.students.length > 1
      : false
    const paidMsg = `האם אתה בטוח שברצונך לסמן את השיעור כשולם?${isGroup ? ' (זהו שיעור קבוצתי)' : ''}`
    if (!window.confirm(paidMsg)) return

		setIsLoading(true)

		try {
			const success = await saveSession({ studentId, paid: true })

			if (success) {
				setStudentsStatus(prevState => ({
					...prevState,
					[studentId]: true,
				}))
				console.log('Class marked as paid')
			} else {
				console.error('Failed to mark class as paid') // Handle failure case
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleStudentClick = studentId => {
		navigate(`/students/${studentId}`)
	}

	return (
		<div className='event-manager'>
			{isLoading && <Loader />}

			{!isLoading && (
				<>
					<TimeVisual eventInfo={event} />

					<div className='event-manager__buttons'>
						{/* {event.extendedProps.type === 'group' && <h4>משתתפי השיעור</h4>} */}

						{event.extendedProps.students.map(student => (
							<div key={student.id} className='student-row'>
								<span className='link-btn' onClick={() => handleStudentClick(student.id)}>
									{student.fullName}
								</span>
								{!studentsStatus[student.id] && (
									<button
										className='btn-small btn-paid'
										onClick={() => handleClassPaid(student.id)}>
										סמני כשולם
									</button>
								)}

								{studentsStatus[student.id] && (
									<div>
										<CheckCircleIcon
											style={{
												marginRight: '8px',
												verticalAlign: 'middle',
												color: 'var(--paid-color)',
											}}
										/>
										<span className='paid'>השיעור שולם</span>
									</div>
								)}
							</div>
						))}

						{Object.values(studentsStatus).every(status => !status) && (
							<button
								className='btn-small btn-cancel'
								onClick={handleCancelClass}
								disabled={isLoading}>
								ביטול שיעור
							</button>
						)}
					</div>
				</>
			)}
		</div>
	)
}
