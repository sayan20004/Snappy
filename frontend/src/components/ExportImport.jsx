import { useState } from 'react';
import { FiCopy, FiDownload, FiUpload, FiCheck } from 'react-icons/fi';
import { useTodos } from '../hooks/useTodos';
import { useLists } from '../hooks/useLists';
import toast from 'react-hot-toast';

export default function ExportImport() {
  const { data: todosData } = useTodos({ limit: 10000 });
  const { data: listsData } = useLists();
  const [copied, setCopied] = useState(false);

  const exportToJSON = () => {
    const data = {
      todos: todosData?.todos || [],
      lists: listsData?.lists || [],
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snappy-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to JSON!');
  };

  const exportToCSV = () => {
    const todos = todosData?.todos || [];
    const headers = ['Title', 'Status', 'Priority', 'Due Date', 'Tags', 'Created At'];
    const rows = todos.map(todo => [
      todo.title,
      todo.status,
      todo.priority,
      todo.dueAt || '',
      (todo.tags || []).join('; '),
      new Date(todo.createdAt).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snappy-todo-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV!');
  };

  const exportToMarkdown = () => {
    const todos = todosData?.todos || [];
    const lists = listsData?.lists || [];

    let markdown = `# Snappy Todo Export\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Total Tasks:** ${todos.length}\n\n`;
    markdown += `---\n\n`;

    // Group by list
    const grouped = { null: [] };
    todos.forEach(todo => {
      const listId = todo.listId || null;
      if (!grouped[listId]) grouped[listId] = [];
      grouped[listId].push(todo);
    });

    Object.entries(grouped).forEach(([listId, tasks]) => {
      const list = lists.find(l => l._id === listId);
      markdown += `## ${list?.name || 'Inbox'}\n\n`;
      
      tasks.forEach(todo => {
        const checkbox = todo.status === 'done' ? '[x]' : '[ ]';
        markdown += `- ${checkbox} ${todo.title}\n`;
        if (todo.note) markdown += `  > ${todo.note}\n`;
        if (todo.tags?.length) markdown += `  Tags: ${todo.tags.map(t => `#${t}`).join(' ')}\n`;
        markdown += `\n`;
      });
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snappy-todo-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to Markdown!');
  };

  const copyToClipboard = async () => {
    const data = {
      todos: todosData?.todos || [],
      lists: listsData?.lists || []
    };

    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        console.log('Import data:', data);
        toast.success(`Found ${data.todos?.length || 0} tasks to import`);
        // TODO: Implement actual import logic with backend
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Export & Backup</h2>
        <p className="text-sm text-gray-500">
          Download your data in various formats
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={exportToJSON}
          className="card p-6 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FiDownload className="text-blue-600" size={20} />
            </div>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Full Backup</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Export to JSON</h3>
          <p className="text-sm text-gray-500">Complete backup with all data</p>
        </button>

        <button
          onClick={exportToCSV}
          className="card p-6 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FiDownload className="text-green-600" size={20} />
            </div>
            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Spreadsheet</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Export to CSV</h3>
          <p className="text-sm text-gray-500">Open in Excel or Google Sheets</p>
        </button>

        <button
          onClick={exportToMarkdown}
          className="card p-6 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FiDownload className="text-purple-600" size={20} />
            </div>
            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">Document</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Export to Markdown</h3>
          <p className="text-sm text-gray-500">Human-readable checklist format</p>
        </button>

        <button
          onClick={copyToClipboard}
          className="card p-6 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              {copied ? <FiCheck className="text-green-600" size={20} /> : <FiCopy className="text-yellow-600" size={20} />}
            </div>
            <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded">Quick</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Copy to Clipboard</h3>
          <p className="text-sm text-gray-500">{copied ? 'Copied!' : 'Copy JSON to clipboard'}</p>
        </button>
      </div>

      {/* Import Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h3>
        
        <label className="card p-6 hover:shadow-md transition-all cursor-pointer block border-2 border-dashed border-gray-300 hover:border-primary-500">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <FiUpload className="text-primary-600" size={20} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Import from JSON</h4>
            <p className="text-sm text-gray-500">Click to browse or drag and drop</p>
          </div>
        </label>
      </div>

      {/* Stats */}
      <div className="card p-6 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Data</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{todosData?.todos?.length || 0}</div>
            <div className="text-xs text-gray-500">Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{listsData?.lists?.length || 0}</div>
            <div className="text-xs text-gray-500">Lists</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {todosData?.todos?.filter(t => t.status === 'done').length || 0}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
