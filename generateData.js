const { Pool } = require("pg");
const dotenv = require('dotenv');
dotenv.config();

const db = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  db.connect(function (err){
    // if (err) throw err;
    console.log("Connected to the database");
    });


    //a. Function to add volunteers
    async function addVolunteers() {
      // No. of volunteers to generate
    const volunteersNo = 100;

  // Loop to generate and insert volunteers
  for (let i = 1; i<= volunteersNo; i++){
  // Generate a volunteer data
  const name = `Volunteer ${i}`;
  const email = `volunteer${i}@exam.com`;
  const phone_number = `123456789${i.toString().padStart(2, '0')}`;
  const cancelled = Math.random()<0.2;


  const query = {
  text:
     "INSERT INTO Volunteers1 (name, email, phone_number, cancelled) VALUES ($1, $2, $3, $4)",
    values: [name, email, phone_number, cancelled],
    }; 

    try {

      // Insert the volunteer data into the database
      await db.query(query);
      console.log(`Inserted volunteer: ${name}`);
  } catch (error) {
      console.error(`Error inserting volunteer: ${name}`, error);

    
  }
  }
}
  
  // call function addVolunteers
    addVolunteers()
      .then(() => {
      console.log('Data generation completed for volunteers.');
            
        })
      .catch(error => {
        console.error('Volunteer generation failed:', error);
    })



// add 2 sessions a day(afternoon and night)
// Function to add afternoon and night sessions for a month
async function addAfternoonAndNightSessions() {
  const startDate = new Date('2023-09-24');
  const endDate = new Date('2023-10-24');

  // Loop through each day within the specified range
  while (startDate <= endDate) {
    const date = startDate.toISOString().split('T')[0]; // Get date in 'YYYY-MM-DD' format

    // Add afternoon session
    const afternoonTime = '15:00:00';
    const afternoonQuery = {
      text: "INSERT INTO Session1 (date, time, session_type) VALUES ($1, $2, 'Afternoon')",
      values: [date, afternoonTime],
    };

    try {
      await db.query(afternoonQuery);
      console.log(`Inserted afternoon session for ${date}`);
    } catch (error) {
      console.error(`Error inserting afternoon session for ${date}`, error);
    }

    // Add night session
    const nightTime = '21:00:00';
    const nightQuery = {
      text: "INSERT INTO Session1 (date, time, session_type) VALUES ($1, $2, 'Night')",
      values: [date, nightTime],
    };

    try {
      await db.query(nightQuery);
      console.log(`Inserted night session for ${date}`);
    } catch (error) {
      console.error(`Error inserting night session for ${date}`, error);
    }

    // Increment date for the next iteration
    startDate.setDate(startDate.getDate() + 1);
  }

  console.log('Afternoon and night sessions generation completed for the month.');
}

// Call the function to add afternoon and night sessions
addAfternoonAndNightSessions()
  .then(() => {
    console.log('Data generation completed.');
  })
  .catch((error) => {
    console.error('Data generation failed:', error);
  });


  // c. allocate random session
  // Function to generate random data and allocate sessions to volunteers
async function generateDataAndAllocateSessions() {
  try {
    // Generate random volunteers data
    const volunteersData = [];
    for (let i = 1; i <= 100; i++) {
      volunteersData.push({
        name: `Volunteer ${i}`,
        email: `volunteer${i}@example.com`,
        phone_number: `123-456-${i.toString().padStart(2, '0')}`,
        cancelled: i % 5 === 0, // Simulate some volunteers being canceled
      });
    }

    

    // Insert volunteers data into the Volunteers1 table
    const insertVolunteersQuery =
      'INSERT INTO Volunteers1 (name, email, phone_number, cancelled) VALUES ($1, $2, $3, $4) RETURNING id';

    const volunteerIds = [];
    for (const volunteerData of volunteersData) {
      const { rows } = await db.query(insertVolunteersQuery, [
        volunteerData.name,
        volunteerData.email,
        volunteerData.phone_number,
        volunteerData.cancelled,
      ]);
      volunteerIds.push(rows[0].id);
    }

    

    // Generate random session data
    
    const sessionsData = [];
    const startDate = new Date('2023-09-24');
    const endDate = new Date('2023-10-24');

    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const date = currentDate.toISOString().split('T')[0];

      // Generate morning and evening sessions for each day
      const morningSession = {
        date,
        time: '09:00:00',
        session_type: 'Morning',
      };
      const eveningSession = {
        date,
        time: '15:00:00',
        session_type: 'Evening',
      };

      sessionsData.push(morningSession);
      sessionsData.push(eveningSession);
    }

   

    // Insert sessions data into the Session1 table
    
    const insertSessionsQuery =
      'INSERT INTO Session1 (date, time, session_type) VALUES ($1, $2, $3) RETURNING id';

    const sessionIds = [];
    for (const sessionData of sessionsData) {
      const { rows } = await db.query(insertSessionsQuery, [
        sessionData.date,
        sessionData.time,
        sessionData.session_type,
      ]);
      sessionIds.push(rows[0].id);
    }

    // Randomly allocate sessions to volunteers
    const allocatedSessionsData = [];
    for (const volunteerId of volunteerIds) {
      const randomSessionId = sessionIds[Math.floor(Math.random() * sessionIds.length)];
      allocatedSessionsData.push({
        volunteer_id: volunteerId,
        session_id: randomSessionId,
      });
    }

    // Insert allocated sessions data into the Booking3 table
    
    const insertAllocatedSessionsQuery =
      'INSERT INTO Booking3 (volunteer_id, session_id) VALUES ($1, $2)';

    for (const allocatedSessionData of allocatedSessionsData) {
      await db.query(insertAllocatedSessionsQuery, [
        allocatedSessionData.volunteer_id,
        allocatedSessionData.session_id,
      ]);
    }

    

    console.log('Data generation and session allocation completed.');
  } catch (error) {
    console.error('Error generating data and allocating sessions:', error);
  } finally {
    // Release the database connection
    db.end();
  }
}

// Call the function to generate data and allocate sessions
generateDataAndAllocateSessions()
  .then(() => {
    console.log('Data generation and session allocation completed.');
  })
  .catch((error) => {
    console.error('Error:', error);
  });






