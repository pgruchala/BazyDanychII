const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http')
const dotenv = require('dotenv')
dotenv.config()
const morgan = require('morgan')
app.use(morgan('dev'))
const port = process.env.PORT || 3000;




app.use(cors())

app.get('/home', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})