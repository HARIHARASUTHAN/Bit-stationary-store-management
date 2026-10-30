import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚀 Starting BIT Campus Stationery Portal (Full Stack)...');
console.log('   - Backend:  http://localhost:5001');
console.log('   - Frontend: http://localhost:5173');
console.log('====================================================\n');

const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\nShutting down dev servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

