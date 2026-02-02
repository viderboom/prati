import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import { DateTime } from 'luxon' // For handling time zones and date formatting
// import { defineSecret } from 'firebase-functions/params'

import pkg from 'rrule'
const { RRule } = pkg

// import twilio from 'twilio'

// Securely access secrets
// const TWILIO_ACCOUNT_SID = defineSecret('TWILIO_ACCOUNT_SID')
// const TWILIO_AUTH_TOKEN = defineSecret('TWILIO_AUTH_TOKEN')

// Initialize Firebase Admin SDK
initializeApp()

const db = getFirestore()

//------------ monthlySummary ------------------------------------------------------------------

// export const monthlySummary = onSchedule(
// 	{
// 		schedule: '0 5 1 * *', // Runs on the 1st of every month at 05:00 AM
// 		timeZone: 'Asia/Jerusalem', // Set the timezone
// 		secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN], // <-- New way to use secrets
// 	},
// 	async () => {
// 		try {
// 			const twilioClient = twilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value())

// 			const studentsSnap = await db.collection('students').get()

// 			for (const studentDoc of studentsSnap.docs) {
// 				const studentData = studentDoc.data()

// 				const sessionsSnap = await db
// 					.collection(`students/${studentDoc.id}/sessions`)
// 					.where('paid', '==', false)
// 					// .where('canceled', '!=', true)
// 					.get()

// 				// Filter out canceled sessions
// 				const unpaidSessions = sessionsSnap.docs
// 					.map(doc => ({ id: doc.id, ...doc.data() }))
// 					.filter(session => !session.canceled)

// 				console.log(
// 					'Found sessions:',
// 					sessionsSnap.docs.map(doc => doc.data())
// 				)

// 				if (unpaidSessions.length > 0) {
// 					// Calculate total debt
// 					const totalDebt = unpaidSessions.reduce((sum, session) => sum + (session.price || 0), 0)

// 					// Convert session dates to readable format
// 					const sessionDetails = unpaidSessions
// 						.map(session => {
// 							const dateTime = DateTime.fromISO(session.start, {
// 								zone: 'Asia/Jerusalem',
// 							}).toFormat('dd/MM/yyyy HH:mm')
// 							return `📅 ${dateTime} - ₪${session.price}`
// 						})
// 						.join('\n')

// 					// Hebrew message
// 					//const message = `🔔 תזכורת: יש לך ${unpaidSessions.length} מפגש(ים) שלא שולמו בסכום כולל של ₪${totalDebt}. נא להסדיר את התשלום בהקדם.\n\nמועדי המפגשים:\n${sessionDetails}`

// 					// Use parent's phone number if available, otherwise fall back to phone
// 					//const phoneNumber = studentData.parentPhone || studentData.phone

// 					// Send SMS/WhatsApp
					
// 				}
// 			}
// 		} catch (error) {
// 			console.error('Error in monthlySummary function:', error)
// 			throw error // Ensure retries in case of failure
// 		}
// 	}
// )

//------------ dailySummary ------------------------------------------------------------------

export const dailySummary = onSchedule(
	{
		schedule: '30 23 * * *', // Runs every day at 23:30
		timeZone: 'Asia/Jerusalem', // Set the timezone
	},
	async () => {
		try {
			console.log('Starting dailySummary.')

			const today = new Date()
			const startOfDay = new Date(today.setHours(0, 0, 0, 0))
			const endOfDay = new Date(today.setHours(23, 59, 59, 999))

			const classesRef = db.collection('classes')
			const snapshot = await classesRef.get()

			if (snapshot.empty) {
				console.log('No classes found.')
				return
			}

			const batch = db.batch() // Use batch writes for performance

			for (const classDoc of snapshot.docs) {
				const classData = classDoc.data()
        const students = classData.student ? [classData.student] : []

                
				// Handle recurring classes
				let occurrences = []

				if (classData.rrule) {
					const rrule = new RRule({
						freq: RRule[classData.rrule.freq.toUpperCase()],
						dtstart: new Date(classData.rrule.dtstart),
						byweekday: classData.rrule.byweekday?.map(day => RRule[day.toUpperCase()]) || undefined,
						interval: classData.rrule.interval || 1,
					})
					// Get today's occurrences
					occurrences = rrule.between(startOfDay, endOfDay)
				} else if (new Date(classData.start) < startOfDay || new Date(classData.start) > endOfDay) {
					continue // Skip non-recurring classes that don't occur today
				}

				// // Add non-recurring classes as single occurrences
				if (!classData.rrule) {
					occurrences.push(new Date(classData.start))
				}

				for (const occurrence of occurrences) {
					// !IMPORTANT: IF CHANGING SESSION PROPERTIES - MUST ALSO CHANGE IN EventManager.js
					// const sessionId = classData.start.split('+')[0] // Unique session ID for today and class time

					// Generate a unique session ID using the occurrence date and class document ID
					const sessionId = `${classDoc.id}_${DateTime.fromJSDate(occurrence, {
						zone: 'Asia/Jerusalem',
					}).toFormat("yyyy-MM-dd'T'HH:mm:ss")}`

					for (const student of students) {
						const studentSessionsRef = db.collection(`students/${student.id}/sessions`)
						const sessionDocRef = studentSessionsRef.doc(sessionId)

						// Check if the session document already exists
						const sessionDoc = await sessionDocRef.get()
						if (!sessionDoc.exists) {
							// !IMPORTANT: IF CHANGING SESSION PROPERTIES - MUST ALSO CHANGE IN EventManager.js
							batch.set(sessionDocRef, {
								start: DateTime.fromJSDate(occurrence, { zone: 'Asia/Jerusalem' }).toISO({
									suppressMilliseconds: true,
								}),
								price: classData.pricePerStudent,
								paid: false,
								canceled: false,
								studentId: student.id,
								updatedBy: 'dailySummary function',
							})
						} else {
							console.log(
								`Session already exists for student: ${student.id}, session: ${sessionId}`
							)
						}
					}
				}
			}

			// Commit the batch
			await batch.commit()
			console.log('Sessions successfully saved.')
		} catch (error) {
			console.error('Error in dailySessionSummary function:', error)
			throw error // Ensure retries in case of failure
		}
	}
)
