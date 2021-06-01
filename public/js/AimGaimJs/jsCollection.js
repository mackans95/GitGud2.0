include('./js/AimGaimJs/vector2D.js');
setTimeout(function(){},200);
include('./js/AimGaimJs/aimGaim.js');

function include(file) { 
  
    var script  = document.createElement('script'); 
    script.src  = file; 
    if(file == './js/AimGaimJs/aimGaim.js') {
        script.type = 'module'; 
    }
    else{
        // script.type = 'text/javascript';
        script.type = 'application/x-javascript';
    }
    script.defer = true; 
    
    document.querySelector("#scripts").appendChild(script);
} 