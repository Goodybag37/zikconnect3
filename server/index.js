import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import fs from "fs";
import compression from "compression";
// import fileUpload from "express-fileupload";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import flash from "connect-flash";
import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { createProxyMiddleware } from "http-proxy-middleware";
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
import http from "http"; // Required to create the server
import { Server } from "socket.io";
import Bull from "bull";
import Redis from "redis";

const app = express();
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "your-secret-key", // Replace with your secret key
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Enable CORS if your frontend is served from a different domain or port
    methods: ["GET", "POST"],
  },
});

let itemStatus = {}; // Store the status of items

const myQueue = new Bull("my-queue", {
  redis: {
    host: "localhost",
    port: 6379,
    password: "good3767589",
  },
});

const redisClient = Redis.createClient({
  host: "localhost",
  port: 6379,
  password: "good3767589", // If applicable
});

myQueue.process(async (job) => {
  console.log("Processing job:", job.data);
  const { itemId } = job.data;

  try {
    await pool.query("UPDATE buysell SET status = $1 WHERE id = $2", [
      "available",
      itemId,
    ]);
    console.log("Status updated to available for item:", itemId);

    // io.emit("statusUpdate", {
    //   itemId,
    //   status: "available",
    // });
  } catch (error) {
    console.error("Error updating status in delayed job:", error);
  }
});

// io.on("connection", (socket) => {
//   console.log("a user connected");

//   // When the connect button is clicked, update the status and notify other clients
//   socket.on("connectItem", (itemId) => {
//     itemStatus[itemId] = "in order";

//     // Broadcast the update to all clients
//     io.emit("statusUpdate", { itemId, status: "in order" });
//   });

//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });

app.use(cors());
app.use(compression());
app.use(
  "/api", // Adjust this path based on your needs
  createProxyMiddleware({
    target: "http://localhost:3001", // Replace with the actual port of your React development server
    changeOrigin: true,
  })
);

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // For SSL
  secure: true,
  auth: {
    user: "goodnessezeanyika024@gmail.com",
    pass: "nhsy kmqx fxth cevf",
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
// const pool = new pg.Pool({
//   user: process.env.DB_USER,
//   host: "localhost",
//   database: "students",
//   password: process.env.DB_PASSWORD,
//   port: 5433,
// });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is needed for SSL connections on Heroku
  },
});
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
      callbackURL: "http://localhost:3000/agents",
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
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to the app with token.
    const token = req.user.token; // Assuming you attach token to the user object
    res.redirect(`http://localhost:3000?token=${token}`);
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

cron.schedule("* * * * * ", async () => {
  try {
    await pool.query(`
        DELETE FROM connect
        WHERE request_time < NOW() - INTERVAL '10 minutes' AND status = 'pending'
      `);
    console.log("Old pending connects deleted successfully");
  } catch (error) {
    console.error("Error deleting old pending connects:", error);
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
         AND (CURRENT_TIMESTAMP - request_time) > INTERVAL '30 minutes'
         RETURNING *`
    );
    if (result.rows.length > 0) {
      console.log("Updated connect statuses to completed:", result.rows);
    }
  } catch (error) {
    console.error("Error updating connect statuses:", error);
  }
});

// cron.schedule('* * * * *', async () => {
//   try {

//     const result = await pool.query(
//       `UPDATE connect
//       SET status = 'closed',
//          request_time = CURRENT_TIMESTAMP
//        WHERE status = 'completed'
//        AND request_time IS NOT NULL
//        AND (CURRENT_TIMESTAMP - request_time) > INTERVAL '5 minutes'
//        RETURNING *`
//     );
//     if (result.rows.length > 0) {
//       console.log('Updated connect statuses to completed:', result.rows);
//     }
//   } catch (error) {
//     console.error('Error updating connect statuses:', error);
//   }
// });

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
  console.log("Serializing user:", user);
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
  res.redirect("/login");
}

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/roommates",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

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

app.get("/logout", async (req, res) => {
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

app.get("/profile", ensureAuthenticated, async (req, res) => {
  const id = req.user.id;
  try {
    const result = await pool.query(
      "SELECT people.id AS people_id, " +
        "roommates.fullname AS roommate_name, " +
        "lodge.name AS lodge_name, lodge.description AS lodge_description, " +
        "buysell.name AS buysell_name, buysell.description AS buysell_description, buysell.id AS buysell_id, " +
        "courseagents.id AS courseagent_id, courseagents.course as courseagents_course, " +
        "cryptoagents.id AS cryptoagent_id, " +
        "cybercafeagents.id AS cybercafeagent_id, " +
        "deliveryagents.id AS deliveryagent_id, " +
        "rideragents.id AS rideragent_id, " +
        "schoolfeeagents.id AS schoolfeeagent_id, " +
        "whatsapptvagents.id AS whatsapptvagent_id " +
        "FROM people " +
        "LEFT JOIN roommates ON people.id = roommates.fk_user_id " +
        "LEFT JOIN lodge ON people.id = lodge.fk_user_id " +
        "LEFT JOIN buysell ON people.id = buysell.fk_user_id " +
        "LEFT JOIN courseagents ON people.id = courseagents.fk_user_id " +
        "LEFT JOIN cryptoagents ON people.id = cryptoagents.fk_user_id " +
        "LEFT JOIN cybercafeagents ON people.id = cybercafeagents.fk_user_id " +
        "LEFT JOIN deliveryagents ON people.id = deliveryagents.fk_user_id " +
        "LEFT JOIN rideragents ON people.id = rideragents.fk_user_id " +
        "LEFT JOIN schoolfeeagents ON people.id = schoolfeeagents.fk_user_id " +
        "LEFT JOIN whatsapptvagents ON people.id = whatsapptvagents.fk_user_id " +
        "WHERE people.id = $1",
      [id]
    );

    const profile = result.rows;
    res.render("profile.ejs", { profile: profile });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/log", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Query to get user info from the database
    const result = await pool.query(
      "SELECT id, email, password, phone, id_card, full_name FROM people WHERE email=$1",
      [email]
    );
    const foundMail = result.rows[0];

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
              full_name: foundMail.full_name, // Send the user ID from the database
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

app.post("/login", cors(), async (req, res, next) => {
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

app.post("/register", cors(), async (req, res) => {
  const { email, password, fullname } = req.body;

  console.log(`Received email: ${email}`); // Debugging line
  console.log(`Received password: ${password}`); // Debugging line

  try {
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

    // Insert the new user into the database
    await pool.query(
      "INSERT INTO people (email, password, full_name) VALUES ($1, $2)",
      [email, hashedPassword, capitalizedFullName]
    );

    // Registration successful
    return res
      .status(201)
      .json({ message: "Registration successful. You can now log in." });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/roommatesapi", cors(), async (req, res) => {
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

app.get("/roommates/:id", async (req, res) => {
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

app.get("/buysellapi", cors(), async (req, res) => {
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

app.get("/buysell/:id", async (req, res) => {
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
    cb(null, "uploads/"); // Directory to save the file
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

app.post("/upload-property", upload.single("file"), async (req, res) => {
  try {
    let { originalname, filename, mimetype } = req.file;
    const { name, description, user, price, located } = req.body;
    // const fkUserId = parseInt(fk_user_id, 10);

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
        "uploads/",
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

    // Insert into buysells
    const insertQuery = `
      INSERT INTO buysell (name, description, fk_user_id, price, location, seller_name, contact, original_name, unique_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    ]);

    res.send("File uploaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

app.put("/edit-upload/:id", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  const { name, description, price, location } = req.body;

  console.log("body of data", req.body);
  const existingData = await pool.query("SELECT * FROM buysell WHERE id = $1", [
    id,
  ]);

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
          "uploads/",
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
      UPDATE  buysell SET name = $1, description =$2, price = $3, location =$4, original_name = $5, unique_name = $6 WHERE id = $7
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
      UPDATE  buysell SET name = $1, description =$2, price = $3, location =$4  WHERE id = $5
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
});

app.post("/delete-upload/:id", async (req, res) => {
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

app.get("/get-status/:userId", async (req, res) => {
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

    console.log("Fetched settings:", settings);

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

app.post("/update-status/:type", async (req, res) => {
  const { status, userId } = req.body;
  const { type } = req.params;
  try {
    // Update the database with the new status
    await pool.query(`UPDATE ${type} SET status = $1 WHERE fk_user_id = $2`, [
      status,
      userId,
    ]);

    const jsonStatus = JSON.stringify(status);
    await pool.query(
      `UPDATE people
      SET settings = jsonb_set(settings, '{toggle_status, buysell}', $1::jsonb, true)
      WHERE id = $2`,
      [jsonStatus, userId]
    );
    res.status(200).send({ message: "Status updated successfully" });
    console.log("status updated to ", status);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).send({ error: "Failed to update status" });
  }
});

app.post("/preference-toggleask", async (req, res) => {
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

app.get("/courseagentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, course, contact, good_rating, bad_rating,  fk_user_id, contact FROM courseagents ORDER BY id DESC"
    );
    const courseagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedCourseagents = courseagents.slice(startIndex, endIndex);
    const totalItems = courseagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      courseagents: paginatedCourseagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/patchratingcourse", async (req, res) => {
  const agentId = req.query.agentId;
  const goodRating = parseInt(req.query.goodRating);
  const badRating = parseInt(req.query.badRating);

  try {
    if (!isNaN(goodRating)) {
      const newGoodRating = goodRating + 1;
      const result = await pool.query(
        "UPDATE courseagents SET good_rating = $1 WHERE id = $2",
        [newGoodRating, agentId]
      );
      console.log(
        `Updated good rating for agent ${agentId} to ${newGoodRating}`
      );
      res.sendStatus(200);
    } else if (!isNaN(badRating)) {
      const newBadRating = badRating + 1;
      const result = await pool.query(
        "UPDATE courseagents SET bad_rating = $1 WHERE id = $2",
        [newBadRating, agentId]
      );
      console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
      res.sendStatus(200);
    } else {
      // Handle the case when neither goodRating nor badRating is provided in the request
      res.status(400).send("Invalid or missing rating values");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Internal Server Error
  }
});
app.get("/cryptoagentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
  cryptoagents.agent_id AS id, 
  UPPER(cryptoagents.name) AS name, 
  cryptoagents.contact, 
  cryptoagents.location, 
  cryptoagents.account_created, 
  cryptoagents.agent_date AS agent_date, 
  people.date AS account_creation_date,
  cryptoagents.fk_user_id,  
  cryptoagents.good_rating, 
  cryptoagents.bad_rating, 
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
        json_build_object('user_id', reviews.user_id, 'text', reviews.text,  'date', reviews.date )
      ELSE 
        NULL 
    END
  ) FILTER (WHERE reviews.type = 'bad') AS bad_reviews
FROM 
  cryptoagents
LEFT JOIN 
  reviews 
ON 
  cryptoagents.agent_id = reviews.agent_id 
  AND reviews.agent_type = 'crypto'

  LEFT JOIN 
                agents 
            ON 
                cryptoagents.agent_id = agents.agent_id  -- Join with the agents table

                LEFT JOIN 
                people 
            ON 
                cryptoagents.fk_user_id = people.id  -- Join people table to get account creation date
          
        
GROUP BY 
  cryptoagents.agent_id,
  cryptoagents.name,
  cryptoagents.contact,
  cryptoagents.location,
  cryptoagents.account_created,
  cryptoagents.agent_date,
  cryptoagents.fk_user_id,
  agents.date,
  people.date,
  cryptoagents.good_rating,
  cryptoagents.bad_rating
ORDER BY 
  cryptoagents.agent_id DESC;


      `);

    const cryptoagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const userId = req.user;

    const paginatedCryptoagents = cryptoagents.slice(startIndex, endIndex);
    const totalItems = cryptoagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      cryptoagents: paginatedCryptoagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/patchratingcrypto", async (req, res) => {
  const agentId = req.query.agentId;
  const goodRating = parseInt(req.query.goodRating);
  const badRating = parseInt(req.query.badRating);

  try {
    if (!isNaN(goodRating)) {
      const newGoodRating = goodRating + 1;
      const result = await pool.query(
        "UPDATE cryptoagents SET good_rating = $1 WHERE id = $2",
        [newGoodRating, agentId]
      );
      console.log(
        `Updated good rating for agent ${agentId} to ${newGoodRating}`
      );
      res.sendStatus(200);
    } else if (!isNaN(badRating)) {
      const newBadRating = badRating + 1;
      const result = await pool.query(
        "UPDATE cryptoagents SET bad_rating = $1 WHERE id = $2",
        [newBadRating, agentId]
      );
      console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
      res.sendStatus(200);
    } else {
      // Handle the case when neither goodRating nor badRating is provided in the request
      res.status(400).send("Invalid or missing rating values");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Internal Server Error
  }
});

app.get("/cybercafeagentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, contact,  fk_user_id, good_rating, bad_rating FROM cybercafeagents ORDER BY id DESC"
    );
    const cybercafeagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedCybercafeagents = cybercafeagents.slice(
      startIndex,
      endIndex
    );
    const totalItems = cybercafeagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      cybercafeagents: paginatedCybercafeagents,
    });
  } catch (error) {
    console.log(error);
  }
});
app.post("/patchratingcyber", async (req, res) => {
  const agentId = req.query.agentId;
  const goodRating = parseInt(req.query.goodRating);
  const badRating = parseInt(req.query.badRating);

  try {
    if (!isNaN(goodRating)) {
      const newGoodRating = goodRating + 1;
      const result = await pool.query(
        "UPDATE cybercafeagents SET good_rating = $1 WHERE id = $2",
        [newGoodRating, agentId]
      );
      console.log(
        `Updated good rating for agent ${agentId} to ${newGoodRating}`
      );
      res.sendStatus(200);
    } else if (!isNaN(badRating)) {
      const newBadRating = badRating + 1;
      const result = await pool.query(
        "UPDATE cybercafeagents SET bad_rating = $1 WHERE id = $2",
        [newBadRating, agentId]
      );
      console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
      res.sendStatus(200);
    } else {
      // Handle the case when neither goodRating nor badRating is provided in the request
      res.status(400).send("Invalid or missing rating values");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Internal Server Error
  }
});
app.get("/deliveryagentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, contact,  fk_user_id, good_rating, bad_rating, contact FROM deliveryagents ORDER BY id DESC"
    );
    const deliveryagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedDeliveryagents = deliveryagents.slice(startIndex, endIndex);
    const totalItems = deliveryagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      deliveryagents: paginatedDeliveryagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/patchratingdelivery", async (req, res) => {
  const agentId = req.query.agentId;
  const goodRating = parseInt(req.query.goodRating);
  const badRating = parseInt(req.query.badRating);

  try {
    if (!isNaN(goodRating)) {
      const newGoodRating = goodRating + 1;
      const result = await pool.query(
        "UPDATE deliveryagents SET good_rating = $1 WHERE id = $2",
        [newGoodRating, agentId]
      );
      console.log(
        `Updated good rating for agent ${agentId} to ${newGoodRating}`
      );
      res.sendStatus(200);
    } else if (!isNaN(badRating)) {
      const newBadRating = badRating + 1;
      const result = await pool.query(
        "UPDATE deliveryagents SET bad_rating = $1 WHERE id = $2",
        [newBadRating, agentId]
      );
      console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
      res.sendStatus(200);
    } else {
      // Handle the case when neither goodRating nor badRating is provided in the request
      res.status(400).send("Invalid or missing rating values");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Internal Server Error
  }
});

app.get("/rideragentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, contact,  fk_user_id, good_rating, bad_rating, contact FROM rideragents ORDER BY id DESC"
    );
    const rideragents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedRideragents = rideragents.slice(startIndex, endIndex);
    const totalItems = rideragents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      rideragents: paginatedRideragents,
    });
  } catch (error) {
    console.log(error);
  }
});
app.post("/patchratingrider", async (req, res) => {
  const agentId = req.query.agentId;
  const goodRating = parseInt(req.query.goodRating);
  const badRating = parseInt(req.query.badRating);

  try {
    if (!isNaN(goodRating)) {
      const newGoodRating = goodRating + 1;
      const result = await pool.query(
        "UPDATE rideragents SET good_rating = $1 WHERE id = $2",
        [newGoodRating, agentId]
      );
      console.log(
        `Updated good rating for agent ${agentId} to ${newGoodRating}`
      );
      res.sendStatus(200);
    } else if (!isNaN(badRating)) {
      const newBadRating = badRating + 1;
      const result = await pool.query(
        "UPDATE rideragents SET bad_rating = $1 WHERE id = $2",
        [newBadRating, agentId]
      );
      console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
      res.sendStatus(200);
    } else {
      // Handle the case when neither goodRating nor badRating is provided in the request
      res.status(400).send("Invalid or missing rating values");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Internal Server Error
  }
});
app.get("/schoolfeeagentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, contact, good_rating, bad_rating,  fk_user_id FROM schoolfeeagents ORDER BY id DESC"
    );
    const schoolfeeagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedSchoolfeeagents = schoolfeeagents.slice(
      startIndex,
      endIndex
    );
    const totalItems = schoolfeeagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      schoolfeeagents: paginatedSchoolfeeagents,
    });
  } catch (error) {
    console.log(error);
  }

  app.post("/patchratingschoolfee", async (req, res) => {
    const agentId = req.query.agentId;
    const goodRating = parseInt(req.query.goodRating);
    const badRating = parseInt(req.query.badRating);

    try {
      if (!isNaN(goodRating)) {
        const newGoodRating = goodRating + 1;
        const result = await pool.query(
          "UPDATE schoolfeeagents SET good_rating = $1 WHERE id = $2",
          [newGoodRating, agentId]
        );
        console.log(
          `Updated good rating for agent ${agentId} to ${newGoodRating}`
        );
        res.sendStatus(200);
      } else if (!isNaN(badRating)) {
        const newBadRating = badRating + 1;
        const result = await pool.query(
          "UPDATE schoolfeeagents SET bad_rating = $1 WHERE id = $2",
          [newBadRating, agentId]
        );
        console.log(
          `Updated bad rating for agent ${agentId} to ${newBadRating}`
        );
        res.sendStatus(200);
      } else {
        // Handle the case when neither goodRating nor badRating is provided in the request
        res.status(400).send("Invalid or missing rating values");
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500); // Internal Server Error
    }
  });
});
app.get("/whatsapptvagentsapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, contact, good_rating, bad_rating,  fk_user_id, contact FROM whatsapptvagents ORDER BY id DESC"
    );
    const whatsapptvagents = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedWhatsapptvagents = whatsapptvagents.slice(
      startIndex,
      endIndex
    );
    const totalItems = whatsapptvagents.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      whatsapptvagents: paginatedWhatsapptvagents,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/submitreview", async (req, res) => {
  try {
    const { type, agentType, userid, agentId, review } = req.body;
    console.log("Received data:", { type, agentType, userid, agentId, review });

    const checkResult = await pool.query(
      "SELECT type, agent_type, user_id, agent_id, text FROM reviews WHERE user_id=$1 AND agent_id = $2",
      [userid, agentId]
    );
    console.log("Check result rows length:", checkResult.rows.length);
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

app.post("/patchratingwhatsapptv", async (req, res) => {
  const agentId = req.query.agentId;
  const goodRating = parseInt(req.query.goodRating);
  const badRating = parseInt(req.query.badRating);

  try {
    if (!isNaN(goodRating)) {
      const newGoodRating = goodRating + 1;
      const result = await pool.query(
        "UPDATE whatsapptvagents SET good_rating = $1 WHERE id = $2",
        [newGoodRating, agentId]
      );
      console.log(
        `Updated good rating for agent ${agentId} to ${newGoodRating}`
      );
      res.sendStatus(200);
    } else if (!isNaN(badRating)) {
      const newBadRating = badRating + 1;
      const result = await pool.query(
        "UPDATE whatsapptvagents SET bad_rating = $1 WHERE id = $2",
        [newBadRating, agentId]
      );
      console.log(`Updated bad rating for agent ${agentId} to ${newBadRating}`);
      res.sendStatus(200);
    } else {
      // Handle the case when neither goodRating nor badRating is provided in the request
      res.status(400).send("Invalid or missing rating values");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Internal Server Error
  }
});
app.post("/send-connect-email", async (req, res) => {
  const { agentId, userId, orderId, agentType, agentUserId } = req.body;
  const message = "connect request";

  console.log(userId);
  console.log(agentId);
  console.log(orderId);
  const requestTime = new Date(); // Current time

  try {
    // Query the database to get the agent's email
    await pool.query(
      "INSERT INTO connect (order_id, user_id, agent_id, request_time ) VALUES ($1, $2, $3, $4)",
      [orderId, userId, agentId, requestTime]
    );

    const response = await pool.query(
      `INSERT INTO messages (user_id, message, type, sender_id, order_code)
   VALUES ($1, $2, $3, $4, $5) RETURNING *`, // Return the inserted row
      [agentUserId, message, agentType, userId, orderId]
    );

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

    //  fully updated message
    console.log(updatedMessage);
    io.emit("newMessage", updatedMessage); // Emit the fully updated message

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
    const result = await pool.query(
      "SELECT email FROM agents WHERE agent_id = $1",
      [agentId]
    );

    // Check if any rows were returned
    if (result.rows.length === 0) {
      return res.status(404).send({ error: "Agent not found" });
    }

    // Extract the email from the result
    const email = result.rows[0].email;

    // Prepare email content
    const subject = "New Connect";
    const text = `YOU HAVE A NEW CONNECT FROM USER ${userId}`;
    const html = `<h1>ZIKCONNECT</h1>
                      <p>Dear Agent, you have a new connect with the orderID ${orderId} from a customer with user ID ${userId}. 
                      Please attend to them politely and offer sincere services as all connects are properly monitored.
                      <p>
            <a href=" https://29aa-129-205-124-200.ngrok-free.app/respond-to-connect?order_id=${orderId}&user_id=${userId}&agent_id=${agentId}&status=accepted" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Accept</a>
<a href=" https://29aa-129-205-124-200.ngrok-free.app/respond-to-connect?order_id=${orderId}&user_id=${userId}&agent_id=${agentId}&status=rejected" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 5px;">Reject</a>
</p>
                      </p>`;

    // Define email options
    const mailOptions = {
      from: "goodnessezeanyika024@gmail.com", // Sender address
      to: email, // Recipient's email address
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    res
      .status(200)
      .send({ message: "Email sent successfully!", updatedMessage });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).send({ error: "Failed to send email." });
  }
});

// Backend endpoint to handle agent's response
app.post("/respond-to-connect", async (req, res) => {
  const { order_id, user_id, agent_id, status } = req.query;

  // Debug logs
  console.log(order_id, user_id, agent_id, status);

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

    res.status(200).json({ message: "Response recorded." });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({ error: "Failed to process request." });
  }
});

app.get("/check-pending-connects", async (req, res) => {
  const { userId } = req.query;

  console.log(userId);
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch reviews from the database
    const result = await pool.query(
      `SELECT * FROM connect WHERE user_id = $1 AND (status = $2 OR status = $3 OR status = $4) ORDER BY request_time DESC LIMIT 1`,
      [userId, "pending", "accepted", "completed"]
    );

    // Send the reviews as the response
    res.json(result.rows[0]);
    console.log(result.rows[0]);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/respond-to-connect", async (req, res) => {
  const { order_id, user_id, agent_id, status } = req.query;

  // Debug logs
  console.log(order_id, user_id, agent_id, status);

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

    res.status(200).json({ message: "Response recorded." });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({ error: "Failed to process request." });
  }
});

app.post("/confirm-connect", async (req, res) => {
  const { messageId, orderId } = req.body; // Correctly extracting order_id from the request body
  console.log(orderId);
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
    await pool.query(
      `UPDATE messages SET message = 'connect accepted',  timestamp = $2  WHERE id = $1`,
      [messageId, currentTime]
    );

    if (result.rowCount > 0) {
      console.log("connected");
      res.status(200).send("Order status updated to connected");
    } else {
      res.status(404).send("Order not found");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/complete-connect", async (req, res) => {
  const { orderCode } = req.body;

  console.log("order has connected ", orderCode);

  try {
    await pool.query(
      `UPDATE connect SET status = 'connected' WHERE order_id = $1 `,
      [orderCode]
    );
  } catch (error) {}
});

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route to check if the phone number has been used
app.get("/get-used-number", async (req, res) => {
  const phone = req.query.phoneUsed; // Access the query parameter from the request

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

app.post("/send-verification-code", async (req, res) => {
  const phone = req.body.phone;
  const userId = req.body.user;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // Generate a 6-digit verification code
  const verificationCode = generateVerificationCode();
  console.log(verificationCode);

  try {
    // Send the verification code via SMS using Textbelt
    // const response = await axios.post("https://textbelt.com/text", {
    //   phone: phoneNumber,
    //   message: `Your verification code is: ${verificationCode}`,
    //   key: "textbelt", // Replace with your Textbelt API key
    // });

    if (verificationCode) {
      // Successfully sent the SMS, return a success message
      // console.log("SMS sent successfully:", response.data);
      await pool.query(
        `INSERT INTO verification_codes (user_id, phone_number, verification_code, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (phone_number) 
       DO UPDATE SET verification_code = EXCLUDED.verification_code, status = 'pending', updated_at = CURRENT_TIMESTAMP`,
        [userId, phone, verificationCode]
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

app.post("/verify-phone", async (req, res) => {
  const { phone, code, user } = req.body;

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

      res.status(200).json({ message: "Phone number verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid or expired verification code" });
    }
  } catch (error) {
    console.error("Error verifying phone number:", error);
    res.status(500).json({ error: "Failed to verify phone number" });
  }
});
app.post("/reject-connect", async (req, res) => {
  const { orderId } = req.body; // Correctly extracting order_id from the request body

  try {
    const result = await pool.query(
      `UPDATE connect SET status = 'closed' WHERE order_id = $1 RETURNING *`,
      [orderId]
    );

    if (result.rowCount > 0) {
      console.log("closed");
      res.status(200).send("Order status updated to closed");
    } else {
      res.status(404).send("Order not found");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/connectbuysell", async (req, res) => {
  const { itemId } = req.body;
  console.log("updating buysell ", itemId);

  try {
    // Update the status in the database
    const result = await pool.query(
      "UPDATE buysell SET status = $1 WHERE id = $2 RETURNING *",
      ["order", itemId]
    );

    if (result.rowCount > 0) {
      const updatedItem = result.rows[0];

      // Add a job to the queue to change the status after 30 minutes
      await myQueue.add({ itemId }, { delay: 3 * 10000 }); // 30 minutes delay

      // Broadcast the status update to all connected clients
      io.emit("statusUpdate", {
        itemId: updatedItem.id,
        status: updatedItem.status,
      });

      res
        .status(200)
        .json({ message: "Status updated successfully", item: updatedItem });
    } else {
      // Item not found
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/messages", async (req, res) => {
  const { userbread } = req.query;
  console.log(userbread);

  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE user_id = $1 ORDER BY timestamp DESC ",
      [userbread]
    );

    const response = result.rows;

    if (response.length > 0) {
      res.json(response);
    } else {
      // If no message  is not found, send an empty array
      res.json([]);
    }
  } catch (error) {}
});

app.get("/agentprofile", async (req, res) => {
  const { userId, type } = req.query;

  console.log("Received userId:", userId);
  console.log("Received type:", type);

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

app.get("/lodgeapi", cors(), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, UPPER(name) AS name, location,  description,  fk_user_id, contact  FROM lodge ORDER BY id DESC"
    );
    const lodges = result.rows;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedLodges = lodges.slice(startIndex, endIndex);
    const totalItems = lodges.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      lodges: paginatedLodges,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
