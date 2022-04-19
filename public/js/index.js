const { ipcMain } = require('electron');

const ctx = {
    currentWorkspaceId: null
}
const ipc = require('electron').ipcRenderer;
document.addEventListener("change", function(event) {
    ipc.send("doSomethings");
});
const openedFolders = [];
function createFolder(body) {
    ipc.send('createFolder', JSON.stringify(body));
}
function createWorkspace(body) {
    ipc.send('createWorkspace', JSON.stringify(body));
}

ipc.on('data', (event, arg) => {
    const containerTable = document.querySelector(".container table tbody");
    containerTable.innerHTML = "";
    const data = JSON.parse(arg);
    data.data.forEach(function(item) {
        buildRow(item);
    })
    if(data.data.length === 0) {
        noTable();
    }
    if(data.workspace) {
        const title = document.querySelector("section.center .container .passwordTable .header h3");
        title.innerText = data.workspace.name;
        ctx.currentWorkspaceId = data.workspace.id;
    }
  })
ipc.on('dataFolder', (event, arg) => {
    const data = JSON.parse(arg);
    const list = buildFoldersList(sortFolder(data));
    showFolderList(list);
  })
  function showFormBox(box) {
      Array.from(box.parentNode.querySelectorAll("form"))
      .forEach(function(form) {
          form.classList.add("d-none");
      });
      box.classList.remove('d-none');
      return;
  }
  function getFormData(form) {
      const formData = new FormData(form);
      const data = {};
      Array.from(formData.entries())
      .forEach(function(item) {
          data[item[0]] = item[1];
      });
      return data;
  }
ipc.on('noUserFound', (event, arg) => {
    const box = document.querySelector("#subscribeForm");
    showFormBox(box);
    box.addEventListener("submit", function(event) {
        event.preventDefault();
        const data = getFormData(event.target);
        const body = JSON.stringify(data);
        ipc.send("subscribe", body);
    })
})
ipc.on('canBeLoging', (event, arg) => {
    const box = document.querySelector("#connectForm");
    showFormBox(box);
    box.addEventListener("submit", function(event) {
        event.preventDefault();
        const data = getFormData(event.target);
        const body = JSON.stringify(data);
        ipc.send("connect", body);
    })
})
ipc.on('UserConnect', (event, arg) => {
    ipc.send('getFolders', "giveMe");
    const popup = document.querySelector(".connect-popup");
    popup.classList.add("d-none");
    document.querySelector("section.main").classList.remove("d-hidden");

    
})
ipc.on('UserDisconnect', (event, arg) => {
    const popup = document.querySelector(".connect-popup");
    popup.classList.remove("d-none");
    popup.querySelector("input[name='password']").value = "";
    document.querySelector("section.main").classList.add("d-hidden");
    
})
ipc.send('isAnyUser');

// ipc.send('getData', "giveMe");

const exitAppBtn = document.querySelector(".center-popup .close");
exitAppBtn.addEventListener("click", function(event) {
    ipc.send('exitApp');
});

function getWorkspaceData(workspace_id) {
    const body = JSON.stringify({
        workspace_id: workspace_id
    })
    ipc.send('getData', body);
}
function putChildren(root, folders) {
    const children = [];
    folders.filter(function(folder) {
        return folder.parent_id === root.id;
    })
    .forEach(function(item) {
        children.push(item)
    });
    return children.map(function(item) {
        item.children = putChildren(item, folders);
        return item;
    });
}
function sortFolder(folders) {
    const results = folders.filter(function(item) {
        return item.parent_id === 0;
    })
    .map(function(item) {
        item.children = putChildren(item, folders);
        return item;
    })
    return results;
}

function showFolderList(list) {
    const containerfolder = document.querySelector("section.main aside.left div.folders--view div.folders--content");
    containerfolder.innerHTML = "";
    list.classList.add("root-list")
    list.appendChild(getNewItemLink({id: 0}, true));
    containerfolder.appendChild(list);
}
function workspaceClosure(wsp) {
    return function(event) {
        const workspacesLink = Array.from(document.querySelectorAll(".workspace--link a"));
        workspacesLink.forEach(function(link) {
            console.log(link)
            link.classList.remove("selected")
        })
        event.target.classList.add("selected");
        event.preventDefault();
        showTable();
        getWorkspaceData(wsp.id);
    }
}
function getWorkspaceLink(text, wsp) {
    const content = text.innerText;
    const link = document.createElement("a");
    link.innerText = content;
    link.addEventListener("click", workspaceClosure(wsp));
    text.innerHTML = "";
    text.classList.add("workspace--link");
    text.appendChild(link);
    return text;
}
function replaceFolder(folder) {
    console.log(folder);
}
function toggleFolder(target) {
    const icon = target.querySelector("i");
    icon.classList.toggle("fa-folder");
    icon.classList.toggle("fa-folder-open");
    target.classList.toggle("open");
    if(target.classList.contains("open")) {
        openedFolders.push(target.innerText);
    } else {
        openedFolders.pop(openedFolders.indexOf(target.innerText));
    }
    
}
function getTypeBox(icon, value) {
    const container = document.createElement("div");
    container.setAttribute("id", "container_" + value)
    const label = document.createElement("label");
    label.appendChild(icon);
    label.setAttribute("for", "name" + value);
    const input = document.createElement("input");
    input.setAttribute("id", "name" + value);
    input.setAttribute("type", "radio");
    input.setAttribute("name", "newItemType");
    input.setAttribute("value", value);
    container.prepend(input);
    container.appendChild(label);
    return container;
}
function getTypeSelectBox(name) {
    const selectContainer = document.createElement("div");
    selectContainer.classList.add("type-selector-container");

    const folder_icon = document.createElement("i");
    folder_icon.classList.add("fa", "fa-folder");
    const typeFolderBox = getTypeBox(folder_icon, "folder", name);
    const def = typeFolderBox.querySelector("input[value='folder']");
    def.setAttribute("checked", 'true');

    const workspace_icon = document.createElement("i");
    workspace_icon.classList.add("fa", "fa-file");
    const typeWorkspaceBox = getTypeBox(workspace_icon, "workspace", name);

    selectContainer.appendChild(typeFolderBox);
    selectContainer.appendChild(typeWorkspaceBox);
    return selectContainer;
}
function getFolderInput(folder, folderOnly=false) {
    const container = document.createElement("li");
    const form = document.createElement("form");
    form.classList.add("new-item-form");

    container.classList.add("new-item-container");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "name");
    input.classList.add("new-item-name");

    const hideInput = document.createElement("input");
    hideInput.value = folder.id;
    hideInput.setAttribute("type", "hidden");
    hideInput.setAttribute("name", "folder_id");

    const submitInput = document.createElement("input");
    submitInput.setAttribute("type", "submit");
    submitInput.value = "Créer";
    submitInput.classList.add("new-item-submit");

    const typeSelector = getTypeSelectBox(folder.name);
    if(folderOnly) {
        typeSelector.querySelector("#container_workspace").classList.add("d-none");
    }
    const cancelElement = document.createElement("li");
    const cancelBtn = document.createElement("a");
    cancelBtn.classList.add("add-btn");
    cancelBtn.classList.add("text-danger");
    cancelBtn.innerText = "Annuler";
    cancelElement.appendChild(cancelBtn);

    cancelBtn.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        Array.from(document.querySelectorAll("a.add-btn.d-none"))
        .forEach(function(item) {
            item.classList.remove('d-none');
        });
        Array.from(document.querySelectorAll("form.new-item-form")).forEach(function(item) {
            item.remove();
        });
    })

    form.appendChild(cancelElement);
    form.appendChild(input);
    form.appendChild(hideInput);
    form.appendChild(submitInput);
    form.prepend(typeSelector);
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const folder_id = event.target.querySelector("input[name='folder_id']").value;
        const name = event.target.querySelector("input[name='name']").value;
        const type = event.target.querySelector("input[name='newItemType']:checked");
        const parent_id = parseInt(folder_id);
        const body = {
            user_id: 1,
            name: name
        }
        if(folderOnly) {
            type.value = "folder";
        }
        if(type.value === "folder") {
            body['parent_id'] = parent_id;
            createFolder(body);
        } else if(type.value === "workspace") {
            body['folder_id'] = parent_id;
            createWorkspace(body);
        }
    })
    container.appendChild(form);
    return container;
}
function getFolderLink(text, folder) {
    const folder_icon = document.createElement("i");
    folder_icon.classList.add("fa", "fa-folder");
    text.prepend(folder_icon);
    text.addEventListener("click", function(event) {
        event.preventDefault()
        toggleFolder(event.target);
    })
    if(openedFolders.includes(text.innerText)) {
        toggleFolder(text);
    }
    return text;
}
function getNewItemLink(folder, folderOnly=false) {
    const addElement = document.createElement("li");
    const addBtn = document.createElement("a");
    addBtn.classList.add("add-btn");
    addBtn.innerText = "Nouveau";
    addElement.appendChild(addBtn);

    addBtn.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        ipc.send("doSomethings");
        const inputs = Array.from(document.querySelectorAll("form.new-item-form"));
        inputs.forEach(function(item) {
            item.remove();
        })
        
        event.target.classList.add("d-none");
        const input = getFolderInput(folder, folderOnly);
        const dest = event.target.parentNode;
        dest.appendChild(input);
    })
    return addElement;
}
function buildFoldersList(folders) {

    const list = document.createElement("ul");
    folders.forEach(function(folder) {
        const elemList = document.createElement("li");
        const text = document.createElement("p");
        text.innerText = folder.name;
        elemList.appendChild(text);
        getFolderLink(text, folder);
        text.classList.add("folder--link");
        
        const folderList = buildFoldersList(folder.children);
        folder.workspace.forEach(function(wsp) {
            const text = document.createElement("p");
            text.innerText = wsp.name;
            getWorkspaceLink(text, wsp);
            const li = document.createElement("li")
            li.appendChild(text);
            folderList.appendChild(li);
        });
        folderList.appendChild(getNewItemLink(folder));
        elemList.appendChild(folderList);
        
        list.appendChild(elemList);
        

    })
    return list;
}
function postData(body) {
    ipc.send('postData', JSON.stringify(body));
    getWorkspaceData(body.workspace_id)
}

const eyeBtns = document.querySelectorAll(".show-passwd");

function eyePasswdCb(event) {
    event.preventDefault();
    const finalTarget = event.target.parentNode.querySelector(".password-input");
    if(finalTarget.getAttribute("type") === "password") {
        finalTarget.setAttribute("type", "text");
        
    } else {
        finalTarget.setAttribute("type", "password");
    }
}

eyeBtns.forEach(function(eyeBtn) {
    eyeBtn.addEventListener("click", eyePasswdCb)
})
/* <td>
    <button class="show-passwd" type="button"><i class="fa-solid fa-eye"></i></button>
    <input class="password-input" type="password" readonly="true" value="Graffiti50100"/>
</td> */
function passwdCol(name, placeholder) {
    const col = document.createElement("td");
    const input = document.createElement("input");
    input.setAttribute("type", "password");
    input.setAttribute("name", name);
    input.setAttribute("placeholder", placeholder);
    input.classList.add("password-input");
    const eyeBtn = document.createElement("button");
    eyeBtn.classList.add("show-password");
    eyeBtn.setAttribute("type", "button");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-eye")
    eyeBtn.appendChild(icon);
    col.appendChild(eyeBtn)
    eyeBtn.addEventListener("click", eyePasswdCb)
    col.appendChild(input)
    return col; 

}
function textCol(name, placeholder) {
    const col = document.createElement("td");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", name);
    input.setAttribute("placeholder", placeholder);
    col.appendChild(input)
    return col;
}
function getCol(name, inputType="text", placeholder="") {
    if(inputType === "password") return passwdCol(name, placeholder);
    if(inputType === "text") return textCol(name, placeholder);
    
}
const keyMap = {
    0: {name: "name", placeholder: "eg: EMAIL"},
    1: {name: "url", placeholder: "eg: https://courier.com"},
    2: {name: "login", placeholder: "eg: jeandupont@email.com"},
    3: {name: "secret", placeholder: "eg: SFJjv43fME0Zi5RHvGwosg"},
    4: {name: "comment", placeholder: "eg: commentaire"}

}
function getRow() {
    const row = document.createElement("tr");
    for(let i = 0; i < 5; i++) {
        let name = keyMap[i].name;
        let placeholder = keyMap[i].placeholder;
        let col = getCol(name, "text", placeholder);
        if(i === 3) {
            col = getCol(name, "password", placeholder);
        }
        row.appendChild(col);
    }

    return row;

}

let onEdit = false;
function turnToEdit() {
    document.querySelector(".no-edit").classList.add("d-none");
    document.querySelector(".edit").classList.remove("d-none");
    showTable();
    onEdit = true;
}
function turnToNoEdit() {
    document.querySelector(".no-edit").classList.remove("d-none");
    document.querySelector(".edit").classList.add("d-none");
    onEdit = false;
    const containerTable = document.querySelector(".container table tbody");
    if(containerTable.children.length === 0) {
        noTable();
    }

}
const newBtn = document.querySelector("#newBtn")
newBtn.addEventListener("click", function(event) {
    if(onEdit === false) {
        const containerTable = document.querySelector(".container table tbody");
        containerTable.appendChild(getRow());
        turnToEdit();
    }
})

const cancelBtn = document.querySelector("#cancelBtn")
cancelBtn.addEventListener("click", function(event) {
    if(onEdit === true) {
        const containerTable = document.querySelector(".container table tbody");
        const lastTr = containerTable.querySelector("tr:last-child");
        containerTable.removeChild(lastTr);
        turnToNoEdit();
    }
})
function buildRow(data) {
    const row = getRow();
    const inputs = Array.from(row.querySelectorAll("td input"));
    const containerTable = document.querySelector(".container table tbody");
    inputs.forEach(function(input) {
        input.setAttribute("readonly", "true");
        input.value = data[input.name];
    });
    const tdCommentary = row.querySelector("td:last-child");
    inputToText(tdCommentary);
    containerTable.appendChild(row);
}
function save(row, body) {
    row.querySelectorAll("input").forEach(function(input) {
        input.setAttribute("readonly", "true");
    })
    const tdCommentary = row.querySelector("td:last-child");
    inputToText(tdCommentary);
    postData(body);
    // ipc.send('getData', "giveMe");
    return 
}
const saveBtn = document.querySelector("#saveBtn")
saveBtn.addEventListener("click", function(event) {
    if(onEdit === true) {
        const containerTable = document.querySelector(".container table tbody");
        const lastTr = containerTable.querySelector("tr:last-child");
        const formInputs = Array.from(lastTr.querySelectorAll("input"))
        if(!formInputs.length) {
            containerTable.removeChild(lastTr)
        } else {
            const body = formInputs.map(function(item) {
                const obj = {};
                obj[item.name] = item.value;
                return obj;
            }).reduce(function(a, b) {
                a = {...a, ...b};
                return a;
            });
            body["workspace_id"] = ctx.currentWorkspaceId;
            save(lastTr, body);
        }
        turnToNoEdit();
        
    }
})
function inputToText(tdCommentary) {
    const commentaryField = tdCommentary.querySelector("input");
    tdCommentary.removeChild(commentaryField);
    tdCommentary.innerText = commentaryField.value;
    return tdCommentary;
}
function showTable() {
    const passwordTable = document.querySelector(".container .passwordTable");
    const table = document.querySelector(".container table");
    const home = document.querySelector(".container #homeView");
    const noFound = document.querySelector(".container .no-found");
    table.classList.remove('d-none');
    passwordTable.classList.remove('d-none');
    noFound.classList.add('d-none');
    home.classList.add('d-none');
}
function noTable() {
    const table = document.querySelector(".container table");
    const noFound = document.querySelector(".container .no-found");
    table.classList.add('d-none');
    noFound.classList.remove('d-none');
}
const searchContainer = document.querySelector("#search");
searchContainer.querySelector('a').addEventListener("click", function(ev) {
    ev.preventDefault();
    showTable();
    const tabElement = document.querySelectorAll(".container table tbody tr");
    const input = searchContainer.querySelector('input');
    const keyWord = input.value.toUpperCase();
    const matchTr = Array.from(tabElement)
    .map(function(item) {
        item.classList.add("d-none");
        return item;
    })
    .filter(function(row) {
        const nameValue = row.querySelector("td:first-child input").value.toUpperCase();
        return nameValue.includes(keyWord);
    }).map(function(item) {
        item.classList.remove("d-none");
        return item;
    });
    if(matchTr.length === 0) {
        noTable();
    }

})

const passwordGeneratorBtn = document.querySelector("#passGenBtn");
passwordGeneratorBtn.addEventListener("click", function(event) {
    const mdpArray = Array.from({ length: 16 }, (_, i) => String.fromCharCode(parseInt('!'.charCodeAt(0) + (Math.random() * 92))));
    const mdp = mdpArray.join('')
    event.preventDefault();
    if(onEdit) {
        const input = document.querySelector('table tr:last-child td input[name="secret"]');
        input.value = mdp;
    }
})
