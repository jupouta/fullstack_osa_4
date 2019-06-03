const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const user = new User({ username: 'root', password: 'sekret' , blogs: ["5a422aa71b54a676234d17f8"]})
  await user.save()
})


const initialBlogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    }
]

beforeEach(async () => {
  await User.deleteMany({})
  const user = new User({ username: 'root', password: 'sekret' , blogs: ["5a422aa71b54a676234d17f8"]})
  await user.save()
})

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
  
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})



describe('when there is initially one user at db', () => {
  
    test('creation succeeds with a fresh username', async () => {
        const users = await User.find({})
        const usersAtStart = users.map(u => u.toJSON())
        
        const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salane',
        blogs: [
          "5a422aa71b54a676234d17f8"
        ]
        
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      
        const usersEnd = await User.find({})
        const usersAtEnd = usersEnd.map(u => u.toJSON())
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const users = await User.find({})
        const usersAtStart = users.map(u => u.toJSON())
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('username not unique')
    
        const usersEnd = await User.find({})
        const usersAtEnd = usersEnd.map(u => u.toJSON())
        expect(usersAtEnd.length).toBe(usersAtStart.length)
      })

      test('creation fails with proper statuscode and message if username malformatted', async () => {
        const users = await User.find({})
        const usersAtStart = users.map(u => u.toJSON())
    
        const newUser = {
          username: 'ro',
          name: 'useruser',
          password: '1',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('username or password malformatted')
    
        const usersEnd = await User.find({})
        const usersAtEnd = usersEnd.map(u => u.toJSON())
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
    
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(initialBlogs.length)
})
  
test('the second blog has url of name.com', async () => {
    const response = await api.get('/api/blogs')
    const urls = response.body.map(r => r.url)
    expect(urls).toContain(
        'https://reactpatterns.com/'
      )
})

test('blog _id is transformed to id', async () => {
    const response  = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

test('blog is deleted', async() => {
    const response = await api.get('/api/blogs')
    const blogToDelete = response.body[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')

    expect(blogsAtEnd.body.length).toBe(
        response.body.length - 1
    )

  const titles = blogsAtEnd.body.map(r => r.title)
  expect(titles).not.toContain(blogToDelete.title)
})

test('a blog is added', async () => {
    const newBlog = {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    expect(response.body.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('Type wars')
})

test('a blog without likes gets 0 likes', async () => {
    const newBlog =  {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
      const response = await api.get('/api/blogs')
      const likes = response.body.map(r => r.likes)
  
      expect(response.body.length).toBe(initialBlogs.length + 1)
      expect(likes.length).toBe(initialBlogs.length + 1)
})

test('a blog without a title is not added', async () => {
    const newBlog = {
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/blogs')
  
    expect(response.body.length).toBe(initialBlogs.length)
  })

test('a blog is updated', async () => {
    const update = {
        id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 10
    }

    await api
        .put(`/api/blogs/${update.id}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await api.get('/api/blogs')

    const likes = blogsAtEnd.body.map(r => r.likes)
    expect(likes).toContain(update.likes)
})

afterAll(() => {
    mongoose.connection.close()
})