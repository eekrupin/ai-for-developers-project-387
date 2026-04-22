import { Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { OwnerLayout } from './layouts/OwnerLayout'
import { BookingSuccessPage } from './pages/guest/BookingSuccessPage'
import { CreateBookingPage } from './pages/guest/CreateBookingPage'
import { EventTypeDetailsPage } from './pages/guest/EventTypeDetailsPage'
import { EventTypesPage } from './pages/guest/EventTypesPage'
import { OwnerAvailabilityPage } from './pages/owner/OwnerAvailabilityPage'
import { OwnerBookingsPage } from './pages/owner/OwnerBookingsPage'
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage'
import { OwnerEventTypesPage } from './pages/owner/OwnerEventTypesPage'
import { OwnerProfilePage } from './pages/owner/OwnerProfilePage'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<EventTypesPage />} />
        <Route path="event-types/:eventTypeId" element={<EventTypeDetailsPage />} />
        <Route path="bookings/new" element={<CreateBookingPage />} />
        <Route path="bookings/success" element={<BookingSuccessPage />} />
        <Route path="owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboardPage />} />
          <Route path="profile" element={<OwnerProfilePage />} />
          <Route path="event-types" element={<OwnerEventTypesPage />} />
          <Route path="availability" element={<OwnerAvailabilityPage />} />
          <Route path="bookings" element={<OwnerBookingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
