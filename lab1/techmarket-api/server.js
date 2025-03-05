const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http')
const dotenv = require('dotenv')
dotenv.config()
const morgan = require('morgan')
app.use(morgan('dev'))
const port = process.env.PORT || 3000;
const {errorHandler,notFoundHandler} = require('./src/middleware/errorHandling')

const {fetchData, fetchDataById, deleteDataById, createData, updateDataById} = require('./src/routes/productRoutes')

app.use(cors())
app.use(express.json())



fetchData(app)
fetchDataById(app)
deleteDataById(app)
createData(app)
updateDataById(app)


app.use(errorHandler)
app.use(notFoundHandler)


app.get('/home', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})