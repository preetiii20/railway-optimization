import { useState, useEffect } from 'react';

const AIRecommendationPanel = ({ recommendation, onAccept, onOverride }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    if (recommendation) {
      // Animate confidence meter
      let currentConfidence = 0;
      const targetConfidence = recommendation.confidence || 85;
      const interval = setInterval(() => {
        currentConfidence += 2;
        setConfidence(currentConfidence);
        if (currentConfidence >= targetConfidence) {
          clearInterval(interval);
        }
      }, 50);

      setExplanation(recommendation.explanation || generateExplanation(recommendation));
    }
  }, [recommendation]);

  const generateExplanation = (rec) => {
    if (!rec) return '';
    
    const explanations = [
      "AI analysis suggests this decision minimizes total network delay",
      "Machine learning model predicts optimal throughput with this choice",
      "Historical data indicates 94% success rate for similar scenarios",
      "Constraint satisfaction algorithm found this as the best solution"
    ];
    
    return explanations[Math.floor(Math.random() * explanations.length)];
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
    onAccept();
    setIsProcessing(false);
  };

  const handleOverride = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onOverride();
    setIsProcessing(false);
  };

  if (!recommendation) {
    return (
      <div className="ai-panel standby">
        <div className="ai-header">
          <h3>🤖 AI ASSISTANT</h3>
          <div className="ai-status standby">
            <div className="status-dot"></div>
            STANDBY
          </div>
        </div>
        <div className="ai-content">
          <div className="standby-animation">
            <div className="pulse-ring"></div>
            <div className="ai-brain">🧠</div>
          </div>
          <p className="standby-text">Monitoring network for optimization opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-panel active">
      <div className="ai-header">
        <h3>🤖 AI RECOMMENDATION</h3>
        <div className="ai-status active">
          <div className="status-dot pulsing"></div>
          ANALYZING
        </div>
      </div>

      <div className="ai-content">
        {/* Confidence Meter */}
        <div className="confidence-section">
          <div className="confidence-label">
            <span>CONFIDENCE LEVEL</span>
            <span className="confidence-value">{confidence}%</span>
          </div>
          <div className="confidence-meter">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${confidence}%`,
                backgroundColor: getConfidenceColor(confidence)
              }}
            ></div>
          </div>
        </div>

        {/* Recommendation Details */}
        <div className="recommendation-details">
          <div className="recommendation-title">
            {recommendation.title || "Optimal Decision Identified"}
          </div>
          
          <div className="recommendation-description">
            {recommendation.description || "AI suggests the following action for maximum efficiency"}
          </div>

          <div className="impact-metrics">
            <div className="metric">
              <div className="metric-icon">⏱️</div>
              <div className="metric-info">
                <div className="metric-value">
                  -{recommendation.delayReduction || 5}min
                </div>
                <div className="metric-label">Delay Reduction</div>
              </div>
            </div>
            
            <div className="metric">
              <div className="metric-icon">📈</div>
              <div className="metric-info">
                <div className="metric-value">
                  +{recommendation.efficiencyGain || 12}%
                </div>
                <div className="metric-label">Efficiency Gain</div>
              </div>
            </div>
            
            <div className="metric">
              <div className="metric-icon">🎯</div>
              <div className="metric-info">
                <div className="metric-value">
                  {recommendation.affectedTrains || 3}
                </div>
                <div className="metric-label">Trains Affected</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="ai-explanation">
          <div className="explanation-header">
            <span className="icon">💡</span>
            <span>AI REASONING</span>
          </div>
          <div className="explanation-text">
            {explanation}
          </div>
        </div>

        {/* Alternative Options */}
        {recommendation.alternatives && (
          <div className="alternatives-section">
            <div className="alternatives-header">Alternative Options</div>
            <div className="alternatives-list">
              {recommendation.alternatives.map((alt, index) => (
                <div key={index} className="alternative-item">
                  <div className="alt-name">{alt.name}</div>
                  <div className="alt-impact">
                    Delay: +{alt.delay}min | Efficiency: {alt.efficiency}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="ai-actions">
          <button 
            className={`action-btn accept ${isProcessing ? 'processing' : ''}`}
            onClick={handleAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div>
                PROCESSING...
              </>
            ) : (
              <>
                <span className="btn-icon">✅</span>
                ACCEPT AI DECISION
              </>
            )}
          </button>
          
          <button 
            className={`action-btn override ${isProcessing ? 'processing' : ''}`}
            onClick={handleOverride}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div>
                PROCESSING...
              </>
            ) : (
              <>
                <span className="btn-icon">🎮</span>
                MANUAL OVERRIDE
              </>
            )}
          </button>
        </div>

        {/* Processing Animation */}
        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-animation">
              <div className="neural-network">
                <div className="node"></div>
                <div className="node"></div>
                <div className="node"></div>
                <div className="connection"></div>
                <div className="connection"></div>
              </div>
              <div className="processing-text">AI Processing Decision...</div>
            </div>
          </div>
        )}
      </div>

      {/* AI Learning Indicator */}
      <div className="ai-learning">
        <div className="learning-icon">🧠</div>
        <div className="learning-text">
          AI is learning from your decisions to improve future recommendations
        </div>
      </div>
    </div>
  );
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#00ff88';
  if (confidence >= 60) return '#ffaa00';
  return '#ff4444';
};

export default AIRecommendationPanel;