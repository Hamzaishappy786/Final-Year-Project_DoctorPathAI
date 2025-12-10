// Client for calling external medgemma-4b-it inference endpoint
// Expects JSON payload:
// {
//   patientId, doctorId, clinicalNotes, patientData, patientDataFileName,
//   imagingData: [{ name, type, mimeType, data, size }],
//   timestamp
// }
// Response is expected to include:
// {
//   graph: { nodes: [...], edges: [...], metadata: {...} },
//   summary: string,
//   riskScores: {...},
//   ... (any additional fields kept in raw)
// }

const MODEL_URL = import.meta.env.VITE_MODEL_API_URL;
const MODEL_API_KEY = import.meta.env.VITE_MODEL_API_KEY;

const withTimeout = (promiseFactory, ms = 25000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return {
    promise: (async () => {
      try {
        const result = await promiseFactory(controller.signal);
        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    })(),
    controller,
  };
};

export const runMedgemmaInference = async (payload) => {
  if (!MODEL_URL) {
    return {
      success: false,
      message: 'Model endpoint URL is not configured (VITE_MODEL_API_URL).',
    };
  }

  try {
    const { promise } = withTimeout(async (signal) => {
      const response = await fetch(MODEL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(MODEL_API_KEY ? { Authorization: `Bearer ${MODEL_API_KEY}` } : {}),
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Model call failed with status ${response.status}`);
      }

      return response.json();
    });

    const data = await promise;

    return {
      success: true,
      data,
    };
  } catch (err) {
    const isAbort = err.name === 'AbortError';
    return {
      success: false,
      message: isAbort ? 'Model request timed out' : err.message || 'Model request failed',
    };
  }
};

export default runMedgemmaInference;
