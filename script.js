let addBtn = document.querySelector(".add-btn"); // select add button
let removeBtn = document.querySelector(".remove-btn"); // select remove button 

let modalCont = document.querySelector(".modal-cont"); // select modal container
let mainCont = document.querySelector(".main-cont"); // select main container

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
// this is the default color used in modal, with this variable we can change the color

let modalPriorityColor = colors[colors.length - 1]; // black
let allPriorityColors = document.querySelectorAll(".priority-color");// select all colors which are in modal

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let taskAreaCont = document.querySelector(".textarea-cont"); // select task Area
// select all the colors that are inside tool-bar
let toolBoxColors = document.querySelectorAll(".color");
let ticketsArr = []; // which will store all the tickets as objects

//let deleteElements = []

//Filter tickets with respect to colors

// when we reopen the window and some tickets are already there then get all tickets from local Storage and show them
if (localStorage.getItem('tickets')) {
    ticketsArr = JSON.parse(localStorage.getItem('tickets'))
    ticketsArr.forEach(function (ticket) {
        createTicket(ticket.ticketColor, ticket.ticketTask, ticket.ticketID)
    })
}

// here we implementing the color functionality, when we click on particular color it should display
// only that tickets that have the same color 
// (example => if we click on black color on toolBar it should show all the black color tickets)
for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", function (e) {
        let currentToolBoxColor = toolBoxColors[i].classList[0]; // gives the curr color that was clicked
        //console.log(currentToolBoxColor)

        // filter function returns the arr of tickets that matches with the --------------->(current-tool-box-color)
        let filteredTickets = ticketsArr.filter(function (ticketObj) {
            return currentToolBoxColor === ticketObj.ticketColor;
        });

        // remove previous Tickets so that we can only show the tickets that matches with ------>(current-tool-box-color)
        let allTickets = document.querySelectorAll(".ticket-cont");

        for (let i = 0; i < allTickets.length; i++) {
            allTickets[i].remove();
        }
        // Now show only the filtered tickets 
        filteredTickets.forEach(function (filteredObj) {
            createTicket(
                filteredObj.ticketColor,
                filteredObj.ticketTask,
                filteredObj.ticketID
            );
        });
    });

    toolBoxColors[i].addEventListener('dblclick', function (e) {
        let allTickets = document.querySelectorAll(".ticket-cont");

        for (let i = 0; i < allTickets.length; i++) {
            allTickets[i].remove();
        }

        ticketsArr.forEach(function (ticketObj) {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID)

        })
    })
}

// loop through all the colors and listen click event
allPriorityColors.forEach((color, idx) => {

    color.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColor, idx) => {
            priorityColor.classList.remove("border");
        })
        color.classList.add("border");
        modalPriorityColor = color.classList[0];
    })
});

// when add button is clicked show the modal container to write task
addBtn.addEventListener("click", () => {
    // display modal and then generate ticket
    // addFlag , true - Modal Display
    //addFlag , false - Modal Hide 
    addFlag = !addFlag;

    if (addFlag == true) {
        modalCont.style.display = "flex";
    } else {
        modalCont.style.display = "none";
    }
});

// when we click on removeBtn remove functionality get activate and then we can remove the existing tickets
// by clicking on them and for deactivating remove func. we have to click on the remove btn again
removeBtn.addEventListener("click", () => {
    // toggle the removeFlag so that once we click on this remove functionality should activate when we click again
    // remove functionality should be deactivate 
    removeFlag = !removeFlag;
    if (removeFlag == true) {
        removeBtn.style.color = "red";
    } else {
        removeBtn.style.color = "white";
    }
});

// When we press (shift) after writing inside modal container it will generate ticket
modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    // console.log(e);
    // when we pressed shift key it will generate ticket
    if (key === 'Shift') {
        createTicket(modalPriorityColor, taskAreaCont.value);
        // after generating the ticket we have to make taskArea-container empty
        taskAreaCont.value = "";
        // also we have to hide the modal container
        modalCont.style.display = "none";
        // why we make it false bcoz when next time user click on add button we have to show modal again and
        //  modal will show if addFlag value is false (addBtn makes true then it will show modal)
        addFlag = false;
    }
});

// This function creates a ticket and append it into main container or inside body
function createTicket(ticketColor, ticketTask, ticketID) {

    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");

    ticketCont.innerHTML = ` 
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
      <i class="fa-solid fa-lock"></i>
    </div>`;

    mainCont.appendChild(ticketCont);
    // call the remove function it will only remove the ticket if remove functionality activated
    handleRemoval(ticketCont, id);
    // used to change the lock unlock functionality
    handleLock(ticketCont, id);
    // used to change the color of ticket
    handleColor(ticketCont, id);

    // if the ticket with this id does not present then add it to ticket arr and then add arr into localStorage
    if (!ticketID) {
        ticketsArr.push({ ticketColor, ticketTask, ticketID: id });
        localStorage.setItem('tickets', JSON.stringify(ticketsArr))
    }
}


// Remove Tickets Function
function handleRemoval(ticket, id) {
    ticket.addEventListener("click", function () {
        if (!removeFlag) return
        let idx = getTicketIdx(id) // idx

        // localStorgae removal of ticket (removes the ticket with this id)
        let deletedElement = ticketsArr.splice(idx, 1)

        //deleteElements.push(deletedElement)
        let strTicketArray = JSON.stringify(ticketsArr)
        localStorage.setItem('tickets', strTicketArray)
        ticket.remove(); // ui removal
    });
}

function handleLock(ticket) {
    // it gives us the ticket-lock container 
    let ticketLockEle = ticket.querySelector(".ticket-lock");
    // from ticket lock we have to select the first child
    let ticketLock = ticketLockEle.children[0];
    // select the task-area so that we can provide the update / (edit) functionality on the ticket
    let ticketTaskArea = ticket.querySelector(".task-area");

    ticketLock.addEventListener('click', (e) => {
        let ticketIdx = getTicketIdx(id);
        // when we click on lock and if it is locked we have to unlock it
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else {
            // otherwise we have to lock it
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem('tickets', JSON.stringify(ticketsArr));
    });

}

function handleColor(ticket) {
    let ticketColor = document.querySelector(".ticket-color");
    ticketColor.addEventListener('click', () => {
        // get the current tickets color
        let currentTicketColor = ticketColor.classList[1];
        let ticketIdx = getTicketIdx(id);
        // get ticket-color-idx in colors array so that we can change the color to next color
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        });
        currentTicketColorIdx++;

        // get the new ticket color idx
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];

        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // modify with new color
        ticketsArr[ticketIdx].ticketColor = newTicketColor
        localStorage.setItem('tickets', JSON.stringify(ticketsArr))
    });

}
function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex(function (ticketObj) {
        return ticketObj.ticketID === id
    });

    return ticketIdx;
}