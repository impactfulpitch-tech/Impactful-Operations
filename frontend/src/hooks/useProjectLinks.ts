import { useCallback } from 'react';
import { Project, ProjectLink } from '../data/mockData';

/**
 * Hook to manage project documentation links
 * Provides CRUD operations for project links stored in localStorage
 */
export function useProjectLinks(projectId: string) {
  
  /**
   * Add a new link to the project
   */
  const addProjectLink = useCallback((linkData: Omit<ProjectLink, 'id' | 'addedDate'>) => {
    const projects = localStorage.getItem('allProjects');
    if (!projects) return null;

    const parsed: Project[] = JSON.parse(projects);
    const projectIndex = parsed.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    const newLink: ProjectLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date().toISOString(),
      ...linkData,
    };

    parsed[projectIndex].projectLinks = parsed[projectIndex].projectLinks || [];
    parsed[projectIndex].projectLinks.push(newLink);

    localStorage.setItem('allProjects', JSON.stringify(parsed));
    return newLink;
  }, [projectId]);

  /**
   * Remove a link from the project
   */
  const removeProjectLink = useCallback((linkId: string) => {
    const projects = localStorage.getItem('allProjects');
    if (!projects) return false;

    const parsed: Project[] = JSON.parse(projects);
    const projectIndex = parsed.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return false;

    const initialLength = parsed[projectIndex].projectLinks?.length || 0;
    parsed[projectIndex].projectLinks = (parsed[projectIndex].projectLinks || []).filter(
      l => l.id !== linkId
    );

    const removed = (parsed[projectIndex].projectLinks?.length || 0) < initialLength;
    if (removed) {
      localStorage.setItem('allProjects', JSON.stringify(parsed));
    }

    return removed;
  }, [projectId]);

  /**
   * Update an existing link
   */
  const updateProjectLink = useCallback((linkId: string, updates: Partial<ProjectLink>) => {
    const projects = localStorage.getItem('allProjects');
    if (!projects) return null;

    const parsed: Project[] = JSON.parse(projects);
    const projectIndex = parsed.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    const linkIndex = (parsed[projectIndex].projectLinks || []).findIndex(l => l.id === linkId);
    if (linkIndex === -1) return null;

    parsed[projectIndex].projectLinks[linkIndex] = {
      ...parsed[projectIndex].projectLinks[linkIndex],
      ...updates,
    };

    localStorage.setItem('allProjects', JSON.stringify(parsed));
    return parsed[projectIndex].projectLinks[linkIndex];
  }, [projectId]);

  /**
   * Get all links for this project
   */
  const getProjectLinks = useCallback((): ProjectLink[] => {
    const projects = localStorage.getItem('allProjects');
    if (!projects) return [];

    const parsed: Project[] = JSON.parse(projects);
    const project = parsed.find(p => p.id === projectId);
    return project?.projectLinks || [];
  }, [projectId]);

  /**
   * Get links filtered by category/department
   */
  const getLinksByCategory = useCallback((category: string): ProjectLink[] => {
    const allLinks = getProjectLinks();
    return allLinks.filter(l => l.category === category);
  }, [getProjectLinks]);

  /**
   * Get unique categories from all project links
   */
  const getCategories = useCallback((): string[] => {
    const allLinks = getProjectLinks();
    const categories = new Set(allLinks.map(l => l.category));
    return Array.from(categories);
  }, [getProjectLinks]);

  return {
    addProjectLink,
    removeProjectLink,
    updateProjectLink,
    getProjectLinks,
    getLinksByCategory,
    getCategories,
  };
}
