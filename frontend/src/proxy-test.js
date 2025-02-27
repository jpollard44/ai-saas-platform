// Simple script to test the CORS proxy
import api, { userService, agentService } from './services/api-proxy';

// Test function to make API calls through the proxy
async function testProxy() {
  console.log('Testing CORS proxy...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('Health endpoint response:', healthResponse.data);
    
    // Test agents endpoint
    console.log('Testing agents endpoint...');
    const agentsResponse = await agentService.getAgents();
    console.log('Agents endpoint response:', agentsResponse.data);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error testing proxy:', error);
  }
}

// Export the test function
export default testProxy;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  window.testProxy = testProxy;
  console.log('Proxy test function available as window.testProxy()');
}
