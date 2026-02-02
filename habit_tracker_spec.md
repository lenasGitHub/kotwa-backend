This PROJECT_SPEC.md is designed to be "machine-readable" for the Antigravity editor. It uses clear hierarchies so the AI can map your "Story" directly to code structures.

Create a file named PROJECT_SPEC.md in your project root and paste the following:

Project Specification: The Ascent (Habit Challenge)

1. Project Overview
   The Ascent is a gamified habit-tracking application built with Flutter (Frontend) and Node.js/Socket.io (Backend). The core concept treats habit formation as a mountain climbing journey, utilizing social accountability and RPG mechanics.

2. Core Themes & Visuals
   Mountains (Biomes): 10 Major Habit Categories (e.g., Health, Productivity, Mindfulness).

Lands: Each category has a unique landscape (Snowy, Desert, Forest).

Paths: 10 Sub-Habits per category, visualized as a trail on the mountain.

Dynamic Environment: UI backgrounds change based on real-time (Morning/Night) and user altitude (Progress).

3. Data Models (Entities)
   User Profile
   Auth: Phone Number (Primary Key).

Info: Gender, Birthday, Bio.

Privacy: Public vs. Private profile toggle.

Economy: XP (Experience Points), Coins (Currency), Level.

Habit Structure
Main Category: Title, Description, Total Users, Rating, Trending/Popularity status.

Sub-Habit: Title, Description, Objectives, Tips & Tricks (List), "Before You Join" guide.

Social Metadata: List of joined friends, Active "live" friends, Top players leaderboard.

4. Game Mechanics (The "Story" Logic)
   The Journey
   The Trail: A linear path showing the user's recent position vs. friends' positions.

Camps: Milestones where users can "Rest" or buy camp upgrades with Coins.

Mystery Boxes: Admin-triggered or random reward drops on the path.

Validation System (Proof of Work)
Submission: User uploads a photo via camera proving habit completion.

The Story: Uploaded photo appears in a 24h feed.

Peer Review: Requires 3 Approvals from the community/friends to move to the next step.

Outcome: Upon 3rd approval, the user earns XP/Coins and moves forward.

Social Interaction
Invites: QR Code, Habit ID, or Contacts sync.

Encouragement: Users can "Poke/Book" a friend to send a notification and earn small XP.

Multipliers: Bonus XP for completing missions with a friend simultaneously.

5. API Architecture Reference
   REST Endpoints (Requirement)
   POST /auth/login & /auth/verify

GET /habits/discovery (Categories, Trends, Search)

POST /habits/join & /habits/upload-proof

GET /social/leaderboard & /social/sync-contacts

POST /store/buy-item (Camp upgrades)

Socket.io Events (Requirement)
join_mountain: Sync user to a specific habit room.

update_position: Real-time movement broadcast on the trail.

new_proof_alert: Notify reviewers of a new upload.

submit_vote: Real-time peer approval tracking.

mystery_box_spawn: Global event for active users.

6. Technical Constraints
   Backend: Node.js with TypeScript.

Database: MongoDB (for flexible habit objects) or PostgreSQL.

Real-time: Socket.io for live position tracking.

Storage: S3 or Cloudinary for habit proof images.

How to use this in Antigravity:
Open your Antigravity Editor.

Keep this file open in a tab.

When you prompt the editor (e.g., "Generate the Habit model"), mention: "Refer to PROJECT_SPEC.md for fields and relationships."
