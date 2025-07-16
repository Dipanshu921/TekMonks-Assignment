# TekMonks Backend Assignment Submission

## 📁 Project Structure

```
server/
├── src/
│   └── api/
│       └── v1/
│           ├── controllers/
│           │   └── storyController.js
│           ├── routes/
│           │   └── storyRoute.js
│           └── services/
│               └── extract.js
├── app.js
├── server.js
├── package.json
```
     
## About the Project

This is my submission for TekMonks' Backend Assignment. The task was to:

- Build a simple HTTP server (no frameworks)
- Fetch the latest 6 stories from [Time.com](https://time.com)
- Return the results in JSON format via a `GET` API

### Constraints Followed

- No external libraries for Data Parsing
- Organized the code using clean file structure

## How to Run

1. Clone the repo or download the folder
2. Navigate to the `server` directory (cd server)
(Ensure Node.js is installed (v14+))

### Run the server
node server.js

## API Endpoint
Once the server is running, hit this in your browser or Postman:
GET http://localhost:3000/getTimeStories

## Sample Output

[
  {
    "title": "Trump Threatens 35% Tariff on Canada...",
    "link": "https://time.com/7301685/trump-canada-35-percent-tariff-threat/"
  },
  ...
]


