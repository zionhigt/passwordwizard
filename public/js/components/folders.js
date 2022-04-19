import Tree from "./tree.js";

class Folder{
    constructor(arg, view) {
        this.id = arg.id;
        this.name = arg.name;
        this.parent_id = arg.parent_id;
        this.children = arg.children;
        this.workspace = arg.workspace;
    }
    workspaceClosure(wsp) {
        return function(event) {
            const workspacesLink = Array.from(document.querySelectorAll(".workspace--link a"));
            workspacesLink.forEach(function(link) {
                link.classList.remove("selected")
            })
            event.target.classList.add("selected");
            event.preventDefault();
            showTable();
            Emiter.getWorkspaceData(wsp.id);
        }
    }
    toggleFolder(target) {
        const icon = target.querySelector("i");
        icon.classList.toggle("fa-folder");
        icon.classList.toggle("fa-folder-open");
        target.classList.toggle("open");
    }
    getTypeBox(icon, value, name) {
        const container = document.createElement("div");
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
    getTypeSelectBox(name) {
        const selectContainer = document.createElement("div");
        selectContainer.classList.add("type-selector-container");
    
        const folder_icon = document.createElement("i");
        folder_icon.classList.add("fa", "fa-folder");
        const typeFolderBox = this.getTypeBox(folder_icon, "folder", name);
        const def = typeFolderBox.querySelector("input[value='folder']");
        def.setAttribute("checked", 'true');
    
        const workspace_icon = document.createElement("i");
        workspace_icon.classList.add("fa", "fa-file");
        const typeWorkspaceBox = this.getTypeBox(workspace_icon, "workspace", name);
    
        selectContainer.appendChild(typeFolderBox);
        selectContainer.appendChild(typeWorkspaceBox);
        return selectContainer;
    }
    getFolderInput() {
        const container = document.createElement("li");
        const form = document.createElement("form");
        form.classList.add("new-item-form");
    
        container.classList.add("new-item-container");
        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("name", "name");
        input.classList.add("new-item-name");
    
        const hideInput = document.createElement("input");
        hideInput.value = this.id;
        hideInput.setAttribute("type", "hidden");
        hideInput.setAttribute("name", "folder_id");
    
        const submitInput = document.createElement("input");
        submitInput.setAttribute("type", "submit");
        submitInput.value = "Créer";
        submitInput.classList.add("new-item-submit");
    
        const typeSelector = this.getTypeSelectBox(this.name);
    
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
            if(type.value === "folder") {
                body['parent_id'] = parent_id;
                Emiter.createFolder(body);
            } else if(type.value === "workspace") {
                body['folder_id'] = parent_id;
                Emiter.createWorkspace(body);
            }
        })
        container.appendChild(form);
        return container;
    }
    getWorkspaceLink(text, wsp) {
        const content = text.innerText;
        const link = document.createElement("a");
        link.innerText = content;
        link.addEventListener("click", workspaceClosure(wsp));
        text.innerHTML = "";
        text.classList.add("workspace--link");
        text.appendChild(link);
        return text;
    }
    getFolderLink(text) {
        const folder_icon = document.createElement("i");
        folder_icon.classList.add("fa", "fa-folder");
        text.prepend(folder_icon);
    
        const addBtn = document.createElement("p");
        addBtn.classList.add("add-btn");
        addBtn.innerText = "+";
        text.appendChild(addBtn);
    
        addBtn.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.toggleFolder(event.target.parentNode);
            const inputs = Array.from(document.querySelectorAll("form.new-item-form"));
            inputs.forEach(function(item) {
                item.remove();
            })
            const input = this.getFolderInput();
            const dest = event.target.parentNode.parentNode.querySelector("ul");
            const oldInput = dest.querySelector(".new-item-container");
            if(oldInput) {
                dest.removeChild(oldInput);
            }
            if(event.target.parentNode.classList.contains("open")) {
                dest.appendChild(input);
            }
        }.bind(this))
    
        text.addEventListener("click", function(event) {
            event.preventDefault()
            this.toggleFolder(event.target);
        }.bind(this))
        return text;
    }   
    getWorkspaceLink(text, wsp) {
        const content = text.innerText;
        const link = document.createElement("a");
        link.innerText = content;
        link.addEventListener("click", this.workspaceClosure(wsp));
        text.innerHTML = "";
        text.classList.add("workspace--link");
        text.appendChild(link);
        return text;
    }
    render() {
        const elemList = document.createElement("li");
        const text = document.createElement("p");
        text.innerText = this.name;
        elemList.appendChild(text);
        this.getFolderLink(text);
        text.classList.add("folder--link");
        
        const childrenFolders = new Folders(this.children);
        const folderList = childrenFolders.buildFoldersList();
        console.log(folderList)
        this.workspace.forEach(function(wsp) {
            const text = document.createElement("p");
            text.innerText = wsp.name;
            this.getWorkspaceLink(text, wsp);
            const li = document.createElement("li")
            li.appendChild(text);
            folderList.appendChild(li);
        }.bind(this));
        elemList.appendChild(folderList);
        return elemList;
    }
}

class Folders{
    constructor(elements, view) {
        this.tree = new Tree(elements);
        this.elements = this.initElements();
    }
    initElements() {
        return this.tree.mainBranchs.map(function(folder) {
            return new Folder(folder, null); /**TODO pass view */
        })
    }
    buildFoldersList() {
        const folders = this.tree.mainBranchs;
        const list = document.createElement("ul");
        this.elements.forEach(function(folder) {
            list.appendChild(folder.render());
        })
        return list;
    }
}
export default Folders;