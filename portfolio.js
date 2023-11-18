document.addEventListener("DOMContentLoaded", function () {
    // Define your openNav and closeNav functions
    function openNav() {
        document.getElementById("mySidebar").style.width = "100%";
        document.getElementById("main").style.marginLeft = "250px";
        document.getElementById("main").style.opacity = "0";
        document.getElementById("mySidebar").style.opacity = "99.9%";
    }
  
    function closeNav() {
        document.getElementById("mySidebar").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
        document.getElementById("main").style.opacity = "1";
        document.getElementById("mySidebar").style.opacity = "0";
  
    }
  
    // Attached event listeners to the buttons
    document.querySelector(".openbtn").addEventListener("click", openNav);
    document.querySelector(".closebtn").addEventListener("click", closeNav);
  });
  