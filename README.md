# Group Tracker

Group Tracker is a comprehensive solution for organizations to track contributions, manage activities, and keep members informed and engaged.
Whether you're managing a community group, non-profit organization, or club, Group Tracker provides the tools you need to coordinate activities and recognize member contributions.

## 🌟 Features

- **Track Contributions** - Record and analyze monetary donations, volunteer time, and in-kind contributions
- **Manage Activities** - Create and organize events, projects, and initiatives
- **Member Management** - Keep track of members, their contributions, and participation
- **Multiple Groups** - Manage multiple groups or chapters under one organization
- **Detailed Analytics** - Gain insights into your organization's activities and member engagement
- **Modern UI** - Clean, responsive interface with dark mode support

## 🛠️ Technology Stack

### Frontend
- React.js
- React Router for navigation
- Modern CSS with responsive design
- Dark/Light theme toggle

### Backend
- Python with Flask
- SQLAlchemy ORM
- JWT for authentication
- RESTful API architecture


This repository contains:
- `client/`: React frontend application (deployed to Netlify)
- `server/`: Flask backend API (deployed separately)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- pip or pipenv

### Installation

#### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/Group-Tracker.git
   cd Group-Tracker/server
   ```

2. Set up Python environment
   ```bash
   # Using pipenv
   pipenv install
   
   # Or using pip with virtualenv
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Set up the database
   ```bash
   flask db upgrade
   ```

4. Start the backend server
   ```bash
   flask run
   # Server will run on http://localhost:5000
   ```

#### Frontend Setup

1. Navigate to the client directory
   ```bash
   cd ../client
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   # App will run on http://localhost:3000
   ```

## 📱 Usage

### User Management
- **Register/Login**: Create an account or log in to an existing account
- **Profile Management**: Update your profile information and preferences

### Groups
- **Create Groups**: Set up new groups for different departments or chapters
- **Join Groups**: Join existing groups using invitation links
- **Group Management**: Add/remove members, assign roles

### Activities
- **Create Activities**: Set up new events, projects, or initiatives
- **Track Progress**: Monitor completion status and member participation
- **Activity Reports**: Generate reports on activity outcomes

### Contributions
- **Record Contributions**: Log monetary donations, volunteer hours, or in-kind contributions
- **Contribution Analytics**: View statistics on contributions by member, group, or activity
- **Recognition**: Highlight top contributors

## 🔒 Security Features

- JWT-based authentication
- Password hashing
- Role-based access control
- HTTPS support

## 📊 Roadmap

- Mobile applications 
- Advanced analytics and visualization tools 
- Integration with third-party services 
- API for external applications

