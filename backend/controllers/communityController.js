const Post = require('../models/postModel');
const Template = require('../models/templateModel');

// @desc    Create a post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title and content'
      });
    }

    const post = await Post.create({
      userId: req.user.id,
      title,
      content,
      category: category || 'Discussion',
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all posts
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    let query = {};

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by keyword if provided
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { content: { $regex: req.query.keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.keyword, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/community/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name')
      .populate('comments.userId', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a post
// @route   PUT /api/community/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Make sure user is the author
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a post
// @route   DELETE /api/community/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Make sure user is the author
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await post.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to post
// @route   POST /api/community/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Please provide comment text'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Add comment
    post.comments.push({
      userId: req.user.id,
      text
    });

    await post.save();

    res.status(201).json({
      success: true,
      data: post.comments[post.comments.length - 1]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Share an agent template
// @route   POST /api/community/templates
// @access  Private
exports.shareTemplate = async (req, res, next) => {
  try {
    const { name, description, agentConfig, category, isPublic } = req.body;

    if (!name || !description || !agentConfig || !agentConfig.modelType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, description, and agent configuration'
      });
    }

    const template = await Template.create({
      userId: req.user.id,
      name,
      description,
      agentConfig,
      category: category || 'Other',
      isPublic: isPublic !== undefined ? isPublic : true
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all templates
// @route   GET /api/community/templates
// @access  Public
exports.getTemplates = async (req, res, next) => {
  try {
    let query = { isPublic: true };

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by keyword if provided
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    const templates = await Template.find(query)
      .sort({ downloads: -1 })
      .populate('userId', 'name');

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single template
// @route   GET /api/community/templates/:id
// @access  Public
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('userId', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if template is private
    if (!template.isPublic && template.userId.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: 'This template is private'
      });
    }

    // Increment download count
    template.downloads += 1;
    await template.save();

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};
