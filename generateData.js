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

    // b.Add two sessions a day
    async function AddTwoSessions() {
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-31');

      const sessionTimes = ['morning', 'evening'];

      let currentDate = startDate;
      while (currentDate <= endDate) {
          for (const sessionTime of sessionTimes) {
              let sessionDate = currentDate.toISOString().split('T')[0];

              let sessionTimeValue;
           let sessionType;

           if (sessionTime === 'morning') {
           sessionTimeValue = '08:00:00';
             sessionType = 'morning';
             } else {
           sessionTimeValue = '15:00:00';
             sessionType = 'evening';
}

              
              let isBooked = Math.random() < 0.2;

  // console.log(`processing date: ${sessionDate}, time: ${sessionTime}, type: ${sessionType}, booked: ${isBooked} `);

//sql query to insert a session
  const insertQuery = {
      text: 'INSERT INTO sessions (date, time, session_type, booked) VALUES ($1, $2, $3, $4)',
      values: [sessionDate, sessionTimeValue, sessionType, isBooked]
  };

  try {
      await db.query(insertQuery);
      console.log(`Inserted session for ${sessionDate} (${sessionTime})`);
  } catch (error) {
      console.error(`Error inserting session for ${sessionDate} (${sessionTime}):`, error);
  }
}

// Move to the next day

currentDate.setDate(currentDate.getDate() + 1);
}


      
// call the add session function
      AddTwoSessions()
          .then(() => {
              console.log('Session generation completed.');
          
          })
          .catch((error) => {
              console.error('Session generation failed:', error);
          
          });