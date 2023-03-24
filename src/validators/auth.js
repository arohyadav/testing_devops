const { check } = require('express-validator')
const db = require('../db')
const { compare } = require('bcryptjs')

// //username
// const username= check('string').isLength({min:4, max:20}).withMessage('Please provide a username.')

//password
const password = check('password')
  .isLength({ min: 8, max: 15 })
  .withMessage('Password has to be between 8 and 15 characters.')

//email
const email = check('email')
  .isEmail()
  .withMessage('Please provide a valid email.')

//check if email exists
const emailExists = check('email').custom(async (value) => {
  const { rows } = await db.query('SELECT * from public.users WHERE email = $1', [
    value,
  ])

  if (rows.length) {
    throw new Error('Email already exists.')
  }
})

//login validation
const loginFieldsCheck = check('email').custom(async (value, { req }) => {
  const user = await db.query('SELECT * from public.users WHERE email = $1', [value])

  if (!user.rows.length) {
    throw new Error('Email does not exists.')
  }

  const validPassword = await compare(req.body.password, user.rows[0].password)

  if (!validPassword) {
    throw new Error('Wrong password')
  }

  req.user = user.rows[0]
})


// Forgot password validation


module.exports = {
  registerValidation: [email, password, emailExists],
  loginValidation: [loginFieldsCheck],
}
