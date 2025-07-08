import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { text1, text2 } = await request.json();

    if (!text1 || !text2) {
      return NextResponse.json(
        { error: 'Both text1 and text2 are required' },
        { status: 400 }
      );
    }

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'src', 'lib', 'text_complexity_analyzer.py');

    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [scriptPath, text1, text2]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python process error:', error);
          resolve(
            NextResponse.json(
              { error: 'Failed to analyze text complexity', details: error },
              { status: 500 }
            )
          );
          return;
        }

        try {
          const analysis = JSON.parse(result);
          resolve(NextResponse.json(analysis));
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          resolve(
            NextResponse.json(
              { error: 'Failed to parse analysis results', details: result },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error('Complexity analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 