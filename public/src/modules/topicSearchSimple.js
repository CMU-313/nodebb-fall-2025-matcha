'use strict';

define('topicSearchSimple', ['api', 'alerts'], function (api, alerts) {
	const TopicSearchSimple = {};

	TopicSearchSimple.init = function (options) {
		options = options || {};
		options.cid = options.cid || 0;

		const searchEl = $('[component="topic-search"]');
		const searchInput = $('[component="topic-search-input"]');
		const searchButton = $('[component="topic-search-button"]');

		if (!searchEl.length || !searchInput.length) {
			return;
		}

		// Handle search button click
		searchButton.on('click', function () {
			performSearch();
		});

		// Handle enter key
		searchInput.on('keydown', function (e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				performSearch();
			}
		});

		function performSearch() {
			const query = searchInput.val().trim();
			if (!query) {
				return;
			}

			console.log('Performing search for:', query);
			console.log('Search options:', { query: query, cid: options.cid || 0, resultsPerPage: 50, paginate: true });

			// Use API to filter topics and refresh the current page with results
			api.get('/api/v3/search/topics', {
				query: query,
				cid: options.cid || 0,
				resultsPerPage: 50,
				paginate: true,
			}, function (err, result) {
				console.log('API call completed');
				console.log('Error:', err);
				console.log('Full result:', result);

				if (err) {
					console.error('API error:', err);
					return alerts.error(err);
				}

				// Filter current page topics by search results
				// Handle both direct API response and v3 API response format
				const topics = result.topics || (result.response ? result.response.topics || [] : []);
				console.log('Topics extracted:', topics);
				filterCurrentPageTopics(topics);
			});
		}

		function filterCurrentPageTopics(searchResults) {
			const searchTids = new Set(searchResults.map(topic => parseInt(topic.tid, 10)));
			const topicElements = $('[component="category/topic"]');

			console.log('Search results:', searchResults.length, 'topics found');
			console.log('Search TIDs:', Array.from(searchTids));
			console.log('Topic elements found:', topicElements.length);

			topicElements.each(function () {
				const $this = $(this);
				const tid = parseInt($this.attr('data-tid'), 10);
				const shouldShow = searchTids.has(tid);

				console.log('Topic element TID:', tid, 'matches search:', shouldShow);

				if (shouldShow) {
					$this.removeClass('search-hidden').attr('style', '');
					console.log('Showing element');
				} else {
					$this.addClass('search-hidden').attr('style', 'display: none !important;');
					console.log('Hiding element');
				}

				console.log('Element after hide/show:', $this.hasClass('search-hidden'), 'display:', $this.css('display'));
			});

			// Show/hide "no topics" message
			const visibleTopics = topicElements.not('.search-hidden');
			if (visibleTopics.length === 0) {
				showNoTopicsMessage();
			} else {
				hideNoTopicsMessage();
			}
		}

		function showNoTopicsMessage() {
			const container = $('[component="category"], [component="topics"]').first();
			if (!container.find('.no-search-results').length) {
				container.append('<div class="no-search-results alert alert-info">No topics found</div>');
			}
		}

		function hideNoTopicsMessage() {
			$('.no-search-results').remove();
		}

		// Clear search functionality
		searchInput.on('input', function () {
			if (!searchInput.val().trim()) {
				// Show all topics when search is cleared
				$('[component="category/topic"]').removeClass('search-hidden').attr('style', '');
				hideNoTopicsMessage();
			}
		});
	};

	return TopicSearchSimple;
});