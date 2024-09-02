const functions = require("@google-cloud/functions-framework");
const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const { SpacesServiceClient } = require("@google-apps/meet").v2;
const express = require("express");

const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/meetings.space.created"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  const { projectTitle, startTime, endTime, attendees } = req.body;

  try {
    const auth = await authorize();

    const meetClient = new SpacesServiceClient({
      authClient: auth,
    });

    const request = {
      space: {
        config: {
          accessType: 1,
        },
      },
    };

    const response = await meetClient.createSpace(request);
    const uri = response[0].meetingUri;

    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: `${projectTitle} Meeting - EloStack`,
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      attendees: attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
      conferenceData: {
        conferenceSolution: {
          key: {
            name: "Google Meet",
            type: "hangoutsMeet",
          },
        },
        entryPoints: [
          {
            entryPointType: "video",
            uri,
          },
        ],
      },
    };

    calendar.events.insert(
      {
        auth,
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      },
      function (err, _) {
        if (err) {
          throw Error("There was an error contacting the Calendar service: " + err);
        } else {
          res.status(201).json({
            message: "Calendar meeting created successfully!",
            uri,
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

functions.http("createMeeting", app);
