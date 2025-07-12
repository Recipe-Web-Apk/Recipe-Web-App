class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = null; // Store recipe data here
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  // Insert a word with associated data
  insert(word, data = null) {
    let current = this.root;
    const lowerWord = word.toLowerCase();
    
    for (let char of lowerWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    
    if (!current.isEndOfWord) {
      this.size++;
    }
    
    current.isEndOfWord = true;
    current.data = data;
  }

  // Search for words with given prefix
  search(prefix, maxResults = 10) {
    const results = [];
    const lowerPrefix = prefix.toLowerCase();
    
    // Find the node for the prefix
    let current = this.root;
    for (let char of lowerPrefix) {
      if (!current.children.has(char)) {
        return results; // Prefix not found
      }
      current = current.children.get(char);
    }
    
    // Collect all words with this prefix
    this._collectWords(current, lowerPrefix, results, maxResults);
    
    return results;
  }

  // Helper method to collect words from a node
  _collectWords(node, prefix, results, maxResults) {
    if (results.length >= maxResults) return;
    
    if (node.isEndOfWord) {
      results.push({
        word: prefix,
        data: node.data
      });
    }
    
    for (let [char, childNode] of node.children) {
      this._collectWords(childNode, prefix + char, results, maxResults);
    }
  }

  // Check if a word exists
  contains(word) {
    let current = this.root;
    const lowerWord = word.toLowerCase();
    
    for (let char of lowerWord) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char);
    }
    
    return current.isEndOfWord;
  }

  // Get the total number of words
  getSize() {
    return this.size;
  }

  // Clear all data
  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }

  // Get all words (for debugging)
  getAllWords() {
    const results = [];
    this._collectWords(this.root, '', results, Infinity);
    return results;
  }
}

export default Trie; 