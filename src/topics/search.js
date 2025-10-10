'use strict';

const db = require('../database');
const privileges = require('../privileges');
const plugins = require('../plugins');

module.exports = function (Topics) {
	Topics.searchTopics = async function (data) {
		const query = data.query || '';
		const page = data.page || 1;
		const uid = data.uid || 0;
		const paginate = data.hasOwnProperty('paginate') ? data.paginate : true;

		const startTime = process.hrtime();

		if (!query || String(query).length < 2) {
			return {
				topics: [],
				matchCount: 0,
				pageCount: 1,
				timing: '0.00',
			};
		}

		let tids = await findTopicsByTitle(query, data.hardCap);

		// Filter by category if specified
		if (data.cid && parseInt(data.cid, 10) > 0) {
			tids = await filterTopicsByCategory(tids, data.cid);
		}

		// Filter by privileges
		tids = await privileges.topics.filterTids('topics:read', tids, uid);

		const result = await plugins.hooks.fire('filter:topics.search', {
			data: data,
			tids: tids,
			uid: uid,
		});
		tids = result.tids;

		const searchResult = {
			matchCount: tids.length,
		};

		if (paginate) {
			const resultsPerPage = data.resultsPerPage || 20;
			const start = Math.max(0, page - 1) * resultsPerPage;
			const stop = start + resultsPerPage;
			searchResult.pageCount = Math.ceil(tids.length / resultsPerPage);
			tids = tids.slice(start, stop);
		}

		const topicsData = await Topics.getTopics(tids, uid);

		searchResult.timing = (process.elapsedTimeSince(startTime) / 1000).toFixed(2);
		searchResult.topics = topicsData.filter(Boolean);
		return searchResult;
	};

	async function findTopicsByTitle(query, hardCap) {
		if (!query) {
			return [];
		}
		query = String(query).toLowerCase();
		hardCap = hardCap || 500;

		// Get all topic IDs first
		const allTids = await db.getSortedSetRange('topics:tid', 0, -1);

		if (!allTids.length) {
			return [];
		}

		// Get topic titles and mainPid for all topics
		const topicData = await db.getObjectsFields(
			allTids.map(tid => `topic:${tid}`),
			['title', 'mainPid']
		);

		// Search through topics: check both title and post content
		const matchingTids = [];

		// Batch process to improve performance
		// First pass: check all titles (fast)
		for (let i = 0; i < allTids.length && matchingTids.length < hardCap; i++) {
			const topic = topicData[i];
			const tid = parseInt(allTids[i], 10);

			// Check if title matches
			if (topic && topic.title && topic.title.toLowerCase().includes(query)) {
				matchingTids.push(tid);
			}
		}

		// Second pass: check post content for all topics (including those matched by title)
		// Get all post IDs for all topics in one batch query
		const tidToPostsMap = {};
		const allPostKeys = [];

		for (let i = 0; i < allTids.length; i++) {
			const tid = parseInt(allTids[i], 10);
			const topic = topicData[i];

			// Check all topics, not just non-matching ones
			// (main post content might match even if title doesn't)

			// Get post IDs for this topic (replies only, mainPid is separate)
			const pids = await db.getSortedSetRange(`tid:${tid}:posts`, 0, -1);

			// Include main post if it exists
			const allPids = [];
			if (topic && topic.mainPid) {
				allPids.push(topic.mainPid);
			}
			if (pids && pids.length > 0) {
				allPids.push(...pids);
			}

			if (allPids.length > 0) {
				tidToPostsMap[tid] = allPids;
				allPostKeys.push(...allPids.map(pid => `post:${pid}`));
			}
		}

		// Fetch all post content in one batch query (more efficient)
		if (allPostKeys.length > 0) {
			const allPostsData = await db.getObjectsFields(allPostKeys, ['content']);

			// Map posts back to their topics and check for matches
			let postIndex = 0;
			for (const tid of Object.keys(tidToPostsMap)) {
				const numPosts = tidToPostsMap[tid].length;
				const topicPosts = allPostsData.slice(postIndex, postIndex + numPosts);
				postIndex += numPosts;

				// Check if any post in this topic matches the query
				const hasMatch = topicPosts.some(
					post => post && post.content && post.content.toLowerCase().includes(query)
				);

				// Only add if not already in list and under hardCap
				if (hasMatch && !matchingTids.includes(parseInt(tid, 10)) && matchingTids.length < hardCap) {
					matchingTids.push(parseInt(tid, 10));
				}
			}
		}

		return matchingTids;
	}

	async function filterTopicsByCategory(tids, cid) {
		if (!tids.length) {
			return tids;
		}

		const topicData = await db.getObjectsFields(
			tids.map(tid => `topic:${tid}`),
			['cid']
		);

		return tids.filter((tid, index) => {
			return topicData[index] && parseInt(topicData[index].cid, 10) === parseInt(cid, 10);
		});
	}
};