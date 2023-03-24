const db = require('../db')
const { hash } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { SECRET } = require('../constants/index')
var nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = require('../routes/auth');

exports.getUsers = async (req, res) => {
  try {
    const { rows } = await db.query('select user_id, email from public.users')

    return res.status(200).json({
      success: true,
      users: rows,
    })
  } catch (error) {
    console.log(error.message)
  }
}

exports.register = async (req, res) => {
  const {email, password } = req.body
  try {
    const hashedPassword = await hash(password, 10)

    await db.query('insert into public.users(email ,password) values ( $1 , $2 )', [
      email,
      hashedPassword
    ])

    return res.status(201).json({
      success: true,
      message: 'The registration was successfull',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}

exports.login = async (req, res) => {
  let user = req.user

  let payload = {
    id: user.user_id,
    email: user.email,
  }

  try {
    const token = await sign(payload, SECRET)

    return res.status(200).cookie('token', token, { httpOnly: true }).json({
      success: true,
      message: 'Logged in succefully',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}

exports.protected = async (req, res) => {
  try {
    return res.status(200).json({
      info: 'protected info',
    })
  } catch (error) {
    console.log(error.message)
  }
}

exports.logout = async (req, res) => {
  try {
    return res.status(200).clearCookie('token', { httpOnly: true }).json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}

exports.forgotpassword = async (req,res) => {
  try {
    const { email } = req.body;

    // Find the user in the database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $2',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new password and hash it
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await pool.query('UPDATE users SET password')

  } catch(error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}

