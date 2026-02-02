import React, { useState, useEffect } from 'react'
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import './SettingsPage.css'

// Use MUI’s TextField for proper DatePicker dialog behavior
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Import your custom Modal component
import Modal from '../components/Modal'

const SettingsPage = () => {
	// Default prices state
	const [privatePrice, setPrivatePrice] = useState('')
	const [groupPrice, setGroupPrice] = useState('')

	// Vacation form state using two DatePickers
	const [showVacationForm, setShowVacationForm] = useState(false)
	const [vacationStartDate, setVacationStartDate] = useState(null)
	const [vacationEndDate, setVacationEndDate] = useState(null)

	// Loading and message/error state
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	// Custom confirmation modal state
	const [confirmModal, setConfirmModal] = useState({
		open: false,
		message: '',
		onCancel: () => {},
		onConfirm: () => {},
	})

	// Fetch current default prices from Firestore on mount
	useEffect(() => {
		const fetchDefaults = async () => {
			try {
				const defaultsRef = doc(db, 'settings', 'defaults')
				const defaultsSnap = await getDoc(defaultsRef)
				if (defaultsSnap.exists()) {
					const data = defaultsSnap.data()
					if (data.privatePrice !== undefined) {
						setPrivatePrice(String(data.privatePrice))
					}
					if (data.groupPrice !== undefined) {
						setGroupPrice(String(data.groupPrice))
					}
				}
			} catch (error) {
				console.error('Error fetching default prices:', error)
			}
		}
		fetchDefaults()
	}, [])

	// Save default prices to Firestore under settings/defaults
	const handleSaveDefaults = async () => {
		if (privatePrice === '' || groupPrice === '') {
			setError('יש למלא את כל שדות המחירים')
			return
		}
		setLoading(true)
		setError('')
		try {
			await setDoc(
				doc(db, 'settings', 'defaults'),
				{
					privatePrice: Number(privatePrice),
					groupPrice: Number(groupPrice),
				},
				{ merge: true }
			)
			setMessage('מחירים נשמרו בהצלחה')
		} catch (err) {
			console.error(err)
			setError('אירעה שגיאה בשמירת המחירים')
		} finally {
			setLoading(false)
		}
	}

	// Submit vacation dates after confirmation
	// const handleSubmitVacation = async () => {
	// 	setError('')

	// 	// Validate that both dates are filled
	// 	if (!vacationStartDate || !vacationEndDate) {
	// 		setError('יש למלא את שני התאריכים')
	// 		return
	// 	}
	// 	// Validate that start date is not after end date
	// 	if (vacationStartDate > vacationEndDate) {
	// 		setError('תאריך התחלה לא יכול להיות אחרי תאריך סיום')
	// 		return
	// 	}

	// 	setLoading(true)
	// 	try {
	// 		const vacationPeriod = {
	// 			start: vacationStartDate.toISOString().split('T')[0],
	// 			end: vacationEndDate.toISOString().split('T')[0],
	// 		}
	// 		await updateDoc(doc(db, 'settings', 'defaults'), {
	// 			vacationPeriods: arrayUnion(vacationPeriod),
	// 		})
	// 		setMessage('חופשה נשמרה בהצלחה')
	// 		// Reset vacation form
	// 		setVacationStartDate(null)
	// 		setVacationEndDate(null)
	// 		setShowVacationForm(false)
	// 	} catch (err) {
	// 		console.error(err)
	// 		setError('אירעה שגיאה בשמירת החופשה')
	// 	} finally {
	// 		setLoading(false)
	// 		setConfirmModal({ ...confirmModal, open: false })
	// 	}
	// }

	// Open the confirmation modal for vacation submission
	// const openConfirmModal = () => {
	// 	if (!vacationStartDate || !vacationEndDate) {
	// 		setError('יש למלא את שני התאריכים')
	// 		return
	// 	}
	// 	setConfirmModal({
	// 		open: true,
	// 		message: 'האם את בטוחה שברצונך להגיש את חופשתך? כל המידע שהוזן יישמר.',
	// 		onCancel: () => setConfirmModal({ ...confirmModal, open: false }),
	// 		onConfirm: handleSubmitVacation,
	// 	})
	// }

	return (
		<div className='page-layout settings-container'>
			<h1 className='page-title'>הגדרות</h1>

			{/* Default Prices Section */}
			<section className='settings-section'>
				<h3>מחירים בשקלים ₪</h3>
				<label>
					מחיר שיעור פרטי
					<input
						type='number'
						value={privatePrice}
						onChange={e => setPrivatePrice(e.target.value)}
						className='input-field'
					/>
				</label>
				<label>
					מחיר שיעור קבוצתי
					<div className='price-input'>
						<input
							type='number'
							value={groupPrice}
							onChange={e => setGroupPrice(e.target.value)}
							className='input-field'
						/>
					</div>
				</label>
				<button className='btn-small' onClick={handleSaveDefaults} disabled={loading}>
					{loading ? 'שומר...' : 'שמרי שינויים'}
				</button>
			</section>

			{/* Vacation Section */}
			{/* (Vacation section is currently commented out)
      <section className="settings-section">
        <h3>חופשה</h3>
        {!showVacationForm && (
          <button className="btn-small" onClick={() => setShowVacationForm(true)}>
            צאי לחופשה
          </button>
        )}
        {showVacationForm && (
          <div className="vacation-form">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div className="date-picker-container">
                <DatePicker
                  label="תאריך התחלה"
                  value={vacationStartDate}
                  onChange={newValue => setVacationStartDate(newValue)}
                  renderInput={params => <TextField {...params} className="input-field" />}
                />
                <DatePicker
                  label="תאריך סיום"
                  value={vacationEndDate}
                  onChange={newValue => setVacationEndDate(newValue)}
                  renderInput={params => <TextField {...params} className="input-field" />}
                />
              </div>
            </LocalizationProvider>
            <div className="vacation-form-actions">
              <button className="btn-small approve-btn" onClick={openConfirmModal}>
                צאי לחופשה
              </button>
              <button className="btn-small dismiss-btn" onClick={() => setShowVacationForm(false)}>
                חזרה
              </button>
            </div>
          </div>
        )}
      </section>
      */}

			{error && <p className='error'>{error}</p>}
			{message && <p className='message'>{message}</p>}

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
								{loading ? 'שומר...' : 'אישור'}
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	)
}

export default SettingsPage
