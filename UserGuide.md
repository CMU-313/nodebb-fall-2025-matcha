User Documentation

Feature 1: Keyword Search (Mandy)
How to use: *** provide a detailed outline
How to user test: *** provide a detailed outline
Link/description of where automated tests can be found: *** please provide
Description of what is being tested: 
Why tests are sufficient for covering the changes made:


Feature 2: Anonymous Posts

How to use: This feature allows a user to post anonymously. When creating a new topic, 
there is a toggle that allows the user to make the post anonymous. When this is turned on, 
after the user creates the topic, when viewing the post (in detailed and list views), 
the creator's name shows up as as Anonymous and their profile picture is a default "A".

How to user test: 
Run new automated tests that run with npm run test (make sure these pass, details below)
Click on (create) New Topic on the frontend
Use the toggle to make the post anonymous
Checked that changes are persisted in the database using redis cli
redis-cli -h 127.0.0.1 -p 6379 KEYS "post:*"
redis-cli -h 127.0.0.1 -p 6379 HGET "post:1" "content"
redis-cli -h 127.0.0.1 -p 6379 HGET "post:1" "anonymous” (queries the anonymous flag, should be 1 if true, 0 else)
Check that in the list of topics (index), we see "A" as the profile picture rather than the first initial of the poster
Check that when clicking into a topic (detailed), we see "A" as the profile picture rather than the first initial of the poster as well as "Anonymous" as the poster name rather than their actual name

Link/description of where automated tests can be found:
Backend: test/posts/anonymous.js
Frontend: https://github.com/CMU-313/nodebb-fall-2025-matcha/pull/64

Description of what is being tested: 
Backend: 
1. When creating an anonymous post, the anonymous flag (1) is stored in the database and that user information is properly hidden (displayname: "Anonymous", icon:text: "A", icon:bgColor: "#999999") when fetching the post
2. When creating not anonymous posts, user information is displayed normally when fetching the post
3. Persistence of changes upon editing the post: ensures that point 1 still holds true even after changes are made to the post
4. Tests that anonymity is applied per-post, not per-user: user can have both anonymous and not anonymous posts in topic list, each should display appropriate information as mentioned in points 1 and 2

Frontend: 
- User can mark a post as anonymous upon creation
- User can see "Anonymous" as creator name if post is anonymouse
- User sees poster name if not anonymous
- User can see "Anonymous" profile picture if post is anonymous
- User sees regular profile picture if not anonymous
- This works in both index and detailed view

Why tests are sufficient for covering the changes made:
The tests are sufficient because they cover the core functionalities that anonymous posting should have. This includes that a user can mark a post as anonymous, and upon doing so, the flag is correctly communicated from the front to backend and stored in the database (and persisted through change to that post). After this, the tests ensure that posts are displayed appropriately based on this value in the database (masked if anonymous), and that only anonymous posts are masked. It is also tested edge cases to ensure that anonymity applies to just a post itself and not the user who created the post. It both scenarios tests both that anonymous posts work correctly and non-anonymous posts aren't affected.


Feature 3: Private Topics (Nicole and Matthew)
How to use: *** provide a detailed outline
How to user test: *** provide a detailed outline
Link/description of where automated tests can be found: *** please provide
Description of what is being tested: 
Why tests are sufficient for covering the changes made: