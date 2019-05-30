function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle('active');
}

// dropdown list content supplier
function myFunction(){
   document.getElementById("supplierContent").classList.toggle("show");
}


// search input supplier
function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("supplierInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("supplierContent");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  }

  // dropdown list content customer
function customerFunction(){
    document.getElementById("customerContent").classList.toggle("show");
 }
 
 
 // search input customer
 function filterFunction() {
     var input, filter, ul, li, a, i;
     input = document.getElementById("customerInput");
     filter = input.value.toUpperCase();
     div = document.getElementById("customerContent");
     a = div.getElementsByTagName("a");
     for (i = 0; i < a.length; i++) {
       txtValue = a[i].textContent || a[i].innerText;
       if (txtValue.toUpperCase().indexOf(filter) > -1) {
         a[i].style.display = "";
       } else {
         a[i].style.display = "none";
       }
     }
   }