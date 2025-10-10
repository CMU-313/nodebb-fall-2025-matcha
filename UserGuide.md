# User Documentation (Keyword Search, Anonymous Posts, Private Topics)
(Using preview mode is better for this document)
## Feature 1: Keyword Search (Mandy)
On [Github](https://github.com/CMU-313/nodebb-fall-2025-matcha), This is the User Story [#8](https://github.com/CMU-313/nodebb-fall-2025-matcha/issues/8); PRs [#45](https://github.com/CMU-313/nodebb-fall-2025-matcha/pull/45) and [#67](https://github.com/CMU-313/nodebb-fall-2025-matcha/pull/67) work on this.


### 1. How to use:
The search bars appear on 4 pages, with the placeholder phrase "Search topics...": 

1. Inside a category (e.g. Categories -> General Discussion)
2. Unread page
3. Recent page
4. Popular page

Users can navigate to any of these pages and search keywords of posts and topics (either in titles or within posts) in the search bar to get filtered outcomes. If none of the topics matches, it will show "no topics found".

### 2. How to user test (Frontend): 

**Setup**: First, create test topics (using the "New Topics" button at the upper-right) with unique keywords in different locations (title, post content, and replies) to verify search functionality.

An example topic and reply: 

Title: `Simple Title Without Special Words`

Content: `This post contains the word ZEBRA which is unique`

Reply: `This reply contains XYLOPHONE as a test word`

**Testing steps**:

1. Navigate to any topic listing page (Inside a category, Recent, Unread, or Popular)
2. Locate the search bar on the top left in the topic list header area (next to filters like "All Topics" or "Tracking")
3. Enter search terms in the input field (which shows default "Search Topics ...")

    <img width="700" alt="Search bar location" src="https://github.com/user-attachments/assets/8f820297-fb48-4540-97cc-bf307df8ce2b" />

4. Click the search button or press Enter (Required - search does not happen automatically as you type)

    <img width="700" alt="Search results" src="https://github.com/user-attachments/assets/1efe480d-ad56-4937-87b9-cbf534d91511" />

5. Observe filtering: Topics not matching the search will be hidden; if none of the topics match, it will show "No Topics Found"

    <img width="400" alt="No topics found message" src="https://github.com/user-attachments/assets/0ce1bcca-5be3-4665-8a79-a0fd32191c58" />

6. Clear the search by deleting input text to restore all topics
7. Try searching with tag or category filters, it will only show topics within the filter

### 3. Automated tests (Backend):
Run new automated tests with `npm run test` or `npm run test test/search.js`

**Test file**: [test/search.js](test/search.js) (line 228-285)

**Description of what is being tested**: 
I manually created a demo topic (line 232-247) by writing the title and post content (with a unique word not in title), as well as adding a reply (with a unique word not in title and post) to it.
Then tested that `topics.searchTopics()` finds topics by searching within:
1. Post (line 249-259): searches for "ZEBRA"
2. Reply (line 261-271): searches for "XYLOPHONE"
3. Title (line 273-283): searches for "Simple"

**Why tests are sufficient**:
The tests verify the core functionality: searching finds topics by title, post content, and replies. Unique keywords in each location confirm that search properly indexes all content, covering the main backend part of the keyword search feature.


## Feature 2: Anonymous Posts

### 1. How to use: 

This feature allows a user to post anonymously. 
When creating a new topic, there is a toggle that allows the user to make the post anonymous. 
When this is turned on, after the user creates the topic, when viewing the post (in detailed and list views), the creator's name shows up as as Anonymous and their profile picture is a default "A". 
Additionally, the name and profile picture are not linked to the user's account unlike for non-anonymous users.

### 2. How to user test: 
Run new automated tests that run with `npm run test` (make sure these pass, details below)

- Click on (create) New Topic on the frontend

- Use the toggle to make the post anonymous

- Checked that changes are persisted in the database using redis cli

- redis-cli -h 127.0.0.1 -p 6379 KEYS "post:*"

- redis-cli -h 127.0.0.1 -p 6379 HGET "post:1" "content"

- redis-cli -h 127.0.0.1 -p 6379 HGET "post:1" "anonymous” (queries the anonymous flag, should be 1 if true, 0 else)

Check that in the list of topics (index), we see "A" as the profile picture rather than the first initial of the poster

Check that when clicking into a topic (detailed), we see "A" as the profile picture rather than the first initial of the poster as well as "Anonymous" as the poster name rather than their actual name

Check that the creator's profile picture and name should not be hyperlinked to their account if anonymous

### 3. Automated tests:
Backend: test/posts/anonymous.js

Frontend: See Testing Steps in [#64](https://github.com/CMU-313/nodebb-fall-2025-matcha/pull/64)

**Description of what is being tested**: 

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
- Anonymous creator's profile picture and name should not be hyperlinked to their account if anonymous

**Why tests are sufficient**:
The tests are sufficient because they cover the core functionalities that anonymous posting should have. This includes that a user can mark a post as anonymous, and upon doing so, the flag is correctly communicated from the front to backend and stored in the database (and persisted through change to that post). After this, the tests ensure that posts are displayed appropriately based on this value in the database (masked if anonymous), and that only anonymous posts are masked. It is also testing edge cases to ensure that anonymity applies to just a post itself and not the user who created the post. An anonymous creator's profile picture and name not being hyperlinked to their account is also tested for. It tests both scenarios that anonymous posts work correctly and non-anonymous posts aren't affected.


## Feature 3: Private Topics (Nicole and Matthew)
### 1. How to use:

### 2. How to user test: 

### 3. Automated tests:
**Description of what is being tested**: 
**Why tests are sufficient**: