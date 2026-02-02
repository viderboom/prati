//style
import './Modal.css'
import ClosePopUpButton from '../components/ClosePopUpButton'

export default function Modal({ children, handleClose, isLoader }) {

	return (
	    <div className={`modal-backdrop ${isLoader ? 'modal-backdrop-white' : ''}`} onClick={handleClose}>

            <div className={`modal ${isLoader ? 'modal-no-bg' : ''}`} onClick={e => e.stopPropagation()}>

                <ClosePopUpButton handleClose={handleClose} />

				{children}
			</div>
		</div>
	)
}
