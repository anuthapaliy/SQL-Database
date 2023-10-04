CREATE TABLE Booking2 (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES Volunteers1(id) NOT NULL,
  session_id INTEGER REFERENCES Session1(id) NOT NULL,
  PRIMARY KEY (volunteer_id, session_id)
);

