// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Get Content Feed
app.get('/api/friends/feed', async (req, res) => {
  const { userId } = req.query;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { friends: true }
  });

  const friendPosts = await prisma.post.findMany({
    where: {
      userId: {
        in: user.friends
      }
    },
    include: { comments: true }
  });

  res.json(friendPosts);
});


// Get Posts in which friends commmented
app.get('/api/nonFriends/feed', async (req, res) => {
    const { userId } = req.query;
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { friends: true }
    });
    
    const nonFriendPosts = await prisma.post.findMany({
      where: {
        AND: [
          { comments: { some: { userId: { in: user.friends } } } },
          { userId: { notIn: user.friends } }
        ]
      },
      include: { comments: true }
    });
  
    res.json(nonFriendPosts);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
