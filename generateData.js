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
      text: "INSERT INTO volunteers ( name, email, phone_number, cancelled) VALUES ($1, $2, $3, $4)",
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
      text: "INSERT INTO Session (date, time, session_type) VALUES ($1, $2, 'Afternoon')",
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
      text: "INSERT INTO Session (date, time, session_type) VALUES ($1, $2, 'Night')",
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
async function addChristmasSessions() {
  // Define start and end years for generating christmas day session
  const startYear = 2023;
  const endYear = 2027;

  for (let year = startYear; year <= endYear; year++) {
    // Generate random session data for christmas day
    const christmasSession = {
      date: `${year}-12-25`,
      time: "09:00:00",
      session_type: "Morning",
    };

    const christmasQuery = {
      text: "Insert into Session (date, time, session_type) values ($1, $2, $3)",
      values: [
        christmasSession.date,
        christmasSession.time,
        christmasSession.session_type,
      ],
    };

    try {
      await db.query(christmasQuery);
      console.log(
        `Inserted Christmas Day session for ${christmasSession.date}`,
      );
    } catch (error) {
      console.error(
        `Error inserting Christmas Day session for ${christmasSession.date}:`,
        error,
      );
    }
  }
}

//c. Function to generate random data and allocate sessions to volunteers
async function generateDataAndAllocateSessions() {
  try {
    // Initialize sets to store unique sessions and combinations
    const sessionSet = new Set();
    const allocatedCombinations = new Set();

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

    // Insert volunteers data into the Volunteers table
    const insertVolunteersQuery =
      "INSERT INTO volunteers (name, email, phone_number, cancelled) VALUES ($1, $2, $3, $4) RETURNING id";

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
    const startDate = new Date("2023-12-25");
    const endDate = new Date("2027-12-25");

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

      // Check and insert morning session
      const morningSessionKey = `${morningSession.date}-${morningSession.time}`;
      if (!sessionSet.has(morningSessionKey)) {
        sessionSet.add(morningSessionKey);
        sessionsData.push(morningSession);
      }

      // Check and insert evening session
      const eveningSessionKey = `${eveningSession.date}-${eveningSession.time}`;
      if (!sessionSet.has(eveningSessionKey)) {
        sessionSet.add(eveningSessionKey);
        sessionsData.push(eveningSession);
      }
    }

    // Insert sessions data into the Session table
    const insertSessionsQuery =
      "INSERT INTO Session (date, time, session_type) VALUES ($1, $2, $3) RETURNING id";

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

      // Randomly select and allocate multiple sessions to volunteers
      for (let i = 0; i < numberOfSessionsToAllocate; i++) {
        const randomSessionId =
          sessionIds[Math.floor(Math.random() * sessionIds.length)];

        // Check and insert combination
        const combinationKey = `${volunteerId}-${randomSessionId}`;
        if (!allocatedCombinations.has(combinationKey)) {
          allocatedCombinations.add(combinationKey);
          allocatedSessionsData.push({
            volunteer_id: volunteerId,
            session_id: randomSessionId,
            is_cancelled: Math.random() < 0.2, // Simulate some bookings being canceled
            cancellation_timestamp:
              Math.random() < 0.2 ? getRandomTimestamp() : null, // Set cancellation timestamp if booking is canceled
            cancellation_reason:
              Math.random() < 0.2 ? getRandomCancellationReason() : null, // Set cancellation reason if booking is canceled
          });
        }
      }
    }

    // Insert allocated sessions data into the Booking3 table
    const insertAllocatedSessionsQuery =
      "INSERT INTO Booking3 (volunteer_id, session_id, is_cancelled, cancellation_timestamp, cancellation_reason) VALUES ($1, $2, $3, $4, $5)";

    for (const allocatedSessionData of allocatedSessionsData) {
      await db.query(insertAllocatedSessionsQuery, [
        allocatedSessionData.volunteer_id,
        allocatedSessionData.session_id,
        allocatedSessionData.is_cancelled,
        allocatedSessionData.cancellation_timestamp,
        allocatedSessionData.cancellation_reason,
      ]);
    }

    console.log("Data generation and session allocation completed.");
  } catch (error) {
    console.error("Error generating data and allocating sessions:", error);
  } finally {
    // Release the database connection
  }
}

// Function to generate a random timestamp for cancellations
function getRandomTimestamp() {
  const year = 2023 + Math.floor(Math.random() * 5);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
}

// Function to generate a random cancellation reason
function getRandomCancellationReason() {
  const reasons = ["Unavailable", "Emergency", "Other"];
  const randomIndex = Math.floor(Math.random() * reasons.length);
  return reasons[randomIndex];
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

    // Generate data for Booking3 table
    await generateDataAndAllocateSessions();

    console.log("Data generation and allocation completed.");
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
