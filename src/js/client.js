/**
 * @copyright syedasifshah 2024
 */

'use strict';


/**
 * Import module
 */

import { NavItem } from "./components/NavItem.js";
import { activeNotebook, findNoteBook } from "./utils.js";
import { Card } from "./components/Card.js";

const /** {HTMLElement} */ $sidebarList = document.querySelector('[data-sidebar-list]');
const /** {HTMLElement} */ $notepaneltitle = document.querySelector("[data-note-panel-title]");
const /** {Array<HTMLeleemnt>} */ $noteCreateBtns = document.querySelectorAll("[data-note-create-btn]");
const /** {HTMLElement} */ $notePanel = document.querySelector("[data-note-panel]");
const /** {String} */ emptyNotesTemplate = `
    <div class="empty-notes">
        <span class="material-symbols-rounded"
        aria-hidden="true">note_stack</span>
    
        <div class="text-headline-small">No notes</div>
    </div>
`;


/**
 * Enabled or disables "Create Note" buttons based on whether there are any notebooks. 
 * 
 * @param {boolean} isThereAnyNotebooks - Indicates whether there are any notebooks. 
 */

const disableNoteCreateBtns = function (isThereAnyNotebooks) {
    $noteCreateBtns.forEach(($item) => { 
        $item[isThereAnyNotebooks ? 'removeAttribute' : "setAttribute"]('disabled', '');
    });
}

/**
 * The client object manages interactions with the user interface (UI) to craete, read, update and delete notebooks and notes,
 * It provides functions for performing these operations and updating the UI accordingly.
 * @namespace
 * @property {Object} notebook - Functions for managing notebooks in the UI.
 * @property {Object} note - Functions for managing notes in the UI.
 */


export const client = {
    
    notebook: {

        /**
         * Creates a anew notebook in the UI, based on provided notebook data.
         * @param {Object} notebookData - Data representing the new notebook 
         */

        create(notebookData) {
            const /** {HTMLElement} */ $navItem = NavItem(notebookData.id, notebookData.name);
            $sidebarList.appendChild($navItem);
            activeNotebook.call($navItem);
            $notepaneltitle.textContent = notebookData.name;
            $notePanel.innerHTML = emptyNotesTemplate;
            disableNoteCreateBtns(true);
        },

        /**
         * Reads and displays a list of notebooks in the UI.
         * 
         * @param {Array<Object>} notebookList - list of notebookData to display
         */

        read(notebookList) {
            disableNoteCreateBtns(notebookList.length);

            notebookList.forEach((notebookData, index) => {
                const /** {HTMLElement} */ $navItem = NavItem(notebookData.id, notebookData.name);

                if (index === 0) {
                    activeNotebook.call($navItem);
                    $notepaneltitle.textContent = notebookData.name;
                }
                
                $sidebarList.appendChild($navItem);
            });
        },


        /**
         * Updates the UI to reflect changes in a notebook.
         * 
         * @param {string} notebookId - ID of the notebook to update. 
         * @param {Object} notebookData - New data for the notebook. 
         */

        update(notebookId, notebookData) {
            const /** {HTMLElement} */ $oldNotebook = document.querySelector(`[data-notebook="${notebookId}"]`);
            const /** {HTMLElement} */ $newNotebook = NavItem(notebookData.id, notebookData.name);

            $notepaneltitle.textContent = notebookData.name;
            $sidebarList.replaceChild($oldNotebook, $newNotebook);
            activeNotebook.call($newNotebook);
        },


        /**
         * Delete a notebook from the UI. 
         * 
         * @param {*} notebookId - ID of the notebook to delete.  
         */

        delete(notebookId) {
            const /** {HTMLElement} */ $deleteNotebook = document.querySelector(`[data-notebook="${notebookId}"]`);
            const /** {HTMLElement | null} */ $activenavItem = $deleteNotebook.nextElementSibling ?? $deleteNotebook.previousElementSibling;

            if ($activenavItem) {
                $activenavItem.click();
            } else {
                $notepaneltitle.innerHTML = ""; 
                $notePanel.innerHTML = "";
                disableNoteCreateBtns(false);
            }
            
            $deleteNotebook.remove();
        }

    },

    note: {

        /**
         * Craete a new note card in the UI based on provided note data.  
         * 
         * @param {*} noteData - Data representing the new note. 
         */
    
        create(noteData) {

            // Clear 'emptyNotesTemplate' from 'note panel' if there is no note exist. 
            if (!$notePanel.querySelector("[data-note]")) $notePanel.innerHTML = "";

            // Append card in note panel
            const /** {HTMLElement} */ $card = Card(noteData);
            $notePanel.prepend($card);

        },


        /**
         * Reads and a display a list of notes in the UI. 
         * 
         * @param {Array<Object>} noteList - List of note data to display. 
         */

        read(noteList) {
            
            if (noteList.length) {
                $notePanel.innerHTML = "";

                noteList.forEach((noteData) => {
                    const /** {HTMLElement} */ $card = Card(noteData);
                    $notePanel.appendChild($card);
                })
            } else {
                $notePanel.innerHTML = emptyNotesTemplate;
            }

        },


        /**
         * Updates a card in the UI based on provided not data. 
         * 
         * @param {string} noteId - ID of the note to update. 
         * @param {Object} noteData - New data for the note. 
         */

        update(noteId, noteData) {
            const /** {HTMLElement} */ $oldCard = document.querySelector(`[data-note="${noteId}"]`);
            const /** {HTMLElement} */ $newCard = Card(noteData);
            $notePanel.replaceChild($newCard, $oldCard);
        },


        /**
         * Deletes a note card from the UI. 
         * 
         * @param {string} noteId - TD of the note to delete. 
         * @param {boolean} isNoteExist - Indicates whether other notes still exist. 
         */

        delete(noteId, isNoteExist) {
            document.querySelector(`[data-note="${noteId}"]`).remove();
            if (!isNoteExist) $notePanel.innerHTML = emptyNotesTemplate;
        }

    }

}