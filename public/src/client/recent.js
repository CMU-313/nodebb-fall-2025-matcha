'use strict';

define('forum/recent', ['topicList', 'topicSearchSimple'], function (topicList, topicSearchSimple) {
	const Recent = {};

	Recent.init = function () {
		app.enterRoom('recent_topics');

		topicList.init('recent');

		// Initialize topic search
		topicSearchSimple.init({});
	};

	return Recent;
});
