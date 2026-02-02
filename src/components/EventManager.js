// EventManager.js
//styles
import './EventManager.css'
// components
import TimeVisual from './TimeVisual'
import Loader from './Loader'
import Modal from './Modal' // import your custom modal component
//firebase
import {
	deleteDoc,
	doc,
	getDoc,
	updateDoc,
	setDoc,
	Timestamp,
	arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebase/config'
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
	const student = event?.extendedProps?.student

	// State for our custom confirmation modal
	const [confirmModal, setConfirmModal] = useState({
		open: false,
		message: '',
		onConfirm: () => {},
		onCancel: () => {},
	})

	// Helper function that returns a promise resolving to true (confirmed) or false (canceled)
	const confirmDialog = message => {
		return new Promise(resolve => {
			setConfirmModal({
				open: true,
				message,
				onConfirm: () => {
					setConfirmModal(prev => ({ ...prev, open: false }))
					resolve(true)
				},
				onCancel: () => {
					setConfirmModal(prev => ({ ...prev, open: false }))
					resolve(false)
				},
			})
		})
	}

	// !IMPORTANT: IF SESSION ID changes somewhere - MUST ALSO CHANGE here!!!
	const sessionId = `${event.id}_${event.startStr.split('+')[0]}`

	useEffect(() => {
		const student = event?.extendedProps?.student
		const checkAllStatus = async () => {
			if (!student) {
				setIsLoading(false)
				return
			}

			const status = {}
			try {
				const sessionRef = doc(db, 'students', student.id, 'sessions', sessionId)
				const sessionDoc = await getDoc(sessionRef)

				status[student.id] = sessionDoc.exists()
					? {
							paid: sessionDoc.data()?.paid || false,
							canceled: sessionDoc.data()?.canceled || false,
					  }
					: { paid: false, canceled: false }
			} catch (error) {
				console.error('Error checking status:', error)
			} finally {
				// console.log('status is:',status)
				setStudentsStatus(status)
				setIsLoading(false)
			}
		}

		checkAllStatus()
	}, [event, sessionId])

	const saveSession = async sessionData => {
		const sessionRef = doc(db, 'students', sessionData.studentId, 'sessions', sessionId)

		try {
			await setDoc(sessionRef, {
				start: DateTime.fromISO(event.startStr, { zone: 'Asia/Jerusalem' }).toISO({
					suppressMilliseconds: true,
				}),
				price: event.extendedProps.pricePerStudent,
				paid: sessionData.paid || false,
				canceled: sessionData.canceled || false,
				studentId: sessionData.studentId,
				updatedBy: 'Eti',
				updatedAt: Timestamp.now(),
			})

			console.log('Session saved successfully')
			return true
		} catch (error) {
			console.error('Error saving session:', error)
			showNotification('אירעה שגיאה בעת עדכון השיעור.')
			return false
		}
	}

	const handleCancelClass = async () => {
		const cancelMsg = `האם את בטוחה שברצונך לבטל את השיעור?`

		const confirmed = await confirmDialog(cancelMsg)
		if (!confirmed) return

		setIsLoading(true)

		try {
			await saveSession({
				studentId: student.id,
				canceled: true,
				paid: false,
			})

			const classRef = doc(db, 'classes', event.id)

			if (event.extendedProps.type === 'recurring') {
				const occurrence = DateTime.fromISO(event.startStr, { zone: 'Asia/Jerusalem' }).toFormat(
					"yyyy-MM-dd'T'HH:mm:ss"
				)

				await updateDoc(classRef, { exdate: arrayUnion(occurrence) })
			} else {
				await deleteDoc(classRef)
			}

			showNotification('השיעור בוטל בהצלחה')
			handleClose()
		} catch (error) {
			console.error('Error canceling class:', error)
			showNotification('אירעה שגיאה בעת ביטול השיעור.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleClassPaid = async studentId => {
		const paidMsg = `האם את בטוחה שברצונך לסמן את השיעור כשולם?`

		const confirmed = await confirmDialog(paidMsg)
		if (!confirmed) return

		setIsLoading(true)

		try {
			const success = await saveSession({ studentId, paid: true })

			if (success) {
				setStudentsStatus(prevState => ({
					...prevState,
					[studentId]: {
						...prevState[studentId],
						paid: true,
					},
				}))
				// console.log('Class marked as paid')
			} else {
				// console.error('Failed to mark class as paid')
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
						{student && (
							<div key={student.id} className='student-row'>
								<span className='link-btn' onClick={() => handleStudentClick(student.id)}>
									{student.fullName}
								</span>

								{studentsStatus[student.id]?.canceled && (
									<span className='EM-badge-btn canceled'> בוטל</span>
								)}

								{!studentsStatus[student.id]?.paid && !studentsStatus[student.id]?.canceled && (
									<button
										className='btn-small btn-paid EM-badge-btn'
										onClick={() => handleClassPaid(student.id)}>
										סמני כשולם
									</button>
								)}

								{studentsStatus[student.id]?.paid && (
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
						)}
						
						{Object.values(studentsStatus).every(status => !status?.paid && !status?.canceled) && (
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

			{/* Confirmation Modal using your custom Modal component */}
			{confirmModal.open && (
				<Modal handleClose={confirmModal.onCancel}>
					<div className='confirm-dialog'>
						<p>{confirmModal.message}</p>
						<div className='modal-buttons'>
							<button className='btn-small dismiss-btn' onClick={confirmModal.onCancel}>
								חזרה
							</button>
							<button className='btn-small approve-btn' onClick={confirmModal.onConfirm}>
								אישור
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	)
}
