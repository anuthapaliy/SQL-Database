CREATE TABLE Booking2 (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES Volunteers1(id) NOT NULL,
  session_id INTEGER REFERENCES Session1(id) NOT NULL,
  status VARCHAR(255) NOT NULL
);
