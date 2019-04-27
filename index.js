const fs = require('fs')
const moment = require('moment')
const gitP = require('simple-git/promise')
const fetch = require('node-fetch')
const querystring = require('querystring')
require('dotenv').config()

const GIT_SSH_COMMAND = "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

const nasa = {
  neoFeed: 'https://api.nasa.gov/neo/rest/v1/feed',
  neoFeedParams: {
    start_date: moment().format('YYYY-MM-DD'),
    end_date: moment().add(1, 'day').format('YYYY-MM-DD'),
    api_key: process.env.NASA_API_KEY
  }
}

gitP().env({ ...process.env, GIT_SSH_COMMAND })
  .pull('origin', 'master')
  .then(status =>
    fetch(`${nasa.neoFeed}?${querystring.stringify(nasa.neoFeedParams)}`))
  .then(res => res.json())
  .then(json => {
    const today = nasa.neoFeedParams.start_date
    const asteroids = json.near_earth_objects[today]
    const data = `**${today}** There are ${asteroids.length} near earth objects!`
    
    fs.appendFile('ASTEROIDS.md', data, err => {
      if (err) throw err;
    })
  })
  .add('ASTEROIDS.md')
  .commit('log very important asteroid data')
  .push('origin', 'master')
  .catch(err => console.log)
