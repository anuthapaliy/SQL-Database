CREATE TABLE Booking3 (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES Volunteers1(id) NOT NULL,
  session_id INTEGER REFERENCES Session1(id) NOT NULL,
  booking_code VARCHAR(10) UNIQUE NOT NULL, -- Unique identifier for each booking
  -- Add any additional columns related to bookings
);
-- (allow multiple booking for each )

