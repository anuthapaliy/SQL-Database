INSERT INTO Session1 (id, date, time, session_type) values ('1', '2023-09-25', '09:00','morning'), ('2', '2023-09-25', '15:00', 'evening'), ('3', '2023-09-26', '09:00', 'morning'), ('4', '2023-09-26', '15:00', 'evening'), ('5', '2023-09-27', '09:00', 'morning'), ('6', '2023-09-27', '15:00', 'evening');


-- 3.Write SQL queries to answer the following questions:
--     a.Which volunteer volunteers most often?

SELECT volunteer_id, COUNT(*) AS booking_count
FROM booking
GROUP BY volunteer_id
ORDER BY booking_count DESC
LIMIT 1;

-- Another query, finds the volunteers most often but it includes volunteer's name
SELECT v.name, COUNT(b.volunteer_id) AS volunteer_count
FROM volunteers v
JOIN Booking3 b ON v.id = b.volunteer_id
GROUP BY v.name
ORDER BY volunteer_count DESC
LIMIT 1;


-- b.Which volunteer volunteers for the most mornings?

SELECT b.volunteer_id, COUNT(*) AS morning_count
FROM Booking3 b
JOIN Session1 s ON b.session_id = s.id
WHERE s.session_type = 'Morning'
GROUP BY b.volunteer_id
ORDER BY morning_count DESC
LIMIT 1;

-- 
-- c.Which volunteer volunteers for the most evenings?
SELECT b.volunteer_id, COUNT(*) AS evening_count
FROM Booking3 b
JOIN Session1 s ON b.session_id = s.id
WHERE s.session_type = 'Evening'
GROUP BY b.volunteer_id
ORDER BY evening_count DESC
LIMIT 1;

-- d.Who is the volunteer who volunteered in the last month, who started volunteering earliest in history?
--  (Feedback-I was asking "Who volunteered first ever, of all the people who volunteered in the last month", whereas I think you've answered "Of all the sessions in the last month, who volunteered for the first one"?)-amend on query 
SELECT volunteer_id, MIN(earliest_volunteered_date) AS earliest_volunteered_date
FROM (
    SELECT volunteer_id, MIN(s.date) AS earliest_volunteered_date
    FROM Booking3 b
    JOIN Session1 s ON b.session_id = s.id
    WHERE s.date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    GROUP BY volunteer_id
) AS last_month_volunteers
GROUP BY volunteer_id
ORDER BY earliest_volunteered_date ASC
LIMIT 1;



-- e.Which volunteers haven't volunteered in the last 4 weeks?
SELECT v.id AS volunteer_id, v.name AS volunteer_name
FROM Volunteers1 v
WHERE v.id NOT IN (
  SELECT DISTINCT b.volunteer_id
  FROM Booking3 b
  JOIN Session1 s ON b.session_id = s.id
  WHERE s.date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '4 weeks'
);

-- -- f.What is the most common day of the week each volunteer volunteers?
 WITH VolunteerSessionCounts AS (
  SELECT
    volunteer_id,
    TO_CHAR(s.date, 'Day') AS day_of_week,
    COUNT(*) AS session_count,
    ROW_NUMBER() OVER (PARTITION BY volunteer_id ORDER BY COUNT(*) DESC) AS rn
  FROM Booking3 b
  JOIN Session1 s ON b.session_id = s.id
  GROUP BY volunteer_id, day_of_week
)

SELECT volunteer_id, day_of_week, session_count
FROM VolunteerSessionCounts
WHERE rn = 1;

--g. What is the distribution of ratios of morning vs evening volunteering?
-- E.g. some possible answers are:
-- "All volunteers only volunteer in the morning or the evening"
-- "85% of volunteers only volunteering in the morning or the evening, but 15% do both"
-- "80% of volunteers volunteer at one time more than 60% of the time in mornings"


WITH VolunteerSessionCounts AS (
  SELECT
    volunteer_id,
    SUM(CASE WHEN s.session_type = 'Morning' THEN 1 ELSE 0 END) AS morning_count,
    SUM(CASE WHEN s.session_type = 'Evening' THEN 1 ELSE 0 END) AS evening_count
  FROM Booking3 b
  JOIN Session1 s ON b.session_id = s.id
  GROUP BY volunteer_id
)

SELECT
  COUNT(*) AS volunteer_count,
  SUM(CASE WHEN morning_count > evening_count THEN 1 ELSE 0 END) AS morning_preferred_count,
  SUM(CASE WHEN evening_count > morning_count THEN 1 ELSE 0 END) AS evening_preferred_count,
  SUM(CASE WHEN morning_count = evening_count THEN 1 ELSE 0 END) AS balanced_count
FROM VolunteerSessionCounts;

-- h.What is the most common first name of a volunteer, factoring in frequency of volunteering? (i.e. if Daniel volunteers five times, and two people named Anu each volunteer twice, Daniel is the most common name).
WITH VolunteerNameCounts AS (
SELECT
    LEFT(v.name, POSITION(' ' IN v.name) - 1) AS first_name,
    COUNT(*) AS volunteer_count
  FROM Volunteers1 v
  JOIN Booking3 b ON v.id = b.volunteer_id
  GROUP BY first_name
)

SELECT first_name, SUM(volunteer_count) AS total_count
FROM VolunteerNameCounts
GROUP BY first_name
ORDER BY total_count DESC
LIMIT 1;

-- i.Who has cancelled the most sessions?
  SELECT volunteer_id, COUNT(*) AS cancellation_count
FROM Booking3
WHERE volunteer_id IS NOT NULL
AND session_id IS NOT NULL
AND session_id NOT IN (
  SELECT DISTINCT session_id
  FROM Booking3
  WHERE volunteer_id IS NOT NULL
  AND session_id IS NOT NULL
)
GROUP BY volunteer_id
ORDER BY cancellation_count DESC
LIMIT 1;


-- j.How often are sessions cancelled less than 48 hours before the session itself?
    SELECT COUNT(*) AS late_cancellation_count
FROM Booking3 b
JOIN Session1 s ON b.session_id = s.id
WHERE AGE(s.date, current_date) < INTERVAL '2 days';

-- k. Who is the most likely volunteer to volunteer on Christmas Day?

SELECT v.name, COUNT(s.date) AS christmas_count
FROM Volunteers1 v
JOIN Booking3 b ON v.id = b.volunteer_id
JOIN Session1 s ON b.session_id = s.id
WHERE EXTRACT(YEAR FROM s.date) BETWEEN 2023 AND 2027
  AND EXTRACT(MONTH FROM s.date) = 12
  AND EXTRACT(DAY FROM s.date) = 25
GROUP BY v.name
ORDER BY christmas_count DESC;


-- Which volunteers only volunteer on weekends?
    SELECT v.name AS volunteer_name
FROM Volunteers1 v
JOIN Booking3 b ON v.id = b.volunteer_id
JOIN Session1 s ON b.session_id = s.id
WHERE EXTRACT(DOW FROM s.date) IN (0, 6)  -- 0 represents Sunday, 6 represents Saturday
GROUP BY v.name
HAVING COUNT(DISTINCT s.date) = COUNT(CASE WHEN EXTRACT(DOW FROM s.date) IN (0, 6) THEN 1 ELSE NULL END)
ORDER BY volunteer_name;

-- OR

SELECT DISTINCT v.name AS volunteer_name
FROM Volunteers1 v
LEFT JOIN Booking3 b ON v.id = b.volunteer_id
LEFT JOIN Session1 s ON b.session_id = s.id
WHERE b.volunteer_id IS NULL OR (
  EXTRACT(DOW FROM s.date) NOT IN (0, 6)
)
ORDER BY volunteer_name;











-- for my records

INSERT INTO Volunteers1 (id, name, email, phone_number, cancelled) values ('1', 'anne', 'anupkg@gmail.com','123456789', 'false'), ('2', 'shan', 'shan1@gmail.com', '2345678910', 'false'), ('3', 'dan', 'dan1@gmail.com','3456789120', 'false'), ('4', 'daniel', 'daniel7@gmail.com', '4567891234', 'false'), ('5', 'shadi', 'shadi4@gmail.com', '789012345', 'false'), ('6', 'barath', 'barath1@gmail.com', '9876543210', 'false');


-- to add columns in my booking table-:

ALTER TABLE Booking3 Add COLUMN cancellation_timestamp TIMESTAMP;
alter table booking3 add column cancellation_reason varchar(255);
alter table Booking3 add column is_cancelled BOOLEAN;

-- to remove rows
TRUNCATE Booking3;

-- to add unique session_id
ALTER table Booking3
ADD UNIQUE (session_id);

INSERT INTO booking (volunteer_id, session_id, is_cancelled, cancellation_timestamp, cancellation_reason)
VALUES
  ('1', '1', true, '2023-10-06 08:00', 'sick'),
  ('2', '2', true, '2023-10-07 05:00', 'session rescheduled'),
  ('3', '3', true, '2023-10-07 01:00', 'emergency'),
  ('4', '4', true, '2023-10-08 12:00', 'family issue'),
  ('5', '5', true, '2023-10-08 07:00', 'health issue'),
  ('6', '6', false, '2023-10-08 05:00',  booked);



UPDATE Volunteers1 SET id= 01 WHERE id=1;
UPDATE Volunteers1 SET id= 02 WHERE id=2;
UPDATE Volunteers1 SET id=03  WHERE id=3;
UPDATE Volunteers1 SET id= 04 WHERE id=4;
UPDATE Volunteers1 SET id= 05 WHERE id=5;
UPDATE Volunteers1 SET id= 06 WHERE id=6;


-- add 2 sessions a day
(-- Ensure you have morning and evening sessions for each day
INSERT INTO sessions (date, time, session_type, booked)
SELECT date, time, 'Morning' AS session_type, false AS booked
FROM sessions
WHERE session_type NOT IN ('Morning', 'Evening');

-- Add 'Afternoon' sessions
INSERT INTO sessions (date, time, session_type, booked)
SELECT date, time, 'Afternoon' AS session_type, false AS booked
FROM sessions
WHERE session_type NOT IN ('Morning', 'Evening', 'Afternoon', 'Night');

-- Add 'Night' sessions
INSERT INTO sessions (date, time, session_type, booked)
SELECT date, time, 'Night' AS session_type, false AS booked
FROM sessions
WHERE session_type NOT IN ('Morning', 'Evening', 'Afternoon', 'Night');
)


SELECT * FROM sessions
ORDER BY date ASC;

-- want to add 2 sessions for a month
SELECT * FROM sessions
WHERE date IN ('2023-09-24', '2023-09-25')
ORDER BY date ASC, session_type ASC, time ASC;





INSERT INTO Booking3 (volunteer_id, session_id)
VALUES 
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6);


  -- Add a cancellation timestamp column
ALTER TABLE Booking3
ADD COLUMN cancellation_timestamp TIMESTAMP;

-- Add a cancellation reason column
ALTER TABLE Booking3
ADD COLUMN cancellation_reason VARCHAR(255);

-- Add an is_cancelled column
ALTER TABLE Booking3
ADD COLUMN is_cancelled BOOLEAN;
