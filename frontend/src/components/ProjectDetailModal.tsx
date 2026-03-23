import React, { useState } from 'react';
import { X, Lock, AlertCircle, CheckCircle2, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Project } from '../data/mockData';
import { useProjectLinks } from '../hooks/useProjectLinks';
import { useProjectLocks } from '../hooks/useProjectLocks';
import { ProjectLinks } from './ProjectLinks';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject?: (project: Project) => void;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}: ProjectDetailModalProps) {
  const { addProjectLink, removeProjectLink, getProjectLinks } = useProjectLinks(project.id);
  const lockStatus = useProjectLocks(project.startDate);
  const [links] = useState<any[]>(getProjectLinks());

  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysElapsed = () => {
    const start = new Date(project.startDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const daysElapsed = getDaysElapsed();

  // Get ChatGPT links specifically
  const chatgptLinks = links.filter(link => link.category === 'chatgpt');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-500">Client: {project.clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ChatGPT Links Section - Prominent */}
          {chatgptLinks.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={20} className="text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">🤖 ChatGPT Conversations</h3>
              </div>
              <div className="space-y-3">
                {chatgptLinks.map((link) => (
                  <div key={link.id} className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{link.title}</h4>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        )}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-shrink-0"
                        title="Open ChatGPT conversation"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Lock Status Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} />
              Project Timeline & Status
            </h3>

            {/* Days Elapsed Indicator */}
            <div className="mb-4 p-3 bg-white rounded border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Days Elapsed: {daysElapsed}</span>
                <span className="text-2xl font-bold text-blue-600">{daysElapsed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((daysElapsed / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Lock Indicators */}
            <div className="grid grid-cols-2 gap-3">
              {/* Payment Reminder */}
              {daysElapsed >= 5 && !project.paymentReminderSentAt5Days && (
                <div className="bg-amber-100 border border-amber-300 rounded p-3 flex items-start gap-2">
                  <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900">💳 Payment Reminder</p>
                    <p className="text-sm text-amber-800">5-day payment reminder is due</p>
                  </div>
                </div>
              )}

              {/* Content Lock */}
              {daysElapsed >= 10 && project.contentLocked && (
                <div className="bg-red-100 border border-red-300 rounded p-3 flex items-start gap-2">
                  <Lock size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">🔒 Content Locked</p>
                    <p className="text-sm text-red-800">Project is read-only after day 10</p>
                  </div>
                </div>
              )}

              {/* Financial Lock */}
              {daysElapsed >= 10 && project.financialLocked && (
                <div className="bg-red-100 border border-red-300 rounded p-3 flex items-start gap-2">
                  <Lock size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">💰 Financial Locked</p>
                    <p className="text-sm text-red-800">Cannot modify payments after day 10</p>
                  </div>
                </div>
              )}

              {/* Unlocked Status */}
              {daysElapsed < 5 && (
                <div className="bg-green-100 border border-green-300 rounded p-3 flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">✅ Full Access</p>
                    <p className="text-sm text-green-800">All features available for next {5 - daysElapsed} days</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <p className="text-gray-900 font-medium capitalize">{project.status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <p className="text-gray-900 font-medium">₹{project.budget?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <p className="text-gray-900 font-medium">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <p className="text-gray-900 font-medium">{formatDate(project.endDate)}</p>
            </div>
          </div>

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📍 Milestones</h3>
              <div className="space-y-2">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{milestone.name}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        milestone.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    <p className="text-xs text-gray-500">Due: {formatDate(milestone.dueDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Links Section */}
          <div className="border-t border-gray-200 pt-6">
            <ProjectLinks
              projectId={project.id}
              projectName={project.name}
              links={links}
              onAddLink={(linkData) => {
                const newLink = addProjectLink(linkData);
                if (newLink) {
                  window.location.reload(); // Refresh to show new link
                }
              }}
              onRemoveLink={(linkId) => {
                removeProjectLink(linkId);
                window.location.reload(); // Refresh after delete
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
