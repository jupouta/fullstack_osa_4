var countBy = require('lodash/countby');
var findLast = require('lodash/findLast')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    var likes = 0
    blogs.forEach(function(item) {
        likes += item.likes
    });
    return likes
}

const favoriteBlog = (blogs) => {
    var blogIndex = 0
    var likesMax = 0

    if (blogs.length === 0) {
        return {}
    }

    blogs.forEach(function(item, index) {
        if (likesMax < item.likes) {
            likesMax = item.likes
            blogIndex = index
        }
    })
    return blogs[blogIndex]
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return {}
    }

    const writers = blogs.map(blog => blog.author)

    const result = countBy(writers)
    const found = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b)
    
    const writer = {
        "author": found,
        "blogs": result[found]
    }
    
    return writer
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return {}
    }

    const likes = blogs.map(blog => blog.likes)

    const result = countBy(likes)
    const found = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b)

    const writer = {
        "author": found,
        "likes": result[found]
    }

    return writer
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}