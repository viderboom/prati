//styles
import './Dashboard.css'
//mui
import Snackbar from '@mui/material/Snackbar'
//components
import Calendar from '../components/Calendar'
//hooks
import { useEffect, useState } from 'react'


export default function Dashboard() {
	// const [showPopup, setShowPopup] = useState(false)

	const [openMsg, setOpenMsg] = useState(false)
	const [message, setMessage] = useState(null)
	
    useEffect(() => {
		const handleShowMessage = () => {
			setOpenMsg(true)
		}

		message && handleShowMessage()
	}, [message])

	

	const handleCloseMessage = () => {
		setOpenMsg(false)
		setMessage(null)
	}

	

	return (
		<div className='dashboard-container'>
			<div className='page-layout'>
				{<Calendar  setMessage={setMessage}/>}

				{/* button for adding new class */}
				{/* <Box className='float-btn' onClick={toggleModal} sx={{ '& > :not(style)': { m: 1 } }}>
				<Fab size='medium' color='secondary' aria-label='add'>
					<AddIcon />
				</Fab>
			</Box> */}

				{openMsg && (
					<Snackbar
						open={openMsg}
						autoHideDuration={2000}
						onClose={() => handleCloseMessage()}
						message={message}
					/>
				)}
			</div>

		</div>
	)
}
