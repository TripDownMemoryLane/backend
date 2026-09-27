const request = require('supertest');
const app = require('../server');

// Mock external AI and Audio dependencies
jest.mock('../aiService', () => ({
  generateStoryFromImages: jest.fn(),
  generateQuizFromStories: jest.fn(),
}));

jest.mock('../audioService', () => ({
  addAudioToQuiz: jest.fn(),
}));

const { generateStoryFromImages, generateQuizFromStories } = require('../aiService');
const { addAudioToQuiz } = require('../audioService');

describe('Quiz API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // 1. GET / (Health Check)
  // --------------------------------------------------
  describe('GET /', () => {
    it('should return 200 OK with health status message', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('endpoint', 'this is GET / router');
    });
  });

  // --------------------------------------------------
  // 2. POST /generate-story
  // --------------------------------------------------
  describe('POST /generate-story', () => {
    it('should return 400 when images field is missing or not an array', async () => {
      const res = await request(app)
        .post('/generate-story')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Wrong JSON format');
    });

    it('should return 400 when an invalid Base64 string is provided', async () => {
      const res = await request(app)
        .post('/generate-story')
        .send({ images: ['invalid-base64-string'] });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid Base64 Data');
    });

    it('should return 200 and stories when valid base64 data URIs are sent', async () => {
      const mockStories = ['Story for image 1', 'Story for image 2'];
      generateStoryFromImages.mockResolvedValue(mockStories);

      // Valid minimal Data URI format matching extractBase64Data
      const payload = {
        images: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/'
        ]
      };

      const res = await request(app)
        .post('/generate-story')
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stories).toEqual(mockStories);
      expect(generateStoryFromImages).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when AI generation encounters an error', async () => {
      generateStoryFromImages.mockRejectedValue(new Error('Hugging Face model timeout'));

      const payload = {
        images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==']
      };

      const res = await request(app)
        .post('/generate-story')
        .send(payload);

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('AI Generation Failed');
    });
  });

  // --------------------------------------------------
  // 3. POST /generate-quiz
  // --------------------------------------------------
  describe('POST /generate-quiz', () => {
    it('should return 400 when stories field is missing, empty, or contains non-strings', async () => {
      const res = await request(app)
        .post('/generate-quiz')
        .send({ stories: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Wrong JSON format');
    });

    it('should return 200 and return questions with synthesized audio', async () => {
      const mockRawQuiz = [
        { question: 'Who was in the picture?', options: ['Dad', 'Mom'], answer: 'Dad' }
      ];
      const mockFinalQuizWithAudio = [
        { question: 'Who was in the picture?', options: ['Dad', 'Mom'], answer: 'Dad', audioBase64: 'data:audio/mp3;base64,SUQzBA...' }
      ];

      generateQuizFromStories.mockResolvedValue(mockRawQuiz);
      addAudioToQuiz.mockResolvedValue(mockFinalQuizWithAudio);

      const res = await request(app)
        .post('/generate-quiz')
        .send({ stories: ['A warm family gathering at the park.'] });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.questions).toEqual(mockFinalQuizWithAudio);
      expect(generateQuizFromStories).toHaveBeenCalledTimes(1);
      expect(addAudioToQuiz).toHaveBeenCalledWith(mockRawQuiz);
    });

    it('should return 500 when AI Quiz generation fails', async () => {
      generateQuizFromStories.mockRejectedValue(new Error('AI rate limit reached'));

      const res = await request(app)
        .post('/generate-quiz')
        .send({ stories: ['Valid story text'] });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('AI Generation Failed');
    });

    it('should return 500 when Audio TTS service fails', async () => {
      generateQuizFromStories.mockResolvedValue([{ question: 'Test?', answer: 'Yes' }]);
      addAudioToQuiz.mockRejectedValue(new Error('TTS Credentials missing'));

      const res = await request(app)
        .post('/generate-quiz')
        .send({ stories: ['Valid story text'] });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Audio Generation Failed');
    });
  });
});