import { 
  ISchoolSystemClient, 
  SchoolSystemType 
} from '../types/schoolSystem';

// Lazy imports for code splitting
const getEdupageClient = async () => {
  const { EdupageClient } = await import('../../features/edupage/services/edupageClient');
  return new EdupageClient();
};

/**
 * Factory for creating school system clients
 * Supports lazy loading for bundle optimization
 */
export async function createSchoolClient(type: SchoolSystemType): Promise<ISchoolSystemClient> {
  switch (type) {
    case 'edupage':
      return getEdupageClient();
    
    case 'bakalari':
      // TODO: Implement when needed
      throw new Error('Bakalári integration not yet implemented');
    
    case 'iziak':
      // TODO: Implement when needed
      throw new Error('iŽiak integration not yet implemented');
    
    default:
      throw new Error(`Unknown school system type: ${type}`);
  }
}

/**
 * Get list of supported school systems
 */
export function getSupportedSystems(): { type: SchoolSystemType; name: string; available: boolean }[] {
  return [
    { type: 'edupage', name: 'EduPage', available: true },
    { type: 'bakalari', name: 'Bakalári', available: false },
    { type: 'iziak', name: 'iŽiak', available: false },
  ];
}
