describe("AI client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    const { getModel } = await import("./client");
    expect(() => getModel()).toThrow("GEMINI_API_KEY is not configured");
  });

  it("returns a model when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    const { getModel } = await import("./client");
    const model = getModel();
    expect(model).toBeDefined();
  });
});
