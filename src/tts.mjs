import {exec} from 'child_process'

// These aren't defined in the ES module scope
const _rootDir = process.cwd();
const __dirname = import.meta.dirname;
const SOUND_FILE_FOLDER = `${_rootDir}/public/audio/`;
const LIPSYNC_FILE_FOLDER = `${_rootDir}/public/lipsync/`;
const PIPER_EXECUTABLE = `${_rootDir}/bin/piper/piper`;
const RHUBARB_EXECUTABLE = `${_rootDir}/bin/Rhubarb-Lip-Sync-1.13.0-Linux/rhubarb`

function execPromise(command) {
	return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

export class TTS {
	static async generateSpeech(id, prompt, options) {
		let result;
		const filePath = `${SOUND_FILE_FOLDER}${id}.wav`;
		const fileName = `audio/${id}.wav`;
		const modalFile = `voices/bishop-model/model.onnx`; // TODO make this selectable
		const command = `echo '${prompt}' | ${PIPER_EXECUTABLE} --model ${modalFile} --output_file ${filePath}`;
		try {
			result = await execPromise(command);
		} catch(err) {
			return {success: false, errorMessage: err.message};
		}
		return {success: true, filePath, fileName};
	}
	static async generateLipsync(soundFile, dialogFile) {
		const command =`${RHUBARB_EXECUTABLE} -f json -d ${dialogFile} ${soundFile}`;
		try {
			return await execPromise(command);
		} catch(err) {
			console.error(err);
			return new Error(err);
		}
	}
}