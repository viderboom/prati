import close from '../assets/close_x.svg'
import './ClosePopUpButton.css'

export default function ClosePopUpButton({ handleClose }) {
	if (!handleClose) return null

	return (
		<div className='close'>
			<img src={close} alt='סגור חלון' onClick={handleClose} />
		</div>
	)
}
