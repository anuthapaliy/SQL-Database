// Import required modules
const express = require('express');
const { Pool } = require ('pg');
const app = express();
const cors = require ("cors");
const port = process.env.PORT || 4000;
const dotenv = require("dotenv");
dotenv.config();

// console.log(process.env)

const db = new Pool({
    connectionString: process.env.DB_URL,
    ssl: process.env.DB_URL ? true : false
  });
  
db.connect(function (err){
    if (err) {
    console.log("Connected to the database:", err);
} else {
    console.log("Connected to the database");
}
    });

app.use(cors());
  // parse application/json
  app.use(express.json());

      // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

//   Define a single endpoint to handle multiple types of questions
app.get('/volunteers/stats', async (request, response) => {
    try {
        const { queryType } = request.query;

        let queryResult;
        let result;


        switch (queryType) {
            case 'most_often':
                query = `
                SELECT v.name, COUNT(b.volunteer_id) AS volunteer_count
                FROM volunteers v
                JOIN booking b ON v.id = b.volunteer_id
                GROUP BY v.name
                ORDER BY volunteer_count DESC
                LIMIT 1;
              `;

                result = await db.query(query);
                queryResult = result.rows[0];
                break

              

                case 'most_mornings':
                    query = `
                    SELECT b.volunteer_id, COUNT(*) AS morning_count
                    FROM booking b
                    JOIN Session s ON b.session_id = s.id
                    WHERE s.session_type = 'Morning'
                    GROUP BY b.volunteer_id
                    ORDER BY morning_count DESC
                    LIMIT 1; 
                    `;
                    result = await db.query(query);
                    queryResult = result.rows[0];
                    break;

case 'most_evenings':
                        query = `
                        SELECT b.volunteer_id, COUNT(*) AS evening_count
                        FROM booking b
                        JOIN Session s ON b.session_id = s.id
                        WHERE s.session_type = 'Evening'
                        GROUP BY b.volunteer_id
                        ORDER BY evening_count DESC
                        LIMIT 1;
                        `;

                        result = await db.query(query);
                        queryResult = result.rows[0];
                        break;


case 'earliest_last_month':
                query = `
                SELECT volunteer_id, MIN(earliest_volunteered_date) AS earliest_volunteered_date
                FROM (
                SELECT volunteer_id, MIN(s.date) AS earliest_volunteered_date
                FROM booking b
                JOIN Session s ON b.session_id = s.id
                WHERE s.date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                GROUP BY volunteer_id
                ) AS last_month_volunteers
                GROUP BY volunteer_id
                ORDER BY earliest_volunteered_date ASC
                LIMIT 1;
                `;

                result = await db.query(query);
                queryResult = result.rows[0];
                break;

case 'not_volunteered_last_4_weeks':
                    query = `
                    SELECT v.id AS volunteer_id, v.name AS volunteer_name
                    FROM volunteers v
                    WHERE v.id NOT IN (
                    SELECT DISTINCT b.volunteer_id
                    FROM booking b
                    JOIN Session s ON b.session_id = s.id
                    WHERE s.date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '4 weeks'
                    );
                    `;
    
                    result = await db.query(query);
                    queryResult = result.rows;
                    break;

          
case 'common_day_of_week':
                query = `
                WITH VolunteerSessionCounts AS (
                  SELECT
                    volunteer_id,
                    TO_CHAR(s.date, 'Day') AS day_of_week,
                    COUNT(*) AS session_count,
                    ROW_NUMBER() OVER (PARTITION BY volunteer_id ORDER BY COUNT(*) DESC) AS rn
                    FROM booking b
                    JOIN Session s ON b.session_id = s.id
                    GROUP BY volunteer_id, day_of_week
                )
                
                SELECT volunteer_id, day_of_week, session_count
                FROM VolunteerSessionCounts
                WHERE rn = 1;
                `;

              result = await db.query(query);
                queryResult = result.rows;
                break;

        

case 'volunteer_ratio_distribution':
                    query = `
                    WITH VolunteerSessionCounts AS (
                      SELECT
                        volunteer_id,
                        SUM(CASE WHEN s.session_type = 'Morning' THEN 1 ELSE 0 END) AS morning_count,
                        SUM(CASE WHEN s.session_type = 'Evening' THEN 1 ELSE 0 END) AS evening_count
                      FROM booking b
                      JOIN Session s ON b.session_id = s.id
                      GROUP BY volunteer_id
                    )
                    
                    SELECT
                      COUNT(*) AS volunteer_count,
                      SUM(CASE WHEN morning_count > evening_count THEN 1 ELSE 0 END) AS morning_preferred_count,
                      SUM(CASE WHEN evening_count > morning_count THEN 1 ELSE 0 END) AS evening_preferred_count,
                      SUM(CASE WHEN morning_count = evening_count THEN 1 ELSE 0 END) AS balanced_count
                    FROM VolunteerSessionCounts;
                    `;
    
                    result = await db.query(query);
                    queryResult = result.rows[0];
                    break;

    case 'common_first_name':
                        query = `
                        WITH VolunteerNameCounts AS (
                          SELECT
                            LEFT(v.name, POSITION(' ' IN v.name) - 1) AS first_name,
                            COUNT(*) AS volunteer_count
                          FROM volunteers v
                          JOIN booking b ON v.id = b.volunteer_id
                          GROUP BY first_name
                        )
                        
                        SELECT first_name, SUM(volunteer_count) AS total_count
                        FROM VolunteerNameCounts
                        GROUP BY first_name
                        ORDER BY total_count DESC
                        LIMIT 1;
                        `;
        
                        result = await db.query(query);
                        queryResult = result.rows[0];
                        break;
            
          

            case 'most_cancelled_sessions':
                            query = `
                            SELECT volunteer_id, COUNT(*) AS cancellation_count
                            FROM booking
                            WHERE volunteer_id IS NOT NULL
                              AND session_id IS NOT NULL
                              AND session_id NOT IN (
                                SELECT DISTINCT session_id
                                FROM booking
                                WHERE volunteer_id IS NOT NULL
                                  AND session_id IS NOT NULL
                              )
                            GROUP BY volunteer_id
                            ORDER BY cancellation_count DESC
                            LIMIT 1;
                            `;
            
                        result = await db.query(query);
                            queryResult = result.rows[0];
                            break;
            
            case 'late_cancellation_count':
                                query = `
                                SELECT COUNT(*) AS late_cancellation_count
                                FROM booking b
                                JOIN Session s ON b.session_id = s.id
                                WHERE AGE(s.date, current_date) < INTERVAL '2 days';
                                `;
                
                                result = await db.query(query);
                                queryResult = result.rows[0];
                                break;
                

        case 'christmas_volunteer':
                                    query = `
                                    SELECT v.name, COUNT(s.date) AS christmas_count
                                    FROM volunteers v
                                    JOIN booking b ON v.id = b.volunteer_id
                                    JOIN Session s ON b.session_id = s.id
                                    WHERE EXTRACT(YEAR FROM s.date) BETWEEN 2023 AND 2027
                                      AND EXTRACT(MONTH FROM s.date) = 12
                                      AND EXTRACT(DAY FROM s.date) = 25
                                    GROUP BY v.name
                                    ORDER BY christmas_count DESC;
                                    `;
                    
                                    result = await db.query(query);
                                    queryResult = result.rows;
                                    break;

case 'weekend_volunteers':
                query = `
                SELECT v.name AS volunteer_name
                FROM volunteers v
                JOIN booking b ON v.id = b.volunteer_id
                JOIN Session s ON b.session_id = s.id
                WHERE EXTRACT(DOW FROM s.date) IN (0, 6)  -- 0 represents Sunday, 6 represents Saturday
                GROUP BY v.name
                HAVING COUNT(DISTINCT s.date) = COUNT(CASE WHEN EXTRACT(DOW FROM s.date) IN (0, 6) THEN 1 ELSE NULL END)
                ORDER BY volunteer_name;
                `;

                result = await db.query(query);
                queryResult = result.rows;
                break;
                    


default:
    return response.status(400).json({ error: 'Invalid queryType' });

        }

        response.json({ volunteer: queryResult });
    } catch (error) {
        console.error('Error:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
})
// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  

  