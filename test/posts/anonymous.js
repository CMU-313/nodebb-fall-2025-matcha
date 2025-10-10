'use strict';

const assert = require('assert');
const db = require('../mocks/databasemock');

const categories = require('../../src/categories');
const topics = require('../../src/topics');
const posts = require('../../src/posts');
const user = require('../../src/user');

// file created with help of generative AI (cursor)

describe('anonymous posts', () => {
	let uid;
	let cid;

	before(async () => {
		// create test user and category
		uid = await user.create({
			username: 'anon test user',
			password: 'abracadabra',
			gdpr_consent: 1,
		});

		({ cid } = await categories.create({
			name: 'Anonymous Test Category',
			description: 'Anonymous test category created by testing script',
		}));
	});

	// helper functions
	const getPostsForTid = async (tid, viewerUid) => {
		const topic = await topics.getTopicData(tid);
		return topics.getTopicWithPosts(topic, `tid:${tid}:posts`, viewerUid, 0, -1, false);
	};
	const getMainPost = (topicWithPosts) => topicWithPosts.posts[0];
	const getPostByPid = (topicWithPosts, pid) => topicWithPosts.posts.find(p => p.pid === pid);
	const expectMasked = (userObj) => {
		assert.strictEqual(userObj.displayname, 'Anonymous');
		assert.strictEqual(userObj['icon:text'], 'A');
		assert.strictEqual(userObj['icon:bgColor'], '#999999');
	};
	const expectNotMasked = (userObj) => {
		assert.notStrictEqual(userObj.username, 'Anonymous');
		assert.notStrictEqual(userObj.displayname, 'Anonymous');
	};

	describe('topic post', () => {
		it('should store anonymous flag and mask user on fetch', async () => {
			// create an anonymous post
			// confirm flag stored
			// confirm output masked
			const { topicData, postData } = await topics.post({
				uid,
				cid,
				title: 'Anonymous post',
				content: 'content body',
				anonymous: 1,
			});

			assert.strictEqual(parseInt(await posts.getPostField(postData.pid, 'anonymous'), 10), 1);
			const twp = await getPostsForTid(topicData.tid, uid);
			const main = getMainPost(twp);
			assert.strictEqual(main.pid, postData.pid);
			expectMasked(main.user);
		});

		it('should not mask user when anonymous is not set', async () => {
			// create not anonymous post
			// confirm flag not stored
			// confirm output not masked
			const { topicData, postData } = await topics.post({
				uid,
				cid,
				title: 'Non-anon main post',
				content: 'content body',
			});

			const storedAnon = await posts.getPostField(postData.pid, 'anonymous');
			assert(!storedAnon || parseInt(storedAnon, 10) === 0);
			const main = getMainPost(await getPostsForTid(topicData.tid, uid));
			expectNotMasked(main.user);
		});
	});

	describe('post editing', () => {
		it('should preserve anonymous flag when editing anonymous post content', async () => {
			const { postData } = await topics.post({
				uid,
				cid,
				title: 'Post to edit',
				content: 'original content!',
				anonymous: 1,
			});
			await posts.edit({
				pid: postData.pid,
				uid,
				content: 'edited content!',
			});

			const storedAnon = await posts.getPostField(postData.pid, 'anonymous');
			assert.strictEqual(parseInt(storedAnon, 10), 1);
			const postDataAfter = await posts.getPostData(postData.pid);
			const topic = await topics.getTopicData(postDataAfter.tid);
			const data = await topics.getTopicWithPosts(topic, `tid:${topic.tid}:posts`, uid, 0, -1, false);
			const edited = data.posts.find(p => p.pid === postData.pid);
			assert.strictEqual(edited.user.displayname, 'Anonymous');
			assert.strictEqual(edited.content, 'edited content!');
		});
	});

	describe('topics index listing', () => {
		it('should only mask anonymous posts, not all posts by same user in index', async () => {
			//create three posts by the same user: anonymous, non-anonymous, anonymous
			const { topicData: topic1 } = await topics.post({
				uid,
				cid,
				title: 'Anonymous Post 1',
				content: 'anonymous content',
				anonymous: 1,
			});

			const { topicData: topic2 } = await topics.post({
				uid,
				cid,
				title: 'Non-Anonymous Post',
				content: 'normal content',
			});

			const { topicData: topic3 } = await topics.post({
				uid,
				cid,
				title: 'Anonymous Post 2',
				content: 'another anonymous content',
				anonymous: 1,
			});

			//get topics list
			const tids = [topic1.tid, topic2.tid, topic3.tid];
			const topicsList = await topics.getTopicsByTids(tids, uid);

			//find each topic in the list
			const listedTopic1 = topicsList.find(t => t.tid === topic1.tid);
			const listedTopic2 = topicsList.find(t => t.tid === topic2.tid);
			const listedTopic3 = topicsList.find(t => t.tid === topic3.tid);

			//verify first anonymous post is masked
			assert.strictEqual(listedTopic1.user.displayname, 'Anonymous');
			assert.strictEqual(listedTopic1.user['icon:text'], 'A');

			//verify non-anonymous post not masked
			assert.notStrictEqual(listedTopic2.user.displayname, 'Anonymous');
			assert.strictEqual(listedTopic2.uid, uid);

			//verify second anonymous post also masked
			assert.strictEqual(listedTopic3.user.displayname, 'Anonymous');
			assert.strictEqual(listedTopic3.user['icon:text'], 'A');
		});
	});
});