import type { BuildBlueprint } from '../types/blueprint';
import { validateBlueprint } from '../engine/blueprintValidator';

const STORAGE_KEY = 'blockforge_custom_blueprints';
const ADMIN_AUTH_KEY = 'blockforge_admin_auth';

export function getCustomBlueprints(): BuildBlueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((bp) => validateBlueprint(bp).valid);
  } catch (err) {
    console.error('Failed to read custom blueprints from storage:', err);
    return [];
  }
}

export function saveCustomBlueprint(blueprint: BuildBlueprint): { success: boolean; error?: string } {
  const validation = validateBlueprint(blueprint);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join('; ') };
  }

  try {
    const current = getCustomBlueprints();
    // Check if updating existing or adding new
    const existingIndex = current.findIndex((b) => b.id === blueprint.id || b.slug === blueprint.slug);
    if (existingIndex >= 0) {
      current[existingIndex] = blueprint;
    } else {
      current.push(blueprint);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Storage error' };
  }
}

export function deleteCustomBlueprint(id: string): void {
  try {
    const current = getCustomBlueprints();
    const updated = current.filter((b) => b.id !== id && b.slug !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom blueprint:', err);
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (err) {
    console.error('Admin auth state error:', err);
  }
}

export function exportBlueprintAsJson(blueprint: BuildBlueprint): void {
  const json = JSON.stringify(blueprint, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${blueprint.slug}-blueprint.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
