let limit = 10;
let skip = 0;
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');

let gameNameQuery = "unset";

// let url = `http://localhost:3000/admin/GetHighscores?limit=${limit}&skip=${skip}`
// if(gameNameQuery !== "unset"){
//   url = `http://localhost:3000/admin/GetHighscores?limit=${limit}&skip=${skip}&GameName=${gameNameQuery}`
// }



fetch('http://localhost:3000/admin/GetHighscores?limit=10&skip=0', {
method: 'GET',
headers: {
  'Accept': 'application/json',
  'Content-type': 'application/json; charset=UTF-8',
},
}).then(response => response.json())
.then(data => {
  showLeaderboards(data)
})


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



const nextPage = function() {


  skip = skip + 10;

  let url2 = `http://localhost:3000/admin/GetHighscores?limit=${limit}&skip=${skip}`
  // if(gameNameQuery !== "unset"){
  //   url = `http://localhost:3000/admin/GetHighscores?limit=${limit}&skip=${skip}&GameName=${gameNameQuery}`
  // }

  fetch(url2, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-type': 'application/json; charset=UTF-8',
  },
}).then(response => response.json())
  .then(data => {
    if(data.length > 0){
      // om det kommer tbx data så ta bort den gamla o ladda ny, annars "resetta" skip i else
      clearTable();
      showLeaderboards(data)
    }else{
      skip = skip-10;
    }
  })
}

const prevPage = function() {

  skip = skip - 10;

  fetch(`http://localhost:3000/admin/GetHighscores?limit=${limit}&skip=${skip}`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-type': 'application/json; charset=UTF-8',
  },
}).then(response => {
  // om det response är ok dvs att det kommer tbx data så gå vidare, annars "resetta" skip i else
  if(response.ok) {
    return response.json()
  }else{
    skip = skip + 10;
  }
})
.then(data => {
  // om det kommer tbx data så ta bort den gamla o ladda ny, annars gör ingetting
    if(data && data.length > 0){
      clearTable();
      showLeaderboards(data)
    }
  })
}

function clearTable(){
  let loadedItems = document.querySelectorAll('.loadedItems');
  loadedItems.forEach((item)=>{
    item.innerHTML = ''
  })
}

nextBtn.addEventListener(('click'), nextPage)
prevBtn.addEventListener(('click'), prevPage)