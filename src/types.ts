export interface Heart {
  id?: string; // Can be undefined for optimistic/failed updates
  localId?: string; // For tracking failed messages locally
  message: string;
  timestamp: Date;
  imageURL?: string;
  aiResponse?: {
    textResponse: string;
    visualAids: string[];
    parentGuide?: string; // Cache for the parent translation
  };
  status?: 'failed'; // For UI feedback on send failure
  imageFile?: File; // To hold the file for retries
  hintRequested?: boolean; // To track if a hint was requested for this message
  isHint?: boolean; // To identify if the message itself is a hint
}