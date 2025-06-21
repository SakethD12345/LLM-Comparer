import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  let tempFile: string | null = null;
  
  try {
    const { response1, response2, model1, model2 } = await request.json();

    if (!response1 || !response2) {
      return NextResponse.json(
        { error: 'Both responses are required' },
        { status: 400 }
      );
    }

    // Create temporary file with the responses
    tempFile = path.join(process.cwd(), 'temp_advanced_analysis.json');
    const analysisData = [
      {
        model1: { text: response1, model: model1 },
        model2: { text: response2, model: model2 },
        timestamp: new Date().toISOString()
      }
    ];

    writeFileSync(tempFile, JSON.stringify(analysisData, null, 2));

    // Run the advanced analysis Python script
    const pythonScript = path.join(process.cwd(), 'src', 'lib', 'advanced_text_analysis.py');
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [pythonScript, tempFile]);
      
      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up temporary file
        if (tempFile && existsSync(tempFile)) {
          try {
            unlinkSync(tempFile);
          } catch (cleanupError) {
            console.error('Error cleaning up temp file:', cleanupError);
          }
        }

        if (code !== 0) {
          console.error('Python script error:', errorOutput);
          resolve(NextResponse.json(
            { error: 'Advanced analysis failed', details: errorOutput },
            { status: 500 }
          ));
          return;
        }

        try {
          const results = JSON.parse(output);
          resolve(NextResponse.json(results));
        } catch (parseError) {
          console.error('Error parsing Python output:', parseError);
          resolve(NextResponse.json(
            { error: 'Failed to parse analysis results' },
            { status: 500 }
          ));
        }
      });
    });

  } catch (error) {
    // Clean up temporary file in case of error
    if (tempFile && existsSync(tempFile)) {
      try {
        unlinkSync(tempFile);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    console.error('Advanced analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 