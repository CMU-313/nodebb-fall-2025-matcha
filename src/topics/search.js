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

		// Get topic titles for all topics
		const topicData = await db.getObjectsFields(
			allTids.map(tid => `topic:${tid}`),
			['title']
		);

		// Filter topics where title contains the search query
		const matchingTids = [];
		for (let i = 0; i < allTids.length && matchingTids.length < hardCap; i++) {
			const topic = topicData[i];
			if (topic && topic.title && topic.title.toLowerCase().includes(query)) {
				matchingTids.push(parseInt(allTids[i], 10));
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