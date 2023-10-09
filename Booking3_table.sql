CREATE TABLE Booking3 (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES Volunteers(id) NOT NULL,
  session_id INTEGER REFERENCES Session(id) NOT NULL,
  booking_code VARCHAR(10) UNIQUE NOT NULL-- Unique identifier for each booking
  cancellation_timestamp TIMESTAMP, -- Timestamp of cancellation, if applicable
  cancellation_reason VARCHAR(255), -- Reason for cancellation, if applicable
  is_cancelled BOOLEAN -- Indicates if the booking is cancelled (true/false)
  -- Add any additional columns related to bookings
);
-- (allow multiple booking for each )

