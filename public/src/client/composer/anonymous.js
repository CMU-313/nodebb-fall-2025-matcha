'use strict';

// finds checkbox using ID in tpl file
// checks if the anonymous checkbox is checked and set the anonymous flag to 1 if it is
// sends this to the server to create post
define('forum/composer/anonymous', ['hooks'], function (hooks) {
    hooks.on('filter:composer.submit', function (payload) {
        const composerEl = payload.composerEl || $('[component="composer"], .composer').first();
        const checkbox = composerEl.find('#composer-anonymous-switch');
        const isAnon = checkbox.is(':checked');
        
        if (payload.composerData) {
            payload.composerData.anonymous = isAnon ? 1 : 0;
        }
        
        return payload;
    });
    
    return {};
});

