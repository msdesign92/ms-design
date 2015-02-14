var feat_postTitleOriginal,  feat_myLink, feat_myDiv, feat_myImage,feat_mySeparator;
var    feat_main;
var feat_float_clear=false;
var flag = 0;
function bpfeaturedpostswiththumbnails(json) {

for (var i = 0; i < feat_numberOfPosts; i++) {
if (i == json.feed.entry.length) break;
var s;
    var entry = json.feed.entry[i];
    var postTitle = entry.title.$t;
    feat_postTitleOriginal = postTitle;
    if (isNaN(feat_titleLength) || feat_titleLength == 0) {
        postTitle = '';

    }
    else if (postTitle.length > feat_titleLength) postTitle = postTitle.substring(0, feat_titleLength) + "...";
    var postUrl;
    for (var k = 0; k < entry.link.length; k++) {
        if (entry.link[k].rel == 'replies' && entry.link[k].type == 'text/html') {
            var commentText = entry.link[k].title;
            var commentUrl = entry.link[k].href;
        }
        if (entry.link[k].rel == 'alternate') {
            postUrl = entry.link[k].href;
            break;
        }
    }
    if (feat_showThumbs == true) {
        var thumbUrl = "";
        try {
            thumbUrl = entry.media$thumbnail.url;
            thumbUrl = thumbUrl.replace("/s72-c/","/s"+feat_imgDim+"-c/");
        } catch (error) {
            if ("content" in entry) s = entry.content.$t; else s="";
            if (thumbUrl == "" && feat_mediaThumbsOnly == false) {
                 regex = /http\:\/\/www\.youtube(-nocookie){0,1}\.com\/(v){0,1}(embed){0,1}\/(([^"&?' ]*))/;
                videoIds = s.match(regex);
                if (videoIds != null) {
                    videoId = videoIds[4];
                }
                if (videoIds != null && videoId != null) thumbUrl = "http://img.youtube.com/vi/" + videoId + "/2.jpg"
            }
            if (thumbUrl == "" && feat_mediaThumbsOnly == false) {
                a = s.indexOf("<img");
                b = s.indexOf("src=\"", a);
                c = s.indexOf("\"", b + 5);
                d = s.substr(b + 5, c - b - 5);
                if ((a != -1) && (b != -1) && (c != -1) && (d != "")) thumbUrl = d;
 
            }

        }
if(thumbUrl.indexOf("static.flickr.com")!=-1) {thumbUrl= thumbUrl.replace("_b_t.jpg","_s.jpg");thumbUrl= thumbUrl.replace("_m_t.jpg","_s.jpg");thumbUrl= thumbUrl.replace("_s_t.jpg","_s.jpg");
thumbUrl= thumbUrl.replace("_b.jpg","_s.jpg");thumbUrl= thumbUrl.replace("_m.jpg","_s.jpg");}
        if (thumbUrl == "" && feat_showNoImage == true) 
        {
        thumbUrl = "http://2.bp.blogspot.com/-erTXCq61ULM/TmHYAQBZ0GI/AAAAAAAACCs/6cBX54Dn6Gs/s72-c/default.png";
        try{if(feat_defaultImage!="") thumbUrl=feat_defaultImage;}catch(error){}
        thumbUrl = thumbUrl.replace("/s72-c/","/s"+feat_imgDim+"-c/");
        }
    } //end ifposthumbs
    if (feat_showPostDate == true) {
        var postdate = entry.published.$t;
        var cdyear = postdate.substring(0, 4);
        var cdmonth = postdate.substring(5, 7);
        var cdday = postdate.substring(8, 10);
        var monthnames = new Array();
        monthnames[1] = "Jan";
        monthnames[2] = "Feb";
        monthnames[3] = "Mar";
        monthnames[4] = "Apr";
        monthnames[5] = "May";
        monthnames[6] = "Jun";
        monthnames[7] = "Jul";
        monthnames[8] = "Aug";
        monthnames[9] = "Sep";
        monthnames[10] = "Oct";
        monthnames[11] = "Nov";
        monthnames[12] = "Dec";
    } //end if date
    code = "";
        feat_main = document.getElementById('bp_featured');
        feat_myDiv = document.createElement('div');
        feat_myDiv.setAttribute("class", "bp_item_title");
        feat_myLink = createLink(postUrl,"_top",feat_postTitleOriginal)
        if(feat_main.innerHTML!=""){
        feat_mySeparator = createDiv("bp_featured_separator");
        feat_main.appendChild(feat_mySeparator)
        }
        if(postTitle != ''){feat_myDiv.appendChild(feat_myLink);}
        feat_main.appendChild(feat_myDiv);if(postTitle != '')feat_myLink.innerHTML = postTitle;





    if (feat_showThumbs == true && thumbUrl != "") {
        feat_myImage = document.createElement('img');
        feat_myImage.setAttribute("src", thumbUrl);
        if(feat_imgFloat!="none")
        {
        feat_float_clear=true;
        feat_myImage.style.cssFloat=feat_imgFloat;
        feat_myImage.style.styleFloat=feat_imgFloat;
        }
      try{if(feat_myMargin!=0)feat_myImage.style.margin = feat_myMargin+"px";} catch(error){}
        feat_myImage.setAttribute("alt", feat_postTitleOriginal);
        feat_myImage.setAttribute("width", feat_imgDim);
        feat_myImage.setAttribute("height", feat_imgDim);
        feat_myLink = document.createElement('a');
        feat_myLink.setAttribute("href", postUrl+"?utm_source=BP_featured");
        //feat_myLink.setAttribute("target", "_top");
        feat_myLink.setAttribute("title", feat_postTitleOriginal);
        feat_myLink.appendChild(feat_myImage);

        feat_myDiv = document.createElement('div');
        feat_myDiv.setAttribute("class", "bp_item_thumb");
        feat_myDiv.appendChild(feat_myLink);
        feat_main.appendChild(feat_myDiv);
    }

 try {
        if ("content" in entry) {
            var postContent = entry.content.$t;
        }
        else if ("summary" in entry) {
            var postContent = entry.summary.$t;
        }
        else var postContent = "";
        var re = /<\S[^>]*>/g;
        postContent = postContent.replace(re, "");


        if (feat_showSummary == true) {
            feat_myDiv = createDiv("bp_item_summary");
                if (postContent.length < feat_summaryLength) {feat_myDiv.appendChild(document.createTextNode(postContent));}
            else {
                postContent = postContent.substring(0, feat_summaryLength);
                var quoteEnd = postContent.lastIndexOf(" ");
                postContent = postContent.substring(0, quoteEnd);
                feat_myDiv.appendChild(document.createTextNode(postContent + '...'));
            }

            feat_main.appendChild(feat_myDiv);
        }
    } //end try
    catch (error) {}
    

    feat_myDiv =  createDiv("bp_item_meta");
    feat_myDiv.style.clear="both";
    feat_myDiv.style.marginBottom="4px";

    
    if (feat_showPostDate == true) {
        feat_myDiv.appendChild(document.createTextNode(monthnames[parseInt(cdmonth, 10)] + '-' + cdday + '-' + cdyear));
        flag = 1;
    }

    if (feat_showCommentCount == true) {
        if (flag == 1) {
            feat_myDiv.appendChild(document.createTextNode(" | ")<br />);
        }
        if (commentText == '1 Comments') commentText = '1 Comment';
        if (commentText == '0 Comments') commentText = 'No Comments';
        var feat_myLink = createLink(commentUrl,"_top",commentText + " on " + feat_postTitleOriginal)
        feat_myDiv.appendChild(feat_myLink);
        feat_myLink.innerHTML=commentText;
        flag = 1;;
    }

    if (feat_showReadMore == true) {
        if (flag == 1) {
            feat_myDiv.appendChild(document.createTextNode(" | "));
        }
        var feat_myLink = createLink(postUrl,"_top",feat_postTitleOriginal)
        feat_myDiv.appendChild(feat_myLink);
        feat_myLink.innerHTML = feat_readMore+" &raquo;";
        flag = 1 ;;
    }



    if (flag == 1) feat_main.appendChild(feat_myDiv);

}//close post loop

if(feat_float_clear==true && feat_imgFloat!="none")
{
feat_myDiv = createDiv("bp_clear_float");
feat_myDiv.style.clear=feat_imgFloat;
feat_main.appendChild(feat_myDiv);
}
document.getElementById("bp_featured_link").style.backgroundImage="url('http://3.bp.blogspot.com/-H8WPIh3wjr4/TmHnuo9tnnI/AAAAAAAACDE/_yuVqfb1HAk/blogger-widgets.png')";
document.getElementById("bp_featured_link").style.backgroundRepeat="no-repeat";
try{
if(feat_myMargin!=0 && feat_imgFloat=="left" && flag==0) document.getElementById("bp_featured_link").style.marginLeft = feat_myMargin+"px";
} catch(error){}
}


function createDiv(className)
{
var feat_myDiv = document.createElement('div');
feat_myDiv.setAttribute("class", className);
return feat_myDiv;
}


function createLink(href,target,title)
{

var feat_myLink = document.createElement('a');
  if(href.substring(href.length-13,href.length)=="#comment-form") {href= href.substring(0,href.length-13)+"?utm_source=BP_featured"+"#comment-form";feat_myLink.setAttribute("href", href);}
        else feat_myLink.setAttribute("href", href+"?utm_source=BP_featured");
        feat_myLink.setAttribute("target", target);
        feat_myLink.setAttribute("title", title);
        return feat_myLink;
}