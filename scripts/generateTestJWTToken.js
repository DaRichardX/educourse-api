// Import required packages
require('dotenv').config();  // Load environment variables from .env file
const jwt = require('jsonwebtoken');

// Read the secret key and expiration time from environment variables
const secretKey = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN;

// Function to generate JWT token
function generateToken(payload) {
  // Sign the token with the payload, secret key, and expiration time
  const token = jwt.sign(payload, secretKey, { expiresIn });
  return token;
}

// Example payload
const payload = {
  userId: 123, 
  username: 'exampleUser'
};

// Generate the token
const token = generateToken(payload);

// Output the generated token
console.log("Generated JWT Token: ", token);