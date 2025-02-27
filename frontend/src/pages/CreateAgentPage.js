import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAgentPage.css';
import { agentService } from '../services/api';
import { toast } from 'react-toastify';

const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most powerful model for complex tasks and reasoning' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective for most tasks' },
  { id: 'claude-2', name: 'Claude 2', description: 'Strong reasoning and comprehension capabilities' },
  { id: 'llama-2', name: 'Llama 2', description: 'Open-source model with good general performance' }
];

const templateOptions = [
  { id: 'customer-support', name: 'Customer Support', description: 'Handles customer inquiries and provides support', category: 'business' },
  { id: 'content-writer', name: 'Content Writer', description: 'Generates blog posts, articles, and marketing copy', category: 'creative' },
  { id: 'research-assistant', name: 'Research Assistant', description: 'Helps with information gathering and summarization', category: 'productivity' },
  { id: 'coding-assistant', name: 'Coding Assistant', description: 'Helps write, debug, and explain code', category: 'development' },
  { id: 'data-analyst', name: 'Data Analyst', description: 'Analyzes data and generates insights', category: 'data' },
  { id: 'blank', name: 'Blank Template', description: 'Start from scratch with no predefined settings', category: 'other' }
];

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelId: '',
    templateId: '',
    instructions: '',
    temperature: 0.7,
    maxTokens: 800,
    enableWebSearch: false,
    enableKnowledgeBase: false,
    enableMemory: true,
    visibility: 'private'
  });
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      templateId: template.id
    });
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setFormData({
      ...formData,
      modelId: model.id
    });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await agentService.createAgent(formData);
      
      setLoading(false);
      toast.success('Agent created successfully!');
      
      // Check if response has the expected structure
      if (response?.data?.data?._id) {
        navigate(`/agents/${response.data.data._id}`);
      } else if (response?.data?._id) {
        navigate(`/agents/${response.data._id}`);
      } else {
        console.error('Unexpected response structure:', response);
        toast.info('Agent created, but could not navigate to details page.');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.error || 'Failed to create agent. Please try again.');
      setLoading(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.templateId !== '';
      case 3:
        return formData.modelId !== '';
      case 4:
        return formData.instructions.trim() !== '';
      default:
        return true;
    }
  };

  return (
    <div className="create-agent-container">
      <div className="create-agent-header">
        <h1>Create New Agent</h1>
        <div className="stepper">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step} 
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Basics'}
                {step === 2 && 'Template'}
                {step === 3 && 'Model'}
                {step === 4 && 'Instructions'}
                {step === 5 && 'Settings'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="create-agent-content">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Basic Information</h2>
              <p className="step-description">
                Give your agent a name and description to help users understand its purpose.
              </p>

              <div className="form-group">
                <label htmlFor="name" className="form-label">Agent Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Customer Support Assistant"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what your agent does and how it can help users..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Visibility</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={handleChange}
                    />
                    <span className="radio-text">
                      <strong>Private</strong> - Only you can access this agent
                    </span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="visibility"
                      value="marketplace"
                      checked={formData.visibility === 'marketplace'}
                      onChange={handleChange}
                    />
                    <span className="radio-text">
                      <strong>Marketplace</strong> - List this agent on the marketplace
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Choose Template */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Choose a Template</h2>
              <p className="step-description">
                Start with a template or build from scratch. Templates include pre-configured settings and instructions.
              </p>

              <div className="templates-grid">
                {templateOptions.map(template => (
                  <div
                    key={template.id}
                    className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="template-header">
                      <h3>{template.name}</h3>
                      <span className="template-category">{template.category}</span>
                    </div>
                    <p>{template.description}</p>
                    {selectedTemplate?.id === template.id && (
                      <div className="selected-indicator">
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Choose Model */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>Select AI Model</h2>
              <p className="step-description">
                Choose the AI model that will power your agent. Different models have different capabilities and costs.
              </p>

              <div className="models-grid">
                {modelOptions.map(model => (
                  <div
                    key={model.id}
                    className={`model-card ${selectedModel?.id === model.id ? 'selected' : ''}`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <h3>{model.name}</h3>
                    <p>{model.description}</p>
                    {selectedModel?.id === model.id && (
                      <div className="selected-indicator">
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Instructions */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Agent Instructions</h2>
              <p className="step-description">
                Provide detailed instructions for your agent. This helps define how the agent should respond and behave.
              </p>

              <div className="form-group">
                <label htmlFor="instructions" className="form-label">Instructions*</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  className="form-control instructions-textarea"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Provide detailed instructions for your agent. For example: You are a customer support agent for a software company. Be helpful, concise, and friendly. Always ask for clarification if the user's question is ambiguous..."
                  rows="10"
                  required
                />
              </div>

              <div className="tips-container">
                <h4>Tips for effective instructions:</h4>
                <ul>
                  <li>Define the agent's role clearly (e.g., "You are a customer support agent for a software company")</li>
                  <li>Specify the tone and style (e.g., professional, friendly, concise)</li>
                  <li>Include any domain-specific knowledge the agent should remember</li>
                  <li>Define how to handle questions outside the agent's scope</li>
                  <li>Provide examples of good responses if possible</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 5: Advanced Settings */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>Advanced Settings</h2>
              <p className="step-description">
                Fine-tune your agent's behavior and capabilities with these advanced settings.
              </p>

              <div className="settings-section">
                <h3>Model Parameters</h3>
                
                <div className="form-group">
                  <label htmlFor="temperature" className="form-label">
                    Temperature: {formData.temperature}
                    <span className="setting-description">Higher values make output more random, lower values make it more deterministic</span>
                  </label>
                  <div className="slider-container">
                    <span>0.1</span>
                    <input
                      type="range"
                      id="temperature"
                      name="temperature"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={formData.temperature}
                      onChange={handleSliderChange}
                      className="slider"
                    />
                    <span>1.0</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="maxTokens" className="form-label">
                    Max Response Length: {formData.maxTokens} tokens
                    <span className="setting-description">Maximum number of tokens in the agent's response</span>
                  </label>
                  <div className="slider-container">
                    <span>200</span>
                    <input
                      type="range"
                      id="maxTokens"
                      name="maxTokens"
                      min="200"
                      max="2000"
                      step="100"
                      value={formData.maxTokens}
                      onChange={handleSliderChange}
                      className="slider"
                    />
                    <span>2000</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Capabilities</h3>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enableWebSearch"
                      checked={formData.enableWebSearch}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">
                      <strong>Web Search</strong> - Allow the agent to search the web for real-time information
                    </span>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enableKnowledgeBase"
                      checked={formData.enableKnowledgeBase}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">
                      <strong>Knowledge Base</strong> - Connect a knowledge base for domain-specific information
                    </span>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enableMemory"
                      checked={formData.enableMemory}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">
                      <strong>Memory</strong> - Allow the agent to remember previous conversations
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={prevStep}
              >
                Back
              </button>
            )}
            
            {currentStep < 5 ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextStep}
                disabled={!validateStep()}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? 'Creating Agent...' : 'Create Agent'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgentPage;
