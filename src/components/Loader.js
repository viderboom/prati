//mui
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function Loader() {
	return (
		<Box sx={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<CircularProgress />
		</Box>
	)
}
