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



// b. add 2 sessions a day
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
