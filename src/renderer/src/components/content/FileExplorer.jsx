import React, { useState, useEffect, useMemo } from 'react';
import { File, Database, Plus, Save, Trash2, Search, FileText, Folder, ChevronDown, ChevronRight } from 'lucide-react';

const FileExplorer = ({ basePath }) => {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Generate mock files (millions of notes)
  useEffect(() => {
    const mockFiles = [];
    const names = ['welcome', 'notes', 'todo', 'ideas', 'projects', 'journal', 'recipes', 'code', 'docs', 'archive'];
    
    // Generate 1000 sample files
    for (let i = 0; i < 1000; i++) {
      const name = names[i % names.length];
      const type = i % 3 === 0 ? '.db' : '.md';
      mockFiles.push({
        name: `${name}-${i + 1}${type}`,
        type: type === '.db' ? 'database' : 'markdown',
        folder: i % 5 === 0 ? `folder-${Math.floor(i/5)}` : null
      });
    }
    setFiles(mockFiles);
  }, []);

  const getIcon = (name) => {
    if (name.endsWith('.db')) return <Database className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-green-400" />;
    return <File className="w-4 h-4 text-zinc-400" />;
  };

  // Filter and group files
  const filtered = useMemo(() => {
    let result = files.filter(f => 
      f.name.toLowerCase().includes(search.toLowerCase())
    );
    
    // Group by folder
    const grouped = {};
    result.forEach(file => {
      const folder = file.folder || 'root';
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push(file);
    });
    
    return grouped;
  }, [files, search]);

  const toggleFolder = (folder) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(folder)) newSet.delete(folder);
    else newSet.add(folder);
    setExpandedFolders(newSet);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Note
          </button>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-white/5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="text-[10px] text-zinc-600 mt-1.5 px-1">
            {files.length} notes
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {Object.entries(filtered).map(([folder, items]) => (
            <div key={folder}>
              {folder !== 'root' && (
                <button
                  onClick={() => toggleFolder(folder)}
                  className="flex items-center gap-1 w-full px-2 py-1 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  {expandedFolders.has(folder) ? 
                    <ChevronDown className="w-3 h-3" /> : 
                    <ChevronRight className="w-3 h-3" />
                  }
                  <Folder className="w-3 h-3" />
                  <span>{folder}</span>
                  <span className="text-[10px] text-zinc-600">({items.length})</span>
                </button>
              )}
              {(folder === 'root' || expandedFolders.has(folder)) && (
                <div className={`${folder !== 'root' ? 'ml-4' : ''} space-y-0.5`}>
                  {items.map((file) => (
                    <div
                      key={file.name}
                      onClick={() => {
                        setSelected(file.name);
                        setContent(file.type === 'database' 
                          ? JSON.stringify({ data: [] }, null, 2)
                          : '# ' + file.name.replace(/\.md$/, '').replace(/-/g, ' ')
                        );
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer group ${
                        selected === file.name 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {getIcon(file.name)}
                      <span className="flex-1 truncate text-xs">
                        {file.name.replace(/\.(md|db)$/, '')}
                      </span>
                      {file.type === 'database' && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400">DB</span>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* delete */ }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {Object.keys(filtered).length === 0 && (
            <div className="text-center text-zinc-600 text-xs py-8">
              No notes found
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
              <span className="text-xs text-zinc-400 truncate">{selected}</span>
              <button className="px-3 py-1 text-xs bg-blue-500 rounded hover:bg-blue-600 transition-colors">
                <Save className="w-3 h-3 inline mr-1" /> Save
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-4 bg-transparent text-white/80 outline-none resize-none font-mono text-sm leading-relaxed"
              spellCheck={false}
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select a note</p>
              <p className="text-xs mt-1">{files.length} notes available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;