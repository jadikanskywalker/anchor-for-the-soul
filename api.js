var api = {
    sizeCards: function(set) {
        let cards = $(set + ' .card');
        let cardWords = $(set + ' .card-words');
        let maxHeight = -1;
        cardWords.each(function() {
            if ($(this).height('auto').height() > maxHeight) {
                maxHeight = $(this).height();
            }
        });
        $(set + ' .card-words').height(maxHeight);
        $(set + ' .card-explore').height($(set + ' .card:first-of-type').height());
        let card = 0;
        var showBlogs = setInterval(function() {
            console.log(card);
            if (card < 4) {
                cards.eq(card).css('opacity', '1');
                card++;
                console.log(card);
            } else {
                clearInterval(showBlogs);
            }
        }, 50);
    },
    latestBlogs: function(num) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                limitToLast: num
            },
            success: function(data, status, jqXHR) {
                console.log(data);
                let cards = $('#latestBlogs .card').slice(0, 3);
                let key = 3;
                $('#loadingBlogs').hide();
                cards.each(function() {
                    let blog = data[key];
                    $(this).find('.card-title').text(blog.title);
                    $(this).find('.card-text').text(blog.description);
                    $(this).find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    $(this).find('.btn').attr('href', 'blogPost.html?id=' + key);
                    key--;
                });
                api.sizeCards('#latestBlogs');
            }
        });
    },
    latestPodcasts: function(num) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
            data: {
                orderBy: '"$key"',
                limitToLast: num
            },
            success: function(data, status, jqXHR) {
                console.log(data);
                let cards = $('#latestPodcasts .card').slice(0, 3);
                let key = 3;
                $('#loadingPodcasts').hide();
                cards.each(function() {
                    let blog = data[key];
                    $(this).find('.card-title').text(blog.title);
                    $(this).find('.card-text').text(blog.description);
                    $(this).find('.card-date').text(new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
                    $(this).find('.btn').attr('href', 'podcastEpisode.html?id=' + key);
                    key--;
                });
                api.sizeCards('#latestPodcasts');
            }
        });
    },
    blogPost: function(iframe, id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/blogs.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                console.log(data);
                $('.blog-title').text(data[id].title);
                $('.blog-description').text(data[id].description);
                $('.blog-date').text(new Date(data[id].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
            }
        });
    },
    podcastEpisode: function(iframe, id) {
        $.ajax({
            url: 'https://anchor-for-the-soul.firebaseio.com/podcasts.json',
            data: {
                orderBy: '"$key"',
                equalTo: '"' + id + '"'
            }, success: function(data, status, jqXHR) {
                console.log(data);
                $('.podcast-title').text(data[id].title);
                $('.podcast-description').text(data[id].description);
                $('.podcast-details').css('opacity', 1);
                $(iframe).attr('src', data[id].url);
            }
        });
    }
}

