var CentralStorage = {
    currentUser: '',
    usersData: {
    }
};

function saveCentralStorage() {
    localStorage.setItem('MyCentralStorage', JSON.stringify(CentralStorage));
}

if (localStorage.getItem('MyCentralStorage') !== null) {
    CentralStorage = JSON.parse(localStorage.getItem('MyCentralStorage'));
}

var usersData = CentralStorage.usersData;

function S(id) { return document.getElementById(id); }

var viewState = '';

var selectedElements = [
    'top_bar',
    'sign_up_container',
    'sign_in_container',
    'search_input',
    'notes_container',
    'note_editor',
    'new_note_option',
    'deleted_notes_option',
    'notes_option',
    'new_note_editor',
    'deleted_notes_container',
    'deleted_note_manager'
];

var selectedElementsDefaultDisplayValues = {};

function setState(state) {
    viewState = state;
    selectedElements.forEach(function (elem) {
        S(elem).style.display = 'none';
    });

    var selectedElementsVisibleState = {
        '': [],
        'sign_up': ['sign_up_container'],
        'sign_in': ['sign_in_container'],
        'notes': ['top_bar', 'search_input', 'notes_container', 'new_note_option', 
            'notes_option', 'deleted_notes_option'],
        'deleted_notes': ['top_bar', 'search_input', 'deleted_notes_container', 'notes_option', 'deleted_notes_option'],
        'editing_note': ['top_bar', 'note_editor'],
        'editing_new_note': ['top_bar', 'new_note_editor'],
        'managing_deleted_note': ['top_bar', 'deleted_note_manager']
    };

    selectedElementsVisibleState[state].forEach(function (elem) {
        S(elem).style.display = selectedElementsDefaultDisplayValues[elem];
    });

    if (state === 'notes'){
        S('notes_option').style.color = '#ff0000';
        S('deleted_notes_option').style.color = '#000000';
    } else if (state === 'deleted_notes'){
        S('notes_option').style.color = '#000000';
        S('deleted_notes_option').style.color = '#ff0000';
    }
}

function updateNotes(notes){
    S('notes_container').innerHTML = '';
    notes.forEach(function(note, i) {
        S('notes_container').innerHTML += '<div onclick="manageNote(' + i + ')">' + note + '</div>';
    });
}

function updateDeletedNotes(notes){
    S('deleted_notes_container').innerHTML = '';
    notes.forEach(function(note, i) {
        S('deleted_notes_container').innerHTML += '<div onclick="manageDeletedNote(' + i + ')">' + note + '</div>';
    });
}
var currentlyEditingNote;
var currentlyManagingDeletedNote;

function manageNote(i) {
    setState('editing_note');
    currentlyEditingNote = i;
    S('note_editor_note').innerText = usersData[CentralStorage.currentUser].notes[i];
}

function manageDeletedNote(i) {
    setState('managing_deleted_note');
    currentlyManagingDeletedNote = i;
    S('deleted_note_manager_note').innerText = usersData[CentralStorage.currentUser].deletedNotes[i];
}
window.addEventListener("load", function() {
    selectedElements.forEach(function (elem) {
        selectedElementsDefaultDisplayValues[elem] = window.getComputedStyle(S(elem), null).getPropertyValue('display');
    });

    if (CentralStorage.currentUser === '') {
        setState('sign_in');
    } else {
        setState('notes');
        updateNotes(CentralStorage.usersData[CentralStorage.currentUser].notes);
    }

    S('sign_in_button').addEventListener('click', function(){
        var username = S('sign_in_username_input').value;
        if(CentralStorage.usersData[username] !== undefined && CentralStorage.usersData[username].password === S('sign_in_password_input').value) {
            CentralStorage.currentUser = username;
            saveCentralStorage();
            setState("notes");
            updateNotes(CentralStorage.usersData[username].notes);
        } else {
            alert("Incorrect sign in credentials.");
        }
    });

    S('create_new_account_button').addEventListener('click', function() {
        setState('sign_up');
    });

    S('cancel_sign_up_button').addEventListener('click', function() {
        setState("sign_in");
    });

    S('sign_up_button').addEventListener('click', function() {
        var username = S('sign_up_username_input').value;
        var password = S('sign_up_password_input').value;

        if (CentralStorage.usersData[username] !== undefined) {
            alert('Username not available.');
        } else if (username === '' || password === '') {
            alert('Invalid username or password.');
        } else {
            CentralStorage.currentUser = username;
            usersData[username] = {};
            usersData[username].password = password;
            usersData[username].notes = ["This is a example note."];
            usersData[username].deletedNotes = [];
            saveCentralStorage();
            setState("notes");
            updateNotes(CentralStorage.usersData[username].notes);
        }
    });

    S('sign_out_button').addEventListener('click', function() {
        CentralStorage.currentUser = '';
        saveCentralStorage();
        setState("sign_in");
    });

    S('notes_option').addEventListener('click', function() {
        setState('notes');
        updateNotes(CentralStorage.usersData[CentralStorage.currentUser].notes);
    });

    S('deleted_notes_option').addEventListener('click', function() {
        setState('deleted_notes');
        updateDeletedNotes(CentralStorage.usersData[CentralStorage.currentUser].deletedNotes);
    });

    S('note_editor_save_button').addEventListener('click', function() {
        usersData[CentralStorage.currentUser].notes[currentlyEditingNote] = S('note_editor_note').innerText;
        usersData[CentralStorage.currentUser].notes = usersData[CentralStorage.currentUser].notes.filter(function(s) { return s !== '' && s !== '\n' });
        saveCentralStorage();
        setState('notes');
        updateNotes(CentralStorage.usersData[CentralStorage.currentUser].notes);
    })

    S('note_editor_delete_button').addEventListener('click', function() {
        usersData[CentralStorage.currentUser].deletedNotes
            .unshift(usersData[CentralStorage.currentUser].notes[currentlyEditingNote]);
        usersData[CentralStorage.currentUser].notes[currentlyEditingNote] = '';
        usersData[CentralStorage.currentUser].notes = usersData[CentralStorage.currentUser].notes.filter(function(s) { return s !== '' && s !== '\n' });
        usersData[CentralStorage.currentUser].deletedNotes = usersData[CentralStorage.currentUser].deletedNotes.filter(function(s) { return s !== '' && s !== '\n' });
        saveCentralStorage();
        setState('notes');
        updateNotes(CentralStorage.usersData[CentralStorage.currentUser].notes);
    });

    S('note_editor_cancel_button').addEventListener('click', function() {
        setState('notes');
    })

    S('new_note_option').addEventListener('click', function() {
        S('new_note_editor_note').innerText = '';
        setState('editing_new_note');
    })

    S('new_note_editor_save_button').addEventListener('click', function() {
        usersData[CentralStorage.currentUser].notes.unshift(S('new_note_editor_note').innerText);
        usersData[CentralStorage.currentUser].notes = usersData[CentralStorage.currentUser].notes.filter(function(s) { return s !== '' && s !== '\n' });
        saveCentralStorage();
        setState('notes');
        updateNotes(CentralStorage.usersData[CentralStorage.currentUser].notes);
    })
    S('new_note_editor_cancel_button').addEventListener('click', function() {
        setState('notes');
    })

    S('deleted_note_manager_delete_forever_button').addEventListener('click', function() {
        usersData[CentralStorage.currentUser].deletedNotes[currentlyManagingDeletedNote] = '';
        usersData[CentralStorage.currentUser].notes = usersData[CentralStorage.currentUser].notes.filter(function(s) { return s !== '' && s !== '\n' });
        usersData[CentralStorage.currentUser].deletedNotes = usersData[CentralStorage.currentUser].deletedNotes.filter(function(s) { return s !== '' && s !== '\n' });
        saveCentralStorage();
        setState('deleted_notes');
        updateDeletedNotes(CentralStorage.usersData[CentralStorage.currentUser].deletedNotes);
    })
    S('deleted_note_manager_restore_button').addEventListener('click', function() {
        usersData[CentralStorage.currentUser].notes
            .unshift(usersData[CentralStorage.currentUser].deletedNotes[currentlyManagingDeletedNote]);
        usersData[CentralStorage.currentUser].deletedNotes[currentlyManagingDeletedNote] = '';
        usersData[CentralStorage.currentUser].notes = usersData[CentralStorage.currentUser].notes.filter(function(s) { return s !== '' && s !== '\n' });
        usersData[CentralStorage.currentUser].deletedNotes = usersData[CentralStorage.currentUser].deletedNotes.filter(function(s) { return s !== '' && s !== '\n' });
        saveCentralStorage();
        setState('deleted_notes');
        updateDeletedNotes(CentralStorage.usersData[CentralStorage.currentUser].deletedNotes);
    })

    S('deleted_note_manager_cancel_button').addEventListener('click', function(){
        setState('deleted_notes');
    });

    S('search_input').addEventListener('input', function(){
        updateNotes(CentralStorage.usersData[CentralStorage.currentUser].notes.filter(function(t){ return t.includes(S('search_input').value); }));
        updateDeletedNotes(CentralStorage.usersData[CentralStorage.currentUser].deletedNotes.filter(function(t){ return t.includes(S('search_input').value); }));
    });
});

