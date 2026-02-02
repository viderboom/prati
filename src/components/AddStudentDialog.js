import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useFirestore } from '../hooks/useFirestore'

export default function AddStudentDialog({  onClose, studentName }) {

	const [name, setName] = useState((studentName.split(" "))[0] || '')
	const [familyName, setFamilyName] = useState((studentName.split(" "))[1] || '')
	const [telephone, setTelephone] = useState('')
    const [parentTelephone, setParentTelephone] = useState('')
    const isValidPhone = (phone) => /^\d{9,10}$/.test(phone);

	const [isLoading, setIsLoading] = useState(false)

	const { addDocument } = useFirestore()

    function formatToIsraeliNumber(phone) {
        // Remove non-digit characters
        phone = phone.replace(/\D/g, '');
    
        // If the number starts with "0", remove it
        if (phone.startsWith('0')) {
            phone = phone.substring(1);
        }
    
        // Add +972 prefix
        return `+972${phone}`;
    }
    

	const handleSave = async () => {	
		setIsLoading(true)
		try {
			const studentId = await addDocument('students', {
				name,
				familyName,
				phone: formatToIsraeliNumber(telephone),
                parentPhone:  formatToIsraeliNumber(parentTelephone),
			})
			
            onClose({ id: studentId, fullName: `${name} ${familyName}` });
		} catch (error) {
			console.error(error.message)
		} finally {
			setIsLoading(false)
		}
	}


	return (
		<div dir='rtl'>
			<Dialog open={!onclose} onClose={onClose} className='custom-dialog' dir='rtl'>
				<DialogTitle>תלמיד.ה חדש.ה</DialogTitle>
				<DialogContent>
					<TextField
						label='שם פרטי'
						fullWidth
						variant='outlined'
						dir='rtl'
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
					<TextField
						label='שם משפחה'
						fullWidth
						variant='outlined'
						dir='rtl'
						value={familyName}
						onChange={e => setFamilyName(e.target.value)}
						required
					/>
					<TextField
						label='מספר טלפון'
						fullWidth
						variant='outlined'
						dir='rtl'
						value={telephone}
						onChange={e => setTelephone(e.target.value)}
						error={ !isValidPhone(telephone) && telephone !== ''}
						helperText={
                            !isValidPhone(telephone) && telephone !== '' ? 'מספר טלפון חייב לכלול 9 או 10 ספרות' : ''
                                            
                        }
						inputProps={{
							pattern: '\\d{9,10}',
							title: 'מספר טלפון חייב להיות 9 או 10 ספרות',
						}}
                        required
					/>
                    <TextField
						label='מספר טלפון של ההורה'
						fullWidth
						variant='outlined'
						dir='rtl'
						value={parentTelephone}
						onChange={e => setParentTelephone(e.target.value)}
						required
						error={!isValidPhone(parentTelephone) && parentTelephone !== ''}
						helperText={
							!isValidPhone(parentTelephone) && parentTelephone !== '' ? 'מספר טלפון חייב לכלול 9 או 10 ספרות' : ''
						}
						inputProps={{
							pattern: '\\d{9,10}',
							title: 'מספר טלפון חייב להיות 9 או 10 ספרות',
						}}
					/>
				</DialogContent>
                
				<DialogActions>
					<Button className='btn-small dismiss-btn' onClick={onClose} disabled={isLoading}>
						ביטול
					</Button>
					<Button  className='btn-small approve-btn' onClick={handleSave} disabled={!name || !familyName  || isLoading || (!telephone && !parentTelephone)}>
						{isLoading ? 'שומר...' : 'שמירה'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}
