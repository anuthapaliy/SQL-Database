CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES volunteers(id) NOT NULL,
  session_id INTEGER REFERENCES Session(id) NOT NULL,
  booking_code VARCHAR(10) UNIQUE NOT NULL-- Unique identifier for each booking
  cancellation_timestamp TIMESTAMP, -- Timestamp of cancellation, if applicable
  cancellation_reason VARCHAR(255), -- Reason for cancellation, if applicable
  is_cancelled BOOLEAN -- Indicates if the booking is cancelled (true/false)
  -- Add any additional columns related to bookings
);

CREATE TABLE Session (
  
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  session_type VARCHAR(255) NOT NULL
  
);

CREATE TABLE volunteers (
  id SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  email  VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
cancelled BOOLEAN NOT NULL
 
);