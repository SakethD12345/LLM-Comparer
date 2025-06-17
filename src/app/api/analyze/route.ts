import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  let tempFile = '';
  try {
    const { response1, response2, model1, model2 } = await request.json();
    
    // Create a temporary file with the responses
    tempFile = path.join(process.cwd(), 'temp_comparison.json');
    fs.writeFileSync(tempFile, JSON.stringify([{
      timestamp: new Date().toISOString(),
      model1: { model: model1, text: response1 },
      model2: { model: model2, text: response2 }
    }]));

    // Run the Python analysis script
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'src/lib/advanced_analysis.py'),
        tempFile
      ]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up the temporary file if it exists
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
        }
        
        if (code !== 0) {
          reject(NextResponse.json(
            { error: `Analysis failed: ${error}` },
            { status: 500 }
          ));
          return;
        }

        try {
          const results = JSON.parse(output);
          resolve(NextResponse.json(results));
        } catch (e) {
          reject(NextResponse.json(
            { error: 'Failed to parse analysis results' },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    // Clean up the temporary file if it exists
    try {
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
    }

    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze responses' },
      { status: 500 }
    );
  }
} 