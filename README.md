# NeuroFold - Cognitive Exploration Tool

## 1. Problem Statement

Linear search engines and traditional AI chats present information in isolated, flat sequences. When exploring complex topics, users quickly lose the structural relationship between concepts, leading to shallow understanding and cognitive overload. There is no natural way to branch, contextualize, or visualize the cascading implications of an idea without losing the broader picture.

## 2. Solution Description

NeuroFold is a recursive cognitive exploration tool that replaces linear chat with an interactive, multi-dimensional thought canvas. Users input a core concept and dynamically explore it by branching into sub-components, visualizing relationships through a node-based interface. Powered by the Gemini AI pipeline, each node contextually builds upon its parent, guiding the user through a structured, step-by-step learning journey. It prevents information overload by breaking complex knowledge down into interactive, bite-sized nodes that form a cohesive mind map.

Features:
- Node-Based Canvas: Expand concepts naturally across an infinite 2D canvas.
- Batch Processing: Input multiple comma-separated questions to generate parallel nodes instantly.
- Context-Aware AI: The AI pipeline uses the ancestry path of the tree to maintain strict context.
- Import and Export: Save your cognitive trees locally as .nbts files and resume later.
- Mermaid Diagram Generation: Automatically generate architectural diagrams of your entire thought process.

## 3. Tech Stack and Setup Instructions

### Tech Stack
- Frontend: React, Vite, React Flow, Zustand, React Markdown
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB
- AI Pipeline: Google Gemini (3.5-flash)

### Setup Instructions

#### Prerequisites
- Node.js (v18 or higher)
- MongoDB Cluster (local or MongoDB Atlas)
- Google Gemini API Key

#### 1. Clone the repository
git clone https://github.com/pranavdevv/Neurofold---Cognitive-Exploration-tool.git
cd Neurofold---Cognitive-Exploration-tool

#### 2. Setup the Backend
cd server
npm install

Create a .env file in the server directory with the following variables:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

Start the backend:
npm run dev

#### 3. Setup the Frontend
Open a new terminal and navigate to the client folder:
cd client
npm install

Create a .env file in the client directory with the following variable (if hosting the backend remotely, replace with the remote URL):
VITE_API_URL=http://localhost:5000

Start the frontend:
npm run dev

#### 4. Usage
Navigate to the frontend local URL provided by Vite (usually http://localhost:5173). Create a new exploration and begin expanding your knowledge tree.
