import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function ResumeBuilder({ onClose }) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [jobSummary, setJobSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWarming, setIsWarming] = useState(false);
  const [warmupProgress, setWarmupProgress] = useState({
    resume: 'waiting',
    job: 'waiting'
  });

  useEffect(() => {
    loadStoredData();

    // Listen for warmup progress
    window.electronAPI.onWarmupProgress((data) => {
      console.log('Warmup progress:', data);
      if (data.stage === 'resume') {
        setWarmupProgress(prev => ({ ...prev, resume: data.status }));
      } else if (data.stage === 'job') {
        setWarmupProgress(prev => ({ ...prev, job: data.status }));
      }
    });
  }, []);

  const loadStoredData = async () => {
    const context = await window.electronAPI.getInterviewContext();
    if (context) {
      setResumeText(context.resumeText || '');
      setJobDescription(context.jobDescription || '');
      setCompanyName(context.companyName || '');
      setJobTitle(context.jobTitle || '');
      setResumeSummary(context.resumeSummary || '');
      setJobSummary(context.jobSummary || '');
    }
  };

  const handleSave = async () => {
    await window.electronAPI.setInterviewContext({
      resumeText,
      jobDescription,
      companyName,
      jobTitle,
      resumeSummary,
      jobSummary
    });
    alert('✅ Interview context saved successfully!');
  };

  const handleGenerateSummaries = async () => {
    if (!resumeText && !jobDescription) {
      alert('Please add your resume and job description first');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate resume summary
      if (resumeText && !resumeSummary) {
        const resumePrompt = `Summarize this resume in 200 words, focusing on key skills and experience:\n\n${resumeText}`;
        const resumeResponse = await window.electronAPI.askQuestion(resumePrompt);
        if (resumeResponse.success) {
          setResumeSummary(resumeResponse.answer);
        }
      }

      // Generate job summary
      if (jobDescription && !jobSummary) {
        const jobPrompt = `Summarize this job description in 200 words, focusing on key requirements and responsibilities:\n\n${jobDescription}`;
        const jobResponse = await window.electronAPI.askQuestion(jobPrompt);
        if (jobResponse.success) {
          setJobSummary(jobResponse.answer);
        }
      }

      // Save everything
      await window.electronAPI.setInterviewContext({
        resumeText,
        jobDescription,
        companyName,
        jobTitle,
        resumeSummary: resumeSummary || 'Generated',
        jobSummary: jobSummary || 'Generated'
      });

      alert('✅ Summaries generated successfully!');
    } catch (error) {
      console.error('Error generating summaries:', error);
      alert('❌ Error generating summaries: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (type) => {
    const result = await window.electronAPI.selectFile();
    if (result.success && result.content) {
      if (type === 'resume') {
        setResumeText(result.content);
      } else {
        setJobDescription(result.content);
      }
    }
  };

  const handleWarmup = async () => {
    if (!resumeText && !jobDescription) {
      alert('Please add your resume and/or job description first');
      return;
    }

    // Save context first
    await window.electronAPI.setInterviewContext({
      resumeText,
      jobDescription,
      companyName,
      jobTitle
    });

    setIsWarming(true);
    setWarmupProgress({ resume: 'waiting', job: 'waiting' });

    try {
      const result = await window.electronAPI.warmup();

      if (result.success) {
        // Update summaries in state
        if (result.resumeSummary) {
          setResumeSummary(result.resumeSummary);
        }
        if (result.jobSummary) {
          setJobSummary(result.jobSummary);
        }

        alert('🔥 Warm-up completed! All resources loaded for optimal performance.');
      } else {
        alert(`⚠️ Warm-up completed with issues: ${result.message}`);
      }
    } catch (error) {
      console.error('Warm-up error:', error);
      alert(`❌ Warm-up failed: ${error.message}`);
    } finally {
      setIsWarming(false);
      setWarmupProgress({ resume: 'waiting', job: 'waiting' });
    }
  };

  return (
    <motion.div
      className="resume-builder-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="panel-header">
        <h2>📄 Resume Builder</h2>
        <button className="close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="panel-content">
        <div className="builder-grid">
          {/* Interview Details */}
          <div className="builder-section">
            <h3>🎯 Interview Details</h3>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Microsoft, Amazon"
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
          </div>

          {/* Resume Section */}
          <div className="builder-section">
            <div className="section-header">
              <h3>📄 Your Resume / CV</h3>
              <button className="btn-secondary btn-sm" onClick={() => handleFileUpload('resume')}>
                📎 Upload File
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here or upload a file..."
              rows="12"
            />
            {resumeSummary && (
              <div className="summary-preview">
                <strong>Summary:</strong>
                <p>{resumeSummary}</p>
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div className="builder-section">
            <div className="section-header">
              <h3>💼 Job Description</h3>
              <button className="btn-secondary btn-sm" onClick={() => handleFileUpload('job')}>
                📎 Upload File
              </button>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here or upload a file..."
              rows="12"
            />
            {jobSummary && (
              <div className="summary-preview">
                <strong>Summary:</strong>
                <p>{jobSummary}</p>
              </div>
            )}
          </div>
        </div>

        <div className="builder-actions">
          <button
            className="btn-warmup"
            onClick={handleWarmup}
            disabled={isWarming || (!resumeText && !jobDescription)}
            style={{
              backgroundColor: isWarming ? '#f59e0b' : '#10b981',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: isWarming || (!resumeText && !jobDescription) ? 'not-allowed' : 'pointer',
              opacity: isWarming || (!resumeText && !jobDescription) ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isWarming ? '🔥 Warming up...' : '⚡ Warm-up'}
          </button>
          <button
            className="btn-primary"
            onClick={handleGenerateSummaries}
            disabled={isGenerating || (!resumeText && !jobDescription)}
          >
            {isGenerating ? '⏳ Generating...' : '🔄 Generate Summaries'}
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!resumeText && !jobDescription}
          >
            💾 Save Context
          </button>
        </div>

        {/* Warmup Progress Modal */}
        {isWarming && (
          <motion.div
            className="warmup-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}
          >
            <motion.div
              className="warmup-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                backgroundColor: '#1e1e2e',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h3 style={{ marginBottom: '24px', color: '#fff', textAlign: 'center' }}>
                🔥 Preparing Interview
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '24px', textAlign: 'center' }}>
                Loading all resources for optimal performance...
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Resume Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '500', marginBottom: '4px' }}>
                      Resume Summary
                    </div>
                    <div style={{ color: warmupProgress.resume === 'completed' ? '#10b981' : warmupProgress.resume === 'loading' ? '#f59e0b' : '#6b7280', fontSize: '14px' }}>
                      {warmupProgress.resume === 'waiting' && 'Waiting...'}
                      {warmupProgress.resume === 'loading' && 'Loading resume summary...'}
                      {warmupProgress.resume === 'completed' && '✓ Completed'}
                    </div>
                  </div>
                  <div>
                    {warmupProgress.resume === 'waiting' && '⏳'}
                    {warmupProgress.resume === 'loading' && (
                      <div className="spinner" style={{
                        width: '20px',
                        height: '20px',
                        border: '3px solid #f3f4f6',
                        borderTop: '3px solid #f59e0b',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    )}
                    {warmupProgress.resume === 'completed' && '✅'}
                  </div>
                </div>

                {/* Job Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>💼</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '500', marginBottom: '4px' }}>
                      Job Description
                    </div>
                    <div style={{ color: warmupProgress.job === 'completed' ? '#10b981' : warmupProgress.job === 'loading' ? '#f59e0b' : '#6b7280', fontSize: '14px' }}>
                      {warmupProgress.job === 'waiting' && 'Waiting...'}
                      {warmupProgress.job === 'loading' && 'Loading job description...'}
                      {warmupProgress.job === 'completed' && '✓ Completed'}
                    </div>
                  </div>
                  <div>
                    {warmupProgress.job === 'waiting' && '⏳'}
                    {warmupProgress.job === 'loading' && (
                      <div className="spinner" style={{
                        width: '20px',
                        height: '20px',
                        border: '3px solid #f3f4f6',
                        borderTop: '3px solid #f59e0b',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    )}
                    {warmupProgress.job === 'completed' && '✅'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ResumeBuilder;
