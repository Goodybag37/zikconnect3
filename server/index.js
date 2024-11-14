import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import fs from "fs";
import { IPinfoWrapper } from "node-ipinfo";

import compression from "compression";
// import fileUpload from "express-fileupload";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import flash from "connect-flash";
import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import path from "path";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import multer from "multer";
import cron from "node-cron";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { dirname } from "path";
import { fileURLToPath } from "url";
import heicConvert from "heic-convert";
import sharp from "sharp";
import nodemailer from "nodemailer";
import https from "https"; // Required to create the server
// import { Server } from "socket.io";
import Bull from "bull";
import Redis from "redis";

const app = express();
// const server = http.createServer(app); // Create an HTTP server
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000", // Allow requests from your frontend
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true, // If you need to include credentials (like cookies)
//   },
// });
const baseUrl = "https://zikconnect.com";

// process.env.NODE_ENV === "production"
//   ? "http://zikconnect.com"
//   : "http://localhost:4000"; // Change this to your React app's URL in production

// app.use(
//   cors({
//     origin: [
//       `${baseUrl}`, // React local frontend
//       // "https://zikconnect-36adf65e1cf3.herokuapp.com", // Heroku frontend
//       "http://zikconnect.com",
//       // "http://localhost:3000",
//     ],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: [
      "https://js.paystack.co", // Paystack's JavaScript library
      "https://zikconnect.com",
      "http://localhost:3000", // Your frontend domain
    ],
    methods: ["GET", "POST", "OPTIONS"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  })
);

app.use(compression());

const ipinfo = new IPinfoWrapper(process.env.IP_INFO_TOKEN);

const blockedAgents = [
  "HTTrack",
  "WebZip",
  "Wget",
  "wget",
  "curl",
  "SiteSnagger",
  "SiteSucker",
  "Suction",
  "BackStreet",
  "BlackWidow",
  "WebCopier",
  "Offline Explorer",
  "Teleport",
  "Teleport Pro",
  "LeechFTP",
  "WebLeacher",
  "WebReaper",
  "Go!Zilla",
  "SuperBot",
  "SuperHTTP",
  "TrueDownloader",
  "WebStripper",
  "Web2Disk",
  "WebWhacker",
  "EmailSiphon",
  "EmailWolf",
  "MJ12bot",
  "Mass Downloader",
  "RealDownload",
  "wget",
  "Teleport Pro",
  "Xenu",
  "AppEngine-Google",
  "AhrefsBot",
  "BLEXBot",
  "DotBot",
  "Googlebot",
  "bingbot",
  "Slurp", // Yahoo
  "DuckDuckBot", // DuckDuckGo
  "Baiduspider",
  "YandexBot",
  "ia_archiver", // Alexa
  "SEMrushBot",
  "Screaming Frog",
  "MegaIndex",
  "DotBot",
  "GrapeshotCrawler",
  "BUbiNG",
  "CCBot",
  "archive.org_bot",
  "Exabot",
  "SeznamBot",
  "MJ12bot",
  "Applebot",
  "PetalBot", // Huawei Search Engine
  "Yandex",
  "ZoominfoBot",
];

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "your-secret-key", // Replace with your secret key
};

app.use(express.json());
app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";

  if (blockedAgents.some((agent) => userAgent.includes(agent))) {
    res.status(403).send("Access Denied");
  } else {
    next();
  }
});

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const MAPBOX_API_TOKEN = process.env.MAPBOX_PUBLIC_KEY;
const OPENCAGE_TOKEN = process.env.OPENCAGE_TOKEN;

app.post("/api/paystack/initialize", cors(), (req, res) => {
  const { email, amount } = req.body;

  const params = JSON.stringify({
    email,
    amount: amount * 100, // Convert to kobo
    callback_url: `${baseUrl}/verifypayment`,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";

    paystackRes.on("data", (chunk) => {
      data += chunk;
    });

    paystackRes.on("end", async () => {
      const response = JSON.parse(data);
      if (response.status) {
        const reference = response.data.reference; // Get the reference

        // Optionally insert the transaction into your database here
        await pool.query(
          "INSERT INTO transactions (reference, amount, status, email) VALUES ($1, $2, $3, $4)",
          [reference, amount * 100, "pending", email]
        );

        res.json({
          success: true,
          authorization_url: response.data.authorization_url,
        });
      } else {
        res.json({ success: false, message: response.message });
      }
    });
  });

  paystackReq.on("error", (error) => {
    console.error(error);
    res
      .status(500)
      .send({ success: false, message: "Transaction initialization failed." });
  });

  paystackReq.write(params);
  paystackReq.end();
});

app.get("/api/get-pending-payment", async (req, res) => {
  const { email } = req.query; // Extract the email from the query parameters
  try {
    const result = await pool.query(
      `SELECT * FROM transactions WHERE email = $1 AND status = 'pending'`,
      [email]
    );

    // Check if any rows were returned
    if (result.rows.length > 0) {
      const response = result.rows[0]; // Get the first row
      res.json({ email: response.email, amount: response.amount }); // Send the response
    } else {
      res.json({}); // Send an empty object if no pending payments found
    }
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching pending payments.",
    }); // Send error response
  }
});

app.get("/api/paystack/verify/:reference", cors(), async (req, res) => {
  const { reference } = req.params;

  const transactionCheck = await pool.query(
    "SELECT status FROM transactions WHERE reference = $1",
    [reference]
  );

  if (
    transactionCheck.rows.length > 0 &&
    transactionCheck.rows[0].status === "success"
  ) {
    return res
      .status(200)
      .json({ success: true, message: "Transaction already processed." });
  }

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";

    paystackRes.on("data", (chunk) => {
      data += chunk;
    });

    paystackRes.on("end", async () => {
      const response = JSON.parse(data);

      if (response.status && response.data.status === "success") {
        const { amount, customer } = response.data;
        const email = customer.email;

        try {
          // Update transaction status in the database
          await pool.query(
            "UPDATE transactions SET status = $1, updated_at = NOW() WHERE reference = $2",
            ["success", reference]
          );

          // Update the user's account balance
          await pool.query(
            `
            UPDATE people
            SET 
              account_balance = account_balance + $1,
              settings = jsonb_set(
                settings, 
                '{account_balance}', 
                to_jsonb(account_balance + $1), 
                true 
              )
            WHERE email = $2;
            `,
            [amount / 100, email]
          );

          // Send confirmation email
          const subject = "Payment Successful!";
          const html = `<h1 style="color: #15b58e; margin-left: 20%;">SUCCESS 🎉</h1>
                        <strong><p style="font-family: Times New Roman;">Dear User, you have successfully funded your Zikconnect account with <strong style="color: #15b58e;">${
                          amount / 100
                        } connects</strong>. Please use it carefully. We are excited to have you onboard!</p>`;

          const mailOptions = {
            from: "admin@zikconnect.com",
            to: email,
            subject,
            html,
          };

          await transporter.sendMail(mailOptions);

          // Final response after successful updates and email
          return res.json({
            success: true,
            message: "Payment verified successfully",
          });
        } catch (error) {
          console.error("Error updating account balance:", error);

          // Return error response if transaction or balance update fails
          return res.status(500).json({
            success: false,
            message: "Failed to update account balance",
          });
        }
      } else {
        // Payment verification failed
        return res.json({
          success: false,
          message: "Payment verification failed",
        });
      }
    });
  });

  paystackReq.on("error", (error) => {
    console.error("Paystack request error:", error);

    // Only send one error response for Paystack request failure
    return res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  });

  paystackReq.end();
});

app.post("/api/paystack-webhook", cors(), async (req, res) => {
  const { event, data } = req.body;

  if (event === "charge.success" && data.status === "success") {
    const reference = data.reference;

    const transactionCheck = await pool.query(
      "SELECT status FROM transactions WHERE reference = $1",
      [reference]
    );

    if (
      transactionCheck.rows.length > 0 &&
      transactionCheck.rows[0].status === "success"
    ) {
      return res
        .status(200)
        .json({ success: true, message: "Transaction already processed." });
    }

    try {
      const response = await pool.query(
        "UPDATE transactions SET status = $1, updated_at = NOW() WHERE reference = $2 RETURNING *",
        ["success", reference]
      );

      const updatedReference = response.rows[0];

      // Update the user's account balance
      await pool.query(
        `
        UPDATE people
        SET
          account_balance = account_balance + $1,
          settings = jsonb_set(
            settings,
            '{account_balance}',
            to_jsonb(account_balance + $1),
            true
          )
        WHERE email = $2;
        `,
        [updatedReference.amount / 100, updatedReference.email]
      );

      // Send confirmation email
      const subject = "Payment Successful!";
      const text = "SUCCESS";
      const html = `<h1 style="color: #15b58e; margin-left: 20%">SUCCESS 🎉</h1>
                    <strong><p style="font-family: Times New Roman;">Dear User, you have successfully funded your Zikconnect account with <strong style="color: #15b58e;">${
                      updatedReference.amount / 100
                    } connects</strong>. Please use it carefully and avoid abuse on the site.</p>`;

      const mailOptions = {
        from: "Zikconnect admin@zikconnect.com",
        to: updatedReference.email,
        subject: subject,
        text: text,
        html: html,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Single 200 OK response to Paystack
      return res.sendStatus(200);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process webhook",
      });
    }
  } else {
    // Respond with 400 for unrecognized events
    return res.sendStatus(400);
  }
});

let itemStatus = {}; // Store the status of items

// const myQueue = new Bull("my-queue", {
//   redis: {
//     host: "http://zikconnect.com",
//     port: 6379,
//     password: "good3767589",
//   },
// });

// const redisClient = Redis.createClient({
//   host: "http://zikconnect.com",
//   port: 6379,
//   password: "good3767589", // If applicable
// });

// myQueue.process(async (job) => {
//   const { agentId } = job.data;

//   try {
//     await pool.query("UPDATE buysell SET status = $1 WHERE id = $2", [
//       "available",
//       agentId,
//     ]);
//   } catch (error) {
//     console.error("Error updating status in delayed job:", error);
//   }
// });

// let transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465, // For SSL
//   secure: true,
//   auth: {
//     user: "admin@zikconnect.com",
//     pass: "nhsy kmqx fxth cevf",
//   },
//   // Use IPv4
//   lookup: (hostname, options, callback) => {
//     require("dns").lookup(hostname, { family: 4 }, callback);
//   },
// });
let transporter = nodemailer.createTransport({
  host: "mail.privateemail.com", // SMTP server
  port: 465, // For SSL
  secure: true, // Use SSL
  auth: {
    user: "admin@zikconnect.com", // Your full email address
    pass: "Good3767589", // Your email account pas
  },
  // Use IPv4
  lookup: (hostname, options, callback) => {
    require("dns").lookup(hostname, { family: 4 }, callback);
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  express.static(path.join(__dirname, "../client/react-dashboard/build"))
);
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

app.set("trust proxy", 1); // trust first proxy

const pool =
  process.env.ENVIRONMENT === "local"
    ? new pg.Pool({
        user: process.env.DB_USER,
        host: "localhost",
        database: "students",
        password: process.env.DB_PASSWORD,
        port: 5433,
      })
    : new pg.Pool({
        user: process.env.RDS_USER_NAME,
        host: process.env.RDS_USER, // Ensure this is intended, might need to be RDS_HOST
        database: process.env.RDS_DATABASE,
        port: 5432,
        password: process.env.RDS_PASSWORD,
        ssl: { rejectUnauthorized: false },
      });

const poolss = new pg.Pool({
  user: process.env.RDS_USER_NAME,
  host: process.env.RDS_USER,
  database: process.env.RDS_DATABASE,
  port: 5432,
  password: process.env.RDS_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const pools = new pg.Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: "students",
  password: process.env.DB_PASSWORD,
  port: 5433,
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the RDS database successfully!");
  }
});

// const pools = new pg.Pool({
//   connectionString: process.env.DATABASE_URL, // your database URL from Heroku config vars
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
// });
const PORT = process.env.PORT || 4000;
const saltRounds = 10;

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${baseUrl}/agents`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/login" }),
  function (req, res) {
    // Successful authentication, redirect to the app with token.
    const token = req.user.token; // Assuming you attach token to the user object
    res.redirect(` ${baseUrl}?token=${token}`);
  }
);

const findOrCreateUser = async (profile) => {
  try {
    const result = await pool.query(
      "SELECT * FROM people WHERE googleid = $1",
      [profile.id]
    );
    const existingUser = result.rows[0];

    if (existingUser) {
      // User already exists, return the user
      return existingUser;
    } else {
      // User doesn't exist, create a new user
      const newUser = {
        googleid: profile.id,
        email: profile.emails ? profile.emails[0].value : "", //
        // Add other user properties as needed
      };

      // Insert the new user into the database
      await pool.query("INSERT INTO people (googleid, email) VALUES ($1, $2)", [
        newUser.googleid,
        newUser.email,
      ]);

      // Return the new user
      return newUser;
    }
  } catch (error) {
    throw error;
  }
};

cron.schedule("* * * * *", async () => {
  try {
    // Delete old pending connects
    await pool.query(`
      DELETE FROM connect
      WHERE request_time < NOW() - INTERVAL '10 minutes' AND status = 'pending'
    `);
  } catch (error) {
    console.error("Error processing cron job:", error);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const completeTime = new Date();
    const result = await pool.query(
      `UPDATE connect
        SET status = 'available',
            request_time = CURRENT_TIMESTAMP
        WHERE status = 'order'
          AND request_time IS NOT NULL
          AND (CURRENT_TIMESTAMP - request_time) > INTERVAL '30 minutes'
        RETURNING type, agent_id`
    );

    if (result.rows.length > 0) {
      const { type, agent_id } = result.rows[0];

      if (type && agent_id) {
        await pool.query(
          `UPDATE ${type} SET status = 'available' WHERE id = $1`,
          [agent_id]
        );
      } else {
        console.warn("agentType or agentId is missing in the returned row.");
      }
    } else {
      return;
    }
  } catch (error) {
    console.error("Error updating connect statuses:", error);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const completeTime = new Date();
    const result = await pool.query(
      `UPDATE connect
        SET status = 'completed',
           request_time = CURRENT_TIMESTAMP
         WHERE status = 'accepted'
         AND request_time IS NOT NULL
         AND (CURRENT_TIMESTAMP - request_time) > INTERVAL '0.01 minutes'
         RETURNING *`
    );
    if (result.rows.length > 0) {
    }
  } catch (error) {
    console.error("Error updating connect statuses:", error);
  }
});

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Fetch user from the database using the user ID in jwtPayload.sub
      const user = await user.findById(jwtPayload.sub);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          "SELECT * FROM people WHERE email = $1",
          [email]
        );
        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  // Ensure user.id is non-null and unique
  done(null, user.id || "0");
});
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM people WHERE id = $1", [id]);
    const user = result.rows[0];

    if (!user) {
      // If user doesn't exist, return null and false
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Store the original requested URL in session
  req.session.returnTo = req.originalUrl;

  // If not authenticated, redirect to the login route
  res.redirect("/api/login");
}

app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/roommates",
  passport.authenticate("google", { failureRedirect: "/api/" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/api/");
  }
);

app.get("/", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../client/react-dashboard/build", "index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});
app.get("/api/logout", async (req, res) => {
  //  Passport's req.logout() to log the user out
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.render("index.ejs");
  });

  // Redirect to the home page or any other desired page after logout
  res.redirect("/");
});

app.get("/api/profile/", async (req, res) => {
  const { userbread } = req.query;

  // Check if userbread is provided
  if (!userbread) {
    return res
      .status(400)
      .send("Bad Request: 'userbread' query parameter is required.");
  }

  try {
    const result = await pool.query(
      `SELECT 
        people.id AS people_id, 
        full_name AS people_fullname, 
        email AS PEOPLE_email, 
        people.date AS account_created, 
       
        roommates.fullname AS roommate_name, 
        lodge.name AS lodge_name, 
        lodge.description AS lodge_description, 
        event.name AS event_name, 
        event.description AS event_description, 
        buysell.name AS buysell_name, 
        buysell.description AS buysell_description, 
        buysell.id AS buysell_id, 
        foodagents.id AS foodagent_id, 
        repairagents.id AS repairagent_id, 
        cybercafeagents.id AS cybercafeagent_id, 
        deliveryagents.id AS deliveryagent_id, 
        rideragents.id AS rideragent_id, 
        schoolfeeagents.id AS schoolfeeagent_id, 
        whatsapptvagents.id AS whatsapptvagent_id, 
        settings ->> 'account_balance' AS settings_account_balance,  
        settings -> 'Completed Orders' AS settings_completed_orders,
        settings -> 'Totl Connect Made' AS settings_total_connectmade,
        settings -> 'Totl Connect Received' AS settings_total_connectreceived,
        settings -> 'Avg Completed Orders' AS settings_average_orders, 
        settings -> 'Referral Code' as settings_referral_code,
        settings -> 'Withdrawable Cash' as settings_withdrawable_cash,
        settings -> 'Totl Referral' as settings_total_referral,
        settings -> 'Referred Agents' as settings_referred_agents

      FROM people 
      LEFT JOIN roommates ON people.id = roommates.fk_user_id 
      LEFT JOIN lodge ON people.id = lodge.fk_user_id 
      LEFT JOIN buysell ON people.id = buysell.fk_user_id 
      LEFT JOIN event ON people.id = event.fk_user_id 
      LEFT JOIN foodagents ON people.id = foodagents.fk_user_id 
      LEFT JOIN repairagents ON people.id = repairagents.fk_user_id 
      LEFT JOIN cybercafeagents ON people.id = cybercafeagents.fk_user_id 
      LEFT JOIN deliveryagents ON people.id = deliveryagents.fk_user_id 
      LEFT JOIN rideragents ON people.id = rideragents.fk_user_id 
      LEFT JOIN schoolfeeagents ON people.id = schoolfeeagents.fk_user_id 
      LEFT JOIN whatsapptvagents ON people.id = whatsapptvagents.fk_user_id 
      WHERE people.id = $1`,
      [userbread]
    );

    // Check if a profile was found
    if (result.rows.length === 0) {
      return res.status(404).send("Profile not found.");
    }

    const profile = result.rows[0];
    res.json(profile); // Send the profile as a JSON response
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the email exists in the database
    const exists = await pool.query(
      "SELECT email FROM people WHERE email = $1",
      [email]
    );
    if (exists.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No email found, please create an account instead." });
    }

    // Generate a new password and hash it
    const newPass = uuidv4(); // Consider using a more user-friendly temporary password format
    const hashedPassword = await bcrypt.hash(newPass, 10);

    // Update the password in the database
    await pool.query("UPDATE people SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    // Prepare email content
    const subject = "New Password";
    const text = `Welcome to Zikconnect`;
    const html = `
      <h1 style="color: #15b58e; margin-left: 20%;">Changed Password!</h1>
      <p style="font-family: 'Times New Roman';">
        Dear User,<br />
        You have opted to change your password on our platform. Here is your new password for your account. Please do not share this with anyone.
        <br /><br />
        <strong>${newPass}</strong>
        <br /><br />
        You can go to your profile and change your password to something more secure.
      </p>
    `;

    // Mail options
    const mailOptions = {
      from: "admin@zikconnect.com",
      to: email,
      subject: subject,
      text: text,
      html: html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res
      .status(200)
      .json({ message: "A new password has been sent to your email address." });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

app.post("/api/change-password", async (req, res) => {
  const { oldPassword, newPassword, email } = req.body;

  try {
    // Check if the user exists
    const result = await pool.query(
      "SELECT password FROM people WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Get the hashed password from the database
    const hashedPassword = result.rows[0].password;

    // Compare the old password with the stored hashed password
    const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);

    if (passwordMatch) {
      // Passwords match, hash the new password
      const newHashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      await pool.query("UPDATE people SET password = $1 WHERE email = $2", [
        newHashedPassword,
        email,
      ]);

      return res
        .status(200)
        .json({ message: "Password updated successfully." });
    } else {
      // Incorrect old password
      return res.status(401).json({
        message: "Incorrect old password. Please try again.",
      });
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error during password change:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/log", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Query to get user info from the database
    const result = await pool.query(
      "SELECT id, email, password, phone, id_card, full_name, account_balance, email_status FROM people WHERE email=$1",
      [email]
    );
    const foundMail = result.rows[0];
    let status = foundMail.email_status === "verified" ? true : false;

    if (foundMail) {
      const hashedPassword = foundMail.password;

      // Compare the input password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (passwordMatch) {
        // Create a custom middleware to handle Passport.js authentication
        passport.authenticate("local", (err, user, info) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
          }

          // Log in the user and send the response
          req.login(user, (err) => {
            if (err) {
              return next(err);
            }

            // Send response with user ID
            res.status(200).json({
              message: "Login successful! from backend",
              userId: foundMail.id,
              phone: foundMail.phone,
              id_card: foundMail.id_card,
              email: foundMail.email,
              full_name: foundMail.full_name,
              account_balance: foundMail.account_balance,
              isEmailVerified: status, // Send the user ID from the database
            });
          });
        })(req, res, next);
      } else {
        // Incorrect password
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      // No matching email
      return res
        .status(404)
        .json({ message: "No matching email. Please create an account." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await pool.query(
      "SELECT email, password FROM people WHERE email=$1",
      [email]
    );
    const foundMail = result.rows[0];

    if (foundMail) {
      const hashedPassword = foundMail.password;

      // Compare the input password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (passwordMatch) {
        // Passwords match, authenticate and redirect
        passport.authenticate("local", {
          successRedirect: req.session.returnTo || "/",
          failureRedirect: "/login",
          failureFlash: true,
        })(req, res, next);
      } else {
        // Incorrect password
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      // No matching email
      return res
        .status(404)
        .json({ message: "No matching email. Please create an account." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To support URL-encoded bodies

const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim(); // Take the first IP from the list
  }
  return req.connection.remoteAddress; // Fallback to remote address
};

const getUserLocation = async (ip) => {
  try {
    const response = await axios.get(
      `https://ipinfo.io/${ip}/json?token=${process.env.IP_INFO_TOKEN}`
    );
    const { city, region, country, loc } = response.data;
    return { city, region, country, loc }; // Return the important location data
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180; // Convert degrees to radians

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers
  return distance; // Return distance in kilometers
};

app.post("/api/register", async (req, res) => {
  const { email, password, fullname, upline } = req.body;

  try {
    const ip2 = req.ip;

    const ip = getClientIp(req);

    let locationData;

    // Fetch user's location based on the IP address
    try {
      locationData = await getUserLocation(ip);
    } catch (err) {
      console.warn("IP lookup failed, using default location data:", err);
      locationData = {
        city: null,
        loc: "0,0", // Default latitude and longitude if lookup fails
      };
    }

    // Check if the email already exists in the database
    const result = await pool.query("SELECT email FROM people WHERE email=$1", [
      email,
    ]);
    const existingUser = result.rows[0];

    if (existingUser) {
      // User already exists
      return res
        .status(400)
        .json({ message: "Email already registered. Please log in." });
    }

    const capitalizedFullName = fullname
      .split(" ") // Split by space
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" "); // Join the words back together

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    if (upline) {
      const result = await pool.query(
        `
  UPDATE people
SET settings = jsonb_set(
  settings,
  '{Totl Referral}', 
  to_jsonb(
    (COALESCE((settings ->> 'Totl Referral')::int, 0) + 1)::text
  ),
  true
)
WHERE settings->>'Referral Code' = $1
RETURNING email;
  `,
        [upline]
      );

      // Extract the email from the result
      if (result.rows.length === 0) {
      } else {
        const email = result.rows[0].email;

        const subject = "New Referral ";
        const text = `Welcome to Zikconnect`;
        const html = `<h1 style="color: #15b58e ; margin-left: 20% " >Congrats &#x1F389;  &#x1F389;</h1>
                      <strong><p style = "font-family: Times New Roman ;"> Dear User, You have successfully referred another user named ${capitalizedFullName}, <br /> 
                      We are super excited knowing that you trust our services to bring your friends onboard!. 
                      A sum of 500 naira would be credited to your walllet when the new user verifies thier phone number on the site. Keep Going!!  </strong>if you have further questions reach out to us at admin@zikconnect.com</strong>
                      </strong>
                      </p>`;

        const mailOptions = {
          from: "admin@zikconnect.com", // Sender address
          // to: email,
          // Recipient's email address
          to: email,
          subject: subject, // Subject line
          text: text, // Plain text body
          html: html, // HTML body
        };

        // Send email
        await transporter.sendMail(mailOptions);
      }

      // Logs the updated email value
    }

    const random_code = uuidv4().replace(/-/g, "").slice(0, 6);

    const idres = await pool.query(
      `INSERT INTO people (email, password, full_name, settings) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        email,
        hashedPassword,
        capitalizedFullName,
        JSON.stringify({
          theme: "dark",
          connects: {
            buysell: 0,
          },
          preferences: {
            delete_ask: "yes",
            toggle_ask: "No",
          },
          notifications: true,
          toggle_status: {
            buysell: "available",
            event: "available",
            lodge: "available",
          },
          location: {
            city: locationData?.city || null,
            latitude:
              locationData?.loc && locationData.loc.includes(",")
                ? locationData.loc.split(",")[0]
                : null,
            longitude:
              locationData?.loc && locationData.loc.includes(",")
                ? locationData.loc.split(",")[1]
                : null,
          },
          "Totl Connect Made": 0,
          "Totl Connect Received": 0,
          "Completed Orders": 0,
          "Avg Completed Orders": 0,
          "Referral Code": random_code,
          "Referred By": upline ? upline : null,
          "Totl Referral": 0,
          account_balance: 2000,
        }),
      ]
    );
    const newUserId = idres.rows[0].id;

    const verificationCode = generateVerificationCode();

    await pool.query(
      `INSERT INTO email_verification (user_id, email, code, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (email) 
       DO UPDATE SET code = EXCLUDED.code, status = 'pending', updated_at = CURRENT_TIMESTAMP`,
      [newUserId, email, verificationCode]
    );

    const subject = "Welcome!! ";
    const text = `Welcome to Zikconnect`;
    const html = `<h1 style="color: #15b58e ; margin-left: 20% " >WELCOME  &#x1F389;  &#x1F389;</h1>
                      <strong><p style = "font-family: Times New Roman ;"> Dear ${capitalizedFullName}, <br /> 
                      We are super excited to have you onboard!!. Zikconnect is built specifically for Unizik Students. here is your verification code
                         <br></br>

                     <div style="border: 0.5px solid black; display:flex; align-items: center; margin-bottom: 10px; justify-content: center; padding-left: 7rem; padding-top: 2rem; width: 70%; height: 4rem; font-family: Arial, sans-serif;">
  <span style="color: #15b58e ; font-size: 40px; font-weight: bold;">
   ${verificationCode}
  </span>

</div>
<p> This code would expire in 30 minutes. Ensure to use it time or you can request for another code from the site </p>
                      

                      This is a platform carefully designed to enhance our student lives. After Confirming your email you would be a able 
                      to perform various functions on the site like paying your fees, renting a lodge, buying and selling properties, order food
                      get a delivery, and lots more. <br></br> You can also earn  on zikconnect in two ways!!  <ul><li>300 naira for each agent you register which is withdrawable directly to your bank account</li> <li>by becoming one of our agents on the site or uploading items for buyers to purchase</li></ul> 
                      Congrats!! Once again on your journey and feel free to reach out to our agents at <strong> admin@zikconnect.com  </strong>if you have further questions</strong>
                      
                      </p>`;

    const mailOptions = {
      from: "admin@zikconnect.com", // Sender address
      // to: email,
      // Recipient's email address
      to: email,
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // Insert the new user into the database

    // Query to retrieve the newly inserted user
    const userResult = await pool.query(
      "SELECT id, email, password, phone, id_card, full_name, account_balance, email_status FROM people WHERE email=$1",
      [email]
    );
    const newUser = userResult.rows[0];

    let status = newUser.email_status === "verified" ? true : false;

    // Registration successful, return user data to frontend
    res.status(200).json({
      message: "Login successful! from backend",
      userId: newUser.id,
      phone: newUser.phone,
      id_card: newUser.id_card,
      email: newUser.email,
      full_name: newUser.full_name,
      account_balance: newUser.account_balance,
      isEmailVerified: status, // Send the user ID from the database
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/roommatesapi", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(fullname) AS fullname, department, gender, phone, fk_user_id FROM roommates ORDER BY id DESC"
    );
    const roommates = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedRoommates = roommates.slice(startIndex, endIndex);
    const totalItems = roommates.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      roommates: paginatedRoommates,
    });

    const isAuthenticated = req.isAuthenticated();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/roommates/:id", async (req, res) => {
  const id = req.params.id;
  const result = await pool.query(
    "SELECT picture FROM roommates WHERE id = $1",
    [id]
  );
  const image = result.rows[0].picture;
  const imageBase64 = Buffer.from(image).toString("base64");

  res.setHeader("Content-Type", "image/png"); // Adjust the content type as needed
  res.end(imageBase64, "base64");
});

app.get("/api/buysellapi", async (req, res) => {
  try {
    const { search, page = 1, pageSize = 5 } = req.query;

    let queryText = `
      SELECT 
        id, 
        name, 
        description, 
        contact, 
        fk_user_id, 
        TO_CHAR(date, 'FMMonth DD, YYYY') AS formatted_date, 
        price AS formatted_price, 
        location, 
        seller_name,
        original_name,
        status 
      FROM buysell 
    WHERE status IN ('available', 'order', 'unavailable')
    `;

    const queryParams = [];

    // Add search condition if a search term is provided
    if (search) {
      queryText += ` AND (name ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR seller_name ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    queryText += ` ORDER BY id DESC`;

    const result = await pool.query(queryText, queryParams);
    const buysells = result.rows;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedRoommates = buysells.slice(startIndex, endIndex);
    const totalItems = buysells.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      buysells: paginatedRoommates,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/eventapi", async (req, res) => {
  try {
    const { search, page = 1, pageSize = 5 } = req.query;

    let queryText = `
      SELECT 
        id, 
        name, 
        description, 
        contact, 
        fk_user_id, 
        TO_CHAR(event_date, 'FMMonth DD, YYYY') AS formatted_date, 
        price AS formatted_price, 
        location, 
        seller_name,
        status 
      FROM event 
      WHERE status IN ('available', 'order', 'unavailable')
    `;

    const queryParams = [];

    // Add search condition if a search term is provided
    if (search) {
      queryText += `AND (name ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR seller_name ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    queryText += `ORDER BY id DESC`;

    const result = await pool.query(queryText, queryParams);
    const events = result.rows;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedRoommates = events.slice(startIndex, endIndex);
    const totalItems = events.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      events: paginatedRoommates,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/lodgeapi", async (req, res) => {
  try {
    const { search, page = 1, pageSize = 5 } = req.query;

    let queryText = `
      SELECT 
        id, 
        name, 
        description, 
        contact, 
        fk_user_id, 
        TO_CHAR(date, 'FMMonth DD, YYYY') AS formatted_date, 
        price AS formatted_price, 
        location, 
        seller_name,
        status 
      FROM lodge
      WHERE status IN ('available', 'order', 'unavailable')
    `;

    const queryParams = [];

    // Add search condition if a search term is provided
    if (search) {
      queryText += ` AND (name ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR seller_name ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    queryText += ` ORDER BY id DESC`;

    const result = await pool.query(queryText, queryParams);
    const lodges = result.rows;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedRoommates = lodges.slice(startIndex, endIndex);
    const totalItems = lodges.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      lodges: paginatedRoommates,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/buysell/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Query to get file metadata
    const result = await pool.query(
      "SELECT original_name, unique_name FROM buysell WHERE id = $1",
      [id]
    );

    if (result.rows.length > 0) {
      const { original_name, unique_name } = result.rows[0];

      if (!unique_name) {
        // Return a 404 response indicating no image found for the item
        return res.status(404).send("No image found for this item");
      }

      // Define the file path
      const filePath = path.join(__dirname, "uploads", unique_name);

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Set the appropriate content type based on file extension
        const ext = path.extname(original_name).toLowerCase();
        let contentType = "application/octet-stream"; // Default for binary files

        if (ext === ".png") contentType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".webp") contentType = "image/webp";

        res.setHeader("Content-Type", contentType);

        // Pipe the file to the response
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.status(404).send("File not found");
      }
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/lodge/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Query to get file metadata
    const result = await pool.query(
      "SELECT original_name, unique_name FROM lodge WHERE id = $1",
      [id]
    );

    if (result.rows.length > 0) {
      const { original_name, unique_name } = result.rows[0];

      if (!unique_name) {
        // Return a 404 response indicating no image found for the item
        return res.status(404).send("No image found for this item");
      }

      // Define the file path
      const filePath = path.join(__dirname, "uploads", unique_name);

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Set the appropriate content type based on file extension
        const ext = path.extname(original_name).toLowerCase();
        let contentType = "application/octet-stream"; // Default for binary files

        if (ext === ".png") contentType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".webp") contentType = "image/webp";

        res.setHeader("Content-Type", contentType);

        // Pipe the file to the response
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.status(404).send("File not found");
      }
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/event/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Query to get file metadata
    const result = await pool.query(
      "SELECT original_name, unique_name FROM event WHERE id = $1",
      [id]
    );

    if (result.rows.length > 0) {
      const { original_name, unique_name } = result.rows[0];

      if (!unique_name) {
        // Return a 404 response indicating no image found for the item
        return res.status(404).send("No image found for this item");
      }

      // Define the file path
      const filePath = path.join(__dirname, "uploads", unique_name);

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Set the appropriate content type based on file extension
        const ext = path.extname(original_name).toLowerCase();
        let contentType = "application/octet-stream"; // Default for binary files

        if (ext === ".png") contentType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".webp") contentType = "image/webp";

        res.setHeader("Content-Type", contentType);

        // Pipe the file to the response
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.status(404).send("File not found");
      }
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/lodge/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Query to get the picture metadata (multiple pictures stored as JSON)
    const result = await pool.query(
      "SELECT pictures FROM lodges WHERE id = $1",
      [id]
    );

    if (result.rows.length > 0) {
      const { pictures } = result.rows[0];
      // This is an array of picture objects

      if (pictures.length === 0) {
        // Return a 404 response indicating no images found for the item
        return res.status(404).send("No images found for this item");
      }

      const imageUrls = pictures.map((picture) => {
        const { original_name, unique_name } = picture;

        // Define the URL or path to the file based on the unique filename
        const filePath = path.join(__dirname, "uploads", unique_name);

        // Check if the file exists
        if (fs.existsSync(filePath)) {
          // Get the file extension and set the content type accordingly
          const ext = path.extname(original_name).toLowerCase();
          let contentType = "application/octet-stream"; // Default for binary files

          if (ext === ".png") contentType = "image/png";
          else if (ext === ".jpg" || ext === ".jpeg")
            contentType = "image/jpeg";
          else if (ext === ".webp") contentType = "image/webp";

          // Return the path as a relative URL for the frontend to request later
          return `${req.protocol}://${req.get("host")}/uploads/${unique_name}`;
        }
      });

      // Filter out any undefined file paths (in case any files were missing)
      const validImageUrls = imageUrls.filter((url) => url);

      if (validImageUrls.length > 0) {
        // Send the array of image URLs as the response
        res.json({ images: validImageUrls });
      } else {
        res.status(404).send("No valid images found");
      }
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Server error");
  }
});

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 1024 * 1024 * 10, // Limit file size to 10MB
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       const error = new Error("Incorrect file type");
//       error.code = "INCORRECT_FILETYPE";
//       return cb(error, false);
//     }
//     cb(null, true);
//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // Directory to save the file
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Renaming  the file
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heif",
      "image/heic",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Incorrect file type");
      error.code = "INCORRECT_FILETYPE";
      return cb(error, false);
    }
    cb(null, true);
  },
});

app.post(
  "/api/upload-property",

  upload.single("file"),

  async (req, res) => {
    try {
      let { originalname, filename, mimetype } = req.file;
      const { name, description, user, price, located, longitude, latitude } =
        req.body;
      // const fkUserId = parseInt(fk_user_id, 10);

      const settingsQuery = "SELECT settings FROM people WHERE id = $1";
      const settingsResult = await pool.query(settingsQuery, [user]);
      const userSettings = settingsResult.rows[0]?.settings || {};

      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: `${latitude},${longitude}`,
            key: OPENCAGE_TOKEN,
            pretty: 1,
            no_annotations: 1,
          },
        }
      );

      const formatted = response.data.results[0]?.formatted || "";

      const locationData = {
        locationData: {
          lat: latitude,
          lon: longitude,
          display_name: formatted,
        },
      };

      const encodedLocationData = encodeURIComponent(
        JSON.stringify({ locationData })
      );

      // Extract toggle_status.buysell from settings
      const toggleStatusBuysell =
        userSettings?.toggle_status?.buysell || "available"; // Default to "available" if not found

      // Step 2: Check the toggle status, set property status accordingly
      let propertyStatus = "available";
      if (toggleStatusBuysell === "unavailable") {
        propertyStatus = "unavailable";
      }

      if (
        filename.endsWith(".heic") ||
        filename.endsWith(".HEIC") ||
        filename.endsWith(".heif") ||
        filename.endsWith(".HEIF")
      ) {
        const inputPath = req.file.path;
        const outputPath = path.join("uploads/", Date.now() + ".jpeg");

        // Convert HEIC to JPEG
        const buffer = fs.readFileSync(inputPath);
        const outputBuffer = await heicConvert({
          buffer,
          format: "JPEG",
          quality: 1, // 1 is maximum quality
        });

        // Save the converted JPEG
        fs.writeFileSync(outputPath, outputBuffer);

        // Update filename and mimetype
        filename = path.basename(outputPath);
        req.file.mimetype = "image/jpeg";

        // Delete the original HEIC file
        fs.unlinkSync(inputPath);
      } else {
        // Optimize other formats with Sharp
        const inputPath = req.file.path;
        const outputPath = path.join(
          __dirname, // This will use the current directory of the script
          "uploads",
          Date.now() + path.extname(req.file.originalname)
        );

        // Compress and optimize the image
        await sharp(inputPath)
          .resize({ width: 800, withoutEnlargement: true })
          .png({ compressionLevel: 9 }) // PNG compression level (0-9)// Resize to a maximum width of 800 pixels
          .toFormat(mimetype.split("/")[1], { quality: 30 }) // Set quality to 30
          .toFile(outputPath);

        // Update filename
        filename = path.basename(outputPath);

        // Delete the original file
        fs.unlinkSync(inputPath);
      }
      // Fetch seller details
      const sellerQuery = "SELECT full_name, phone FROM people WHERE id = $1";
      const sellerResult = await pool.query(sellerQuery, [user]);
      const sellerName = sellerResult.rows[0].full_name || "Unknown";
      const sellerContact = sellerResult.rows[0].phone || "Unknown";

      await pool.query(
        `
  UPDATE people
  SET 
    settings = jsonb_set(
      settings, 
      '{account_balance}', 
      to_jsonb((settings->>'account_balance')::int - 300)  -- The new value as JSONB
    ),
    account_balance = account_balance - 300
  WHERE 
    id = $1;
  `,
        [user] // Pass user ID as parameter here
      );

      // Insert into events
      const insertQuery = `
      INSERT INTO buysell (name, description, fk_user_id, price, location, seller_name, contact, original_name, unique_name, status, exact_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
      await pool.query(insertQuery, [
        name,
        description,
        user,
        price,
        located,
        sellerName,
        sellerContact,
        originalname,
        filename,
        propertyStatus,
        locationData,
      ]);

      await pool.query(
        "UPDATE buysell SET exact_location = $1 WHERE fk_user_id = $2 ",
        [locationData, user]
      );

      res.send("File uploaded successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
);

app.post(
  "/api/upload-lodge",
  upload.single("file"),

  async (req, res) => {
    try {
      let { originalname, filename, mimetype } = req.file;
      const { name, description, user, price, located, longitude, latitude } =
        req.body;
      // const fkUserId = parseInt(fk_user_id, 10);

      const settingsQuery = "SELECT settings FROM people WHERE id = $1";
      const settingsResult = await pool.query(settingsQuery, [user]);
      const userSettings = settingsResult.rows[0]?.settings || {};

      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: `${latitude},${longitude}`,
            key: OPENCAGE_TOKEN,
            pretty: 1,
            no_annotations: 1,
          },
        }
      );

      const formatted = response.data.results[0]?.formatted || "";

      const locationData = {
        locationData: {
          lat: latitude,
          lon: longitude,
          display_name: formatted,
        },
      };

      const encodedLocationData = encodeURIComponent(
        JSON.stringify({ locationData })
      );

      // Extract toggle_status.buysell from settings
      const toggleStatusLodge =
        userSettings?.toggle_status?.lodge || "available"; // Default to "available" if not found

      // Step 2: Check the toggle status, set property status accordingly
      let lodgeStatus = "available";
      if (toggleStatusLodge === "unavailable") {
        lodgeStatus = "unavailable";
      }

      if (
        filename.endsWith(".heic") ||
        filename.endsWith(".HEIC") ||
        filename.endsWith(".heif") ||
        filename.endsWith(".HEIF")
      ) {
        const inputPath = req.file.path;
        const outputPath = path.join(
          __dirname,
          "uploads",
          Date.now() + ".jpeg"
        );

        // Convert HEIC to JPEG
        const buffer = fs.readFileSync(inputPath);
        const outputBuffer = await heicConvert({
          buffer,
          format: "JPEG",
          quality: 1, // 1 is maximum quality
        });

        // Save the converted JPEG
        fs.writeFileSync(outputPath, outputBuffer);

        // Update filename and mimetype
        filename = path.basename(outputPath);
        req.file.mimetype = "image/jpeg";

        // Delete the original HEIC file
        fs.unlinkSync(inputPath);
      } else {
        // Optimize other formats with Sharp
        const inputPath = req.file.path;
        const outputPath = path.join(
          __dirname, // This will use the current directory of the script
          "uploads",
          Date.now() + path.extname(req.file.originalname)
        );

        // Compress and optimize the image
        await sharp(inputPath)
          .resize({ width: 800, withoutEnlargement: true })
          .png({ compressionLevel: 9 }) // PNG compression level (0-9)// Resize to a maximum width of 800 pixels
          .toFormat(mimetype.split("/")[1], { quality: 30 }) // Set quality to 30
          .toFile(outputPath);

        // Update filename
        filename = path.basename(outputPath);

        // Delete the original file
        fs.unlinkSync(inputPath);
      }
      // Fetch seller details
      const sellerQuery = "SELECT full_name, phone FROM people WHERE id = $1";
      const sellerResult = await pool.query(sellerQuery, [user]);
      const sellerName = sellerResult.rows[0].full_name || "Unknown";
      const sellerContact = sellerResult.rows[0].phone || "Unknown";

      await pool.query(
        `
  UPDATE people
  SET 
    settings = jsonb_set(
      settings, 
      '{account_balance}', 
      to_jsonb((settings->>'account_balance')::int - 300)  -- The new value as JSONB
    ),
    account_balance = account_balance - 300
  WHERE 
    id = $1;
  `,
        [user] // Pass user ID as parameter here
      );

      // Insert into events
      const insertQuery = `
      INSERT INTO lodge (name, description, fk_user_id, price, location, seller_name, contact, original_name, unique_name, status, exact_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,  $11)
    `;
      await pool.query(insertQuery, [
        name,
        description,
        user,
        price,
        located,
        sellerName,
        sellerContact,
        originalname,
        filename,
        lodgeStatus,
        locationData,
      ]);

      await pool.query(
        "UPDATE lodge SET exact_location = $1 WHERE fk_user_id = $2 ",
        [locationData, user]
      );

      res.send("File uploaded successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
);

app.post(
  "/api/upload-event",
  upload.single("file"),

  async (req, res) => {
    try {
      let { originalname, filename, mimetype } = req.file;
      const {
        name,
        description,
        event_date,
        user,
        price,
        located,
        longitude,
        latitude,
      } = req.body;
      // const fkUserId = parseInt(fk_user_id, 10);

      const settingsQuery = "SELECT settings FROM people WHERE id = $1";
      const settingsResult = await pool.query(settingsQuery, [user]);
      const userSettings = settingsResult.rows[0]?.settings || {};

      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: `${latitude},${longitude}`,
            key: OPENCAGE_TOKEN,
            pretty: 1,
            no_annotations: 1,
          },
        }
      );

      const formatted = response.data.results[0]?.formatted || "";

      const locationData = {
        locationData: {
          lat: latitude,
          lon: longitude,
          display_name: formatted,
        },
      };

      const encodedLocationData = encodeURIComponent(
        JSON.stringify({ locationData })
      );

      // Extract toggle_status.buysell from settings
      const toggleStatusBuysell =
        userSettings?.toggle_status?.event || "available"; // Default to "available" if not found

      // Step 2: Check the toggle status, set property status accordingly
      let eventStatus = "available";
      if (toggleStatusBuysell === "unavailable") {
        propertyStatus = "unavailable";
      }

      if (
        filename.endsWith(".heic") ||
        filename.endsWith(".HEIC") ||
        filename.endsWith(".heif") ||
        filename.endsWith(".HEIF")
      ) {
        const inputPath = req.file.path;
        const outputPath = path.join(
          __dirname, // This will use the current directory of the script
          "uploads",
          Date.now() + ".jpeg"
        );

        // Convert HEIC to JPEG
        const buffer = fs.readFileSync(inputPath);
        const outputBuffer = await heicConvert({
          buffer,
          format: "JPEG",
          quality: 1, // 1 is maximum quality
        });

        // Save the converted JPEG
        fs.writeFileSync(outputPath, outputBuffer);

        // Update filename and mimetype
        filename = path.basename(outputPath);
        req.file.mimetype = "image/jpeg";

        // Delete the original HEIC file
        fs.unlinkSync(inputPath);
      } else {
        // Optimize other formats with Sharp
        const inputPath = req.file.path;
        const outputPath = path.join(
          __dirname, // This will use the current directory of the script
          "uploads",
          Date.now() + path.extname(req.file.originalname)
        );

        // Compress and optimize the image
        await sharp(inputPath)
          .resize({ width: 800, withoutEnlargement: true })
          .png({ compressionLevel: 9 }) // PNG compression level (0-9)// Resize to a maximum width of 800 pixels
          .toFormat(mimetype.split("/")[1], { quality: 30 }) // Set quality to 30
          .toFile(outputPath);

        // Update filename
        filename = path.basename(outputPath);

        // Delete the original file
        fs.unlinkSync(inputPath);
      }
      // Fetch seller details
      const sellerQuery = "SELECT full_name, phone FROM people WHERE id = $1";
      const sellerResult = await pool.query(sellerQuery, [user]);
      const sellerName = sellerResult.rows[0].full_name || "Unknown";
      const sellerContact = sellerResult.rows[0].phone || "Unknown";

      await pool.query(
        `
  UPDATE people
  SET 
    settings = jsonb_set(
      settings, 
      '{account_balance}', 
      to_jsonb((settings->>'account_balance')::int - 500)  -- The new value as JSONB
    ),
    account_balance = account_balance - 500
  WHERE 
    id = $1;
  `,
        [user] // Pass user ID as parameter here
      );

      // Insert into events
      const insertQuery = `
      INSERT INTO event (name, description, fk_user_id, event_date,  price, location, seller_name, contact, original_name, unique_name, status, exact_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
      await pool.query(insertQuery, [
        name,
        description,
        user,
        event_date,
        price,
        located,
        sellerName,
        sellerContact,
        originalname,
        filename,
        eventStatus,
        locationData,
      ]);
      await pool.query(
        "UPDATE event SET exact_location = $1 WHERE fk_user_id = $2 ",
        [locationData, user]
      );
      res.send("File uploaded successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
);

const multipleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save the files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${uuidv4()}${ext}`; // Unique filename
    cb(null, uniqueName);
  },
});

// File filter for multiple uploads
const multipleFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heif",
    "image/heic",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Incorrect file type");
    error.code = "INCORRECT_FILETYPE";
    return cb(error, false);
  }
  cb(null, true);
};

// Multer instance for multiple file uploads
const multipleUpload = multer({
  storage: multipleStorage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB per file
  },
  fileFilter: multipleFileFilter,
});

// app.post(
//   "/api/upload-lodge",
//   multipleUpload.array("files", 3),
//   async (req, res) => {
//     try {
//       const { name, description, user, price, located } = req.body;
//       const filesArray = req.files; // Array of uploaded files
//       const fileData = [];

//       if (!filesArray || filesArray.length === 0) {
//         return res.status(400).json({ message: "No files uploaded" });
//       }

//       // console.log("Number of files received:", filesArray.length);
//       // console.log("Files Array:", filesArray);

//       for (let file of filesArray) {
//         let { originalname, filename, mimetype, path: filePath } = file;
//         // console.log("Processing file:", originalname, "at path:", filePath);

//         // Check if file exists before processing
//         // console.log(`Checking if file exists: ${filePath}`);
//         if (!fs.existsSync(filePath)) {
//           console.error(`File not found: ${filePath}`);
//           throw new Error(`Input file is missing: ${filePath}`);
//         }

//         // Check if file is HEIC/HEIF and convert to JPEG
//         if (
//           filename.toLowerCase().endsWith(".heic") ||
//           filename.toLowerCase().endsWith(".heif")
//         ) {
//           const outputFilename = `${Date.now()}-${uuidv4()}.jpeg`;
//           const outputPath = path.join("uploads/", outputFilename);

//           // Convert HEIC/HEIF to JPEG
//           const buffer = fs.readFileSync(filePath);
//           const outputBuffer = await heicConvert({
//             buffer,
//             format: "JPEG",
//             quality: 1, // Maximum quality
//           });

//           // Save converted JPEG and update file details
//           fs.writeFileSync(outputPath, outputBuffer);
//           // console.log(`Converted file saved to ${outputPath}`);

//           // Update filename and mimetype
//           filename = outputFilename;
//           mimetype = "image/jpeg";

//           // Delete original HEIC/HEIF file
//           fs.unlinkSync(filePath);
//           // console.log(`Original HEIC/HEIF file deleted: ${filePath}`);
//         } else {
//           // Optimize other formats with Sharp
//           const outputFilename = `${Date.now()}-${uuidv4()}${path.extname(
//             file.originalname
//           )}`;
//           const outputPath = path.join("uploads/", outputFilename);

//           // console.log(
//           //   `Optimizing image with Sharp: ${filePath} -> ${outputPath}`
//           // );

//           // // Check if input file exists before processing with Sharp
//           // console.log(`Checking if input file exists for Sharp: ${filePath}`);
//           if (!fs.existsSync(filePath)) {
//             console.error(
//               `Input file missing before Sharp processing: ${filePath}`
//             );
//             throw new Error(
//               `Input file is missing before processing: ${filePath}`
//             );
//           }

//           // Compress and optimize the image
//           await sharp(filePath)
//             .resize({ width: 800, withoutEnlargement: true }) // Max width 800px
//             .toFormat(mimetype.split("/")[1], { quality: 30 }) // Quality 30
//             .toFile(outputPath);

//           // console.log(`Optimized file saved to ${outputPath}`);

//           // Update filename
//           filename = outputFilename;

//           // Delete the original file
//           fs.unlinkSync(filePath);
//           // console.log(`Original file deleted: ${filePath}`);
//         }

//         // Collect the original and unique filenames
//         fileData.push({
//           original_name: originalname,
//           unique_name: filename,
//         });
//       }

//       // Fetch seller details
//       const sellerQuery = "SELECT full_name, phone FROM people WHERE id = $1";
//       const sellerResult = await pool.query(sellerQuery, [user]);
//       const sellerName = sellerResult.rows[0]?.full_name || "Unknown";
//       const sellerContact = sellerResult.rows[0]?.phone || "Unknown";

//       // Insert into lodges table with pictures as JSONB
//       const insertQuery = `
//       INSERT INTO lodges (name, description, fk_user_id, price, location, seller_name, contact, pictures)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       RETURNING *
//     `;
//       const insertValues = [
//         name,
//         description,
//         user,
//         price,
//         located,
//         sellerName,
//         sellerContact,
//         JSON.stringify(fileData), // Convert to JSON string
//       ];

//       const insertResult = await pool.query(insertQuery, insertValues);

//       // console.log("Insert Result:", insertResult.rows[0]);

//       res.status(201).json({
//         message: "Files uploaded successfully",
//         lodge: insertResult.rows[0],
//       });
//     } catch (error) {
//       console.error("Error uploading files:", error);
//       res.status(500).json({ message: "An error occurred during the upload" });
//     }
//   }
// );

app.put(
  "/api/edit-upload/:id",
  upload.single("file"),

  async (req, res) => {
    const { id, type } = req.params;
    // console.log("id", id);
    const { name, description, price, location } = req.body;
    const validTypes = ["buysell", "event", "lodge", "roommates"]; // Add valid table names
    if (!validTypes.includes(type)) {
      return res.status(400).send({ error: "Invalid type parameter" });
    }

    // console.log("body of data", req.body);
    const existingData = await pool.query(
      `SELECT * FROM ${type} WHERE id = $1`,
      [id]
    );

    const existingItem = existingData.rows[0];
    const updatedName = name !== undefined ? name : existingItem.name;
    const updatedDescription =
      description !== undefined ? description : existingItem.description;
    const updatedPrice = price !== undefined ? price : existingItem.price;
    const updatedLocation =
      location !== undefined ? location : existingItem.location;

    try {
      if (req.file) {
        let { originalname, filename, mimetype } = req.file;
        if (
          filename.endsWith(".heic") ||
          filename.endsWith(".HEIC") ||
          filename.endsWith(".heif") ||
          filename.endsWith(".HEIF")
        ) {
          const inputPath = req.file.path;
          const outputPath = path.join(
            __dirname, // This will use the current directory of the script
            "uploads",
            Date.now() + ".jpeg"
          );

          // Convert HEIC to JPEG
          const buffer = fs.readFileSync(inputPath);
          const outputBuffer = await heicConvert({
            buffer,
            format: "JPEG",
            quality: 1, // 1 is maximum quality
          });

          // Save the converted JPEG
          fs.writeFileSync(outputPath, outputBuffer);

          // Update filename and mimetype
          filename = path.basename(outputPath);
          req.file.mimetype = "image/jpeg";

          // Delete the original HEIC file
          fs.unlinkSync(inputPath);
        } else {
          // Optimize other formats with Sharp
          const inputPath = req.file.path;
          const outputPath = path.join(
            __dirname, // This will use the current directory of the script
            "uploads",
            Date.now() + path.extname(req.file.originalname)
          );

          // Compress and optimize the image
          await sharp(inputPath)
            .resize({ width: 800, withoutEnlargement: true })
            .png({ compressionLevel: 9 }) // PNG compression level (0-9)// Resize to a maximum width of 800 pixels
            .toFormat(mimetype.split("/")[1], { quality: 30 }) // Set quality to 30
            .toFile(outputPath);

          // Update filename
          filename = path.basename(outputPath);

          // Delete the original file
          fs.unlinkSync(inputPath);
        }

        // Insert into buysells
        const insertQuery = `
      UPDATE  ${type} SET name = $1, description =$2, price = $3, location =$4, original_name = $5, unique_name = $6 WHERE id = $7
    `;
        await pool.query(insertQuery, [
          name,
          description,

          price,
          location,

          originalname,
          filename,
          id,
        ]);

        res.send("File uploaded successfully");
      } else {
        const insertQuery = `
      UPDATE  ${type} SET name = $1, description =$2, price = $3, location =$4  WHERE id = $5
    `;
        await pool.query(insertQuery, [name, description, price, location, id]);
        res.send("File uploaded successfully");
      }

      // const fkUserId = parseInt(fk_user_id, 10);

      // Fetch seller details
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  }
);

app.post("/api/delete-upload/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "SELECT unique_name FROM buysell WHERE id = $1";
    const resultD = await pool.query(query, [id]);
    const filename = resultD.rows[0].unique_name;
    const filePath = path.join(__dirname, "uploads", filename);
    fs.unlinkSync(filePath);

    const result = await pool.query(`DELETE FROM buysell WHERE id =$1`, [id]);
  } catch (error) {}
});

app.get("/api/get-status/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the entire settings JSON
    const result = await pool.query(
      `SELECT settings FROM people WHERE id = $1`,
      [userId]
    );

    // console.log("result is", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    // Extract the entire settings JSON from the result
    const settings = result.rows[0].settings;

    // console.log("Fetched settings:", settings);

    // Check if `toggle_status` exists and return it
    if (settings && settings.toggle_status) {
      res.status(200).send(settings);
    } else {
      res.status(404).send({ error: "Toggle status not found in settings" });
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).send({ error: "Failed to fetch settings" });
  }
});

app.post("/api/update-status/:type", async (req, res) => {
  const { status, userId } = req.body;
  const { type } = req.params;

  try {
    const validTypes = ["buysell", "event", "lodge", "roommates"]; // Add valid table names
    if (!validTypes.includes(type)) {
      return res.status(400).send({ error: "Invalid type parameter" });
    }

    const jsonPath = `'{toggle_status,${type}}'`;

    // Update the database with the new status
    await pool.query(`UPDATE ${type} SET status = $1 WHERE fk_user_id = $2`, [
      status,
      userId,
    ]);

    const jsonStatus = JSON.stringify(status);
    await pool.query(
      `UPDATE people
       SET settings = jsonb_set(settings, ${jsonPath}, $1::jsonb, true)
       WHERE id = $2`,
      [JSON.stringify(status), userId]
    );

    res.status(200).send({ message: "Status updated successfully" });
    // console.log("status updated to ", status);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).send({ error: "Failed to update status" });
  }
});

app.post("/api/preference-toggleask", async (req, res) => {
  const { userId } = req.body;

  try {
    await pool.query(
      `UPDATE people
      SET settings = jsonb_set(settings, '{preferences, toggle_ask}', '\"No\"', true)
      WHERE id = $1`,
      [userId]
    );

    // Send a success response
    res.status(200).send({ message: "Preference updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).send({ error: "Failed to update status" });
  }
});

app.get("/api/foodagentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        foodagents.agent_id AS id, 
        UPPER(foodagents.name) AS name, 
        foodagents.contact, 
        foodagents.location, 
         foodagents.description, 

        foodagents.account_created, 
        foodagents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        foodagents.fk_user_id,  
        foodagents.good_rating, 
        foodagents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        foodagents
      LEFT JOIN 
        reviews 
      ON 
        foodagents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'food'
      LEFT JOIN 
        agents 
      ON 
        foodagents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        foodagents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        foodagents.agent_id,
        foodagents.name,
        foodagents.contact,
        foodagents.location,
         foodagents.description, 
        foodagents.account_created,
        foodagents.agent_date,
        foodagents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        foodagents.good_rating,
        foodagents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        foodagents.agent_id DESC;
    `);

    const foodagents = result.rows;

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user; // Assuming user info comes from authentication middleware

    const paginatedfoodagents = foodagents.slice(startIndex, endIndex);
    const totalItems = foodagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      foodagents: paginatedfoodagents,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("An error occurred while fetching food agents.");
  }
});

app.post("/api/patchrating", async (req, res) => {
  const { agentId, userId, rateType, agentType } = req.body;

  try {
    // Check if user already rated the agent
    const result = await pool.query(
      `SELECT * FROM rating WHERE user_id = $1 AND agent_id = $2`,
      [userId, agentId]
    );

    if (result.rows.length > 0) {
      return res.status(500).json("You have already rated this agent");
    }

    // Insert the rating
    await pool.query(
      `INSERT INTO rating (user_id, agent_id, type, agent_type) VALUES ($1, $2, $3, $4)`,
      [userId, agentId, rateType, agentType]
    );

    // Safely update the agent's rating
    const validAgentTypes = [
      "foodagents",
      "deliveryagents",
      "cybercafeagents",
      "repairagents",
      "rideragents",
      "schoolfeeagents",
      "whatsapptvagents",
    ]; // Example: Replace with actual table names
    const validRateTypes = ["good_rating", "bad_rating"]; // Example: Replace with actual column names

    if (
      validAgentTypes.includes(agentType) &&
      validRateTypes.includes(rateType)
    ) {
      await pool.query(
        `UPDATE ${agentType} SET ${rateType} = ${rateType} + 1 WHERE agent_id = $1`,
        [agentId]
      );
    } else {
      return res.status(400).json("Invalid agent type or rate type");
    }

    // Send success response
    res.status(200).json("Rating successfully added and agent updated");
  } catch (error) {
    console.error(error.message);
    res.status(500).json("An error occurred");
  }
});

app.get("/api/repairagentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        repairagents.agent_id AS id, 
        UPPER(repairagents.name) AS name, 
        repairagents.contact, 
        repairagents.location, 
        repairagents.description, 
        repairagents.account_created, 
        repairagents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        repairagents.fk_user_id,  
        repairagents.good_rating, 
        repairagents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        repairagents
      LEFT JOIN 
        reviews 
      ON 
        repairagents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'repair'
      LEFT JOIN 
        agents 
      ON 
        repairagents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        repairagents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        repairagents.agent_id,
        repairagents.name,
        repairagents.contact,
        repairagents.location,
        repairagents.description, 
        repairagents.account_created,
        repairagents.agent_date,
        repairagents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        repairagents.good_rating,
        repairagents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        repairagents.agent_id DESC;
    `);

    const repairagents = result.rows;

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user; // Assuming user info comes from authentication middleware

    const paginatedrepairagents = repairagents.slice(startIndex, endIndex);
    const totalItems = repairagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      repairagents: paginatedrepairagents,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("An error occurred while fetching repair agents.");
  }
});

app.get("/api/cybercafeagentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
     SELECT 
        cybercafeagents.agent_id AS id, 
        UPPER(cybercafeagents.name) AS name, 
        cybercafeagents.contact, 
        cybercafeagents.location, 
        cybercafeagents.description, 
        cybercafeagents.account_created, 
        cybercafeagents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        cybercafeagents.fk_user_id,  
        cybercafeagents.good_rating, 
        cybercafeagents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        cybercafeagents
      LEFT JOIN 
        reviews 
      ON 
        cybercafeagents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'cybercafe'
      LEFT JOIN 
        agents 
      ON 
        cybercafeagents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        cybercafeagents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        cybercafeagents.agent_id,
        cybercafeagents.name,
        cybercafeagents.contact,
        cybercafeagents.location,
        cybercafeagents.description, 
        cybercafeagents.account_created,
        cybercafeagents.agent_date,
        cybercafeagents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        cybercafeagents.good_rating,
        cybercafeagents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        cybercafeagents.agent_id DESC;
    `);

    const cybercafeagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user;

    const paginatedcybercafeagents = cybercafeagents.slice(
      startIndex,
      endIndex
    );
    const totalItems = cybercafeagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      cybercafeagents: paginatedcybercafeagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/deliveryagentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
       SELECT 
        deliveryagents.agent_id AS id, 
        UPPER(deliveryagents.name) AS name, 
        deliveryagents.contact, 
        deliveryagents.location, 
         deliveryagents.description, 

        deliveryagents.account_created, 
        deliveryagents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        deliveryagents.fk_user_id,  
        deliveryagents.good_rating, 
        deliveryagents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        deliveryagents
      LEFT JOIN 
        reviews 
      ON 
        deliveryagents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'delivery'
      LEFT JOIN 
        agents 
      ON 
        deliveryagents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        deliveryagents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        deliveryagents.agent_id,
        deliveryagents.name,
        deliveryagents.contact,
        deliveryagents.location,
         deliveryagents.description, 
        deliveryagents.account_created,
        deliveryagents.agent_date,
        deliveryagents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        deliveryagents.good_rating,
        deliveryagents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        deliveryagents.agent_id DESC;
    `);

    const deliveryagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user;

    const paginateddeliveryagents = deliveryagents.slice(startIndex, endIndex);
    const totalItems = deliveryagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      deliveryagents: paginateddeliveryagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/rideragentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT 
        rideragents.agent_id AS id, 
        UPPER(rideragents.name) AS name, 
        rideragents.contact, 
        rideragents.location,
        rideragents.description,
        rideragents.account_created, 
        rideragents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        rideragents.fk_user_id,  
        rideragents.good_rating, 
        rideragents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        rideragents
      LEFT JOIN 
        reviews 
      ON 
        rideragents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'rider'
      LEFT JOIN 
        agents 
      ON 
        rideragents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        rideragents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        rideragents.agent_id,
        rideragents.name,
        rideragents.contact,
        rideragents.location,
         rideragents.description,
        rideragents.account_created,
        rideragents.agent_date,
        rideragents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        rideragents.good_rating,
        rideragents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        rideragents.agent_id DESC;
    `);

    const rideragents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user;

    const paginatedrideragents = rideragents.slice(startIndex, endIndex);
    const totalItems = rideragents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      rideragents: paginatedrideragents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/schoolfeeagentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        schoolfeeagents.agent_id AS id, 
        UPPER(schoolfeeagents.name) AS name, 
        schoolfeeagents.contact, 
        schoolfeeagents.location, 
         schoolfeeagents.description, 
        
        schoolfeeagents.account_created, 
        schoolfeeagents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        schoolfeeagents.fk_user_id,  
        schoolfeeagents.good_rating, 
        schoolfeeagents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        schoolfeeagents
      LEFT JOIN 
        reviews 
      ON 
        schoolfeeagents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'schoolfee'
      LEFT JOIN 
        agents 
      ON 
        schoolfeeagents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        schoolfeeagents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        schoolfeeagents.agent_id,
        schoolfeeagents.name,
        schoolfeeagents.contact,
        schoolfeeagents.location,
         schoolfeeagents.description, 
        schoolfeeagents.account_created,
        schoolfeeagents.agent_date,
        schoolfeeagents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        schoolfeeagents.good_rating,
        schoolfeeagents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        schoolfeeagents.agent_id DESC;
    `);

    const schoolfeeagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user;

    const paginatedschoolfeeagents = schoolfeeagents.slice(
      startIndex,
      endIndex
    );
    const totalItems = schoolfeeagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      schoolfeeagents: paginatedschoolfeeagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/whatsapptvagentsapi", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        whatsapptvagents.agent_id AS id, 
        UPPER(whatsapptvagents.name) AS name, 
        whatsapptvagents.contact, 
        whatsapptvagents.location, 
        whatsapptvagents.description, 
        whatsapptvagents.account_created, 
        whatsapptvagents.agent_date AS agent_date, 
        people.date AS account_creation_date,
         people.account_balance AS account_balance,
        whatsapptvagents.fk_user_id,  
        whatsapptvagents.good_rating, 
        whatsapptvagents.bad_rating, 
        COALESCE(COUNT(CASE WHEN reviews.type = 'good' THEN 1 END), 0) AS good_reviews_count,
        COALESCE(COUNT(CASE WHEN reviews.type = 'bad' THEN 1 END), 0) AS bad_reviews_count,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'good' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'good') AS good_reviews,
        ARRAY_AGG(
          CASE 
            WHEN reviews.type = 'bad' THEN 
              json_build_object('user_id', reviews.user_id, 'text', reviews.text, 'date', reviews.date )
            ELSE 
              NULL 
          END
        ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews,
        -- Extracting the fields from the people.settings JSONB column
        people.settings->>'Completed Orders' AS completed_orders,
        people.settings->>'Totl Connect Received' AS total_connect_received
      FROM 
        whatsapptvagents
      LEFT JOIN 
        reviews 
      ON 
        whatsapptvagents.agent_id = reviews.agent_id 
        AND reviews.agent_type = 'whatsapptv'
      LEFT JOIN 
        agents 
      ON 
        whatsapptvagents.agent_id = agents.agent_id  -- Join with the agents table
      LEFT JOIN 
        people 
      ON 
        whatsapptvagents.fk_user_id = people.id  -- Join people table to get account creation date
      GROUP BY 
        whatsapptvagents.agent_id,
        whatsapptvagents.name,
        whatsapptvagents.contact,
        whatsapptvagents.location,
         whatsapptvagents.description,
        whatsapptvagents.account_created,
        whatsapptvagents.agent_date,
        whatsapptvagents.fk_user_id,
        agents.date,
        people.date,
        people.account_balance,
        whatsapptvagents.good_rating,
        whatsapptvagents.bad_rating,
        people.settings  -- Group by people.settings to use JSONB fields
        HAVING 
    people.account_balance > 100
      ORDER BY 
        whatsapptvagents.agent_id DESC;
    `);

    const whatsapptvagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user;

    const paginatedwhatsapptvagents = whatsapptvagents.slice(
      startIndex,
      endIndex
    );
    const totalItems = whatsapptvagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      whatsapptvagents: paginatedwhatsapptvagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/submitreview", async (req, res) => {
  try {
    const { type, agentType, userid, agentId, review } = req.body;

    const checkResult = await pool.query(
      "SELECT type, agent_type, user_id, agent_id, text FROM reviews WHERE user_id=$1 AND agent_id = $2",
      [userid, agentId]
    );
    // console.log("Check result rows length:", checkResult.rows.length);
    if (checkResult.rows.length === 1) {
      return res.status(400).json({
        message: "You have already submitted a review for this agent.",
      });
    } else {
      await pool.query(
        "INSERT INTO reviews (type, agent_type, user_id, agent_id, text) VALUES ($1, $2, $3, $4, $5)",
        [type, agentType, userid, agentId, review]
      );
    }

    res.status(200).json({ message: "Review submitted successfully!" });
  } catch (error) {
    console.error("Failed to submit review:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({ message: "Failed to submit review." });
  }
});

app;

// app.post("/api/patchratingwhatsapptv", async (req, res) => {
//   const agentId = req.query.agentId;
//   const goodRating = parseInt(req.query.goodRating);
//   const badRating = parseInt(req.query.badRating);

//   try {
//     if (!isNaN(goodRating)) {
//       const newGoodRating = goodRating + 1;
//       const result = await pool.query(
//         "UPDATE whatsapptvagents SET good_rating = $1 WHERE id = $2",
//         [newGoodRating, agentId]
//       );
//       // console.log(
//       //   `Updated good rating for agent ${agentId} to ${newGoodRating}`
//       // );
//       res.sendStatus(200);
//     } else if (!isNaN(badRating)) {
//       const newBadRating = badRating + 1;
//       const result = await pool.query(
//         "UPDATE whatsapptvagents SET bad_rating = $1 WHERE id = $2",
//         [newBadRating, agentId]
//       );
//       // console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
//       res.sendStatus(200);
//     } else {
//       // Handle the case when neither goodRating nor badRating is provided in the request
//       res.status(400).send("Invalid or missing rating values");
//     }
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500); // Internal Server Error
//   }
// });

app.get("/api/total-connect", async (req, res) => {
  try {
    const query = `
      SELECT agent_type, total_connect FROM total_connect;
    `;

    const result = await pool.query(query); // Assuming you're using `pg` for PostgreSQL
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/api/become-agent", async (req, res) => {
  const {
    type,
    located,
    description,
    call,
    whatsapp,
    email,
    user,
    fullName,
    longitude,
    latitude,
  } = req.body;

  if (call == null || fullName == null) {
    const result = await pool.query(
      "SELECT phone, full_name FROM people WHERE id = $1",
      [user]
    );

    if (result.rows.length > 0) {
      if (call == null) call = result.rows[0].phone;
      if (fullName == null) fullName = result.rows[0].full_name;
    }
  }
  const result1 = await pool.query(
    `SELECT * FROM agents WHERE user_id = $1 AND agent_type = $2`,
    [user, type]
  );

  // Check if any rows are returned
  const response1 = result1.rows.length;
  if (response1 > 0) {
    // Send a conflict response if the user is already an agent
    return res
      .status(409)
      .json({ message: `You are already one of our ${type}` });
  }

  const token = uuidv4(); // Generate a unique token
  await pool.query(
    "INSERT INTO approval_token (token, user_id) VALUES ($1, $2)",
    [token, user]
  );

  // const response1 = await axios.get(
  //   `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
  //   { headers: { "User-Agent": "zikconnect.com/1.0 (admin@zikconnect.com)" } }
  // );

  const response = await axios.get(
    `https://api.opencagedata.com/geocode/v1/json`,
    {
      params: {
        q: `${latitude},${longitude}`,
        key: OPENCAGE_TOKEN,
        pretty: 1,
        no_annotations: 1,
      },
    }
  );

  const formatted = response.data.results[0]?.formatted || "";

  const locationData = { latitude, longitude, formatted };

  const encodedLocationData = encodeURIComponent(
    JSON.stringify({ locationData })
  );
  // Check if required fields are present
  if (!type || !fullName || !email || !user || !call || !whatsapp) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
      INSERT INTO agent_approval (type, located, description, call, whatsapp, email, user_id, fullname, gps_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

  const values = [
    type,
    located,
    description,
    call,
    whatsapp,
    email,
    user,
    fullName,
    locationData,
  ];

  const result = await pool.query(query, values);

  // res.status(201).json({
  //   message: "Agent approval request submitted successfully",
  //   agentApproval: result.rows[0],
  // });

  // Define email content for the user
  const subject = "Pending Approval";
  const text = `YOU HAVE MADE A REQUEST TO BECOME ONE OF OUR ${type}. WE WILL REVIEW YOUR DOCUMENT WITHIN 24-48hrs`;
  const html = `<h1>ZIKCONNECT</h1>
                <p>Dear ${fullName}, you have made a request to become one of our ${type}.An interview would be conducted on your whatsapp number by one of our customer agents within 24-48 hours. 
                <br><strong>BEST WISHES</strong>
                </p>`;

  // Email options for the user
  const mailOptions = {
    from: "admin@zikconnect.com", // Sender's address
    to: email, // User's email
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };

  // Define email content for the admin
  const subject2 = "Pending Approval";
  const text2 = `Dear Admin, a user made a request to become one of our ${type}. Here are their details below. Be sure to interview them on WhatsApp before approving or rejecting their request.`;
  const html2 = `<h1>ZIKCONNECT</h1>
                 <p>Dear Admin, a user made a request to become one of our ${type}. Here are their details:
                 <ul>
                 <h2>INFO</h2>
                   <li><strong>User:</strong> ${user}</li>
                    <li><strong>Full  Name:</strong> ${fullName}</li>
                   <li><strong>Email:</strong> ${email}</li>
                   <li><strong>Exact Location:</strong> ${locationData.formatted}</li>
                
               
                   <br></br>
                   <br></br>
                   <h2>INTERVIEW</h2>
                   <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${whatsapp}">Chat</a>
                  
                  

                    <br></br>
                     
                   <p> Or call the user ${call} </p>
                    <br></br>
                   <br></br>
                   <h2>Visit Site to Approve</h2>
                     <br></br>
                    <a href = "https://zikconnect.com/agentmanagement">Zikconnect </a>  </ul>
                 </p>`;

  //  https://zikconnect-36adf65e1cf3.herokuapp.com

  // Email options for the admin
  const mailOptions2 = {
    from: "ZIKCONNECT admin@zikconnect.com", // Sender's address
    to: "zikconnectinfo@gmail.com", // Admin's email
    subject: subject2, // Subject line
    text: text2, // Plain text body
    html: html2, // HTML body
  };

  // Send emails and handle errors
  try {
    // Query to check if the user is already an agent

    await pool.query(
      `
  UPDATE people
  SET 
    settings = jsonb_set(
      settings, 
      '{account_balance}', 
      to_jsonb((settings->>'account_balance')::int - 1000)  -- The new value as JSONB
    ),
    account_balance = account_balance - 1000
  WHERE 
    id = $1;
  `,
      [user] // Pass user ID as parameter here
    );

    // Ensure mailOptions and mailOptions2 are properly defined
    const info = await transporter.sendMail(mailOptions); // Email to user
    const info2 = await transporter.sendMail(mailOptions2); // Email to admin

    // Log success message with info

    // Respond with success
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    // Log error message for debugging
    console.error("Error sending emails:", error);

    // Respond with a 500 status and detailed error message
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
});

async function getPlaceName(longitude, latitude) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_API_TOKEN}`;

    const response = await axios.get(url);
    const feature = response.data.features[0];

    const placeName =
      response.data.features[0]?.place_name || "Unknown Location";

    return placeName;
  } catch (error) {
    console.error("Error fetching geolocation:", error);
  }
}

app.get("/api/agent-management", async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
      id,          
      type,
      located,
      description,
      call,
      whatsapp,
      email,
      user_id,
      fullname,
      gps_location->>'formatted' AS formatted_location,
      status
    FROM 
      agent_approval
    ORDER BY id DESC`); // Order by id in descending order

    const agent_approval = result.rows;
    res.json({ approval: agent_approval });
  } catch (error) {
    console.error("Error fetching agent approvals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/get-distance", async (req, res) => {
  const { itemId, latitude, longitude } = req.query;

  try {
    let locationData = { lat: null, lon: null, display_name: null };

    // Attempt to fetch location data from Nominatim
    try {
      // const response = await axios.get(
      //   `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      //   {
      //     headers: {
      //       "User-Agent": "zikconnect.com/1.0 (admin@zikconnect.com)",
      //     },
      //   }
      // );

      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: `${latitude},${longitude}`,
            key: OPENCAGE_TOKEN,
            pretty: 1,
            no_annotations: 1,
          },
        }
      );

      const formatted = response.data.results[0]?.formatted || "";

      if (response && response.data) {
        locationData = {
          lat: latitude,
          lon: longitude,
          display_name: formatted,
        };
      } else {
        console.warn("Nominatim returned no valid data");
      }
    } catch (error) {
      console.error("Nominatim API request failed:", error.message);
      // Optionally return a default response or an empty object
    }

    const agentLocation = await pool.query(
      `SELECT exact_location FROM buysell WHERE id = $1`,
      [itemId]
    );

    if (agentLocation.rows.length === 0) {
      throw new Error("Agent location not found in the database");
    }

    const agentLatitude =
      agentLocation.rows[0]?.exact_location?.locationData?.lat ?? 0;
    const agentLongitude =
      agentLocation.rows[0]?.exact_location?.locationData?.lon ?? 0;

    const agentDisplayName =
      agentLocation.rows[0]?.exact_location?.locationData?.display_name ?? null;

    if (agentLatitude === 0 || agentLongitude === 0) {
      throw new Error("Agent latitude or longitude is invalid");
    }

    const start = [locationData.lon, locationData.lat]; // Start point from OpenStreetMap response
    const end = [agentLongitude, agentLatitude]; // End point from database

    if (!start || !end) {
      throw new Error("Start or end points for location are missing");
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=${MAPBOX_API_TOKEN}&geometries=geojson`;
    const response2 = await axios.get(url);
    const route = response2.data.routes[0];
    const distance = Math.round(route.distance / 1000);
    const duration = Math.round(route.duration / 60);

    res.json({
      distance: distance,
      duration: duration,
      display_name: agentDisplayName,
    });
  } catch (error) {
    console.error("Error in get-distance route:", error.message);
    // Respond with an empty object or a default response
    res.json({
      distance: null,
      duration: null,
      display_name: null,
      error: "Could not retrieve distance information",
    });
  }
});

app.get("/api/get-account-balance", async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query(
      `SELECT account_balance FROM people WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const accountBalance = result.rows[0].account_balance;

    res.json({ account_balance: accountBalance });
  } catch (error) {
    console.error("Error in /api/get-account-balance:", error.message);
    res.status(500).send("Server Error");
  }
});

app.post("/api/send-connect-email", async (req, res) => {
  const {
    agentId,
    userId,
    orderId,
    agentType,
    agentUserId,
    latitude,
    longitude,
    locationM,
    type,
  } = req.body;

  const requestTime = new Date(); // Current time

  const result = await pool.query(
    `SELECT account_balance FROM people WHERE id = $1`,
    [userId]
  );

  const result3 = await pool.query(
    "SELECT full_name from people WHERE id = $1",
    [agentUserId]
  );
  const agentFullname = result3.rows[0].full_name;

  const accountBalance = result.rows[0];
  if (accountBalance < 100) {
    return res.status(400).json({
      message:
        "Your Account Balance is low you need at least N100 to connect with an agent please fund your account and continue",
    });
  }

  const message = "connect request";
  const agent = agentType + "agents";
  let locationData = {};
  let distance = null;
  let duration = null;
  let updatedItem = {};

  if (latitude) {
    // const response = await axios.get(
    //   `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
    //   { headers: { "User-Agent": "zikconnect.com/1.0 (admin@zikconnect.com)" } }
    // );

    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json`,
      {
        params: {
          q: `${latitude},${longitude}`,
          key: OPENCAGE_TOKEN,
          pretty: 1,
          no_annotations: 1,
        },
      }
    );

    const formatted = response.data.results[0]?.formatted || "";

    if (!response || !response.data) {
      throw new Error(
        "Failed to retrieve location data from OpenStreetMap API"
      );
    }
    let agentLocation = {};

    if (
      agentType == "buysell" ||
      agentType == "lodge" ||
      agentType == "event"
    ) {
      const status = "available";
      // SQL query to remove the NOT NULL constraint from a column
      const alterTableQuery = `
      ALTER TABLE connect
      ALTER COLUMN agent_id DROP NOT NULL;
    `;

      // Execute the query
      await pool.query(alterTableQuery);

      await pool.query(
        "INSERT INTO connect (order_id, user_id, request_time, status, name, type, user_location, distance, duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          orderId,
          userId,
          requestTime,
          status,
          agentFullname,
          agentType,
          locationData,
          distance,
          duration,
        ]
      );

      const result = await pool.query(
        `UPDATE ${agentType} SET status = $1 WHERE status = $2 RETURNING *`,
        ["available", "order"]
      );

      // if (result.rowCount > 0) {
      //   updatedItem = result.rows[0];

      //   // Add a job to the queue to change the status after 30 minutes
      //   // await myQueue.add({ agentId }, { delay: 30 * 60 * 1000 });
      // } // 30 minutes delay

      agentLocation = await pool.query(
        `SELECT exact_location FROM buysell WHERE id = $1`,
        [agentId]
      );
    } else {
      // Query the agent's exact location from the database
      agentLocation = await pool.query(
        `SELECT exact_location FROM agents WHERE agent_id = $1`,
        [agentId]
      );

      await pool.query(
        "INSERT INTO connect (order_id, user_id, agent_id, request_time, name, type, user_location, distance, duration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          orderId,
          userId,
          agentId,
          requestTime,
          agentFullname,
          agentType,
          locationData,
          distance,
          duration,
        ]
      );
    }

    locationData = {
      lat: latitude,
      lon: longitude,
      display_name: formatted,
      type: type,
    };

    // const { lat, lon, display_name } = response.data;

    if (agentLocation.rows.length === 0) {
      throw new Error("Agent location not found in the database");
    }

    const agentLatitude =
      agentLocation.rows[0]?.exact_location?.locationData?.lat ?? 0;
    const agentLongitude =
      agentLocation.rows[0]?.exact_location?.locationData?.lon ?? 0;

    if (agentLatitude === 0 || agentLongitude === 0) {
      throw new Error("Agent latitude or longitude is invalid");
    }

    const start = [longitude, latitude]; // Start point from OpenStreetMap response
    const end = [agentLongitude, agentLatitude]; // End point from database

    if (!start || !end) {
      throw new Error("Start or end points for location are missing");
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=${MAPBOX_API_TOKEN}&geometries=geojson`;
    const response2 = await axios.get(url);
    const route = response2.data.routes[0];
    distance = Math.round(route.distance / 1000);
    duration = Math.round(route.duration / 60);
  } else {
    locationData = {
      lat: "unknown",
      lon: "unknown",
      display_name: locationM,
      type: type,
    };
  }

  try {
    // Query the database to get the agent's email

    await pool.query(`
  UPDATE connect
  SET agent_location = to_jsonb(a.exact_location)
  FROM agents a
  WHERE connect.agent_id = a.agent_id
`);
    await pool.query(
      `UPDATE total_connect SET total_connect = total_connect + 1 WHERE agent_type = $1`,
      [agent]
    );
    await pool.query(
      `
  UPDATE people
  SET settings = jsonb_set(
      jsonb_set(
          settings, -- The column you're updating
          '{Totl Connect Made}', -- The path to the key you want to increment
          to_jsonb((settings ->> 'Totl Connect Made')::int + 1), -- Increment the current value by 1
          true -- Create the key if it doesn't exist
      ),
      '{account_balance}', -- The path to the key you want to decrement
      to_jsonb((settings ->> 'account_balance')::int - 100), -- Decrement the value by 100
      true -- Create the key if it doesn't exist
  ),
  account_balance = account_balance - 100
  WHERE id = $1;`, // Placeholder for the userId
      [userId] // Pass userId as a parameter here
    );

    await pool.query(
      `
  UPDATE people
  SET settings = jsonb_set(
      jsonb_set(
          settings, -- The column you're updating
          '{Totl Connect Received}', -- The path to the key you want to increment
          to_jsonb((settings ->> 'Totl Connect Received')::int + 1), -- Increment the current value by 1
          true -- Create the key if it doesn't exist
      ),
      '{account_balance}', -- The path to the key you want to decrement
      to_jsonb((settings ->> 'account_balance')::int - 100), -- Decrement the value by 100
      true -- Create the key if it doesn't exist
  ),
  account_balance = account_balance - 100
  WHERE id = $1;`, // Placeholder for the userId
      [agentUserId] // Pass userId as a parameter here
    );

    const response = await pool.query(
      `INSERT INTO messages (user_id, message, type, sender_id, order_code)
   VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [agentUserId, message, agentType, userId, orderId]
    );

    const messageId = response.rows[0].id; // Assuming 'id' is the primary key for messages

    // Update the agent_phone based on the people's phone number
    await pool.query(
      `UPDATE messages
   SET agent_phone = p.phone
   FROM people p
   WHERE messages.user_id = p.id AND messages.id = $1`,
      [messageId]
    );

    await pool.query(
      `UPDATE messages
   SET agent_fullname = p.full_name
   FROM people p
   WHERE messages.user_id = p.id AND messages.id = $1`,
      [messageId]
    );

    // Update the agent_whatsapp based on the agents' contact
    await pool.query(
      `UPDATE messages
   SET agent_whatsapp = a.contact
   FROM agents a
   WHERE messages.user_id = a.user_id AND messages.id = $1`,
      [messageId]
    );

    // await notifyNewMessages(agentUserId);

    const insertedMessage = response.rows[0]; // The inserted message with basic info

    // Now perform the update to add the sender's phone and full name
    await pool.query(
      `UPDATE messages 
   SET sender_phone = p.phone, sender_fullname = p.full_name 
   FROM people p 
   WHERE messages.sender_id = p.id AND messages.sender_id = $1`,
      [userId]
    );

    // Fetch the updated message to get the phone and full name
    const updatedMessageResponse = await pool.query(
      `SELECT m.*, p.phone AS sender_phone, p.full_name AS sender_fullname
   FROM messages m
   JOIN people p ON m.sender_id = p.id
   WHERE m.id = $1`,
      [insertedMessage.id] // the ID of the inserted message
    );

    const updatedMessage = updatedMessageResponse.rows[0]; // This will include phone and full name

    setTimeout(async () => {
      await pool.query(
        `
            DELETE FROM connect
            WHERE request_time = $1
            AND status = 'pending'
          `,
        [requestTime]
      );
    }, 10 * 60 * 1000);
    let result = await pool.query(
      "SELECT email FROM agents WHERE agent_id = $1",
      [agentId]
    );

    if (
      agentType == "buysell" ||
      agentType == "event" ||
      agentType == "lodge"
    ) {
      result = await pool.query("SELECT email FROM people WHERE id = $1", [
        agentUserId,
      ]);
    }

    // Check if any rows were returned
    if (result.rows.length === 0) {
      return res.status(404).send({ error: "Agent not found" });
    }

    // Extract the email from the result
    const email = result.rows[0].email;

    // Prepare email content
    let subject = "New Connect";
    let text = `YOU HAVE A NEW CONNECT FROM USER ${userId}`;
    let html = `<h1 style="color: #15b58e ; margin-left: 20% " >ZIKCONNECT</h1>
                      <p style = "font-family: Times New Roman ; ">Dear Agent, you have a new connect with the order ID <strong>${orderId} </strong>  from a customer with user ID ${userId}. 
                      Please attend to them politely and offer sincere services as all connects are properly monitored.
                      <p>
                       <br></br>
                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Customer Location</h2>
                      <ul><li style = "font-family: Times New Roman ; ">${locationData.display_name}</li>
                      <li style = "font-family: Times New Roman ; "> Type of location - ${locationData.type}</li>
                       <li style = "font-family: Times New Roman ; "> Distance between you two - ${distance}km </li>
                      <li style = "font-family: Times New Roman ; "> Duration - ${duration}minuites</li></ul>
                      <br></br>
                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Fraud Prevention </h2>
                      <li style = "font-size: 10px;"> <strong>Note !! Automatic locations are more Authentic (though it could be wrong sometimes) than Manual locations as it indicates that 
                      the customer inputed the location themselves rather than using their automatic gps tracker </strong> </li>
                     
                      <li style = "font-size: 10px;"> Manual Locations do not come with  distance and direction calculations</li>
           </p>
                                 <a href ="https://zikconnect.com/profiles"> Click here to Respond</a>
                      </p>`;

    if (
      agentType == "buysell" ||
      agentType == "event" ||
      agentType == "lodge"
    ) {
      subject = "New Order";
      text = `YOU HAVE A NEW CONNECT FROM USER ${userId}`;
      html = `<h1 style="color: #15b58e ; margin-left: 20% " >ZIKCONNECT</h1>
                      <p style = "font-family: Times New Roman ; ">Dear Seller, you have a new connect with the order ID <strong>${orderId} </strong>  from a customer with user ID ${userId}. 
                      Please attend to them politely and offer sincere services as all connects are properly monitored.
                      <p>
                       <br></br>
                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Order Details</h2>
                      <strong>
                      <ul> 
                      <strong> <li style = "font-family: Times New Roman ; "> Item ID - ${updatedItem.id}</li> </strong>
                      </strong><li style = "font-family: Times New Roman ; ">Name of Item - ${updatedItem.name}</li> </strong>
                      <strong> <li style = "font-family: Times New Roman ; "> Price - ${updatedItem.price}</li> </strong>
                      </ul>
                       <br></br>
                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Customer Location</h2>
                       <strong><ul><li style = "font-family: Times New Roman ; ">${locationData.display_name}</li> </strong>
                       <strong><li style = "font-family: Times New Roman ; "> Type of location - ${locationData.type}</li> </strong>
                       <strong> <li style = "font-family: Times New Roman ; "> Distance between you two - ${distance} km </li> </strong>
                      <strong> <li style = "font-family: Times New Roman ; "> Duration - ${duration} minuites</li></ul> </strong>
                      <br></br>
                     
                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Fraud Prevention </h2>
                      <li style = "font-size: 10px; font-family: Times New Roman"> It is your obligation to deliver the item to the customer before they make payment </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> You can request a video call to confirm the customer identity and location</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> <strong>Note !! Automatic locations are more Authentic (though it could be wrong sometimes) than Manual locations as it indicates that 
                      the customer inputed the location themselves rather than using their automatic gps tracker </strong> </li>
                     
                      <li style = "font-size: 10px; font-family: Times New Roman"> Manual Locations do not come with  distance and direction calculations</li>
           </p>
                      </p>`;
    }

    // Define email options
    const mailOptions = {
      from: "Zikconnect admin@zikconnect.com", // Sender address
      // to: email,
      // Recipient's email address
      to: email,
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // console.log("Message sent: %s", info.messageId);
    res
      .status(200)
      .send({ message: "Email sent successfully!", updatedMessage });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).send({ error: "Failed to send email." });
  }
});

// Backend endpoint to handle agent's response
app.post("/api/respond-to-connect", async (req, res) => {
  const { order_id, user_id, agentUserId, agent_id, status } = req.query;

  // Debug logs
  // console.log(order_id, user_id, agent_id, status);

  try {
    // Fetch request time and check expiration
    const result = await pool.query(
      "SELECT request_time FROM connect WHERE order_id = $1",
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid connect request." });
    }

    const requestTime = new Date(result.rows[0].request_time);
    const currentTime = new Date();
    const elapsedTime = (currentTime - requestTime) / 60000; // Convert to minutes

    if (elapsedTime > 10) {
      await pool.query("DELETE FROM connect WHERE order_id = $1", [order_id]);
      return res.status(400).json({ message: "Connect request has expired." });
    }

    // Update the connect status
    await pool.query(
      "UPDATE connect SET status = $1, request_time = $2 WHERE order_id = $3 AND agent_id = $4 RETURNING *",
      [status, currentTime, order_id, agent_id]
    );

    if (status == "accepted") {
      const result2 = await pool.query(
        `SELECT phone, email FROM people WHERE id = $1`,
        [user_id]
      );
      const result3 = await pool.query(
        `SELECT contact, email FROM agents WHERE id = $1`,
        [agent_id]
      );

      const userPhone = result2.rows[0].phone;
      const userEmail = result2.rows[0].email;
      const agentWhatsapp = result3.rows[0].contact;
      const agentEmail = result3.rows[0].email;

      const subject = "Connect Accepted";
      const text = `Your Connect has been accepted`;
      const html = `<h1 style="color: #15b58e ; margin-left: 20% " >Accepted &#x1F389; </h1>
                     <p> Dear Esteemed User,</p>
                     <br> </br><p> Your recent connect made has been accepted by our agent !!&#x1F389.
                      We are glad to rendering services to you.&#x1F680; The agent would have 30 minutes to deliver your request or  would give valid proof to show that they are delivering your request
                       <p/> <br> </br>
                        <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${agentWhatsapp}">Chat With Agent</a>
                  


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> We care so much about our students safety and welfare </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Please keep proper evidence about your transaction with the agent such as whatsapp chats or recorded calls to help you report the agent if they are fraudulent.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> You can also rate the agent or leave a review on the agents profile after the transaction to help other students know about the agents credibility and efficiency</li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> Do not abuse or use violent languages on our agents as reports copuld lead to termination of your account</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;">All reviews are investigated, therefore do not leave dishonest reviews. Your review should be based on the current order you made and not for past orders or any personal reasons with the agent</li>
                         <li> We also use sophisticated algorithms to store our agents identity 
                         and other sensitive details to protect our students therefore quickly report any fraudulent agent to stop them from harming other students. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
                     
            `;

      // Define email options
      const mailOptions = {
        from: "Zikconnect admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: userEmail,
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html, // HTML body
      };

      const subject2 = "Connect Accepted";
      const text2 = `Your Connect has been accepted`;
      const html2 = `<h1 style="color: #15b58e ; margin-left: 20% " >Accepted &#x1F389; </h1>
                     <p> Dear Esteemed Agent,</p>
                     <br> </br><p> You have accepted the connect!! &#x1F389;
                      We hope you serve our students with your best performance..&#x1F680; You have 30 minutes to deliver this order or give valid proof to the user to show that you are delivering your request
                       <p/> <br> </br>
                        <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${userPhone}">Chat With User</a>
                        <p> Or call them on this number <strong>${userPhone} </strong> </p>
                  


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> You have a very sensitive profile. Keep it clean!!. </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Your clients can rate, review and report you, 
                      and this would be visible for other clients to see on your profile.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Therefore you must treat every order with optimum efficiency 
                      to keep a positive profile and give you a competing advantage against other agents </li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> When an order comes in, You have 10 minutes to accept or reject the order or it would be automatically
                        be rejected after the time elapses. rejecting orders will reduce your completion rate
                        which would give clients an inpression that you are unresponsive therefore stopping them from clicking your ad</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;"> A single report on your account with valid proof of
                         fraudulent engagement will lead to permernent termination of your account/agent profile.  </li>
                         <li> We also use sophisticated algorithms to store our agents identity, exact location and other sensitive details to protect our students therefore we can go further to involve security agencies if the scammed victim requests. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
            `;

      // Define email options
      const mailOptions2 = {
        from: "Zikconnect admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: agentEmail,
        subject: subject2, // Subject line
        text: text2, // Plain text body
        html: html2, // HTML body
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      const info2 = await transporter.sendMail(mailOptions2);
    }

    res.status(200).json({ message: "Response recorded." });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({ error: "Failed to process request." });
  }
});

app.get("/api/check-pending-connects", async (req, res) => {
  const { userId, type } = req.query;

  // console.log(userId);
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch reviews from the database
    const result = await pool.query(
      `SELECT * FROM connect WHERE user_id = $1 AND (status = $2 OR status = $3 OR status = $4) AND type = $5 ORDER BY request_time DESC LIMIT 1`,
      [userId, "pending", "accepted", "completed", type]
    );

    // Send the reviews as the response
    res.json(result.rows[0]);
    // console.log(result.rows[0]);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/respond-to-connect", async (req, res) => {
  const { order_id, agent_user_id, user_id, agent_id, status } = req.query;

  // Debug logs
  // console.log(order_id, user_id, agent_id, status);

  try {
    // Fetch request time and check expiration
    const result = await pool.query(
      "SELECT request_time FROM connect WHERE order_id = $1",
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid connect request." });
    }

    const requestTime = new Date(result.rows[0].request_time);
    const currentTime = new Date();
    const elapsedTime = (currentTime - requestTime) / 60000; // Convert to minutes

    if (elapsedTime > 10) {
      await pool.query("DELETE FROM connect WHERE order_id = $1", [order_id]);
      return res.status(400).json({ message: "Connect request has expired." });
    }

    // Update the connect status
    await pool.query(
      "UPDATE connect SET status = $1 WHERE order_id = $2 AND agent_id = $3 RETURNING *",
      [status, order_id, agent_id]
    );
    if (status == "accepted") {
      const result2 = await pool.query(
        `SELECT phone, email FROM people WHERE id = $1`,
        [user_id]
      );
      const result3 = await pool.query(
        `SELECT contact, email FROM agents WHERE id = $1`,
        [agent_id]
      );

      const userPhone = result2.rows[0].phone;
      const userEmail = result2.rows[0].email;
      const agentWhatsapp = result3.rows[0].contact;
      const agentEmail = result3.rows[0].email;

      const subject = "Connect Accepted";
      const text = `Your Connect has been accepted`;
      const html = `<h1 style="color: #15b58e ; margin-left: 20% " >Accepted &#x1F389; </h1>
                     <p> Dear Esteemed User,</p>
                     <br> </br><p> Your recent connect made has been accepted by our agent !!&#x1F389;
                      We are glad to rendering services to you.&#x1F680; The agent would have 30 minutes to deliver your request or  would give valid proof to show that they are delivering your request
                       <p/> <br> </br>
                        <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${agentWhatsapp}">Chat With Agent</a>
                  


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> We care so much about our students safety and welfare </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Please keep proper evidence about your transaction with the agent such as whatsapp chats or recorded calls to help you report the agent if they are fraudulent.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> You can also rate the agent or leave a review on the agents profile after the transaction to help other students know about the agents credibility and efficiency</li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> Do not abuse or use violent languages on our agents as reports copuld lead to termination of your account</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;">All reviews are investigated, therefore do not leave dishonest reviews. Your review should be based on the current order you made and not for past orders or any personal reasons with the agent</li>
                         <li> We also use sophisticated algorithms to store our agents identity 
                         and other sensitive details to protect our students therefore quickly report any fraudulent agent to stop them from harming other students. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
                     
            `;

      // Define email options
      const mailOptions = {
        from: "Zikconnect admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: userEmail,
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html, // HTML body
      };

      const subject2 = "Connect Accepted";
      const text2 = `Your Connect has been accepted`;
      const html2 = `<h1 style="color: #15b58e ; margin-left: 20% " >Accepted &#x1F389; </h1>
                     <p> Dear Esteemed Agent,</p>
                     <br> </br><p> You accepted the connect!! &#x1F389;
                      We hope you serve our students with your best performance..&#x1F680; You have 30 minutes to deliver this order or give valid proof to the user to show that you are delivering your request
                       <p/> <br> </br>
                        <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${userPhone}">Chat With User</a>
                        <p> Or call them on this number <strong>${userPhone} </strong> </p>
                  


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> You have a very sensitive profile. Keep it clean!!. </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Your clients can rate, review and report you, 
                      and this would be visible for other clients to see on your profile.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Therefore you must treat every order with optimum efficiency 
                      to keep a positive profile and give you a competing advantage against other agents </li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> When an order comes in, You have 10 minutes to accept or reject the order or it would be automatically
                        be rejected after the time elapses. rejecting orders will reduce your completion rate
                        which would give clients an inpression that you are unresponsive therefore stopping them from clicking your ad</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;"> A single report on your account with valid proof of
                         fraudulent engagement will lead to permernent termination of your account/agent profile.  </li>
                         <li> We also use sophisticated algorithms to store our agents identity, exact location and other sensitive details to protect our students therefore we can go further to involve security agencies if the scammed victim requests. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
            `;

      // Define email options
      const mailOptions2 = {
        from: "Zikconnect admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: agentEmail,
        subject: subject2, // Subject line
        text: text2, // Plain text body
        html: html2, // HTML body
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      const info2 = await transporter.sendMail(mailOptions2);
    }

    res.status(200).json({ message: "Response recorded." });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({ error: "Failed to process request." });
  }
});

app.post("/api/respond-to-agent", async (req, res) => {
  // const {
  //   type,
  //   located,
  //   description,
  //   call,
  //   whatsapp,
  //   email,
  //   user,
  //   fullName,
  //   status,
  //   token,
  // } = req.query;

  // const locationData = JSON.parse(decodeURIComponent(req.query.locationData));

  // Debug logs

  const { messageId, decision } = req.body;

  const response = await pool.query(
    "SELECT * FROM agent_approval WHERE id = $1 ",
    [messageId]
  );
  const {
    type,
    located,
    description,
    call,
    whatsapp,
    email,
    user_id,
    fullname,
    gps_location,
    status,
  } = response.rows[0];

  try {
    // const tokenData = await pool.query(
    //   "SELECT * FROM approval_token WHERE token = $1",
    //   [token]
    // );
    if (status === "pending") {
      if (decision === "approved") {
        await pool.query(
          `INSERT INTO agents (user_id, agent_type, name, contact, email, exact_location) VALUES ($1, $2, $3, $4, $5, $6)`,
          [user_id, type, fullname, whatsapp, email, gps_location]
        );
        await pool.query(
          "UPDATE agent_approval SET status = $1 WHERE id = $2",
          [decision, messageId]
        );

        const result = await pool.query(
          `SELECT agent_id FROM agents WHERE user_id = $1 AND agent_type = $2`,
          [user_id, type]
        );
        const result2 = await pool.query(
          `SELECT date FROM people WHERE id=$1`,
          [user_id]
        );

        // Extract necessary data
        const agentId = result.rows[0].agent_id;
        const accountCreatedDate = result2.rows[0].date;

        await pool.query(
          `INSERT INTO ${type} (name, contact, fk_user_id, location, agent_id, account_created, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            fullname,
            whatsapp,
            user_id,
            located,
            agentId,
            accountCreatedDate,
            description,
          ]
        );

        const result4 = await pool.query(
          `SELECT settings ->> 'Referred By' AS referral_code FROM people WHERE id = $1`,
          [user_id]
        );

        const referral = result4.rows[0]?.referral_code;

        if (referral) {
          const result = await pool.query(
            `
  UPDATE people
  SET settings = jsonb_set(
    jsonb_set(
      settings,
      '{Referred Agents}', 
      to_jsonb(COALESCE((settings ->> 'Referred Agents')::int, 0) + 1),
      true
    ),
    '{Withdrawable Cash}',
    to_jsonb(COALESCE((settings ->> 'Withdrawable Cash')::int, 0) + 300),
    true
  )
  WHERE settings->>'Referral Code' = $1
  RETURNING email;
  `,
            [referral]
          );

          // Extract the email from the result
          if (result.rows.length === 0) {
          } else {
            const email = result.rows[0].email;

            const subject = "New Referred Agent ";
            const text = `Referred Agent`;
            const html = `<h1 style="color: #15b58e ; margin-left: 20% " >Congrats &#x1F389;  &#x1F389;</h1>
                      <strong><p style = "font-family: Times New Roman ;"> Dear User, You have successfully referred an agent on our website <br /> 
                      A sum of 300 naira has been added to your withdrawable cash. the minimum amount for withdrawal is 900. 

                      <h2> PLEASE NOTE !! <h2>
                      <ul>
                      <li> All our agents are well monitored and  scrutinized, any attempt to register a false agent would lead to immediate ban on  your account as well as that of the agent and your device ip, your full name, phone number, email and other sensitive details would be blacklisted from opening subsiquent accounts  </li>
                       <li> By registering an agent with your referral code it means you can stand in for them in case they scam any student and are untracable by law enforcement. </li>
                        <li>You must only recieve payment with the same name you used in registering your account. placing withdrawal with a false name would lead to immediate loss of funds </li>
                        <li>The agent must offer the exact service they claim to offer on the site as any report from students who place orders will be acted upon </li>
                        <li>Withdrawing below the minimum amount for withdrawal would lead to loss of funds </li>
                        <li>Our withdrawal process takes within 24-72 hours depending on the time for processing by our finance team  </li>
                        <li>To view your withdrawable cash or to withdraw, please head to your dashboard and click on profiles below the left side bar then click on the dollar icon next to withdrawable cash and include your details for processing </li>
                      </ul>
                       </strong>if you have further questions reach out to us at admin@zikconnect.com</strong>
                      </strong>
                      </p>`;

            const mailOptions = {
              from: "admin@zikconnect.com", // Sender address
              // to: email,
              // Recipient's email address
              to: email,
              subject: subject, // Subject line
              text: text, // Plain text body
              html: html, // HTML body
            };

            // Send email
            await transporter.sendMail(mailOptions);
          }

          // Logs the updated email value
        }

        // await pool.query("DELETE FROM approval_token WHERE token = $1", [
        //   token,
        // ]);

        const subject = "Request Approved";
        const text = `Your request has been approved `;
        const html = `
        <h1 style="color: #15b58e ; margin-left: 20% " >CONGRATS !!! &#x1F389; </h1>
                     <p> Dear Esteemed User,</p>
                     <br> </br><p> Your request to become one of our ${type} has been approved !!&#x1F389; We are glad to have you on board as one of our partners helping Zikconnect to render 
                     services to our beloved students &#x1F60A;. Welcome to the inner circle!!.&#x1F680; <p/> <br> </br>


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> You have a very sensitive profile. Keep it clean!!. </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Your clients can rate, review and report you, 
                      and this would be visible for other clients to see on your profile.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Therefore you must treat every order with optimum efficiency 
                      to keep a positive profile and give you a competing advantage against other agents </li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> When an order comes in, You have 10 minutes to accept or reject the order or it would be automatically
                        be rejected after the time elapses. rejecting orders will reduce your completion rate
                        which would give clients an inpression that you are unresponsive therefore stopping them from clicking your ad</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;"> A single report on your account with valid proof of
                         fraudulent engagement will lead to permernent termination of your account/agent profile.  </li>
                         <li> We also use sophisticated algorithms to store our agents identity, exact location and other sensitive details to protect our students therefore we can go further to involve security agencies if the scammed victim requests. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
                     
            `;

        // Define email options
        const mailOptions = {
          from: "Zikconnect admin@zikconnect.com", // Sender address
          // to: email,
          // Recipient's email address
          to: email,
          subject: subject, // Subject line
          text: text, // Plain text body
          html: html, // HTML body
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        res.send("you have successfully added the agent");
      } else if (decision === "declined") {
        await pool.query(
          "UPDATE agent_approval SET status = $1 WHERE id = $2",
          [decision, messageId]
        );
        const subject = "Request Declined";
        const text = `Your request has been declined `;
        const html = `
         <h1 style="color: #15b58e ; margin-left: 20% font-size: 7rem"> ❌ </h1>
        <h1 style="color: red ; margin-left: 20% " >Declined 😢 </h1>
                     <p> Dear Esteemed User,</p>
                     <br> </br><p> Your request to become one of of our ${type} has been declined. Zikconnect takes drastic decisions in ensuring the safety of our students. The reason for our conclusion can not be disclosed
                     for security reasons, if you feel this was a mistake please contact us on<strong> admin@zikconnect.com</strong> <p/> <br> </br>


                     

<br></br>

We are sorry for any inconvenience caused. you still have access to our other services. Goodluck
                     
                     
                     
            `;

        // Define email options
        const mailOptions = {
          from: "Zikconnect admin@zikconnect.com", // Sender address
          // to: email,
          // Recipient's email address
          to: email,
          subject: subject, // Subject line
          text: text, // Plain text body
          html: html, // HTML body
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
      } else {
        res.status(400).send({ error: "Status is not approved." });
        return;
      }
    } else {
      res.send("Invalid or expired token.");
    }
    // Fetch request time and check expiration
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({ error: "Failed to process request." });
  }
});

app.post("/api/confirm-connect", async (req, res) => {
  const { messageId, orderId } = req.body; // Correctly extracting order_id from the request body

  try {
    const resultT = await pool.query(
      "SELECT request_time FROM connect WHERE order_id = $1",
      [orderId]
    );
    if (resultT.rows.length === 0) {
      return res.status(400).json({ message: "Invalid connect request." });
    }

    const requestTime = new Date(resultT.rows[0].request_time);
    const currentTime = new Date();
    const elapsedTime = (currentTime - requestTime) / 60000; // Convert to minutes

    if (elapsedTime > 10) {
      await pool.query("DELETE FROM connect WHERE order_id = $1", [orderId]);
      return res.status(400).json({ message: "Connect request has expired." });
    }

    const result = await pool.query(
      `UPDATE connect SET status = 'accepted',  request_time = $2  WHERE order_id = $1 RETURNING *`,
      [orderId, currentTime]
    );
    const updatedMessage = await pool.query(
      `UPDATE messages SET message = 'connect accepted',  timestamp = $2  WHERE id = $1 RETURNING sender_phone, user_id, sender_id`,
      [messageId, currentTime]
    );
    const senderPhone = updatedMessage.rows[0].sender_phone;
    const userId = updatedMessage.rows[0].user_id;
    const senderId = updatedMessage.rows[0].sender_id;

    const result2 = await pool.query(
      `SELECT phone, email FROM people WHERE id = $1`,
      [senderId]
    );

    const result3 = await pool.query(
      `SELECT phone, email  FROM people WHERE id = $1`,
      [userId]
    );

    const result4 = await pool.query(
      `SELECT contact FROM agents WHERE user_id = $1`,
      [userId]
    );

    const email = result2.rows[0].email;
    const email2 = result3.rows[0].email;

    const agentPhone = result3.rows[0].phone;
    const agentWhatsapp = result4.rows[0].contact;

    const subject = "Connect Accepted";
    const text = `Your Connect has been accepted`;
    const html = `
    
    <h1 style="color: #15b58e ; margin-left: 20% " >Accepted &#x1F389; </h1>
                     <p> Dear Esteemed User,</p>
                     <br> </br><p> Your recent connect made has been accepted by our agent !!&#x1F389;
                      We are glad to rendering services to you.&#x1F680; The agent would have 30 minutes to deliver your request or  would give valid proof to show that they are delivering your request
                       <p/> <br> </br>
                        <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${agentWhatsapp}">Chat With Agent</a>
                         <p> Or call them on this number <strong>${agentPhone} </strong> </p>
                  


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> We care so much about our students safety and welfare </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Please keep proper evidence about your transaction with the agent such as whatsapp chats or recorded calls to help you report the agent if they are fraudulent.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> You can also rate the agent or leave a review on the agents profile after the transaction to help other students know about the agents credibility and efficiency</li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> Do not abuse or use violent languages on our agents as reports copuld lead to termination of your account</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;">All reviews are investigated, therefore do not leave dishonest reviews. Your review should be based on the current order you made and not for past orders or any personal reasons with the agent</li>
                         <li> We also use sophisticated algorithms to store our agents identity 
                         and other sensitive details to protect our students therefore quickly report any fraudulent agent to stop them from harming other students. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
                     
            `;

    // Define email options
    const mailOptions = {
      from: "Zikconnect admin@zikconnect.com", // Sender address
      // to: email,
      // Recipient's email address
      to: email,
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    };

    const subject2 = "Connect Accepted";
    const text2 = `Your Connect has been accepted`;
    const html2 = `<h1 style="color: #15b58e ; margin-left: 20% " >Accepted &#x1F389; </h1>
                     <p> Dear Esteemed Agent,</p>
                     <br> </br><p> Your accepted the connect!!
                      We hope you serve our students with your best performance..&#x1F680; You have 30 minutes to deliver this order or give valid proof to the user to show that you are delivering your request
                       <p/> <br> </br>
                        <a style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;" href="https://wa.me/234${senderPhone}">Chat With User</a>
                        <p> Or call them on this number <strong>${senderPhone} </strong> </p>
                  


                      <h2 style = "font-family: Times New Roman ;  margin-left: 20% ; color: #15b58e"> Please Note !! </h2>
                      <ul>   <li style = "font-size: 10px; font-family: Times New Roman"> You have a very sensitive profile. Keep it clean!!. </li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Your clients can rate, review and report you, 
                      and this would be visible for other clients to see on your profile.</li>
                      <li style = "font-size: 10px; font-family: Times New Roman"> Therefore you must treat every order with optimum efficiency 
                      to keep a positive profile and give you a competing advantage against other agents </li>
                       <li style = "font-size: 10px; font-family: Times New Roman"> When an order comes in, You have 10 minutes to accept or reject the order or it would be automatically
                        be rejected after the time elapses. rejecting orders will reduce your completion rate
                        which would give clients an inpression that you are unresponsive therefore stopping them from clicking your ad</li>
                        <li style = "font-size: 10px; font-family: Times New Roman; color: red;"> A single report on your account with valid proof of
                         fraudulent engagement will lead to permernent termination of your account/agent profile.  </li>
                         <li> We also use sophisticated algorithms to store our agents identity, exact location and other sensitive details to protect our students therefore we can go further to involve security agencies if the scammed victim requests. </li>
                         
</ul>

<br></br>

 <strong> <p > Greedy people miss out on a long term fortune for a short term  rotten peanut </p> </strong>
                     
                     
            `;

    // Define email options
    const mailOptions2 = {
      from: "Zikconnect admin@zikconnect.com", // Sender address
      // to: email,
      // Recipient's email address
      to: email2,
      subject: subject2, // Subject line
      text: text2, // Plain text body
      html: html2, // HTML body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    const info2 = await transporter.sendMail(mailOptions2);

    if (result.rowCount > 0) {
      // console.log("connected");
      res.status(200).send("Order status updated to connected");
    } else {
      res.status(404).send("Order not found");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/complete-connect", async (req, res) => {
  const { orderCode } = req.body;

  // console.log("Order has connected:", orderCode);

  try {
    // Update the status of the connect
    await pool.query(
      `UPDATE connect SET status = 'connected' WHERE order_id = $1`,
      [orderCode]
    );

    // Get agent_id from the connect table
    const result = await pool.query(
      `SELECT agent_id FROM connect WHERE order_id = $1`, // Fixed table name
      [orderCode]
    );

    const agentId = result.rows[0]?.agent_id; // Accessing agent_id correctly

    if (!agentId) {
      return res.status(404).json({ error: "Agent not found." });
    }

    // Get user_id from the agents table
    const result2 = await pool.query(
      `SELECT user_id FROM agents WHERE agent_id = $1`,
      [agentId]
    );

    const agentUserId = result2.rows[0]?.user_id; // Accessing user_id correctly

    if (!agentUserId) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update Completed Orders count
    await pool.query(
      `
      UPDATE people
      SET settings = jsonb_set(
          settings,
          '{Completed Orders}', 
          to_jsonb((settings ->> 'Completed Orders')::int + 1), 
          true 
      )
      WHERE id = $1`,
      [agentUserId] // Correctly passing the userId
    );

    // Update average completed orders
    await pool.query(
      `
  UPDATE people
  SET settings = jsonb_set(
    settings,
    '{average_completed_orders}',
    to_jsonb(
      CASE 
        WHEN COALESCE((settings ->> 'Totl Connect Received')::int, 0) = 0 THEN 0
        ELSE COALESCE((settings ->> 'Completed Orders')::int, 0) * 100 / COALESCE((settings ->> 'Totl Connect Received')::int, 1)
      END
    ),
    true
  )
  WHERE id = $1`, // Ensure the WHERE clause is used
      [agentUserId]
    );

    res.status(200).json({ message: "Connect completed successfully." });
  } catch (error) {
    console.error("Error completing connect:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/api/delete-connect", async (req, res) => {
  const { messageId } = req.body;

  try {
    await pool.query(`DELETE FROM messages WHERE id = $1`, [messageId]);
  } catch (error) {}
});

app.post("/api/complete-connect", async (req, res) => {
  const { orderCode } = req.body;

  // console.log("Order has connected:", orderCode);

  try {
    // Update the status of the connect
    await pool.query(
      `UPDATE connect SET status = 'incomplete' WHERE order_id = $1`,
      [orderCode]
    );

    // Get agent_id from the connect table
    const result = await pool.query(
      `SELECT agent_id FROM connect WHERE order_id = $1`, // Fixed table name
      [orderCode]
    );

    const agentId = result.rows[0]?.agent_id; // Accessing agent_id correctly

    // Get user_id from the agents table
    const result2 = await pool.query(
      `SELECT user_id FROM agents WHERE agent_id = $1`,
      [agentId]
    );

    const agentUserId = result2.rows[0]?.user_id; // Accessing user_id correctly

    if (!agentUserId) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update average completed orders
    await pool.query(
      `
  UPDATE people
  SET settings = jsonb_set(
    settings,
    '{average_completed_orders}',
    to_jsonb(
      CASE 
        WHEN COALESCE((settings ->> 'Totl Connect Received')::int, 0) = 0 THEN 0
        ELSE COALESCE((settings ->> 'Completed Orders')::int, 0) * 100 / COALESCE((settings ->> 'Totl Connect Received')::int, 1)
      END
    ),
    true
  )
  WHERE id = $1`, // Ensure the WHERE clause is used
      [agentUserId]
    );

    res.status(200).json({ message: "Connect completed successfully." });
  } catch (error) {
    console.error("Error completing connect:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/reject-connect", async (req, res) => {
  const { orderId } = req.body; // Correctly extracting order_id from the request body

  try {
    const result = await pool.query(
      `UPDATE connect SET status = 'closed' WHERE order_id = $1 RETURNING *`,
      [orderId]
    );

    if (result.rowCount > 0) {
      // console.log("closed");
      res.status(200).send("Order status updated to closed");
    } else {
      res.status(404).send("Order not found");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/connect-buysell", async (req, res) => {
  const { itemId } = req.query;

  try {
    // Query the database for the item status
    const result = await pool.query(
      "SELECT status FROM buysell WHERE id = $1",
      [itemId]
    );

    const response = result.rows;

    if (response.length === 0) {
      console.warn(`No data found for itemId: ${itemId}`);
      return res.status(404).json({ message: "Item not found" });
    }

    // Extract and send only the status value
    const status = result.rows[0].status;
    res.json({ status });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to check if the phone number has been used
app.get("/api/get-used-number", async (req, res) => {
  const phoneN = req.query.phoneUsed;
  const phone = `+234${phoneN}`;

  try {
    const result = await pool.query(
      `SELECT phone FROM people WHERE phone = $1`,
      [phone]
    );

    const response = result.rows;

    if (response.length > 0) {
      // If the phone number is found, send it back in the response
      res.json(response);
    } else {
      // If the phone number is not found, send an empty array
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching phone number:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/send-verification-email", async (req, res) => {
  const emailbread = req.body.emailbread;
  const userId = req.body.user;

  const result = await pool.query(
    `SELECT email_status FROM people WHERE id = $1`,
    [userId]
  );
  const response = result.rows[0];
  if (response.email_status === "verified") {
    return res.status(400).json({ message: "Email has already been verified" });
  }

  // Ensure email is provided
  if (!emailbread) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a 6-digit verification code
  const verificationCode = generateVerificationCode();

  try {
    const subject = "Verify Email";
    const text = `Welcome to Zikconnect`;
    const html = `<h1 style="color: #15b58e ; margin-left: 20% " >ZIKCONNECT</h1>
                      <strong><p style = "font-family: Times New Roman ; ">Welcome!!, </strong> <br /> 
                      <strong> <p style = "font-family: Times New Roman ;" >We love your tremendous efforts to be on board keep going !!. Below is the code to Verify your email address. this is the final step to successfully creating your account
                      Please do not share this code with anyone. </p> <strong>

                      <br> </br>
                      <br></br>

                     <div style="border: 0.5px solid black; display:flex; align-items: center; margin-bottom: 10px; justify-content: center; padding-left: 7rem; padding-top: 2rem; width: 70%; height: 4rem; font-family: Arial, sans-serif;">
  <span style="color: #15b58e ; font-size: 40px; font-weight: bold;">
   ${verificationCode}
  </span>

</div>
<p> This code would expire in 30 minutes. Ensure to use it time or you can request for another code from the site </p>
                      
                      
                      </strong>
                      
                      </p>`;

    const mailOptions = {
      from: "admin@zikconnect.com", // Sender address
      // to: email,
      // Recipient's email address
      to: emailbread,
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    };

    const info = await transporter.sendMail(mailOptions);

    // Store the verification code in the database
    await pool.query(
      `INSERT INTO email_verification (user_id, email, code, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (email) 
       DO UPDATE SET code = EXCLUDED.code, status = 'pending', updated_at = CURRENT_TIMESTAMP`,
      [userId, emailbread, verificationCode]
    );

    // Respond with success message
    res.status(200).json({
      message: "Verification code sent successfully",
      // Optional, you might not want to return this to the client
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "An error occurred while sending the verification code",
    });
  }
});

app.post("/api/verify-email", async (req, res) => {
  const { emailbread, code, user } = req.body;

  try {
    // Check if the code is correct
    const result = await pool.query(
      "SELECT * FROM email_verification WHERE email = $1 AND code = $2 AND status = 'pending'",
      [emailbread, code]
    );

    if (result.rows.length > 0) {
      // Update the status to 'verified'
      await pool.query(
        "UPDATE email_verification SET status = 'verified' WHERE email = $1",
        [emailbread]
      );
      await pool.query(
        "UPDATE people SET email_status = 'verified' WHERE id = $1",
        [user]
      );
      const subject = "Email Verified";
      const text = `Welcome to Zikconnect`;
      const html = `<h1 style="color: #15b58e ; margin-left: 20% " >ZIKCONNECT</h1>
                      <strong><p style = "font-family: Times New Roman ; ">Congrats!!, <br /> 
                      You have successfully verified your email!!. Your account has been funded with a sum of  2000 Naira to aid you in navigating through our services.
                       You can now head on to your profile and start connecting with others.
                       You can also earn  on zikconnect in two ways!!  <ul><li>300 naira for each agent you register which is withdrawable directly to your bank account</li> <li>by becoming one of our agents on the site or uploading items for buyers to purchase</li></ul> 
                      Congrats!! Once again on your journey and feel free to reach out to our agents at <strong> admin@zikconnect.com  </strong>if you have further questions</strong>
                      
                      Please do well to note that we take our student security and safety seriously. Any attempt to violate or harm our users on the app
                      could lead to immediate termination of your account and further actions could be taken such as involving law enforcement agents.
                      depending on the gravity of violation on our student right and safety. We hope to see you win legally!!
                        you can reach out to us on <strong>admin@zikconnect.com</strong>if you have further questions</strong>
                      
                      </p>`;

      const mailOptions = {
        from: "admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: emailbread,
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html, // HTML body
      };

      const info = await transporter.sendMail(mailOptions);

      await pool.query(
        `DELETE FROM email_verification WHERE status = 'verified'`
      );

      res.status(200).json({ message: "email verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid or expired verification code" });
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify phone number" });
  }
});

const apiKey = process.env.TERMII_TOKEN;
const senderID = "N-Alert";

async function sendVerificationCode(phoneNumber, code) {
  try {
    const response = await axios.post(
      "https://v3.api.termii.com/api/sms/send",
      {
        to: phoneNumber,
        from: senderID,
        sms: `Hi User Your zikconnect verification pin is ${code}`,
        type: "plain",
        channel: "dnd",
        api_key: apiKey,
      }
    );

    if (response.data && response.data.message_id) {
    } else {
    }
  } catch (error) {
    console.error("Error sending verification code:", error.message);
  }
}

app.post("/api/send-verification-code", async (req, res) => {
  const phone = req.body.phone;

  const userId = req.body.user;
  const phoneNumber = `+234${phone}`;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // Generate a 6-digit verification code
  const verificationCode = generateVerificationCode();

  // SEND SMS

  try {
    // Usage
    const smsResponse = await sendVerificationCode(
      phoneNumber,
      verificationCode
    );

    if (verificationCode) {
      // Successfully sent the SMS, return a success message
      // console.log("SMS sent successfully:", response.data);
      await pool.query(
        `INSERT INTO verification_codes (user_id, phone_number, verification_code, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (phone_number) 
       DO UPDATE SET verification_code = EXCLUDED.verification_code, status = 'pending', updated_at = CURRENT_TIMESTAMP`,
        [userId, phoneNumber, verificationCode]
      );

      res.status(200).json({
        message: "Verification code sent successfully",
        code: verificationCode,
      });
    } else {
      // Failed to send the SMS
      // console.log("Failed to send SMS:", response.data);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({
      message: "An error occurred while sending the verification code",
    });
  }
});

app.post("/api/verify-phone", async (req, res) => {
  const { phoneN, code, user } = req.body;

  const phone = `+234${phoneN}`;

  try {
    // Check if the code is correct
    const result = await pool.query(
      "SELECT * FROM verification_codes WHERE phone_number = $1 AND verification_code = $2 AND status = 'pending'",
      [phone, code]
    );

    if (result.rows.length > 0) {
      // Update the status to 'verified'
      await pool.query(
        "UPDATE verification_codes SET status = 'verified' WHERE phone_number = $1",
        [phone]
      );

      await pool.query("UPDATE people SET phone = $1 WHERE id = $2", [
        phone,
        user,
      ]);

      await pool.query(
        `DELETE FROM verification_codes WHERE status = 'verified'`
      );

      const result2 = await pool.query(
        `SELECT settings ->> 'Referred By' AS referral_code FROM people WHERE id = $1`,
        [user]
      );

      const referral = result2.rows[0]?.referral_code;

      const result3 = await pool.query(
        `
  UPDATE people
  SET 
    settings = jsonb_set(
      settings,
      '{account_balance}', 
      to_jsonb(
        (COALESCE((settings ->> 'account_balance')::int, 0) + 500)::text
      ),
      true
    ),
    account_balance = account_balance + 500
  WHERE settings->>'Referral Code' = $1
  RETURNING email;
  `,
        [referral]
      );

      // Extract the email from the result
      if (result3.rows.length === 0) {
      } else {
        const email = result3.rows[0].email;

        const subject = "Referral Bonus";
        const text = `Welcome to Zikconnect`;
        const html = `<h1 style="color: #15b58e ; margin-left: 20% " >Congrats &#x1F389;  &#x1F389;</h1>
                      <strong><p style = "font-family: Times New Roman ;">Dear User, Your account has been credited with 500 naira as the user you registered has verified their phone number. 
                      Please head on to your dashboard to view the bonus. Thank you for trusting us  </strong>if you have further questions please contact us on admin@zikconnect.com</strong>
                      </strong>
                      </p>`;

        const mailOptions = {
          from: "admin@zikconnect.com", // Sender address
          // to: email,
          // Recipient's email address
          to: email,
          subject: subject, // Subject line
          text: text, // Plain text body
          html: html, // HTML body
        };

        // Send email
        await transporter.sendMail(mailOptions);
      }

      // Logs the updated email value

      res.status(200).json({ message: "Phone number verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid or expired verification code" });
    }
  } catch (error) {
    console.error("Error verifying phone number:", error);
    res.status(500).json({ error: "Failed to verify phone number" });
  }
});

app.get("api/profile-header", async (req, res) => {
  const { userbread } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM people WHERE user_id = $1 ORDER BY timestamp DESC",
      [userbread]
    );

    const response = result.rows;

    res.json({ profile: response });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/messages", async (req, res) => {
  const { userbread, reset } = req.query;

  try {
    // If reset is "true", update the status of messages
    if (reset === "true") {
      await pool.query(
        `UPDATE messages SET status = 'read' WHERE user_id = $1`,
        [userbread]
      );
    }

    // Query to get all messages for the user
    const result = await pool.query(
      "SELECT * FROM messages WHERE user_id = $1 OR sender_id = $1 ORDER BY timestamp DESC",
      [userbread]
    );

    // Get unread messages count for the user
    const status = "unread";
    const result2 = await pool.query(
      `SELECT COUNT(*) AS unread_count FROM messages WHERE user_id = $1 AND status = $2`,
      [userbread, status]
    );

    const agentPhone = await pool.query("SELECT ");

    const response = result.rows; // All messages for the user
    const unreadCount = parseInt(result2.rows[0].unread_count, 10); // Unread messages count

    // If there are messages, return them along with unread count
    res.json({ messages: response, unreadCount: unreadCount });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/withdraw-funds", async (req, res) => {
  const {
    bankName,
    accountName,
    accountNumber,
    amount,
    email,
    user,
    fullName,
    call,
    whatsapp,
  } = req.body;

  try {
    // Fetch withdrawable cash from the settings
    const result1 = await pool.query(
      "SELECT settings ->> 'Withdrawable Cash' AS withdrawable_cash FROM people WHERE id = $1",
      [user]
    );

    const response = parseInt(result1.rows[0]?.withdrawable_cash, 10);

    // Check if the response is valid and has enough cash to withdraw
    if (response > 900 && response >= amount) {
      const result2 = await pool.query(
        `
      INSERT INTO withdrawals (
        bank_name,
        account_name,
        account_number,
        amount,
        email,
        user_id,
        full_name,
        call,
        whatsapp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
      `,
        [
          bankName,
          accountName,
          accountNumber,
          amount,
          email,
          user,
          fullName,
          call,
          whatsapp,
        ]
      );
      const newAmount = response - amount;

      // Update the 'Withdrawable Cash' in the settings
      const result = await pool.query(
        `
  UPDATE people
  SET settings = jsonb_set(
    settings,
    '{Withdrawable Cash}',
    to_jsonb($1::numeric),
    true
  )
  WHERE id = $2
  RETURNING email;
  `,
        [newAmount, user]
      );

      const email2 = result.rows[0].email;

      console.log(email2);

      const subject = "Withdrawal Pending";
      const text = `Pending Withdrawal`;
      const html = `<h1 style="color: #15b58e ; margin-left: 20% " >Congrats &#x1F389;  &#x1F389;</h1>
                      <strong><p style = "font-family: Times New Roman ;"> Dear User, You have successfully sent a withdrawal request for from your account our finance team 
                      would process the withdrawal and your provided account would be credited within 24-72 hours. Please stay updated as an email would be sent to you upon approval <br /> 
                     

                      <h2> PLEASE NOTE !! <h2>
                      <ul style="color: blue ; font: 30px ">
                       <br>
                      <li> All our agents are well monitored and  scrutinized, any attempt to register a false agent would lead to immediate ban on  your account as well as that of the agent and your device ip, your full name, phone number, email and other sensitive details would be blacklisted from opening subsiquent accounts  </li>
                       <br>
                      <li> By registering an agent with your referral code it means you can stand in for them in case they scam any student and are untracable by law enforcement. </li>
                        <br>
                      <li>You must only recieve payment with the same name you used in registering your account. placing withdrawal with a false name would lead to immediate loss of funds </li>
                         <br>
                      <li>The agent must offer the exact service they claim to offer on the site as any report from students who place orders will be acted upon </li>
                         <br>
                      <li>Withdrawing below the minimum amount for withdrawal would lead to loss of funds </li>
                         <br>
                      <li>Our withdrawal process takes within 24-72 hours depending on the time for processing by our finance team  </li>
                        <br>
                      <li>To view your withdrawable cash or to withdraw, please head to your dashboard and click on profiles below the left side bar then click on the dollar icon next to withdrawable cash and include your details for processing </li>
                      </ul>
                       </strong>if you have further questions reach out to us at admin@zikconnect.com</strong>
                      </strong>
                      </p>`;

      const mailOptions = {
        from: "Zikconnect admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: email,
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html, // HTML body
      };
      await transporter.sendMail(mailOptions);

      const subject2 = "Withdrawal Pending";
      const text2 = `Pending Withdrawal`;
      const html2 = `<h1 style="color: #15b58e ; margin-left: 20% " >Dear Admin </h1>
                      <strong><p style = "font-family: Times New Roman ;"> A user has requested a withdrawal with the details below. Please approve and process thier request on time  <br /> 
                     

                      <h2> Details <h2>
                      <ul style="color: blue ; font: 15px ">
                       <li>  BANK NAME  ${bankName} </li>
                        <li>ACCOUNT NAME :  ${accountName}</li>
                         <li> ACCOUNT NUMBER:   ${accountNumber}</li>
                          <li> AMOUNT:  ${amount}</li>
                           <li>EMAIL:  ${email}</li>
                            <li> USER ID : ${user}</li>
                            <li>  FULL NAME : ${fullName} </li>
                             <li> CALL:  ${call}</li>
                              <li> <a href="https://whatsapp.com/${whatsapp}"> Whatsapp</a> </li>

                                           </ul>
                       </strong>if you have further questions reach out to us at admin@zikconnect.com</strong>
                      </strong>
                      </p>`;

      const mailOptions2 = {
        from: "Zikconnect admin@zikconnect.com", // Sender address
        // to: email,
        // Recipient's email address
        to: "zikconnectinfo@gmail.com",
        subject: subject2, // Subject line
        text: text2, // Plain text body
        html: html2, // HTML body
      };

      // Send email

      await transporter.sendMail(mailOptions2);

      res.status(200).send({
        message: "Withdrawal successful",
        email: result.rows[0].email,
      });
    } else {
      res.status(400).send({ message: "Insufficient funds for withdrawal" });
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.get("/api/agentprofile", async (req, res) => {
  const { userId, type } = req.query;

  try {
    const result = await pool.query(
      `SELECT * from ${type} WHERE fk_user_id = $1 `,
      [userId]
    );

    const response = result.rows;

    if (response.length > 0) {
      res.json(response);
    } else {
      res
        .status(404)
        .json({ message: "No agents found for the given user ID and type." });
    }
  } catch (error) {
    console.log(error);
    console.error("Error fetching agent profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/*", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../client/react-dashboard/build", "index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
