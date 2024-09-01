/**
 * @copyright syedasifshah 2023
 */

'use strict';


document.addEventListener('DOMContentLoaded', function () {
    const passwordShowbtn = document.querySelector("[data-show-password]");
    const passwordInput = document.getElementById('password-input');
    const submitPasswordBtn = document.getElementById('submit-password');
    const errorMessage = document.getElementById('error-message');
    const contentContainer = document.getElementById('content-container');
    const passwordContainer = document.getElementById('password-container');
    const promptMessage = document.getElementById('prompt-message');

    const storedPassword = localStorage.getItem('pagePassword');

    passwordShowbtn.addEventListener("click", function () { 
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            passwordShowbtn.innerHTML = "visibility_off";
        } else {
            passwordInput.type = "password";
            passwordShowbtn.innerHTML = "visibility";
        }
    });

    if (storedPassword === null) {
        // No password is set, prompt the user to create one
        promptMessage.textContent = "Create a password for this page:";
        submitPasswordBtn.addEventListener('click', function () {
            const newPassword = passwordInput.value;
            if (newPassword) {
                localStorage.setItem('pagePassword', newPassword);
                alert("Password has been set! Please remember your password.");
                window.location.reload(); // Reload the page to require the password
            } else {
                errorMessage.textContent = "Password cannot be empty!";
            }
        });
    } else {
        // Password is already set, prompt the user to enter it
        promptMessage.textContent = "Enter the password to access this page:";
        submitPasswordBtn.addEventListener('click', function () {
            const enteredPassword = passwordInput.value;
            if (enteredPassword === storedPassword) {
                passwordContainer.style.display = 'none';
                contentContainer.style.display = 'block';
            } else {
                errorMessage.textContent = "Incorrect password. Please try again.";
            }
        });
    }
});



/**
 * Module Import
 */

import {
    addEventOnElements,
    getGreetingMsg,
    activeNotebook,
    makeElemEditable
} from "./utils.js";
import { Tooltip } from "./components/Tooltip.js"; 
import { db } from "./db.js";    
import { client } from "./client.js";
import { NoteModal } from "./components/Modal.js";

/**
 * Toggle Sidebar in Small Screen
 */

const /** {HTMLElement} */ $sidebar = document.querySelector('[data-sidebar]');
const /** {Array<HTMLElement} */ $sidebarTogglers = document.querySelectorAll('[data-sidebar-toggler]');
const /** {HTMLElement} */ $overlay = document.querySelector('[data-sidebar-overlay]');

addEventOnElements($sidebarTogglers, 'click', function() {
    $sidebar.classList.toggle('active');
    $overlay.classList.toggle('active');
});


/**
 * Initialize tooltip behavior for all DOM elements with 'data-tooltip' attribute.
 */

const /** {Array<HTMLElement} */ $tooltipElems = document.querySelectorAll('[data-tooltip]');
$tooltipElems.forEach($elem => Tooltip($elem));


/**
 * Show greeting message on homepage
 */

const /** {HTMLElement} */ $greenElem = document.querySelector('[data-greeting]');
const /** {number} */ $currentHour = new Date().getHours();
$greenElem.textContent = getGreetingMsg($currentHour);

const /** {HTMLElement} */ $currentDateElem = document.querySelector('[data-current-date]');
$currentDateElem.textContent = new Date().toDateString().replace(' ', ', ');

/**
 * Notebook create field
 */

const /** {HTMLElement} */ $sidebarList = document.querySelector('[data-sidebar-list]');
const /** {HTMLElement} */ $addNotebookBtn = document.querySelector('[data-add-notebook]');

/**
 * Shows a notebook creation field in the sidebar when the "Add Notebook" button is checked
 * The function dynamically adds a new notebook field element, makes it editible, and listen for
 * The 'Enter' key to create a new notebook when pressed.
 */

const showNotebookField = function () {
    const /** {HTMLElement} */ $navItem = document.createElement("div");
    $navItem.classList.add('nav-item');

    $navItem.innerHTML = `
        <span class="text text-label-large" data-notebook-field></span>

        <div class="state-layer"></div>
    `;

    $sidebarList.appendChild($navItem);

    const /** {HTMLElement} */ $navItemField = $navItem.querySelector('[data-notebook-field]');

    // Active new created notebook and deactive the last one.
    activeNotebook.call($navItem);

    // Make notebook field content editable and focus
    makeElemEditable($navItemField);

    // When User pressed 'Enter' them create notebook
    $navItemField.addEventListener("keydown", createNotebook);

}

$addNotebookBtn.addEventListener("click", showNotebookField);


/**
 * Create new notebook
 * Creates a new notebook when the 'Enter' key is pressed while editing a notebook a name field.
 * The new notebook is stored in the database.
 *  
 * @param {KeyboardEvent} event - The keyboard event that triggered notebook creation.
 */


const createNotebook = function (event) {

    if (event.key === 'Enter') {
        
        // stored new created notebook in database
        const /** {Object} */ notebookData = db.post.notebook(this.textContent || 'Untitled') // this: $navItemField
        this.parentElement.remove();

        // Render Nav item
        // client.notebook.create(notebookData);
        client.notebook.create(notebookData);

    }

}



/**
 * Render tht existing notebook list by retriving data from the database and passing it to the client
 */

const renderExistedNotebook = function () {
    const /** {Array} */ notebookList = db.get.notebook();
    client.notebook.read(notebookList);
}

renderExistedNotebook();



/**
 * Create new note
 * 
 * Attaches event listeners to a collection of DOM elements representing "Create note" buttons.
 * When a button is clicked, it opens a modal for creating a new note and handles the submission 
 * of the the new note to the daatbase and client.  
 */


const /** {ArrayHTMLElement} */ $noteCreateBtns = document.querySelectorAll("[data-note-create-btn]");

addEventOnElements($noteCreateBtns, "click", function () { 
    // Create and open a new modal. 
    const /** {Object} */ modal = NoteModal();
    modal.open();

    /**
     * Handle the submission of the new note to the database and client. 
     */
    modal.onSubmit(noteObj => {
        const /** {String} */ activeNotebookId = document.querySelector("[data-notebook].active").dataset.notebook;
        
        const /** {Object} */ noteData = db.post.note(activeNotebookId, noteObj);
        client.note.create(noteData);
        modal.close();
    })

});


/**
 * Renders existing notes in the active notebook. retrives note data from the database based on the active notebook's ID 
 * and uses the client to display the notes.  
 */

const renderExistedNote = function () {
    const /** {String | undefined} */ activeNotebookId = document.querySelector("[data-notebook].active")?.dataset.notebook;

    if (activeNotebookId) {
        const /** {Array<Object>} */ noteList = db.get.note(activeNotebookId);

        client.note.read(noteList);
    }
}

renderExistedNote();