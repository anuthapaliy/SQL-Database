CREATE TABLE session (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  session_type VARCHAR(255) NOT NULL
);

CREATE TABLE volunteer (
  id SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  email  VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  cancelled BOOLEAN NOT NULL
 
);

CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES volunteer(id) NOT NULL,
  session_id INTEGER REFERENCES session(id) NOT NULL,
  booking_code VARCHAR(10) UNIQUE NOT NULL                 -- Unique identifier for each booking
  -- Add any additional columns related to bookings
);
-- (allow multiple booking for each )
