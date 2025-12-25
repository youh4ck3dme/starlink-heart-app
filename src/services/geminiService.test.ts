import { generateCosmicResponse, generateParentGuide } from './geminiService';

const generateContentMock = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: generateContentMock,
    },
  })),
  Type: {
    OBJECT: 'object',
    STRING: 'string',
    ARRAY: 'array',
  },
}));

describe('geminiService edge cases', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
  });

  it('returns a friendly error when JSON parsing fails', async () => {
    generateContentMock.mockResolvedValue({ text: 'not-json' });

    const response = await generateCosmicResponse('Ahoj', [], undefined, false);

    expect(response.textResponse).toContain('Vyskytla sa chyba');
    expect(response.visualAids).toEqual(['🛰️', '💥']);
  });

  it('surfaces model fallback notice when the vision model is missing', async () => {
    generateContentMock.mockRejectedValue(new Error('404 not found'));

    const response = await generateParentGuide([]);

    expect(response).toBe('Model error. Retrying with standard model...');
  });
});
