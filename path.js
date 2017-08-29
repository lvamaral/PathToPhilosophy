var q = "Latin";
var seen = [];
var count = 0;

function followLink(query){
  $.getJSON(`https://en.wikipedia.org/w/api.php?action=parse&page=${query}&prop=text&origin=*&format=json`, function(data){
    //Place Hop Into List
    var list = $(".hop-list");
    list.append($(`<li>${query}</li>`));

    //Get content and clean images to avoid GET calls
    var content = Object.values(data.parse.text)[0].replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {return "<img no_load_src=\"" +capture+ "\" />";});

    //Get first Paragraph
    var firstP = $('p', content)[0];

    //Select first link that works
    var i = 0
    var firstA = $('a', firstP)[i];
    while (!linkWorks(firstA)) {
      i += 1;
      firstA = $('a', firstP)[i];
    }

    var nextLink = $(firstA).attr("title");
    if (!seen.includes(nextLink)) {
      if (nextLink === "Philosophy") {
        list.append($(`<li>Philosophy</li>`));
        list.append($(`<li>Reached Philosophy!</li>`));
      } else {
        seen.push(nextLink);
        count += 1;
        followLink(nextLink);
      }
    } else {
      list.append($(`<li>STOPPED DUE TO LOOP</li>`));
    }

  });
}

function linkWorks(a){
  var url = $(a).attr('href');
  //Check if its not a meta page, not from wikitionary, and is a wiki
  var linkOk = url.indexOf('Help:') === -1 &&
    url.indexOf('File:') === -1 &&
    url.indexOf('Wikipedia:') === -1 &&
    url.indexOf('wiktionary.org/') === -1 &&
    url.indexOf('/wiki/') !== -1;
    if (linkOk) {
    //Check if the link is between parenthesis
    var contentHtml = $(a).closest('p').length > 0 ? $(a).closest('p').html() : '';
    if (contentHtml !== '') {
      var linkHtml = 'href="' + url + '"';
      var contentBeforeLink = contentHtml.split(linkHtml)[0];
      var openParenthesisCount = contentBeforeLink.split('(').length - 1;
      var closeParenthesisCount = contentBeforeLink.split(')').length - 1;
      linkOk = openParenthesisCount <= closeParenthesisCount;
    }
  }

  if (linkOk) {
    // Check that the link is not in italic
    linkOk = $(a).parents('i').length === 0;
  }

  return linkOk;
}

// followLink(q);
