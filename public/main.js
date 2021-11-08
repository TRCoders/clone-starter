let postComments = document.getElementsByClassName("commentsByUsers");
let postLikeButton = document.getElementsByClassName("postLikeButton");

Array.from(postLikeButton).forEach(function(element) {
      element.addEventListener('click', function(e){
        const postLikeButton = parseInt(this.parentNode.parentNode.childNodes[6].innerText)
        const postUserId = e.target.dataset.id

        fetch('feed', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'postUserId': postUserId,
            'postLikeButton': postLikeButton,
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(postComments).forEach(function(element) {
      element.addEventListener('click', function(e){
        const commentsFromUser = this.parentNode.childNodes[8].childNodes[3].value
        const postCommentId = e.target.dataset.postCommentId

        fetch('usercomments', {
          method: 'put',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'postCommentId': postCommentId,
            'commentsFromUser': commentsFromUser
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
