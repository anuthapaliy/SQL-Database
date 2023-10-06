# Project Title


## Coding Standards

### Style
- Put SQL files into a folder
```
package.json
sql/
    booking.sql
```
- Put all SQL statements into one file

- File name and naming styles

| File | Style | Explanation |
| ---- | ----- | ----------- |
| JS   | camel | 
| SQL  | snake |

SQL Specific
- use snake case for SQL table names and identifiers
- agree on either using plural or singulr for SQL entity names (book, volunteer)

GIT
- `.gitignore`
  ```
  node_modules/
  .env    # You dont want to checkin connection passwords
  ```
