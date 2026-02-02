import './TimeVisual.css'

import PropTypes from 'prop-types'

export default function TimeVisual({ eventInfo }) {
	const startDateTime = new Date(eventInfo.start)
	const dayOfWeek = startDateTime.toLocaleDateString('he-IL', { weekday: 'long' })

	const day = startDateTime.toLocaleDateString('he-IL', { day: '2-digit' })
	const month = startDateTime.toLocaleDateString('he-IL', { month: 'long' })
	const year = startDateTime.toLocaleDateString('he-IL', { year: 'numeric' })

	const startTime = startDateTime.toLocaleTimeString('he-IL', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	})


	return (
		<div className='time-visual'>
			<div className='time-visual__date'>
				<span className='date'>{`${day} ב${month} `}</span>
				<span className='date'>{year}</span>
			</div>

			<div className='time-visual__day-time'>
				<span className='time-visual__day'>{dayOfWeek}</span>
				<span className='time-visual__time'>{startTime}</span>
			</div>
		</div>
	)
}

TimeVisual.propTypes = {
	eventInfo: PropTypes.shape({
		start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
	}).isRequired,
}
