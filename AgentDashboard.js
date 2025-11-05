import React, { useState, useRef, useEffect } from 'react';

// --- Helper component for log entries ---
const LogEntry = ({ source, text }) => (
  <div className={`log-entry ${source.toLowerCase()}`}>
    <strong>{source}:</strong> {text}
  </div>
);

// --- Main Dashboard Component ---
const AgentDashboard = () => {
  // --- STATE ---
  const [goal, setGoal] = useState('Analyze the impact of quantum computing on AI');
  const [agentStatus, setAgentStatus] = useState('Idle'); // Idle, Running, AwaitingFeedback, Refining
  const [tasks, setTasks] = useState([]); // The agent's plan
  const [logEntries, setLogEntries] = useState([]); // The main execution log
  const [currentContext, setCurrentContext] = useState([]); // RAG context
  const [longTermMemory, setLongTermMemory] = useState([]); // Learned facts
  const [feedbackInput, setFeedbackInput] = useState('');

  const logEndRef = useRef(null); // To auto-scroll the log

  // --- Auto-scroll log ---
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logEntries]);

  // --- AGENT SIMULATION ---
  const addLog = (source, text) => {
    setLogEntries((prevLogs) => [...prevLogs, { source, text }]);
  };

  const handleStartResearch = () => {
    // Reset everything
    setAgentStatus('Running');
    setTasks([]);
    setLogEntries([]);
    setCurrentContext([]);
    setLongTermMemory(['Session Start: ' + new Date().toLocaleString()]);
    
    addLog('Planner', `New goal received: "${goal}". Decomposing into tasks...`);

    // Simulate Goal Decomposition
    setTimeout(() => {
      const newTasks = [
        { id: 1, text: 'Identify key applications of quantum computing in AI', status: 'pending' },
        { id: 2, text: 'Analyze recent breakthroughs and challenges', status: 'pending' },
        { id: 3, text: 'Discuss potential risks and ethical considerations', status: 'pending' },
        { id: 4, text: 'Synthesize findings and generate final summary', status: 'pending' },
      ];
      setTasks(newTasks);
      addLog('Planner', 'Task decomposition complete. Starting Task 1.');
      runTask(1, newTasks);
    }, 1500);
  };

  const runTask = (taskId, currentTasks) => {
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) {
      setAgentStatus('Idle');
      addLog('Agent', 'All tasks completed.');
      return;
    }

    setAgentStatus('Running');
    setTasks(currentTasks.map(t => t.id === taskId ? { ...t, status: 'inprogress' } : t));
    
    // Simulate Task 1: Retrieval (RAG)
    if (taskId === 1) {
      addLog('Researcher', `Executing Task 1: ${task.text}`);
      setTimeout(() => {
        addLog('Researcher', 'Accessing vector database for "quantum AI applications"...');
        setCurrentContext(['doc:quantum_ai_review.pdf', 'doc:future_of_computing.txt']);
      }, 1000);
      setTimeout(() => {
        addLog('Researcher', 'Found 2 relevant documents. Synthesizing...');
        setCurrentContext([]);
        addLog('Synthesizer', 'Conclusion: Quantum computing can optimize ML models and speed up complex calculations.');
        setLongTermMemory(prev => [...prev, 'Fact: Quantum can optimize ML models.']);
        setTasks(currentTasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
        addLog('Planner', 'Task 1 complete. Moving to Task 2.');
        runTask(2, currentTasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
      }, 3000);
    }
    
    // Simulate Task 2: Web Search & Feedback Loop
    if (taskId === 2) {
      addLog('Researcher', `Executing Task 2: ${task.text}`);
      setTimeout(() => {
        addLog('Researcher', 'Searching web for "recent quantum AI breakthroughs 2024"...');
        setCurrentContext(['web:TechCrunch_article.html', 'web:MIT_review_post.html']);
      }, 1000);
      setTimeout(() => {
        addLog('Synthesizer', 'Drafting summary for Task 2. Findings seem to focus on error correction.');
        setTasks(currentTasks.map(t => t.id === taskId ? { ...t, status: 'awaiting_feedback' } : t));
        setAgentStatus('AwaitingFeedback');
        addLog('Agent', 'A draft has been prepared for Task 2. Please review and provide feedback.');
      }, 3000);
    }
  };
  
  const handleFeedbackSubmit = () => {
    if (!feedbackInput) return;
    
    addLog('Human', feedbackInput);
    setAgentStatus('Refining');
    setFeedbackInput('');
    
    const currentTasks = tasks.map(t => t.status === 'awaiting_feedback' ? { ...t, status: 'inprogress' } : t);
    setTasks(currentTasks);
    
    // Simulate Self-Correction
    addLog('Planner', 'Feedback received. Re-evaluating plan...');
    setTimeout(() => {
      addLog('Self-Corrector', `Refining task based on feedback: "${feedbackInput}"`);
      addLog('Researcher', 'Running new search queries based on feedback...');
      setCurrentContext(['web:Forbes_new_article.html']);
    }, 1500);
    setTimeout(() => {
      addLog('Synthesizer', 'Revised findings for Task 2 are complete.');
      const refinedTasks = tasks.map(t => t.id === 2 ? { ...t, status: 'done' } : t);
      setTasks(refinedTasks);
      addLog('Planner', 'Task 2 complete. Moving to Task 3.');
      runTask(3, refinedTasks);
    }, 3500);
  };

  // --- Helper for Task Status Icons ---
  const getStatusIcon = (status) => {
    if (status === 'done') return '✅';
    if (status === 'inprogress') return '🔄';
    if (status === 'awaiting_feedback') return '⚠️';
    return '🔵'; // pending
  };

  // --- RENDER ---
  return (
    <div className="agent-dashboard">
      <header>
        <h1>Goal-Oriented Research Agent</h1>
      </header>

      <div className="goal-setter card">
        <h2>Research Goal</h2>
        <div className="goal-input-group">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Enter your research objective"
            disabled={agentStatus !== 'Idle'}
          />
          <button onClick={handleStartResearch} disabled={agentStatus !== 'Idle'}>
            Start Research
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* --- COLUMN 1: PLAN & CONTROL --- */}
        <div className="left-column">
          <div className="card">
            <h2>Agent Status</h2>
            <div className={`status-badge ${agentStatus.toLowerCase()}`}>
              {agentStatus}
            </div>
          </div>
          <div className="card">
            <h2>Task Plan</h2>
            <ul className="task-plan-list">
              {tasks.length === 0 && <li className="empty">Agent has not formed a plan yet.</li>}
              {tasks.map(task => (
                <li key={task.id} className={task.status}>
                  <span>{getStatusIcon(task.status)}</span> {task.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- COLUMN 2: LIVE EXECUTION LOG --- */}
        <div className="center-column card">
          <h2>Live Execution Log</h2>
          <div className="log-container">
            {logEntries.length === 0 && <div className="log-entry">Waiting for agent to start...</div>}
            {logEntries.map((entry, index) => (
              <LogEntry key={index} source={entry.source} text={entry.text} />
            ))}
            <div ref={logEndRef} /> {/* For auto-scroll */}
          </div>
          {agentStatus === 'AwaitingFeedback' && (
            <div className="feedback-module">
              <h3>Feedback Required</h3>
              <p>The agent is waiting for your input to proceed.</p>
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="e.g., 'This is good, but also look into the impact on cryptography'"
              />
              <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
            </div>
          )}
        </div>

        {/* --- COLUMN 3: MEMORY & CONTEXT --- */}
        <div className="right-column">
          <div className="card">
            <h2>Current Context (RAG)</h2>
            <ul className="memory-list">
              {currentContext.length === 0 && <li className="empty">No context loaded.</li>}
              {currentContext.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2>Long-Term Memory</h2>
            <ul className="memory-list">
              {longTermMemory.length === 0 && <li className="empty">No facts saved yet.</li>}
              {longTermMemory.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;