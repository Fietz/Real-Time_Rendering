{
    if($.browser.msie){
        alert("Please use a Browser!");
        window.location="http://www.chromium.org/";
    }
    var $header = $('header'),
        $nav    = $('nav ul'),
        $footer = $('footer');
    var url     = "http://"+window.location.host+"/~s48790/";

    $.getJSON(url+"cms/cms.json", function(data){
        $header.html(data.header);
        $.each(data.nav,function(key, val){
            val = val.indexOf("http") != -1 ? val :url+ val;
            $nav.append('<li><a href="' + val + '">' + key + '</a></li>');
        })
        $footer.html(data.footer);
    })
   console.log("CMS Script loaded ...")
}(jQuery)
