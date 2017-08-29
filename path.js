var q = "Greece";
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

    //Select first link
    var firstA = $('a', firstP)[0];
    var nextLink = $(firstA).attr("title");
    if (!seen.includes(nextLink)) {
      if (nextLink === "Philosophy") {
        list.append($(`<li>Reached Philosophy!</li>`));
      } else {
        seen.push(nextLink);
        count += 1;
        console.log(seen);
        followLink(nextLink);
      }
    } else {
      list.append($(`<li>STOPPED DUE TO LOOP</li>`));
    }

  });
}

followLink(q);
