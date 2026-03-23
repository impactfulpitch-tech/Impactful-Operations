import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ProjectLink } from '../data/mockData';

interface ProjectLinksProps {
  projectId: string;
  projectName: string;
  links: ProjectLink[];
  onAddLink: (link: Omit<ProjectLink, 'id' | 'addedDate'>) => void;
  onRemoveLink: (linkId: string) => void;
  userDepartment?: string;
}

export function ProjectLinks({
  projectId,
  projectName,
  links,
  onAddLink,
  onRemoveLink,
  userDepartment,
}: ProjectLinksProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'documentation' as 'chatgpt' | 'documentation' | 'design' | 'content' | 'financial' | 'other',
  });

  // Check if ChatGPT link exists
  const chatgptLinks = links.filter(l => l.category === 'chatgpt');
  const noChatGPTLink = chatgptLinks.length === 0;

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For ChatGPT links, only require URL
    if (formData.category === 'chatgpt') {
      if (!formData.url.trim()) {
        alert('Please enter the ChatGPT link URL');
        return;
      }
      onAddLink({
        title: 'ChatGPT Conversation',
        url: formData.url,
        description: '',
        category: formData.category,
        addedBy: sessionStorage.getItem('currentUserName') || 'Anonymous',
      });
    } else {
      // For other links, require title and URL
      if (!formData.title.trim() || !formData.url.trim()) {
        alert('Please fill in title and URL');
        return;
      }
      onAddLink({
        title: formData.title,
        url: formData.url,
        description: formData.description,
        category: formData.category,
        addedBy: sessionStorage.getItem('currentUserName') || 'Anonymous',
      });
    }

    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'documentation',
    });
    setIsAddingLink(false);
  };

  // Get unique categories from links
  const categories = Array.from(new Set(links.map(l => l.category)));
  const filteredLinks = selectedCategory
    ? links.filter(l => l.category === selectedCategory)
    : links;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'chatgpt': 'bg-purple-100 text-purple-800',
      'documentation': 'bg-blue-100 text-blue-800',
      'design': 'bg-pink-100 text-pink-800',
      'content': 'bg-green-100 text-green-800',
      'financial': 'bg-amber-100 text-amber-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['other'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full space-y-4">
      {/* ChatGPT Links Alert */}
      {noChatGPTLink && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">No ChatGPT Conversation Link Added</h4>
              <p className="text-sm text-purple-800 mb-3">
                Add a ChatGPT link for this project so team members can quickly access the dedicated conversation without searching in ChatGPT history.
              </p>
              <button
                onClick={() => {
                  setFormData({ ...formData, category: 'chatgpt', title: `${projectName} - ChatGPT Discussion` });
                  setIsAddingLink(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Add ChatGPT Link Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT Links Display */}
      {chatgptLinks.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💬</span>
            <h4 className="font-semibold text-purple-900">ChatGPT Conversations</h4>
            <span className="ml-auto text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              {chatgptLinks.length} link{chatgptLinks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {chatgptLinks.map((link) => (
              <div key={link.id} className="bg-white rounded-lg p-3 border border-purple-100 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900">{link.title}</h5>
                  {link.description && (
                    <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    title="Open ChatGPT conversation"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => onRemoveLink(link.id)}
                    className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete link"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📁 Project Links</h3>
          <p className="text-sm text-gray-500">Quick access to project documentation & resources</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ ...formData, category: 'documentation' });
            setIsAddingLink(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus size={18} />
          Add Link
        </Button>
      </div>

      {/* Add Link Form */}
      {isAddingLink && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {formData.category === 'chatgpt' ? '🤖 Add ChatGPT Link' : 'Add New Link'}
            </h4>
            <button
              onClick={() => {
                setIsAddingLink(false);
                setFormData({ ...formData, category: 'documentation', title: '', url: '', description: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddLink} className="space-y-3">
            {/* Only show title for non-ChatGPT links */}
            {formData.category !== 'chatgpt' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  type="text"
                  placeholder="Link title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.category === 'chatgpt' ? '🤖 ChatGPT Link' : 'URL'}
              </label>
              <Input
                type="url"
                placeholder={formData.category === 'chatgpt' ? "https://chatgpt.com/c/..." : "https://example.com"}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Only show description for non-ChatGPT links */}
            {formData.category !== 'chatgpt' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  type="text"
                  placeholder="What is this link about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="documentation">📄 Documentation</option>
                <option value="design">🎨 Design</option>
                <option value="content">✍️ Content</option>
                <option value="financial">💰 Financial</option>
                <option value="chatgpt">🤖 ChatGPT/AI</option>
                <option value="other">📌 Other</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className={formData.category === 'chatgpt' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
              >
                Save Link
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsAddingLink(false);
                  setFormData({ ...formData, category: 'documentation', title: '', url: '', description: '' });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({links.length})
          </button>
          {categories.map((cat) => {
            const count = links.filter(l => l.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? getCategoryColor(cat) + ' border-2 border-current'
                    : getCategoryColor(cat) + ' opacity-60 hover:opacity-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Links List */}
      <div className="space-y-2">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No links added yet</p>
            <p className="text-sm text-gray-400">Add your first link to get started</p>
          </div>
        ) : (
          filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{link.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(link.category)}`}>
                      {link.category}
                    </span>
                  </div>
                  {link.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{link.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Added by <strong>{link.addedBy}</strong></span>
                    <span>•</span>
                    <span>{formatDate(link.addedDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Open link"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => onRemoveLink(link.id)}
                    className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete link"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State when filtered */}
      {selectedCategory && filteredLinks.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No links in this category yet</p>
        </div>
      )}
    </div>
  );
}
