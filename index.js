
const express = require('express')
const path = require('path')
const fs= require('fs')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')

PORT = 3000
app.use(bodyParser.json())
app.use(cors())


// const users = require('./data/fruits.json')
// const { request } = require('http')

const users_router = require('./router/users.router')
app.use('/users',users_router)

app.use((req,res)=>{
  res.status(404).json({err:'page not found'})
})

app.listen(PORT , ()=> console.log('server start'))