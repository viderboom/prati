import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Snackbar } from '@mui/material'
import { useParams } from 'react-router-dom'
import { doc, collection, getDoc, getDocs, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DateTime } from 'luxon'
import Modal from '../components/Modal' // Custom Modal component
import './StudentPage.css'
import StudentAutocomplete from '../components/StudentAutocomplete'

export default function StudentPage() {
	const { studentId } = useParams()

	const [studentData, setStudentData] = useState(null)
	const [sessions, setSessions] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [message, setMessage] = useState(null)
	const [unpaidSummary, setUnpaidSummary] = useState(0)
	const navigate = useNavigate()

	// Confirmation modal state
	const [confirmModal, setConfirmModal] = useState({
		open: false,
		message: '',
		onConfirm: () => {},
		onCancel: () => {},
	})

	// Helper function for confirmation dialog
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

	useEffect(() => {
		const fetchSessions = async () => {
			setIsLoading(true)
			try {
				// Fetch student details and sessions in parallel
				const studentRef = doc(db, 'students', studentId)
				const sessionsRef = collection(db, `students/${studentId}/sessions`)

				const [studentSnap, sessionsSnap] = await Promise.all([
					getDoc(studentRef),
					getDocs(sessionsRef),
				])

				if (studentSnap.exists()) {
					setStudentData(studentSnap.data())
				} else {
					console.error('תלמיד לא נמצא')
				}

				// Format and sort sessions by date
				const formattedSessions = sessionsSnap.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))

				const sortedSessions = formattedSessions.sort(
					(a, b) => new Date(b.start) - new Date(a.start)
				)
				setSessions(sortedSessions)
			} catch (error) {
				console.error('שגיאה בטעינת שיעורים: ', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchSessions()
	}, [studentId])

	useEffect(() => {
		const totalUnpaid = sessions.reduce((sum, session) => {
			return !session.paid && !session.canceled ? sum + Number(session.price) : sum
		}, 0)
		setUnpaidSummary(totalUnpaid)
	}, [sessions])

	const handleMarkAsPaid = async (sessionId, isGroup) => {
		let confirmationMessage = 'האם את בטוחה שברצונך לסמן את השיעור כשולם?'
		if (isGroup) {
			confirmationMessage += ' זהו שיעור קבוצתי.'
		}
		const confirmed = await confirmDialog(confirmationMessage)
		if (!confirmed) return

		try {
			const sessionRef = doc(db, `students/${studentId}/sessions`, sessionId)
			await updateDoc(sessionRef, { paid: true })
			setSessions(prevSessions =>
				prevSessions.map(session =>
					session.id === sessionId ? { ...session, paid: true } : session
				)
			)
		} catch (error) {
			console.error('שגיאה בסימון שיעור כשולם: ', error)
		}
	}

	const handleCancelSession = async (sessionId, isGroup) => {
		let confirmationMessage = 'האם את בטוחה שברצונך לבטל את השיעור?'
		if (isGroup) {
			confirmationMessage += ' זהו שיעור קבוצתי.'
		}
		const confirmed = await confirmDialog(confirmationMessage)
		if (!confirmed) return

		setIsLoading(true)
		try {
			const sessionRef = doc(db, `students/${studentId}/sessions`, sessionId)
			const sessionSnap = await getDoc(sessionRef)
			if (sessionSnap.exists()) {
				await updateDoc(sessionRef, { canceled: true })
			} else {
				await setDoc(sessionRef, { canceled: true })
			}

			setSessions(prevSessions =>
				prevSessions.map(session =>
					session.id === sessionId ? { ...session, canceled: true } : session
				)
			)
			setMessage('השיעור בוטל בהצלחה')
		} catch (error) {
			console.error('שגיאה בביטול השיעור: ', error)
			setMessage('היתה בעיה בביטול השיעור, נסי שוב')
		} finally {
			setIsLoading(false)
		}
	}

	// Helper function to return Hebrew month name
	const getHebrewMonth = monthIndex => {
		const hebrewMonths = [
			'ינואר',
			'פברואר',
			'מרץ',
			'אפריל',
			'מאי',
			'יוני',
			'יולי',
			'אוגוסט',
			'ספטמבר',
			'אוקטובר',
			'נובמבר',
			'דצמבר',
		]
		return hebrewMonths[monthIndex]
	}

	// Group sessions by month-year
	const groupedSessions = sessions.reduce((acc, session) => {
		const sessionDate = new Date(session.start)
		const month = sessionDate.getMonth()
		const year = sessionDate.getFullYear()
		const monthYear = `${year}-${month}`
		if (!acc[monthYear]) {
			acc[monthYear] = []
		}
		acc[monthYear].push(session)
		return acc
	}, {})

	return (
		<>
			{/* Full-width StudentAutocomplete right under the navbar */}
			<div className='student-autocomplete-container'>
				<StudentAutocomplete
					multiple={false}
					selectedStudents={[]} // No local state needed here for navigation
					setSelectedStudent={selected => {
						if (selected && selected.id !== studentId) {
							navigate(`/students/${selected.id}`)
						}
					}}
					onNewStudentDialogOpen={() => {}}
					setNewStudentName={() => {}}
				/>
			</div>
			<div className='student-page page-layout'>
				<h1 className='page-title'>
					{studentData ? `${studentData.name} ${studentData.familyName}` : 'טוען פרטי תלמיד...'}
				</h1>

				{studentData && (
					<div className='student-contact'>
						<p>טלפון: {studentData.phone ? studentData.phone : 'לא צוין'}</p>
						<p>טלפון הורה: {studentData.parentPhone ? studentData.parentPhone : 'לא צוין'}</p>
					</div>
				)}

				{isLoading ? (
					<p>טוען...</p>
				) : (
					<>
						<div className='unpaid-summary'>
							<p>
								{`סך הכל לתשלום: ${unpaidSummary} שקלים`}
								<small> (לא כולל שיעורים מהיום שלא שולמו)</small>
							</p>
						</div>

						<div className='sessions-list'>
							{Object.keys(groupedSessions).map(monthYear => {
								const sessionsInMonth = groupedSessions[monthYear]
								const firstSessionDate = new Date(sessionsInMonth[0].start)
								const hebrewMonth = getHebrewMonth(firstSessionDate.getMonth())

								return (
									<div key={monthYear} className='month-group'>
										<h2>
											{hebrewMonth} {firstSessionDate.getFullYear()}
										</h2>
										{sessionsInMonth.map(session => {
											const sessionDate = DateTime.fromISO(session.start, {
												zone: 'Asia/Jerusalem',
											})
											const weekday = sessionDate
												.setLocale('he')
												.toFormat('cccc')
												.replace(/^יום\s?/, '')
											const formattedDate = sessionDate.toFormat('dd/MM')
											const sessionTime = sessionDate.toFormat('HH:mm')
											const isGroup = session.isGroup

											return (
												<div key={session.id} className='session-row'>
													<div className='session-details'>
														<div className='session-cell'>
															<h3>{formattedDate}</h3>
														</div>

														<div className='session-cell cell-bg'>
															<p>
																{weekday}&nbsp; {sessionTime}
															</p>
														</div>

														<div className='session-cell'>
															<p>{session.price ? `${session.price} ₪` : 'לא צוין'}</p>
														</div>
														<div className='session-cell'>
															{isGroup && (
																<div className='group-badge'>
																	<p>שיעור קבוצתי</p>
																</div>
															)}
														</div>

														<div className='session-cell'>
															{session.canceled ? (
																<p className='canceled'>בוטל</p>
															) : !session.paid ? (
																<button
																	className='btn-small'
																	onClick={() => handleMarkAsPaid(session.id, isGroup)}>
																	שולם
																</button>
															) : (
																<>
																	<CheckCircleIcon
																		style={{
																			marginRight: '8px',
																			verticalAlign: 'middle',
																			color: 'var(--paid-color)',
																		}}
																	/>
																	<p className='paid'>השיעור שולם</p>
																</>
															)}
															{!session.paid && !session.canceled && (
																<button
																	className='btn-small'
																	onClick={() => handleCancelSession(session.id, isGroup)}
																	disabled={session.canceled || session.paid}>
																	בוטל
																</button>
															)}
														</div>
													</div>
												</div>
											)
										})}
									</div>
								)
							})}
						</div>
					</>
				)}

				<Snackbar
					open={message !== null}
					autoHideDuration={2000}
					onClose={() => setMessage(null)}
					message={message}
				/>

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
		</>
	)
}
