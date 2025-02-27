const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Test the OpenAI connection with a simple prompt
 * @returns {Promise<string>} The response from OpenAI
 */
const testConnection = async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, are you working properly?" }],
      max_tokens: 50
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Connection Error:', error);
    throw new Error('Failed to connect to OpenAI API');
  }
};

/**
 * Create a chat completion using OpenAI
 * @param {string} model - The model to use
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options like temperature, max_tokens, etc.
 * @returns {Promise<Object>} The completion response from OpenAI
 */
const createChatCompletion = async (model, messages, options = {}) => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      ...options
    });
    
    return completion;
  } catch (error) {
    console.error('OpenAI Chat Completion Error:', error);
    throw new Error('Failed to generate chat completion');
  }
};

/**
 * Run an agent with specified instructions
 * @param {Object} agent - The agent object with instructions and parameters
 * @param {string} query - The user query to run against the agent
 * @returns {Promise<Object>} The response from the agent
 */
const runAgent = async (agent, query) => {
  try {
    // Start with system message that includes agent instructions
    const messages = [
      { 
        role: "system", 
        content: agent.instructions || "You are a helpful assistant." 
      },
      { role: "user", content: query }
    ];
    
    // Set options from agent configuration
    const options = {
      temperature: agent.temperature || 0.7,
      max_tokens: agent.maxTokens || 800
    };
    
    const response = await createChatCompletion(agent.modelId, messages, options);
    return {
      response: response.choices[0].message.content,
      usage: response.usage
    };
  } catch (error) {
    console.error('Agent Run Error:', error);
    throw new Error('Failed to run agent: ' + error.message);
  }
};

module.exports = {
  testConnection,
  createChatCompletion,
  runAgent
};
