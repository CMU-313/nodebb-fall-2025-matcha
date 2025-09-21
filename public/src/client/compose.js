'use strict';


define('forum/compose', ['hooks'], function (hooks) {
	const Compose = {};

	Compose.init = function () {
		const container = $('.composer');

		if (container.length) {
			// Initialize private post toggle functionality
			Compose.setupPrivateToggle(container);

			hooks.fire('action:composer.enhance', {
				container: container,
			});
		}
	};

	Compose.setupPrivateToggle = function (container) {
		container.off('click', '.composer-private').on('click', '.composer-private', function (e) {
			e.preventDefault();
			const btn = $(this);
			const icon = btn.find('i');
			const text = btn.find('.private-text');

			// Get the post UUID from the container
			const post_uuid = container.attr('data-uuid');

			// Toggle private state
			if (btn.hasClass('active')) {
				btn.removeClass('active');
				icon.removeClass('fa-lock').addClass('fa-unlock');
				text.text('Public');

				// Update composer internal state if available
				if (window.composer && window.composer.posts && window.composer.posts[post_uuid]) {
					window.composer.posts[post_uuid].isPrivate = false;
				}
			} else {
				btn.addClass('active');
				icon.removeClass('fa-unlock').addClass('fa-lock');
				text.text('Private');

				// Update composer internal state if available
				if (window.composer && window.composer.posts && window.composer.posts[post_uuid]) {
					window.composer.posts[post_uuid].isPrivate = true;
				}
			}
		});
	};

	return Compose;
});
