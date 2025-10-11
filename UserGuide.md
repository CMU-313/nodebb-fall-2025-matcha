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

This feature allows a user to make their topics private (only original poster and admin users can see) and public (all users can see) anytime when needed. 

1. Create a new topic as usual
2. Click into topic, user topic tools to toggle it to private/public

### 2. How to user test (frontend): 
Private topics a user has posted have "Private" badges on them, next to the "Watching" badge and "Categories" badge. Public topics the user has posted do no have any "Private" badge. Observe that this is consistent throughout "Recent", "Unread", and "Popular" pages, as well as all category pages.

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 49 38 PM" src="https://github.com/user-attachments/assets/e9ef2ce6-512f-4742-98b4-ee8c4a1aa01e" />

Post owner as well as admins can private/public toggle a topic, this change is reflected instantly, through both the "Private" badge disappearing/appearing, and a UI under the topic that reflects the public/private history of the topic. 

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 52 31 PM" src="https://github.com/user-attachments/assets/647c1356-312e-4227-bc61-4cb0ec28dbf7" />

<img width="1439" height="900" alt="Screenshot 2025-10-10 at 9 52 01 PM" src="https://github.com/user-attachments/assets/37c2645d-694c-4a2d-9e61-f574ef3555b2" />

In third person view, we can see that the topic that was posted private cannot be seen when view from a non-admin third person account.

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 50 14 PM" src="https://github.com/user-attachments/assets/38f03424-ce96-4f1e-a7cf-5874b69a501a" />

Non-admin third person can only see public topics, "Private" badges are only on private topics, so all posts seen from a non-admin third person account will not have "Private" badges, including when clicked inside a topic, the badge does not appear. 

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 50 31 PM" src="https://github.com/user-attachments/assets/30ca0950-5f9f-4d8d-b57e-9a2d4824f522" />

Finally, when viewing all topics/posts posted by a certain user on the account page, the non-admin third person account cannot see any private topics, only public topics are seen. It must be noted that the number of total topics a user has posted can be seen, regardless of if it is private or not. 

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 50 58 PM" src="https://github.com/user-attachments/assets/78212311-580e-4bb7-ba3a-e63076ec4ab6" />

An admin user can see all topics posted, with "Private" badge signalling that that topic is posted as private. The badge reflects accurately and is consistent throughout all pages. 

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 51 25 PM" src="https://github.com/user-attachments/assets/ad1bfb3e-bf66-4e82-a47c-d564275e66d4" />

<img width="1440" height="900" alt="Screenshot 2025-10-10 at 9 51 43 PM" src="https://github.com/user-attachments/assets/fe7aa298-e4be-4e91-884d-b594645d572e" />


### 3. Automated tests (backend):
**Description of what is being tested**: 
1. When an admin creates and marks a topic as private, the private flag (private = 1) is stored correctly in the database, and the topic becomes hidden from all non-privileged users (non-owners and non-admins).
2. When a non-owner user attempts to mark another user’s topic as private, the system properly rejects the request and returns an error ([[error:no-privileges]]), ensuring access control is enforced.
3. When posts belong to private topics, they are hidden from users who do not have permission to view those topics, while remaining visible to the topic owner and admin users.
4. The Categories.getRecentTopicReplies() function filters out private topics from non-admin users’ category views but allows admins to see them, ensuring that private data is not exposed indirectly through category-level aggregation.
5. /api/topic/:slug includes the privileges.canPrivate field in its response, and this field is correctly set depending on the user’s role: true for topic owners and admins, and false for non-owners/non-admins.

**Why tests are sufficient**:
The tests are sufficient because they comprehensively verify the functionality and access control of private topics across both direct and indirect access points. They confirm that private flags are correctly set in the backend and persisted, that only authorized users (owners or admins) can toggle privacy, and that visibility restrictions propagate consistently to posts, categories, and API responses. Together, they ensure that private topics remain confidential, prevent unauthorized actions or visibility, and guarantee accurate privilege reporting to the frontend for proper UI handling.