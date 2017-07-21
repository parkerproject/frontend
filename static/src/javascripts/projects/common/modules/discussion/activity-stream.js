// @flow
import bonzo from 'bonzo';
import bean from 'bean';
import $ from 'lib/$';
import {
    supportsPushState,
    getUrlVars,
    constructQuery,
    replaceQueryString,
    pushQueryString,
} from 'lib/url';
import Component from 'common/modules/component';
import discussionApi from 'common/modules/discussion/api';

const pagination = activityStream => {
    bean.on(
        activityStream.elem,
        'click',
        '.js-activity-stream-page-change',
        e => {
            const page = e.currentTarget.getAttribute('data-page');

            e.preventDefault();

            activityStream.change({
                page,
            });
        }
    );
};

const selectTab = streamType => {
    const tabLinks = document.getElementsByClassName(
        'js-activity-stream-change'
    )[0];

    // Blur so that when pressing forward/back the focus is not retained on
    // the old tab Note, without the focus first, the blur doesn't seem to
    // work for some reason
    if (tabLinks) {
        tabLinks.focus();
        tabLinks.blur();
    }

    const selectedTab = document.getElementsByClassName(
        'js-activity-stream-change'
    )[0];

    if (selectedTab) {
        selectedTab.classList.remove('tabs__tab--selected');
    }

    const selectedTabLink = document.querySelector(
        `a[data-stream-type=${streamType}]`
    );

    if (selectedTabLink) {
        const selectedTabLinkParent = selectedTabLink.parentNode;

        if (selectedTabLinkParent) {
            selectedTabLinkParent.classList.add('tabs__tab--selected');
        }
    }
};

const recommendComment = e => {
    const el = e.currentTarget;

    discussionApi.recommendComment(el.getAttribute('data-comment-id'));

    el.classList.add('disc-comment__recommend--active');

    const counters = [
        ...document.getElementsByClassName('js-disc-recommend-count'),
    ];

    counters.forEach(counter => {
        counter.innerHTML = parseInt(counter.innerHTML, 10) + 1;
    });
};

class ActivityStream extends Component {
    constructor(opts) {
        super();

        this.endpoint =
            '/discussion/profile/:userId/:streamType.json?page=:page';
        this.componentClass = 'activity-stream';
        this.defaultOptions = {
            page: 1,
            streamType: 'discussions',
            userId: null,
        };
        this.setOptions(opts);
    }

    ready() {
        this.removeState('loading');
        this.on('click', '.js-disc-recommend-comment', recommendComment);

        const counters = [
            ...document.getElementsByClassName('js-disc-recommend-count'),
        ];

        counters.forEach(counter => {
            counter.classList.addClass('disc-comment__recommend--open');
        });

        window.onpopstate = event => {
            if (supportsPushState) {
                this.applyState(event.state.resp.html, event.state.streamType);
            }
        };

        pagination(this);
    }

    change(opts) {
        this.setOptions(opts);
        return this.fetch();
    }

    fetched(resp) {
        this.applyState(resp.html, this.options.streamType);
        this.updateHistory(resp);
    }

    applyState(html, streamType) {
        // update display
        const $el = bonzo(this.elem).empty();
        this.setState('loading');
        $.create(html).each(el => {
            $el.html($(el).html()).attr({
                class: el.className,
            });
        });
        this.removeState('loading');

        const activeTab = $('.tabs__tab--selected');
        if (activeTab.data('stream-type') !== streamType) {
            selectTab(streamType === 'comments' ? 'discussions' : streamType);
        }

        // update opts
        this.options.streamType = streamType;
    }

    updateHistory(resp) {
        const page = this.options.page;
        const pageParam = getUrlVars().page;
        const streamType =
            this.options.streamType !== 'discussions'
                ? `/${this.options.streamType}`
                : '';
        const qs = `/user/id/${this.options
            .userId}${streamType}?${constructQuery({
            page,
        })}`;
        const state = {
            resp,
            streamType: this.options.streamType,
        };
        const params = {
            querystring: qs,
            state,
        };

        if (typeof pageParam === 'undefined') {
            // If first load and without page param, add it and overwrite history
            replaceQueryString(params);
        } else {
            pushQueryString(params);
        }
    }
}

export { ActivityStream };
