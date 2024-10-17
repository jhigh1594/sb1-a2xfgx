import { NextResponse } from 'next/server';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/opt-350m';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

export async function POST(req: Request) {
  const { journalEntry } = await req.json();

  if (!journalEntry) {
    return NextResponse.json({ error: 'Journal entry is required' }, { status: 400 });
  }

  if (!HUGGING_FACE_API_KEY) {
    console.error('HUGGING_FACE_API_KEY is not set');
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  try {
    console.log('Sending request to Hugging Face API...');
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Journal entry: ${journalEntry}\n\nAI response:`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      return NextResponse.json({ error: `Failed to generate AI response: ${response.status} ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    console.log('Hugging Face API response:', result);

    if (!result[0] || !result[0].generated_text) {
      console.error('Unexpected response format:', result);
      return NextResponse.json({ error: 'Unexpected response format from AI model' }, { status: 500 });
    }

    const aiResponse = result[0].generated_text.split('AI response:')[1]?.trim() || 'No response generated';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json({ error: 'Failed to generate AI response. Please try again.' }, { status: 500 });
  }
}