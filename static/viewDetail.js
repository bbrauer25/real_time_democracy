$(document).ready(function() {
    $("#upvote_image").click(function(){
      //post upvote to server
      var issue_id = $("#issue_id").val();
      $.post("sendUpvote", {issue_id: issue_id}, function(result){
        //set value of upvotes based on return
        $("#upvotes_value").html(result);
      });
    });
 });