class Tree {

    constructor(elements) {
        this.update(elements);
    }
    
    getRootId() {
        this.rootId = Math.min(...this.elements.map(function(item) {
            return item.parent_id;
        })); 
    }
    update(elements) {
        this.elements = elements;
        this.getRootId();
        this.mainBranchs = this.sortFolder();
    }
    sortFolder() {
        const results = this.elements.filter(function(item) {
            return item.parent_id === this.rootId;
        }.bind(this))
        .map(function(item) {
            item.children = this.putChildren(item);
            return item;
        }.bind(this))
        return results;
    }
    
    putChildren(root) {
        return this.elements.filter(function(folder) {
            return folder.parent_id === root.id;
        })
        .map(function(item) {
            item.children = this.putChildren(item);
            return item;
        }.bind(this));
        
    }
}

export default Tree;