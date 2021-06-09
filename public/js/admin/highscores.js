fetch('http://localhost:3000/admin/Leaderboards', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-type': 'application/json; charset=UTF-8',
  },
}).then(response => response.json())
  .then(data => {
    showLeaderboards(data)
  })

// const highScoreArray = [];

function showLeaderboards(globalHighscores){

  const tbodyGlobal = document.querySelector(".global tbody");
  const template = document.querySelector("#highscore-row");

  if(!globalHighscores){
    return;
  }
  //Global leaderboard
  //change sort() if lower hs is better than higher
  // globalHighscores.sort((a, b) => {return a.score - b.score;});
  // const topFive = globalHighscores.slice(0,5);
  globalHighscores.forEach(highscore => {
    let tr = template.content.cloneNode(true);

    let tdName = tr.querySelector("td.name");
    let tdScore = tr.querySelector("td.score");
    let tdDate = tr.querySelector("td.date");
    let tdGame = tr.querySelector("td.game");

    tdName.setAttribute('id', highscore._id)

    tdName.textContent = highscore.username;
    tdScore.textContent = highscore.score;
    tdDate.textContent = highscore.date.substring(2,16).replace('T', ' ');
    tdGame.textContent = highscore.gamename;

    tbodyGlobal.appendChild(tr);

    // highScoreArray.push(highscore)
  })

  const deleteBtn = document.querySelectorAll('.delete-button');

  deleteBtn.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      deleteHighscore(btn.parentNode.parentNode.cells[0].id)
    })
  })
  
  //END Global leaderboard
}

const deleteHighscore = function(id) {
  result = window.confirm('Are you sure you want to delete this Highscore?')

  if(result){
    fetch('http://localhost:3000/admin/deleteHighscore', {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      id: id
  })
  }).then(response => response.json())
    .then(data => console.log(data))

  location.reload();
  }
};

