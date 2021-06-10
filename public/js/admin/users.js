let modalBg = document.querySelector('.modal-bg');
let modalClose = document.querySelector('.modal-close')
const updateForm = document.querySelector('.update-form');

let limit = 10;
let skip = 0;
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');

modalClose.addEventListener("click", function(){
  modalBg.classList.remove('bg-active')
});



fetch('http://localhost:3000/admin/GetUsers?limit=10&skip=0', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-type': 'application/json; charset=UTF-8',
  },
}).then(response => response.json())
  .then(data => {
    showLeaderboards(data)
  })

const userArray = [];

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
  globalHighscores.forEach(user => {
    let tr = template.content.cloneNode(true);

    let tdUsername = tr.querySelector("td.username");
    let tdAdmin = tr.querySelector("td.admin");

    tdUsername.setAttribute('id', user._id)

    tdUsername.textContent = user.username;
    tdAdmin.textContent = user.isAdmin;

    tbodyGlobal.appendChild(tr);

    userArray.push(user)
  })

  // adding event on deletebutton 
  const deleteBtn = document.querySelectorAll('.delete-button');

  deleteBtn.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      deleteUser(btn.parentNode.parentNode.cells[0].id);
      // console.log(btn.parentNode.parentNode.cells[0].id);
    })
  })

  // adding event on patchbutton
  const patchBtn = document.querySelectorAll('.patch-button')


  // let modalBtn = document.querySelectorAll('.modal-btn');

  // modalBtn.forEach(btn => {
  //   btn.addEventListener("click", function(){
  //     // modalBg.classList.add('bg-active')
  //   })
  // })

  patchBtn.forEach(btn =>{
    btn.addEventListener("click", ()=>{
      // modalBg.classList.add('bg-active')
      patchUser(btn.parentNode.parentNode.cells[0].id);
    })
  })
  //END Global leaderboard
}

const deleteUser = function(id) {
  result = window.confirm('Are you sure you want to delete this Highscore?')

  if(result){
    fetch('http://localhost:3000/admin/deleteUser', {
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





const patchUser = function(id) {
  let user = userArray.find(x => x._id === id)

  document.querySelector('#usernameFormId').defaultValue = user.username;
  document.querySelector('#passwordFormId').defaultValue = user.password;
  if(user.isAdmin === true){
    document.querySelector('#isAdminFormId').checked = true;
  }
  // shows modal
  modalBg.classList.add('bg-active')

  updateForm.addEventListener("submit", function(e){
    e.preventDefault();
    
    // update user with new values
    user.username = document.querySelector('#usernameFormId').value;
    user.password = document.querySelector('#passwordFormId').value;
    user.isAdmin = document.querySelector('#isAdminFormId').checked;

    // make the patch request
    fetch('http://localhost:3000/admin/updateUser', {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      id: id,
      username: user.username,
      password: user.password,
      isAdmin: user.isAdmin,
    })
    }).then(response => response.json())
      .then(data => console.log(data))

  location.reload();
  })
}











const nextPage = function() {

  skip = skip + 10;

  fetch(`http://localhost:3000/admin/GetUsers?limit=${limit}&skip=${skip}`, {
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

  fetch(`http://localhost:3000/admin/GetUsers?limit=${limit}&skip=${skip}`, {
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