var $seen = [];
var $count = 0;

function followLink(query){
  $.getJSON(`https://en.wikipedia.org/w/api.php?action=parse&page=${query}&prop=text&origin=*&format=json`, function(data){
    //Place Hop Into List
    var list = $(".hop-list");
    if (query) {
      list.append($(`<li class="list-item">${query}</li>`));
    }

    if (data.error) {
      alert("That query does not work");
    } else {
      //Get content and clean images to avoid GET calls
      var content = Object.values(data.parse.text)[0].replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {return "<img no_load_src=\"" +capture+ "\" />";});

      let firstA;

      //Select first paragraph
      var firstP = $('p', content);
      if (firstP.text() === "Redirect to:"){
        //Handles redirection
        firstA = $('a', content);
      } else {
        //Select first link that works
        var i = 0;
        var allA = $('a', firstP);

        firstA = allA.eq(i);
        while (!linkWorks(firstA)) {
          i += 1;
          firstA = allA.eq(i);
          if (i > allA.length) {

            firstA = allA.eq(0);
            break;
          }
        }
      }

      var nextLink = $(firstA).attr("title");

      if (!$seen.includes(nextLink)) {
        if (nextLink === "Philosophy") {
          list.append($(`<li class="list-item">Philosophy</li>`));
          list.append($(`<li class="list-item red">Reached Philosophy!</li>`));
        } else {
          $seen.push(nextLink);
          $count += 1;
          $('h2').text(`Hops: ${$count}`);
          followLink(nextLink);
        }
      } else {
        list.append($(`<li class="list-item red">STOPPED DUE TO LOOP (${nextLink})</li>`));
      }
    }
  });
}

function linkWorks(a){
  if (!a ||
    !$(a).attr('href') ||
    $(a).attr("title") === "Definition" ||
    !$(a).attr("title")) {
    return false;
  }
  var url = $(a).attr('href');
  //Check if its not a meta page, not from wikitionary, and is a wiki
  var aWorks = url.indexOf('Help:') === -1 &&
    url.indexOf('File:') === -1 &&
    url.indexOf('Wikipedia:') === -1 &&
    url.indexOf('wiktionary.org/') === -1 &&
    url.indexOf('/wiki/') !== -1;
    if (aWorks) {
    //Check if the link is between parenthesis
    var contentHtml = $(a).closest('p').length > 0 ? $(a).closest('p').html() : '';
    if (contentHtml !== '') {
      var linkHtml = 'href="' + url + '"';
      var contentBeforeA = contentHtml.split(linkHtml)[0];
      var openParenCount = contentBeforeA.split('(').length - 1;
      var closeParenCount = contentBeforeA.split(')').length - 1;
      aWorks = openParenCount <= closeParenCount;
    }
  }

  if (aWorks) {
    // Check that the link is not in italic by selecting <i> parents
    aWorks = $(a).parents('i').length === 0;
  }

  return aWorks;
}

$("#button-input").click(()=>{
  $(".list-item").remove();
  $seen = [];
  $count = 0;
  $('h2').text(`Hops: ${$count}`);
  var query = $('#text-input').val();
  followLink(query);
  $('h2').show();
});
