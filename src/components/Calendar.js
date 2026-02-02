import './Calendar.css'
import rrulePlugin from '@fullcalendar/rrule'
import heLocale from '@fullcalendar/core/locales/he'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useRef, useState } from 'react'
//components
import Modal from './Modal'
import AddClass from './AddClass'
import EventManager from './EventManager'
//hooks
import { useCollection } from '../hooks/useCollection'
import dayjs from 'dayjs'
import 'dayjs/locale/he' // if you're using Hebrew locale
dayjs.locale('he') // Set locale globally

export default function Calendar({ setMessage }) {
	const { documents, error: collectionErr } = useCollection('classes')

	const getView = () => {
		return window.matchMedia('(orientation: portrait)').matches || window.innerWidth < 760
			? 'threeDay'
			: 'timeGridWeek'
	}

	const [calendarView, setCalendarView] = useState(getView)

	const calendarRef = useRef(null)
	const [events, setEvents] = useState([])
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [selectedDate, setSelectedDate] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const handleResize = () => {
			const newView = getView()
			setCalendarView(newView)
			if (calendarRef.current) {
				const calendarApi = calendarRef.current.getApi()
				calendarApi.changeView(newView) // Force update view
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Load events from Firestore
	useEffect(() => {
		if (documents) {
			setEvents(documents)
			setIsLoading(false)
		} else if (collectionErr) {
			setIsLoading(false)
			console.log(collectionErr)
		}
	}, [documents, collectionErr])

	// Event selection handlers
	const handleDateSelect = clickInfo => {
		// console.log(clickInfo)
		setSelectedDate(clickInfo.dateStr)
	}

	const handleEventClick = clickInfo => {
		// console.log(clickInfo)
		setSelectedEvent(clickInfo.event)
	}

	return (
		<div className='calendar-container'>
			{events && (
				<FullCalendar
					ref={calendarRef}
                    timeZone="Asia/Jerusalem" 
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
					initialView={calendarView} // Use the dynamic view
					height='auto'
					slotDuration='00:30:00'
					headerToolbar={{
						left: 'prev,next today',
						center: '',
						right: 'title',
					}}
					views={{
						threeDay: {
							type: 'timeGrid',
							duration: { days: 3 },
							buttonText: '3 Days', // Text for the custom view button
						},
					}}
					allDaySlot={false}
					slotMinTime='07:00:00'
					slotMaxTime='23:00:00'
					slotLabelFormat={{
						hour: '2-digit',
						minute: '2-digit',
						hour12: false,
					}}
					businessHours={{
						daysOfWeek: [0, 1, 2, 3, 4, 5], // sunday to friday as business days
						startTime: '07:00', // Business hours start
						endTime: '23:00', // Business hours end
					}}
					events={events}
					eventClassNames={info =>
						info.event.extendedProps.type === 'one-time' ? 'one-time-event' : 'recurring-event'
					}
					eventContent={info => {
						const { title, extendedProps } = info.event
						return (
							<div>
								<div className='event-title'>{title}</div>
								{extendedProps?.students?.map((s, index) => (
									<div key={s.id + index}>
										<span>{s.fullName}</span>
									</div>
								))}
							</div>
						)
					}}
					selectable={true}
					selectMirror={true} // Show visual feedback when selecting
					dateClick={handleDateSelect}
					eventClick={handleEventClick}
					eventOverlap={false}
					locale={heLocale}
					dayCellClassNames={info => {
						// Add a custom class for Saturdays
						return info.date.getDay() === 6 ? 'saturday-highlight' : ''
					}}
				/>
			)}

			{selectedEvent && (
				<Modal handleClose={() => setSelectedEvent(null)}>
					<EventManager event={selectedEvent} handleClose={() => setSelectedEvent(null)} />
				</Modal>
			)}

			{selectedDate && (
				<Modal handleClose={() => setSelectedDate(null)}>
					<AddClass
						setMessage={setMessage}
						selectedDateStr={selectedDate}
						handleClose={() => setSelectedDate(null)}
					/>
				</Modal>
			)}
		</div>
	)
}
