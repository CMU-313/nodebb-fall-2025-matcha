'use strict';

const assert = require('assert');
const db = require('../mocks/databasemock');

const categories = require('../../src/categories');
const topics = require('../../src/topics');
const posts = require('../../src/posts');
const user = require('../../src/user');

describe('anonymous posts', () => {
	// These tests verify backend behavior for anonymous posting:
	// - storing the anonymous flag
	// - masking user details in topic/post fetches
	// - preserving anonymity through edits and deletes
	// - raw getters expose the anonymous field
	let uid;
	let cid;

	before(async () => {
		// Create a dedicated test user and category
		uid = await user.create({
			username: 'anon test user',
			password: 'abracadabra',
			gdpr_consent: 1,
		});

		({ cid } = await categories.create({
			name: 'Anonymous Test Category',
			description: 'Category for anonymous post tests',
		}));
	});

	// Helpers to reduce duplication across tests
	// Fetch full post list for a topic id
	const getPostsForTid = async (tid, viewerUid) => {
		const topic = await topics.getTopicData(tid);
		return topics.getTopicWithPosts(topic, `tid:${tid}:posts`, viewerUid, 0, -1, false);
	};
	// Get main post from a topic-with-posts payload
	const getMainPost = (topicWithPosts) => topicWithPosts.posts[0];
	// Find specific post by pid
	const getPostByPid = (topicWithPosts, pid) => topicWithPosts.posts.find(p => p.pid === pid);
	// Assert that a post's user data is masked as Anonymous
	const expectMasked = (userObj) => {
		assert.strictEqual(userObj.username, 'Anonymous');
		assert.strictEqual(userObj.displayname, 'Anonymous');
		assert.strictEqual(userObj['icon:text'], 'A');
		assert.strictEqual(userObj['icon:bgColor'], '#999999');
		assert.strictEqual(userObj.userslug, undefined);
		assert.strictEqual(userObj.picture, undefined);
	};
	// Assert that a post's user data is not masked
	const expectNotMasked = (userObj) => {
		assert.notStrictEqual(userObj.username, 'Anonymous');
		assert.notStrictEqual(userObj.displayname, 'Anonymous');
	};

	describe('topic main post', () => {
		it('should store anonymous flag and mask user on fetch', async () => {
			// Create an anonymous main post, then confirm flag stored and output masked
			const { topicData, postData } = await topics.post({
				uid,
				cid,
				title: 'Anonymous main post',
				content: 'content',
				anonymous: 1,
			});

			assert.strictEqual(parseInt(await posts.getPostField(postData.pid, 'anonymous'), 10), 1);

			const twp = await getPostsForTid(topicData.tid, uid);
			const main = getMainPost(twp);
			assert.strictEqual(main.pid, postData.pid);
			expectMasked(main.user);
		});

		it('should not mask user when anonymous is not set', async () => {
			// Create a regular (non-anonymous) main post
			const { topicData, postData } = await topics.post({
				uid,
				cid,
				title: 'Non-anon main post',
				content: 'content',
			});

			const storedAnon = await posts.getPostField(postData.pid, 'anonymous');
			assert(!storedAnon || parseInt(storedAnon, 10) === 0);

			// Verify the user details are not masked in topic fetch
			const main = getMainPost(await getPostsForTid(topicData.tid, uid));
			expectNotMasked(main.user);
		});

	});

	describe('replies', () => {
		let tid;
		beforeEach(async () => {
			// Create a topic to reply to
			const result = await topics.post({
				uid,
				cid,
				title: 'Topic for reply anon tests',
				content: 'main',
			});
			tid = result.topicData.tid;
		});

		it('should store anonymous flag on reply and mask user on fetch', async () => {
			// Post an anonymous reply
			const reply = await topics.reply({
				uid,
				tid,
				content: 'reply content',
				anonymous: 1,
			});

			assert.strictEqual(parseInt(await posts.getPostField(reply.pid, 'anonymous'), 10), 1);

			// Verify the reply's user details are masked in topic fetch
			const found = getPostByPid(await getPostsForTid(tid, uid), reply.pid);
			assert(found && found.user);
			expectMasked(found.user);
		});



		it('should leave non-anonymous reply unmasked', async () => {
			// Post a regular (non-anonymous) reply
			const reply = await topics.reply({
				uid,
				tid,
				content: 'regular reply',
			});

			const storedAnon = await posts.getPostField(reply.pid, 'anonymous');
			assert(!storedAnon || parseInt(storedAnon, 10) === 0);

			// Verify the reply's user details are not masked
			const found = getPostByPid(await getPostsForTid(tid, uid), reply.pid);
			assert(found && found.user);
			expectNotMasked(found.user);
		});

	});

	describe('post editing', () => {
		it('should preserve anonymous flag when editing anonymous post content', async () => {
			// Create an anonymous main post
			const { postData } = await topics.post({
				uid,
				cid,
				title: 'Post to edit',
				content: 'original content',
				anonymous: 1,
			});

			// Edit the post content; anonymous flag should remain
			await posts.edit({
				pid: postData.pid,
				uid,
				content: 'edited content',
			});

			const storedAnon = await posts.getPostField(postData.pid, 'anonymous');
			assert.strictEqual(parseInt(storedAnon, 10), 1);

			// Verify flag is preserved and output remains masked after edit
			const postDataAfter = await posts.getPostData(postData.pid);
			const topic = await topics.getTopicData(postDataAfter.tid);
			const data = await topics.getTopicWithPosts(topic, `tid:${topic.tid}:posts`, uid, 0, -1, false);
			const edited = data.posts.find(p => p.pid === postData.pid);
			assert.strictEqual(edited.user.username, 'Anonymous');
			assert.strictEqual(edited.content, 'edited content');
		});
	});
});

