
CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES Volunteers(id) NOT NULL,
  session_id INTEGER REFERENCES Session(id) NOT NULL,
  booking_code VARCHAR(10) UNIQUE NOT NULL,
  cancellation_timestamp TIMESTAMP,
  cancellation_reason VARCHAR(255),
  is_cancelled BOOLEAN
);