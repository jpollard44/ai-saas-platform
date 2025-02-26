const express = require('express');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  addComment,
  shareTemplate,
  getTemplates,
  getTemplate
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Post routes
router.route('/posts')
  .get(getPosts)
  .post(protect, createPost);

router.route('/posts/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/posts/:id/comments', protect, addComment);

// Template routes
router.route('/templates')
  .get(getTemplates)
  .post(protect, shareTemplate);

router.get('/templates/:id', getTemplate);

module.exports = router;
