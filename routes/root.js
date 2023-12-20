const express = require("express")
const router = express.Router()
const path = require("path")
const dataController = require('../controllers/dbDataController')
const dir = (pagePath) => path.join(__dirname, '../views', pagePath)
const collectionName = 'users'
const session = require('express-session')
const { log } = require("console")
router.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }))




router.get('/login', (req, res) => {
    res.render('login')
})
  
router.post('/postData', (req, res) => {
    try {
        const postedData = req.body // Extract posted data from request
        // ... handle the received data (validation?, saving to db, return to browser)
        console.log('Received data:', postedData) // Log data to server terminal
        res.send(JSON.stringify(postedData)) // Send response to client

    } catch (e) {
        console.log(e);
    }
  })

router.get('/getData', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const userId = '655757b864fe0564febbfb31'// TODO - something like req.session.userId
    const data = await dataController.readFromDB(collectionName, userId)
    log('Get data', data)
    res.send(data);
})



router.get('^/$', (req, res) => {
    res.render('index')
    
})

router.get('/projects', (req, res) => {
    console.log('Rendering /projects');
    res.render('projects')
})



router.get('/detail', (req, res) => {
    const eventId = req.session.eventId
    res.render('detail', { eventId })
})

router.get('/detail/:eventId', (req, res) => {
    const eventId = req.params.eventId
    req.session.eventId = eventId
    res.redirect(301, '/detail') 
})

router.get('/events', (req, res) => {
    const projectId = req.session.projectId
    res.render('events', { projectId })
})

router.get('/events/:id', (req, res) => {
    const projectId = req.params.id
    req.session.projectId = projectId
    res.redirect(301, '/events') 
})

router.get('(/homepage|/index)(.html|/)?', (req, res) => {
    res.redirect(301, '/')
})

router.get('/projects(.html|/)?', (req, res) => {
    res.redirect(301, '/projects') 
})


/* tests */

router.get('/tests', (req, res) => {
    res.render('tests')
})

module.exports = router