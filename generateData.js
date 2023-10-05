const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const db = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// a. Function to add volunteers
async function addVolunteers() {
  // No. of volunteers to generate
  const volunteersNo = 100;

  // Loop to generate and insert volunteers
  for (let i = 1; i <= volunteersNo; i++) {
    // Generate a volunteer data
    const name = `Volunteer ${i}`;
    const email = `volunteer${i}@exam.com`;
    const phone_number = `123456789${i.toString().padStart(2, "0")}`;
    const cancelled = Math.random() < 0.2;

    const query = {
      text: "INSERT INTO Volunteers1 (name, email, phone_number, cancelled) VALUES ($1, $2, $3, $4)",
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

//b. Function to add afternoon and night sessions for a month
async function addAfternoonAndNightSessions() {
  const startDate = new Date("2023-09-24");
  const endDate = new Date("2023-10-24");

  // Loop through each day within the specified range
  while (startDate <= endDate) {
    const date = startDate.toISOString().split("T")[0]; // Get date in 'YYYY-MM-DD' format

    // Add afternoon session
    const afternoonTime = "15:00:00";
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
    const nightTime = "21:00:00";
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
}

// Function to insert a Christmas Day session(extra added for sql queries questions)

const sessionData = [];
async function addChristmasSessions() {
  const christmasSession = {
    date: "2023-12-25",
    time: "09:00:00",
    session_type: "Morning",
  };

  const christmasQuery = {
    text: "Insert into Session1 (date, time, session_type) values ($1, $2, $3)",
    values: [
      christmasSession.date,
      christmasSession.time,
      christmasSession.session_type,
    ],
  };

  try {
    await db.query(christmasQuery);
    console.log(`Inserted Christmas Day session for ${christmasSession.date}`);
  } catch (error) {
    console.error(
      `Error inserting Christmas Day session for ${christmasSession.date}:`,
      error,
    );
  }
}

const christmasDay = "2023-12-25";

// Inside loop that generates sessions, check if its Christmas Day
if (christmasDay === christmasDay) {
  const christmasMorningSession = {
    date: christmasDay,
    time: "10:00:00",
    session_type: "Morning",
  };
  sessionData.push(christmasMorningSession);
}

//c. Function to generate random data and allocate sessions to volunteers
async function generateDataAndAllocateSessions() {
  try {
    // Generate random volunteers data
    const volunteersData = [];
    for (let i = 1; i <= 100; i++) {
      volunteersData.push({
        name: `Volunteer ${i}`,
        email: `volunteer${i}@example.com`,
        phone_number: `123-456-${i.toString().padStart(2, "0")}`,
        cancelled: i % 5 === 0, // Simulate some volunteers being canceled
      });
    }

    // Insert volunteers data into the Volunteers1 table
    const insertVolunteersQuery =
      "INSERT INTO Volunteers1 (name, email, phone_number, cancelled) VALUES ($1, $2, $3, $4) RETURNING id";

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
    const startDate = new Date("2023-09-24");
    const endDate = new Date("2023-10-24");

    for (
      let currentDate = startDate;
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const date = currentDate.toISOString().split("T")[0];

      // Generate morning and evening sessions for each day
      const morningSession = {
        date,
        time: "09:00:00",
        session_type: "Morning",
      };
      const eveningSession = {
        date,
        time: "15:00:00",
        session_type: "Evening",
      };

      sessionsData.push(morningSession);
      sessionsData.push(eveningSession);
    }

    // Insert sessions data into the Session1 table

    const insertSessionsQuery =
      "INSERT INTO Session1 (date, time, session_type) VALUES ($1, $2, $3) RETURNING id";

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
      const numberOfSessionsToAllocate = Math.floor(Math.random() * 15) + 1;

      // randomly select and allocate multiple sessions to volunteers
      for (let i = 0; i < numberOfSessionsToAllocate; i++) {
        const randomSessionId =
          sessionIds[Math.floor(Math.random() * sessionIds.length)];
        allocatedSessionsData.push({
          volunteer_id: volunteerId,
          session_id: randomSessionId,
        });
      }
    }

    // Insert allocated sessions data into the Booking3 table

    const insertAllocatedSessionsQuery =
      "INSERT INTO Booking3 (volunteer_id, session_id) VALUES ($1, $2)";

    for (const allocatedSessionData of allocatedSessionsData) {
      await db.query(insertAllocatedSessionsQuery, [
        allocatedSessionData.volunteer_id,
        allocatedSessionData.session_id,
      ]);
    }

    console.log("Data generation and session allocation completed.");
  } catch (error) {
    console.error("Error generating data and allocating sessions:", error);
  } finally {
    // Release the database connection
  }
}

// Main function to generate data and allocate sessions
async function main() {
  try {
    await db.connect();
    console.log("Connected to the database");

    // Insert volunteers
    await addVolunteers();

    // Insert afternoon and night sessions
    await addAfternoonAndNightSessions();

    // Insert Christmas Day session
    await addChristmasSessions();

    // Allocate sessions randomly to volunteers
    // await generateDataAndAllocateSessions;

    console.log("Data generation and session allocation completed.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.end(); // Release the database connection
  }
}

// Call the main function
main().catch((error) => {
  console.error("Error:", error);
});
