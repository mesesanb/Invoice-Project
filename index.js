


class Product {
    constructor(id, name, type) {
        this.Id = id;
        this.Name = name;
        this.ProductType = type;
    }
}


class Supplier {
    constructor(id, name, cui) {
        this.Id = id;
        this.Name = name;
        this.CUI = cui;
    }
}

class Customer {
    constructor(id, name, cui) {
        this.Id = id;
        this.Name = name;
        this.CUI = cui;
    }
}

class InvoiceItem {
    constructor(id, productId, quantity, price, vat, invoiceId, product) {
        this.Id = id;
        this.ProductId = productId;
        this.Quantity = quantity;
        this.VAT = vat;
        this.Price = price;
        this.InvoiceId = invoiceId;
        this.Product = new Product();

    }
}

class Invoice {
    constructor(id, series, number, date, supplierId, customerId, itemsList) {
        this.Id = id;
        this.Series = series;
        this.Number = number;
        this.Date = date;
        this.SupplierId = supplierId;
        this.CustomerId = customerId;
        //this.ItemsList = itemsList;

    }

}

var apiLink = "http://beta.apexcode.ro/api/";



function getInvoiceDetails(id) { //functia care populeaza pe DOM factura cu un anumit id 
    var idInvoice = id;
    var returnedInvoice = new Invoice();
    var returnedSupplier = new Supplier();
    var returnedCustomer = new Customer();
    var returnedItemsList = [];


    fetch(apiLink + "invoices")

        .then(function (response) {
            return response.json();
        })

        .then(function (invoices) {
            returnedInvoice = searchInvoice(idInvoice, invoices); // returnedInvoice este un obiect in care s-a copiat factura pe care o cautam
        })
        .then(function () { return fetch(apiLink + "suppliers"); })

        .then(function (response) {
            return response.json();
        })

        .then(function (suppliers) { // cautam furnizorul pentru factura returnata de searchInvoices
            returnedSupplier = searchSupplier(returnedInvoice.SupplierId, suppliers);
        })

        .then(function () { return fetch(apiLink + "customers"); })

        .then(function (response) {
            return response.json();
        })

        .then(function (customers) { // cautam clientul pentru factura

            returnedCustomer = searchCustomer(returnedInvoice.CustomerId, customers);
        })

        .then(function () { return fetch(apiLink + "invoices/" + id + "/items"); })

        .then(function (response) {

            return response.json();

        })

        .then(function (items) { //creem un obiect nou cu toate pozitiile de produs din facturas avand ca referinta id-ul facturii

            returnedItemsList = searchItems(returnedInvoice.Id, items);

        })
        .then(function () {
            populateInvoiceDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList); //afisam in DOM factura
        })

        .then(function () { // dupa publicare factura pe DOM, asteptam event (click) pe factura
            getClickDOM();

        })




}

function deleteInvoiceRow(row) { // sterge randul pe care este butonul apasat
    let x = row.parentElement.parentElement;
    deletedRowNumber = parseInt(x.cells[0].innerHTML); // valoarea randului pe care dorim sa il stergem
    document.getElementById("tableBody").deleteRow(deletedRowNumber - 1);
    combTable(); // renumeroteaza randurile
    calcInvoiceTotal(); // recalculeaza totalul in factura


}



function getClickDOM() { //functia care citeste pe care buton este dat click  
    var x = document.getElementsByClassName("btn"); // atasam unei variabile toate obiectele buton

    for (var i = 0; i < x.length; i++) {

        x[i].addEventListener("click", function () {
            var that = this; // preluam butonul apasat

            clickedAction = this.value;

            switch (clickedAction) {
                case "editBtn":
                    editInvoiceRow(that); //este apasat un buton de edit
                    break;
                case "deleteBtn": deleteInvoiceRow(that); //este apasat un buton delete
                    break;
                case "saveInvoice": publishSavedInvoice(); //este apasat butonul save
                    break;

            }

        })
        //that.parentElement.parentElement.cells[2].contentEditable = "false"; // nu mai este editabil campul Quantity
    }

}

function populateInvoiceDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList) {

    document.getElementById("supplierName").innerHTML += returnedSupplier.Name;
    document.getElementById("supplierCUI").innerHTML += returnedSupplier.CUI;
    document.getElementById("supplierID").title = returnedSupplier.Id; // stocam id-ul furnizorului in DOM
    document.getElementById("invoiceSeries").innerHTML = returnedInvoice.Series;
    document.getElementById("invoiceNumber").innerHTML = returnedInvoice.Number;
    document.getElementById("invoiceSeries").title = returnedInvoice.Id; // stocam id-ul facturii in DOM

    invoiceDate = returnedInvoice.Date.substr(0, 10); //extragem doar an/luna/zi
    document.getElementById("invoiceDate").innerHTML = invoiceDate;
    document.getElementById("customerName").innerHTML += returnedCustomer.Name;
    document.getElementById("customerCUI").innerHTML += returnedCustomer.CUI;
    document.getElementById("customerID").title = returnedCustomer.Id;
    var totalValue = 0; // valoarea cu tva insumata  ptr fiecare produs in parte
    var totalValueNoVat = 0; // valoarea fara tva

    for (let i = 0; i < returnedItemsList.length; i++) { //prima populare a DOMului 
        var row = i + 1;//nu incepem numaratoarea randurilor de la 0
        var value = returnedItemsList[i].Price * returnedItemsList[i].Quantity;
        totalValue += value * returnedItemsList[i].VAT;
        totalValueNoVat += value;
        document.getElementById("tableBody").innerHTML += '<tr><th id="invoiceRowNumber_' + row + '_' + returnedItemsList[i].Id + '">' + row + '</th><td title = "' + returnedItemsList[i].Product.ProductType + '"id="product_' + row + '_' + returnedItemsList[i].Product.Id
            + '">' + returnedItemsList[i].Product.Name + '</td><td contenteditable="false">' + returnedItemsList[i].Quantity + '</td><td>' +
            returnedItemsList[i].Price + '</td><td>' + value.toFixed(2) +
            '</td><td>' + returnedItemsList[i].VAT +
            '</td><td><input class = "btn" type="image" value = "editBtn" src="https://img.icons8.com/metro/17/000000/pencil.png" alt="edit button"style="margin-right: 0.5vw;"><input type="image" value = "deleteBtn" class = "btn" src="https://img.icons8.com/metro/17/000000/trash.png" alt="delete button"></td></tr>';

    }

    document.getElementById("tableBody").innerHTML += '<tr><td class="font-weight-bold" colspan="6" align="right" id="totalInvoice">TOTAL VALUE&nbsp;' + totalValueNoVat.toFixed(2) + '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;TOTAL +VAT&nbsp;' + totalValue.toFixed(2) + '</td>'

}



function postRow(returnedItemsList) {

}

function searchSupplier(supplierId, suppliers) { // returneaza furnizorul pentru un id de furnizor din lista de furnizori
    var returnedSupplier = new Supplier();
    for (let i = 0; i < suppliers.length; i++) {
        if (supplierId == suppliers[i].Id) {
            returnedSupplier.Name = suppliers[i].Name;
            returnedSupplier.CUI = suppliers[i].CUI;
            returnedSupplier.Id = suppliers[i].Id;
        }
    }
    return returnedSupplier;
}

function searchInvoice(idInvoice, invoices) { // returneaza factura pentru un id de factura
    var returnedInvoice = new Invoice();
    for (let i = 0; i < invoices.length; i++) {

        if (idInvoice == invoices[i].Id) {
            returnedInvoice.Id = invoices[i].Id;
            returnedInvoice.Date = invoices[i].Date;
            returnedInvoice.Number = invoices[i].Number;
            returnedInvoice.Series = invoices[i].Series;
            returnedInvoice.SupplierId = invoices[i].SupplierId;
            returnedInvoice.CustomerId = invoices[i].CustomerId;

        }
    }
    return returnedInvoice;
}

function searchCustomer(customerId, customers) { //returneaza un client dupa id
    var returnedCustomer = new Customer();
    for (let i = 0; i < customers.length; i++) {
        if (customerId == customers[i].Id) {
            returnedCustomer.Name = customers[i].Name;
            returnedCustomer.Id = customers[i].Id;
            returnedCustomer.CUI = customers[i].CUI;
        }
    }
    return returnedCustomer;
}

function searchItems(invoiceId, items) { //returneaza un array de produse corespunzator facturii cu Id
    var returnedItemsList = [];
    for (let i = 0; i < items.length; i++) {
        if (invoiceId == items[i].InvoiceId) {
            var returnedItem = new InvoiceItem();
            returnedItem.Id = items[i].Id;
            returnedItem.ProductId = items[i].ProductId;
            returnedItem.Quantity = items[i].Quantity;
            returnedItem.Price = items[i].Price;
            returnedItem.VAT = items[i].VAT;
            returnedItem.InvoiceId = items[i].InvoiceId;
            returnedItem.Product.Id = items[i].Product.Id;
            returnedItem.Product.Name = items[i].Product.Name;
            returnedItem.Product.ProductType = items[i].Product.ProductType;

            returnedItemsList.push(returnedItem); // se adauga un obirct Item nou in sirul de obiecte
        }

    }
    return returnedItemsList;
}

function editInvoiceRow(row) { // functia de editare a unui rand
    x = row.parentElement.parentElement;
    quantity = x.cells[2];
    quantity.contentEditable = "true";
    quantity.focus();
    quantity.onkeyup = function () {
        calcInvoiceTotal(); // calculare total invoice
    };



}

// ** O FUNCTIE IN CARE SA RENUMEROTAM randurile 
// ** PENTRU SITUATIA IN CARE ADAUGAM UN RAND SAU IL STERGEM
// function cleanTable()

function getItemsFromTable(tableId) { //preia datele pentru factura din DOM - aceste date urmeaza sa fie transmise catre API

    var table = document.getElementById(tableId);
    var rows = table.getElementsByTagName("th");
    var invoiceItemsList = [];


    for (let i = 0; i < rows.length; i++) {
        var invoiceItemData = new InvoiceItem();
        invoiceItemData.Id = rows[i].parentElement.childNodes[0].id.split("_", 3)[2];
        invoiceItemData.InvoiceId = parseInt(document.getElementById("invoiceSeries").title);
        invoiceItemData.ProductId = invoiceItemData.Id;
        invoiceItemData.Quantity = parseFloat(rows[i].parentElement.childNodes[2].innerText);
        invoiceItemData.Price = parseFloat(rows[i].parentElement.childNodes[3].innerText);
        invoiceItemData.VAT = parseFloat(rows[i].parentElement.childNodes[5].innerText);
        invoiceItemData.Product.Id = rows[i].parentElement.childNodes[1].id.split("_", 3)[2]
        invoiceItemData.Product.Name = rows[i].parentElement.childNodes[1].innerText;
        invoiceItemData.Product.ProductType = rows[i].parentElement.childNodes[1].title;
        invoiceItemsList.push(invoiceItemData);


    }
    return invoiceItemsList;
}

function publishSavedInvoice() { // luam datele din invoice si populam API
    var invoiceData = new Invoice();
    var customerData = new Customer();
    var supplierData = new Supplier();
    var invoiceItemsList = [];
    invoiceData.Id = parseInt(document.getElementById("invoiceSeries").title);
    invoiceData.Series = document.getElementById("invoiceSeries").innerText;
    invoiceData.Number = parseInt(document.getElementById("invoiceNumber").innerText);

    ////////////data generarii facturii  //////////////
    let publishDate = new Date();
    let year = publishDate.getFullYear().toString();
    let month1 = publishDate.getMonth() + 1; // lunile incep de la 0
    month1 < 10 ? month = "0" + month1 : month = month1;  // adaugam un 0 in fata lunii daca luna e mai mica decat 10

    let day1 = publishDate.getDay().toString();
    day1 < 10 ? day = "0" + day1 : day = day1; // adaugam un 0 in fata zilei daca ziua e mai mica decat 10
    let hour = publishDate.getHours().toString();
    let minute = publishDate.getMinutes().toString();
    let second = publishDate.getSeconds().toString();
    let invoiceDateToBeReturned = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;

    ////////////data generarii facturii  //////////////

    invoiceData.Date = invoiceDateToBeReturned;
    invoiceData.SupplierId = parseInt(document.getElementById("supplierID").title);
    invoiceData.CustomerId = parseInt(document.getElementById("customerID").title);
    console.log(invoiceData);

    customerData.Id = invoiceData.CustomerId;
    customerData.Name = document.getElementById("customerName").innerText;
    customerData.CUI = parseInt(document.getElementById("customerCUI").innerText);

    supplierData.Id = invoiceData.SupplierId;
    supplierData.Name = document.getElementById("supplierName").innerText;
    supplierData.CUI = parseInt(document.getElementById("supplierCUI").innerText);
    tableBody = "tableBody"
    invoiceItemsList = getItemsFromTable(tableBody);

    putEditedInvoiceAPI(invoiceData); //punem in apiLink + "invoices"  datele

}
//******************************************* */
function putEditedInvoiceAPI(invoice) { // pune in API factura editata

    console.log(invoice);
    fetch (apiLink+"invoices"){

    }
    fetch(apiLink + "invoices/" + invoice.Id, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoice)
    })
        .then(function (response) {
            console.log(response.statusText);
        });
  


}

function invoiceDate(e) { //returneaza data in care este facuta editarea conf stringului din API


}

function combTable() { // renumeroteaza randurile tabelului 
    var table = document.getElementById("tableBody");
    var rows = table.getElementsByTagName("th");
    searchedRowNumber = "invoiceRowNumber_";
    searchedProduct = "product_";

    for (let i = 0; i < rows.length; i++) {
        newRow = i + 1;
        invoiceRowNumberID = rows[i].parentElement.childNodes[0].id; //id-ul invoiceRowNumber alcatuit din id="invoiceRowNumber_' + row + '_' + returnedItemsList[i].Id
        rows[i].parentElement.childNodes[0].innerHTML = newRow; // se renumeroteaza randul daca este sters

        searchedRowNumber += newRow + "_" + invoiceRowNumberID.split("_")[2]; // in ID-ul randului am pastrat valoarea de id a produsului, dar am schimbat numarul randului
        rows[i].parentElement.childNodes[0].id = searchedRowNumber;  //pastram un id unic rand+ id-ul produsului din itemslist                                                                     // ne va folosi atunci cand publicam o factura noua

        searchedProductId = rows[i].parentElement.childNodes[1].id;
        searchedProduct += newRow + "_" + searchedProductId.split("_")[2];

        rows[i].parentElement.childNodes[1].id = searchedProduct;

    }
}

function calcInvoiceTotal() { //calculeaza totalul facturii

    var invoiceTotal = 0;
    var invoiceTotalNoVat = 0;

    var table = document.getElementById("tableBody");
    var rows = table.getElementsByTagName("th");

    for (let i = 0; i < rows.length; i++) {

        let itemPrice = parseFloat(rows[i].parentElement.childNodes[3].innerHTML); //pretul 

        let itemQuantity = parseFloat(rows[i].parentElement.childNodes[2].innerHTML); // cantitatea
        let itemVat = parseFloat(rows[i].parentElement.childNodes[5].innerHTML); // TVA
        let itemValue = itemPrice * itemQuantity;

        if (Number.isNaN(itemValue)) { // daca nu este introdus un numar, punem valoarea pe 0
            rows[i].parentElement.childNodes[4].innerHTML = 0; //valoare
        }
        else {
            rows[i].parentElement.childNodes[4].innerHTML = itemValue.toFixed(2); //valoare

        }


        invoiceTotal += itemPrice * itemQuantity * itemVat;
        invoiceTotalNoVat += itemPrice * itemQuantity;

    }
    if (isNaN(invoiceTotal)) { }
    else {
        let totalInvoiceHTML = "TOTAL VALUE&nbsp; " + invoiceTotalNoVat.toFixed(2) + " &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;TOTAL +VAT&nbsp; " + invoiceTotal.toFixed(2);
        document.getElementById("totalInvoice").innerHTML = totalInvoiceHTML;
        console.log("invoiceTotal", invoiceTotal);
    }

}

getInvoiceDetails(2);


