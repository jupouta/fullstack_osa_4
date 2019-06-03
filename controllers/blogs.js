const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
    .find({})
    .populate('user')
    response.json(blogs.map(blog => blog.toJSON()))
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
  }

    
blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    if (body.title === undefined || body.url === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    //const user = await User.findById(body.userId)
    const token = getTokenFrom(request)
    try {
        
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!token || !decodedToken.id) {
          return response.status(401).json({ error: 'token missing or invalid' })
        }
        
        const users = await User.find({})
        const usersJson = users.map(u => u.toJSON())
        
        const userId = usersJson[0].id
        const user = await User.findById(userId)

        const blog = new Blog({
            title: body.title,
            author: body.author === undefined ? 'Unknown' : body.author,
            url: body.url,
            likes: body.likes === undefined ? 0 : body.likes,
            user: user._id
        })

    
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.json(savedBlog.toJSON())
    } catch (exception) {
        next(exception)
    }   
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } catch (exception) {
      next(exception)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      id: request.body.id
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new : true })
        response.json(updatedBlog.toJSON())
    } catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter