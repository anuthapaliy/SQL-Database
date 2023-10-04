CREATE TABLE Booking3 (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES Volunteers1(id) NOT NULL,
  session_id INTEGER REFERENCES Session1(id) NOT NULL

);

