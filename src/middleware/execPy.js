const { exec } = require('child_process');
const { execSync } = require('child_process');
require('dotenv').config();
const net = require('net');

const pythonAppPath = process.env.PYTHON_PROCESS_PATH;
const venvPython = process.env.VENV_PYTHON ;
let pythonProcess = null;

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, '0.0.0.0');
  });
}

async function killPortProcess(port) {
  try {
    const pid = execSync(`lsof -t -i:${port}`).toString().trim();
    if (pid) {
      execSync(`kill -9 ${pid}`);
      console.log(`Processo na porta ${port} foi finalizado (PID ${pid})`);
    }
  } catch (error) {
    console.log(`Nenhum processo encontrado na porta ${port}`);
  }
}

async function startPython(res) {
  console.log('Tentando iniciar o script Python...');

  pythonProcess = exec(`${venvPython} ${pythonAppPath}`, async (error, stdout, stderr) => {
    console.log(`Python Output: ${stdout}`);

    if (error || stderr) {
      const errorMsg = error?.message || stderr;
      console.error(`Erro no Python: ${errorMsg}`);

      if (errorMsg.includes('Errno 98')) {
        console.log('Porta em uso. Reiniciando...');

        await killPortProcess(8000);
        await stop();
        await startPython(res);
      }
    }
  });

  if (res) console.log('Python script started!');
}

const stop = async () => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    console.log('Python script stopped!');
  } else {
    console.log('Nenhum processo Python em execução');
  }
};

const startRetry = async (res) => {
  await stop();

  const available = await isPortAvailable(8000);
  if (!available) {
    console.log('Porta 8000 ocupada. Tentando matar o processo...');
    await killPortProcess(8000);
  }

  await startPython(res);
};

module.exports = { startRetry, stop };
