require('dotenv').config()
const fs = require('fs')
const moment = require('moment')
const git = require('simple-git')
const gitP = require('simple-git/promise')
const fetch = require('node-fetch')
const querystring = require('querystring')

const GIT_SSH_COMMAND = "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
const gitEnv = { ...process.env, GIT_SSH_COMMAND }

const nasa = {
  neoFeed: 'https://api.nasa.gov/neo/rest/v1/feed',
  neoFeedParams: {
    start_date: moment().format('YYYY-MM-DD'),
    end_date: moment().add(1, 'day').format('YYYY-MM-DD'),
    api_key: process.env.NASA_API_KEY
  }
}

gitP().env(gitEnv).pull('origin', 'master')
  .then(status =>
    fetch(`${nasa.neoFeed}?${querystring.stringify(nasa.neoFeedParams)}`))
  .then(res => res.json())
  .then(json => {
    const today = nasa.neoFeedParams.start_date
    const asteroids = json.near_earth_objects[today]
    const data = `**${today}** There are ${asteroids.length} near earth objects!`
    
    fs.appendFileSync('ASTEROIDS.md', data)

    return git()
      .env(gitEnv)
      .add('ASTEROIDS.md')
      .commit('log very important asteroid data')
      .push('origin', 'master')
  })
  .catch(console.log)
