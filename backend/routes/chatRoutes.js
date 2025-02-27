const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock chat controller functions
// In a real app, you would import actual controller functions
const getConversations = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: 'conv1',
        agentId: 'agent1',
        agentName: 'Data Analyst Pro',
        lastMessage: 'How can I help you analyze your data today?',
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'conv2',
        agentId: 'agent2',
        agentName: 'Content Writer',
        lastMessage: 'I can help you draft that blog post.',
        updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ]
  });
};

const getConversation = (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    data: {
      _id: id,
      agentId: 'agent1',
      agentName: 'Data Analyst Pro',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updatedAt: new Date().toISOString()
    }
  });
};

const createConversation = (req, res) => {
  const { agentId } = req.body;
  
  if (agentId) {
    res.status(201).json({
      success: true,
      data: {
        _id: 'new-conv-id',
        agentId: agentId,
        agentName: 'Agent Name',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide an agent ID'
    });
  }
};

const getMessages = (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    data: [
      {
        _id: 'msg1',
        conversationId: id,
        content: 'Hello, how can I help you today?',
        sender: 'agent',
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        _id: 'msg2',
        conversationId: id,
        content: 'I need help analyzing my sales data.',
        sender: 'user',
        createdAt: new Date(Date.now() - 3500000).toISOString() // 58 minutes ago
      },
      {
        _id: 'msg3',
        conversationId: id,
        content: 'Sure, I can help with that. Could you upload your data file?',
        sender: 'agent',
        createdAt: new Date(Date.now() - 3400000).toISOString() // 56 minutes ago
      }
    ]
  });
};

const sendMessage = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (content) {
    // Mock user message
    const userMessage = {
      _id: 'user-msg-id',
      conversationId: id,
      content: content,
      sender: 'user',
      createdAt: new Date().toISOString()
    };
    
    // Mock agent response
    const agentResponse = {
      _id: 'agent-msg-id',
      conversationId: id,
      content: 'This is a mock response from the agent based on your input.',
      sender: 'agent',
      createdAt: new Date(Date.now() + 1000).toISOString() // 1 second later
    };
    
    res.status(201).json({
      success: true,
      data: [userMessage, agentResponse]
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide message content'
    });
  }
};

// Define routes
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversation);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/messages', protect, sendMessage);

module.exports = router;
