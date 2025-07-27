import React from 'react';
import './AboutPage.scss';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1>About This Project</h1>
          <p className="subtitle">Rick and Morty Character Explorer</p>
        </div>

        <div className="about-content">
          <section className="project-info">
            <h2>Project Overview</h2>
            <p>
              This is a React application that allows users to explore
              characters from the popular animated series &ldquo;Rick and
              Morty&rdquo;. The app features character search, detailed
              character information, and a responsive design.
            </p>

            <div className="features-list">
              <h3>Key Features:</h3>
              <ul>
                <li>Search characters by name</li>
                <li>View detailed character information</li>
                <li>Responsive design for all devices</li>
                <li>Error handling and loading states</li>
                <li>Character details panel with additional information</li>
                <li>Comprehensive testing coverage</li>
              </ul>
            </div>
          </section>

          <section className="author-info">
            <h2>Author Information</h2>
            <div className="author-card">
              <div className="author-details">
                <h3>Frontend Developer</h3>
                <p>
                  This project was developed as part of the React course
                  curriculum, demonstrating modern React development practices
                  including:
                </p>
                <ul>
                  <li>React Hooks (useState, useEffect, useContext)</li>
                  <li>TypeScript for type safety</li>
                  <li>
                    Component testing with Vitest and React Testing Library
                  </li>
                  <li>SCSS for styling and responsive design</li>
                  <li>API integration and error handling</li>
                  <li>Context API for state management</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="course-info">
            <h2>Educational Background</h2>
            <div className="course-card">
              <h3>RS School React Course</h3>
              <p>
                This project was created as part of the comprehensive React
                development course offered by RS School. The course covers
                modern frontend development practices and advanced React
                concepts.
              </p>

              <div className="course-link">
                <a
                  href="https://app.rs.school/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rs-school-link"
                >
                  <span className="link-icon">🎓</span>
                  Visit RS School Profile
                  <span className="external-icon">↗</span>
                </a>
              </div>

              <div className="course-topics">
                <h4>Course Topics Covered:</h4>
                <div className="topics-grid">
                  <span className="topic">React Components</span>
                  <span className="topic">Hooks & State Management</span>
                  <span className="topic">TypeScript</span>
                  <span className="topic">Testing</span>
                  <span className="topic">API Integration</span>
                  <span className="topic">Responsive Design</span>
                </div>
              </div>
            </div>
          </section>

          <section className="tech-stack">
            <h2>Technology Stack</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <h4>Frontend</h4>
                <ul>
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Vite</li>
                  <li>SCSS</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>Testing</h4>
                <ul>
                  <li>Vitest</li>
                  <li>React Testing Library</li>
                  <li>Coverage Reports</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>API</h4>
                <ul>
                  <li>Rick and Morty API</li>
                  <li>RESTful endpoints</li>
                  <li>Error handling</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
