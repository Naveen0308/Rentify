const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer'); // Import multer correctly
const path = require('path'); // Import path

const app = express();
const port = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve static files

// MySQL database connection   
const db = mysql.createConnection({
  host: 'bmdp91a3skcplqkfouey-mysql.services.clever-cloud.com',
  user: 'utepbkhejcmcxczo',
  password: '0S2XlyUHTwJtCO3IQGt8',
  database: 'bmdp91a3skcplqkfouey',
  connectTimeout: 30000 
});    
         
// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }  
}); 
  

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    } 
  });
    
  const upload = multer({ storage: storage });   
      
  // API endpoint to add a new food item
  app.post('/api/add-house', upload.single('houseimage'), (req, res) => {
    try {
      const {housename, houseplace, housearea, housebedrooms, housebathrooms, housenearbyplaces} = req.body;
      const houseimage = req.file ? req.file.filename : null;
  
      if (!housename || !houseplace || !housearea || !housebedrooms || !housebathrooms || !housenearbyplaces) {
        return res.status(400).json({ error: 'All fields are required' });
      }  
    
      const sql = 'INSERT INTO Housedetails (housename, place, area, bedrooms, bathrooms, nearbyplaces, houseimage) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const values = [housename, houseplace, housearea, housebedrooms, housebathrooms, housenearbyplaces, houseimage];
    
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }          
        res.status(201).json({ success: true, message: 'House added successfully' });
      });      
    } catch (error) {
      console.error('Error adding house:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });    
  

  app.get('/api/houses', (req, res) => {
    const sql = 'SELECT * FROM Housedetails';
      
    db.query(sql, (err, results) => {  
      if (err) {
        console.error('Error fetching food items:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }  
      res.status(200).json(results);
    });
  });    
  

app.post('/api/signup', async (req, res) => {
    try {
      const { firstname, lastname, email, password,phonenumber} = req.body;
      console.log('Received data:', req.body);
    const sql = 'INSERT INTO users (firstname, lastname, email, password, phonenumber) VALUES (?, ?, ?, ?, ?)';
    const values = [firstname, lastname, email, password, phonenumber];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });

    res.status(201).json({ success: true, message: 'User registered successfully' });
} catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', (req, res) => {
    try {
      const { email, password } = req.body;
  
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.query(sql, [email], (err, results) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else if (results.length === 0) {
          res.status(401).json({ error: 'Enter Valid Email and Password' });
        } else {
          const user = results[0];
          const passwordMatch = password === user.password;
      
          if (!passwordMatch) {
            res.status(401).json({ error: 'Incorrect email or password' });
          } else {
            res.status(200).json({ success: true, email: user.email, userId: user.id, message: 'Login successfully done' });
          }    
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
   