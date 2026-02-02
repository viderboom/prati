// theme.js
import { createTheme } from '@mui/material/styles'
import { heIL } from '@mui/material/locale' // For Hebrew language support (optional)

const rtlTheme = createTheme(
	{
		direction: 'rtl', // Enable RTL
		typography: {
			fontFamily: `'Heebo', 'Arial', 'sans-serif'`, // Adjust as needed
		},
	},
	heIL // Hebrew localization (optional, change as per your language)
)

export default rtlTheme
