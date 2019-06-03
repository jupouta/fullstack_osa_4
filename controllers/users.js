const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({})
        .populate('blogs', {title: 1, author: 1, url: 1})
    response.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    if (body.username === undefined || body.password === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }
    if (body.username.length < 3 || body.password.length < 3) {
        return response.status(400).json({ error: 'username or password malformatted' })
    }
    const users = await User.find({})
    const usersAtStart = users.map(u => u.toJSON())
    const usernames = usersAtStart.map(user => user.username)
    const filtered = usernames.filter(user => user === body.username)

    if (filtered.length > 0) {
        return response.status(400).json({error: 'username not unique'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter